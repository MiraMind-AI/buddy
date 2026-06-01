"""LLM client backed by the Cloudflare Worker proxy.

The worker (`tools/cloudflare-proxy` in pytutorai) exposes
`POST /api/llm/complete` accepting JSON:

    { "prompt": "...", "systemPrompt": "...", "model": "...", "maxWords": 220 }

and returns a streaming `text/plain` body with the assistant tokens
concatenated. Errors are inlined as `[ERROR]: ...`.
"""

from __future__ import annotations

from collections.abc import AsyncIterator, Iterable
from dataclasses import dataclass
from typing import Protocol

import httpx

from app.core.config import Settings, get_settings


@dataclass(slots=True)
class ChatMessage:
    role: str  # "system" | "user" | "assistant"
    content: str


class LLMClient(Protocol):
    async def complete(
        self,
        messages: Iterable[ChatMessage],
        *,
        system: str | None = None,
    ) -> str: ...


def _render_prompt(messages: Iterable[ChatMessage]) -> str:
    """Flatten conversation history into a single prompt the worker accepts.

    The worker only forwards a system + single user message to OpenAI, so we
    fold the dialog into a transcript and let the model continue.
    """
    lines: list[str] = []
    for msg in messages:
        role = msg.role.strip().lower()
        if role == "system":
            continue
        label = "User" if role == "user" else "Assistant"
        lines.append(f"{label}: {msg.content.strip()}")
    lines.append("Assistant:")
    return "\n".join(lines)


class LLMError(RuntimeError):
    """Raised when the LLM proxy returns an error."""


class WorkerLLMClient:
    """Calls the Cloudflare worker and assembles the streamed text response."""

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()

    async def complete(
        self,
        messages: Iterable[ChatMessage],
        *,
        system: str | None = None,
    ) -> str:
        chunks = [chunk async for chunk in self.stream(messages, system=system)]
        return "".join(chunks).strip()

    async def stream(
        self,
        messages: Iterable[ChatMessage],
        *,
        system: str | None = None,
    ) -> AsyncIterator[str]:
        msgs = list(messages)
        system_prompt = system or self._settings.llm_system_prompt
        payload = {
            "prompt": _render_prompt(msgs),
            "systemPrompt": system_prompt,
            "model": self._settings.llm_model,
            "maxWords": self._settings.llm_max_words,
        }

        timeout = httpx.Timeout(self._settings.llm_timeout_seconds)
        async with httpx.AsyncClient(timeout=timeout) as client:
            async with client.stream(
                "POST",
                self._settings.llm_proxy_url,
                json=payload,
            ) as response:
                if response.status_code >= 400:
                    body = await response.aread()
                    raise LLMError(
                        f"LLM proxy returned {response.status_code}: "
                        f"{body.decode('utf-8', errors='replace')[:300]}"
                    )
                async for chunk in response.aiter_text():
                    if not chunk:
                        continue
                    if chunk.startswith("[ERROR]:"):
                        raise LLMError(chunk[len("[ERROR]:") :].strip())
                    yield chunk


_default_client: LLMClient | None = None


def get_llm_client() -> LLMClient:
    """FastAPI dependency providing a shared LLM client."""
    global _default_client
    if _default_client is None:
        _default_client = WorkerLLMClient()
    return _default_client


def set_llm_client(client: LLMClient | None) -> None:
    """Test helper to inject or reset the singleton client."""
    global _default_client
    _default_client = client

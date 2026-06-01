from __future__ import annotations

import httpx
import pytest

from app.services import ai_service
from app.services.ai_service import (
    ChatMessage,
    LLMError,
    WorkerLLMClient,
    _render_prompt,
)


def test_render_prompt_skips_system_and_appends_assistant_cue() -> None:
    prompt = _render_prompt(
        [
            ChatMessage(role="system", content="ignored"),
            ChatMessage(role="user", content="Hi"),
            ChatMessage(role="assistant", content="Hello"),
            ChatMessage(role="user", content="How are you?"),
        ]
    )
    lines = prompt.splitlines()
    assert lines[0] == "User: Hi"
    assert lines[1] == "Assistant: Hello"
    assert lines[2] == "User: How are you?"
    assert lines[-1] == "Assistant:"


def _patch_async_client(monkeypatch: pytest.MonkeyPatch, handler) -> None:
    transport = httpx.MockTransport(handler)
    original = httpx.AsyncClient

    def factory(*args, **kwargs):  # type: ignore[no-untyped-def]
        kwargs["transport"] = transport
        return original(*args, **kwargs)

    monkeypatch.setattr(ai_service.httpx, "AsyncClient", factory)


@pytest.mark.asyncio
async def test_worker_client_concatenates_streamed_chunks(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path.endswith("/api/llm/complete")
        body = request.read()
        assert b"\"prompt\":" in body
        assert b"\"systemPrompt\":" in body
        return httpx.Response(200, content=b"Hello world")

    _patch_async_client(monkeypatch, handler)

    client = WorkerLLMClient()
    text = await client.complete([ChatMessage(role="user", content="Hi")])
    assert text == "Hello world"


@pytest.mark.asyncio
async def test_worker_client_raises_on_inline_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, content=b"[ERROR]: boom")

    _patch_async_client(monkeypatch, handler)

    client = WorkerLLMClient()
    with pytest.raises(LLMError, match="boom"):
        await client.complete([ChatMessage(role="user", content="Hi")])


@pytest.mark.asyncio
async def test_worker_client_raises_on_http_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(500, content=b"upstream down")

    _patch_async_client(monkeypatch, handler)

    client = WorkerLLMClient()
    with pytest.raises(LLMError, match="500"):
        await client.complete([ChatMessage(role="user", content="Hi")])

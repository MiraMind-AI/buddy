"""Server-side speech-to-text and text-to-speech integration."""

from __future__ import annotations

import os
from collections.abc import Callable
from dataclasses import dataclass
from io import BytesIO
from typing import Protocol

from anyio import to_thread
from openai import OpenAI, OpenAIError

from app.core.config import Settings, get_settings


class VoiceError(RuntimeError):
    """Raised when the voice provider cannot complete a request."""


class VoiceConfigurationError(VoiceError):
    """Raised when the server is missing required voice configuration."""


class SpeechProvider(Protocol):
    def transcribe(
        self,
        audio: bytes,
        *,
        filename: str,
        content_type: str | None,
    ) -> str: ...

    def synthesize(self, text: str, *, voice: str | None = None) -> bytes: ...


@dataclass(slots=True)
class OpenAIVoiceProvider:
    settings: Settings
    client_factory: Callable[[], OpenAI] | None = None

    def _client(self) -> OpenAI:
        api_key = self.settings.openai_api_key or os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise VoiceConfigurationError(
                "Voice is not configured. Set BUDDY_OPENAI_API_KEY or OPENAI_API_KEY."
            )
        if self.client_factory:
            return self.client_factory()
        return OpenAI(api_key=api_key)

    def transcribe(
        self,
        audio: bytes,
        *,
        filename: str,
        content_type: str | None,
    ) -> str:
        if not audio:
            raise VoiceError("No audio was received.")

        audio_file = BytesIO(audio)
        audio_file.name = filename or "buddy-voice.webm"

        try:
            result = self._client().audio.transcriptions.create(
                model=self.settings.audio_transcription_model,
                file=(audio_file.name, audio_file, content_type or "audio/webm"),
                response_format="text",
            )
        except OpenAIError as exc:
            raise VoiceError(f"Transcription failed: {exc}") from exc

        if isinstance(result, str):
            return result.strip()

        text = getattr(result, "text", "")
        return str(text).strip()

    def synthesize(self, text: str, *, voice: str | None = None) -> bytes:
        cleaned = text.strip()
        if not cleaned:
            raise VoiceError("No text was received.")

        try:
            result = self._client().audio.speech.create(
                model=self.settings.audio_speech_model,
                voice=voice or self.settings.audio_speech_voice,
                input=cleaned,
                response_format="mp3",
            )
        except OpenAIError as exc:
            raise VoiceError(f"Speech synthesis failed: {exc}") from exc

        if hasattr(result, "read"):
            return result.read()
        content = getattr(result, "content", None)
        if isinstance(content, bytes):
            return content
        raise VoiceError("Speech synthesis returned no audio.")


_default_provider: SpeechProvider | None = None


def get_voice_provider() -> SpeechProvider:
    global _default_provider
    if _default_provider is None:
        _default_provider = OpenAIVoiceProvider(get_settings())
    return _default_provider


def set_voice_provider(provider: SpeechProvider | None) -> None:
    global _default_provider
    _default_provider = provider


async def transcribe_audio(
    audio: bytes,
    *,
    filename: str,
    content_type: str | None,
    provider: SpeechProvider,
) -> str:
    return await to_thread.run_sync(
        lambda: provider.transcribe(
            audio,
            filename=filename,
            content_type=content_type,
        ),
    )


async def synthesize_speech(
    text: str,
    *,
    voice: str | None,
    provider: SpeechProvider,
) -> bytes:
    return await to_thread.run_sync(lambda: provider.synthesize(text, voice=voice))

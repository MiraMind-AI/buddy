from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.voice_service import VoiceConfigurationError, set_voice_provider


class StubVoiceProvider:
    def __init__(self) -> None:
        self.transcriptions: list[bytes] = []
        self.speeches: list[tuple[str, str | None]] = []

    def transcribe(
        self,
        audio: bytes,
        *,
        filename: str,
        content_type: str | None,
    ) -> str:
        self.transcriptions.append(audio)
        assert filename == "sample.webm"
        assert content_type == "audio/webm"
        return "Hallo aus Audio"

    def synthesize(self, text: str, *, voice: str | None = None) -> bytes:
        self.speeches.append((text, voice))
        return b"fake-mp3"


@pytest.fixture(autouse=True)
def _reset_voice_provider() -> None:
    set_voice_provider(None)
    yield
    set_voice_provider(None)


def test_transcribe_voice_uses_provider() -> None:
    provider = StubVoiceProvider()
    set_voice_provider(provider)
    client = TestClient(app)

    response = client.post(
        "/api/v1/voice/transcribe",
        files={"audio": ("sample.webm", b"audio-bytes", "audio/webm")},
    )

    assert response.status_code == 200
    assert response.json() == {"text": "Hallo aus Audio"}
    assert provider.transcriptions == [b"audio-bytes"]


def test_create_speech_returns_mp3() -> None:
    provider = StubVoiceProvider()
    set_voice_provider(provider)
    client = TestClient(app)

    response = client.post(
        "/api/v1/voice/speech",
        json={"text": "Antwort sprechen", "voice": "nova"},
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/mpeg"
    assert response.content == b"fake-mp3"
    assert provider.speeches == [("Antwort sprechen", "nova")]


def test_voice_configuration_error_returns_503() -> None:
    class MissingConfigProvider(StubVoiceProvider):
        def transcribe(
            self,
            audio: bytes,
            *,
            filename: str,
            content_type: str | None,
        ) -> str:
            raise VoiceConfigurationError("missing key")

    set_voice_provider(MissingConfigProvider())
    client = TestClient(app)

    response = client.post(
        "/api/v1/voice/transcribe",
        files={"audio": ("sample.webm", b"audio-bytes", "audio/webm")},
    )

    assert response.status_code == 503
    assert response.json() == {"detail": "missing key"}

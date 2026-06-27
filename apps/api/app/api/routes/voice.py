"""HTTP routes for server-side voice capture and playback."""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import Response
from pydantic import BaseModel, Field

from app.core.config import Settings, get_settings
from app.services.voice_service import (
    SpeechProvider,
    VoiceConfigurationError,
    VoiceError,
    get_voice_provider,
    synthesize_speech,
    transcribe_audio,
)

router = APIRouter(prefix="/voice", tags=["voice"])


class TranscriptionResponse(BaseModel):
    text: str


class SpeechRequest(BaseModel):
    text: str = Field(min_length=1, max_length=8000)
    voice: str | None = Field(default=None, max_length=64)


def _http_error(exc: VoiceError) -> HTTPException:
    status_code = (
        status.HTTP_503_SERVICE_UNAVAILABLE
        if isinstance(exc, VoiceConfigurationError)
        else status.HTTP_502_BAD_GATEWAY
    )
    return HTTPException(status_code, str(exc))


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_voice(
    audio: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
    provider: SpeechProvider = Depends(get_voice_provider),
) -> TranscriptionResponse:
    max_bytes = settings.audio_max_upload_mb * 1024 * 1024
    payload = await audio.read()
    if len(payload) > max_bytes:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            f"Audio upload exceeds {settings.audio_max_upload_mb} MB.",
        )

    try:
        text = await transcribe_audio(
            payload,
            filename=audio.filename or "buddy-voice.webm",
            content_type=audio.content_type,
            provider=provider,
        )
    except VoiceError as exc:
        raise _http_error(exc) from exc

    return TranscriptionResponse(text=text)


@router.post("/speech")
async def create_speech(
    payload: SpeechRequest,
    provider: SpeechProvider = Depends(get_voice_provider),
) -> Response:
    try:
        audio = await synthesize_speech(
            payload.text,
            voice=payload.voice,
            provider=provider,
        )
    except VoiceError as exc:
        raise _http_error(exc) from exc

    return Response(
        content=audio,
        media_type="audio/mpeg",
        headers={"Cache-Control": "no-store"},
    )

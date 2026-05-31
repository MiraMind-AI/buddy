# Voice Design

## Overview

Voice is the primary interaction mode for Buddy. The architecture must support low-latency, natural-sounding exchanges while remaining resilient and falling back gracefully to text when voice is unavailable or unsuitable.

---

## Microphone Input

Voice input is captured in the browser using the Web Audio API (`getUserMedia`). The user grants microphone permission once; the browser caches the grant.

Input modes:

- **Push-to-talk:** User holds a button or key while speaking. Simple, reliable, no false starts.
- **Voice activity detection (VAD):** The browser detects speech start and end automatically. More natural, but requires tuning to avoid cutting off or triggering on background noise.

Phase M3 implements push-to-talk. VAD is added in a later phase.

---

## Audio State Machine

The voice system operates as an explicit state machine to avoid ambiguous states:

```
idle
  → listening       (user starts recording)
    → processing    (audio sent, waiting for transcription)
      → responding  (TTS audio playing)
        → idle      (response complete)
      → error       (transcription or response failed)
        → idle
  → error           (microphone access denied)
    → idle
```

State is managed in a Zustand store on the frontend. The avatar component reads this state to drive visual feedback.

---

## Transcription (STT)

In the initial implementation, audio is recorded as a blob in the browser and sent to the backend as a multipart upload. The backend calls the STT service (Whisper via OpenAI API) and returns the transcript.

Later phases explore:

- Streaming transcription for reduced latency
- OpenAI Realtime API which handles transcription and response in a single session

---

## Response Audio (TTS)

The backend generates a response text from the LLM and sends it to the TTS service. Audio is streamed back to the frontend and played using the Web Audio API.

Provider: OpenAI TTS initially. ElevenLabs or a local model as alternatives via the TTSService interface.

Streaming audio means the first audio chunk can play before the full response is generated, reducing perceived latency.

---

## Interrupt Handling

If the user starts speaking while Buddy is responding:

1. The frontend detects new voice activity
2. The current audio playback is stopped
3. A cancellation signal is sent to the backend
4. The backend aborts the current TTS stream if possible
5. The new user audio is processed

This requires the backend to support request cancellation. FastAPI handles this through request disconnect detection.

---

## Realtime API (Future)

The OpenAI Realtime API maintains a persistent WebSocket session and handles STT, LLM, and TTS in a single low-latency pipeline. When this integration is added, the individual STT and TTS calls are replaced by the realtime session, but the audio state machine and interrupt handling remain the same from the frontend's perspective.

---

## Latency Targets

| Stage                             | Target |
| --------------------------------- | ------ |
| Microphone to transcription       | < 1.5s |
| Transcription to first audio byte | < 1.0s |
| Total response start latency      | < 2.5s |

These are initial targets for the non-realtime implementation. The Realtime API phase targets < 1s total.

---

## Fallback to Text

Voice is always optional. The text input and send button remain visible and functional at all times. If microphone access is denied, the UI degrades cleanly to text-only mode with no broken states.

---

## Provider Abstraction

All voice services implement abstract interfaces:

```python
class STTService(Protocol):
    async def transcribe(self, audio: bytes, language: str) -> str: ...

class TTSService(Protocol):
    async def synthesize(self, text: str, voice: str) -> AsyncIterator[bytes]: ...
```

Switching providers requires only a new implementation class. Route handlers and business logic do not change.

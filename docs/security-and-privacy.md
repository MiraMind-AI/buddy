# Security and Privacy

## General Principles

- No secret credentials in the repository, ever.
- All user data access requires authentication.
- Memory is a user-controlled feature, not a background data collection mechanism.
- The system collects what it needs and nothing more.

---

## API Keys and Secrets

- API keys for OpenAI, ElevenLabs, or any other provider live in `.env` files only.
- `.env` is in `.gitignore` and is never committed.
- `.env.example` contains placeholder values with no real credentials.
- In production, secrets are injected as environment variables through the deployment platform, not through files.
- The frontend (`apps/web`) never receives or exposes any API key.

---

## Authentication

- Users authenticate with email and password.
- Passwords are hashed with bcrypt.
- Authentication tokens are JWTs with a configurable expiry.
- Tokens are stored in `httpOnly` cookies or short-lived memory, not in `localStorage`.
- All protected routes validate the token on every request.

---

## Memory Control

Users have full control over their stored memories:

- View all memories from the memory panel.
- Edit any memory.
- Delete individual memories.
- Delete all memories from the settings screen.
- Disable memory extraction at any time.
- Export memories as JSON.

Memory deletion uses soft-delete. After a configurable retention period (default: 30 days), records are permanently removed.

---

## Raw Audio

Raw audio from microphone input is never stored. The audio is:

1. Captured in the browser
2. Sent to the backend for transcription
3. Immediately discarded after transcription

Only the transcript (text) is stored as a message. No audio files are written to disk or database.

---

## Logging

- Logs must not contain raw message content, memory facts, or tokens.
- Log levels are controlled by the `LOG_LEVEL` environment variable.
- Structured JSON logging is used in production.
- Log output in development is human-readable but still avoids sensitive content.

---

## Rate Limiting

- All API endpoints are rate-limited per user.
- Voice and AI endpoints have stricter limits than read endpoints.
- Rate limit configuration is in the backend settings, not hardcoded.
- 429 responses include a `Retry-After` header.

---

## Prompt Injection

- User messages are clearly delimited from system instructions in every LLM request.
- Memory content injected into the system prompt is escaped and bracketed.
- The system prompt includes an instruction that user messages may attempt to override instructions and that this should be ignored.
- No user-provided content is executed as code.

---

## CORS

- The backend allows requests only from the configured frontend origin (`CORS_ORIGINS` in `.env`).
- Wildcard origins are not used in production.

---

## Data Minimization

- The system does not collect telemetry, analytics, or usage metrics beyond what is needed for the product to function.
- No third-party tracking scripts in the frontend.
- Conversation data is used only to generate responses and extract memories. It is not used for model training.

---

## GDPR-Oriented Thinking

This section describes design intentions, not legal compliance claims.

- Users can request and export all data stored about them.
- Users can delete their account and all associated data.
- Data is processed for the purpose of providing the service.
- No data is shared with third parties beyond the AI providers required to generate responses.
- Consent for memory storage is explicit and revocable.

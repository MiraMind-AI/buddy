# API Contract

Base URL: `/api/v1`

All endpoints require `Authorization: Bearer <token>` unless marked as public.

---

## Health

### GET /health (public)

Returns service status.

**Response 200**
```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

---

## Authentication

### POST /api/v1/auth/register (public)

**Body**
```json
{
  "email": "user@example.com",
  "password": "..."
}
```

**Response 201**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "created_at": "iso8601"
}
```

### POST /api/v1/auth/login (public)

**Body**
```json
{
  "email": "user@example.com",
  "password": "..."
}
```

**Response 200**
```json
{
  "access_token": "jwt",
  "token_type": "bearer"
}
```

---

## Users

### GET /api/v1/users/me

Returns the authenticated user.

**Response 200**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "memory_enabled": true,
  "created_at": "iso8601"
}
```

---

## Conversations

### POST /api/v1/conversations

Creates a new conversation.

**Body**
```json
{
  "title": "Optional title"
}
```

**Response 201**
```json
{
  "id": "uuid",
  "title": "Optional title",
  "created_at": "iso8601"
}
```

### GET /api/v1/conversations

Returns all conversations for the authenticated user.

**Response 200**
```json
[
  {
    "id": "uuid",
    "title": "...",
    "message_count": 12,
    "created_at": "iso8601",
    "updated_at": "iso8601"
  }
]
```

### GET /api/v1/conversations/{id}

Returns a single conversation with its messages.

**Response 200**
```json
{
  "id": "uuid",
  "title": "...",
  "messages": [
    {
      "id": "uuid",
      "role": "user",
      "content": "...",
      "created_at": "iso8601"
    }
  ],
  "created_at": "iso8601"
}
```

### POST /api/v1/conversations/{id}/messages

Sends a message and returns the assistant response.

**Body**
```json
{
  "content": "Hello"
}
```

**Response 200**
```json
{
  "id": "uuid",
  "role": "assistant",
  "content": "...",
  "created_at": "iso8601"
}
```

---

## Memories

### GET /api/v1/memories

Returns all memories for the authenticated user.

**Query params:** `page`, `limit`, `search`

**Response 200**
```json
[
  {
    "id": "uuid",
    "content": "User prefers concise answers.",
    "confidence": 0.92,
    "reviewed": true,
    "created_at": "iso8601"
  }
]
```

### POST /api/v1/memories

Creates a memory manually.

**Body**
```json
{
  "content": "User is learning Spanish."
}
```

**Response 201**
```json
{
  "id": "uuid",
  "content": "...",
  "confidence": 1.0,
  "reviewed": true,
  "created_at": "iso8601"
}
```

### PATCH /api/v1/memories/{id}

Updates a memory's content or reviewed status.

**Body**
```json
{
  "content": "Updated fact.",
  "reviewed": true
}
```

**Response 200** - Updated memory object.

### DELETE /api/v1/memories/{id}

Soft-deletes a memory.

**Response 204**

---

## Voice

### POST /api/v1/voice/transcribe

Accepts audio and returns a transcript.

**Body:** `multipart/form-data` with `audio` file field.

**Response 200**
```json
{
  "transcript": "..."
}
```

### POST /api/v1/voice/session

Initiates a voice session (future: Realtime API).

**Response 200**
```json
{
  "session_id": "uuid",
  "type": "standard"
}
```

---

## Avatar

### GET /api/v1/avatar/state

Returns the current avatar configuration for the authenticated user.

**Response 200**
```json
{
  "model": "default",
  "voice": "alloy"
}
```

---

## Error Responses

All errors follow this shape:

```json
{
  "detail": "Human-readable error message."
}
```

| Code | Meaning |
|---|---|
| 400 | Bad request, validation error |
| 401 | Not authenticated |
| 403 | Forbidden |
| 404 | Not found |
| 422 | Unprocessable entity (Pydantic validation) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

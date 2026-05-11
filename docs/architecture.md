# Architecture

## Overview

Buddy is a monorepo with a Next.js frontend (`apps/web`), a FastAPI backend (`apps/api`), and a shared TypeScript package (`packages/shared`) for types and API contracts. The two apps talk over HTTP. The frontend never calls any AI provider directly — all AI work, memory operations, and data access live in the backend.

---

## System Overview

```mermaid
graph TD
    subgraph Browser
        A[Chat Panel]
        B[Voice Input]
        C[Memory Sidebar]
        D[Avatar - React Three Fiber]
    end

    subgraph FastAPI Backend
        R1[Conversation Router]
        R2[Memory Router]
        R3[Voice Router]
        R4[Avatar Router]

        subgraph Service Layer
            S1[ConversationService]
            S2[MemoryService]
            S3[AIService]
            S4[VoiceService]
        end

        DB[(PostgreSQL + pgvector)]
        AI[AI Providers - LLM / TTS / STT / Embed]
    end

    Browser -->|HTTPS| R1
    Browser -->|HTTPS| R2
    Browser -->|HTTPS / WebSocket| R3
    Browser -->|HTTPS| R4

    R1 --> S1
    R2 --> S2
    R3 --> S4
    S1 --> S3
    S2 --> S3

    S1 --> DB
    S2 --> DB
    S3 --> AI
    S4 --> AI
```

---

## Frontend

| | |
|---|---|
| Framework | Next.js 14, App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| 3D rendering | React Three Fiber |
| UI state | Zustand |
| Server state | TanStack Query |

The frontend owns UI state only. Conversation flow, voice recording, and memory panel state live in Zustand stores. All data fetching goes through TanStack Query against the backend API.

---

## Backend

| | |
|---|---|
| Framework | FastAPI |
| Language | Python 3.11+ |
| Validation | Pydantic v2 |
| ORM | SQLModel |
| Database | PostgreSQL 15 |
| Vector search | pgvector |
| Cache | Redis (optional) |

Business logic lives entirely in the service layer. Route handlers are thin: validate input, call a service, return a response.

---

## AI Layer

Every AI capability is accessed through a typed interface. Route handlers never import a provider SDK directly. Swapping providers means writing a new implementation class, nothing else.

```mermaid
classDiagram
    class AIService {
        <<interface>>
    }
    class LLMService {
        +complete(messages) str
    }
    class EmbeddingService {
        +embed(text) vector
    }
    class TTSService {
        +synthesize(text) bytes
    }
    class STTService {
        +transcribe(audio) str
    }

    AIService <|-- LLMService
    AIService <|-- EmbeddingService
    AIService <|-- TTSService
    AIService <|-- STTService
```

During development all services use mock implementations with deterministic responses. Real providers are wired in during milestones M2 and M3.

---

## Memory Layer

Memory runs at two levels.

**Short-term context** is the current conversation history sent with every LLM request. When a conversation grows long, older messages are summarized and the summary replaces the raw history in the prompt.

**Long-term memory** is a set of extracted facts stored in PostgreSQL with vector embeddings. At the start of each session the most relevant memories are retrieved by semantic similarity and injected into the system prompt.

```mermaid
flowchart LR
    Conversation -->|extract candidates| MemoryExtractor
    MemoryExtractor -->|embed + store| PostgreSQL
    PostgreSQL -->|semantic search| Retriever
    Retriever -->|inject into prompt| LLM
```

Full design: [memory-design.md](memory-design.md)

---

## Voice Layer

Voice input is recorded in the browser with the Web Audio API and sent to the backend as an audio blob. The backend transcribes it with the STT service, generates a response with the LLM, and streams synthesized audio back via the TTS service.

```mermaid
sequenceDiagram
    participant Browser
    participant Backend
    participant STT
    participant LLM
    participant TTS

    Browser->>Backend: POST /voice/transcribe (audio blob)
    Backend->>STT: transcribe(audio)
    STT-->>Backend: transcript
    Backend->>LLM: complete(messages + memories)
    LLM-->>Backend: response text
    Backend->>TTS: synthesize(response)
    TTS-->>Backend: audio stream
    Backend-->>Browser: audio stream
```

Later phases replace this with a persistent WebSocket session via the OpenAI Realtime API.

Full design: [voice-design.md](voice-design.md)

---

## Avatar Layer

The avatar is a Three.js scene rendered with React Three Fiber. It reads avatar state from Zustand and transitions between five states.

```mermaid
stateDiagram-v2
    [*] --> idle
    idle --> listening : user starts speaking
    listening --> processing : audio captured
    processing --> speaking : response ready
    speaking --> idle : response finished
    processing --> error : request failed
    error --> idle : user dismisses
```

Mouth movement in early phases is driven by audio amplitude. Viseme-based lip sync is planned for a later milestone.

Full design: [avatar-design.md](avatar-design.md)

---

## Database Schema

```sql
users
  id, email, password_hash, memory_enabled,
  created_at, updated_at

conversations
  id, user_id, title,
  created_at, updated_at

messages
  id, conversation_id, role, content,
  created_at

memories
  id, user_id, content, embedding (vector),
  source_conversation_id, confidence,
  reviewed, deleted_at, created_at, updated_at
```

---

## Local Infrastructure

Docker Compose starts PostgreSQL and Redis. The Next.js dev server and uvicorn run on the host directly for faster hot-reload iteration.

See [../infra/docker-compose.yml](../infra/docker-compose.yml).

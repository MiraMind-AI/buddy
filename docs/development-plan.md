# Development Plan

This document describes the planned development trajectory for Buddy over approximately 12 months. The goal is not a minimal prototype but a stable, usable product by the end of the period. Early phases produce working software. Later phases build on that foundation.

Each milestone is sized for two developers working approximately 4 hours per week each, roughly 8 combined hours per week.

---

## M1 - Project Foundation

**Status:** Closed on 2026-05-31.

**Goal:** Both developers can run the full stack locally. CI passes on every push.

- Monorepo structure with pnpm workspaces
- FastAPI backend with health endpoint, basic router structure
- Next.js frontend with layout, design tokens, placeholder screens
- Docker Compose for PostgreSQL and Redis
- GitHub Actions CI for frontend build and backend tests
- Trunk configured for linting and formatting
- All documentation written

**Exit criteria:** `docker compose up` + `pnpm dev:web` + `uvicorn` gives a running system. CI is green.

---

## M2 - Conversation Core

**Goal:** Users can have a text conversation with Buddy. Messages are stored in the database.

- User authentication (JWT, registration, login)
- Conversation creation and retrieval
- Message persistence
- LLM integration (real OpenAI or Anthropic call, behind the AIService interface)
- Basic system prompt with no memory yet
- Frontend: conversation screen, message list, text input, send/receive flow
- TanStack Query for API state management

**Exit criteria:** A user can register, start a conversation, send messages, and see responses. Conversations persist across page reloads.

---

## M3 - Voice Infrastructure

**Goal:** Users can speak to Buddy instead of typing.

- Microphone capture in the browser (Web Audio API)
- Voice activity detection or manual push-to-talk
- Audio sent to backend for STT (Whisper)
- Response text sent to TTS, audio streamed back
- Voice control button with state feedback in the UI
- Interrupt handling: user can start speaking while Buddy is responding

**Exit criteria:** A user can have a complete spoken exchange without touching the keyboard.

---

## M4 - Memory System

**Goal:** Buddy remembers facts across sessions.

- Memory extraction: after each conversation, candidate memories are generated
- Memory storage: facts saved with vector embeddings (pgvector)
- Memory retrieval: relevant memories injected into the system prompt
- Memory confidence scoring
- Memory review queue for uncertain extractions

**Exit criteria:** Facts mentioned in one session are correctly recalled in a later session.

---

## M5 - User Control and Settings

**Goal:** Users have full visibility and control over their data.

- Memory panel in the UI: view all memories
- Edit and delete individual memories
- Memory consent settings
- Basic settings screen (display name, preferences)
- Account deletion

**Exit criteria:** A user can open the memory panel, read everything stored about them, and delete specific items. Deleted items are not used in future responses.

---

## M6 - Avatar Foundation

**Goal:** A 3D avatar is visible and responds to conversation state.

- Three.js canvas with React Three Fiber
- Avatar states: idle, listening, thinking, speaking, error
- Smooth transitions between states
- Audio amplitude-based mouth movement
- Avatar placeholder model (placeholder geometry or a simple rigged model)

**Exit criteria:** The avatar is visible on the conversation screen and visibly changes state during a voice conversation.

---

## M7 - Human Conversation Quality

**Goal:** Conversations feel natural and continuous.

- Improved system prompt and memory injection strategy
- Conversation summaries for long sessions
- Better context window management
- Response streaming (token-by-token display and audio)
- Reduced latency profiling and optimization
- OpenAI Realtime API integration (if available and suitable)

**Exit criteria:** A 10-minute voice conversation feels natural, low-latency, and contextually coherent.

---

## M8 - Deployment and Observability

**Goal:** The application can be deployed and monitored.

- Production Docker Compose or Kubernetes config
- Structured logging throughout backend
- Error tracking (Sentry or equivalent)
- Basic metrics (response latency, memory retrieval count)
- Database migrations with Alembic
- Rate limiting on API endpoints
- Secrets management review

**Exit criteria:** The application runs in a production-like environment with logs and error tracking.

---

## M9 - Stable Beta

**Goal:** The product is stable enough for real use by a small number of users.

- End-to-end testing for core conversation and memory flows
- Performance review and optimization
- Security review
- User feedback integration from any early testers
- Viseme-based lip sync for the avatar (if feasible)
- Polished UI across all screens

**Exit criteria:** The application handles real usage without crashes or data loss.

---

## M10 - Production-Ready Version

**Goal:** A version that can be shared publicly or with a defined audience.

- Full CI/CD pipeline
- Backup and recovery for database
- Usage and billing model (if relevant)
- Final documentation review
- Public README and onboarding
- Privacy policy and terms of service (if public)

**Exit criteria:** The application is stable, documented, and ready for a broader audience.

---

## Issue Sizing

Given the 8 combined hours per week constraint, individual issues should be sized to fit within one person's 4-hour session. Issues larger than that should be broken down. The monorepo structure is designed to allow backend and frontend issues to proceed independently without merge conflicts.

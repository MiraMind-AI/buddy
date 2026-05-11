# Buddy

Buddy is a web-based personal voice companion. Users can speak with the assistant, which responds naturally, remembers past conversations, and learns about the person over time. Privacy, memory control, and transparency are first-class concerns.

## What Buddy Does

- Voice and text conversation with a natural language AI
- Long-term memory that persists across sessions
- User-controlled memory: review, edit, delete any stored fact
- Clean, modern web UI built for daily use
- A 3D avatar that reacts to voice and conversation state (in development)

## Technology Overview

| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS, Framer Motion, React Three Fiber |
| State / Data | Zustand, TanStack Query |
| Backend | Python, FastAPI, Pydantic, SQLModel |
| Database | PostgreSQL, pgvector |
| Cache / Queue | Redis (optional) |
| AI Layer | Abstracted interfaces for LLM, TTS, STT, Embeddings |
| Infrastructure | Docker Compose, GitHub Actions |

## Repository Structure

```
apps/
  web/          Next.js frontend
  api/          FastAPI backend
packages/
  shared/       Shared TypeScript types and API contracts
docs/           Architecture, design documents, decisions
infra/          Docker Compose and infrastructure scripts
scripts/        Local setup and dev helper scripts
.github/        CI workflows and GitHub templates
```

## Local Development

### Prerequisites

- Node.js 20+
- pnpm 9+
- Python 3.11+
- Docker and Docker Compose

### Setup

```bash
# Clone the repository
git clone git@github.com:MiraMind-AI/buddy.git
cd buddy

# Copy environment file
cp .env.example .env

# Start infrastructure (Postgres, Redis)
docker compose -f infra/docker-compose.yml up -d

# Install frontend dependencies
pnpm install

# Start the web app
pnpm dev:web

# In a second terminal, set up the Python backend
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

The frontend runs at `http://localhost:3000`.
The API runs at `http://localhost:8000`.
API documentation is available at `http://localhost:8000/docs`.

## Development Workflow

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full branch and PR workflow.

In short:

- `main` is always stable and deployable
- `dev` is the integration branch
- Feature work happens on `feature/<short-name>` branches
- All changes go through a pull request

## Roadmap

See [docs/development-plan.md](docs/development-plan.md) for the full development plan.

| Milestone | Description |
|---|---|
| M1 | Project foundation |
| M2 | Conversation core |
| M3 | Voice infrastructure |
| M4 | Memory system |
| M5 | User control and settings |
| M6 | Avatar foundation |
| M7 | Human conversation quality |
| M8 | Deployment and observability |
| M9 | Stable beta |
| M10 | Production-ready version |

## Privacy and Memory

Memory is a core feature of Buddy, not an afterthought. Users can view all stored memories at any time, edit or delete individual facts, and revoke consent for memory storage entirely. Raw audio is never stored. See [docs/security-and-privacy.md](docs/security-and-privacy.md) for details.

## License

To be determined.

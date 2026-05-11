# GitHub Workflow

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable, deployable. Never commit directly. |
| `dev` | Integration branch. All feature branches merge here. |
| `feature/<name>` | New features or larger changes. |
| `fix/<name>` | Bug fixes. |
| `docs/<name>` | Documentation-only changes. |
| `chore/<name>` | Tooling, config, dependency updates. |

## Typical Flow

1. Create an issue describing the work.
2. Create a branch from `dev`: `git checkout -b feature/memory-panel dev`
3. Do the work in small, focused commits.
4. Open a pull request against `dev`.
5. Other developer reviews and approves.
6. Merge using squash or merge commit (team decision - keep consistent).
7. Delete the feature branch.
8. Periodically merge `dev` into `main` when a set of features is stable.

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add memory deletion endpoint
fix: correct JWT expiry header
docs: update api-contract with voice endpoints
chore: upgrade fastapi to 0.112
refactor: extract message formatting into helper
test: add unit tests for MemoryService
```

## Issue Labels

| Label | Meaning |
|---|---|
| `backend` | Backend work only |
| `frontend` | Frontend work only |
| `fullstack` | Touches both |
| `bug` | Something broken |
| `documentation` | Docs only |
| `infra` | Infrastructure or CI |
| `blocked` | Cannot proceed |
| `good first issue` | Good entry point |

## Pull Request Size

Keep PRs small. A PR that touches more than 400 lines of logic (excluding generated files and docs) should be split unless it is unavoidable. Smaller PRs get reviewed faster and cause fewer conflicts.

## Review Expectations

- Respond to review requests within one working session.
- Mark nit comments clearly so the author knows they are not blockers.
- If you need a change before approving, explain why.

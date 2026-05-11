# Contributing to Buddy

## Branch Strategy

- `main` is the stable, production-ready branch. Direct commits are not permitted.
- `dev` is the integration branch. Feature branches are merged here first.
- Feature branches follow the pattern `feature/<short-description>`.
- Bug fixes follow the pattern `fix/<short-description>`.
- Documentation-only changes use `docs/<short-description>`.

## Pull Requests

All changes require a pull request against `dev`. At least one review is required before merging.

- Keep pull requests focused. One concern per PR.
- Write a clear description of what changed and why.
- Reference the related issue if one exists.
- Make sure CI passes before requesting review.

## Commit Style

Use the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
feat: add memory deletion endpoint
fix: correct token expiry calculation
docs: update architecture diagram
chore: bump fastapi to 0.111
refactor: extract conversation service
test: add coverage for memory retrieval
```

Keep the subject line under 72 characters. Add a body if the change needs explanation.

## Code Review

- Review the logic, not just the style.
- Point out what is unclear, not just what is wrong.
- Approve when the change is ready to merge, not when it is perfect.

## Issue Workflow

- Create an issue before starting significant work.
- Assign the issue to yourself when you begin.
- Reference the issue in your PR with `Closes #<number>` or `Relates to #<number>`.

## Setup

See [README.md](README.md) for local setup instructions.

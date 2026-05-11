# ADR 0001 - Monorepo with pnpm Workspaces and Separate Backend

**Date:** 2026-05-12  
**Status:** Accepted

## Context

The project has a TypeScript frontend (Next.js) and a Python backend (FastAPI). We need to decide whether to keep them in a single repository or separate repositories, and how to manage the JavaScript workspace if co-located.

## Decision

Use a monorepo with pnpm workspaces for the JavaScript packages (`apps/web`, `packages/shared`) and co-locate the Python backend (`apps/api`) in the same repository without adding it to the pnpm workspace.

## Reasoning

- Shared TypeScript types (`packages/shared`) can be referenced directly without publishing to a registry.
- A single repository simplifies issue tracking, PR reviews, and CI configuration for a two-person team.
- The Python backend does not benefit from pnpm workspaces and manages its own dependencies with `pyproject.toml`.
- Co-location does not force the same toolchain on both parts of the project.

## Consequences

- Developers need Node.js and Python installed locally to work on the full stack.
- The `pnpm-workspace.yaml` only includes JavaScript packages; the backend is referenced by path in scripts.
- Adding a third service later (e.g., a separate worker) follows the same pattern: add to `apps/`, manage dependencies independently, wire into `infra/docker-compose.yml`.

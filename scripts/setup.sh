#!/usr/bin/env bash
set -e

echo "Copying .env.example to .env..."
cp -n .env.example .env || echo ".env already exists, skipping."

echo "Starting infrastructure..."
docker compose -f infra/docker-compose.yml up -d

echo "Installing frontend dependencies..."
pnpm install

echo "Setup complete."
echo "Start the API:  cd apps/api && python -m venv .venv && source .venv/bin/activate && pip install -e '.[dev]'"
echo "Start the web:  pnpm dev:web"

#!/usr/bin/env bash
# wsl-sync.sh — copy source between the Windows clone and the native Linux clone.
#
# Source of truth (git, edits, push): /mnt/c/AA-Projekt/buddy
# Native build/test workspace (fast):  ~/buddy
#
# Usage:
#   scripts/wsl-sync.sh pull    # /mnt/c  -> ~/buddy   (default; before running pnpm/pytest)
#   scripts/wsl-sync.sh push    # ~/buddy -> /mnt/c    (only if you edited files inside ~/buddy)
#   scripts/wsl-sync.sh init    # one-time: prepare ~/buddy and install deps
#
# Excludes: node_modules, .next, .venv, .git, build artifacts.
# Git stays in /mnt/c — never push from ~/buddy.

set -euo pipefail

WIN_ROOT="/mnt/c/AA-Projekt/buddy"
LINUX_ROOT="${BUDDY_LINUX_ROOT:-$HOME/buddy}"

EXCLUDES=(
  --exclude='.git/'
  --exclude='node_modules/'
  --exclude='.next/'
  --exclude='.venv/'
  --exclude='__pycache__/'
  --exclude='.pytest_cache/'
  --exclude='.ruff_cache/'
  --exclude='.mypy_cache/'
  --exclude='*.egg-info/'
  --exclude='dist/'
  --exclude='build/'
  --exclude='.turbo/'
  --exclude='.DS_Store'
  --exclude='/tmp/'
)

cmd="${1:-pull}"

case "$cmd" in
  pull)
    mkdir -p "$LINUX_ROOT"
    echo ">> pull  $WIN_ROOT  ->  $LINUX_ROOT"
    rsync -a --delete "${EXCLUDES[@]}" "$WIN_ROOT/" "$LINUX_ROOT/"
    echo ">> done"
    ;;
  push)
    if [[ ! -d "$LINUX_ROOT" ]]; then
      echo "!! $LINUX_ROOT does not exist; run 'init' first" >&2
      exit 1
    fi
    echo ">> push  $LINUX_ROOT  ->  $WIN_ROOT"
    rsync -a --delete "${EXCLUDES[@]}" "$LINUX_ROOT/" "$WIN_ROOT/"
    echo ">> done (review with: git -C $WIN_ROOT status)"
    ;;
  init)
    mkdir -p "$LINUX_ROOT"
    echo ">> initial copy  $WIN_ROOT  ->  $LINUX_ROOT"
    rsync -a --delete "${EXCLUDES[@]}" "$WIN_ROOT/" "$LINUX_ROOT/"
    echo ">> installing JS deps via pnpm"
    (cd "$LINUX_ROOT" && pnpm install --frozen-lockfile=false)
    echo ">> setting up Python venv for the API"
    if command -v python3.13 >/dev/null 2>&1; then PY=python3.13
    elif command -v python3.12 >/dev/null 2>&1; then PY=python3.12
    elif command -v python3.11 >/dev/null 2>&1; then PY=python3.11
    else PY=python3
    fi
    "$PY" -m venv "$LINUX_ROOT/apps/api/.venv"
    "$LINUX_ROOT/apps/api/.venv/bin/pip" install --upgrade pip
    "$LINUX_ROOT/apps/api/.venv/bin/pip" install -e "$LINUX_ROOT/apps/api[dev]"
    echo ">> init done"
    echo "   Build  : (cd $LINUX_ROOT && pnpm -F web build)"
    echo "   Tests  : (cd $LINUX_ROOT/apps/api && .venv/bin/pytest)"
    ;;
  *)
    echo "usage: $0 {pull|push|init}" >&2
    exit 2
    ;;
esac

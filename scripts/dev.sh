#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD=(docker-compose)
else
  echo "Docker Compose not found. Install Docker Desktop or docker-compose." >&2
  exit 1
fi

echo "Starting database..."
"${COMPOSE_CMD[@]}" -f "$ROOT_DIR/docker-compose.yml" up -d

if [ ! -d "$ROOT_DIR/frontend/jobmail-ui/node_modules" ]; then
  echo "Installing frontend dependencies..."
  (cd "$ROOT_DIR/frontend/jobmail-ui" && npm install)
fi

echo "Starting backend..."
(cd "$ROOT_DIR/backend/JobMailApi" && dotnet run) &
BACKEND_PID=$!

echo "Starting frontend..."
(cd "$ROOT_DIR/frontend/jobmail-ui" && npm run dev) &
FRONTEND_PID=$!

cleanup() {
  echo "Stopping services..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

wait "$BACKEND_PID" "$FRONTEND_PID"

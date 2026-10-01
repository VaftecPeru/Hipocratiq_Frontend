#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$ROOT_DIR/front_web"
NODE_IMAGE="${NODE_IMAGE:-node:22-bookworm-slim}"

command -v docker >/dev/null 2>&1 || {
  echo "ERROR: Docker es requerido para regenerar package-lock.json." >&2
  exit 1
}

echo "== HIPOCRATIQ Web lock refresh =="
echo "Image: $NODE_IMAGE"

docker run --rm   --user "$(id -u):$(id -g)"   -e HOME=/tmp   -v "$WEB_DIR:/app"   -w /app   "$NODE_IMAGE"   npm install --package-lock-only --ignore-scripts --no-audit --no-fund

echo "Validando lock con npm ci en contenedor limpio..."
docker run --rm   -v "$WEB_DIR:/app:ro"   -w /tmp/app   "$NODE_IMAGE"   sh -lc 'cp -a /app/. /tmp/app/ && npm ci --ignore-scripts --no-audit --no-fund >/dev/null'

echo "WEB PACKAGE LOCK OK"
git -C "$ROOT_DIR" status --short -- front_web/package-lock.json

#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)-$$"
CI_IMAGE="hipocratiq-web-ci:${RUN_ID}"
E2E_IMAGE="hipocratiq-web-e2e:${RUN_ID}"
RELEASE_IMAGE="hipocratiq-web-releasecheck:${RUN_ID}"
NETWORK="hipocratiq-web-ci-${RUN_ID}"
FAKE_BACKEND="hipocratiq-web-fake-${RUN_ID}"
FRONTEND="hipocratiq-web-front-${RUN_ID}"
LOG_DIR="${VALIDATION_LOG_DIR:-/tmp/hipocratiq-validation}"
LOG_FILE="${LOG_DIR}/frontend-${RUN_ID}.log"

mkdir -p "$LOG_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

cleanup() {
  set +e
  docker rm -f "$FRONTEND" "$FAKE_BACKEND" >/dev/null 2>&1 || true
  docker network rm "$NETWORK" >/dev/null 2>&1 || true
  docker image rm -f "$CI_IMAGE" "$E2E_IMAGE" "$RELEASE_IMAGE" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for command in git docker curl; do
  command -v "$command" >/dev/null 2>&1 || {
    echo "ERROR: falta el comando requerido: $command" >&2
    exit 1
  }
done

docker info >/dev/null
docker compose version >/dev/null

echo "== HIPOCRATIQ Web VPS validation =="
echo "SHA: $(git rev-parse HEAD)"
echo "Branch: $(git branch --show-current)"
echo "Log: $LOG_FILE"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "ERROR: el checkout de validación debe estar limpio." >&2
  git status --short
  exit 1
fi

echo "[1/9] Build imagen CI Web"
docker build --pull -f front_web/Dockerfile.ci -t "$CI_IMAGE" front_web

run_web() {
  docker run --rm "$CI_IMAGE" "$@"
}

echo "[2/9] npm audit"
run_web npm audit --omit=dev --audit-level=high

echo "[3/9] TypeScript + regresiones + ESLint"
run_web npm run typecheck
run_web node --test tests/*.test.mjs
run_web npm run lint

echo "[4/9] Next build"
docker run --rm \
  -e BACKEND_URL=http://127.0.0.1:8000 \
  -e APP_URL=http://127.0.0.1:3000 \
  "$CI_IMAGE" npm run build

echo "[5/9] Build Playwright E2E"
docker build --pull -f front_web/Dockerfile.e2e -t "$E2E_IMAGE" front_web

echo "[6/9] E2E por rol"
docker run --rm "$E2E_IMAGE" bash -lc '
  set -Eeuo pipefail
  node e2e/fake-backend.mjs >/tmp/fake-backend.log 2>&1 &
  BACK_PID=$!
  npm run start >/tmp/frontend.log 2>&1 &
  FRONT_PID=$!
  cleanup() {
    kill "$BACK_PID" "$FRONT_PID" 2>/dev/null || true
  }
  trap cleanup EXIT
  for attempt in {1..60}; do
    if curl --fail --silent http://127.0.0.1:3000/ >/dev/null; then
      break
    fi
    if [[ "$attempt" -eq 60 ]]; then
      cat /tmp/frontend.log
      exit 1
    fi
    sleep 1
  done
  npx playwright test
'

echo "[7/9] Build imagen Web de producción"
docker build -f front_web/Dockerfile -t "$RELEASE_IMAGE" front_web

docker network create "$NETWORK" >/dev/null
docker run -d --name "$FAKE_BACKEND" --network "$NETWORK" "$CI_IMAGE" node e2e/fake-backend.mjs >/dev/null
docker run -d --name "$FRONTEND" --network "$NETWORK" \
  -e BACKEND_URL="http://$FAKE_BACKEND:8000" \
  -e APP_URL="http://$FRONTEND:3000" \
  "$RELEASE_IMAGE" >/dev/null

for attempt in {1..45}; do
  if docker run --rm --network "$NETWORK" "$CI_IMAGE" \
    node -e "fetch('http://$FRONTEND:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; then
    break
  fi
  if [[ "$attempt" -eq 45 ]]; then
    echo "ERROR: imagen Web de producción no quedó lista." >&2
    docker logs "$FRONTEND" || true
    exit 1
  fi
  sleep 2
done

echo "[8/9] Compose + deploy script"
docker compose --env-file front_web/.env.example -f front_web/compose.yaml config --quiet
bash -n scripts/deploy-production.sh

echo "[9/9] Estado de contenedor release"
docker inspect --format '{{.State.Status}}' "$FRONTEND" | grep -qx running

echo "WEB VPS VALIDATION OK"
echo "SHA: $(git rev-parse HEAD)"
echo "Evidence: $LOG_FILE"

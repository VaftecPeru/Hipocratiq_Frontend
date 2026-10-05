#!/usr/bin/env bash
set -Eeuo pipefail

PRODUCTION_DIR="${PRODUCTION_DIR:-/srv/hipocratiq/frontend}"
COMPOSE_PROJECT="${COMPOSE_PROJECT:-}"
HEALTH_URL="${HEALTH_URL:-https://hipocratiq.com/}"
LOCK_FILE="${LOCK_FILE:-/tmp/hipocratiq-frontend-deploy.lock}"
TARGET_BRANCH="main"

for command in git docker curl flock; do
  command -v "$command" >/dev/null 2>&1 || {
    echo "ERROR: falta el comando requerido: $command" >&2
    exit 1
  }
done

exec 9>"$LOCK_FILE"
flock -n 9 || {
  echo "ERROR: ya existe un despliegue Frontend en ejecución." >&2
  exit 1
}

cd "$PRODUCTION_DIR"

if [[ "$(git branch --show-current)" != "$TARGET_BRANCH" ]]; then
  echo "ERROR: el repositorio productivo debe permanecer en main." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "ERROR: el repositorio productivo contiene cambios locales. No se sobrescriben automáticamente." >&2
  git status --short
  exit 1
fi

if [[ -z "$COMPOSE_PROJECT" ]]; then
  COMPOSE_PROJECT="$(docker inspect --format '{{ index .Config.Labels "com.docker.compose.project" }}' front-web-app 2>/dev/null || true)"
  COMPOSE_PROJECT="${COMPOSE_PROJECT:-front_web}"
fi

OLD_SHA="$(git rev-parse HEAD)"
UPDATED=0

compose() {
  docker compose -p "$COMPOSE_PROJECT" -f "$PRODUCTION_DIR/front_web/compose.yaml" "$@"
}

rollback_code() {
  set +e
  if [[ "$UPDATED" -eq 1 ]]; then
    echo "ROLLBACK: restaurando Frontend a $OLD_SHA"
    git reset --hard "$OLD_SHA"
    compose up -d --build --no-deps frontend
  fi
}

on_error() {
  local line="$1"
  echo "ERROR: despliegue Frontend falló cerca de la línea $line." >&2
  rollback_code
}
trap 'on_error "$LINENO"' ERR

echo "== HIPOCRATIQ Frontend deploy =="
echo "Origen: $OLD_SHA"
echo "Proyecto Compose detectado: $COMPOSE_PROJECT"

git fetch --prune origin "$TARGET_BRANCH"
TARGET_SHA="$(git rev-parse "origin/$TARGET_BRANCH")"

if ! git merge-base --is-ancestor "$OLD_SHA" "$TARGET_SHA"; then
  echo "ERROR: origin/main no es fast-forward respecto al estado productivo actual." >&2
  exit 1
fi

echo "Destino: $TARGET_SHA"

if [[ "$OLD_SHA" != "$TARGET_SHA" ]]; then
  git merge --ff-only "origin/$TARGET_BRANCH"
  UPDATED=1
fi

echo "Construyendo y actualizando Frontend..."
compose up -d --build --no-deps frontend

container_id="$(compose ps -q frontend)"
if [[ -z "$container_id" ]] || [[ "$(docker inspect --format '{{.State.Running}}' "$container_id")" != "true" ]]; then
  echo "ERROR: el servicio Frontend no quedó en ejecución." >&2
  compose ps
  exit 1
fi

echo "Esperando healthcheck local..."
READY=0
for attempt in {1..45}; do
  if curl --fail --silent --show-error http://127.0.0.1:3000/ >/dev/null; then
    READY=1
    break
  fi
  sleep 2
done

if [[ "$READY" -ne 1 ]]; then
  echo "ERROR: Frontend local no quedó disponible." >&2
  compose logs --tail=120 frontend || true
  exit 1
fi

if [[ -n "$HEALTH_URL" ]]; then
  curl --fail --silent --show-error "$HEALTH_URL" >/dev/null
fi

trap - ERR
echo "DEPLOY FRONTEND OK"
echo "SHA: $(git rev-parse HEAD)"

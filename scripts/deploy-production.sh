#!/usr/bin/env bash
set -Eeuo pipefail

PRODUCTION_DIR="${PRODUCTION_DIR:-/srv/hipocratiq/frontend}"
HEALTH_URL="${HEALTH_URL:-https://hipocratiq.com/}"
LOCK_FILE="${LOCK_FILE:-/tmp/hipocratiq-frontend-deploy.lock}"
TARGET_BRANCH="main"

FRONTEND_CONTAINER="${FRONTEND_CONTAINER:-front-web-app}"
COMPOSE_PROJECT="${COMPOSE_PROJECT:-}"

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

OLD_SHA="$(git rev-parse HEAD)"
UPDATED=0

container_label() {
  local container="$1"
  local label="$2"
  docker inspect --format "{{ index .Config.Labels \"$label\" }}" "$container" 2>/dev/null || true
}

detect_compose_project() {
  if [[ -n "$COMPOSE_PROJECT" ]]; then
    return
  fi

  if ! docker inspect "$FRONTEND_CONTAINER" >/dev/null 2>&1; then
    echo "ERROR: no existe el contenedor productivo esperado: $FRONTEND_CONTAINER" >&2
    exit 1
  fi

  COMPOSE_PROJECT="$(container_label "$FRONTEND_CONTAINER" "com.docker.compose.project")"

  if [[ -z "$COMPOSE_PROJECT" ]]; then
    echo "ERROR: no se pudo detectar el proyecto Docker Compose desde $FRONTEND_CONTAINER." >&2
    echo "Define COMPOSE_PROJECT explícitamente antes de desplegar." >&2
    exit 1
  fi
}

compose() {
  docker compose -p "$COMPOSE_PROJECT" -f front_web/compose.yaml "$@"
}

validate_running_frontend() {
  local project service running

  project="$(container_label "$FRONTEND_CONTAINER" "com.docker.compose.project")"
  service="$(container_label "$FRONTEND_CONTAINER" "com.docker.compose.service")"
  running="$(docker inspect --format '{{.State.Running}}' "$FRONTEND_CONTAINER" 2>/dev/null || true)"

  if [[ "$project" != "$COMPOSE_PROJECT" || "$service" != "frontend" || "$running" != "true" ]]; then
    echo "ERROR: el contenedor Frontend no coincide con el proyecto Compose detectado." >&2
    echo "Proyecto esperado: $COMPOSE_PROJECT" >&2
    echo "Proyecto detectado: ${project:-<vacío>}" >&2
    echo "Servicio detectado: ${service:-<vacío>}" >&2
    echo "Running: ${running:-<desconocido>}" >&2
    exit 1
  fi
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

detect_compose_project
validate_running_frontend

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

echo "Validando definición Docker Compose..."
compose config --quiet

if ! compose config --services | grep -qx frontend; then
  echo "ERROR: el servicio frontend no existe en front_web/compose.yaml." >&2
  exit 1
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
  exit 1
fi

if [[ -n "$HEALTH_URL" ]]; then
  curl --fail --silent --show-error "$HEALTH_URL" >/dev/null
fi

trap - ERR
echo "DEPLOY FRONTEND OK"
echo "SHA: $(git rev-parse HEAD)"
echo "Proyecto Compose: $COMPOSE_PROJECT"

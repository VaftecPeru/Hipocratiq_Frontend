#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)-$$"
IMAGE="hipocratiq-mobile-android-ci:${RUN_ID}"
BUILD_CONTAINER="hipocratiq-mobile-build-${RUN_ID}"
LOG_DIR="${VALIDATION_LOG_DIR:-/tmp/hipocratiq-validation}"
LOG_FILE="${LOG_DIR}/mobile-${RUN_ID}.log"
ARTIFACT_DIR="${LOG_DIR}/android-${RUN_ID}"

mkdir -p "$LOG_DIR" "$ARTIFACT_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

cleanup() {
  set +e
  docker rm -f "$BUILD_CONTAINER" >/dev/null 2>&1 || true
  docker image rm -f "$IMAGE" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for command in git docker; do
  command -v "$command" >/dev/null 2>&1 || {
    echo "ERROR: falta el comando requerido: $command" >&2
    exit 1
  }
done

docker info >/dev/null

echo "== HIPOCRATIQ Android VPS validation =="
echo "SHA: $(git rev-parse HEAD)"
echo "Branch: $(git branch --show-current)"
echo "Log: $LOG_FILE"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "ERROR: el checkout de validación debe estar limpio." >&2
  git status --short
  exit 1
fi

echo "[1/6] Build toolchain Flutter/Android"
docker build --pull -f front_movil/Dockerfile.android-ci -t "$IMAGE" front_movil

echo "[2/6] Dart format"
docker run --rm "$IMAGE" dart format --output=none --set-exit-if-changed lib test

echo "[3/6] Flutter analyze"
docker run --rm "$IMAGE" flutter analyze

echo "[4/6] Flutter tests"
docker run --rm "$IMAGE" flutter test

echo "[5/6] Build APK + AAB de validación"
docker create --name "$BUILD_CONTAINER" "$IMAGE" bash -lc '
  set -Eeuo pipefail
  dart run flutter_launcher_icons
  flutter build apk --debug \
    --dart-define=BACKEND_URL=https://hipocratiq.com/backend \
    --dart-define=SUPPORT_PORTAL_URL=https://hipocratiq.com
  flutter build appbundle --debug \
    --dart-define=BACKEND_URL=https://hipocratiq.com/backend \
    --dart-define=SUPPORT_PORTAL_URL=https://hipocratiq.com
' >/dev/null

docker start -a "$BUILD_CONTAINER"

docker cp "$BUILD_CONTAINER:/workspace/build/app/outputs/flutter-apk/app-debug.apk" "$ARTIFACT_DIR/HIPOCRATIQ-validation.apk"
docker cp "$BUILD_CONTAINER:/workspace/build/app/outputs/bundle/debug/app-debug.aab" "$ARTIFACT_DIR/HIPOCRATIQ-validation.aab"

test -s "$ARTIFACT_DIR/HIPOCRATIQ-validation.apk"
test -s "$ARTIFACT_DIR/HIPOCRATIQ-validation.aab"

echo "[6/6] Checksums"
sha256sum "$ARTIFACT_DIR/HIPOCRATIQ-validation.apk" "$ARTIFACT_DIR/HIPOCRATIQ-validation.aab"

echo "ANDROID VPS VALIDATION OK"
echo "SHA: $(git rev-parse HEAD)"
echo "APK: $ARTIFACT_DIR/HIPOCRATIQ-validation.apk"
echo "AAB: $ARTIFACT_DIR/HIPOCRATIQ-validation.aab"
echo "Evidence: $LOG_FILE"

#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

required=(
  ANDROID_KEYSTORE_PATH
  ANDROID_KEYSTORE_PASSWORD
  ANDROID_KEY_ALIAS
  ANDROID_KEY_PASSWORD
)

for variable in "${required[@]}"; do
  if [[ -z "${!variable:-}" ]]; then
    echo "ERROR: falta la variable $variable para firmar Android release." >&2
    exit 1
  fi
done

for command in docker sha256sum; do
  command -v "$command" >/dev/null 2>&1 || {
    echo "ERROR: falta el comando requerido: $command" >&2
    exit 1
  }
done

if [[ ! -f "$ANDROID_KEYSTORE_PATH" ]]; then
  echo "ERROR: no existe la keystore: $ANDROID_KEYSTORE_PATH" >&2
  exit 1
fi

case "$ANDROID_KEYSTORE_PATH" in
  /*) KEYSTORE_HOST="$ANDROID_KEYSTORE_PATH" ;;
  *) KEYSTORE_HOST="$ROOT_DIR/$ANDROID_KEYSTORE_PATH" ;;
esac

BUILD_NAME="${BUILD_NAME:-1.0.0}"
BUILD_NUMBER="${BUILD_NUMBER:-1}"
BACKEND_URL="${BACKEND_URL:-https://hipocratiq.com/backend}"
SUPPORT_PORTAL_URL="${SUPPORT_PORTAL_URL:-https://hipocratiq.com}"
OUTPUT_DIR="${OUTPUT_DIR:-/tmp/hipocratiq-release}"
RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)-$$"
IMAGE="hipocratiq-mobile-android-release:$RUN_ID"
CONTAINER="hipocratiq-mobile-release-$RUN_ID"
CONTAINER_KEYSTORE="/run/secrets/hipocratiq-upload.jks"

[[ "$BUILD_NAME" =~ ^[0-9]+\.[0-9]+\.[0-9]+([+-][A-Za-z0-9._-]+)?$ ]] || {
  echo "ERROR: BUILD_NAME inválido: $BUILD_NAME" >&2
  exit 1
}
[[ "$BUILD_NUMBER" =~ ^[1-9][0-9]*$ ]] || {
  echo "ERROR: BUILD_NUMBER debe ser entero positivo." >&2
  exit 1
}

mkdir -p "$OUTPUT_DIR"

cleanup() {
  set +e
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
  docker image rm -f "$IMAGE" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker info >/dev/null

echo "== HIPOCRATIQ Android release build =="
echo "Build: $BUILD_NAME+$BUILD_NUMBER"
echo "Output: $OUTPUT_DIR"

docker build --pull -f front_movil/Dockerfile.android-ci -t "$IMAGE" front_movil

docker create --name "$CONTAINER" \
  --mount "type=bind,source=$KEYSTORE_HOST,target=$CONTAINER_KEYSTORE,readonly" \
  -e ANDROID_KEYSTORE_PATH="$CONTAINER_KEYSTORE" \
  -e ANDROID_KEYSTORE_PASSWORD="$ANDROID_KEYSTORE_PASSWORD" \
  -e ANDROID_KEY_ALIAS="$ANDROID_KEY_ALIAS" \
  -e ANDROID_KEY_PASSWORD="$ANDROID_KEY_PASSWORD" \
  -e BUILD_NAME="$BUILD_NAME" \
  -e BUILD_NUMBER="$BUILD_NUMBER" \
  -e BACKEND_URL="$BACKEND_URL" \
  -e SUPPORT_PORTAL_URL="$SUPPORT_PORTAL_URL" \
  "$IMAGE" bash -lc '
    set -Eeuo pipefail
    dart run flutter_launcher_icons
    flutter build apk --release \
      --build-name="$BUILD_NAME" \
      --build-number="$BUILD_NUMBER" \
      --dart-define=BACKEND_URL="$BACKEND_URL" \
      --dart-define=SUPPORT_PORTAL_URL="$SUPPORT_PORTAL_URL"
    flutter build appbundle --release \
      --build-name="$BUILD_NAME" \
      --build-number="$BUILD_NUMBER" \
      --dart-define=BACKEND_URL="$BACKEND_URL" \
      --dart-define=SUPPORT_PORTAL_URL="$SUPPORT_PORTAL_URL"

    APK_PATH="build/app/outputs/flutter-apk/app-release.apk"
    AAB_PATH="build/app/outputs/bundle/release/app-release.aab"

    test -s "$APK_PATH"
    test -s "$AAB_PATH"

    APKSIGNER="$(find "$ANDROID_HOME/build-tools" -type f -name apksigner | sort -V | tail -n1)"
    [[ -n "$APKSIGNER" ]] || {
      echo "ERROR: apksigner no disponible en el toolchain Android." >&2
      exit 1
    }

    "$APKSIGNER" verify --verbose --print-certs "$APK_PATH"
    jarsigner -verify -strict "$AAB_PATH" >/dev/null
  ' >/dev/null

docker start -a "$CONTAINER"

APK="$OUTPUT_DIR/HIPOCRATIQ-$BUILD_NAME+$BUILD_NUMBER.apk"
AAB="$OUTPUT_DIR/HIPOCRATIQ-$BUILD_NAME+$BUILD_NUMBER.aab"

docker cp "$CONTAINER:/workspace/build/app/outputs/flutter-apk/app-release.apk" "$APK"
docker cp "$CONTAINER:/workspace/build/app/outputs/bundle/release/app-release.aab" "$AAB"

test -s "$APK"
test -s "$AAB"

sha256sum "$APK" "$AAB"

echo "ANDROID RELEASE OK"
echo "APK: $APK"
echo "AAB: $AAB"

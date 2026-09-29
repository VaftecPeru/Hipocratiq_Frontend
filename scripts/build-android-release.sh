#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/front_movil"

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

if [[ ! -f "$ANDROID_KEYSTORE_PATH" ]]; then
  echo "ERROR: no existe la keystore: $ANDROID_KEYSTORE_PATH" >&2
  exit 1
fi

BACKEND_URL="${BACKEND_URL:-https://hipocratiq.com/backend}"
SUPPORT_PORTAL_URL="${SUPPORT_PORTAL_URL:-https://hipocratiq.com}"
BUILD_NAME="${BUILD_NAME:-1.0.0}"
BUILD_NUMBER="${BUILD_NUMBER:-1}"
OUTPUT_DIR="${OUTPUT_DIR:-/tmp/hipocratiq-release}"

mkdir -p "$OUTPUT_DIR"

flutter pub get
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

cp build/app/outputs/flutter-apk/app-release.apk "$OUTPUT_DIR/HIPOCRATIQ-$BUILD_NAME+$BUILD_NUMBER.apk"
cp build/app/outputs/bundle/release/app-release.aab "$OUTPUT_DIR/HIPOCRATIQ-$BUILD_NAME+$BUILD_NUMBER.aab"

sha256sum \
  "$OUTPUT_DIR/HIPOCRATIQ-$BUILD_NAME+$BUILD_NUMBER.apk" \
  "$OUTPUT_DIR/HIPOCRATIQ-$BUILD_NAME+$BUILD_NUMBER.aab"

echo "ANDROID RELEASE OK"
echo "APK: $OUTPUT_DIR/HIPOCRATIQ-$BUILD_NAME+$BUILD_NUMBER.apk"
echo "AAB: $OUTPUT_DIR/HIPOCRATIQ-$BUILD_NAME+$BUILD_NUMBER.aab"

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$ROOT_DIR/front_web"
MOBILE_DIR="$ROOT_DIR/front_movil"
BUILD_ARTIFACTS="${BUILD_ARTIFACTS:-0}"
BACKEND_URL="${BACKEND_URL:-https://hipocratiq.com/backend}"
SUPPORT_PORTAL_URL="${SUPPORT_PORTAL_URL:-https://hipocratiq.com}"

echo "== HIPOCRATIQ Frontend preflight =="

cd "$WEB_DIR"
npm ci --no-audit --no-fund
npm audit --omit=dev --audit-level=high
npm run typecheck
npm test
npm run lint
BACKEND_URL="$BACKEND_URL" APP_URL="https://hipocratiq.com" npm run build

if ! command -v flutter >/dev/null 2>&1; then
  echo "WARN: Flutter no está instalado; Mobile queda pendiente."
  exit 0
fi

echo "== HIPOCRATIQ Mobile preflight =="

cd "$MOBILE_DIR"
flutter pub get
dart format --output=none --set-exit-if-changed lib test
flutter analyze
flutter test

if [[ "$BUILD_ARTIFACTS" != "1" ]]; then
  echo "Mobile quality OK. Usa BUILD_ARTIFACTS=1 para generar paquetes de validación."
  exit 0
fi

dart run flutter_launcher_icons
flutter build apk --release \
  --dart-define=BACKEND_URL="$BACKEND_URL" \
  --dart-define=SUPPORT_PORTAL_URL="$SUPPORT_PORTAL_URL"
flutter build appbundle --release \
  --dart-define=BACKEND_URL="$BACKEND_URL" \
  --dart-define=SUPPORT_PORTAL_URL="$SUPPORT_PORTAL_URL"

if [[ "$(uname -s)" == "Darwin" ]]; then
  flutter build ios --release --no-codesign \
    --dart-define=BACKEND_URL="$BACKEND_URL" \
    --dart-define=SUPPORT_PORTAL_URL="$SUPPORT_PORTAL_URL"
else
  echo "INFO: El build iOS requiere macOS/Xcode y se omite en este host."
fi

echo "Frontend/Mobile preflight OK"

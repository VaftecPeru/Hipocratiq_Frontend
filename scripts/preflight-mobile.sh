#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/front_movil"

echo "== HIPOCRATIQ Mobile preflight =="

flutter pub get
dart format --output=none --set-exit-if-changed lib test
flutter analyze
flutter test
dart run flutter_launcher_icons
flutter build apk --debug \
  --dart-define=BACKEND_URL="${BACKEND_URL:-https://hipocratiq.com/backend}" \
  --dart-define=SUPPORT_PORTAL_URL="${SUPPORT_PORTAL_URL:-https://hipocratiq.com}"

echo "Mobile Android validation preflight OK"
echo "Para iOS ejecutar en macOS: flutter build ios --release --no-codesign --dart-define=BACKEND_URL=..."

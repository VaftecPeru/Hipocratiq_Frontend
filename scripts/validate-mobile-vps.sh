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

for command in git docker cmp; do
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

echo "[1/7] Identidad visual Web/Mobile"
if ! cmp -s front_web/public/logo_hipogratiq_1.png front_movil/assets/branding/logo-login-web.png; then
  echo "ERROR: el logo visible en autenticación Mobile no coincide con el login Web." >&2
  exit 1
fi

test -s front_movil/assets/branding/app-icon.png || {
  echo "ERROR: falta app-icon.png del branding móvil aprobado." >&2
  exit 1
}

test -s front_movil/assets/branding/app-icon-foreground.png || {
  echo "ERROR: falta app-icon-foreground.png del branding móvil aprobado." >&2
  exit 1
}

grep -Fq 'image_path: "assets/branding/app-icon.png"' front_movil/pubspec.yaml
grep -Fq 'adaptive_icon_background: "#0B64DD"' front_movil/pubspec.yaml
grep -Fq 'adaptive_icon_foreground: "assets/branding/app-icon-foreground.png"' front_movil/pubspec.yaml
grep -Fq '<color name="hipocratiq_blue">#0B64DD</color>' front_movil/android/app/src/main/res/values/colors.xml
grep -Fq '@color/hipocratiq_blue' front_movil/android/app/src/main/res/drawable/launch_background.xml
grep -Fq '@color/hipocratiq_blue' front_movil/android/app/src/main/res/drawable-v21/launch_background.xml
grep -Fq 'red="0.0431372549" green="0.3921568627" blue="0.8666666667"' front_movil/ios/Runner/Base.lproj/LaunchScreen.storyboard

echo "[2/7] Build toolchain Flutter/Android"
docker build --pull -f front_movil/Dockerfile.android-ci -t "$IMAGE" front_movil

echo "[3/7] Dart format"
docker run --rm "$IMAGE" dart format --output=none --set-exit-if-changed lib test

echo "[4/7] Flutter analyze"
docker run --rm "$IMAGE" flutter analyze

echo "[5/7] Flutter tests"
docker run --rm "$IMAGE" flutter test

echo "[6/7] Build APK + AAB de validación"
echo "Preflight Maven/Gradle desde red del host"
docker run --rm --network host "$IMAGE" bash -lc '
  set -Eeuo pipefail
  for url in     "https://dl.google.com/dl/android/maven2/com/android/application/com.android.application.gradle.plugin/9.0.1/com.android.application.gradle.plugin-9.0.1.pom"     "https://dl.google.com/dl/android/maven2/com/android/tools/build/gradle/9.0.1/gradle-9.0.1.pom"     "https://plugins.gradle.org/m2/org/jetbrains/kotlin/android/org.jetbrains.kotlin.android.gradle.plugin/2.3.20/org.jetbrains.kotlin.android.gradle.plugin-2.3.20.pom"; do
    echo "HEAD $url"
    curl --fail --silent --show-error --location --head --retry 4 --retry-all-errors "$url" >/dev/null
  done
'

docker create --network host --name "$BUILD_CONTAINER" "$IMAGE" bash -lc '
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

echo "[7/7] Checksums"
sha256sum "$ARTIFACT_DIR/HIPOCRATIQ-validation.apk" "$ARTIFACT_DIR/HIPOCRATIQ-validation.aab"

echo "ANDROID VPS VALIDATION OK"
echo "SHA: $(git rev-parse HEAD)"
echo "APK: $ARTIFACT_DIR/HIPOCRATIQ-validation.apk"
echo "AAB: $ARTIFACT_DIR/HIPOCRATIQ-validation.aab"
echo "Evidence: $LOG_FILE"

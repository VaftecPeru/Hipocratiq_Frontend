#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/front_web"

echo "== HIPOCRATIQ Web preflight =="

npm ci --no-audit --no-fund
npm audit --omit=dev --audit-level=high
npm run typecheck
node --test tests/*.test.mjs
npm run lint
npm run build

echo "Web preflight OK"

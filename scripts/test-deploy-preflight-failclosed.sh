#!/usr/bin/env bash
# Safety-negative tests: NEVER supply a complete production approval.
# No Docker, AWS, Git fetch, migrations or real filesystem write should execute.
set -Eeuo pipefail
ROOT="$(cd "$(dirname "\${BASH_SOURCE[0]}")/.." && pwd)"
LOG="$(mktemp)"
trap 'rm -f "$LOG"' EXIT

must_refuse() {
  local label="$1"
  shift
  if "$@" >"$LOG" 2>&1; then
    echo "ERROR: unsafe deploy preflight accepted $label" >&2
    exit 1
  fi
  if ! grep -Fq "ERROR NO-GO:" "$LOG"; then
    echo "ERROR: refusal was not caused by release guard: $label" >&2
    head -n 12 "$LOG" >&2
    exit 1
  fi
  echo "NO-GO preflight passed: $label"
}

must_refuse "all-release-approval-values-absent" \
  env -u RELEASE_APPROVAL -u RELEASE_APPROVED_SHA -u RELEASE_CHANGE_ID \
      -u UAT_RESTORE_EVIDENCE -u BACKUP_AT_REST_VERIFIED -u WEB_UAT_EVIDENCE \
  bash "$ROOT/scripts/deploy-production.sh"

must_refuse "invalid-approved-SHA" \
  env RELEASE_APPROVAL=APPROVED_FOR_PRODUCTION \
      RELEASE_APPROVED_SHA=invalid \
      RELEASE_CHANGE_ID=synthetic-test \
      UAT_RESTORE_EVIDENCE=synthetic-test \
      BACKUP_AT_REST_VERIFIED=true \
      WEB_UAT_EVIDENCE=synthetic-test \
  bash "$ROOT/scripts/deploy-production.sh"

must_refuse "missing-HTTPS-Web-UAT-evidence" \
  env RELEASE_APPROVAL=APPROVED_FOR_PRODUCTION \
      RELEASE_APPROVED_SHA=0000000000000000000000000000000000000000 \
      RELEASE_CHANGE_ID=synthetic-test \
      UAT_RESTORE_EVIDENCE=synthetic-test \
      BACKUP_AT_REST_VERIFIED=true \
      WEB_UAT_EVIDENCE="" \
  bash "$ROOT/scripts/deploy-production.sh"

must_refuse "missing-database-restore-evidence" \
  env RELEASE_APPROVAL=APPROVED_FOR_PRODUCTION \
      RELEASE_APPROVED_SHA=0000000000000000000000000000000000000000 \
      RELEASE_CHANGE_ID=synthetic-test \
      UAT_RESTORE_EVIDENCE="" \
      BACKUP_AT_REST_VERIFIED=true \
      WEB_UAT_EVIDENCE=synthetic-test \
  bash "$ROOT/scripts/deploy-production.sh"

must_refuse "no-backup-encryption-attestation" \
  env RELEASE_APPROVAL=APPROVED_FOR_PRODUCTION \
      RELEASE_APPROVED_SHA=0000000000000000000000000000000000000000 \
      RELEASE_CHANGE_ID=synthetic-test \
      UAT_RESTORE_EVIDENCE=synthetic-test \
      BACKUP_AT_REST_VERIFIED=false \
      WEB_UAT_EVIDENCE=synthetic-test \
  bash "$ROOT/scripts/deploy-production.sh"

echo "FRONTEND_PRODUCTION_RELEASE_FAIL_CLOSED=PASS"

# HIPOCRATIQ Frontend — Integration maintenance

Base branch: develop. No main merge/production deployment.

## Legacy PR reconciliation

- PR #31: production npm audit gate, typecheck, lint and Next build. Compare with current CI before adapting; do not overwrite current workflow.
- PR #33: Google login/onboarding callback, actor_context and role routing. Validate with Backend #28 API contract and reject uncontrolled redirects or exposed client secret.

## Verification required

- [ ] Implement only missing functionality with regression tests.
- [ ] Run npm audit, TypeScript typecheck, lint, Next build and auth smoke tests.
- [ ] Confirm accessibility and clinical role routing and receive reviewer approval.
- [ ] Resolve clinical #92 and security #102 release evidence; RC #80 must leave draft legitimately.

Main and production remain unchanged; NO-GO gate must not be bypassed.

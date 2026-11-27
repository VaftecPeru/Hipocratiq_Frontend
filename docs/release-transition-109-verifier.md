# PR #109 — independent transition evidence prototype

This is a read-only, one-time verifier pinned to the already-reviewed PR #109 and its base. It is NOT a release policy, check publisher, merge authorization, or deployment mechanism. It cannot unblock main by itself. No AWS calls, patient data or new infrastructure.

Run unit tests: `node --test front_web/tests/verify-policy-transition-109.test.mjs`.

For real evidence, a separately authorized operator must run the independently reviewed immutable verifier from a trusted checkout/runtime, with a least-privilege read token provided via the runtime environment (never in chat, repo, logs or PR workflow). Run `node front_web/scripts/verify-policy-transition-109.mjs`. The token needs access to PRs, contents, actions, ruleset metadata and collaborator permissions; if unavailable, the verifier rejects. Metadata is not an atomic snapshot; revalidate immediately before any administrative transition. A changed candidate/base requires fresh independent review and new policy pins, never auto-update.

The existing four required checks remain mandatory. A GitHub App/control outside the candidate's authority must be designed, installed by an administrator, independently reviewed and tested on positive and negative cases before its status can be trusted. Bind the required check to the specific App, verify revocation and stale checks, and retain the old gate until an equivalent replacement is operational and authorized. This prototype never posts a status, creates credentials, changes a ruleset, authorizes a merge or accesses AWS. Do not use a candidate-controlled workflow as evidence of independent authorization. The workflow accompanying this PR runs synthetic tests only.

After a separately authorized transition, validate PR #109 exact SHA and CI, then #108 updated against main with the five pinned visual/E2E blobs, new eligible independent approval, real OTP compatibility and rollback. Global five P0 controls remain open until independently verified.

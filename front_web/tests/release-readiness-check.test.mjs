import test from "node:test";
import assert from "node:assert/strict";
import {
  FRONTEND, BACKEND,
  evaluateRelease, normalizeAwsRun, allowGitHubReadPath, collectEvidence,
} from "../scripts/release-readiness-check.mjs";

const SHA_BE = "a".repeat(40);
const SHA_FE = "b".repeat(40);
const NOW = new Date("2026-10-25T18:00:00Z");

function fixtures() {
  return {
    frontendPR: {
      state: "open", draft: false, base: { ref: "main" },
      head: { sha: SHA_FE, repo: { full_name: FRONTEND } },
    },
    backendPR: {
      state: "open", draft: false, base: { ref: "main" },
      head: { sha: SHA_BE, repo: { full_name: BACKEND } },
    },
    feMain: { protected: true },
    feDev: { protected: true, commit: { sha: SHA_FE } },
    beMain: { protected: true },
    beDev: { protected: true, commit: { sha: SHA_BE } },
    issue: { state: "closed" },
    inventory: [{
      created_at: "2026-10-25T17:00:00Z",
      head_branch: "develop", head_sha: SHA_BE,
      event: "workflow_dispatch",
      run_conclusion: "success", job_conclusion: "success", artifact_valid: true,
    }],
    now: NOW,
  };
}

test("only complete cross-repository GitHub evidence passes (not clinical GO)", () => {
  assert.deepEqual(evaluateRelease(fixtures()), []);
});

test("blocks unprotected main and develop in BOTH repositories", () => {
  const data = fixtures();
  data.feMain.protected = false;
  data.beDev.protected = false;
  const blockers = evaluateRelease(data);
  assert.ok(blockers.some(x => x.includes("Frontend main branch protection")));
  assert.ok(blockers.some(x => x.includes("Backend develop branch protection")));
});

test("blocks either release when draft, stale, closed, forked or wrong base", () => {
  const data = fixtures();
  data.frontendPR.draft = true;
  data.frontendPR.head.sha = "c".repeat(40);
  data.backendPR.state = "closed";
  data.backendPR.base.ref = "develop";
  data.backendPR.head.repo.full_name = "untrusted/fork";
  const blockers = evaluateRelease(data);
  for (const label of ["Frontend release PR is DRAFT", "Frontend release SHA differs",
    "Backend release PR must remain open", "Backend release PR must target main",
    "Backend release PR source is not approved"]) {
    assert.ok(blockers.some(x => x.includes(label)), label);
  }
});

test("blocks open P0 issue and fake/offline/skipped AWS inventory", () => {
  const data = fixtures();
  data.issue.state = "open";
  data.inventory[0].job_conclusion = "skipped";
  let blockers = evaluateRelease(data);
  assert.ok(blockers.some(x => x.includes("P0 issue")));
  assert.ok(blockers.some(x => x.includes("real AWS UAT inventory")));

  data.issue.state = "closed";
  data.inventory[0].job_conclusion = "success";
  data.inventory[0].artifact_valid = false;
  blockers = evaluateRelease(data);
  assert.ok(blockers.some(x => x.includes("real AWS UAT inventory")));

  data.inventory[0].artifact_valid = true;
  data.inventory[0].created_at = "2026-10-01T00:00:00Z";
  blockers = evaluateRelease(data);
  assert.ok(blockers.some(x => x.includes("real AWS UAT inventory")));
});

test("rejects real AWS success evidence from an older Backend develop SHA", () => {
  const data = fixtures();
  data.inventory[0].head_sha = "f".repeat(40);
  const blockers = evaluateRelease(data);
  assert.ok(blockers.some(x => x.includes("current Backend develop SHA")));
});

test("rejects AWS artifacts with missing commit SHA even if fresh", () => {
  const data = fixtures();
  delete data.inventory[0].head_sha;
  assert.ok(evaluateRelease(data).some(x => x.includes("real AWS UAT inventory")));
});

test("normalizer carries AWS inventory head_sha for release verification", () => {
  const run = {
    created_at: "2026-10-25T17:00:00Z", head_branch: "develop",
    head_sha: SHA_BE, event: "workflow_dispatch", conclusion: "success",
  };
  const jobs = [{ name: "Approved AWS UAT instance metadata ONLY", conclusion: "success" }];
  const artifacts = [{ name: "hipocratiq-uat-aws-readonly-metadata",
                       expired: false, size_in_bytes: 1024 }];
  const normalized = normalizeAwsRun(run, jobs, artifacts);
  assert.equal(normalized.head_sha, SHA_BE);
  assert.equal(normalized.artifact_valid, true);
});

test("normalizer rejects expired/empty artifacts even for SUCCESS AWS job", () => {
  const run = { created_at: "2026-10-25T17:00:00Z", head_branch: "develop", event: "push", conclusion: "success" };
  const jobs = [{ name: "Approved AWS UAT instance metadata ONLY", conclusion: "success" }];
  const art = [{ name: "hipocratiq-uat-aws-readonly-metadata", expired: true, size_in_bytes: 1200 }];
  assert.equal(normalizeAwsRun(run, jobs, art).artifact_valid, false);
  art[0].expired = false;
  art[0].size_in_bytes = 2;
  assert.equal(normalizeAwsRun(run, jobs, art).artifact_valid, false);
  art[0].size_in_bytes = 1400;
  assert.equal(normalizeAwsRun(run, jobs, art).artifact_valid, true);
});

test("GitHub API endpoint allowlist rejects external repositories and writes", () => {
  assert.equal(allowGitHubReadPath("/repos/" + FRONTEND + "/pulls/80"), true);
  assert.equal(allowGitHubReadPath("/repos/" + BACKEND + "/actions/runs/1234/jobs?per_page=100"), true);
  assert.equal(allowGitHubReadPath("/repos/" + FRONTEND + "/issues/92"), false);
  assert.equal(allowGitHubReadPath("/repos/other/repository/pulls/80"), false);
  assert.equal(allowGitHubReadPath("/repos/" + BACKEND + "/actions/runs/1234/jobs?per_page=100&foo=1"), false);
});

test("live inventory collection ignores skipped AWS despite a green offline job", async () => {
  const d = fixtures();
  const run = {
    id: 15, created_at: "2026-10-25T17:00:00Z", head_branch: "develop",
    event: "workflow_dispatch", conclusion: "success",
  };
  const requested = [];
  const fakeGet = async path => {
    requested.push(path);
    if (path.endsWith("/pulls/80")) return d.frontendPR;
    if (path.endsWith("/pulls/90")) return d.backendPR;
    if (path.endsWith("/branches/main")) return { protected: true };
    if (path.endsWith("/branches/develop")) return { protected: true, commit: { sha: SHA_FE } };
    if (path.endsWith("/issues/92")) return d.issue;
    if (path.includes("/actions/workflows/")) return { workflow_runs: [run] };
    if (path.includes("/jobs?")) return { jobs: [{ name: "Approved AWS UAT instance metadata ONLY", conclusion: "skipped" }] };
    throw new Error("Unexpected mocked endpoint " + path);
  };
  const evidence = await collectEvidence("synthetic", fakeGet);
  assert.equal(evidence.inventory.length, 1);
  assert.equal(evidence.inventory[0].artifact_valid, false);
  assert.equal(requested.some(path => path.includes("/artifacts?")), false);
});

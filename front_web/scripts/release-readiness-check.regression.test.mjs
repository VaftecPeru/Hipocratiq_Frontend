import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FRONTEND, BACKEND, allowGitHubReadPath, normalizeAwsRun, evaluateRelease,
} from './release-readiness-check.mjs';

const currentSha = 'a'.repeat(40);
const backendSha = 'b'.repeat(40);

function approvedEvidence() {
  return {
    frontendPR: {
      state: 'open', draft: false, base: { ref: 'main' },
      head: { sha: currentSha, repo: { full_name: FRONTEND } },
    },
    backendPR: {
      state: 'open', draft: false, base: { ref: 'main' },
      head: { sha: backendSha, repo: { full_name: BACKEND } },
    },
    feMain: { protected: true },
    feDev: { protected: true, commit: { sha: currentSha } },
    beMain: { protected: true },
    beDev: { protected: true, commit: { sha: backendSha } },
    issue: { state: 'closed' },
    inventory: [{
      created_at: '2026-11-23T00:00:00Z',
      head_branch: 'develop',
      head_sha: backendSha,
      event: 'workflow_dispatch',
      run_conclusion: 'success',
      job_conclusion: 'success',
      artifact_valid: true,
    }],
    now: new Date('2026-11-23T01:00:00Z'),
  };
}

test('GitHub reads allow only the reviewed routes', () => {
  assert.equal(allowGitHubReadPath('/repos/' + FRONTEND + '/pulls/80'), true);
  assert.equal(allowGitHubReadPath('/repos/' + BACKEND + '/actions/runs/123/jobs?per_page=100'), true);
  assert.equal(allowGitHubReadPath('/repos/' + BACKEND + '/actions/runs/123/artifacts?per_page=100'), true);
  assert.equal(allowGitHubReadPath('/repos/' + BACKEND + '/actions/runs/123/logs'), false);
  assert.equal(allowGitHubReadPath('/repos/' + BACKEND + '/actions/secrets'), false);
});

test('real inventory requires a successful named job and nonempty unexpired artifact', () => {
  const run = {
    created_at: '2026-11-23T00:00:00Z',
    head_branch: 'develop', head_sha: backendSha,
    event: 'workflow_dispatch', conclusion: 'success',
  };
  const job = [{ name: 'Approved AWS UAT instance metadata ONLY', conclusion: 'success' }];
  const artifact = [{ name: 'hipocratiq-uat-aws-readonly-metadata', expired: false, size_in_bytes: 101 }];
  assert.equal(normalizeAwsRun(run, job, artifact).artifact_valid, true);
  assert.equal(normalizeAwsRun(run, job, [{ ...artifact[0], expired: true }]).artifact_valid, false);
  assert.equal(normalizeAwsRun(run, job, [{ ...artifact[0], size_in_bytes: 0 }]).artifact_valid, false);
  assert.equal(normalizeAwsRun(run, [], artifact).job_conclusion, undefined);
});

test('valid minimum GitHub evidence passes only the minimum gate', () => {
  assert.deepEqual(evaluateRelease(approvedEvidence()), []);
});

test('draft releases and missing branch protection fail closed', () => {
  const evidence = approvedEvidence();
  evidence.frontendPR.draft = true;
  evidence.beMain.protected = false;
  const reasons = evaluateRelease(evidence);
  assert.ok(reasons.some(reason => reason.includes('Frontend release PR is DRAFT')));
  assert.ok(reasons.some(reason => reason.includes('Backend main branch protection')));
});

test('clinical issue must have a closed state', () => {
  const evidence = approvedEvidence();
  evidence.issue.state = 'open';
  assert.ok(evaluateRelease(evidence).some(reason => reason.includes('Clinical P0 issue #92')));
});

test('release candidates must match current develop SHA', () => {
  const evidence = approvedEvidence();
  evidence.frontendPR.head.sha = 'c'.repeat(40);
  evidence.backendPR.head.sha = 'd'.repeat(40);
  const reasons = evaluateRelease(evidence);
  assert.ok(reasons.some(reason => reason.includes('Frontend release SHA differs')));
  assert.ok(reasons.some(reason => reason.includes('Backend release SHA differs')));
});

test('synthetic, stale and wrong-SHA AWS inventories cannot satisfy release gate', () => {
  const scenarios = [
    { event: 'pull_request' },
    { run_conclusion: 'skipped' },
    { job_conclusion: 'skipped' },
    { artifact_valid: false },
    { head_sha: 'e'.repeat(40) },
    { created_at: '2026-11-01T00:00:00Z' },
  ];
  for (const change of scenarios) {
    const evidence = approvedEvidence();
    evidence.inventory[0] = { ...evidence.inventory[0], ...change };
    assert.ok(
      evaluateRelease(evidence).some(reason => reason.includes('No recent real AWS UAT inventory')),
      'expected inventory failure for ' + JSON.stringify(change),
    );
  }
});

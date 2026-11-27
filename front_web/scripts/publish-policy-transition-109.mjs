import { createSign } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { POLICY, collect, verify } from './verify-policy-transition-109.mjs';

const NAME = 'HIPOCRATIQ independent policy transition #109';
const SLUG = 'hipocratiq-release-guard-vaftec';
const OWNER = 'VaftecPeru';
const REQUIRED = { actions: 'read', administration: 'read', contents: 'read', pull_requests: 'read', checks: 'write', metadata: 'read' };

export function assertApp(app, installation, repositories, appId) {
  if (app?.id !== appId || app.slug !== SLUG || app.owner?.login !== OWNER ||
      installation?.app_id !== appId || installation?.account?.login !== OWNER ||
      installation.repository_selection !== 'selected' ||
      repositories?.total_count !== 1 || repositories?.repositories?.length !== 1 ||
      repositories.repositories[0].id !== POLICY.repoId ||
      repositories.repositories[0].full_name !== POLICY.repo) throw Error('App identity or installation scope mismatch');
  for (const [k,v] of Object.entries(REQUIRED)) {
    if (installation.permissions?.[k] !== v) throw Error('Unexpected App permissions');
  }
  if (Object.entries(installation.permissions ?? {}).some(([k,v]) => v !== 'none' && REQUIRED[k] !== v)) {
    throw Error('Unexpected extra App permissions');
  }
}

export function buildCheck(errors) {
  if (!Array.isArray(errors) || errors.length !== 0) throw Error('Independent evidence rejected');
  return { name: NAME, head_sha: POLICY.head, status: 'completed', conclusion: 'success',
    external_id: 'policy-transition-109:' + POLICY.head + ':' + POLICY.base,
    output: { title: 'Exact policy transition evidence verified',
      summary: 'Only PR #109 at the pinned head and base. Not clinical, AWS, or deployment clearance. Revalidate approval and base immediately before any ruleset transition or merge.' } };
}

async function api(path, token, method = 'GET', body) {
  if (!path.startsWith('/') || path.includes('://')) throw Error('Invalid API path');
  const r = await fetch('https://api.github.com' + path, {
    method, headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28', ...(body ? {'Content-Type':'application/json'} : {}) },
    ...(body ? {body:JSON.stringify(body)} : {}), redirect:'error', signal:AbortSignal.timeout(20000)
  });
  if (!r.ok) throw Error('GitHub request rejected: ' + r.status);
  return r.json();
}

async function main() {
  const mode = process.argv[2];
  if (!['--verify-only','--publish'].includes(mode) || process.argv.length !== 3) throw Error('Select --verify-only or --publish explicitly');
  const appId = Number(process.env.HIPOCRATIQ_APP_ID);
  const keyPath = process.env.HIPOCRATIQ_APP_KEY_FILE;
  if (!Number.isSafeInteger(appId) || appId <= 0 || !keyPath) throw Error('App ID and protected key path required');
  const key = await readFile(keyPath);
  const now = Math.floor(Date.now()/1000);
  const encode = v => Buffer.from(JSON.stringify(v)).toString('base64url');
  const unsigned = encode({alg:'RS256',typ:'JWT'}) + '.' + encode({iat:now-60,exp:now+480,iss:String(appId)});
  let jwt;
  try { jwt = unsigned + '.' + createSign('RSA-SHA256').update(unsigned).sign(key).toString('base64url'); }
  finally { key.fill(0); }
  const app = await api('/app',jwt);
  const installation = await api('/repos/' + POLICY.repo + '/installation',jwt);
  if (app.id !== appId || app.slug !== SLUG || app.owner?.login !== OWNER ||
      installation.app_id !== appId || installation.account?.login !== OWNER ||
      installation.repository_selection !== 'selected') throw Error('Unexpected App or installation');
  const issued = await api('/app/installations/' + installation.id + '/access_tokens',jwt,'POST',
    {repository_ids:[POLICY.repoId], permissions:REQUIRED});
  const token = issued.token;
  if (!token) throw Error('Installation token unavailable');
  try {
    const repositories = await api('/installation/repositories?per_page=100',token);
    assertApp(app,installation,repositories,appId);
    const errors = verify(await collect(token));
    const check = buildCheck(errors);
    if (mode === '--verify-only') { console.log('EVIDENCE_MATCH_ONLY — NO CHECK PUBLISHED'); return; }
    // Never run from a PR-controlled checkout or CI. Operator must use the independently reviewed immutable revision.
    // This script does not change the ruleset or merge. A one-time result is not a continuous authorization service.
    const result = await api('/repos/' + POLICY.repo + '/check-runs',token,'POST',check);
    if (result.app?.id !== appId || result.head_sha !== POLICY.head ||
        result.name !== NAME || result.conclusion !== 'success') throw Error('Published check identity not confirmed');
    console.log('CHECK_CONFIRMED id=' + result.id + ' app=' + appId + ' sha=' + POLICY.head);
  } finally {
    // Revoke the short-lived installation token; never log it.
    const response = await fetch('https://api.github.com/installation/token',{method:'DELETE',headers:{
      Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'
    },redirect:'error',signal:AbortSignal.timeout(15000)});
    if (response.status !== 204) throw Error('Installation token revocation not confirmed');
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => { console.error('TRANSITION_REJECTED — no authorization inferred; inspect check state independently'); process.exitCode=1; });
}

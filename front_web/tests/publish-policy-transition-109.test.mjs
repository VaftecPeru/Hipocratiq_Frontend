import test from 'node:test';
import assert from 'node:assert/strict';
import { POLICY } from '../scripts/verify-policy-transition-109.mjs';
import { assertApp, buildCheck } from '../scripts/publish-policy-transition-109.mjs';
const fixture = () => ({
  app: {id:42,slug:'hipocratiq-release-guard-vaftec',owner:{login:'VaftecPeru'}},
  installation: {app_id:42,account:{login:'VaftecPeru'},repository_selection:'selected',
    permissions:{actions:'read',administration:'read',contents:'read',pull_requests:'read',checks:'write',metadata:'read'}},
  repositories:{total_count:1,repositories:[{id:POLICY.repoId,full_name:POLICY.repo}]}
});
const check = x => assertApp(x.app,x.installation,x.repositories,42);
test('exact app and scoped repository',()=>assert.doesNotThrow(()=>check(fixture())));
for (const [name,mutate] of [
  ['wrong app',x=>x.app.id=43],['wrong owner',x=>x.app.owner.login='other'],
  ['wrong installation',x=>x.installation.app_id=43],['all repositories',x=>x.installation.repository_selection='all'],
  ['wrong repository',x=>x.repositories.repositories[0].id=1],
  ['extra repositories',x=>x.repositories.total_count=2],
  ['write contents',x=>x.installation.permissions.contents='write'],
  ['extra write privilege',x=>x.installation.permissions.deployments='write'],
  ['checks read only',x=>x.installation.permissions.checks='read'],
]) test('reject '+name,()=>{const x=fixture();mutate(x);assert.throws(()=>check(x));});
test('success payload fixed to exact transition candidate',()=>{
  const c=buildCheck([]);assert.equal(c.head_sha,POLICY.head);assert.equal(c.conclusion,'success');
  assert.match(c.external_id,new RegExp(POLICY.base));
});
test('negative or invalid evidence cannot produce success payload',()=>{
  for(const v of [['stale approval'],['wrong SHA'],null,undefined,{},false]) assert.throws(()=>buildCheck(v));
});

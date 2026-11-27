import test from 'node:test';
import assert from 'node:assert/strict';
import { POLICY } from '../scripts/verify-policy-transition-109.mjs';
import { assertApp, buildCheck, reconcileRuleset, readAdminRuleset } from '../scripts/publish-policy-transition-109.mjs';
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

const ruleFixture=()=>({id:POLICY.ruleset,name:'HIPOCRATIQ-Frontend-Protect-Main',target:'branch',
  source_type:'Repository',source:POLICY.repo,enforcement:'active',
  conditions:{ref_name:{include:['refs/heads/main'],exclude:[]}},
  rules:[{type:'deletion'},{type:'non_fast_forward'}],bypass_actors:[]});
test('uses actual administrative empty bypass list when App cannot see it',()=>{
  const a=ruleFixture(), b=ruleFixture(), c=ruleFixture();delete a.bypass_actors;
  assert.equal(reconcileRuleset(a,b,c),c);
});
for(const [name,mutate] of [
 ['missing admin bypass',x=>delete x[1].bypass_actors],
 ['nonempty admin bypass',x=>x[2].bypass_actors.push({actor_id:1})],
 ['nonempty App bypass',x=>x[0].bypass_actors.push({actor_id:1})],
 ['changed policy',x=>x[2].rules.pop()],
 ['different App policy',x=>x[0].rules.pop()],
 ['wrong scope',x=>x[0].conditions.ref_name.include=['refs/heads/develop']],
 ['inactive ruleset',x=>x[1].enforcement='disabled'],
 ['wrong repository',x=>x[0].source='other/repo']
]) test('reject '+name,()=>{const x=[ruleFixture(),ruleFixture(),ruleFixture()];mutate(x);assert.throws(()=>reconcileRuleset(...x));});
test('administrative read uses only fixed GET endpoints',async()=>{
 const paths=[];const result=await readAdminRuleset('fixture',async(...args)=>{
  assert.equal(args.length,2); const [path,token]=args; assert.equal(token,'fixture');paths.push(path);
  if(path==='/user')return {login:'VaftecPeru'};
  if(path==='/repos/'+POLICY.repo)return {id:POLICY.repoId,full_name:POLICY.repo,permissions:{admin:true}};
  return ruleFixture();
 }); assert.deepEqual(paths,['/user','/repos/'+POLICY.repo,'/repos/'+POLICY.repo+'/rulesets/'+POLICY.ruleset]);assert.deepEqual(result,ruleFixture());
});
test('reject missing or nonadmin identity',async()=>{
 await assert.rejects(readAdminRuleset('',()=>assert.fail('unexpected network')));
 await assert.rejects(readAdminRuleset('fixture',async p=>p==='/user'?{login:'VaftecPeru'}:{id:POLICY.repoId,full_name:POLICY.repo,permissions:{admin:false}}));
});

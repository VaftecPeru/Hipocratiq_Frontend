import test from 'node:test';
import assert from 'node:assert/strict';
import {POLICY as P,verify,collect} from '../scripts/verify-policy-transition-109.mjs';
const valid=()=>{
 const repo={id:P.repoId,full_name:P.repo};
 const pr={number:P.number,state:'open',draft:false,head:{sha:P.head,ref:P.branch,repo},base:{sha:P.base,ref:'main',repo},changed_files:4,user:{login:'author'}};
 const main={protected:true,commit:{sha:P.base}};
 const reviews=[{user:{login:P.reviewer},state:'APPROVED',commit_id:P.head}];
 const rules={id:P.ruleset,enforcement:'active',bypass_actors:[],rules:[{type:'non_fast_forward'},{type:'deletion'},{type:'pull_request',parameters:{required_approving_review_count:1}},{type:'required_status_checks',parameters:{strict_required_status_checks_policy:true,required_status_checks:P.required.map(context=>({context,integration_id:15368}))}}]};
 const runs=Object.entries(P.jobs).map(([path,names],i)=>({id:i+1,path,event:'pull_request',head_sha:P.head,head_branch:P.branch,status:'completed',conclusion:i===0?'failure':'success',pull_requests:[{number:P.number,head:{sha:P.head,repo},base:{sha:P.base,ref:'main',repo}}],jobs:names.map(name=>({name,status:'completed',conclusion:'success'}))}));
 return structuredClone({pr,main,files:Object.entries(P.blobs).map(([filename,sha])=>({filename,sha,status:'modified'})),reviews,permission:'write',rules,runs,finalPr:pr,finalMain:main,finalReviews:reviews});
};
test('exact reviewed policy evidence matches (not a merge approval)',()=>assert.deepEqual(verify(valid()),[]));
for(const [name,mutate] of [
 ['changed head',x=>x.pr.head.sha='x'],['base race',x=>x.finalMain.commit.sha='x'],['fork',x=>x.pr.head.repo.id=1],
 ['extra file',x=>x.files.push(x.files[0])],['changed blob',x=>x.files[0].sha='x'],['rename',x=>x.files[0].previous_filename='other'],
 ['read reviewer',x=>x.permission='read'],['stale approval',x=>x.reviews[0].commit_id='x'],['revocation',x=>x.finalReviews.push({user:{login:P.reviewer},state:'DISMISSED',commit_id:P.head})],
 ['self approval',x=>x.pr.user.login=P.reviewer],['bypass',x=>x.rules.bypass_actors.push({actor_id:1})],
 ['missing check',x=>x.rules.rules[3].parameters.required_status_checks.pop()],['untrusted check source',x=>x.rules.rules[3].parameters.required_status_checks[0].integration_id=1],
 ['skipped test',x=>x.runs[0].jobs[0].conclusion='skipped'],['wrong workflow base',x=>x.runs[1].pull_requests[0].base.sha='x'],
 ['newer pending run',x=>x.runs.push({...x.runs[1],id:999,status:'in_progress'})],['duplicate job',x=>x.runs[1].jobs.push(x.runs[1].jobs[0])],['draft',x=>x.pr.draft=true]
])test('rejects '+name,()=>{const x=valid();mutate(x);assert.ok(verify(x).length);});
test('missing token never reads network',async()=>{await assert.rejects(collect('',()=>assert.fail('unexpected request')));});
test('unavailable metadata fails closed',async()=>{await assert.rejects(collect('fixture',async()=>({ok:false,status:403})));});

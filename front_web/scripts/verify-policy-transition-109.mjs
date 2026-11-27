/** Read-only evidence verifier. NOT a required check, merge or deployment approval. */
import {pathToFileURL} from 'node:url';
export const POLICY=Object.freeze({
 repo:'VaftecPeru/Hipocratiq_Frontend', repoId:1292482252, number:109,
 head:'8029fcf9055ff9ea8bb01bbf87ec2886e46e1c18', base:'e8a25ae8b8ef6af0890a076b0042a409078d86af',
 branch:'maintenance/release-policy-login-108-20261126', reviewer:'anunciosvaftec', ruleset:25993903,
 blobs:Object.freeze({
 '.github/workflows/release-readiness.yml':'d4f47439be19946ef567a27b6aa79591cf6f922a',
 'front_web/scripts/web-only-release-gate.mjs':'49787263903e04db517c63210fe95da9d4ea5eb1',
 'front_web/tests/release-readiness-check.test.mjs':'d3b9fa4b388273e0a973903a4936e51e6fb2736a',
 'front_web/tests/web-only-release-gate.test.mjs':'c50a807b3ced476547cce8cffe6a60327182abb7'}),
 jobs:Object.freeze({
 '.github/workflows/release-readiness.yml':['Frontend release fail-closed tests'],
 '.github/workflows/ci-web.yml':['web'],
 '.github/workflows/frontend-ci-cd.yml':['Frontend CI','Frontend E2E role routing']}),
 required:Object.freeze(['Frontend CI','Frontend E2E role routing','Frontend release fail-closed tests','Frontend main release / cross-repo NO-GO (read-only)'])
});
const P=POLICY;
export function verify(e){
 const errors=[];
 const {pr,main,files,reviews,permission,rules,runs,finalPr,finalMain,finalReviews}=e??{};
 const identity=p=>p?.number===P.number&&p.state==='open'&&p.draft===false&&p.head?.sha===P.head&&p.head?.ref===P.branch&&p.head?.repo?.id===P.repoId&&p.head?.repo?.full_name===P.repo&&p.base?.sha===P.base&&p.base?.ref==='main'&&p.base?.repo?.id===P.repoId&&p.base?.repo?.full_name===P.repo&&p.changed_files===4;
 if(!identity(pr)||!identity(finalPr))errors.push('PR identity/scope changed');
 if([main,finalMain].some(m=>m?.protected!==true||m?.commit?.sha!==P.base))errors.push('main not current/protected');
 if(!Array.isArray(files)||files.length!==4||new Set(files.map(f=>f?.filename)).size!==4||files.some(f=>!Object.hasOwn(P.blobs,f?.filename)||P.blobs[f.filename]!==f.sha||f.status!=='modified'||f.previous_filename))errors.push('unexpected file inventory');
 const approved=list=>{const r=Array.isArray(list)&&list.length<100?list.filter(x=>x?.user?.login===P.reviewer&&['APPROVED','CHANGES_REQUESTED','DISMISSED'].includes(x.state)).at(-1):null;return r?.state==='APPROVED'&&r.commit_id===P.head;};
 if(!pr?.user?.login||pr.user.login===P.reviewer||!['write','maintain','admin'].includes(permission)||!approved(reviews)||!approved(finalReviews))errors.push('independent current approval missing');
 const checks=rules?.rules?.find(r=>r.type==='required_status_checks')?.parameters;
 const pull=rules?.rules?.find(r=>r.type==='pull_request')?.parameters;
 const contexts=checks?.required_status_checks;
 if(rules?.id!==P.ruleset||rules.enforcement!=='active'||!Array.isArray(rules.bypass_actors)||rules.bypass_actors.length!==0||checks?.strict_required_status_checks_policy!==true||!Array.isArray(contexts)||contexts.length!==4||P.required.some(c=>!contexts.some(x=>x.context===c&&x.integration_id===15368))||!(pull?.required_approving_review_count>=1)||!rules.rules.some(r=>r.type==='non_fast_forward')||!rules.rules.some(r=>r.type==='deletion'))errors.push('ruleset not equivalent');
 for(const [path,names] of Object.entries(P.jobs)){
  const candidates=Array.isArray(runs)?runs.filter(r=>r.path===path&&r.event==='pull_request'&&r.head_sha===P.head&&r.head_branch===P.branch&&r.pull_requests?.some(p=>p.number===P.number&&p.head?.sha===P.head&&p.head?.repo?.id===P.repoId&&p.base?.sha===P.base&&p.base?.ref==='main'&&p.base?.repo?.id===P.repoId)):[];
  const r=candidates.sort((a,b)=>b.id-a.id)[0];
  if(!r||r.status!=='completed'||(path!=='.github/workflows/release-readiness.yml'&&r.conclusion!=='success')||!Array.isArray(r.jobs)||names.some(name=>{const j=r.jobs.filter(x=>x.name===name);return j.length!==1||j[0].status!=='completed'||j[0].conclusion!=='success';}))errors.push('missing/failed exact workflow evidence: '+path);
 }
 return errors;
}
export async function collect(token,fetcher=fetch){
 if(!token)throw Error('Authorized read-only token required');
 const root='https://api.github.com/repos/'+P.repo+'/';
 const get=async path=>{const r=await fetcher(root+path,{headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},redirect:'error',signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('GitHub evidence unavailable: HTTP '+r.status);return r.json();};
 const prPath='pulls/'+P.number,reviewPath=prPath+'/reviews?per_page=100';
 const [pr,main,files,reviews,perm,rules,listing]=await Promise.all([get(prPath),get('branches/main'),get(prPath+'/files?per_page=100'),get(reviewPath),get('collaborators/'+P.reviewer+'/permission'),get('rulesets/'+P.ruleset),get('actions/runs?head_sha='+P.head+'&per_page=100')]);
 if(!Array.isArray(listing?.workflow_runs)||listing.workflow_runs.length>=100||listing.total_count!==listing.workflow_runs.length)throw Error('Incomplete workflow inventory');
 const relevant=listing.workflow_runs.filter(r=>Object.hasOwn(P.jobs,r.path)&&r.event==='pull_request');
 const runs=await Promise.all(relevant.map(async r=>{if(!Number.isSafeInteger(r.id)||r.id<=0)throw Error('Invalid run ID');const j=await get('actions/runs/'+r.id+'/jobs?per_page=100');if(!Array.isArray(j.jobs)||j.jobs.length>=100||j.total_count!==j.jobs.length)throw Error('Incomplete job inventory');return {...r,jobs:j.jobs};}));
 const [finalPr,finalMain,finalReviews]=await Promise.all([get(prPath),get('branches/main'),get(reviewPath)]);
 return {pr,main,files,reviews,permission:perm.permission,rules,runs,finalPr,finalMain,finalReviews};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{const errors=verify(await collect(process.env.GITHUB_TOKEN));console.log(errors.length?'EVIDENCE_REJECTED':'EVIDENCE_MATCH_ONLY — NOT MERGE OR DEPLOY APPROVAL');for(const e of errors)console.log(e);if(errors.length)process.exitCode=1;}
 catch{console.error('EVIDENCE_REJECTED — authorized metadata unavailable or incomplete');process.exitCode=1;}
}

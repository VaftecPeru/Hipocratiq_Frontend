import test from "node:test"; import assert from "node:assert/strict";
import {evaluateWebRelease,REPO,LOGIN_RELEASE} from "../scripts/web-only-release-gate.mjs";
const sha="a".repeat(40);
const valid=()=>({pr:{number:85,state:"open",draft:false,base:{ref:"main"},head:{sha,repo:{full_name:REPO}}},main:{protected:true},files:[{filename:"front_web/app/page.tsx",status:"modified"},{filename:".github/workflows/release-readiness.yml",status:"modified"},{filename:"scripts/deploy-production.sh",status:"modified"}],expectedHead:sha,eventNumber:85});
test("approved web candidate passes scope only",()=>assert.deepEqual(evaluateWebRelease(valid()),[]));
test("rejects draft, missing main protection and wrong SHA",()=>{const x=valid();x.pr.draft=true;x.main.protected=false;x.expectedHead="b".repeat(40);assert.equal(evaluateWebRelease(x).length,3)});
test("rejects mobile, unauthorized workflows and deletes",()=>{const x=valid();x.files.push({filename:"front_movil/pubspec.yaml",status:"modified"},{filename:".github/workflows/evil.yml",status:"modified"},{filename:"front_web/.env",status:"removed"});assert.ok(evaluateWebRelease(x).length>=3)});
test("rejects wrong PR, incomplete inventory and wrong origin",()=>{const x=valid();x.eventNumber=80;x.files=[];x.pr.head.repo.full_name="external/fork";assert.ok(evaluateWebRelease(x).length>=3)});

test("permits only approved main CI maintenance PR 87",()=>{const x=valid();x.eventNumber=87;x.pr.number=87;x.files=[{filename:".github/workflows/frontend-ci-cd.yml",status:"modified"},{filename:"front_web/scripts/web-only-release-gate.mjs",status:"modified"},{filename:"front_web/tests/web-only-release-gate.test.mjs",status:"modified"}];assert.deepEqual(evaluateWebRelease(x),[]);x.files.push({filename:"front_web/features/auth/ui/login-flow.tsx",status:"modified"});assert.ok(evaluateWebRelease(x).length>0)});

const head="b".repeat(40), base="c".repeat(40);
const login=()=>({
 pr:{number:108,state:"open",draft:false,user:{login:"release-author"},changed_files:5,
     base:{ref:"main",sha:base,repo:{full_name:REPO}},head:{sha:head,ref:LOGIN_RELEASE.branch,repo:{full_name:REPO}}},
 main:{protected:true,commit:{sha:base}},eventNumber:108,expectedHead:head,expectedBase:base,
 files:Object.entries(LOGIN_RELEASE.blobs).map(([filename,sha])=>({filename,sha,status:"modified"})),
 reviews:[{user:{login:LOGIN_RELEASE.reviewer},state:"APPROVED",commit_id:head}],
});
test("login 108 accepts exact five pinned blobs on current main and exact newly reviewed SHA",()=>assert.deepEqual(evaluateWebRelease(login()),[]));
test("login rejects changed SHA, event, branch, fork, draft or stale/unprotected main",()=>{
 for(const mutate of [x=>x.pr.head.sha=sha,x=>x.expectedHead=sha,x=>x.eventNumber=85,
  x=>x.pr.head.ref="other",x=>x.pr.head.repo.full_name="fork/repo",
  x=>x.pr.base.repo.full_name="fork/repo",x=>x.pr.base.sha=sha,x=>x.expectedBase=sha,
  x=>x.main.commit.sha=sha,x=>x.pr.draft=true,x=>x.main.protected=false]){
   const x=login();mutate(x);assert.ok(evaluateWebRelease(x).length>0);
 }
});
test("login rejects added, removed, renamed, duplicate, altered or unlisted files",()=>{
 for(const mutate of [x=>x.files.pop(),x=>x.files.push({filename:"front_web/tests/release-readiness-check.test.mjs",status:"modified"}),
  x=>x.files[0].status="removed",x=>x.files[0].status="renamed",
  x=>x.files[0].previous_filename="other",x=>x.files[0]=x.files[1],x=>x.files[0].sha=sha,
  x=>x.files[0].filename="front_web/features/auth/api/browser-auth.ts",x=>x.pr.changed_files=6]){
   const x=login();mutate(x);assert.ok(evaluateWebRelease(x).length>0);
 }
});
test("login rejects missing, stale, revoked or self approval",()=>{
 for(const mutate of [x=>x.reviews=[],x=>x.reviews[0].commit_id=LOGIN_RELEASE.originalHead,
  x=>x.reviews[0].user.login="other",x=>x.reviews.push({...x.reviews[0],state:"CHANGES_REQUESTED"}),
  x=>x.reviews.push({...x.reviews[0],state:"DISMISSED"}),x=>x.pr.user.login=LOGIN_RELEASE.reviewer,
  x=>delete x.pr.user]){
   const x=login();mutate(x);assert.ok(evaluateWebRelease(x).length>0);
 }
});

import test from "node:test"; import assert from "node:assert/strict";
import {evaluateWebRelease,REPO} from "../scripts/web-only-release-gate.mjs";
const sha="a".repeat(40);
const valid=()=>({pr:{number:85,state:"open",draft:false,base:{ref:"main"},head:{sha,repo:{full_name:REPO}}},main:{protected:true},files:[{filename:"front_web/app/page.tsx",status:"modified"},{filename:".github/workflows/release-readiness.yml",status:"modified"},{filename:"scripts/deploy-production.sh",status:"modified"}],expectedHead:sha,eventNumber:85});
test("approved web candidate passes scope only",()=>assert.deepEqual(evaluateWebRelease(valid()),[]));
test("rejects draft, missing main protection and wrong SHA",()=>{const x=valid();x.pr.draft=true;x.main.protected=false;x.expectedHead="b".repeat(40);assert.equal(evaluateWebRelease(x).length,3)});
test("rejects mobile, unauthorized workflows and deletes",()=>{const x=valid();x.files.push({filename:"front_movil/pubspec.yaml",status:"modified"},{filename:".github/workflows/evil.yml",status:"modified"},{filename:"front_web/.env",status:"removed"});assert.ok(evaluateWebRelease(x).length>=3)});
test("rejects wrong PR, incomplete inventory and wrong origin",()=>{const x=valid();x.eventNumber=80;x.files=[];x.pr.head.repo.full_name="external/fork";assert.ok(evaluateWebRelease(x).length>=3)});

test("permits only approved main CI maintenance PR 87",()=>{const x=valid();x.eventNumber=87;x.pr.number=87;x.files=[{filename:".github/workflows/frontend-ci-cd.yml",status:"modified"},{filename:"front_web/scripts/web-only-release-gate.mjs",status:"modified"},{filename:"front_web/tests/web-only-release-gate.test.mjs",status:"modified"}];assert.deepEqual(evaluateWebRelease(x),[]);x.files.push({filename:"front_web/features/auth/ui/login-flow.tsx",status:"modified"});assert.ok(evaluateWebRelease(x).length>0)});

test("fails closed on sensitive files even under an allowed web directory",()=>{
 for(const path of ["front_web/.env","front_web/.env.production","front_web/config/secrets/api.json","front_web/private/key.pem","front_web/config/client.p12","front_web/backups/clinic.sql","front_web/storage/database.dump","front_web/.git/config"]){
  const x=valid();x.files=[{filename:path,status:"added"}];
  assert.ok(evaluateWebRelease(x).some(e=>e.includes("Sensitive or backup file")),path);
 }
});
test("retains ordinary web files while blocking removal",()=>{
 const x=valid();x.files=[{filename:"front_web/components/PatientCard.tsx",status:"modified"}];
 assert.deepEqual(evaluateWebRelease(x),[]);
 x.files[0].status="removed";
 assert.ok(evaluateWebRelease(x).some(e=>e.includes("deleted file")));
});

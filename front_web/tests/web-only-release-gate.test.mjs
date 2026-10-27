import test from "node:test"; import assert from "node:assert/strict";
import {evaluateWebRelease,REPO} from "../scripts/web-only-release-gate.mjs";
const sha="a".repeat(40);
const valid=()=>({pr:{number:85,state:"open",draft:false,base:{ref:"main"},head:{sha,repo:{full_name:REPO}}},main:{protected:true},files:[{filename:"front_web/app/page.tsx",status:"modified"},{filename:".github/workflows/release-readiness.yml",status:"modified"},{filename:"scripts/deploy-production.sh",status:"modified"}],expectedHead:sha,eventNumber:85});
test("approved web candidate passes scope only",()=>assert.deepEqual(evaluateWebRelease(valid()),[]));
test("rejects draft, missing main protection and wrong SHA",()=>{const x=valid();x.pr.draft=true;x.main.protected=false;x.expectedHead="b".repeat(40);assert.equal(evaluateWebRelease(x).length,3)});
test("rejects mobile, unauthorized workflows and deletes",()=>{const x=valid();x.files.push({filename:"front_movil/pubspec.yaml",status:"modified"},{filename:".github/workflows/evil.yml",status:"modified"},{filename:"front_web/.env",status:"removed"});assert.ok(evaluateWebRelease(x).length>=3)});
test("rejects wrong PR, incomplete inventory and wrong origin",()=>{const x=valid();x.eventNumber=80;x.files=[];x.pr.head.repo.full_name="external/fork";assert.ok(evaluateWebRelease(x).length>=3)});

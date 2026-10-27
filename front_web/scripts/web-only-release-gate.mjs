/** HIPOCRATIQ web-only PR release gate. No AWS calls, clinical data, or deployment. */
import {readFile,appendFile} from "node:fs/promises";
import {pathToFileURL} from "node:url";
export const REPO="VaftecPeru/Hipocratiq_Frontend";
export const PR_NUMBER=85;
export function evaluateWebRelease({pr,main,files,expectedHead,eventNumber}){
 const errors=[];
 if(eventNumber===87 && pr?.number===87) {
   if(pr?.state!=="open" || pr?.draft!==false) errors.push("Maintenance PR #87 must be open and ready.");
   if(pr?.base?.ref!=="main" || pr?.head?.repo?.full_name!==REPO) errors.push("Invalid maintenance PR origin or target.");
   if(!/^[a-f0-9]{40}$/.test(expectedHead??"") || pr?.head?.sha!==expectedHead) errors.push("Maintenance PR head SHA mismatch.");
   if(main?.protected!==true) errors.push("Frontend main is not protected.");
   if(!Array.isArray(files) || files.length<1 || files.length>3 ||
      files.some(f=>![".github/workflows/frontend-ci-cd.yml","front_web/scripts/web-only-release-gate.mjs","front_web/tests/web-only-release-gate.test.mjs"].includes(f?.filename) || f?.status==="removed") ||
      !files.some(f=>f.filename===".github/workflows/frontend-ci-cd.yml"))
      errors.push("Maintenance PR #87 must change CI workflow and only its gate/test.");
   return errors;
 }
 if(eventNumber!==PR_NUMBER || pr?.number!==PR_NUMBER) errors.push("Unexpected release PR: expected #85.");
 if(pr?.state!=="open" || pr?.draft!==false) errors.push("Release PR #85 must be open and READY FOR REVIEW.");
 if(pr?.base?.ref!=="main" || pr?.head?.repo?.full_name!==REPO) errors.push("Unapproved release source or target.");
 if(!/^[a-f0-9]{40}$/.test(expectedHead??"") || pr?.head?.sha!==expectedHead) errors.push("Release head SHA mismatches event.");
 if(main?.protected!==true) errors.push("Frontend main branch is not protected.");
 if(!Array.isArray(files) || !files.length || files.length>=100) errors.push("Incomplete release files inventory.");
 else for(const f of files) {
   const path=f?.filename??"";
   if(!(/^(front_web\/|\.github\/workflows\/(ci-web|e2e-web|frontend-ci-cd|release-readiness|uat-https-readonly-manual)\.yml$|scripts\/(deploy-production|test-deploy-preflight-failclosed)\.sh$)/.test(path)))
      errors.push("Unexpected file outside web-only allowlist: "+path);
   if(f?.status==="removed") errors.push("Unexpected deleted file: "+path);
 }
 return errors;
}
async function githubGet(path,token){
 if(!["/repos/"+REPO+"/pulls/85","/repos/"+REPO+"/pulls/87","/repos/"+REPO+"/branches/main","/repos/"+REPO+"/pulls/85/files?per_page=100","/repos/"+REPO+"/pulls/87/files?per_page=100"].includes(path)) throw Error("Unapproved API read");
 if(!token) throw Error("Missing Github token");
 const r=await fetch("https://api.github.com"+path,{headers:{Authorization:"Bearer "+token,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"},signal:AbortSignal.timeout(15000)});
 if(!r.ok) throw Error("GitHub metadata failed: "+r.status);
 return r.json();
}
async function main(){
 const errors=[];
 try{
  if(process.env.GITHUB_REPOSITORY!==REPO || process.env.GITHUB_BASE_REF!=="main") errors.push("Incorrect workflow context.");
  const event=JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH,"utf8"));
  const number=event?.pull_request?.number;
  if(![85,87].includes(number)) throw Error("Unapproved PR number.");
  const [pr,main,files]=await Promise.all(["/repos/"+REPO+"/pulls/"+number,"/repos/"+REPO+"/branches/main","/repos/"+REPO+"/pulls/"+number+"/files?per_page=100"].map(x=>githubGet(x,process.env.GITHUB_TOKEN)));
  errors.push(...evaluateWebRelease({pr,main,files,expectedHead:event?.pull_request?.head?.sha,eventNumber:event?.pull_request?.number}));
 }catch(e){errors.push("Fail-closed: "+(e?.message??"evidence unavailable"));}
 const status=errors.length?"NO_GO":"WEB_GITHUB_SCOPE_PASS";
 console.log("HIPOCRATIQ_WEB_RELEASE="+status);
 for(const e of errors) console.log("BLOCKER: "+e);
 if(process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY,"## Web release scope gate: "+status+"\n"+errors.map(x=>"- "+x).join("\n")+"\nA passing scope gate is not deployment approval. Verify CI, backend compatibility, security and operational recovery.\n");
 if(errors.length) process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) main();

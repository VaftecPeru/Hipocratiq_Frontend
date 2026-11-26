/** HIPOCRATIQ web-only PR release gate. No AWS calls, clinical data, or deployment. */
import {readFile,appendFile} from "node:fs/promises";
import {pathToFileURL} from "node:url";
export const REPO="VaftecPeru/Hipocratiq_Frontend";
export const PR_NUMBER=85;

// Proposed policy, effective only after independent administrative review and installation.
// The original reviewed SHA is historical; after main changes, strict branch
// protection requires a new head and a new independent approval at that head.
export const LOGIN_RELEASE = Object.freeze({
 number: 108,
 originalHead: "4c2612a420e98414ce580100336f62135e14a657",
 branch: "release/login-ui-existing-otp-20261126",
 reviewer: "anunciosvaftec",
 blobs: Object.freeze({
  "front_web/app/(auth)/page.tsx": "662c1ed43e5ec0d24f819770c7377dba0812c17a",
  "front_web/app/globals.css": "27ddca4008ef43edf8ce73fb2e5c53cd7a7ff18f",
  "front_web/e2e/login-premium-motion.spec.ts": "c2dfa9b421da57a3616be2cce9784f9287f8bdb7",
  "front_web/features/auth/ui/auth-visual-panel.tsx": "6cb9cf6b03ceec4c392420ffd32c7457313067a0",
  "front_web/features/auth/ui/login-role-picker.tsx": "f7a5a1bfa148925ffc530bef72da5ef5b31af2af",
 }),
});
export function evaluateLoginRelease({pr,main,files,expectedHead,expectedBase,eventNumber,reviews}) {
 const errors=[];
 const rule=LOGIN_RELEASE;
 const names=Object.keys(rule.blobs);
 if(eventNumber!==rule.number || pr?.number!==rule.number) errors.push("Incorrect login PR.");
 if(pr?.state!=="open" || pr?.draft!==false) errors.push("Login PR must be open and ready.");
 if(pr?.base?.ref!=="main" || pr?.base?.repo?.full_name!==REPO || pr?.head?.repo?.full_name!==REPO || pr?.head?.ref!==rule.branch) errors.push("Incorrect login origin or target.");
 if(!/^[a-f0-9]{40}$/.test(expectedHead??"") || pr?.head?.sha!==expectedHead) errors.push("Login PR head does not match the event SHA.");
 if(main?.protected!==true || !/^[a-f0-9]{40}$/.test(expectedBase??"") ||
    main?.commit?.sha!==expectedBase || pr?.base?.sha!==expectedBase)
   errors.push("Frontend main must be protected and current at the event base SHA.");
 // The identical clock fix is installed with the policy; after updating the
 // candidate to main, its diff must be precisely these five visual/E2E blobs.
 // No new auth, workflows, dependency, test-clock, deleted or renamed files.
 if(pr?.changed_files!==names.length || !Array.isArray(files) || files.length!==names.length ||
    new Set(files.map(f=>f?.filename)).size!==names.length ||
    files.some(f=>!Object.hasOwn(rule.blobs,f?.filename) || f?.sha!==rule.blobs[f.filename] ||
                  f?.status!=="modified" || f?.previous_filename))
   errors.push("Login release must contain exactly the five authorized modified blobs, no rename or delete.");
 const latest=Array.isArray(reviews) && reviews.length<100
   ? reviews.filter(r=>r?.user?.login===rule.reviewer &&
       ["APPROVED","CHANGES_REQUESTED","DISMISSED"].includes(r?.state)).at(-1) : null;
 if(latest?.state!=="APPROVED" || latest?.commit_id!==expectedHead ||
    !pr?.user?.login || pr.user.login===rule.reviewer)
   errors.push("Independent approval at the exact current login SHA is required.");
 return errors;
}

export function evaluateWebRelease({pr,main,files,expectedHead,expectedBase,eventNumber,reviews}){
 if(eventNumber===LOGIN_RELEASE.number || pr?.number===LOGIN_RELEASE.number) return evaluateLoginRelease({pr,main,files,expectedHead,expectedBase,eventNumber,reviews});
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
 if(!["/repos/"+REPO+"/pulls/85","/repos/"+REPO+"/pulls/87","/repos/"+REPO+"/branches/main","/repos/"+REPO+"/pulls/85/files?per_page=100","/repos/"+REPO+"/pulls/87/files?per_page=100","/repos/"+REPO+"/pulls/108","/repos/"+REPO+"/pulls/108/files?per_page=100","/repos/"+REPO+"/pulls/108/reviews?per_page=100"].includes(path)) throw Error("Unapproved API read");
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
  if(![85,87,LOGIN_RELEASE.number].includes(number)) throw Error("Unapproved PR number.");
  const [pr,main,files]=await Promise.all(["/repos/"+REPO+"/pulls/"+number,"/repos/"+REPO+"/branches/main","/repos/"+REPO+"/pulls/"+number+"/files?per_page=100"].map(x=>githubGet(x,process.env.GITHUB_TOKEN)));
  const reviews=number===LOGIN_RELEASE.number ? await githubGet("/repos/"+REPO+"/pulls/108/reviews?per_page=100",process.env.GITHUB_TOKEN) : undefined;
  errors.push(...evaluateWebRelease({pr,main,files,reviews,expectedHead:event?.pull_request?.head?.sha,expectedBase:event?.pull_request?.base?.sha,eventNumber:event?.pull_request?.number}));
 }catch(e){errors.push("Fail-closed: "+(e?.message??"evidence unavailable"));}
 const status=errors.length?"NO_GO":"WEB_GITHUB_SCOPE_PASS";
 console.log("HIPOCRATIQ_WEB_RELEASE="+status);
 for(const e of errors) console.log("BLOCKER: "+e);
 if(process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY,"## Web release scope gate: "+status+"\n"+errors.map(x=>"- "+x).join("\n")+"\nA passing scope gate is not deployment approval. Verify CI, backend compatibility, security and operational recovery.\n");
 if(errors.length) process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) main();

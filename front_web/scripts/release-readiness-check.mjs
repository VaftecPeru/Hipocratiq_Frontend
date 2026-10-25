/**
 * Release safety gate for the Frontend main PR.
 * READ-ONLY GitHub metadata; never accesses AWS or clinical information.
 * Passing means minimum GitHub evidence, NOT clinical GO or deployment permission.
 */
import { readFile, appendFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const FRONTEND = "VaftecPeru/Hipocratiq_Frontend";
export const BACKEND = "VaftecPeru/Hipocratiq_backend";
export const FRONTEND_RC = 80;
export const BACKEND_RC = 90;
export const P0_ISSUE = 92;
const AWS_JOB = "Approved AWS UAT instance metadata ONLY";
const AWS_ARTIFACT = "hipocratiq-uat-aws-readonly-metadata";
const AGE_MS = 7 * 24 * 60 * 60 * 1000;

const staticPaths = new Set([
  "/repos/" + FRONTEND + "/pulls/" + FRONTEND_RC,
  "/repos/" + FRONTEND + "/branches/main",
  "/repos/" + FRONTEND + "/branches/develop",
  "/repos/" + BACKEND + "/pulls/" + BACKEND_RC,
  "/repos/" + BACKEND + "/branches/main",
  "/repos/" + BACKEND + "/branches/develop",
  "/repos/" + BACKEND + "/issues/" + P0_ISSUE,
  "/repos/" + BACKEND + "/actions/workflows/uat-aws-readonly-inventory.yml/runs?branch=develop&per_page=20",
]);

export function allowGitHubReadPath(path) {
  return staticPaths.has(path) ||
    /^\/repos\/VaftecPeru\/Hipocratiq_backend\/actions\/runs\/[0-9]+\/(jobs|artifacts)\?per_page=100$/.test(path);
}

export function normalizeAwsRun(run, jobs, artifacts) {
  const active = jobs.find(x => x?.name === AWS_JOB);
  return {
    created_at: run?.created_at,
    head_branch: run?.head_branch,
    event: run?.event,
    run_conclusion: run?.conclusion,
    job_conclusion: active?.conclusion,
    artifact_valid: artifacts.some(a =>
      a?.name === AWS_ARTIFACT && a.expired === false &&
      Number.isInteger(a.size_in_bytes) && a.size_in_bytes > 100),
  };
}

export function evaluateRelease({ frontendPR, backendPR, feMain, feDev, beMain, beDev, issue, inventory, now = new Date() }) {
  const failures = [];
  for (const [name, branch] of [
    ["Frontend main", feMain], ["Frontend develop", feDev],
    ["Backend main", beMain], ["Backend develop", beDev],
  ]) {
    if (branch?.protected !== true) failures.push(name + " branch protection is not enabled.");
  }

  for (const [name, pr, repo, expectedSha] of [
    ["Frontend", frontendPR, FRONTEND, feDev?.commit?.sha],
    ["Backend", backendPR, BACKEND, beDev?.commit?.sha],
  ]) {
    if (pr?.state !== "open") failures.push(name + " release PR must remain open.");
    if (pr?.draft !== false) failures.push(name + " release PR is DRAFT.");
    if (pr?.base?.ref !== "main") failures.push(name + " release PR must target main.");
    if (pr?.head?.repo?.full_name !== repo) failures.push(name + " release PR source is not approved.");
    if (!expectedSha || pr?.head?.sha !== expectedSha) failures.push(name + " release SHA differs from develop.");
  }
  if (issue?.state !== "closed") failures.push("Clinical P0 issue #92 must be resolved and closed with evidence.");

  const nowMs = new Date(now).getTime();
  const hasRealInventory = inventory.some(run => {
    const age = nowMs - Date.parse(run.created_at ?? "");
    return Number.isFinite(age) && age >= 0 && age <= AGE_MS &&
      run.head_branch === "develop" &&
      ["push", "workflow_dispatch"].includes(run.event) &&
      run.run_conclusion === "success" && run.job_conclusion === "success" &&
      run.artifact_valid === true;
  });
  if (!hasRealInventory) {
    failures.push("No recent real AWS UAT inventory: job SUCCESS and non-empty retained artifact required (not SKIPPED).");
  }
  return failures;
}

async function githubGet(path, token) {
  if (!allowGitHubReadPath(path)) throw new Error("Unapproved GitHub read path.");
  if (!token) throw new Error("Read-only GitHub token is unavailable.");
  const res = await fetch("https://api.github.com" + path, {
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "HIPOCRATIQ-Frontend-Main-Readiness",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error("GitHub evidence unavailable (HTTP " + res.status + ").");
  return res.json();
}

export async function collectEvidence(token, get = githubGet) {
  const fe = "/repos/" + FRONTEND;
  const be = "/repos/" + BACKEND;
  const [frontendPR, backendPR, feMain, feDev, beMain, beDev, issue, raw] = await Promise.all([
    get(fe + "/pulls/" + FRONTEND_RC, token),
    get(be + "/pulls/" + BACKEND_RC, token),
    get(fe + "/branches/main", token),
    get(fe + "/branches/develop", token),
    get(be + "/branches/main", token),
    get(be + "/branches/develop", token),
    get(be + "/issues/" + P0_ISSUE, token),
    get(be + "/actions/workflows/uat-aws-readonly-inventory.yml/runs?branch=develop&per_page=20", token),
  ]);
  const inventory = [];
  for (const run of raw?.workflow_runs ?? []) {
    if (!["push", "workflow_dispatch"].includes(run?.event) ||
        !Number.isInteger(run.id)) continue;
    const jobs = (await get(be + "/actions/runs/" + run.id + "/jobs?per_page=100", token)).jobs ?? [];
    const awsSucceeded = jobs.some(job => job.name === AWS_JOB && job.conclusion === "success");
    const artifacts = awsSucceeded
      ? (await get(be + "/actions/runs/" + run.id + "/artifacts?per_page=100", token)).artifacts ?? []
      : [];
    inventory.push(normalizeAwsRun(run, jobs, artifacts));
    if (inventory.at(-1).artifact_valid && awsSucceeded) break;
  }
  return { frontendPR, backendPR, feMain, feDev, beMain, beDev, issue, inventory };
}

async function run() {
  const errors = [];
  if (process.env.GITHUB_REPOSITORY !== FRONTEND) errors.push("Unexpected repository.");
  if (process.env.GITHUB_BASE_REF !== "main") errors.push("Not a main pull request.");

  try {
    const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH ?? "", "utf8"));
    if (event?.pull_request?.number !== FRONTEND_RC) {
      errors.push("This must be the approved Frontend release candidate PR #80.");
    }
    if (!errors.length) {
      errors.push(...evaluateRelease(await collectEvidence(process.env.GITHUB_TOKEN)));
    }
  } catch {
    errors.push("Live GitHub release evidence could not be verified (fail-closed).");
  }
  const result = errors.length ? "NO_GO" : "MINIMUM_GITHUB_EVIDENCE_PASS";
  console.log("HIPOCRATIQ_FRONTEND_RELEASE=" + result);
  for (const reason of errors) console.log("BLOCKER: " + reason);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(
      process.env.GITHUB_STEP_SUMMARY,
      "## Frontend release gate\n\n**" + result + "**\n\n" +
      errors.map(x => "- " + x).join("\n") +
      "\n\nNo clinical GO, patient data, AWS calls or deployment authorized.\n",
    );
  }
  if (errors.length) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run();
}

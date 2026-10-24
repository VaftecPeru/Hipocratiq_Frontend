/**
 * Fail-closed allowlist for manual HTTPS UAT checks.
 * This module makes no network requests and must succeed before any external fetch.
 */
import { pathToFileURL } from "node:url";
import { validateUatUrl } from "./uat-https-readonly.mjs";

export function verifyApprovedUatTargets({
  requestedWeb,
  requestedApi,
  approvedWeb,
  approvedApi,
}) {
  if (![approvedWeb, approvedApi].every(value => typeof value === "string" && value.trim())) {
    throw new Error("UAT GitHub repository variables have not been approved/configured.");
  }

  const selectedWeb = validateUatUrl(requestedWeb, "web");
  const selectedApi = validateUatUrl(requestedApi, "api");
  const allowWeb = validateUatUrl(approvedWeb, "web");
  const allowApi = validateUatUrl(approvedApi, "api");

  if (selectedWeb.href !== allowWeb.href || selectedApi.href !== allowApi.href) {
    throw new Error("Requested UAT URLs are not identical to the approved GitHub allowlist.");
  }

  return { web: selectedWeb.href, api: selectedApi.href };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    verifyApprovedUatTargets({
      requestedWeb: process.env.UAT_WEB_URL,
      requestedApi: process.env.UAT_API_URL,
      approvedWeb: process.env.APPROVED_UAT_WEB_URL,
      approvedApi: process.env.APPROVED_UAT_API_URL,
    });
    console.log("APPROVED_UAT_TARGETS=PASS (no network requests)");
  } catch (error) {
    console.error("APPROVED_UAT_TARGETS=FAIL: " + error.message);
    process.exitCode = 1;
  }
}

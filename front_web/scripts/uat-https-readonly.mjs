/**
 * Read-only HTTP/TLS release preflight for an independently approved UAT site.
 * Never authenticates, provisions AWS, registers clinics, or sends OTP messages.
 */
import { pathToFileURL } from "node:url";

export function validateUatUrl(value, kind) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("UAT URL is missing.");
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Invalid UAT URL.");
  }

  if (url.protocol !== "https:" || url.username || url.password ||
      url.search || url.hash || (url.port && url.port !== "443")) {
    throw new Error("UAT URL must be plain HTTPS with no credentials, query or fragment.");
  }

  const hostname = url.hostname.toLowerCase();
  if (!hostname.includes(".") ||
      !/(^|[.-])(uat|qa|staging)([.-]|$)/.test(hostname) ||
      /\.(localhost|local|internal|invalid|test)$/.test(hostname) ||
      hostname === "hipocratiq.com" ||
      hostname === "www.hipocratiq.com" ||
      hostname === "api.hipocratiq.com") {
    throw new Error("UAT URL must use a public uat/qa/staging hostname, never production.");
  }

  if (kind === "web" && url.pathname !== "/") {
    throw new Error("Web UAT URL must point to the origin root.");
  }

  if (kind === "api" && !/^\/(?:backend\/?)?$/.test(url.pathname)) {
    throw new Error("Backend UAT URL must point to the API origin or /backend.");
  }

  if (kind !== "web" && kind !== "api") {
    throw new Error("Unknown UAT URL type.");
  }

  return url;
}

async function fetchUat(url, options = {}) {
  return fetch(url, {
    ...options,
    redirect: "manual",
    signal: AbortSignal.timeout(12000),
  });
}

function requireStatus(response, expected, label) {
  if (response.status !== expected) {
    throw new Error(label + ": expected HTTP " + expected + ", got " + response.status);
  }
  console.log(label + ": HTTP " + expected + " PASS");
}

async function assertHealthyJson(response, label, requireDependencies = false) {
  requireStatus(response, 200, label);
  const payload = await response.json();
  if (payload?.success !== true || payload?.data?.status !== "ok") {
    throw new Error(label + ": invalid health response");
  }
  if (requireDependencies) {
    for (const service of ["database", "redis", "storage"]) {
      if (payload?.data?.dependencies?.[service] !== "ok") {
        throw new Error(label + ": " + service + " is not ready");
      }
    }
  }
}

async function run() {
  const frontend = validateUatUrl(process.env.UAT_WEB_URL, "web");
  const backend = validateUatUrl(process.env.UAT_API_URL, "api");
  const apiBase = backend.origin + backend.pathname.replace(/\/$/, "");
  console.log("Running UAT read-only gate: TLS, anonymous access, CORS and health");

  const page = await fetchUat(frontend.href);
  if (page.status >= 300 && page.status < 400) {
    const location = page.headers.get("location");
    if (!location || new URL(location, frontend.href).origin !== frontend.origin) {
      throw new Error("UAT Web redirects outside the approved Web origin");
    }
  } else {
    requireStatus(page, 200, "Web homepage");
  }
  console.log("Web homepage or same-origin redirect: PASS");

  await assertHealthyJson(
    await fetchUat(apiBase + "/api/health/live", {
      headers: { Accept: "application/json" },
    }),
    "API liveness",
  );
  await assertHealthyJson(
    await fetchUat(apiBase + "/api/health/ready", {
      headers: { Accept: "application/json" },
    }),
    "API PostgreSQL Redis storage readiness",
    true,
  );

  for (const path of ["/api/v1/auth/me", "/api/v1/fhir/Patient/1"]) {
    const response = await fetchUat(apiBase + path, {
      headers: { Accept: "application/json" },
    });
    requireStatus(response, 401, "Anonymous " + path);
    const json = await response.json();
    if (json?.code !== "UNAUTHENTICATED") {
      throw new Error("Anonymous access did not yield UNAUTHENTICATED");
    }
  }

  const preflightHeaders = {
    Origin: frontend.origin,
    "Access-Control-Request-Method": "POST",
    "Access-Control-Request-Headers": "Content-Type",
  };
  const allowed = await fetchUat(apiBase + "/api/v1/auth/otp/request", {
    method: "OPTIONS",
    headers: preflightHeaders,
  });
  if (allowed.status < 200 || allowed.status > 299 ||
      allowed.headers.get("access-control-allow-origin") !== frontend.origin ||
      allowed.headers.get("access-control-allow-credentials") !== "true") {
    throw new Error("Frontend HTTPS origin was not granted credentialed CORS access");
  }
  console.log("Credentialed CORS allowed for UAT Web origin: PASS");

  const denied = await fetchUat(apiBase + "/api/v1/auth/otp/request", {
    method: "OPTIONS",
    headers: {
      ...preflightHeaders,
      Origin: "https://unauthorized-origin.invalid",
    },
  });
  if (denied.headers.has("access-control-allow-origin")) {
    throw new Error("API unexpectedly allows an untrusted origin");
  }
  console.log("Untrusted CORS origin denied: PASS");
  console.log("UAT_HTTPS_READONLY_GATE=PASS");
  console.log("This check does NOT certify SMS OTP, authenticated tenant access or clinical E2E.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((error) => {
    console.error("UAT_HTTPS_READONLY_GATE=FAIL: " + error.message);
    process.exitCode = 1;
  });
}

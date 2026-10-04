import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

// Exercise the production modules; only framework I/O is replaced.
function loadSource(path, dependencies = {}) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const loadedModule = { exports: {} };
  runInNewContext(output, {
    exports: loadedModule.exports,
    module: loadedModule,
    require(name) {
      if (name in dependencies) return dependencies[name];
      throw new Error(`Unmocked dependency: ${name}`);
    },
    AbortSignal,
    setTimeout,
    fetch: dependencies.fetch,
  }, { filename: path });
  return loadedModule.exports;
}

const paths = loadSource("features/auth/lib/dashboard-path.ts");
function session(actor_context, clinic = { id: 10, name: "Clínica de prueba" }) {
  return { actor_context, client_type: "web", user: { id: 1, name: "Usuario", clinic, doctor: actor_context === "doctor" ? { practice_type: "independent" } : null } };
}

class Redirect extends Error {
  constructor(path) {
    super(`Redirect: ${path}`);
    this.path = path;
  }
}

function sessionModule(value) {
  return loadSource("features/auth/api/server-session.ts", {
    react: { cache: (fn) => fn },
    "next/headers": { cookies: async () => ({ toString: () => value ? "session=test" : "" }) },
    "next/navigation": { redirect: (path) => { throw new Redirect(path); } },
    "@/shared/config/server-env": { serverEnv: { backendUrl: "http://backend.test", appUrl: "http://frontend.test" } },
    "@/features/auth/lib/dashboard-path": paths,
    fetch: async () => new Response(JSON.stringify({ success: true, data: value })),
  });
}

for (const [role, destination] of Object.entries({
  staff: "/dashboard", clinic_admin: "/clinic/dashboard", receptionist: "/clinic/dashboard",
  doctor: "/doctor/dashboard", patient: "/patient/dashboard",
})) {
  test(`${role} keeps its dashboard`, () => {
    assert.equal(paths.dashboardPathForSession(session(role)), destination);
  });
}

test("an unknown context does not default to the platform dashboard", () => {
  assert.equal(paths.dashboardPathForActorContext("unknown"), "/unauthorized");
});

for (const role of ["clinic_admin", "receptionist"]) {
  test(`${role} without a resolved clinic goes directly to recovery`, () => {
    assert.equal(paths.dashboardPathForSession(session(role, null)), "/unauthorized?reason=clinic-context-required");
  });
  test(`${role} cannot enter clinic modules without a resolved clinic`, async () => {
    const api = sessionModule(session(role, null));
    await assert.rejects(api.requireClinicRoles(["clinic_admin", "receptionist"]), {
      path: "/unauthorized?reason=clinic-context-required",
    });
  });
  test(`${role} retains access to permitted clinic modules`, async () => {
    const api = sessionModule(session(role));
    assert.equal((await api.requireClinicRoles([role])).actor_context, role);
  });
}

test("anonymous requests go to login without a dashboard hop", async () => {
  await assert.rejects(sessionModule(null).requireClinicRole("clinic_admin"), { path: "/" });
});

test("reception cannot open an administrator-only clinic module", async () => {
  await assert.rejects(sessionModule(session("receptionist")).requireClinicRole("clinic_admin"), { path: "/unauthorized" });
});

for (const [role, destination] of [["doctor", "/doctor/dashboard"], ["patient", "/patient/dashboard"], ["staff", "/dashboard"]]) {
  test(`${role} entering a clinic module returns to its own dashboard`, async () => {
    await assert.rejects(sessionModule(session(role)).requireClinicRole("clinic_admin"), { path: destination });
  });
}

async function recoveryPage(value) {
  const page = loadSource("app/unauthorized/page.tsx", {
    "react/jsx-runtime": { jsx: (type, props) => ({ type, props }) },
    "lucide-react": { LockKeyhole: "lock" },
    "@/shared/ui/status-page": { StatusPage: "StatusPage" },
    "next-intl/server": { getTranslations: async () => (key) => key },
    "@/features/auth/api/server-session": { getAuthenticatedSession: async () => value },
    "@/features/auth/lib/dashboard-path": paths,
    "@/features/auth/ui/logout-button": { LogoutButton: "LogoutButton" },
  });
  return (await page.default()).props;
}

for (const role of ["clinic_admin", "receptionist"]) {
  test(`${role} recovery offers logout and no link back into the missing context`, async () => {
    const props = await recoveryPage(session(role, null));
    assert.equal(props.primaryHref, undefined);
    assert.equal(props.secondaryHref, undefined);
    assert.equal(props.detail, "clinicContextDetail");
    assert.equal(props.recoveryAction.type, "LogoutButton");
  });
}

test("patient recovery links to the patient dashboard", async () => {
  const props = await recoveryPage(session("patient", null));
  assert.equal(props.secondaryHref, "/patient/dashboard");
  assert.equal(props.detail, undefined);
});

test("anonymous recovery offers login and no authenticated dashboard", async () => {
  const props = await recoveryPage(null);
  assert.equal(props.primaryHref, "/");
  assert.equal(props.secondaryHref, undefined);
  assert.equal(props.recoveryAction, undefined);
});

for (const locale of ["es", "en"]) {
  test(`clinic recovery has ${locale} guidance`, () => {
    const messages = JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), "utf8"));
    assert.ok(messages.status.unauthorized.clinicContextDetail.length > 30);
  });
}


test("a doctor without a profile goes directly to recovery", async () => {
  const value = session("doctor");
  value.user.doctor = null;
  assert.equal(paths.dashboardPathForSession(value), "/unauthorized?reason=doctor-profile-required");
  const props = await recoveryPage(value);
  assert.equal(props.secondaryHref, undefined);
  assert.equal(props.detail, "accountContextDetail");
  assert.equal(props.recoveryAction.type, "LogoutButton");
});

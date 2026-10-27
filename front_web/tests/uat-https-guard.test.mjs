import assert from "node:assert/strict";
import test from "node:test";
import { validateUatUrl } from "../scripts/uat-https-readonly.mjs";

test("accepts explicit Web and API UAT HTTPS origins without credentials", () => {
  const web = validateUatUrl("https://uat.hipocratiq.com", "web");
  const backend = validateUatUrl("https://api-uat.hipocratiq.com/backend", "api");
  assert.equal(web.origin, "https://uat.hipocratiq.com");
  assert.equal(backend.pathname, "/backend");
});

test("rejects production, localhost, example-invalid and plain HTTP URLs", () => {
  for (const value of [
    "https://hipocratiq.com",
    "https://www.hipocratiq.com",
    "https://api.hipocratiq.com/backend",
    "http://uat.hipocratiq.com",
    "https://localhost",
    "https://qa.internal",
    "https://uat.example.invalid",
    "https://localhost-uat.invalid",
  ]) {
    assert.throws(() => validateUatUrl(value, "api"), undefined, value);
  }
});

test("rejects URL credentials, query parameters, fragments and nonstandard ports", () => {
  for (const value of [
    "https://admin:password@uat.hipocratiq.com",
    "https://uat.hipocratiq.com?token=secret",
    "https://uat.hipocratiq.com/#anchor",
    "https://uat.hipocratiq.com:8443",
  ]) {
    assert.throws(() => validateUatUrl(value, "web"), undefined, value);
  }
});

test("refuses user-selected routes outside the UAT root and optional API prefix", () => {
  assert.throws(() => validateUatUrl("https://uat.hipocratiq.com/patient/history", "web"));
  assert.throws(() => validateUatUrl("https://api-uat.hipocratiq.com/admin", "api"));
  assert.throws(() => validateUatUrl("https://uat.hipocratiq.com", "unknown"));
});

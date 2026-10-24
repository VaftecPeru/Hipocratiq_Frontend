import assert from "node:assert/strict";
import test from "node:test";
import { verifyApprovedUatTargets } from "../scripts/verify-approved-uat-targets.mjs";

const approved = Object.freeze({
  approvedWeb: "https://uat.hipocratiq.com/",
  approvedApi: "https://api-uat.hipocratiq.com/backend",
  requestedWeb: "https://uat.hipocratiq.com/",
  requestedApi: "https://api-uat.hipocratiq.com/backend",
});

test("allows only an exact approved pair of Web/API HTTPS UAT URLs", () => {
  assert.deepEqual(verifyApprovedUatTargets(approved), {
    web: approved.approvedWeb,
    api: approved.approvedApi,
  });
});

test("blocks external UAT calls before approval variables have been configured", () => {
  assert.throws(() => verifyApprovedUatTargets({ ...approved, approvedWeb: "" }), /not been approved/);
  assert.throws(() => verifyApprovedUatTargets({ ...approved, approvedApi: undefined }), /not been approved/);
});

test("blocks arbitrary QA hostnames despite a valid staging label", () => {
  assert.throws(() => verifyApprovedUatTargets({
    ...approved, requestedWeb: "https://qa.attacker.example",
  }), /not identical/);
  assert.throws(() => verifyApprovedUatTargets({
    ...approved, requestedApi: "https://api-staging.attacker.example/backend",
  }), /not identical/);
});

test("blocks production and URL credentials, even if configured in the allowlist", () => {
  assert.throws(() => verifyApprovedUatTargets({
    ...approved, requestedWeb: "https://hipocratiq.com", approvedWeb: "https://hipocratiq.com",
  }), /UAT URL must/);
  assert.throws(() => verifyApprovedUatTargets({
    ...approved, approvedApi: "https://token:secret@api-uat.hipocratiq.com/backend",
  }), /plain HTTPS/);
});

test("normalizes HTTPS default port without weakening exact hostname checking", () => {
  const result = verifyApprovedUatTargets({
    ...approved, requestedWeb: "https://uat.hipocratiq.com:443",
  });
  assert.equal(result.web, "https://uat.hipocratiq.com/");
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const api = readFileSync(
  new URL("../features/clinics/api/browser-clinic-dashboard.ts", import.meta.url),
  "utf8",
);
const patients = readFileSync(
  new URL("../features/clinics/ui/clinic-patients.tsx", import.meta.url),
  "utf8",
);
const registration = readFileSync(
  new URL("../features/clinics/ui/receptionist-patient-registration.tsx", import.meta.url),
  "utf8",
);

test("clinic patient write payloads do not delegate WhatsApp consent", () => {
  const createPayload = api.match(/export type CreateClinicPatientPayload = \{([\s\S]*?)\n\};/)?.[1] ?? "";
  const updatePayload = api.match(/export type UpdateClinicPatientPayload = \{([\s\S]*?)\n\};/)?.[1] ?? "";
  const createFunction = api.match(/export async function createClinicPatient[\s\S]*?return mapPatient\(response\.data\);\n\}/)?.[0] ?? "";
  const updateFunction = api.match(/export async function updateClinicPatient[\s\S]*?return mapPatient\(response\.data\);\n\}/)?.[0] ?? "";

  assert.doesNotMatch(createPayload, /whatsappConsent/);
  assert.doesNotMatch(updatePayload, /whatsappConsent/);
  assert.doesNotMatch(createFunction, /whatsapp_consent/);
  assert.doesNotMatch(updateFunction, /whatsapp_consent/);
});

test("clinic and reception UIs explain patient-owned versioned consent", () => {
  assert.doesNotMatch(patients, /Autoriza mensajes por WhatsApp/);
  assert.doesNotMatch(registration, /Autoriza mensajes por WhatsApp/);
  assert.match(patients, /El personal de clínica no puede otorgarlos en su nombre/);
  assert.match(registration, /los administra el paciente desde su portal/);
});

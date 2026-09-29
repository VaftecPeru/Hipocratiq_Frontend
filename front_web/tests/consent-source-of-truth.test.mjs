import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const patientPortal = readFileSync(
  new URL("../features/patients/ui/patient-portal.tsx", import.meta.url),
  "utf8",
);
const patientApi = readFileSync(
  new URL("../features/patients/api/patient-portal.ts", import.meta.url),
  "utf8",
);
const doctorPatients = readFileSync(
  new URL("../app/(doctor)/doctor/pacientes/page.tsx", import.meta.url),
  "utf8",
);
const doctorApi = readFileSync(
  new URL("../features/doctors/api/doctor-clinical.ts", import.meta.url),
  "utf8",
);

test("WhatsApp consent is exposed through the versioned consent scope", () => {
  assert.match(patientPortal, /scope: "whatsapp_notifications"/);
  assert.match(patientPortal, /Notificaciones por WhatsApp/);
});

test("profile and doctor demographic payloads cannot mutate legacy WhatsApp consent", () => {
  const patientPayload = patientApi.match(/export type PatientProfileUpdatePayload = \{([\s\S]*?)\n\};/)?.[1] ?? "";
  const doctorPayload = doctorApi.match(/export type DoctorPatientPayload = \{([\s\S]*?)\n\};/)?.[1] ?? "";

  assert.doesNotMatch(patientPayload, /whatsapp_consent/);
  assert.doesNotMatch(doctorPayload, /whatsapp_consent/);
  assert.doesNotMatch(doctorPatients, /form\.whatsapp_consent/);
  assert.match(doctorPatients, /El médico no puede otorgarlos en su nombre/);
});

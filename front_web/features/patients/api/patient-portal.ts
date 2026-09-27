import { ApiError, getFromApi, patchToApi, postToApi } from "@/shared/api/http-client";

export type PatientPortalView =
  | "dashboard"
  | "appointments"
  | "triage"
  | "results"
  | "history"
  | "prescriptions"
  | "epidemiology"
  | "membership"
  | "profile";

export type PatientProfile = {
  id: number;
  patientCode: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  countryCode: string | null;
  status: string | null;
  documentType: string | null;
  documentNumber: string | null;
  dateOfBirth: string | null;
  sex: string | null;
  address: string | null;
  emergencyContact: string | null;
  insurance: string | null;
  whatsappConsent: boolean;
  createdAt: string | null;
  clinic: { id: number; name: string } | null;
};

export type PatientClinicalCoding = {
  category: "diagnosis" | "problem" | "symptom" | "allergy" | "observation" | "procedure" | "medication";
  system: string;
  code: string;
  display: string;
  status: string | null;
};

export type PatientConsentScope =
  | "clinical_care"
  | "data_processing"
  | "whatsapp_notifications"
  | "telemedicine"
  | "ai_clinical_assistance"
  | "epidemiology_anonymized";

export type PatientConsent = {
  id: number;
  scope: PatientConsentScope;
  policyVersion: string;
  status: "granted" | "revoked" | "expired";
  source: string;
  effectiveFrom: string | null;
  effectiveUntil: string | null;
  revokedAt: string | null;
  createdAt: string | null;
};

export type PatientAppointment = {
  id: number;
  scheduledAt: string | null;
  appointmentType: string;
  status: string;
  statusLabel: string;
  notes: string | null;
  clinic: { id: number; name: string } | null;
  doctor: { id: number; name: string; specialty: string | null; medicalLicense: string | null } | null;
};

export type PatientConsultation = {
  id: number;
  appointmentId: number | null;
  status: string;
  statusLabel: string;
  chiefComplaint: string;
  objective: string | null;
  doctor: { id: number; name: string; specialty: string | null } | null;
  clinic: { id: number; name: string } | null;
  completedAt: string | null;
  signedAt: string | null;
  createdAt: string | null;
  clinicalHistory: {
    id: number;
    source: string;
    objective: string | null;
    sections: Record<string, unknown>;
  } | null;
  codings: PatientClinicalCoding[];
};

export type PatientPrescription = {
  id: number;
  medication: string;
  dosage: string | null;
  frequency: string | null;
  durationDays: number | null;
  status: string;
  statusLabel: string;
  issuedAt: string | null;
  expiresAt: string | null;
  notes: string | null;
  consultationId: number | null;
  doctor: { id: number; name: string; specialty: string | null } | null;
  clinic: { id: number; name: string } | null;
};

export type PatientLaboratoryResult = {
  id: number;
  studyName: string;
  status: string;
  statusLabel: string;
  priority: string;
  orderedAt: string | null;
  resultAt: string | null;
  resultAvailable: boolean;
  resultSummary: string | null;
  notes: string | null;
  consultationId: number | null;
  doctor: { id: number; name: string; specialty: string | null } | null;
  clinic: { id: number; name: string } | null;
};

export type PatientTriage = {
  id: number;
  reason: string;
  temperatureC: number | null;
  systolicBp: number | null;
  diastolicBp: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  oxygenSaturation: number | null;
  triagePriority: "routine" | "urgent" | "emergency" | null;
  triageNotes: string | null;
  recordedAt: string | null;
  clinic: { id: number; name: string } | null;
  recordedBy: { id: number; name: string } | null;
};

export type PatientUnavailableData = {
  available: false;
  message: string;
};

export type PatientProfileUpdatePayload = {
  name?: string;
  email?: string | null;
  phone_number?: string;
  country_code?: string;
  document_type?: string | null;
  document_number?: string | null;
  date_of_birth?: string | null;
  sex?: string | null;
  address?: string | null;
  emergency_contact?: string | null;
  insurance?: string | null;
  whatsapp_consent?: boolean;
};

export type PatientTriagePayload = {
  reason: string;
  temperature_c: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  heart_rate: number | null;
  respiratory_rate: number | null;
  oxygen_saturation: number | null;
  triage_priority: PatientTriage["triagePriority"];
  triage_notes: string | null;
};

export type PatientDashboardData = {
  profile: PatientProfile;
  appointments: PatientAppointment[];
  history: PatientConsultation[];
  triage: PatientTriage | null;
  results: PatientLaboratoryResult[];
  prescriptions: PatientPrescription[];
  membership: PatientUnavailableData;
  epidemiology: PatientUnavailableData;
};

type ApiProfile = {
  id: number;
  patient_code: string;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  country_code: string | null;
  status: string | null;
  document_type: string | null;
  document_number: string | null;
  date_of_birth: string | null;
  sex: string | null;
  address: string | null;
  emergency_contact: string | null;
  insurance: string | null;
  whatsapp_consent: boolean;
  created_at: string | null;
  clinic: { id: number; name: string } | null;
};

type ApiAppointment = {
  id: number;
  scheduled_at: string | null;
  appointment_type: string;
  status: string;
  status_label: string;
  notes: string | null;
  clinic: { id: number; name: string } | null;
  doctor: { id: number; name: string; specialty: string | null; medical_license: string | null } | null;
};

type ApiConsultation = {
  id: number;
  appointment_id: number | null;
  status: string;
  status_label: string;
  chief_complaint: string;
  objective: string | null;
  doctor: { id: number; name: string; specialty: string | null } | null;
  clinic: { id: number; name: string } | null;
  completed_at: string | null;
  signed_at: string | null;
  created_at: string | null;
  clinical_history: {
    id: number;
    source: string;
    objective: string | null;
    sections: Record<string, unknown>;
  } | null;
  codings?: PatientClinicalCoding[];
};

type ApiPrescription = {
  id: number;
  medication: string;
  dosage: string | null;
  frequency: string | null;
  duration_days: number | null;
  status: string;
  status_label: string;
  issued_at: string | null;
  expires_at: string | null;
  notes: string | null;
  consultation_id: number | null;
  doctor: { id: number; name: string; specialty: string | null } | null;
  clinic: { id: number; name: string } | null;
};

type ApiLaboratoryResult = {
  id: number;
  study_name: string;
  status: string;
  status_label: string;
  priority: string;
  ordered_at: string | null;
  result_at: string | null;
  result_available: boolean;
  result_summary: string | null;
  notes: string | null;
  consultation_id: number | null;
  doctor: { id: number; name: string; specialty: string | null } | null;
  clinic: { id: number; name: string } | null;
};

type ApiTriage = {
  id: number;
  reason: string;
  temperature_c: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  heart_rate: number | null;
  respiratory_rate: number | null;
  oxygen_saturation: number | null;
  triage_priority: PatientTriage["triagePriority"];
  triage_notes: string | null;
  recorded_at: string | null;
  clinic: { id: number; name: string } | null;
  recorded_by: { id: number; name: string } | null;
};

type ApiConsent = {
  id: number;
  scope: PatientConsentScope;
  policy_version: string;
  status: "granted" | "revoked" | "expired";
  source: string;
  effective_from: string | null;
  effective_until: string | null;
  revoked_at: string | null;
  created_at: string | null;
};

function mapConsent(consent: ApiConsent): PatientConsent {
  return {
    id: consent.id,
    scope: consent.scope,
    policyVersion: consent.policy_version,
    status: consent.status,
    source: consent.source,
    effectiveFrom: consent.effective_from,
    effectiveUntil: consent.effective_until,
    revokedAt: consent.revoked_at,
    createdAt: consent.created_at,
  };
}

type ApiUnavailableResponse = {
  data: null;
  meta?: { available?: boolean; message?: string };
};

function mapProfile(profile: ApiProfile): PatientProfile {
  return {
    id: profile.id,
    patientCode: profile.patient_code,
    name: profile.name,
    email: profile.email,
    phoneNumber: profile.phone_number,
    countryCode: profile.country_code,
    status: profile.status,
    documentType: profile.document_type,
    documentNumber: profile.document_number,
    dateOfBirth: profile.date_of_birth,
    sex: profile.sex,
    address: profile.address,
    emergencyContact: profile.emergency_contact,
    insurance: profile.insurance,
    whatsappConsent: profile.whatsapp_consent,
    createdAt: profile.created_at,
    clinic: profile.clinic,
  };
}

function mapAppointment(appointment: ApiAppointment): PatientAppointment {
  return {
    id: appointment.id,
    scheduledAt: appointment.scheduled_at,
    appointmentType: appointment.appointment_type,
    status: appointment.status,
    statusLabel: appointment.status_label,
    notes: appointment.notes,
    clinic: appointment.clinic,
    doctor: appointment.doctor
      ? {
          id: appointment.doctor.id,
          name: appointment.doctor.name,
          specialty: appointment.doctor.specialty,
          medicalLicense: appointment.doctor.medical_license,
        }
      : null,
  };
}

function mapConsultation(consultation: ApiConsultation): PatientConsultation {
  return {
    id: consultation.id,
    appointmentId: consultation.appointment_id,
    status: consultation.status,
    statusLabel: consultation.status_label,
    chiefComplaint: consultation.chief_complaint,
    objective: consultation.objective,
    doctor: consultation.doctor,
    clinic: consultation.clinic,
    completedAt: consultation.completed_at,
    signedAt: consultation.signed_at,
    createdAt: consultation.created_at,
    clinicalHistory: consultation.clinical_history,
    codings: consultation.codings ?? [],
  };
}

function mapPrescription(prescription: ApiPrescription): PatientPrescription {
  return {
    id: prescription.id,
    medication: prescription.medication,
    dosage: prescription.dosage,
    frequency: prescription.frequency,
    durationDays: prescription.duration_days,
    status: prescription.status,
    statusLabel: prescription.status_label,
    issuedAt: prescription.issued_at,
    expiresAt: prescription.expires_at,
    notes: prescription.notes,
    consultationId: prescription.consultation_id,
    doctor: prescription.doctor,
    clinic: prescription.clinic,
  };
}

function mapResult(result: ApiLaboratoryResult): PatientLaboratoryResult {
  return {
    id: result.id,
    studyName: result.study_name,
    status: result.status,
    statusLabel: result.status_label,
    priority: result.priority,
    orderedAt: result.ordered_at,
    resultAt: result.result_at,
    resultAvailable: result.result_available,
    resultSummary: result.result_summary,
    notes: result.notes,
    consultationId: result.consultation_id,
    doctor: result.doctor,
    clinic: result.clinic,
  };
}

function mapTriage(triage: ApiTriage): PatientTriage {
  return {
    id: triage.id,
    reason: triage.reason,
    temperatureC: triage.temperature_c,
    systolicBp: triage.systolic_bp,
    diastolicBp: triage.diastolic_bp,
    heartRate: triage.heart_rate,
    respiratoryRate: triage.respiratory_rate,
    oxygenSaturation: triage.oxygen_saturation,
    triagePriority: triage.triage_priority,
    triageNotes: triage.triage_notes,
    recordedAt: triage.recorded_at,
    clinic: triage.clinic,
    recordedBy: triage.recorded_by,
  };
}

function assertArray<T>(data: T[] | undefined, message: string): T[] {
  if (!Array.isArray(data)) throw new ApiError(message, 502);
  return data;
}

export async function getPatientProfile(signal?: AbortSignal): Promise<PatientProfile> {
  const response = await getFromApi<{ data: ApiProfile }>("/api/v1/auth/patient/profile", { signal });
  if (!response.data?.id) throw new ApiError("El servidor devolvió un perfil de paciente incompleto.", 502);
  return mapProfile(response.data);
}

export async function updatePatientProfile(payload: PatientProfileUpdatePayload): Promise<PatientProfile> {
  const response = await patchToApi<{ data: ApiProfile }>("/api/v1/auth/patient/profile", payload);
  if (!response.data?.id) throw new ApiError("El servidor no devolvió el perfil actualizado.", 502);
  return mapProfile(response.data);
}

export async function getPatientAppointments(signal?: AbortSignal): Promise<PatientAppointment[]> {
  const response = await getFromApi<{ data: ApiAppointment[] }>("/api/v1/auth/patient/appointments", { signal });
  return assertArray(response.data, "El servidor devolvió una agenda de paciente incompleta.").map(mapAppointment);
}

export async function getPatientHistory(signal?: AbortSignal): Promise<PatientConsultation[]> {
  const response = await getFromApi<{ data: ApiConsultation[] }>("/api/v1/auth/patient/history", { signal });
  return assertArray(response.data, "El servidor devolvió un historial clínico incompleto.").map(mapConsultation);
}

export async function getPatientPrescriptions(signal?: AbortSignal): Promise<PatientPrescription[]> {
  const response = await getFromApi<{ data: ApiPrescription[] }>("/api/v1/auth/patient/prescriptions", { signal });
  return assertArray(response.data, "El servidor devolvió recetas incompletas.").map(mapPrescription);
}

export async function getPatientResults(signal?: AbortSignal): Promise<PatientLaboratoryResult[]> {
  const response = await getFromApi<{ data: ApiLaboratoryResult[] }>("/api/v1/auth/patient/results", { signal });
  return assertArray(response.data, "El servidor devolvió resultados de laboratorio incompletos.").map(mapResult);
}

export async function getPatientConsents(signal?: AbortSignal): Promise<PatientConsent[]> {
  const response = await getFromApi<{ data: ApiConsent[] }>("/api/v1/auth/patient/consents", { signal });
  return assertArray(response.data, "El servidor devolvió consentimientos incompletos.").map(mapConsent);
}

export async function grantPatientConsent(
  scope: PatientConsentScope,
  policyVersion: string,
): Promise<PatientConsent> {
  const response = await postToApi<{ data: ApiConsent }>("/api/v1/auth/patient/consents", {
    scope,
    policy_version: policyVersion,
  });
  if (!response.data?.id) throw new ApiError("El servidor no devolvió el consentimiento registrado.", 502);
  return mapConsent(response.data);
}

export async function revokePatientConsent(consentId: number): Promise<PatientConsent> {
  const response = await postToApi<{ data: ApiConsent }>(
    "/api/v1/auth/patient/consents/" + consentId + "/revoke",
  );
  if (!response.data?.id) throw new ApiError("El servidor no devolvió el consentimiento revocado.", 502);
  return mapConsent(response.data);
}

export async function getPatientTriage(signal?: AbortSignal): Promise<PatientTriage | null> {
  const response = await getFromApi<{ data: ApiTriage | null }>("/api/v1/auth/patient/triage", { signal });
  return response.data ? mapTriage(response.data) : null;
}

export async function savePatientTriage(payload: PatientTriagePayload): Promise<PatientTriage> {
  const response = await postToApi<{ data: ApiTriage }>("/api/v1/auth/patient/triage", payload);
  if (!response.data?.id) throw new ApiError("El servidor no devolvió el triaje guardado.", 502);
  return mapTriage(response.data);
}

async function getUnavailableData(path: string, signal?: AbortSignal): Promise<PatientUnavailableData> {
  const response = await getFromApi<ApiUnavailableResponse>(path, { signal });
  if (response.data !== null || response.meta?.available !== false) {
    throw new ApiError("El servidor devolvió una fuente de paciente inesperada.", 502);
  }
  return {
    available: false,
    message: response.meta?.message ?? "Esta información no está disponible.",
  };
}

export function getPatientMembership(signal?: AbortSignal): Promise<PatientUnavailableData> {
  return getUnavailableData("/api/v1/auth/patient/membership", signal);
}

export function getPatientEpidemiology(signal?: AbortSignal): Promise<PatientUnavailableData> {
  return getUnavailableData("/api/v1/auth/patient/epidemiology", signal);
}

export async function getPatientDashboard(signal?: AbortSignal): Promise<PatientDashboardData> {
  const [profile, appointments, history, triage, results, prescriptions, membership, epidemiology] = await Promise.all([
    getPatientProfile(signal),
    getPatientAppointments(signal),
    getPatientHistory(signal),
    getPatientTriage(signal),
    getPatientResults(signal),
    getPatientPrescriptions(signal),
    getPatientMembership(signal),
    getPatientEpidemiology(signal),
  ]);

  return { profile, appointments, history, triage, results, prescriptions, membership, epidemiology };
}

export type PatientPortalData =
  | { view: "dashboard"; data: PatientDashboardData }
  | { view: "appointments"; data: PatientAppointment[] }
  | { view: "triage"; data: PatientTriage | null }
  | { view: "results"; data: PatientLaboratoryResult[] }
  | { view: "history"; data: PatientConsultation[] }
  | { view: "prescriptions"; data: PatientPrescription[] }
  | { view: "epidemiology"; data: PatientUnavailableData }
  | { view: "membership"; data: PatientUnavailableData }
  | { view: "profile"; data: PatientProfile };

export async function getPatientPortalData(view: PatientPortalView, signal?: AbortSignal): Promise<PatientPortalData> {
  switch (view) {
    case "dashboard":
      return { view, data: await getPatientDashboard(signal) };
    case "appointments":
      return { view, data: await getPatientAppointments(signal) };
    case "triage":
      return { view, data: await getPatientTriage(signal) };
    case "results":
      return { view, data: await getPatientResults(signal) };
    case "history":
      return { view, data: await getPatientHistory(signal) };
    case "prescriptions":
      return { view, data: await getPatientPrescriptions(signal) };
    case "epidemiology":
      return { view, data: await getPatientEpidemiology() };
    case "membership":
      return { view, data: await getPatientMembership() };
    case "profile":
      return { view, data: await getPatientProfile(signal) };
    default: {
      const exhaustiveView: never = view;
      throw new ApiError(`Vista de portal no soportada: ${exhaustiveView}`, 500);
    }
  }
}

import { ApiError, getFromApi, patchToApi, postToApi } from "@/shared/api/http-client";

/**
 * Typed client for the doctor clinical workflow.
 *
 * NOTE: the doctor clinical routes live under `/api/v1/auth/doctor/*` because the
 * established backend convention nests every authenticated actor route under
 * the `v1/auth` prefix (matching `/api/v1/auth/doctor/profile`).
 */

export type DoctorPatient = {
  id: number;
  name: string | null;
  documentType: string | null;
  documentNumber: string | null;
  dateOfBirth: string | null;
  sex: string | null;
  address: string | null;
  clinic: { id: number; name: string } | null;
};

export type ClinicalHistoryEntry = {
  sectionKey: string | null;
  sectionTitle: string | null;
  values: Record<string, string> | null;
};

export type ClinicalHistoryRecord = {
  id: number;
  clinic: { id: number; name: string } | null;
  patientProfileId: number;
  doctor: { id: number; name: string } | null;
  appointmentId: number | null;
  source: string;
  objective: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  sections: ClinicalHistoryEntry[];
};

export type ConsultationSections = Record<string, Record<string, string>>;

export type Consultation = {
  id: number;
  clinic: { id: number; name: string } | null;
  doctor: { id: number; name: string } | null;
  patient: { id: number; name: string | null; sex: string | null; dateOfBirth: string | null } | null;
  appointmentId: number | null;
  status: string;
  statusLabel: string;
  chiefComplaint: string;
  objective: string | null;
  signature: { signedBy: { id: number; name: string } | null; signedAt: string | null };
  completedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  clinicalHistory: { id: number; source: string; objective: string | null; sections: ConsultationSections } | null;
};

export type ConsultationPayload = {
  appointment_id?: number | null;
  chief_complaint: string;
  objective?: string | null;
  status?: string;
  sections?: ConsultationSections;
  signature?: { signed_by?: number | null; signed_at?: string | null };
};

type ApiPatient = {
  id: number;
  name: string | null;
  document_type: string | null;
  document_number: string | null;
  date_of_birth: string | null;
  sex: string | null;
  address: string | null;
  clinic: { id: number; name: string } | null;
};

type ApiHistoryEntry = {
  section_key: string | null;
  section_title: string | null;
  values: Record<string, string> | null;
};

type ApiHistoryRecord = {
  id: number;
  clinic: { id: number; name: string } | null;
  patient_profile_id: number;
  doctor: { id: number; name: string } | null;
  appointment_id: number | null;
  source: string;
  objective: string | null;
  created_at: string | null;
  updated_at: string | null;
  sections: ApiHistoryEntry[];
};

type ApiConsultation = {
  id: number;
  clinic: { id: number; name: string } | null;
  doctor: { id: number; name: string } | null;
  patient: { id: number; name: string | null; sex: string | null; date_of_birth: string | null } | null;
  appointment_id: number | null;
  status: string;
  status_label: string;
  chief_complaint: string;
  objective: string | null;
  signature: { signed_by: { id: number; name: string } | null; signed_at: string | null };
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  clinical_history: { id: number; source: string; objective: string | null; sections: ConsultationSections } | null;
};

function mapPatient(patient: ApiPatient): DoctorPatient {
  return {
    id: patient.id,
    name: patient.name,
    documentType: patient.document_type,
    documentNumber: patient.document_number,
    dateOfBirth: patient.date_of_birth,
    sex: patient.sex,
    address: patient.address,
    clinic: patient.clinic,
  };
}

function mapHistoryRecord(record: ApiHistoryRecord): ClinicalHistoryRecord {
  return {
    id: record.id,
    clinic: record.clinic,
    patientProfileId: record.patient_profile_id,
    doctor: record.doctor,
    appointmentId: record.appointment_id,
    source: record.source,
    objective: record.objective,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    sections: record.sections.map((section) => ({
      sectionKey: section.section_key,
      sectionTitle: section.section_title,
      values: section.values,
    })),
  };
}

function mapConsultation(consultation: ApiConsultation): Consultation {
  return {
    id: consultation.id,
    clinic: consultation.clinic,
    doctor: consultation.doctor,
    patient: consultation.patient
      ? {
          id: consultation.patient.id,
          name: consultation.patient.name,
          sex: consultation.patient.sex,
          dateOfBirth: consultation.patient.date_of_birth,
        }
      : null,
    appointmentId: consultation.appointment_id,
    status: consultation.status,
    statusLabel: consultation.status_label,
    chiefComplaint: consultation.chief_complaint,
    objective: consultation.objective,
    signature: {
      signedBy: consultation.signature.signed_by,
      signedAt: consultation.signature.signed_at,
    },
    completedAt: consultation.completed_at,
    createdAt: consultation.created_at,
    updatedAt: consultation.updated_at,
    clinicalHistory: consultation.clinical_history,
  };
}

export async function getDoctorPatients(signal?: AbortSignal): Promise<DoctorPatient[]> {
  const response = await getFromApi<{ data: ApiPatient[] }>("/api/v1/auth/doctor/patients", { signal });
  if (!Array.isArray(response.data)) throw new ApiError("El servidor devolvió una lista de pacientes incompleta.", 502);
  return response.data.map(mapPatient);
}

export async function getDoctorConsultations(signal?: AbortSignal): Promise<Consultation[]> {
  const response = await getFromApi<{ data: ApiConsultation[] }>("/api/v1/auth/doctor/consultations", { signal });
  if (!Array.isArray(response.data)) throw new ApiError("El servidor devolvió una lista de consultas incompleta.", 502);
  return response.data.map(mapConsultation);
}

export async function getDoctorClinicalHistory(patientId: number, signal?: AbortSignal): Promise<ClinicalHistoryRecord[]> {
  const response = await getFromApi<{ data: ApiHistoryRecord[] }>(
    `/api/v1/auth/doctor/patients/${patientId}/clinical-history`,
    { signal },
  );
  if (!Array.isArray(response.data)) throw new ApiError("El servidor devolvió un historial clínico incompleto.", 502);
  return response.data.map(mapHistoryRecord);
}

export async function createConsultation(patientId: number, payload: ConsultationPayload): Promise<Consultation> {
  const response = await postToApi<{ data: ApiConsultation }>(`/api/v1/auth/doctor/patients/${patientId}/consultations`, payload);
  if (!response.data) throw new ApiError("El servidor no devolvió la consulta creada.", 502);
  return mapConsultation(response.data);
}

export async function getConsultation(consultationId: number, signal?: AbortSignal): Promise<Consultation> {
  const response = await getFromApi<{ data: ApiConsultation }>(
    `/api/v1/auth/doctor/consultations/${consultationId}`,
    { signal },
  );
  if (!response.data) throw new ApiError("El servidor no devolvió la consulta solicitada.", 502);
  return mapConsultation(response.data);
}

export async function updateConsultation(consultationId: number, payload: ConsultationPayload): Promise<Consultation> {
  const response = await patchToApi<{ data: ApiConsultation }>(`/api/v1/auth/doctor/consultations/${consultationId}`, payload);
  if (!response.data) throw new ApiError("El servidor no devolvió la consulta actualizada.", 502);
  return mapConsultation(response.data);
}

/** Map a consultation to a form-ready payload (snake_case, grouped sections). */
export function consultationToPayload(consultation: Consultation): ConsultationPayload {
  return {
    appointment_id: consultation.appointmentId,
    chief_complaint: consultation.chiefComplaint,
    objective: consultation.objective,
    status: consultation.status,
    sections: consultation.clinicalHistory?.sections ?? {},
  };
}

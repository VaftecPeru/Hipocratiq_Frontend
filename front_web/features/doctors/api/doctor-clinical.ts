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
  isReturningPatient: boolean;
  whatsappConsent: boolean;
  createdAt: string | null;
  clinic: { id: number; name: string } | null;
};

export type DoctorPatientPayload = {
  name: string;
  email?: string | null;
  phone_number: string;
  country_code: string;
  document_type?: string | null;
  document_number?: string | null;
  date_of_birth?: string | null;
  sex?: string | null;
  address?: string | null;
  emergency_contact?: string | null;
  insurance?: string | null;
  is_returning_patient?: boolean;
  whatsapp_consent?: boolean;
};

export type DoctorAppointmentStatus =
  | "pending"
  | "confirmed"
  | "waiting"
  | "in_consultation"
  | "completed"
  | "canceled"
  | "no_show";

export type DoctorAppointment = {
  id: number;
  scheduledAt: string | null;
  scheduledDate: string | null;
  time: string | null;
  appointmentType: string;
  notes: string | null;
  status: DoctorAppointmentStatus;
  statusLabel: string;
  patient: { id: number; patientCode: string; name: string | null; phoneNumber: string | null };
  doctor: { id: number; name: string; specialty: string | null } | null;
};

export type DoctorAppointmentSummary = {
  today_total: number;
  period_total?: number;
  confirmed: number;
  pending: number;
  waiting: number;
  in_consultation: number;
  completed: number;
  no_show: number;
  canceled: number;
};

export type DoctorAppointmentPayload = {
  patient_profile_id: number;
  scheduled_at: string;
  appointment_type: string;
  notes?: string | null;
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

export type DoctorConsultationStatus = "draft" | "in_progress" | "completed" | "signed" | "canceled";

export type DoctorWeekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type DoctorWorkingHours = Record<DoctorWeekday, { enabled: boolean; start: string; end: string }>;

export type DoctorPreferences = {
  working_hours: DoctorWorkingHours;
  appointment_duration_minutes: 15 | 30 | 45 | 60 | 90;
  buffer_minutes: number;
  teleconsultations_enabled: boolean;
  auto_confirm_appointments: boolean;
  notifications: {
    results_pending: boolean;
    new_messages: boolean;
    follow_up_reminders: boolean;
    epidemiology_alerts: boolean;
    upcoming_teleconsultations: boolean;
  };
  clinical: {
    show_relevant_history: boolean;
    show_epidemiology: boolean;
  };
};

export type DoctorAvailabilitySlot = {
  time: string;
  start: string;
  end: string;
  available: boolean;
  reason: "past" | "conflict" | null;
  appointment_id: number | null;
};

export type DoctorAvailability = {
  date: string;
  weekday: DoctorWeekday;
  is_working_day: boolean;
  working_hours: { start: string; end: string } | null;
  duration_minutes: number;
  buffer_minutes: number;
  available_slots: number;
  slots: DoctorAvailabilitySlot[];
};

export type DoctorDashboard = {
  generatedAt: string;
  date: string;
  doctor: {
    id: number;
    name: string;
    specialty: string | null;
    practiceType: "clinic" | "independent";
    clinic: { id: number; name: string } | null;
  };
  metrics: {
    todayAppointments: number;
    todayCompleted: number;
    todayPending: number;
    patientsTotal: number;
    monthConsultations: number;
    monthSignedConsultations: number;
  };
  todayAppointments: DoctorAppointment[];
  recentConsultations: Array<{
    id: number;
    patientName: string | null;
    chiefComplaint: string;
    status: DoctorConsultationStatus;
    statusLabel: string;
    createdAt: string | null;
  }>;
  frequentPatients: Array<{
    id: number;
    patientCode: string;
    name: string | null;
    visits: number;
  }>;
  alerts: {
    pendingAppointments: number;
    unsignedCompletedConsultations: number;
  };
};

export type Consultation = {
  id: number;
  clinic: { id: number; name: string } | null;
  doctor: { id: number; name: string } | null;
  patient: { id: number; name: string | null; sex: string | null; dateOfBirth: string | null } | null;
  appointmentId: number | null;
  status: DoctorConsultationStatus;
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
  status?: DoctorConsultationStatus;
  sections?: ConsultationSections;
};

export type DoctorPrescriptionStatus = "draft" | "active" | "renewal_due" | "completed" | "canceled";

export type DoctorPrescription = {
  id: number;
  clinic: { id: number; name: string } | null;
  patient: { id: number; patientCode: string; name: string | null };
  consultationId: number | null;
  medication: string;
  dosage: string | null;
  frequency: string | null;
  durationDays: number | null;
  status: DoctorPrescriptionStatus;
  statusLabel: string;
  issuedAt: string | null;
  expiresAt: string | null;
  notes: string | null;
};

export type DoctorPrescriptionPayload = {
  patient_profile_id: number;
  consultation_id?: number | null;
  medication: string;
  dosage?: string | null;
  frequency?: string | null;
  duration_days?: number | null;
  status?: Extract<DoctorPrescriptionStatus, "draft" | "active">;
  issued_at?: string | null;
  expires_at?: string | null;
  notes?: string | null;
};

export type DoctorPrescriptionMeta = {
  total: number;
  active: number;
  renewal_due: number;
  pending: number;
};

export type LaboratoryOrderStatus = "requested" | "in_progress" | "ready" | "reviewed" | "canceled";

export type LaboratoryOrder = {
  id: number;
  clinic: { id: number; name: string } | null;
  patient: { id: number; patientCode: string; name: string | null };
  consultationId: number | null;
  studyName: string;
  status: LaboratoryOrderStatus;
  statusLabel: string;
  priority: "normal" | "urgent";
  isCritical: boolean;
  orderedAt: string | null;
  resultAt: string | null;
  resultSummary: string | null;
  notes: string | null;
};

export type LaboratoryOrderPayload = {
  patient_profile_id: number;
  consultation_id?: number | null;
  study_name: string;
  priority?: "normal" | "urgent";
  notes?: string | null;
};

export type LaboratoryOrderMeta = {
  total: number;
  requested: number;
  in_progress: number;
  ready: number;
  reviewed: number;
  critical: number;
};

export type TeleconsultationStatus = "scheduled" | "waiting" | "in_progress" | "completed" | "canceled";

export type DoctorTeleconsultation = {
  id: number;
  clinic: { id: number; name: string } | null;
  patient: { id: number; patientCode: string; name: string | null };
  appointmentId: number | null;
  consultationId: number | null;
  status: TeleconsultationStatus;
  statusLabel: string;
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  notes: string | null;
  connection: {
    status: "configured" | "not_configured";
    provider: string;
    message: string;
    joinable: boolean;
    joinUrl: string | null;
  };
};

export type DoctorTeleconsultationPayload = {
  patient_profile_id: number;
  appointment_id?: number | null;
  consultation_id?: number | null;
  scheduled_at: string;
  notes?: string | null;
};

export type DoctorTeleconsultationMeta = {
  total: number;
  scheduled: number;
  waiting: number;
  in_progress: number;
  completed: number;
  connection: { status: "configured" | "not_configured"; provider: string; message: string };
};

export type DoctorMessage = {
  id: number;
  patient: { id: number; patientCode: string; name: string | null } | null;
  sender: { id: number; name: string } | null;
  recipient: { id: number; name: string } | null;
  body: string;
  isReceived: boolean;
  readAt: string | null;
  createdAt: string | null;
};

export type DoctorReports = {
  period: { from: string; to: string };
  metrics: {
    appointments: number;
    completedAppointments: number;
    consultations: number;
    completedConsultations: number;
    signedConsultations: number;
    patients: number;
    prescriptions: number;
    activePrescriptions: number;
    teleconsultations: number;
    completedTeleconsultations: number;
    laboratoryOrders: number;
    pendingLaboratoryOrders: number;
    criticalLaboratoryOrders: number;
  };
  sources: Record<string, boolean>;
  generatedAt: string;
};

export type DoctorEpidemiology = {
  generatedAt: string;
  periodDays: number;
  analysisAvailable: boolean;
  message: string;
  metrics: {
    monitoredPatients: number;
    activeAlerts: number;
    highRiskCases: number;
    trend: "not_configured" | "stable";
    consultations: number;
    laboratoryOrders: number;
    teleconsultations: number;
    prescriptions: number;
  };
  cohorts: Array<{ name: string; level: number; risk: string }>;
  alerts: Array<{ title: string; detail: string; severity: "info" | "warning" | "critical" }>;
  sources: Record<string, { status: "available" | "no_data" | "not_configured"; label: string }>;
};

type ApiPatient = {
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
  is_returning_patient: boolean;
  whatsapp_consent: boolean;
  created_at: string | null;
  clinic: { id: number; name: string } | null;
};

type ApiAppointment = {
  id: number;
  scheduled_at: string | null;
  scheduled_date: string | null;
  time: string | null;
  appointment_type: string;
  notes: string | null;
  status: DoctorAppointmentStatus;
  status_label: string;
  patient: { id: number; patient_code: string; name: string | null; phone_number: string | null };
  doctor: { id: number; name: string; specialty: string | null } | null;
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
  status: DoctorConsultationStatus;
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
    patientCode: patient.patient_code,
    name: patient.name,
    email: patient.email,
    phoneNumber: patient.phone_number,
    countryCode: patient.country_code,
    status: patient.status,
    documentType: patient.document_type,
    documentNumber: patient.document_number,
    dateOfBirth: patient.date_of_birth,
    sex: patient.sex,
    address: patient.address,
    emergencyContact: patient.emergency_contact,
    insurance: patient.insurance,
    isReturningPatient: patient.is_returning_patient,
    whatsappConsent: patient.whatsapp_consent,
    createdAt: patient.created_at,
    clinic: patient.clinic,
  };
}

function mapAppointment(appointment: ApiAppointment): DoctorAppointment {
  return {
    id: appointment.id,
    scheduledAt: appointment.scheduled_at,
    scheduledDate: appointment.scheduled_date,
    time: appointment.time,
    appointmentType: appointment.appointment_type,
    notes: appointment.notes,
    status: appointment.status,
    statusLabel: appointment.status_label,
    patient: {
      id: appointment.patient.id,
      patientCode: appointment.patient.patient_code,
      name: appointment.patient.name,
      phoneNumber: appointment.patient.phone_number,
    },
    doctor: appointment.doctor,
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

type ApiDoctorDashboard = {
  data: {
    generated_at: string;
    date: string;
    doctor: {
      id: number;
      name: string;
      specialty: string | null;
      practice_type: "clinic" | "independent";
      clinic: { id: number; name: string } | null;
    };
    metrics: {
      today_appointments: number;
      today_completed: number;
      today_pending: number;
      patients_total: number;
      month_consultations: number;
      month_signed_consultations: number;
    };
    today_appointments: ApiAppointment[];
    recent_consultations: Array<{
      id: number;
      patient_name: string | null;
      chief_complaint: string;
      status: DoctorConsultationStatus;
      status_label: string;
      created_at: string | null;
    }>;
    frequent_patients: Array<{ id: number; patient_code: string; name: string | null; visits: number }>;
    alerts: { pending_appointments: number; unsigned_completed_consultations: number };
  };
};

function mapDashboard(dashboard: ApiDoctorDashboard["data"]): DoctorDashboard {
  return {
    generatedAt: dashboard.generated_at,
    date: dashboard.date,
    doctor: {
      id: dashboard.doctor.id,
      name: dashboard.doctor.name,
      specialty: dashboard.doctor.specialty,
      practiceType: dashboard.doctor.practice_type,
      clinic: dashboard.doctor.clinic,
    },
    metrics: {
      todayAppointments: dashboard.metrics.today_appointments,
      todayCompleted: dashboard.metrics.today_completed,
      todayPending: dashboard.metrics.today_pending,
      patientsTotal: dashboard.metrics.patients_total,
      monthConsultations: dashboard.metrics.month_consultations,
      monthSignedConsultations: dashboard.metrics.month_signed_consultations,
    },
    todayAppointments: dashboard.today_appointments.map(mapAppointment),
    recentConsultations: dashboard.recent_consultations.map((consultation) => ({
      id: consultation.id,
      patientName: consultation.patient_name,
      chiefComplaint: consultation.chief_complaint,
      status: consultation.status,
      statusLabel: consultation.status_label,
      createdAt: consultation.created_at,
    })),
    frequentPatients: dashboard.frequent_patients.map((patient) => ({
      id: patient.id,
      patientCode: patient.patient_code,
      name: patient.name,
      visits: patient.visits,
    })),
    alerts: {
      pendingAppointments: dashboard.alerts.pending_appointments,
      unsignedCompletedConsultations: dashboard.alerts.unsigned_completed_consultations,
    },
  };
}

export async function getDoctorPatients(signal?: AbortSignal): Promise<DoctorPatient[]> {
  const response = await getFromApi<{ data: ApiPatient[] }>("/api/v1/auth/doctor/patients", { signal });
  if (!Array.isArray(response.data)) throw new ApiError("El servidor devolvió una lista de pacientes incompleta.", 502);
  return response.data.map(mapPatient);
}

export async function createDoctorPatient(payload: DoctorPatientPayload): Promise<DoctorPatient> {
  const response = await postToApi<{ data: ApiPatient }>('/api/v1/auth/doctor/patients', payload);
  if (!response.data) throw new ApiError('El servidor no devolvió el paciente creado.', 502);
  return mapPatient(response.data);
}

export async function updateDoctorPatient(patientId: number, payload: Partial<DoctorPatientPayload>): Promise<DoctorPatient> {
  const response = await patchToApi<{ data: ApiPatient }>(`/api/v1/auth/doctor/patients/${patientId}`, payload);
  if (!response.data) throw new ApiError('El servidor no devolvió el paciente actualizado.', 502);
  return mapPatient(response.data);
}

export async function getDoctorAppointments(
  from?: string,
  to?: string,
  signal?: AbortSignal,
): Promise<{ appointments: DoctorAppointment[]; summary: DoctorAppointmentSummary }> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString();
  const response = await getFromApi<{
    data: ApiAppointment[];
    meta?: { summary?: DoctorAppointmentSummary };
  }>(`/api/v1/auth/doctor/appointments${query ? `?${query}` : ''}`, { signal });
  if (!Array.isArray(response.data)) throw new ApiError('El servidor devolvió una agenda incompleta.', 502);
  return {
    appointments: response.data.map(mapAppointment),
    summary: response.meta?.summary ?? {
      today_total: 0,
      confirmed: 0,
      pending: 0,
      waiting: 0,
      in_consultation: 0,
      completed: 0,
      no_show: 0,
      canceled: 0,
    },
    };
}

export async function updateDoctorAppointmentStatus(
  appointmentId: number,
  status: DoctorAppointmentStatus,
): Promise<DoctorAppointment> {
  const response = await patchToApi<{ data: ApiAppointment }>(
    `/api/v1/auth/doctor/appointments/${appointmentId}/status`,
    { status },
  );
  if (!response.data) throw new ApiError('El servidor no devolvió la cita actualizada.', 502);
  return mapAppointment(response.data);
}

export async function getDoctorAvailability(date: string, signal?: AbortSignal): Promise<DoctorAvailability> {
  const response = await getFromApi<{ data: DoctorAvailability }>(
    `/api/v1/auth/doctor/availability?date=${encodeURIComponent(date)}`,
    { signal },
  );
  if (!response.data || !Array.isArray(response.data.slots)) {
    throw new ApiError('El servidor devolvió una disponibilidad incompleta.', 502);
  }
  return response.data;
}

export async function getDoctorDashboard(date?: string, signal?: AbortSignal): Promise<DoctorDashboard> {
  const query = date ? `?date=${encodeURIComponent(date)}` : '';
  const response = await getFromApi<ApiDoctorDashboard>(`/api/v1/auth/doctor/dashboard${query}`, { signal });
  if (!response.data?.doctor || !Array.isArray(response.data.today_appointments)) {
    throw new ApiError('El servidor devolvió un panel médico incompleto.', 502);
  }
  return mapDashboard(response.data);
}

export async function getDoctorPreferences(signal?: AbortSignal): Promise<DoctorPreferences> {
  const response = await getFromApi<{ data: DoctorPreferences }>('/api/v1/auth/doctor/preferences', { signal });
  if (!response.data?.working_hours) throw new ApiError('El servidor devolvió preferencias incompletas.', 502);
  return response.data;
}

export async function updateDoctorPreferences(preferences: DoctorPreferences): Promise<DoctorPreferences> {
  const response = await patchToApi<{ data: DoctorPreferences }>('/api/v1/auth/doctor/preferences', { preferences });
  if (!response.data?.working_hours) throw new ApiError('El servidor no devolvió las preferencias actualizadas.', 502);
  return response.data;
}

export async function createDoctorAppointment(payload: DoctorAppointmentPayload): Promise<DoctorAppointment> {
  const response = await postToApi<{ data: ApiAppointment }>('/api/v1/auth/doctor/appointments', payload);
  if (!response.data) throw new ApiError('El servidor no devolvió la cita creada.', 502);
  return mapAppointment(response.data);
}

export async function updateDoctorAppointment(
  appointmentId: number,
  payload: Partial<Omit<DoctorAppointmentPayload, 'patient_profile_id'>>,
): Promise<DoctorAppointment> {
  const response = await patchToApi<{ data: ApiAppointment }>(`/api/v1/auth/doctor/appointments/${appointmentId}`, payload);
  if (!response.data) throw new ApiError('El servidor no devolvió la cita actualizada.', 502);
  return mapAppointment(response.data);
}

export async function cancelDoctorAppointment(appointmentId: number): Promise<DoctorAppointment> {
  const response = await postToApi<{ data: ApiAppointment }>(`/api/v1/auth/doctor/appointments/${appointmentId}/cancel`);
  if (!response.data) throw new ApiError('El servidor no devolvió la cita cancelada.', 502);
  return mapAppointment(response.data);
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

type ApiDoctorPrescription = {
  id: number;
  clinic: { id: number; name: string } | null;
  patient: { id: number; patient_code: string; name: string | null };
  consultation_id: number | null;
  medication: string;
  dosage: string | null;
  frequency: string | null;
  duration_days: number | null;
  status: DoctorPrescriptionStatus;
  status_label: string;
  issued_at: string | null;
  expires_at: string | null;
  notes: string | null;
};

type ApiLaboratoryOrder = {
  id: number;
  clinic: { id: number; name: string } | null;
  patient: { id: number; patient_code: string; name: string | null };
  consultation_id: number | null;
  study_name: string;
  status: LaboratoryOrderStatus;
  status_label: string;
  priority: "normal" | "urgent";
  is_critical: boolean;
  ordered_at: string | null;
  result_at: string | null;
  result_summary: string | null;
  notes: string | null;
};

type ApiTeleconsultation = {
  id: number;
  clinic: { id: number; name: string } | null;
  patient: { id: number; patient_code: string; name: string | null };
  appointment_id: number | null;
  consultation_id: number | null;
  status: TeleconsultationStatus;
  status_label: string;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  notes: string | null;
  connection: {
    status: "configured" | "not_configured";
    provider: string;
    message: string;
    joinable: boolean;
    join_url: string | null;
  };
};

type ApiDoctorMessage = {
  id: number;
  patient: { id: number; patient_code: string; name: string | null } | null;
  sender: { id: number; name: string } | null;
  recipient: { id: number; name: string } | null;
  body: string;
  is_received: boolean;
  read_at: string | null;
  created_at: string | null;
};

function mapWorkspacePatient(patient: { id: number; patient_code: string; name: string | null }): { id: number; patientCode: string; name: string | null } {
  return { id: patient.id, patientCode: patient.patient_code, name: patient.name };
}

function mapPrescription(prescription: ApiDoctorPrescription): DoctorPrescription {
  return {
    id: prescription.id,
    clinic: prescription.clinic,
    patient: mapWorkspacePatient(prescription.patient),
    consultationId: prescription.consultation_id,
    medication: prescription.medication,
    dosage: prescription.dosage,
    frequency: prescription.frequency,
    durationDays: prescription.duration_days,
    status: prescription.status,
    statusLabel: prescription.status_label,
    issuedAt: prescription.issued_at,
    expiresAt: prescription.expires_at,
    notes: prescription.notes,
  };
}

function mapLaboratoryOrder(order: ApiLaboratoryOrder): LaboratoryOrder {
  return {
    id: order.id,
    clinic: order.clinic,
    patient: mapWorkspacePatient(order.patient),
    consultationId: order.consultation_id,
    studyName: order.study_name,
    status: order.status,
    statusLabel: order.status_label,
    priority: order.priority,
    isCritical: order.is_critical,
    orderedAt: order.ordered_at,
    resultAt: order.result_at,
    resultSummary: order.result_summary,
    notes: order.notes,
  };
}

function mapTeleconsultation(session: ApiTeleconsultation): DoctorTeleconsultation {
  return {
    id: session.id,
    clinic: session.clinic,
    patient: mapWorkspacePatient(session.patient),
    appointmentId: session.appointment_id,
    consultationId: session.consultation_id,
    status: session.status,
    statusLabel: session.status_label,
    scheduledAt: session.scheduled_at,
    startedAt: session.started_at,
    endedAt: session.ended_at,
    notes: session.notes,
    connection: {
      status: session.connection.status,
      provider: session.connection.provider,
      message: session.connection.message,
      joinable: session.connection.joinable,
      joinUrl: session.connection.join_url,
    },
  };
}

function mapDoctorMessage(message: ApiDoctorMessage): DoctorMessage {
  return {
    id: message.id,
    patient: message.patient ? mapWorkspacePatient(message.patient) : null,
    sender: message.sender,
    recipient: message.recipient,
    body: message.body,
    isReceived: message.is_received,
    readAt: message.read_at,
    createdAt: message.created_at,
  };
}

export async function getDoctorPrescriptions(signal?: AbortSignal): Promise<{ items: DoctorPrescription[]; meta: DoctorPrescriptionMeta }> {
  const response = await getFromApi<{ data: ApiDoctorPrescription[]; meta: DoctorPrescriptionMeta }>('/api/v1/auth/doctor/prescriptions', { signal });
  if (!Array.isArray(response.data) || !response.meta) throw new ApiError('El servidor devolvió recetas incompletas.', 502);
  return { items: response.data.map(mapPrescription), meta: response.meta };
}

export async function createDoctorPrescription(payload: DoctorPrescriptionPayload): Promise<DoctorPrescription> {
  const response = await postToApi<{ data: ApiDoctorPrescription }>('/api/v1/auth/doctor/prescriptions', payload);
  if (!response.data) throw new ApiError('El servidor no devolvió la receta creada.', 502);
  return mapPrescription(response.data);
}

export async function updateDoctorPrescription(
  prescriptionId: number,
  payload: Partial<Omit<DoctorPrescriptionPayload, 'patient_profile_id'>>,
): Promise<DoctorPrescription> {
  const response = await patchToApi<{ data: ApiDoctorPrescription }>(`/api/v1/auth/doctor/prescriptions/${prescriptionId}`, payload);
  if (!response.data) throw new ApiError('El servidor no devolvió la receta actualizada.', 502);
  return mapPrescription(response.data);
}

export async function getDoctorLaboratory(signal?: AbortSignal): Promise<{ items: LaboratoryOrder[]; meta: LaboratoryOrderMeta }> {
  const response = await getFromApi<{ data: ApiLaboratoryOrder[]; meta: LaboratoryOrderMeta }>('/api/v1/auth/doctor/laboratory', { signal });
  if (!Array.isArray(response.data) || !response.meta) throw new ApiError('El servidor devolvió resultados de laboratorio incompletos.', 502);
  return { items: response.data.map(mapLaboratoryOrder), meta: response.meta };
}

export async function createDoctorLaboratoryOrder(payload: LaboratoryOrderPayload): Promise<LaboratoryOrder> {
  const response = await postToApi<{ data: ApiLaboratoryOrder }>('/api/v1/auth/doctor/laboratory', payload);
  if (!response.data) throw new ApiError('El servidor no devolvió la solicitud de laboratorio creada.', 502);
  return mapLaboratoryOrder(response.data);
}

export async function updateDoctorLaboratoryStatus(orderId: number, status: LaboratoryOrderStatus, resultSummary?: string): Promise<LaboratoryOrder> {
  const response = await patchToApi<{ data: ApiLaboratoryOrder }>(`/api/v1/auth/doctor/laboratory/${orderId}/status`, {
    status,
    ...(resultSummary === undefined ? {} : { result_summary: resultSummary }),
  });
  if (!response.data) throw new ApiError('El servidor no devolvió el resultado actualizado.', 502);
  return mapLaboratoryOrder(response.data);
}

export async function getDoctorTeleconsultations(signal?: AbortSignal): Promise<{ items: DoctorTeleconsultation[]; meta: DoctorTeleconsultationMeta }> {
  const response = await getFromApi<{ data: ApiTeleconsultation[]; meta: DoctorTeleconsultationMeta }>('/api/v1/auth/doctor/teleconsultations', { signal });
  if (!Array.isArray(response.data) || !response.meta) throw new ApiError('El servidor devolvió teleconsultas incompletas.', 502);
  return { items: response.data.map(mapTeleconsultation), meta: response.meta };
}

export async function createDoctorTeleconsultation(payload: DoctorTeleconsultationPayload): Promise<DoctorTeleconsultation> {
  const response = await postToApi<{ data: ApiTeleconsultation }>('/api/v1/auth/doctor/teleconsultations', payload);
  if (!response.data) throw new ApiError('El servidor no devolvió la teleconsulta creada.', 502);
  return mapTeleconsultation(response.data);
}

export async function updateDoctorTeleconsultationStatus(sessionId: number, status: TeleconsultationStatus): Promise<DoctorTeleconsultation> {
  const response = await patchToApi<{ data: ApiTeleconsultation }>(`/api/v1/auth/doctor/teleconsultations/${sessionId}/status`, { status });
  if (!response.data) throw new ApiError('El servidor no devolvió la teleconsulta actualizada.', 502);
  return mapTeleconsultation(response.data);
}

export async function getDoctorMessages(signal?: AbortSignal): Promise<{ items: DoctorMessage[]; unread: number }> {
  const response = await getFromApi<{ data: ApiDoctorMessage[]; meta: { unread: number } }>('/api/v1/auth/doctor/messages', { signal });
  if (!Array.isArray(response.data) || !response.meta) throw new ApiError('El servidor devolvió mensajes incompletos.', 502);
  return { items: response.data.map(mapDoctorMessage), unread: response.meta.unread };
}

export async function sendDoctorMessage(patientProfileId: number, body: string): Promise<DoctorMessage> {
  const response = await postToApi<{ data: ApiDoctorMessage }>('/api/v1/auth/doctor/messages', {
    patient_profile_id: patientProfileId,
    body,
  });
  if (!response.data) throw new ApiError('El servidor no devolvió el mensaje enviado.', 502);
  return mapDoctorMessage(response.data);
}

export async function markDoctorMessageRead(messageId: number): Promise<DoctorMessage> {
  const response = await patchToApi<{ data: ApiDoctorMessage }>(`/api/v1/auth/doctor/messages/${messageId}/read`);
  if (!response.data) throw new ApiError('El servidor no devolvió el mensaje actualizado.', 502);
  return mapDoctorMessage(response.data);
}

type ApiDoctorReports = {
  period: { from: string; to: string };
  metrics: {
    appointments: number;
    completed_appointments: number;
    consultations: number;
    completed_consultations: number;
    signed_consultations: number;
    patients: number;
    prescriptions: number;
    active_prescriptions: number;
    teleconsultations: number;
    completed_teleconsultations: number;
    laboratory_orders: number;
    pending_laboratory_orders: number;
    critical_laboratory_orders: number;
  };
  sources: Record<string, boolean>;
  generated_at: string;
};

export async function getDoctorReports(signal?: AbortSignal): Promise<DoctorReports> {
  const response = await getFromApi<{ data: ApiDoctorReports }>('/api/v1/auth/doctor/reports', { signal });
  if (!response.data?.metrics) throw new ApiError('El servidor devolvió reportes incompletos.', 502);
  return {
    period: response.data.period,
    metrics: {
      appointments: response.data.metrics.appointments,
      completedAppointments: response.data.metrics.completed_appointments,
      consultations: response.data.metrics.consultations,
      completedConsultations: response.data.metrics.completed_consultations,
      signedConsultations: response.data.metrics.signed_consultations,
      patients: response.data.metrics.patients,
      prescriptions: response.data.metrics.prescriptions,
      activePrescriptions: response.data.metrics.active_prescriptions,
      teleconsultations: response.data.metrics.teleconsultations,
      completedTeleconsultations: response.data.metrics.completed_teleconsultations,
      laboratoryOrders: response.data.metrics.laboratory_orders,
      pendingLaboratoryOrders: response.data.metrics.pending_laboratory_orders,
      criticalLaboratoryOrders: response.data.metrics.critical_laboratory_orders,
    },
    sources: response.data.sources,
    generatedAt: response.data.generated_at,
  };
}

type ApiDoctorEpidemiology = {
  generated_at: string;
  period_days: number;
  analysis_available: boolean;
  message: string;
  metrics: {
    monitored_patients: number;
    active_alerts: number;
    high_risk_cases: number;
    trend: 'not_configured' | 'stable';
    consultations: number;
    laboratory_orders: number;
    teleconsultations: number;
    prescriptions: number;
  };
  cohorts: Array<{ name: string; level: number; risk: string }>;
  alerts: Array<{ title: string; detail: string; severity: 'info' | 'warning' | 'critical' }>;
  sources: Record<string, { status: 'available' | 'no_data' | 'not_configured'; label: string }>;
};

export async function getDoctorEpidemiology(signal?: AbortSignal): Promise<DoctorEpidemiology> {
  const response = await getFromApi<{ data: ApiDoctorEpidemiology }>('/api/v1/auth/doctor/epidemiology', { signal });
  if (!response.data?.metrics) throw new ApiError('El servidor devolvió el análisis epidemiológico incompleto.', 502);
  return {
    generatedAt: response.data.generated_at,
    periodDays: response.data.period_days,
    analysisAvailable: response.data.analysis_available,
    message: response.data.message,
    metrics: {
      monitoredPatients: response.data.metrics.monitored_patients,
      activeAlerts: response.data.metrics.active_alerts,
      highRiskCases: response.data.metrics.high_risk_cases,
      trend: response.data.metrics.trend,
      consultations: response.data.metrics.consultations,
      laboratoryOrders: response.data.metrics.laboratory_orders,
      teleconsultations: response.data.metrics.teleconsultations,
      prescriptions: response.data.metrics.prescriptions,
    },
    cohorts: response.data.cohorts,
    alerts: response.data.alerts,
    sources: response.data.sources,
  };
}

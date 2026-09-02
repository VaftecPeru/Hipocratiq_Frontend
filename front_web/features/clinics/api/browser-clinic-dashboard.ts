import { ApiError, deleteFromApi, getFromApi, patchToApi, postToApi } from "@/shared/api/http-client";
import type {
  ClinicAdminInfo,
  ClinicAppointment,
  ClinicAppointmentStatus,
  ClinicAppointmentSummary,
  ClinicDashboardData,
  ClinicMemberRole,
  ClinicPatient,
  ClinicPatientAppointment,
  ClinicPatientDetail,
  ClinicPatientIntakeSummary,
  ClinicPatientProfile,
  ClinicPatientTriagePriority,
  ClinicPreferences,
  ClinicPatientsPage,
  ClinicScheduleBlock,
  ClinicTeamMember,
} from "@/features/clinics/model/clinic-admin.types";
import type { CountryCode } from "@/shared/ui/country-flag";

type ApiClinic = {
  id: number;
  name: string;
  country_code: CountryCode;
  contact_phone: string;
  address: string;
  status: "active" | "suspended";
  preferences?: Partial<ClinicPreferences> | null;
};

const DEFAULT_CLINIC_PREFERENCES: ClinicPreferences = {
  maintenance: false,
  audit: true,
  signatures: true,
  backups: true,
};

type ApiMember = {
  id: number;
  name: string;
  email: string | null;
  phone_number: string;
  status: ClinicTeamMember["status"];
  role: ClinicMemberRole;
  role_name: string;
  specialty: string | null;
  medical_license: string | null;
  last_login_at: string | null;
};

type ApiPatient = {
  id: number;
  patient_code: string;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  status: ClinicPatient["status"];
  created_at: string | null;
  age: number | null;
  insurance?: string | null;
  is_returning_patient?: boolean;
  whatsapp_consent?: boolean;
  last_appointment: ApiPatientAppointment | null;
  next_appointment: ApiPatientAppointment | null;
  triage: ApiPatientTriage | null;
};

type ApiPatientAppointment = {
  id: number;
  scheduled_at: string;
  appointment_type: string;
  status: ClinicAppointmentStatus;
  status_label: string;
  doctor: { id: number; name: string; specialty: string | null } | null;
};

type ApiPatientTriage = {
  temperature_c: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  heart_rate: number | null;
  respiratory_rate: number | null;
  oxygen_saturation: number | null;
  priority: ClinicPatientTriagePriority | null;
  notes: string | null;
  recorded_at: string | null;
  registrar_name: string | null;
};

type ApiDashboardResponse = {
  data: {
    clinic: ApiClinic;
    subscription: { plan: string | null; status: string | null; billing_cycle: string | null };
    metrics: { staff_total: number; doctors_total: number; receptionists_total: number; patients_total: number };
    appointment_summary: ApiAppointmentSummary;
    today_appointments: ApiAppointment[];
    team: ApiMember[];
    recent_patients: ApiPatient[];
  };
};

type ApiAppointmentSummary = {
  today_total: number;
  confirmed: number;
  pending: number;
  waiting: number;
  in_consultation: number;
  no_show: number;
  canceled: number;
};

type ApiAppointment = {
  id: number;
  scheduled_at: string;
  scheduled_date: string;
  time: string;
  appointment_type: string;
  status: ClinicAppointmentStatus;
  status_label: string;
  notes: string | null;

  patient: {id: number; patient_code: string; name: string | null; phone_number: string | null};

  doctor: {id: number; name: string; specialty: string | null  } | null;
};

type ApiScheduleBlock = {
  id: number;
  starts_at: string;
  ends_at: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  scope: "clinic" | "doctor";

  doctor: {
    id: number;
    name: string;
  } | null;

  created_by: {
    id: number;
    name: string;
  };
};

type ApiPatientsResponse = {
  data: ApiPatient[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};

type ApiAppointmentsResponse = {
  data: ApiAppointment[];
  meta: {
    from: string;
    to: string;
    total: number;
    summary: ApiAppointmentSummary;
  };
};

type ApiClinicResponse = { data: { clinic: ApiClinic } };

function mapClinic(clinic: ApiClinic): ClinicAdminInfo {
  return {
    id: clinic.id,
    name: clinic.name,
    countryCode: clinic.country_code,
    contactPhone: clinic.contact_phone,
    address: clinic.address,
    status: clinic.status,
    preferences: {
      ...DEFAULT_CLINIC_PREFERENCES,
      ...(clinic.preferences ?? {}),
    },
  };
}

function mapMember(member: ApiMember): ClinicTeamMember {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    phoneNumber: member.phone_number,
    status: member.status,
    role: member.role,
    roleName: member.role_name,
    specialty: member.specialty,
    medicalLicense: member.medical_license,
    lastLoginAt: member.last_login_at,
  };
}

function mapPatientAppointment(appt: ApiPatientAppointment | null): ClinicPatientAppointment | null {
  if (appt === null) return null;
  return {
    id: appt.id,
    scheduledAt: appt.scheduled_at,
    appointmentType: appt.appointment_type,
    status: appt.status,
    statusLabel: appt.status_label,
    doctor: appt.doctor,
  };
}

function mapPatient(patient: ApiPatient): ClinicPatient {
  return {
    id: patient.id,
    patientCode: patient.patient_code,
    name: patient.name,
    email: patient.email,
    phoneNumber: patient.phone_number,
    status: patient.status,
    createdAt: patient.created_at,
    age: patient.age ?? null,
    insurance: patient.insurance ?? null,
    isReturningPatient: patient.is_returning_patient ?? false,
    whatsappConsent: patient.whatsapp_consent ?? false,
    lastAppointment: mapPatientAppointment(patient.last_appointment ?? null),
    nextAppointment: mapPatientAppointment(patient.next_appointment ?? null),
    triage: patient.triage === null ? null : {
      temperatureC: patient.triage.temperature_c,
      systolicBp: patient.triage.systolic_bp,
      diastolicBp: patient.triage.diastolic_bp,
      heartRate: patient.triage.heart_rate,
      respiratoryRate: patient.triage.respiratory_rate,
      oxygenSaturation: patient.triage.oxygen_saturation,
      priority: patient.triage.priority,
      notes: patient.triage.notes,
      recordedAt: patient.triage.recorded_at,
      registrarName: patient.triage.registrar_name,
    },
  };
}

function mapAppointment(appointment: ApiAppointment): ClinicAppointment {
  return {
    id: appointment.id,
    scheduledAt: appointment.scheduled_at,
    scheduledDate: appointment.scheduled_date,
    time: appointment.time,
    appointmentType: appointment.appointment_type,
    status: appointment.status,
    statusLabel: appointment.status_label,
    notes: appointment.notes ?? null,

    patient: {
      id: appointment.patient.id,
      patientCode: appointment.patient.patient_code,
      name: appointment.patient.name,
      phoneNumber: appointment.patient.phone_number,
    },

    doctor: appointment.doctor,
  };
}

function mapScheduleBlock(
  block: ApiScheduleBlock,
): ClinicScheduleBlock {
  return {
    id: block.id,
    startsAt: block.starts_at,
    endsAt: block.ends_at,
    scheduledDate: block.scheduled_date,
    startTime: block.start_time,
    endTime: block.end_time,
    reason: block.reason,
    scope: block.scope,
    doctor: block.doctor,
    createdBy: block.created_by,
  };
}

function mapAppointmentSummary(summary: ApiAppointmentSummary): ClinicAppointmentSummary {
  return {
    todayTotal: summary.today_total,
    confirmed: summary.confirmed,
    pending: summary.pending,
    waiting: summary.waiting,
    inConsultation: summary.in_consultation,
    noShow: summary.no_show,
    canceled: summary.canceled,
  };
}

function assertDashboardPayload(payload: ApiDashboardResponse): ApiDashboardResponse["data"] {
  if (!payload.data || !payload.data.clinic || !Array.isArray(payload.data.team) || !Array.isArray(payload.data.recent_patients)) {
    throw new ApiError("El servidor devolvió un panel clínico incompleto.", 502);
  }

  return payload.data;
}

export async function getClinicDashboard(signal?: AbortSignal): Promise<ClinicDashboardData> {
  const payload = assertDashboardPayload(await getFromApi<ApiDashboardResponse>("/api/v1/auth/clinic/dashboard", { signal }));

  return {
    clinic: mapClinic(payload.clinic),
    subscription: {
      plan: payload.subscription.plan,
      status: payload.subscription.status,
      billingCycle: payload.subscription.billing_cycle,
    },
    metrics: {
      staffTotal: payload.metrics.staff_total,
      doctorsTotal: payload.metrics.doctors_total,
      receptionistsTotal: payload.metrics.receptionists_total,
      patientsTotal: payload.metrics.patients_total,
    },
    appointmentSummary: mapAppointmentSummary(payload.appointment_summary),
    todayAppointments: payload.today_appointments.map(mapAppointment),
    team: payload.team.map(mapMember),
    recentPatients: payload.recent_patients.map(mapPatient),
  };
}

export async function getClinicAppointments(
  from: string,
  to: string,
  signal?: AbortSignal,
): Promise<{ appointments: ClinicAppointment[]; summary: ClinicAppointmentSummary }> {
  const query = new URLSearchParams({ from, to });
  const payload = await getFromApi<ApiAppointmentsResponse>(`/api/v1/auth/clinic/appointments?${query.toString()}`, { signal });

  if (!Array.isArray(payload.data) || !payload.meta?.summary) {
    throw new ApiError("El servidor devolvió una agenda incompleta.", 502);
  }

  return {
    appointments: payload.data.map(mapAppointment),
    summary: mapAppointmentSummary(payload.meta.summary),
  };
}

export type CreateClinicAppointmentPayload = {
  patientProfileId: number;
  doctorUserId: number | null;
  scheduledAt: string;
  appointmentType: "consultation" | "control";
  notes: string | null;
};

export async function createClinicAppointment(
  payload: CreateClinicAppointmentPayload,
): Promise<ClinicAppointment> {
  const response = await postToApi<{ data: ApiAppointment }>(
    "/api/v1/auth/clinic/appointments",
    {
      patient_profile_id: payload.patientProfileId,
      doctor_user_id: payload.doctorUserId,
      scheduled_at: payload.scheduledAt,
      appointment_type: payload.appointmentType,
      notes: payload.notes,
    },
  );

  if (!response.data) {
    throw new ApiError(
      "El servidor no devolvió la cita registrada.",
      502,
    );
  }

  return mapAppointment(response.data);
}

export async function getClinicMembers(signal?: AbortSignal): Promise<ClinicTeamMember[]> {
  const payload = await getFromApi<{ data: ApiMember[] }>("/api/v1/auth/clinic/members", { signal });
  if (!Array.isArray(payload.data)) throw new ApiError("El servidor devolvió un equipo clínico incompleto.", 502);
  return payload.data.map(mapMember);
}

export type CreateClinicReceptionistPayload = {
  name: string;
  email: string | null;
  phoneNumber: string;
  countryCode: CountryCode;
};

export async function createClinicReceptionist(
  payload: CreateClinicReceptionistPayload,
): Promise<ClinicTeamMember> {
  const response = await postToApi<{ data: ApiMember }>("/api/v1/auth/clinic/members", {
    name: payload.name,
    email: payload.email,
    phone_number: payload.phoneNumber,
    country_code: payload.countryCode,
  });

  if (!response.data) throw new ApiError("El servidor no devolvió la recepcionista creada.", 502);
  return mapMember(response.data);
}

export async function getClinicPatients(
  search = "",
  page = 1,
  signal?: AbortSignal,
): Promise<ClinicPatientsPage> {
  const query = new URLSearchParams({ per_page: "20", page: String(page) });
  if (search.trim()) query.set("search", search.trim());
  const payload = await getFromApi<ApiPatientsResponse>(`/api/v1/auth/clinic/patients?${query.toString()}`, { signal });
  if (!Array.isArray(payload.data) || !payload.meta) throw new ApiError("El servidor devolvió pacientes incompletos.", 502);

  return {
    patients: payload.data.map(mapPatient),
    pagination: {
      currentPage: payload.meta.current_page,
      lastPage: payload.meta.last_page,
      perPage: payload.meta.per_page,
      total: payload.meta.total,
    },
  };
}

export type CreateClinicPatientPayload = {
  name: string;
  email: string | null;
  phoneNumber: string;
  countryCode: CountryCode;
  documentType: string | null;
  documentNumber: string | null;
  dateOfBirth: string | null;
  sex: string | null;
  address: string | null;
  emergencyContact: string | null;
  insurance: string | null;
  isReturningPatient: boolean;
  whatsappConsent: boolean;
  requestedDoctorUserId: number | null;
  specialtyId: number | null;
  subspecialtyId: number | null;
  reasonCategory: string | null;
  objective: string;
  observations: string | null;
  temperatureC: number | null;
  systolicBp: number | null;
  diastolicBp: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  oxygenSaturation: number | null;
  triagePriority: ClinicPatientTriagePriority | null;
  triageNotes: string | null;
};

export async function createClinicPatient(payload: CreateClinicPatientPayload): Promise<ClinicPatient> {
  const response = await postToApi<{ data: ApiPatient }>('/api/v1/auth/clinic/patients', {
    name: payload.name,
    email: payload.email,
    phone_number: payload.phoneNumber,
    country_code: payload.countryCode,
    document_type: payload.documentType,
    document_number: payload.documentNumber,
    date_of_birth: payload.dateOfBirth,
    sex: payload.sex,
    address: payload.address,
    emergency_contact: payload.emergencyContact,
    insurance: payload.insurance,
    is_returning_patient: payload.isReturningPatient,
    whatsapp_consent: payload.whatsappConsent,
    requested_doctor_user_id: payload.requestedDoctorUserId,
    specialty_id: payload.specialtyId,
    subspecialty_id: payload.subspecialtyId,
    reason_category: payload.reasonCategory,
    objective: payload.objective,
    observations: payload.observations,
    temperature_c: payload.temperatureC,
    systolic_bp: payload.systolicBp,
    diastolic_bp: payload.diastolicBp,
    heart_rate: payload.heartRate,
    respiratory_rate: payload.respiratoryRate,
    oxygen_saturation: payload.oxygenSaturation,
    triage_priority: payload.triagePriority,
    triage_notes: payload.triageNotes,
  });

  if (!response.data) throw new ApiError('El servidor no devolvió el paciente registrado.', 502);
  return mapPatient(response.data);
}

export async function getClinicSettings(signal?: AbortSignal): Promise<ClinicAdminInfo> {
  const payload = await getFromApi<ApiClinicResponse>("/api/v1/auth/clinic/settings", { signal });
  if (!payload.data?.clinic) throw new ApiError("El servidor devolvió una configuración clínica incompleta.", 502);
  return mapClinic(payload.data.clinic);
}

export type UpdateClinicSettingsPayload = Partial<Pick<ClinicAdminInfo, "name" | "contactPhone" | "address" | "preferences">>;

export async function updateClinicSettings(payload: UpdateClinicSettingsPayload): Promise<ClinicAdminInfo> {
  const response = await patchToApi<ApiClinicResponse>("/api/v1/auth/clinic/settings", {
    name: payload.name,
    contact_phone: payload.contactPhone,
    address: payload.address,
    preferences: payload.preferences,
  });
  if (!response.data?.clinic) throw new ApiError("El servidor no devolvió la configuración actualizada.", 502);
  return mapClinic(response.data.clinic);
}

// --- Patient Directory CRUD ---

type ApiPatientDetailResponse = {
  data: {
    patient: ApiPatient;
    profile: {
      document_type: string | null;
      document_number: string | null;
      date_of_birth: string | null;
      sex: string | null;
      address: string | null;
      emergency_contact: string | null;
      insurance?: string | null;
      is_returning_patient?: boolean;
      whatsapp_consent?: boolean;
      country_code: string | null;
    };
    intake: {
      reason_category: string | null;
      requested_doctor: { id: number; name: string; specialty: string | null } | null;
      specialty: string | null;
      triage: {
        temperature_c: number | null;
        systolic_bp: number | null;
        diastolic_bp: number | null;
        heart_rate: number | null;
        respiratory_rate: number | null;
        oxygen_saturation: number | null;
        priority: ClinicPatientTriagePriority | null;
        recorded_at: string | null;
      } | null;
    } | null;
    recent_appointments: ApiPatientAppointment[];
    next_appointment: ApiPatientAppointment | null;
  };
};

export async function getClinicPatientDetail(
  patientId: number,
  signal?: AbortSignal,
): Promise<ClinicPatientDetail> {
  const payload = await getFromApi<ApiPatientDetailResponse>(
    `/api/v1/auth/clinic/patients/${patientId}`,
    { signal },
  );
  if (!payload.data?.patient) throw new ApiError("El servidor devolvió un expediente incompleto.", 502);
  const { data } = payload;

  const profile: ClinicPatientProfile = {
    documentType: data.profile.document_type,
    documentNumber: data.profile.document_number,
    dateOfBirth: data.profile.date_of_birth,
    sex: data.profile.sex,
    address: data.profile.address,
    emergencyContact: data.profile.emergency_contact,
    insurance: data.profile.insurance ?? null,
    isReturningPatient: data.profile.is_returning_patient ?? false,
    whatsappConsent: data.profile.whatsapp_consent ?? false,
    countryCode: data.profile.country_code,
  };

  const intake: ClinicPatientIntakeSummary | null = data.intake === null ? null : {
    reasonCategory: data.intake.reason_category,
    requestedDoctor: data.intake.requested_doctor,
    specialty: data.intake.specialty,
    triage: data.intake.triage === null ? null : {
      temperatureC: data.intake.triage.temperature_c,
      systolicBp: data.intake.triage.systolic_bp,
      diastolicBp: data.intake.triage.diastolic_bp,
      heartRate: data.intake.triage.heart_rate,
      respiratoryRate: data.intake.triage.respiratory_rate,
      oxygenSaturation: data.intake.triage.oxygen_saturation,
      priority: data.intake.triage.priority,
      recordedAt: data.intake.triage.recorded_at,
    },
  };

  return {
    patient: mapPatient(data.patient),
    profile,
    intake,
    recentAppointments: (data.recent_appointments ?? []).map((a) => mapPatientAppointment(a)!),
    nextAppointment: mapPatientAppointment(data.next_appointment ?? null),
  };
}

export type UpdateClinicPatientPayload = {
  name?: string;
  email?: string | null;
  phoneNumber?: string;
  countryCode?: string;
  documentType?: string | null;
  documentNumber?: string | null;
  dateOfBirth?: string | null;
  sex?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  insurance?: string | null;
  isReturningPatient?: boolean;
  whatsappConsent?: boolean;
};

export async function updateClinicPatient(
  patientId: number,
  payload: UpdateClinicPatientPayload,
): Promise<ClinicPatient> {
  const body: Record<string, unknown> = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.email !== undefined) body.email = payload.email;
  if (payload.phoneNumber !== undefined) body.phone_number = payload.phoneNumber;
  if (payload.countryCode !== undefined) body.country_code = payload.countryCode;
  if (payload.documentType !== undefined) body.document_type = payload.documentType;
  if (payload.documentNumber !== undefined) body.document_number = payload.documentNumber;
  if (payload.dateOfBirth !== undefined) body.date_of_birth = payload.dateOfBirth;
  if (payload.sex !== undefined) body.sex = payload.sex;
  if (payload.address !== undefined) body.address = payload.address;
  if (payload.emergencyContact !== undefined) body.emergency_contact = payload.emergencyContact;
  if (payload.insurance !== undefined) body.insurance = payload.insurance;
  if (payload.isReturningPatient !== undefined) body.is_returning_patient = payload.isReturningPatient;
  if (payload.whatsappConsent !== undefined) body.whatsapp_consent = payload.whatsappConsent;

  const response = await patchToApi<{ data: ApiPatient }>(`/api/v1/auth/clinic/patients/${patientId}`, body);
  if (!response.data) throw new ApiError("El servidor no devolvió el paciente actualizado.", 502);
  return mapPatient(response.data);
}

export async function updateClinicPatientStatus(
  patientId: number,
  status: "active" | "suspended",
): Promise<ClinicPatient> {
  const response = await patchToApi<{ data: ApiPatient }>(
    `/api/v1/auth/clinic/patients/${patientId}/status`,
    { status },
  );
  if (!response.data) throw new ApiError("El servidor no devolvió el estado actualizado.", 502);
  return mapPatient(response.data);
}

const API_PREFIX = "/backend";

// --- Appointment write operations ---

export type CreateClinicAppointmentPayload = {
  patientProfileId: number;
  doctorUserId: number;
  scheduledAt: string;
  appointmentType: string;
  notes: string | null;
};

export async function createClinicAppointment(
  payload: CreateClinicAppointmentPayload,
): Promise<ClinicAppointment> {
  const response = await postToApi<{ data: ApiAppointment }>("/api/v1/auth/clinic/appointments", {
    patient_profile_id: payload.patientProfileId,
    doctor_user_id: payload.doctorUserId,
    scheduled_at: payload.scheduledAt,
    appointment_type: payload.appointmentType,
    notes: payload.notes,
  });
  if (!response.data) throw new ApiError("El servidor no devolvió la cita creada.", 502);
  return mapAppointment(response.data);
}

export async function updateClinicAppointmentStatus(
  id: number,
  status: ClinicAppointmentStatus,
): Promise<ClinicAppointment> {
  const response = await patchToApi<{ data: ApiAppointment }>(
    `/api/v1/auth/clinic/appointments/${id}/status`,
    { status },
  );
  if (!response.data) throw new ApiError("El servidor no devolvió la cita actualizada.", 502);
  return mapAppointment(response.data);
}

export type UpdateClinicAppointmentPayload = Partial<
  Pick<CreateClinicAppointmentPayload, "scheduledAt" | "appointmentType" | "notes" | "doctorUserId">
>;

export async function updateClinicAppointment(
  id: number,
  payload: UpdateClinicAppointmentPayload,
): Promise<ClinicAppointment> {
  const body: Record<string, unknown> = {};
  if (payload.scheduledAt !== undefined) body.scheduled_at = payload.scheduledAt;
  if (payload.appointmentType !== undefined) body.appointment_type = payload.appointmentType;
  if (payload.notes !== undefined) body.notes = payload.notes;
  if (payload.doctorUserId !== undefined) body.doctor_user_id = payload.doctorUserId;

  const response = await patchToApi<{ data: ApiAppointment }>(
    `/api/v1/auth/clinic/appointments/${id}`,
    body,
  );
  if (!response.data) throw new ApiError("El servidor no devolvió la cita actualizada.", 502);
  return mapAppointment(response.data);
}

// --- Member write operations ---

export type UpdateClinicMemberPayload = {
  name?: string;
  email?: string | null;
  phoneNumber?: string;
  countryCode?: string;
};

export async function updateClinicMember(
  memberId: number,
  payload: UpdateClinicMemberPayload,
): Promise<ClinicTeamMember> {
  const body: Record<string, unknown> = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.email !== undefined) body.email = payload.email;
  if (payload.phoneNumber !== undefined) body.phone_number = payload.phoneNumber;
  if (payload.countryCode !== undefined) body.country_code = payload.countryCode;

  const response = await patchToApi<{ data: ApiMember }>(
    `/api/v1/auth/clinic/members/${memberId}`,
    body,
  );
  if (!response.data) throw new ApiError("El servidor no devolvió el miembro actualizado.", 502);
  return mapMember(response.data);
}

export async function updateClinicMemberStatus(
  memberId: number,
  status: "active" | "suspended",
): Promise<ClinicTeamMember> {
  const response = await patchToApi<{ data: ApiMember }>(
    `/api/v1/auth/clinic/members/${memberId}/status`,
    { status },
  );
  if (!response.data) throw new ApiError("El servidor no devolvió el estado actualizado.", 502);
  return mapMember(response.data);
}

export async function removeClinicMember(memberId: number): Promise<void> {
  await deleteFromApi(`/api/v1/auth/clinic/members/${memberId}`);
}

export type CreateClinicDoctorPayload = {
  name: string;
  email: string | null;
  phoneNumber: string;
  countryCode: CountryCode;
  medicalLicense: string;
  specialtyId: number;
  subspecialtyId: number | null;
};

export async function createClinicDoctor(
  payload: CreateClinicDoctorPayload,
): Promise<ClinicTeamMember> {
  const response = await postToApi<{ data: ApiMember }>("/api/v1/auth/clinic/members/doctors", {
    name: payload.name,
    email: payload.email,
    phone_number: payload.phoneNumber,
    country_code: payload.countryCode,
    medical_license: payload.medicalLicense,
    specialty_id: payload.specialtyId,
    subspecialty_id: payload.subspecialtyId,
  });
  if (!response.data) throw new ApiError("El servidor no devolvió el médico creado.", 502);
  return mapMember(response.data);
}

export async function downloadClinicPatientsExport(): Promise<void> {
  const response = await fetch(`${API_PREFIX}/api/v1/auth/clinic/patients/export`, {
    credentials: "include",
    headers: { Accept: "text/csv" },
  });
  if (!response.ok) {
    throw new ApiError("No pudimos exportar los pacientes.", response.status);
  }
  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition");
  const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
  const filename = filenameMatch?.[1] ?? `pacientes-${new Date().toISOString().slice(0, 10)}.csv`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

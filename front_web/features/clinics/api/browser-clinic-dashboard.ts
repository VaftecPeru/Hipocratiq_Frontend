import { ApiError, getFromApi, patchToApi, postToApi } from "@/shared/api/http-client";
import type {
  ClinicAdminInfo,
  ClinicAppointment,
  ClinicAppointmentStatus,
  ClinicAppointmentSummary,
  ClinicDashboardData,
  ClinicMemberRole,
  ClinicPatient,
  ClinicPatientTriagePriority,
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
  triage: ApiPatientTriage | null;
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

function mapPatient(patient: ApiPatient): ClinicPatient {
  return {
    id: patient.id,
    patientCode: patient.patient_code,
    name: patient.name,
    email: patient.email,
    phoneNumber: patient.phone_number,
    status: patient.status,
    createdAt: patient.created_at,
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

export type UpdateClinicSettingsPayload = Partial<Pick<ClinicAdminInfo, "name" | "contactPhone" | "address">>;



export async function updateClinicSettings(payload: UpdateClinicSettingsPayload): Promise<ClinicAdminInfo> {
  const response = await patchToApi<ApiClinicResponse>("/api/v1/auth/clinic/settings", {
    name: payload.name,
    contact_phone: payload.contactPhone,
    address: payload.address,
  });
  if (!response.data?.clinic) throw new ApiError("El servidor no devolvió la configuración actualizada.", 502);
  return mapClinic(response.data.clinic);
}

export async function getClinicScheduleBlocks(
  from: string,
  to: string,
  signal?: AbortSignal,
): Promise<ClinicScheduleBlock[]> {
  const query = new URLSearchParams({ from, to });

  const response = await getFromApi<{
    data: ApiScheduleBlock[];
  }>(
    `/api/v1/auth/clinic/schedule-blocks?${query.toString()}`,
    { signal },
  );

  if (!Array.isArray(response.data)) {
    throw new ApiError(
      "El servidor devolvió los bloqueos incompletos.",
      502,
    );
  }

  return response.data.map(mapScheduleBlock);
}

export type CreateClinicScheduleBlockPayload = {
  doctorUserId: number | null;
  startsAt: string;
  endsAt: string;
  reason: string | null;
};

export async function createClinicScheduleBlock(
  payload: CreateClinicScheduleBlockPayload,
): Promise<ClinicScheduleBlock> {
  const response = await postToApi<{
    data: ApiScheduleBlock;
  }>("/api/v1/auth/clinic/schedule-blocks", {
    doctor_user_id: payload.doctorUserId,
    starts_at: payload.startsAt,
    ends_at: payload.endsAt,
    reason: payload.reason,
  });

  if (!response.data) {
    throw new ApiError(
      "El servidor no devolvió el bloqueo registrado.",
      502,
    );
  }

  return mapScheduleBlock(response.data);
}

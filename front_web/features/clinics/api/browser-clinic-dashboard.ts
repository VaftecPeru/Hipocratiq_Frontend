import { ApiError, deleteFromApi, getFileFromApi, getFromApi, patchToApi, postToApi } from "@/shared/api/http-client";
import type {
  ClinicAdminInfo,
  ClinicAppointment,
  ClinicAppointmentStatus,
  ClinicAppointmentSummary,
  ClinicBillingReport,
  ClinicDashboardData,
  ClinicEpidemiologyData,
  ClinicEmergencyGlobalOverride,
  ClinicEmergencyPolicy,
  ClinicEmergencyState,
  ClinicMemberRole,
  ClinicPatient,
  ClinicPatientAppointment,
  ClinicPatientDetail,
  ClinicPatientIntakeSummary,
  ClinicPatientProfile,
  ClinicPatientTriagePriority,
  ClinicPreferences,
  ClinicMessage,
  ClinicMessageContact,
  ClinicMessagesData,
  ClinicReceptionistPreferences,
  ClinicReceptionistSettings,
  ClinicSubscription,
  ClinicInvoice,
  ClinicInvoiceItem,
  ClinicInvoicePayment,
  ClinicInvoicesPage,
  ClinicPaymentMethod,
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
  preferences?: Partial<ApiClinicPreferences> | null;
  emergency?: ApiClinicEmergency | null;
};

type ApiEmergencyPolicy = {
  enabled: boolean;
  visibility: ClinicEmergencyPolicy["visibility"];
  label: string;
  color: ClinicEmergencyPolicy["color"];
  inheritance: ClinicEmergencyPolicy["inheritance"];
  default_channel: ClinicEmergencyPolicy["defaultChannel"];
  escalation_minutes: ClinicEmergencyPolicy["escalationMinutes"];
  responsibles: Array<{ role: string; channel: string }>;
};

type ApiClinicEmergency = {
  local: ApiEmergencyPolicy;
  effective: ApiEmergencyPolicy;
  is_overridden: boolean;
  global_override: {
    scope: "all";
    force: boolean;
    note: string | null;
    published_at: string | null;
    published_by: { id: number | null; name: string | null; email: string | null } | null;
    policy: ApiEmergencyPolicy;
    responsibles: Array<{ role: string; channel: string }>;
  } | null;
};

type ApiClinicPreferences = Partial<Omit<ClinicPreferences, "emergency">> & {
  emergency?: Partial<ApiEmergencyPolicy> | null;
};

const DEFAULT_CLINIC_PREFERENCES: ClinicPreferences = {
  maintenance: false,
  audit: true,
  signatures: true,
  backups: true,
  emergency: {
    enabled: true,
    visibility: "reception_doctors_admins",
    label: "Emergencia",
    color: "#EF2F3F",
    inheritance: "workflow_and_responsibles",
    defaultChannel: "priority_push",
    escalationMinutes: 3,
    responsibles: [
      { role: "Administrador de clínica", channel: "Resumen de evento y auditoría" },
      { role: "Jefe de guardia", channel: "Push prioritario" },
      { role: "Recepción", channel: "Alerta interna inmediata" },
    ],
  },
};

type ApiMember = {
  id: number;
  name: string;
  email: string | null;
  phone_number: string;
  country_code?: CountryCode | null;
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
  period_total?: number;
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

type ApiInvoiceItem = {
  id: number;
  description: string;
  quantity: number;
  unit_amount_minor: number;
  line_total_minor: number;
};

type ApiInvoicePayment = {
  id: number;
  amount_minor: number;
  currency: string;
  status: "confirmed" | "voided";
  payment_method: ClinicPaymentMethod;
  reference: string | null;
  note: string | null;
  paid_at: string | null;
  recorded_by_user_id: number | null;
  recorded_by_name: string | null;
};

type ApiInvoice = {
  id: number;
  invoice_number: string;
  patient: { id: number | null; name: string | null; email: string | null; phone_number: string | null };
  issue_date: string | null;
  due_date: string | null;
  currency: string;
  total_minor: number;
  paid_minor: number;
  outstanding_minor: number;
  status: ClinicInvoice["status"];
  created_at: string | null;
  items?: ApiInvoiceItem[];
  payments?: ApiInvoicePayment[];
};

type ApiInvoicesResponse = {
  data: ApiInvoice[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};

type ApiBillingReportResponse = {
  data: {
    clinic_id: number;
    period: { from: string; to: string };
    by_currency: Record<string, {
      currency: string;
      invoice_count: number;
      invoiced_minor: number;
      outstanding_minor: number;
      payment_count: number;
      paid_minor: number;
    }>;
  };
};

type ApiSubscription = {
  id: number;
  status: ClinicSubscription["status"];
  billing_cycle: ClinicSubscription["billingCycle"];
  auto_renew: boolean;
  starts_at: string | null;
  ends_at: string | null;
  provider: string | null;
  plan: {
    id: number;
    key: string;
    name: string;
    description: string | null;
    currency: string;
    monthly_price_cents: number;
    annual_price_cents: number;
    features: string[];
  } | null;
  usage: ClinicSubscription["usage"];
};

type ApiSubscriptionResponse = { data: { subscription: ApiSubscription | null } };

type ApiReceptionistPreferences = {
  new_appointments: boolean;
  arrivals: boolean;
  pending_payments: boolean;
  internal_messages: boolean;
  documents: boolean;
  online_reception: boolean;
  whatsapp: boolean;
  auto_print: boolean;
  duplicate_tickets: boolean;
  shift_name: string | null;
  shift_start: string | null;
  shift_end: string | null;
  counter_name: string | null;
  printer_name: string | null;
  paper_size: "A4" | "letter" | null;
};

type ApiReceptionistSettingsResponse = {
  data: {
    profile: { id: number; name: string; email: string | null; phone_number: string; role: "receptionist" };
    clinic: { id: number; name: string };
    settings: { persisted: boolean; updated_at: string | null; preferences: ApiReceptionistPreferences };
    operation: {
      two_factor: { status: "not_configured"; message: string };
      cash_register: { status: "not_configured"; message: string };
    };
    metrics: {
      appointments_today: number;
      appointments_yesterday: number;
      appointments_change_percent: number | null;
      unread_messages: number;
      pending_payments: number;
      cash_register: { status: "not_configured"; opened_at: string | null };
    };
  };
};

type ApiMessageContact = {
  user_id: number;
  kind: ClinicMessageContact["kind"];
  name: string | null;
  email: string | null;
  phone_number: string | null;
  patient_profile_id: number | null;
  role: string | null;
  role_name: string | null;
  specialty: string | null;
  status: ClinicMessageContact["status"];
  unread: number;
  last_message: { body: string; created_at: string | null } | null;
};

type ApiClinicMessage = {
  id: number;
  patient_profile_id: number | null;
  sender: { id: number; name: string } | null;
  recipient: { id: number; name: string } | null;
  body: string;
  is_received: boolean;
  read_at: string | null;
  created_at: string | null;
};

type ApiMessagesResponse = {
  data: {
    contacts: ApiMessageContact[];
    selected_contact_id: number | null;
    messages: ApiClinicMessage[];
  };
  meta: { total: number; unread: number };
};

type ApiEpidemiologyResponse = {
  data: {
    generated_at: string;
    period: { from: string; to: string; days: number };
    analysis_available: boolean;
    message: string;
    metrics: {
      monitored_patients: number;
      active_alerts: number;
      high_risk_cases: number;
      trend: "not_configured" | "stable" | "rising" | "falling" | "mixed";
      appointments: number;
      consultations: number;
      laboratory_orders: number;
      teleconsultations: number;
      prescriptions: number;
    };
    trend: Array<{ month: string; label: string; appointments: number; consultations: number; laboratory_orders: number }>;
    forecasts: Array<Record<string, string | number>>;
    alerts: Array<{ title?: string; detail?: string; severity?: "info" | "warning" | "critical" }>;
    recommendations: string[];
    map: { status: "not_configured"; message: string };
    sources: Record<string, { status: "available" | "no_data"; label: string; count: number }>;
  };
};

type ApiClinicResponse = { data: { clinic: ApiClinic } };

function mapClinic(clinic: ApiClinic): ClinicAdminInfo {
  const preferences = mapPreferences(clinic.preferences);
  const emergency = clinic.emergency ? mapEmergencyState(clinic.emergency) : {
    local: preferences.emergency,
    effective: preferences.emergency,
    isOverridden: false,
    globalOverride: null,
  } satisfies ClinicEmergencyState;

  return {
    id: clinic.id,
    name: clinic.name,
    countryCode: clinic.country_code,
    contactPhone: clinic.contact_phone,
    address: clinic.address,
    status: clinic.status,
    preferences,
    emergency,
  };
}

function mapEmergencyPolicy(policy: ApiEmergencyPolicy | Partial<ApiEmergencyPolicy> | null | undefined): ClinicEmergencyPolicy {
  const source = policy ?? {};

  return {
    enabled: source.enabled ?? DEFAULT_CLINIC_PREFERENCES.emergency.enabled,
    visibility: source.visibility ?? DEFAULT_CLINIC_PREFERENCES.emergency.visibility,
    label: source.label ?? DEFAULT_CLINIC_PREFERENCES.emergency.label,
    color: source.color ?? DEFAULT_CLINIC_PREFERENCES.emergency.color,
    inheritance: source.inheritance ?? DEFAULT_CLINIC_PREFERENCES.emergency.inheritance,
    defaultChannel: source.default_channel ?? DEFAULT_CLINIC_PREFERENCES.emergency.defaultChannel,
    escalationMinutes: source.escalation_minutes ?? DEFAULT_CLINIC_PREFERENCES.emergency.escalationMinutes,
    responsibles: source.responsibles?.length ? source.responsibles : DEFAULT_CLINIC_PREFERENCES.emergency.responsibles,
  };
}

function mapPreferences(preferences: Partial<ApiClinicPreferences> | null | undefined): ClinicPreferences {
  return {
    maintenance: preferences?.maintenance ?? DEFAULT_CLINIC_PREFERENCES.maintenance,
    audit: preferences?.audit ?? DEFAULT_CLINIC_PREFERENCES.audit,
    signatures: preferences?.signatures ?? DEFAULT_CLINIC_PREFERENCES.signatures,
    backups: preferences?.backups ?? DEFAULT_CLINIC_PREFERENCES.backups,
    emergency: mapEmergencyPolicy(preferences?.emergency),
  };
}

function mapEmergencyState(emergency: ApiClinicEmergency): ClinicEmergencyState {
  const globalOverride: ClinicEmergencyGlobalOverride | null = emergency.global_override === null ? null : {
    scope: "all",
    force: emergency.global_override.force,
    note: emergency.global_override.note,
    publishedAt: emergency.global_override.published_at,
    publishedBy: emergency.global_override.published_by,
    policy: mapEmergencyPolicy(emergency.global_override.policy),
    responsibles: emergency.global_override.responsibles,
  };

  return {
    local: mapEmergencyPolicy(emergency.local),
    effective: mapEmergencyPolicy(emergency.effective),
    isOverridden: emergency.is_overridden,
    globalOverride,
  };
}

function mapMember(member: ApiMember, fallbackCountryCode?: CountryCode): ClinicTeamMember {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    phoneNumber: member.phone_number,
    countryCode: member.country_code ?? fallbackCountryCode ?? null,
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
    periodTotal: summary.period_total ?? summary.today_total,
    confirmed: summary.confirmed,
    pending: summary.pending,
    waiting: summary.waiting,
    inConsultation: summary.in_consultation,
    noShow: summary.no_show,
    canceled: summary.canceled,
  };
}

function mapInvoiceItem(item: ApiInvoiceItem): ClinicInvoiceItem {
  return {
    id: item.id,
    description: item.description,
    quantity: item.quantity,
    unitAmountMinor: item.unit_amount_minor,
    lineTotalMinor: item.line_total_minor,
  };
}

function mapInvoicePayment(payment: ApiInvoicePayment): ClinicInvoicePayment {
  return {
    id: payment.id,
    amountMinor: payment.amount_minor,
    currency: payment.currency,
    status: payment.status,
    paymentMethod: payment.payment_method,
    reference: payment.reference,
    note: payment.note,
    paidAt: payment.paid_at,
    recordedByUserId: payment.recorded_by_user_id,
    recordedByName: payment.recorded_by_name,
  };
}

function mapInvoice(invoice: ApiInvoice): ClinicInvoice {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
    patient: {
      id: invoice.patient.id,
      name: invoice.patient.name,
      email: invoice.patient.email,
      phoneNumber: invoice.patient.phone_number,
    },
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    currency: invoice.currency,
    totalMinor: invoice.total_minor,
    paidMinor: invoice.paid_minor,
    outstandingMinor: invoice.outstanding_minor,
    status: invoice.status,
    createdAt: invoice.created_at,
    items: invoice.items?.map(mapInvoiceItem),
    payments: invoice.payments?.map(mapInvoicePayment),
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
    team: payload.team.map((member) => mapMember(member)),
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

export async function getClinicScheduleBlocks(
  from: string,
  to: string,
  signal?: AbortSignal,
): Promise<ClinicScheduleBlock[]> {
  const query = new URLSearchParams({ from, to });
  const response = await getFromApi<{ data: ApiScheduleBlock[] }>(
    `/api/v1/auth/clinic/schedule-blocks?${query.toString()}`,
    { signal },
  );

  if (!Array.isArray(response.data)) {
    throw new ApiError("El servidor devolvió los bloqueos incompletos.", 502);
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
  const response = await postToApi<{ data: ApiScheduleBlock }>(
    "/api/v1/auth/clinic/schedule-blocks",
    {
      doctor_user_id: payload.doctorUserId,
      starts_at: payload.startsAt,
      ends_at: payload.endsAt,
      reason: payload.reason,
    },
  );

  if (!response.data) {
    throw new ApiError("El servidor no devolvió el bloqueo registrado.", 502);
  }

  return mapScheduleBlock(response.data);
}

export async function deleteClinicScheduleBlock(
  id: number,
): Promise<void> {
  await deleteFromApi(
    `/api/v1/auth/clinic/schedule-blocks/${id}`,
  );
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
  return payload.data.map((member) => mapMember(member));
}

export type ClinicBillingInvoiceFilters = {
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  perPage?: number;
};

export async function getClinicBillingInvoices(
  filters: ClinicBillingInvoiceFilters = {},
  signal?: AbortSignal,
): Promise<ClinicInvoicesPage> {
  const query = new URLSearchParams({
    per_page: String(filters.perPage ?? 50),
    page: String(filters.page ?? 1),
  });
  if (filters.from) query.set("date_from", filters.from);
  if (filters.to) query.set("date_to", filters.to);
  if (filters.search?.trim()) query.set("search", filters.search.trim());

  const payload = await getFromApi<ApiInvoicesResponse>(
    `/api/v1/auth/clinic/billing/invoices?${query.toString()}`,
    { signal },
  );
  if (!Array.isArray(payload.data) || !payload.meta) {
    throw new ApiError("El servidor devolvió facturas incompletas.", 502);
  }

  return {
    invoices: payload.data.map(mapInvoice),
    pagination: {
      currentPage: payload.meta.current_page,
      lastPage: payload.meta.last_page,
      perPage: payload.meta.per_page,
      total: payload.meta.total,
    },
  };
}

export async function getClinicBillingReport(
  from: string,
  to: string,
  signal?: AbortSignal,
): Promise<ClinicBillingReport> {
  const query = new URLSearchParams({ from, to });
  const payload = await getFromApi<ApiBillingReportResponse>(
    `/api/v1/auth/clinic/billing/report?${query.toString()}`,
    { signal },
  );
  if (!payload.data?.period || !payload.data.by_currency) {
    throw new ApiError("El servidor devolvió un reporte de facturación incompleto.", 502);
  }

  return {
    clinicId: payload.data.clinic_id,
    period: payload.data.period,
    byCurrency: Object.fromEntries(
      Object.entries(payload.data.by_currency).map(([currency, summary]) => [currency, {
        currency: summary.currency,
        invoiceCount: summary.invoice_count,
        invoicedMinor: summary.invoiced_minor,
        outstandingMinor: summary.outstanding_minor,
        paymentCount: summary.payment_count,
        paidMinor: summary.paid_minor,
      }]),
    ),
  };
}

export async function exportClinicBillingReport(
  from: string,
  to: string,
  signal?: AbortSignal,
): Promise<{ blob: Blob; filename: string }> {
  const query = new URLSearchParams({ from, to });
  const file = await getFileFromApi(
    `/api/v1/auth/clinic/billing/report/export?${query.toString()}`,
    { signal },
  );

  return {
    blob: file.blob,
    filename: file.filename ?? `hipocratiq-facturacion-${from}-${to}.csv`,
  };
}

export async function getClinicInvoice(invoiceId: number, signal?: AbortSignal): Promise<ClinicInvoice> {
  const payload = await getFromApi<{ data: ApiInvoice }>(
    `/api/v1/auth/clinic/billing/invoices/${invoiceId}`,
    { signal },
  );
  if (!payload.data) throw new ApiError("El servidor no devolvió el detalle de la factura.", 502);
  return mapInvoice(payload.data);
}

export type CreateClinicInvoicePayload = {
  patientId: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string | null;
  currency: string;
  items: Array<{ description: string; quantity: number; unitAmountMinor: number }>;
};

export async function createClinicInvoice(payload: CreateClinicInvoicePayload): Promise<ClinicInvoice> {
  const response = await postToApi<{ data: ApiInvoice }>("/api/v1/auth/clinic/billing/invoices", {
    patient_id: payload.patientId,
    invoice_number: payload.invoiceNumber,
    issue_date: payload.issueDate,
    due_date: payload.dueDate,
    currency: payload.currency,
    items: payload.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unit_amount_minor: item.unitAmountMinor,
    })),
  });
  if (!response.data) throw new ApiError("El servidor no devolvió la factura creada.", 502);
  return mapInvoice(response.data);
}

export type RecordClinicInvoicePaymentPayload = {
  amountMinor: number;
  currency: string;
  paymentMethod: ClinicPaymentMethod;
  reference?: string | null;
  note?: string | null;
  paidAt?: string;
};

export async function recordClinicInvoicePayment(
  invoiceId: number,
  payload: RecordClinicInvoicePaymentPayload,
): Promise<{ invoice: ClinicInvoice; payment: ClinicInvoicePayment }> {
  const response = await postToApi<{ data: { invoice: ApiInvoice; payment: ApiInvoicePayment } }>(
    `/api/v1/auth/clinic/billing/invoices/${invoiceId}/payments`,
    {
      amount_minor: payload.amountMinor,
      currency: payload.currency,
      payment_method: payload.paymentMethod,
      reference: payload.reference ?? null,
      note: payload.note ?? null,
      paid_at: payload.paidAt,
    },
  );
  if (!response.data?.invoice || !response.data.payment) {
    throw new ApiError("El servidor no devolvió el pago registrado.", 502);
  }
  return {
    invoice: mapInvoice(response.data.invoice),
    payment: mapInvoicePayment(response.data.payment),
  };
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
  return mapMember(response.data, payload.countryCode);
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

function mapPreferencesToApi(preferences: ClinicPreferences): ApiClinicPreferences {
  return {
    maintenance: preferences.maintenance,
    audit: preferences.audit,
    signatures: preferences.signatures,
    backups: preferences.backups,
    emergency: {
      enabled: preferences.emergency.enabled,
      visibility: preferences.emergency.visibility,
      label: preferences.emergency.label,
      color: preferences.emergency.color,
      inheritance: preferences.emergency.inheritance,
      default_channel: preferences.emergency.defaultChannel,
      escalation_minutes: preferences.emergency.escalationMinutes,
      responsibles: preferences.emergency.responsibles,
    },
  };
}

export async function updateClinicSettings(payload: UpdateClinicSettingsPayload): Promise<ClinicAdminInfo> {
  const response = await patchToApi<ApiClinicResponse>("/api/v1/auth/clinic/settings", {
    name: payload.name,
    contact_phone: payload.contactPhone,
    address: payload.address,
    preferences: payload.preferences ? mapPreferencesToApi(payload.preferences) : undefined,
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

export async function deleteClinicAppointment(
  id: number,
): Promise<void> {
  await deleteFromApi(`/api/v1/auth/clinic/appointments/${id}`);
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
  countryCode?: CountryCode;
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
  return mapMember(response.data, payload.countryCode);
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
  return mapMember(response.data, payload.countryCode);
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

function mapSubscription(subscription: ApiSubscription | null): ClinicSubscription | null {
  if (subscription === null) return null;

  return {
    id: subscription.id,
    status: subscription.status,
    billingCycle: subscription.billing_cycle,
    autoRenew: subscription.auto_renew,
    startsAt: subscription.starts_at,
    endsAt: subscription.ends_at,
    provider: subscription.provider,
    plan: subscription.plan === null ? null : {
      id: subscription.plan.id,
      key: subscription.plan.key,
      name: subscription.plan.name,
      description: subscription.plan.description,
      currency: subscription.plan.currency,
      monthlyPriceCents: subscription.plan.monthly_price_cents,
      annualPriceCents: subscription.plan.annual_price_cents,
      features: subscription.plan.features,
    },
    usage: subscription.usage,
  };
}

export async function getClinicSubscription(signal?: AbortSignal): Promise<ClinicSubscription | null> {
  const response = await getFromApi<ApiSubscriptionResponse>('/api/v1/auth/clinic/billing/subscription', { signal });
  if (!response.data || !Object.prototype.hasOwnProperty.call(response.data, 'subscription')) {
    throw new ApiError('El servidor devolvió una suscripción clínica incompleta.', 502);
  }

  return mapSubscription(response.data.subscription);
}

function mapReceptionistPreferences(preferences: ApiReceptionistPreferences): ClinicReceptionistPreferences {
  return {
    newAppointments: preferences.new_appointments,
    arrivals: preferences.arrivals,
    pendingPayments: preferences.pending_payments,
    internalMessages: preferences.internal_messages,
    documents: preferences.documents,
    onlineReception: preferences.online_reception,
    whatsapp: preferences.whatsapp,
    autoPrint: preferences.auto_print,
    duplicateTickets: preferences.duplicate_tickets,
    shiftName: preferences.shift_name,
    shiftStart: preferences.shift_start,
    shiftEnd: preferences.shift_end,
    counterName: preferences.counter_name,
    printerName: preferences.printer_name,
    paperSize: preferences.paper_size,
  };
}

function mapReceptionistSettings(payload: ApiReceptionistSettingsResponse): ClinicReceptionistSettings {
  return {
    profile: {
      id: payload.data.profile.id,
      name: payload.data.profile.name,
      email: payload.data.profile.email,
      phoneNumber: payload.data.profile.phone_number,
      role: payload.data.profile.role,
    },
    clinic: payload.data.clinic,
    settings: {
      persisted: payload.data.settings.persisted,
      updatedAt: payload.data.settings.updated_at,
      preferences: mapReceptionistPreferences(payload.data.settings.preferences),
    },
    operation: {
      twoFactor: payload.data.operation.two_factor,
      cashRegister: payload.data.operation.cash_register,
    },
    metrics: {
      appointmentsToday: payload.data.metrics.appointments_today,
      appointmentsYesterday: payload.data.metrics.appointments_yesterday,
      appointmentsChangePercent: payload.data.metrics.appointments_change_percent,
      unreadMessages: payload.data.metrics.unread_messages,
      pendingPayments: payload.data.metrics.pending_payments,
      cashRegister: {
        status: payload.data.metrics.cash_register.status,
        openedAt: payload.data.metrics.cash_register.opened_at,
      },
    },
  };
}

export async function getClinicReceptionistSettings(signal?: AbortSignal): Promise<ClinicReceptionistSettings> {
  return mapReceptionistSettings(await getFromApi<ApiReceptionistSettingsResponse>('/api/v1/auth/clinic/receptionist/settings', { signal }));
}

export async function updateClinicReceptionistSettings(
  preferences: ClinicReceptionistPreferences,
): Promise<ClinicReceptionistSettings> {
  const response = await patchToApi<ApiReceptionistSettingsResponse>('/api/v1/auth/clinic/receptionist/settings', {
    preferences: {
      new_appointments: preferences.newAppointments,
      arrivals: preferences.arrivals,
      pending_payments: preferences.pendingPayments,
      internal_messages: preferences.internalMessages,
      documents: preferences.documents,
      online_reception: preferences.onlineReception,
      whatsapp: preferences.whatsapp,
      auto_print: preferences.autoPrint,
      duplicate_tickets: preferences.duplicateTickets,
      shift_name: preferences.shiftName,
      shift_start: preferences.shiftStart,
      shift_end: preferences.shiftEnd,
      counter_name: preferences.counterName,
      printer_name: preferences.printerName,
      paper_size: preferences.paperSize,
    },
  });

  return mapReceptionistSettings(response);
}

function mapClinicMessage(message: ApiClinicMessage): ClinicMessage {
  return {
    id: message.id,
    patientProfileId: message.patient_profile_id,
    sender: message.sender,
    recipient: message.recipient,
    body: message.body,
    isReceived: message.is_received,
    readAt: message.read_at,
    createdAt: message.created_at,
  };
}

function mapMessageContact(contact: ApiMessageContact): ClinicMessageContact {
  return {
    userId: contact.user_id,
    kind: contact.kind,
    name: contact.name,
    email: contact.email,
    phoneNumber: contact.phone_number,
    patientProfileId: contact.patient_profile_id,
    role: contact.role,
    roleName: contact.role_name,
    specialty: contact.specialty,
    status: contact.status,
    unread: contact.unread,
    lastMessage: contact.last_message === null ? null : {
      body: contact.last_message.body,
      createdAt: contact.last_message.created_at,
    },
  };
}

function mapClinicMessages(payload: ApiMessagesResponse): ClinicMessagesData {
  return {
    contacts: payload.data.contacts.map(mapMessageContact),
    selectedContactId: payload.data.selected_contact_id,
    messages: payload.data.messages.map(mapClinicMessage),
    unread: payload.meta.unread,
  };
}

export async function getClinicMessages(contactUserId?: number, signal?: AbortSignal): Promise<ClinicMessagesData> {
  const query = contactUserId === undefined ? '' : `?contact_user_id=${encodeURIComponent(String(contactUserId))}`;
  return mapClinicMessages(await getFromApi<ApiMessagesResponse>(`/api/v1/auth/clinic/messages${query}`, { signal }));
}

export async function sendClinicMessage(payload: {
  recipientUserId: number;
  patientProfileId?: number | null;
  body: string;
}): Promise<ClinicMessage> {
  const response = await postToApi<{ data: ApiClinicMessage }>('/api/v1/auth/clinic/messages', {
    recipient_user_id: payload.recipientUserId,
    patient_profile_id: payload.patientProfileId ?? undefined,
    body: payload.body,
  });
  if (!response.data) throw new ApiError('El servidor no devolvió el mensaje enviado.', 502);
  return mapClinicMessage(response.data);
}

export async function markClinicMessageRead(messageId: number): Promise<ClinicMessage> {
  const response = await patchToApi<{ data: ApiClinicMessage }>(`/api/v1/auth/clinic/messages/${messageId}/read`);
  if (!response.data) throw new ApiError('El servidor no devolvió el mensaje actualizado.', 502);
  return mapClinicMessage(response.data);
}

function mapEpidemiology(payload: ApiEpidemiologyResponse): ClinicEpidemiologyData {
  const data = payload.data;
  return {
    generatedAt: data.generated_at,
    period: data.period,
    analysisAvailable: data.analysis_available,
    message: data.message,
    metrics: {
      monitoredPatients: data.metrics.monitored_patients,
      activeAlerts: data.metrics.active_alerts,
      highRiskCases: data.metrics.high_risk_cases,
      trend: data.metrics.trend,
      appointments: data.metrics.appointments,
      consultations: data.metrics.consultations,
      laboratoryOrders: data.metrics.laboratory_orders,
      teleconsultations: data.metrics.teleconsultations,
      prescriptions: data.metrics.prescriptions,
    },
    trend: data.trend.map((item) => ({
      month: item.month,
      label: item.label,
      appointments: item.appointments,
      consultations: item.consultations,
      laboratoryOrders: item.laboratory_orders,
    })),
    forecasts: data.forecasts,
    alerts: data.alerts,
    recommendations: data.recommendations,
    map: data.map,
    sources: data.sources,
  };
}

export async function getClinicEpidemiology(signal?: AbortSignal): Promise<ClinicEpidemiologyData> {
  return mapEpidemiology(await getFromApi<ApiEpidemiologyResponse>('/api/v1/auth/clinic/epidemiology', { signal }));
}

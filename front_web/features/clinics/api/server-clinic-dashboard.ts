import { cookies } from "next/headers";
import type { ClinicDashboardData, ClinicEmergencyGlobalOverride, ClinicEmergencyPolicy, ClinicEmergencyState, ClinicPreferences } from "@/features/clinics/model/clinic-admin.types";
import { serverEnv } from "@/shared/config/server-env";

const DASHBOARD_REQUEST_TIMEOUT_MS = 5_000;
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

type ApiEmergencyPolicy = {
  enabled?: boolean;
  visibility?: ClinicEmergencyPolicy["visibility"];
  label?: string;
  color?: ClinicEmergencyPolicy["color"];
  inheritance?: ClinicEmergencyPolicy["inheritance"];
  default_channel?: ClinicEmergencyPolicy["defaultChannel"];
  escalation_minutes?: ClinicEmergencyPolicy["escalationMinutes"];
  responsibles?: Array<{ role: string; channel: string }>;
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

type ApiClinicPreferences = Partial<Omit<ClinicPreferences, "emergency">> & { emergency?: ApiEmergencyPolicy | null };

type ApiDashboard = {
  data: {
    clinic: { id: number; name: string; country_code: "MX" | "PE" | "US"; contact_phone: string; address: string; status: "active" | "suspended"; preferences?: ApiClinicPreferences | null; emergency?: ApiClinicEmergency | null };
    subscription: { plan: string | null; status: string | null; billing_cycle: string | null };
    metrics: { staff_total: number; doctors_total: number; receptionists_total: number; patients_total: number };
    appointment_summary: {
      today_total: number;
      confirmed: number;
      pending: number;
      waiting: number;
      in_consultation: number;
      no_show: number;
      canceled: number;
    };
    today_appointments: Array<{
      id: number;
      scheduled_at: string;
      scheduled_date: string;
      time: string;
      appointment_type: string;
      status: "pending" | "confirmed" | "waiting" | "in_consultation" | "completed" | "canceled" | "no_show";
      status_label: string;
      patient: { id: number; patient_code: string; name: string | null; phone_number: string | null };
      doctor: { id: number; name: string; specialty: string | null } | null;
    }>;
    team: Array<{ id: number; name: string; email: string | null; phone_number: string; status: "pending_verification" | "active" | "suspended" | "disabled"; role: "clinic_admin" | "receptionist" | "doctor"; role_name: string; specialty: string | null; medical_license: string | null; last_login_at: string | null }>;
    recent_patients: Array<{ id: number; patient_code: string; name: string | null; email: string | null; phone_number: string | null; status: "pending_verification" | "active" | "suspended" | "disabled" | null; created_at: string | null; age: number | null; insurance?: string | null; is_returning_patient?: boolean; whatsapp_consent?: boolean }>;
  };
};

function mapEmergencyPolicy(policy: ApiEmergencyPolicy | null | undefined): ClinicEmergencyPolicy {
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

function mapEmergencyState(emergency: ApiClinicEmergency | null | undefined, fallback: ClinicEmergencyPolicy): ClinicEmergencyState {
  if (!emergency) {
    return { local: fallback, effective: fallback, isOverridden: false, globalOverride: null };
  }

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

export async function getClinicDashboardServer(): Promise<ClinicDashboardData | null> {
  try {
    const response = await fetch(`${serverEnv.backendUrl}/api/v1/auth/clinic/dashboard`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Cookie: (await cookies()).toString(),
        Origin: serverEnv.appUrl,
      },
      signal: AbortSignal.timeout(DASHBOARD_REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) return null;
    const payload = (await response.json()) as ApiDashboard;
    const data = payload.data;
    if (!data?.clinic || !Array.isArray(data.team) || !Array.isArray(data.recent_patients)) return null;

    return {
      clinic: {
        id: data.clinic.id,
        name: data.clinic.name,
        countryCode: data.clinic.country_code,
        contactPhone: data.clinic.contact_phone,
        address: data.clinic.address,
        status: data.clinic.status,
        preferences: {
          ...DEFAULT_CLINIC_PREFERENCES,
          maintenance: data.clinic.preferences?.maintenance ?? DEFAULT_CLINIC_PREFERENCES.maintenance,
          audit: data.clinic.preferences?.audit ?? DEFAULT_CLINIC_PREFERENCES.audit,
          signatures: data.clinic.preferences?.signatures ?? DEFAULT_CLINIC_PREFERENCES.signatures,
          backups: data.clinic.preferences?.backups ?? DEFAULT_CLINIC_PREFERENCES.backups,
          emergency: mapEmergencyPolicy(data.clinic.preferences?.emergency),
        },
        emergency: mapEmergencyState(data.clinic.emergency, mapEmergencyPolicy(data.clinic.preferences?.emergency)),
      },
      subscription: {
        plan: data.subscription.plan,
        status: data.subscription.status,
        billingCycle: data.subscription.billing_cycle,
      },
      metrics: {
        staffTotal: data.metrics.staff_total,
        doctorsTotal: data.metrics.doctors_total,
        receptionistsTotal: data.metrics.receptionists_total,
        patientsTotal: data.metrics.patients_total,
      },
      appointmentSummary: {
        todayTotal: data.appointment_summary.today_total,
        confirmed: data.appointment_summary.confirmed,
        pending: data.appointment_summary.pending,
        waiting: data.appointment_summary.waiting,
        inConsultation: data.appointment_summary.in_consultation,
        noShow: data.appointment_summary.no_show,
        canceled: data.appointment_summary.canceled,
      },
      todayAppointments: data.today_appointments.map((appointment) => ({
        id: appointment.id,
        scheduledAt: appointment.scheduled_at,
        scheduledDate: appointment.scheduled_date,
        time: appointment.time,
        appointmentType: appointment.appointment_type,
        status: appointment.status,
        statusLabel: appointment.status_label,
        patient: {
          id: appointment.patient.id,
          patientCode: appointment.patient.patient_code,
          name: appointment.patient.name,
          phoneNumber: appointment.patient.phone_number,
        },
        doctor: appointment.doctor,
      })),
      team: data.team.map((member) => ({
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
      })),
      recentPatients: data.recent_patients.map((patient) => ({
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
        lastAppointment: null,
        nextAppointment: null,
      })),
    };
  } catch {
    return null;
  }
}

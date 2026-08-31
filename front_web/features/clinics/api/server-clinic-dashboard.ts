import { cookies } from "next/headers";
import type { ClinicDashboardData } from "@/features/clinics/model/clinic-admin.types";
import { serverEnv } from "@/shared/config/server-env";

type ApiDashboard = {
  data: {
    clinic: { id: number; name: string; country_code: "MX" | "PE" | "US"; contact_phone: string; address: string; status: "active" | "suspended" };
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
      notes: string | null; 
      status: "pending" | "confirmed" | "waiting" | "in_consultation" | "completed" | "canceled" | "no_show";
      status_label: string;
      patient: { id: number; patient_code: string; name: string | null; phone_number: string | null };
      doctor: { id: number; name: string; specialty: string | null } | null;

    }>;
    team: Array<{ id: number; name: string; email: string | null; phone_number: string; status: "pending_verification" | "active" | "suspended" | "disabled"; role: "clinic_admin" | "receptionist" | "doctor"; role_name: string; specialty: string | null; medical_license: string | null; last_login_at: string | null }>;
    recent_patients: Array<{ id: number; patient_code: string; name: string | null; email: string | null; phone_number: string | null; status: "pending_verification" | "active" | "suspended" | "disabled" | null; created_at: string | null }>;
  };
};

export async function getClinicDashboardServer(): Promise<ClinicDashboardData | null> {
  try {
    const response = await fetch(`${serverEnv.backendUrl}/api/v1/auth/clinic/dashboard`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Cookie: (await cookies()).toString(),
        Origin: serverEnv.appUrl,
      },
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
        notes: appointment.notes ?? null, 
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
      })),
    };
  } catch {
    return null;
  }
}

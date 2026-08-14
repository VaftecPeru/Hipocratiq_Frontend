import { cookies } from "next/headers";
import type { ClinicDashboardData } from "@/features/clinics/model/clinic-admin.types";
import { serverEnv } from "@/shared/config/server-env";

type ApiDashboard = {
  data: {
    clinic: { id: number; name: string; country_code: "MX" | "PE" | "US"; contact_phone: string; address: string; status: "active" | "suspended" };
    subscription: { plan: string | null; status: string | null; billing_cycle: string | null };
    metrics: { staff_total: number; doctors_total: number; receptionists_total: number; patients_total: number };
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


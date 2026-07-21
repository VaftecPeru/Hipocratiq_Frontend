import { cookies } from "next/headers";
import { clinicsDashboardData } from "@/features/clinics/model/clinic.data";
import type { Clinic, ClinicsDashboardData } from "@/features/clinics/model/clinic.types";
import { serverEnv } from "@/shared/config/server-env";

type ApiClinic = {
  id: number;
  name: string;
  country_code: "MX" | "PE" | "US";
  address: string;
  plan: "basic" | "professional" | "enterprise";
  users: number;
  patients: number;
  status: "active" | "suspended";
  monthly_billing: number;
  last_payment: string | null;
};

export async function getClinicsDashboardData(): Promise<ClinicsDashboardData> {
  try {
    const response = await fetch(`${serverEnv.backendUrl}/api/v1/auth/admin/clinics`, {
      cache: "no-store",
      headers: { Accept: "application/json", Cookie: (await cookies()).toString(), Origin: serverEnv.appUrl },
    });
    if (!response.ok) return clinicsDashboardData;
    const payload = (await response.json()) as { data: ApiClinic[] };
    if (payload.data.length === 0) return clinicsDashboardData;
    const countryNames = { MX: "México", PE: "Perú", US: "Estados Unidos" } as const;
    const registered: Clinic[] = payload.data.map((clinic) => ({
      id: 100000 + clinic.id,
      name: clinic.name,
      countryCode: clinic.country_code,
      country: countryNames[clinic.country_code],
      city: clinic.address,
      plan: clinic.plan,
      users: clinic.users,
      patients: clinic.patients,
      status: clinic.status,
      monthlyBilling: clinic.monthly_billing,
      lastPayment: clinic.last_payment,
    }));
    const clinics = [...registered, ...clinicsDashboardData.clinics];
    return {
      ...clinicsDashboardData,
      clinics,
      totals: {
        ...clinicsDashboardData.totals,
        clinics: clinicsDashboardData.totals.clinics + registered.length,
        activeClinics: clinicsDashboardData.totals.activeClinics + registered.filter((clinic) => clinic.status === "active").length,
        suspendedClinics: clinicsDashboardData.totals.suspendedClinics + registered.filter((clinic) => clinic.status === "suspended").length,
        users: clinicsDashboardData.totals.users + registered.reduce((total, clinic) => total + clinic.users, 0),
        monthlyRevenue: clinicsDashboardData.totals.monthlyRevenue + registered.reduce((total, clinic) => total + clinic.monthlyBilling, 0),
      },
      recentActivity: [
        ...registered.slice(0, 3).map((clinic, index) => ({ id: 100000 + index, type: "clinic" as const, title: "Nueva clínica", detail: `${clinic.name} · ${clinic.country}`, occurredAt: "Registro reciente" })),
        ...clinicsDashboardData.recentActivity,
      ],
    };
  } catch {
    return clinicsDashboardData;
  }
}

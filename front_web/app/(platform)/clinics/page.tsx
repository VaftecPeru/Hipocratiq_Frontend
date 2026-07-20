import type { Metadata } from "next";
import { getClinicsDashboardData } from "@/features/clinics/api/server-clinics";
import { ClinicsDashboard } from "@/features/clinics/ui/clinics-dashboard";

export const metadata: Metadata = {
  title: "Clínicas",
  description: "Administración global de clínicas y tenants.",
};

export default async function ClinicsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [{ q = "" }, clinicsDashboardData] = await Promise.all([
    searchParams,
    getClinicsDashboardData(),
  ]);

  return <ClinicsDashboard initialData={clinicsDashboardData} initialSearch={q} />;
}

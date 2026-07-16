import type { Metadata } from "next";
import { clinicsDashboardData } from "@/features/clinics/model/clinic.data";
import { ClinicsDashboard } from "@/features/clinics/ui/clinics-dashboard";

export const metadata: Metadata = {
  title: "Clínicas",
  description: "Administración global de clínicas y tenants.",
};

export default async function ClinicsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;

  return <ClinicsDashboard initialData={clinicsDashboardData} initialSearch={q} />;
}

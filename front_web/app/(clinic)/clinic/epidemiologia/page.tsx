import type { Metadata } from "next";
import { requireClinicRole } from "@/features/auth/api/server-session";
import { ClinicEpidemiology } from "@/features/clinics/ui/clinic-epidemiology";

export const metadata: Metadata = { title: "IA Epidemiológica" };
export default async function ClinicEpidemiologyPage() {
  await requireClinicRole("clinic_admin");
  return <ClinicEpidemiology />;
}

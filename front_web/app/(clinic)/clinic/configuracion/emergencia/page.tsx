import type { Metadata } from "next";
import { requireClinicRole } from "@/features/auth/api/server-session";
import { ClinicEmergencySettings } from "@/features/clinics/ui/clinic-emergency-settings";

export const metadata: Metadata = { title: "Botón de Emergencia" };
export default async function ClinicEmergencyPage() {
  await requireClinicRole("clinic_admin");
  return <ClinicEmergencySettings />;
}

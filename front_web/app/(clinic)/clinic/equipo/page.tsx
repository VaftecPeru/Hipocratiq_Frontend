import type { Metadata } from "next";
import { requireClinicRole } from "@/features/auth/api/server-session";
import { ClinicTeam } from "@/features/clinics/ui/clinic-team";

export const metadata: Metadata = { title: "Equipo" };

export default async function ClinicTeamPage() {
  await requireClinicRole("clinic_admin");
  return <ClinicTeam />;
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { ClinicTeam } from "@/features/clinics/ui/clinic-team";

export const metadata: Metadata = { title: "Equipo" };

export default async function ClinicTeamPage() {
  const session = await getAuthenticatedSession();

  if (!session || session.actor_context !== "clinic_admin") {
    redirect("/clinic/dashboard");
  }

  return <ClinicTeam />;
}

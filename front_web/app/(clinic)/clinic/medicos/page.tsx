import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { ClinicDoctors } from "@/features/clinics/ui/clinic-doctors";

export const metadata: Metadata = { title: "Médicos" };

export default async function ClinicDoctorsPage() {
  const session = await getAuthenticatedSession();

  if (!session || (session.actor_context !== "clinic_admin" && session.actor_context !== "receptionist")) {
    redirect("/clinic/dashboard");
  }

  return <ClinicDoctors canManageMembers={session.actor_context === "clinic_admin"} />;
}

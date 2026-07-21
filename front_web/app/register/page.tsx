import { redirect } from "next/navigation";
import { ClinicRegistrationFlow } from "@/features/auth/ui/clinic-registration-flow";
import { RegistrationShell } from "@/features/auth/ui/registration-shell";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";

export default async function RegisterPage() {
  const session = await getAuthenticatedSession();
  if (session) redirect(session.actor_context === "clinic_admin" ? "/clinic/dashboard" : session.actor_context === "doctor" ? "/doctor/dashboard" : "/dashboard");
  return <RegistrationShell><ClinicRegistrationFlow /></RegistrationShell>;
}

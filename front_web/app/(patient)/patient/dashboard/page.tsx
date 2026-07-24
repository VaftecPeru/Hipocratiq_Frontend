import { redirect } from "next/navigation";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { PatientDashboard } from "@/features/patients/ui/patient-dashboard";

export default async function PatientDashboardPage() {
  const session = await getAuthenticatedSession();
  if (!session || session.actor_context !== "patient") redirect("/");
  return <PatientDashboard user={session.user} />;
}

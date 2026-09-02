import { redirect } from "next/navigation";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { PatientPortalView } from "@/features/patients/ui/patient-portal";

export default async function PatientHistoryPage() {
  const session = await getAuthenticatedSession();
  if (!session || session.actor_context !== "patient") redirect("/");
  return <PatientPortalView user={session.user} view="history" />;
}

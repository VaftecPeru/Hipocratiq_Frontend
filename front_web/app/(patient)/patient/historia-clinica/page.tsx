import { redirect } from "next/navigation";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { PatientIntakeForm } from "@/features/patients/ui/patient-intake-form";

export default async function PatientClinicalHistoryPage() {
  const session = await getAuthenticatedSession();
  if (!session || session.actor_context !== "patient") redirect("/");

  return <PatientIntakeForm />;
}

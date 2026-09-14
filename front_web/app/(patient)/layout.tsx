import { redirect } from "next/navigation";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { PatientShell } from "@/features/patients/ui/patient-shell";

export default async function PatientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getAuthenticatedSession();
  if (!session) redirect("/");
  if (session.actor_context !== "patient") {
    redirect(
      session.actor_context === "clinic_admin" ? "/clinic/dashboard"
      : session.actor_context === "doctor" ? "/doctor/dashboard"
      : "/dashboard",
    );
  }

  return (
    <PatientShell
      userName={session.user.name}
    >
      {children}
    </PatientShell>
  );
}

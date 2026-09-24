import { redirect } from "next/navigation";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { PatientShell } from "@/features/patients/ui/patient-shell";
import { dashboardPathForActorContext } from "@/features/auth/lib/dashboard-path";

export default async function PatientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getAuthenticatedSession();
  if (!session) redirect("/");
  if (session.actor_context !== "patient") {
    redirect(dashboardPathForActorContext(session.actor_context));
  }

  return (
    <PatientShell
      userName={session.user.name}
    >
      {children}
    </PatientShell>
  );
}

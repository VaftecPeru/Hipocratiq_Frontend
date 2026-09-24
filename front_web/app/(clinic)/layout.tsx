import { redirect } from "next/navigation";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { ClinicShell } from "@/features/platform/ui/clinic-shell";
import { dashboardPathForActorContext } from "@/features/auth/lib/dashboard-path";

export default async function ClinicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getAuthenticatedSession();
  if (!session) redirect("/");
  if (session.actor_context !== "clinic_admin" && session.actor_context !== "receptionist") {
    redirect(dashboardPathForActorContext(session.actor_context));
  }
  if (!session.user.clinic) {
    redirect("/unauthorized?reason=clinic-context-required");
  }
  return <ClinicShell actorContext={session.actor_context} clinicName={session.user.clinic.name} userName={session.user.name}>{children}</ClinicShell>;
}

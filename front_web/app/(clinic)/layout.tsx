import { redirect } from "next/navigation";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { ClinicShell } from "@/features/platform/ui/clinic-shell";

export default async function ClinicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getAuthenticatedSession();
  if (!session) redirect("/");
  if (session.actor_context !== "clinic_admin" || !session.user.clinic) redirect("/dashboard");
  return <ClinicShell clinicName={session.user.clinic.name} userName={session.user.name}>{children}</ClinicShell>;
}

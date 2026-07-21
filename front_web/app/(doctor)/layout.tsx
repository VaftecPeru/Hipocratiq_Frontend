import { redirect } from "next/navigation";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { DoctorShell } from "@/features/doctors/ui/doctor-shell";

export default async function DoctorLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getAuthenticatedSession();
  if (!session) redirect("/");
  if (session.actor_context !== "doctor" || !session.user.doctor) redirect("/dashboard");

  const subtitle = session.user.doctor.practice_type === "clinic"
    ? session.user.doctor.clinic?.name ?? "Médico afiliado"
    : `Práctica independiente · ${session.user.doctor.plan ?? "Plan activo"}`;

  return <DoctorShell userName={session.user.name} subtitle={subtitle}>{children}</DoctorShell>;
}

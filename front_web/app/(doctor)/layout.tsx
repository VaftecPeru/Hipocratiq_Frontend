import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { DoctorShell } from "@/features/doctors/ui/doctor-shell";
import { dashboardPathForActorContext } from "@/features/auth/lib/dashboard-path";

export default async function DoctorLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getAuthenticatedSession();
  const locale = await getLocale();
  if (!session) redirect("/");
  if (session.actor_context !== "doctor") redirect(dashboardPathForActorContext(session.actor_context));
  if (!session.user.doctor) redirect("/unauthorized?reason=doctor-profile-required");

  const subtitle = session.user.doctor.practice_type === "clinic"
    ? session.user.doctor.clinic?.name ?? "Médico afiliado"
    : `Práctica independiente · ${session.user.doctor.plan ?? "Plan activo"}`;
  const practiceName = session.user.doctor.practice_type === "clinic"
    ? session.user.doctor.clinic?.name ?? "Clínica asignada"
    : "Práctica independiente";
  const practiceDetail = session.user.doctor.practice_type === "clinic"
    ? "Contexto clínico activo"
    : `Plan ${session.user.doctor.plan ?? "activo"}`;
  const currentDate = new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(new Date());

  return <DoctorShell userName={session.user.name} subtitle={subtitle} practiceName={practiceName} practiceDetail={practiceDetail} currentDate={currentDate}>{children}</DoctorShell>;
}

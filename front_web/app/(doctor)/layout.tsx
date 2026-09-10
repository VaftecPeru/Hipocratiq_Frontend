import { redirect } from "next/navigation";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { DoctorShell } from "@/features/doctors/ui/doctor-shell";

const doctorDateFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "full" });

export default async function DoctorLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getAuthenticatedSession();
  if (!session) redirect("/");
  if (session.actor_context !== "doctor" || !session.user.doctor) redirect("/dashboard");

  const subtitle = session.user.doctor.practice_type === "clinic"
    ? session.user.doctor.clinic?.name ?? "Médico afiliado"
    : `Práctica independiente · ${session.user.doctor.plan ?? "Plan activo"}`;
  const practiceName = session.user.doctor.practice_type === "clinic"
    ? session.user.doctor.clinic?.name ?? "Clínica asignada"
    : "Práctica independiente";
  const practiceDetail = session.user.doctor.practice_type === "clinic"
    ? "Contexto clínico activo"
    : `Plan ${session.user.doctor.plan ?? "activo"}`;
  const currentDate = doctorDateFormatter.format(new Date());

  return <DoctorShell userName={session.user.name} subtitle={subtitle} practiceName={practiceName} practiceDetail={practiceDetail} currentDate={currentDate}>{children}</DoctorShell>;
}

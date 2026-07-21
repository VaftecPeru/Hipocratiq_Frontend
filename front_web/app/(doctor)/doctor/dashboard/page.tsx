import { CalendarDays, ClipboardCheck, Stethoscope, Users } from "lucide-react";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";

const actions = [
  { label: "Próxima cita", value: "Sin citas pendientes", icon: CalendarDays },
  { label: "Pacientes activos", value: "0 pacientes", icon: Users },
  { label: "Notas por completar", value: "0 pendientes", icon: ClipboardCheck },
];

export default async function DoctorDashboardPage() {
  const session = await getAuthenticatedSession();
  const doctor = session?.user.doctor;

  return (
    <div className="mx-auto w-full max-w-300 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-[0.62rem] font-extrabold tracking-[0.13em] text-accent uppercase">Espacio profesional</p><h1 className="mt-1 text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-[-0.04em]">Hola, {session?.user.name}</h1><p className="mt-2 text-[0.74rem] text-muted">Gestiona tu práctica médica desde un solo lugar.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full bg-success-soft px-3 py-2 text-[0.62rem] font-extrabold text-success"><span aria-hidden="true">●</span>Cuenta verificada</span></div>
      <section className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Resumen médico">{actions.map(({ label, value, icon: Icon }) => <article className="rounded-xl border border-line bg-white p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" key={label}><span className="grid size-9 place-items-center rounded-lg bg-accent-soft text-accent"><Icon className="size-4" aria-hidden="true" /></span><p className="mt-4 text-[0.62rem] font-bold text-muted">{label}</p><p className="mt-1 text-sm font-extrabold">{value}</p></article>)}</section>
      <section className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"><article className="rounded-xl border border-line bg-white p-5"><h2 className="text-sm font-extrabold">Tu agenda</h2><div className="mt-8 grid place-items-center py-10 text-center"><span className="grid size-12 place-items-center rounded-full bg-surface-subtle text-muted"><CalendarDays className="size-5" aria-hidden="true" /></span><p className="mt-4 text-xs font-bold">Todavía no tienes citas programadas</p><p className="mt-1 text-[0.68rem] text-muted">Tus próximas consultas aparecerán aquí.</p></div></article><article className="rounded-xl border border-line bg-white p-5"><h2 className="text-sm font-extrabold">Perfil profesional</h2><dl className="mt-5 grid gap-4 text-[0.68rem]"><div><dt className="font-bold text-muted">Especialidad</dt><dd className="mt-1 font-extrabold">{doctor?.specialty}</dd></div><div><dt className="font-bold text-muted">Licencia</dt><dd className="mt-1 font-mono font-bold">{doctor?.medical_license}</dd></div><div><dt className="font-bold text-muted">Modalidad</dt><dd className="mt-1 flex items-center gap-2 font-extrabold"><Stethoscope className="size-3.5 text-accent" aria-hidden="true" />{doctor?.practice_type === "clinic" ? `Afiliado a ${doctor.clinic?.name}` : `Independiente · Plan ${doctor?.plan}`}</dd></div></dl></article></section>
    </div>
  );
}

import {
  CalendarCheck2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  HeartPulse,
  Plus,
  Video,
} from "lucide-react";
import {
  DoctorAvatar,
  DoctorCard,
  MetricCard,
  SectionHeading,
  StatusBadge,
} from "@/features/doctors/ui/doctor-primitives";

const metrics = [
  { label: "Consultas hoy", value: "12", icon: CalendarDays, tone: "blue" as const },
  { label: "Confirmadas", value: "9", trend: "75%", icon: CalendarCheck2, tone: "green" as const },
  { label: "Pendientes", value: "3", trend: "25%", icon: Clock3, tone: "orange" as const },
  { label: "Teleconsultas", value: "2", trend: "17%", icon: Video, tone: "violet" as const },
] as const;

const appointments = [
  { time: "09:00", initials: "ML", patient: "María Fernanda López", record: "FEM-1987-0456", type: "Control", reason: "Control cardiológico", detail: "Seguimiento de hipertensión", status: "Confirmada", statusTone: "green" as const, avatarTone: "orange" as const },
  { time: "10:30", initials: "JP", patient: "Juan Pérez", record: "MASC-1973-0921", type: "Seguimiento", reason: "Hipertensión arterial", detail: "Revisión de tratamiento", status: "Pendiente", statusTone: "orange" as const, avatarTone: "blue" as const },
  { time: "12:00", initials: "AT", patient: "Ana Torres", record: "FEM-1965-3342", type: "Teleconsulta  ◫", reason: "Control prenatal", detail: "Segundo trimestre", status: "Confirmada", statusTone: "green" as const, avatarTone: "slate" as const },
  { time: "14:30", initials: "PG", patient: "Pedro García", record: "MASC-1982-4512", type: "Post operatorio", reason: "Post operatorio", detail: "Revisión post angioplastia", status: "Confirmada", statusTone: "green" as const, avatarTone: "orange" as const },
  { time: "16:00", initials: "CM", patient: "Carlos Méndez", record: "MASC-1960-3876", type: "Consulta nueva", reason: "Dolor torácico", detail: "Evaluación inicial", status: "Pendiente", statusTone: "orange" as const, avatarTone: "slate" as const },
  { time: "17:30", initials: "", patient: "Horario bloqueado", record: "Tiempo personal", type: "", reason: "Bloqueo de horario", detail: "Actividad personal", status: "Bloqueado", statusTone: "slate" as const, avatarTone: "slate" as const },
] as const;

const upcoming = [
  { initials: "LM", name: "Lucía Ramírez", time: "Mañana · 09:00 AM", type: "Control", tone: "green" as const, avatarTone: "orange" as const },
  { initials: "RS", name: "Roberto Silva", time: "Mañana · 11:30 AM", type: "Seguimiento", tone: "orange" as const, avatarTone: "blue" as const },
  { initials: "SH", name: "Sofía Herrera", time: "Viernes · 09:00 AM", type: "Teleconsulta", tone: "blue" as const, avatarTone: "slate" as const },
] as const;

export default function DoctorAgendaPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.65rem]">Agenda Médica</h1><p className="mt-1 text-[0.68rem] font-bold text-ink-secondary">Organiza tus consultas y gestiona tu horario de atención.</p></div>
        <div className="flex gap-2"><button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3 text-[0.65rem] font-extrabold hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button"><Clock3 className="size-3.5" aria-hidden="true" />Bloquear horario</button><button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-accent px-3.5 text-[0.65rem] font-extrabold text-white shadow-[0_5px_14px_rgb(8_98_221/18%)] hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus" type="button"><Plus className="size-3.5" aria-hidden="true" />Nueva Consulta</button></div>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Resumen de agenda">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]" aria-label="Agenda del día">
        <DoctorCard className="min-w-0 overflow-hidden">
          <div className="flex items-center gap-5 border-b border-line px-4 pt-3 text-[0.66rem] font-extrabold sm:px-5">
            <button className="relative pb-3 text-accent after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-accent focus-visible:outline-3 focus-visible:outline-focus" type="button">Día</button>
            <button className="pb-3 text-ink-secondary hover:text-ink focus-visible:outline-3 focus-visible:outline-focus" type="button">Semana</button>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 sm:px-5">
            <button className="grid size-8 place-items-center rounded-lg border border-line text-ink-secondary hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Día anterior"><ChevronLeft className="size-4" aria-hidden="true" /></button>
            <button className="grid size-8 place-items-center rounded-lg border border-line text-ink-secondary hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Seleccionar fecha"><CalendarDays className="size-3.5" aria-hidden="true" /></button>
            <strong className="mx-1 text-[0.67rem] font-extrabold sm:mx-2">Jueves, 16 de Mayo 2024</strong>
            <button className="grid size-8 place-items-center rounded-lg border border-line text-ink-secondary hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Día siguiente"><ChevronRight className="size-4" aria-hidden="true" /></button>
            <button className="rounded-lg border border-accent/15 bg-accent-soft px-3 py-2 text-[0.62rem] font-extrabold text-accent focus-visible:outline-3 focus-visible:outline-focus" type="button">Hoy</button>
            <div className="ml-auto flex gap-2"><button className="hidden min-h-8 items-center gap-2 rounded-lg border border-line px-3 text-[0.61rem] font-extrabold sm:inline-flex" type="button">Todas las consultas⌄</button><button className="grid size-8 place-items-center rounded-lg border border-line text-ink-secondary hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Filtrar agenda"><Filter className="size-3.5" aria-hidden="true" /></button></div>
          </div>
          <div className="px-4 pb-3 pt-3 sm:px-5"><p className="mb-2 text-[0.65rem] font-extrabold">Agenda del día</p><div className="overflow-x-auto rounded-lg border border-line"><table className="w-full min-w-[760px] border-collapse text-left"><thead><tr className="border-b border-line bg-surface-subtle text-[0.56rem] font-extrabold text-ink-secondary"><th className="w-20 px-3 py-2.5 font-extrabold">Hora</th><th className="px-3 py-2.5 font-extrabold">Paciente</th><th className="w-32 px-3 py-2.5 font-extrabold">Tipo</th><th className="px-3 py-2.5 font-extrabold">Consulta</th><th className="w-28 px-3 py-2.5 font-extrabold">Estado</th></tr></thead><tbody>{appointments.map((appointment) => <tr className="border-b border-line last:border-0 hover:bg-surface-subtle" key={`${appointment.time}-${appointment.patient}`}><td className="px-3 py-2.5 align-middle font-mono text-[0.64rem] font-extrabold">{appointment.time}</td><td className="px-3 py-2.5"><div className="flex items-center gap-2.5"><DoctorAvatar initials={appointment.initials || "◷"} tone={appointment.avatarTone} size="md" /><div><p className="text-[0.63rem] font-extrabold">{appointment.patient}</p><p className="mt-0.5 text-[0.55rem] font-bold text-ink-secondary">{appointment.record}</p></div></div></td><td className="px-3 py-2.5"><StatusBadge tone={appointment.type.includes("Tele") ? "blue" : appointment.statusTone}>{appointment.type || " "}</StatusBadge></td><td className="px-3 py-2.5"><p className="text-[0.64rem] font-extrabold">{appointment.reason}</p><p className="mt-0.5 text-[0.55rem] font-bold text-ink-secondary">{appointment.detail}</p></td><td className="px-3 py-2.5"><StatusBadge tone={appointment.statusTone}>{appointment.status}</StatusBadge></td></tr>)}</tbody></table></div></div>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-[0.59rem] font-bold text-ink-secondary sm:px-5"><span>Mostrando 6 de 12 consultas</span><button className="text-accent hover:text-accent-hover focus-visible:outline-3 focus-visible:outline-focus" type="button">Ver agenda semanal completa ›</button></footer>
        </DoctorCard>

        <aside className="grid gap-4">
          <DoctorCard className="p-4"><SectionHeading title="Próximas consultas" action="Ver todas" /><ul className="mt-3 divide-y divide-line">{upcoming.map((appointment) => <li className="flex items-center gap-2.5 py-2.5 first:pt-0 last:pb-0" key={appointment.name}><DoctorAvatar initials={appointment.initials} tone={appointment.avatarTone} size="sm" /><span className="min-w-0 flex-1"><span className="block text-[0.6rem] font-extrabold">{appointment.time}</span><span className="mt-0.5 block truncate text-[0.61rem] font-extrabold">{appointment.name}</span></span><StatusBadge tone={appointment.tone}>{appointment.type}</StatusBadge></li>)}</ul></DoctorCard>

          <DoctorCard className="p-4"><div className="flex items-center justify-between gap-3"><div><h2 className="text-[0.82rem] font-extrabold">Disponibilidad de hoy</h2><p className="mt-1 text-[0.58rem] font-bold text-ink-secondary">Jornada: 08:00 AM - 06:00 PM</p></div><button className="text-[0.61rem] font-extrabold text-accent focus-visible:outline-3 focus-visible:outline-focus" type="button">Editar</button></div><div className="mt-3 flex h-2 overflow-hidden rounded-full bg-surface-subtle"><span className="w-[30%] bg-success" /><span className="w-[47%] bg-accent" /><span className="w-[23%] bg-line-strong" /></div><div className="mt-3 grid grid-cols-3 gap-2 text-[0.55rem] font-bold text-ink-secondary"><span><i className="mr-1 inline-block size-2 rounded-full bg-success" />Disponible<strong className="mt-1 block text-[0.62rem] text-ink">4h 15m</strong></span><span><i className="mr-1 inline-block size-2 rounded-full bg-accent" />En consulta<strong className="mt-1 block text-[0.62rem] text-ink">5h 30m</strong></span><span><i className="mr-1 inline-block size-2 rounded-full bg-line-strong" />Bloqueado<strong className="mt-1 block text-[0.62rem] text-ink">1h 15m</strong></span></div></DoctorCard>

          <DoctorCard className="p-4"><div className="flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-[0.82rem] font-extrabold"><span className="grid size-7 place-items-center rounded-lg bg-violet-soft text-violet"><HeartPulse className="size-4" aria-hidden="true" /></span>IA Epidemiológica</h2><button className="text-[0.61rem] font-extrabold text-accent focus-visible:outline-3 focus-visible:outline-focus" type="button">Ver informe ›</button></div><div className="mt-3 rounded-lg border border-line bg-surface-subtle p-3"><p className="text-[0.57rem] font-bold text-ink-secondary">Riesgo actual</p><div className="mt-1 flex items-center justify-between"><strong className="text-lg font-extrabold text-success">Bajo</strong><svg className="h-8 w-24" viewBox="0 0 96 32" aria-hidden="true"><polyline points="2,25 18,18 32,22 47,12 62,18 78,8 94,2" className="fill-none stroke-success" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div><p className="text-[0.56rem] font-bold text-ink-secondary">Tendencia estable</p></div><div className="mt-2 border-t border-line pt-2 text-[0.58rem] font-bold text-ink-secondary">En tu área: Casos cardiovasculares<br /><span className="text-success">-8% vs. semana anterior</span></div></DoctorCard>
        </aside>
      </section>
    </div>
  );
}

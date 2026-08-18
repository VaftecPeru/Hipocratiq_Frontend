import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileText,
  FolderOpen,
  HeartPulse,
  History,
  Play,
  Plus,
} from "lucide-react";
import {
  DoctorAvatar,
  DoctorCard,
  LegendDot,
  MetricCard,
  SectionHeading,
  StatusBadge,
} from "@/features/doctors/ui/doctor-primitives";

const metrics = [
  { label: "Consultas hoy", value: "12", icon: CalendarDays, tone: "blue" as const },
  { label: "En curso", value: "2", trend: "↑ 25%", icon: Play, tone: "green" as const },
  { label: "Finalizadas", value: "8", trend: "↑ 14%", icon: CheckCircle2, tone: "violet" as const },
  { label: "Pendientes", value: "2", trend: "↓ 20%", trendTone: "red" as const, icon: Clock3, tone: "orange" as const },
] as const;

const consultations = [
  { time: "09:00", initials: "JP", name: "Juan Pérez", reason: "Consulta de rutina", type: "Control", status: "Completada", tone: "green" as const, avatarTone: "blue" as const },
  { time: "10:30", initials: "ML", name: "María López", reason: "Control cardiológico", type: "Control", status: "En curso", tone: "orange" as const, avatarTone: "orange" as const },
  { time: "12:00", initials: "PG", name: "Pedro García", reason: "Seguimiento hipertensión", type: "Seguimiento", status: "Programada", tone: "blue" as const, avatarTone: "slate" as const },
  { time: "14:30", initials: "AT", name: "Ana Torres", reason: "Control prenatal", type: "Seguimiento", status: "Programada", tone: "blue" as const, avatarTone: "violet" as const },
  { time: "16:00", initials: "CM", name: "Carlos Méndez", reason: "Revisión de exámenes", type: "Primera vez", status: "Pendiente", tone: "slate" as const, avatarTone: "orange" as const },
] as const;

const upcoming = [
  { time: "Mañana, 09:00", initials: "LH", name: "Luis Herrera", reason: "Control cardiológico", avatarTone: "orange" as const },
  { time: "Mañana, 11:30", initials: "SR", name: "Sofía Ramírez", reason: "Seguimiento hipertensión", avatarTone: "blue" as const },
  { time: "Viernes, 10:00", initials: "MA", name: "Miguel Ángel", reason: "Chequeo general", avatarTone: "slate" as const },
] as const;

const notes = [
  { date: "15 May 2024, 09:15 AM", patient: "María López", text: "S: Refiere mejoría en disnea. O: TA 120/80, FC 72 lpm, sin edemas. A: Estable. P: Continuar tratamiento, dieta hiposódica, ejercicio.", tone: "violet" as const },
  { date: "01 May 2024, 10:15 AM", patient: "María López", text: "S: Episodios leves de palpitaciones. O: FC 78 lpm, R1 y R2 rítmicos. A: Extrasístoles supraventriculares. P: Monitor Holter 24h.", tone: "violet" as const },
  { date: "15 Abr 2024, 09:00 AM", patient: "María López", text: "S: Control rutinario. O: TA 118/78, buen estado general. A: Estable con tratamiento. P: Seguimiento 1 mes.", tone: "violet" as const },
] as const;

export default function DoctorConsultationsPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.65rem]">Consultas</h1><p className="mt-1 text-[0.68rem] font-bold text-ink-secondary">Gestiona tus atenciones médicas, evolución y seguimiento clínico.</p></div>
        <div className="flex gap-2"><button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[0.65rem] font-extrabold text-white shadow-[0_5px_14px_rgb(8_98_221/18%)] hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus" type="button"><Plus className="size-3.5" aria-hidden="true" />Nueva Consulta</button><button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 text-[0.65rem] font-extrabold hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button"><History className="size-3.5" aria-hidden="true" />Ver historial</button></div>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Resumen de consultas">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,1fr)]" aria-label="Consultas del día">
        <DoctorCard className="min-w-0 overflow-hidden"><div className="border-b border-line px-4 py-3 sm:px-5"><h2 className="text-[0.82rem] font-extrabold">Consultas del día</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] border-collapse text-left"><thead><tr className="border-b border-line bg-surface-subtle text-[0.55rem] font-extrabold text-ink-secondary"><th className="px-3 py-2.5 font-extrabold sm:px-4">Hora</th><th className="px-3 py-2.5 font-extrabold">Paciente</th><th className="px-3 py-2.5 font-extrabold">Motivo</th><th className="px-3 py-2.5 font-extrabold">Tipo de consulta</th><th className="px-3 py-2.5 font-extrabold">Estado</th></tr></thead><tbody>{consultations.map((consultation) => <tr className="border-b border-line last:border-0 hover:bg-surface-subtle" key={`${consultation.time}-${consultation.name}`}><td className="px-3 py-2.5 sm:px-4"><span className={`mr-2 inline-block size-2 rounded-full ${consultation.tone === "green" ? "bg-success" : consultation.tone === "orange" ? "bg-warning" : consultation.tone === "blue" ? "bg-accent" : "bg-muted"}`} aria-hidden="true" /><span className="font-mono text-[0.62rem] font-extrabold">{consultation.time}</span></td><td className="px-3 py-2.5"><div className="flex items-center gap-2"><DoctorAvatar initials={consultation.initials} tone={consultation.avatarTone} size="sm" /><span className="whitespace-nowrap text-[0.61rem] font-extrabold">{consultation.name}</span></div></td><td className="px-3 py-2.5 text-[0.59rem] font-extrabold">{consultation.reason}</td><td className="px-3 py-2.5"><StatusBadge tone={consultation.type === "Seguimiento" ? "violet" : consultation.type === "Primera vez" ? "blue" : "slate"}>{consultation.type}</StatusBadge></td><td className="px-3 py-2.5"><StatusBadge tone={consultation.tone}>{consultation.status}{consultation.status === "Completada" || consultation.status === "En curso" ? "  ◉" : "  ◷"}</StatusBadge></td></tr>)}</tbody></table></div></DoctorCard>

        <aside className="grid gap-4"><DoctorCard className="min-w-0 overflow-hidden"><div className="border-b border-line px-4 py-3"><h2 className="text-[0.82rem] font-extrabold">Paciente actual</h2></div><div className="grid gap-4 p-4 sm:grid-cols-[1fr_1.1fr]"><div><div className="flex items-center gap-3"><DoctorAvatar initials="ML" tone="orange" size="lg" /><div><h3 className="text-[0.82rem] font-extrabold">María López</h3><p className="mt-1 text-[0.58rem] font-bold text-ink-secondary">48 años <span className="mx-1">·</span> Femenino</p></div></div><p className="mt-3 text-[0.58rem] font-extrabold">Motivo</p><p className="mt-1 text-[0.58rem] font-bold text-ink-secondary">Control cardiológico</p></div><div className="border-t border-line pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0"><p className="text-[0.62rem] font-extrabold">Últimas notas</p><p className="mt-2 text-[0.59rem] font-bold leading-4 text-ink-secondary">Paciente estable. Sin dolor torácico. TA: 120/80 mmHg. FC: 72 lpm. Se mantiene tratamiento actual.</p><p className="mt-2 text-[0.54rem] font-bold text-muted">15 May 2024, 09:45 AM</p></div></div><div className="flex flex-wrap gap-2 px-4 pb-4"><button className="inline-flex min-h-8 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[0.6rem] font-extrabold text-white focus-visible:outline-3 focus-visible:outline-focus" type="button"><Play className="size-3" aria-hidden="true" />Iniciar consulta</button><button className="inline-flex min-h-8 items-center justify-center gap-2 rounded-lg border border-line px-4 text-[0.6rem] font-extrabold focus-visible:outline-3 focus-visible:outline-focus" type="button"><FolderOpen className="size-3" aria-hidden="true" />Ver expediente</button></div></DoctorCard><DoctorCard className="p-4"><SectionHeading title="Próximas consultas" action="Ver agenda completa" /><ul className="mt-3 divide-y divide-line">{upcoming.map((consultation) => <li className="grid grid-cols-[95px_28px_minmax(0,1fr)_auto] items-center gap-2 py-2 first:pt-0 last:pb-0" key={consultation.name}><span className="text-[0.55rem] font-extrabold text-ink-secondary">{consultation.time}</span><DoctorAvatar initials={consultation.initials} tone={consultation.avatarTone} size="sm" /><span className="min-w-0"><span className="block truncate text-[0.59rem] font-extrabold">{consultation.name}</span><span className="block truncate text-[0.54rem] font-bold text-ink-secondary">{consultation.reason}</span></span><StatusBadge tone="blue">Programada</StatusBadge></li>)}</ul></DoctorCard></aside>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr_1.05fr]" aria-label="Evolución y analítica">
        <DoctorCard className="min-w-0 p-4"><SectionHeading title="Notas y evolución" action="Ver todas" /><ul className="mt-3 grid gap-2">{notes.map((note) => <li className="flex gap-2.5 rounded-lg border border-line p-2.5" key={`${note.date}-${note.text}`}><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><FileText className="size-3.5" aria-hidden="true" /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="text-[0.57rem] font-extrabold">{note.date} · {note.patient}</p><StatusBadge tone={note.tone}>SOAP</StatusBadge></div><p className="mt-1 text-[0.55rem] font-bold leading-4 text-ink-secondary">{note.text}</p></div><span className="self-center text-muted" aria-hidden="true">›</span></li>)}</ul></DoctorCard>

        <DoctorCard className="min-w-0 p-4"><div className="flex items-center justify-between gap-3"><div><h2 className="text-[0.82rem] font-extrabold">Tipos de consulta</h2></div><button className="rounded-lg border border-line px-2.5 py-1.5 text-[0.58rem] font-extrabold focus-visible:outline-3 focus-visible:outline-focus" type="button">Este mes⌄</button></div><div className="mt-2 grid grid-cols-[145px_1fr] items-center gap-2"><div className="relative grid place-items-center"><svg className="col-start-1 row-start-1 size-32 -rotate-90" viewBox="0 0 120 120" role="img" aria-label="Distribución: Control 45%, Seguimiento 25%, Primera vez 20%, Teleconsulta 10%"><circle cx="60" cy="60" r="43" className="fill-none stroke-surface-subtle" strokeWidth="14" /><circle cx="60" cy="60" r="43" pathLength="100" className="fill-none stroke-success" strokeWidth="14" strokeDasharray="45 55" /><circle cx="60" cy="60" r="43" pathLength="100" className="fill-none stroke-violet" strokeWidth="14" strokeDasharray="25 75" strokeDashoffset="-45" /><circle cx="60" cy="60" r="43" pathLength="100" className="fill-none stroke-accent" strokeWidth="14" strokeDasharray="20 80" strokeDashoffset="-70" /><circle cx="60" cy="60" r="43" pathLength="100" className="fill-none stroke-warning" strokeWidth="14" strokeDasharray="10 90" strokeDashoffset="-90" /></svg><div className="col-start-1 row-start-1 text-center"><strong className="block font-mono text-2xl tracking-[-0.07em]">100</strong><span className="text-[0.55rem] font-bold text-muted">Total</span></div></div><ul className="grid gap-3 text-[0.58rem] font-extrabold"><li className="flex justify-between gap-2"><span className="flex items-center gap-2 text-ink-secondary"><LegendDot tone="green" />Control</span>45%</li><li className="flex justify-between gap-2"><span className="flex items-center gap-2 text-ink-secondary"><LegendDot tone="violet" />Seguimiento</span>25%</li><li className="flex justify-between gap-2"><span className="flex items-center gap-2 text-ink-secondary"><LegendDot tone="blue" />Primera vez</span>20%</li><li className="flex justify-between gap-2"><span className="flex items-center gap-2 text-ink-secondary"><LegendDot tone="orange" />Teleconsulta</span>10%</li></ul></div></DoctorCard>

        <DoctorCard className="min-w-0 p-4"><div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-lg bg-violet-soft text-violet"><HeartPulse className="size-4" aria-hidden="true" /></span><h2 className="text-[0.82rem] font-extrabold">IA Epidemiológica</h2></div><div className="mt-3 grid gap-2"><div className="flex items-center justify-between rounded-lg border border-line bg-surface-subtle px-3 py-2.5"><div><p className="text-[0.55rem] font-bold text-ink-secondary">Riesgo actual</p><strong className="mt-0.5 block text-lg font-extrabold text-success">Bajo</strong><p className="text-[0.54rem] font-bold text-ink-secondary">Tendencia estable</p></div><svg className="h-8 w-24" viewBox="0 0 96 32" aria-hidden="true"><polyline points="2,25 18,18 32,22 47,12 62,18 78,8 94,2" className="fill-none stroke-success" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div><div className="flex items-center gap-2 rounded-lg border border-line px-3 py-2.5"><span className="grid size-6 place-items-center rounded-md bg-danger-soft text-danger"><CircleAlert className="size-3.5" aria-hidden="true" /></span><span className="flex-1 text-[0.59rem] font-extrabold">1 alerta activa</span><span className="text-muted">›</span></div><div className="flex items-center gap-2 rounded-lg border border-line px-3 py-2.5"><span className="grid size-6 place-items-center rounded-md bg-accent-soft text-accent"><CalendarDays className="size-3.5" aria-hidden="true" /></span><span className="flex-1 text-[0.55rem] font-bold text-ink-secondary">Última actualización<br /><b className="text-[0.59rem] text-ink">Hoy, 10:30 AM</b></span><span className="text-muted">›</span></div></div><button className="mt-3 inline-flex w-full items-center justify-center gap-1 text-[0.59rem] font-extrabold text-accent focus-visible:outline-3 focus-visible:outline-focus" type="button">Ver IA Epidemiológica <ArrowUpRight className="size-3" aria-hidden="true" /></button></DoctorCard>
      </section>
    </div>
  );
}

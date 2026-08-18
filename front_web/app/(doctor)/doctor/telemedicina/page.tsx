import {
  ArrowUpRight,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileText,
  FolderOpen,
  HeartPulse,
  History,
  Paperclip,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
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
  { label: "Teleconsultas hoy", value: "3", trend: "↑ 25%", icon: Video, tone: "violet" as const },
  { label: "En sala de espera", value: "2", icon: Users, tone: "orange" as const },
  { label: "Finalizadas", value: "8", trend: "↑ 14%", icon: CheckCircle2, tone: "green" as const },
  { label: "Pendientes", value: "1", trend: "↓ 20%", trendTone: "red" as const, icon: Clock3, tone: "orange" as const },
] as const;

const sessions = [
  { time: "09:00", initials: "ML", patient: "María López", reason: "Control cardiológico", status: "Finalizada", tone: "green" as const, avatarTone: "orange" as const },
  { time: "11:30", initials: "JP", patient: "Juan Pérez", reason: "Seguimiento hipertensión", status: "En sala", tone: "orange" as const, avatarTone: "blue" as const },
  { time: "14:00", initials: "AT", patient: "Ana Torres", reason: "Control prenatal", status: "Programada", tone: "blue" as const, avatarTone: "violet" as const },
  { time: "16:00", initials: "PG", patient: "Pedro García", reason: "Revisión postoperatoria", status: "Pendiente", tone: "slate" as const, avatarTone: "slate" as const },
] as const;

const upcoming = [
  { time: "Mañana, 09:00", initials: "ML", name: "María López", reason: "Control cardiológico", avatarTone: "orange" as const },
  { time: "Mañana, 11:30", initials: "AT", name: "Ana Torres", reason: "Control prenatal", avatarTone: "violet" as const },
  { time: "Viernes, 16:00", initials: "PG", name: "Pedro García", reason: "Revisión postoperatoria", avatarTone: "slate" as const },
] as const;

const sharedFiles = [
  { title: "Electrocardiograma adjunto", detail: "Compartido por Juan Pérez · Hoy, 08:45 AM", type: "PDF", tone: "red" as const },
  { title: "Nota de evolución", detail: "Registrada por Dr. Carlos Ruiz · Ayer, 11:20 AM", type: "DOCX", tone: "blue" as const },
  { title: "Receta enviada", detail: "Enviada por Dr. Carlos Ruiz · Ayer, 11:25 AM", type: "PDF", tone: "green" as const },
] as const;

export default function DoctorTelemedicinePage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.65rem]">Telemedicina</h1><p className="mt-1 text-[0.68rem] font-bold text-ink-secondary">Gestiona videoconsultas, seguimientos remotos y atención virtual.</p></div><div className="flex gap-2"><button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 text-[0.65rem] font-extrabold hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button"><History className="size-3.5" aria-hidden="true" />Ver historial</button><button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[0.65rem] font-extrabold text-white shadow-[0_5px_14px_rgb(8_98_221/18%)] hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus" type="button"><Plus className="size-3.5" aria-hidden="true" />Nueva teleconsulta</button></div></header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Resumen de telemedicina">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,1.2fr)_250px]" aria-label="Operación de telemedicina">
        <div className="grid gap-4"><DoctorCard className="min-w-0 overflow-hidden"><div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5"><h2 className="text-[0.82rem] font-extrabold">Sesiones del día</h2><button className="inline-flex items-center gap-1 text-[0.61rem] font-extrabold text-accent focus-visible:outline-3 focus-visible:outline-focus" type="button">Ver agenda completa <ChevronRight className="size-3" aria-hidden="true" /></button></div><div className="overflow-x-auto"><table className="w-full min-w-[550px] border-collapse text-left"><thead><tr className="border-b border-line bg-surface-subtle text-[0.55rem] font-extrabold text-ink-secondary"><th className="px-3 py-2.5 font-extrabold sm:px-4">Hora</th><th className="px-3 py-2.5 font-extrabold">Paciente</th><th className="px-3 py-2.5 font-extrabold">Motivo</th><th className="px-3 py-2.5 font-extrabold">Estado</th></tr></thead><tbody>{sessions.map((session) => <tr className="border-b border-line last:border-0 hover:bg-surface-subtle" key={`${session.time}-${session.patient}`}><td className="px-3 py-2.5 sm:px-4"><span className={`mr-2 inline-block size-2 rounded-full ${session.tone === "green" ? "bg-success" : session.tone === "orange" ? "bg-warning" : session.tone === "blue" ? "bg-accent" : "bg-muted"}`} aria-hidden="true" /><span className="font-mono text-[0.62rem] font-extrabold">{session.time}</span></td><td className="px-3 py-2.5"><div className="flex items-center gap-2"><DoctorAvatar initials={session.initials} tone={session.avatarTone} size="sm" /><span className="whitespace-nowrap text-[0.61rem] font-extrabold">{session.patient}</span></div></td><td className="px-3 py-2.5 text-[0.59rem] font-extrabold">{session.reason}</td><td className="px-3 py-2.5"><StatusBadge tone={session.tone}>{session.status}{session.status === "Finalizada" ? "  ◉" : session.status === "En sala" ? "  ◷" : ""}</StatusBadge></td></tr>)}</tbody></table></div></DoctorCard><DoctorCard className="p-4"><SectionHeading title="Notas y archivos compartidos" action="Ver todos los archivos" /><ul className="mt-3 grid gap-1.5">{sharedFiles.map((file) => <li className="flex items-center gap-2 rounded-lg border border-line px-2.5 py-2" key={file.title}><span className={`grid size-6 shrink-0 place-items-center rounded-md ${file.tone === "red" ? "bg-danger-soft text-danger" : file.tone === "green" ? "bg-success-soft text-success" : "bg-accent-soft text-accent"}`}><FileText className="size-3.5" aria-hidden="true" /></span><span className="min-w-0 flex-1"><b className="block truncate text-[0.57rem] font-extrabold">{file.title}</b><small className="mt-0.5 block truncate text-[0.53rem] font-bold text-ink-secondary">{file.detail}</small></span><StatusBadge tone="blue">{file.type}</StatusBadge><ChevronRight className="size-3 text-muted" /></li>)}</ul></DoctorCard></div>

        <div className="grid gap-4"><DoctorCard className="p-4"><SectionHeading title="Próximas teleconsultas" action="Ver agenda completa" /><ul className="mt-3 divide-y divide-line">{upcoming.map((consultation) => <li className="grid grid-cols-[100px_28px_minmax(0,1fr)_auto] items-center gap-2 py-2 first:pt-0 last:pb-0" key={consultation.name}><span className="text-[0.55rem] font-extrabold text-ink-secondary">{consultation.time}</span><DoctorAvatar initials={consultation.initials} tone={consultation.avatarTone} size="sm" /><span className="min-w-0"><b className="block truncate text-[0.59rem] font-extrabold">{consultation.name}</b><small className="block truncate text-[0.53rem] font-bold text-ink-secondary">{consultation.reason}</small></span><StatusBadge tone="blue">Programada</StatusBadge></li>)}</ul></DoctorCard><DoctorCard className="p-4"><SectionHeading title="Pacientes frecuentes" action="Ver todos" /><ul className="mt-3 divide-y divide-line">{sessions.slice(0, 3).map((session, index) => <li className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0" key={session.patient}><DoctorAvatar initials={session.initials} tone={session.avatarTone} size="sm" /><span className="min-w-0 flex-1"><b className="block truncate text-[0.59rem] font-extrabold">{session.patient}</b><small className="block truncate text-[0.53rem] font-bold text-ink-secondary">{session.reason}</small></span><span className="shrink-0 rounded-md border border-accent/15 px-2 py-1 text-[0.55rem] font-extrabold text-accent">{index + 1} {index === 0 ? "cita" : "citas"}</span></li>)}</ul></DoctorCard><DoctorCard className="p-4"><SectionHeading title="Alertas y recordatorios" action="Ver todas" /><ul className="mt-3 grid gap-2"><li className="flex items-center gap-2 rounded-lg border border-line px-2.5 py-2"><CircleAlert className="size-3.5 text-warning" aria-hidden="true" /><span className="flex-1 text-[0.56rem] font-extrabold">1 paciente no completó formulario previo</span><ChevronRight className="size-3 text-muted" /></li><li className="flex items-center gap-2 rounded-lg border border-line px-2.5 py-2"><Sparkles className="size-3.5 text-violet" aria-hidden="true" /><span className="flex-1 text-[0.56rem] font-extrabold">Capacitación disponible</span><ChevronRight className="size-3 text-muted" /></li><li className="flex items-center gap-2 rounded-lg border border-line px-2.5 py-2"><Clock3 className="size-3.5 text-warning" aria-hidden="true" /><span className="flex-1 text-[0.56rem] font-extrabold">2 resultados pendientes por comentar</span><ChevronRight className="size-3 text-muted" /></li></ul></DoctorCard><DoctorCard className="p-4"><div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-lg bg-violet-soft text-violet"><HeartPulse className="size-4" aria-hidden="true" /></span><h2 className="text-[0.82rem] font-extrabold">IA Epidemiológica</h2></div><div className="mt-3 grid grid-cols-[1fr_1.1fr] gap-2"><div className="rounded-lg border border-line bg-surface-subtle p-2.5"><p className="text-[0.54rem] font-bold text-ink-secondary">Riesgo actual</p><strong className="mt-0.5 block text-lg font-extrabold text-success">Bajo</strong><p className="text-[0.53rem] font-bold text-ink-secondary">Tendencia estable</p></div><div className="grid gap-2"><div className="flex items-center gap-2 rounded-lg border border-line px-2 py-2"><CircleAlert className="size-3 text-danger" aria-hidden="true" /><span className="flex-1 text-[0.55rem] font-extrabold">1 alerta activa</span><ChevronRight className="size-3 text-muted" /></div><div className="flex items-center gap-2 rounded-lg border border-line px-2 py-2"><CalendarDays className="size-3 text-accent" aria-hidden="true" /><span className="flex-1 text-[0.53rem] font-bold text-ink-secondary">Hoy, 10:30 AM</span><ChevronRight className="size-3 text-muted" /></div></div></div><button className="mt-2 inline-flex w-full items-center justify-center gap-1 text-[0.57rem] font-extrabold text-accent focus-visible:outline-3 focus-visible:outline-focus" type="button">Ver IA Epidemiológica <ArrowUpRight className="size-3" aria-hidden="true" /></button></DoctorCard></div>

        <DoctorCard className="min-w-0 p-4"><div className="flex items-center justify-between gap-2"><h2 className="text-[0.82rem] font-extrabold">Videoconsulta actual</h2><span className="grid size-8 place-items-center rounded-full border border-line text-muted"><Video className="size-4" aria-hidden="true" /></span></div><div className="mt-4 flex items-center gap-3"><DoctorAvatar initials="JP" tone="blue" size="lg" /><div><h3 className="text-[0.82rem] font-extrabold">Juan Pérez</h3><p className="mt-1 text-[0.56rem] font-bold text-ink-secondary">45 años <span className="mx-1">·</span> Masculino</p></div></div><p className="mt-4 text-[0.57rem] font-extrabold">Motivo</p><p className="mt-1 text-[0.59rem] font-bold text-ink-secondary">Seguimiento hipertensión</p><button className="mt-4 inline-flex min-h-8 w-full items-center justify-center gap-2 rounded-lg bg-accent text-[0.59rem] font-extrabold text-white focus-visible:outline-3 focus-visible:outline-focus" type="button"><Camera className="size-3.5" aria-hidden="true" />Unirse a videollamada</button><button className="mt-2 inline-flex min-h-8 w-full items-center justify-center gap-2 rounded-lg border border-line text-[0.59rem] font-extrabold focus-visible:outline-3 focus-visible:outline-focus" type="button"><FolderOpen className="size-3.5" aria-hidden="true" />Ver expediente</button><ul className="mt-3 divide-y divide-line rounded-lg border border-line"><li className="flex items-center gap-2 px-2.5 py-2 text-[0.56rem] font-extrabold"><ShieldCheck className="size-3.5 text-success" aria-hidden="true" />Conexión verificada <CheckCircle2 className="ml-auto size-3.5 text-success" /></li><li className="flex items-center gap-2 px-2.5 py-2 text-[0.56rem] font-extrabold"><Paperclip className="size-3.5 text-accent" aria-hidden="true" />Archivos compartidos <span className="ml-auto text-accent">2</span></li><li className="flex items-center gap-2 px-2.5 py-2 text-[0.56rem] font-extrabold"><Clock3 className="size-3.5 text-accent" aria-hidden="true" />Próxima sesión en <span className="ml-auto text-accent">15 min</span></li></ul></DoctorCard>
      </section>
    </div>
  );
}

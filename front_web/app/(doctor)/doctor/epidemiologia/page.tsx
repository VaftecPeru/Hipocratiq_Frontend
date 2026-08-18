import {
  AlertTriangle,
  ArrowUpRight,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  FlaskConical,
  HeartPulse,
  Link2,
  ShieldCheck,
  TrendingUp,
  Users,
  Video,
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
  { label: "Pacientes en vigilancia", value: "24", trend: "↑ 15%", icon: Users, tone: "blue" as const },
  { label: "Alertas activas", value: "3", trend: "↑ 50%", trendTone: "red" as const, icon: AlertTriangle, tone: "red" as const },
  { label: "Casos de riesgo alto", value: "2", trend: "— 0%", icon: ShieldCheck, tone: "red" as const },
  { label: "Tendencia general", value: "Estable", trend: "— 0%", icon: TrendingUp, tone: "green" as const },
] as const;

const cohorts = [
  { name: "Hipertensión", level: "10", risk: "Alto", tone: "red" as const },
  { name: "Insuficiencia cardiaca", level: "6", risk: "Medio", tone: "orange" as const },
  { name: "Postoperatorio", level: "4", risk: "Bajo", tone: "green" as const },
  { name: "Prenatal", level: "4", risk: "Medio", tone: "orange" as const },
] as const;

const watchedPatients = [
  { initials: "ML", name: "María López", reason: "Hipertensión esencial", risk: "Alto", last: "Hoy, 08:40 AM", status: "En seguimiento", tone: "red" as const, avatarTone: "orange" as const },
  { initials: "JP", name: "Juan Pérez", reason: "Insuficiencia cardiaca", risk: "Medio", last: "Ayer, 10:15 AM", status: "En seguimiento", tone: "orange" as const, avatarTone: "blue" as const },
  { initials: "PG", name: "Pedro García", reason: "Postoperatorio", risk: "Bajo", last: "Ayer, 11:20 AM", status: "Estable", tone: "green" as const, avatarTone: "slate" as const },
  { initials: "AT", name: "Ana Torres", reason: "Control prenatal", risk: "Medio", last: "Hoy, 09:00 AM", status: "En seguimiento", tone: "orange" as const, avatarTone: "violet" as const },
] as const;

export default function DoctorEpidemiologyPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="flex items-start gap-3"><span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-violet-soft text-violet"><BrainCircuit className="size-5" aria-hidden="true" /></span><div><h1 className="text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.65rem]">IA Epidemiológica</h1><p className="mt-1 text-[0.68rem] font-bold text-ink-secondary">Monitoreo de riesgo clínico y alertas predictivas para tu panel de pacientes.</p></div></div><div className="flex gap-2"><button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 text-[0.65rem] font-extrabold hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button"><CircleHelp className="size-3.5" aria-hidden="true" />Configurar alertas</button><button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[0.65rem] font-extrabold text-white shadow-[0_5px_14px_rgb(8_98_221/18%)] hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus" type="button"><ShieldCheck className="size-3.5" aria-hidden="true" />Ver protocolo</button></div></header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Resumen epidemiológico">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-[1fr_1.25fr_0.95fr]" aria-label="Monitoreo epidemiológico"><DoctorCard className="min-w-0 p-4"><div className="flex items-center gap-2"><h2 className="text-[0.82rem] font-extrabold">Mapa de riesgo clínico</h2><CircleHelp className="size-3.5 text-ink-secondary" aria-hidden="true" /></div><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[280px] border-collapse text-left"><thead><tr className="border-b border-line text-[0.54rem] font-extrabold text-ink-secondary"><th className="px-1 py-2 font-extrabold">Cohorte</th><th className="px-1 py-2 font-extrabold">Nivel</th><th className="px-1 py-2 font-extrabold">Riesgo</th></tr></thead><tbody>{cohorts.map((cohort) => <tr className="border-b border-line last:border-0" key={cohort.name}><td className="px-1 py-2.5"><span className={`mr-2 inline-block size-2 rounded-full ${cohort.tone === "red" ? "bg-danger" : cohort.tone === "orange" ? "bg-warning" : "bg-success"}`} /><span className="text-[0.58rem] font-extrabold">{cohort.name}</span></td><td className="px-1 py-2.5 text-[0.58rem] font-extrabold">{cohort.level}</td><td className="px-1 py-2.5"><StatusBadge tone={cohort.tone}>{cohort.risk}</StatusBadge></td></tr>)}</tbody></table></div><button className="mt-3 inline-flex w-full items-center justify-center gap-1 text-[0.57rem] font-extrabold text-accent focus-visible:outline-3 focus-visible:outline-focus" type="button">Ver detalle por cohorte <ChevronRight className="size-3" /></button></DoctorCard>

        <DoctorCard className="min-w-0 p-4"><div className="flex items-center justify-between gap-3"><div><h2 className="text-[0.82rem] font-extrabold">Tendencia de casos</h2><div className="mt-2 flex gap-4 text-[0.55rem] font-bold text-ink-secondary"><span className="inline-flex items-center gap-1.5"><LegendDot tone="blue" />Riesgo cardiovascular</span><span className="inline-flex items-center gap-1.5"><LegendDot tone="green" />Seguimiento respiratorio</span></div></div><button className="rounded-lg border border-line px-2.5 py-1.5 text-[0.58rem] font-extrabold focus-visible:outline-3 focus-visible:outline-focus" type="button">Últimos 6 meses⌄</button></div><svg className="mt-3 h-auto w-full overflow-visible" viewBox="0 0 380 180" role="img" aria-label="Tendencia de riesgo cardiovascular y seguimiento respiratorio"><line x1="30" y1="25" x2="362" y2="25" className="stroke-line" /><line x1="30" y1="55" x2="362" y2="55" className="stroke-line" /><line x1="30" y1="85" x2="362" y2="85" className="stroke-line" /><line x1="30" y1="115" x2="362" y2="115" className="stroke-line" /><line x1="30" y1="145" x2="362" y2="145" className="stroke-line" /><text x="4" y="29" className="fill-ink-secondary text-[9px]">40</text><text x="4" y="59" className="fill-ink-secondary text-[9px]">30</text><text x="4" y="89" className="fill-ink-secondary text-[9px]">20</text><text x="4" y="119" className="fill-ink-secondary text-[9px]">10</text><text x="9" y="149" className="fill-ink-secondary text-[9px]">0</text><polyline points="38,112 101,84 164,73 227,51 290,61 353,38" className="fill-none stroke-accent" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><polyline points="38,130 101,111 164,99 227,86 290,92 353,71" className="fill-none stroke-success" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />{[[38, 112], [101, 84], [164, 73], [227, 51], [290, 61], [353, 38]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" className="fill-accent" />)}{["Dic", "Ene", "Feb", "Mar", "Abr", "May"].map((label, index) => <text key={label} x={[38, 101, 164, 227, 290, 353][index]} y="174" textAnchor="middle" className="fill-ink-secondary text-[9px]">{label}</text>)}</svg><button className="mt-1 inline-flex w-full items-center justify-center gap-1 text-[0.57rem] font-extrabold text-accent focus-visible:outline-3 focus-visible:outline-focus" type="button">Ver análisis de tendencia <ArrowUpRight className="size-3" /></button></DoctorCard>

        <div className="grid gap-4"><DoctorCard className="p-4"><SectionHeading title="Alertas de hoy" action="Ver todas las alertas" /><ul className="mt-3 grid gap-2"><li className="flex items-center gap-2"><AlertTriangle className="size-3.5 text-danger" /><span className="flex-1 text-[0.58rem] font-extrabold">Paciente con TA elevada</span><time className="text-[0.53rem] font-bold text-ink-secondary">09:45 AM</time></li><li className="flex items-center gap-2"><AlertTriangle className="size-3.5 text-warning" /><span className="flex-1 text-[0.58rem] font-extrabold">2 pacientes sin control reciente</span><time className="text-[0.53rem] font-bold text-ink-secondary">08:20 AM</time></li><li className="flex items-center gap-2"><FlaskConical className="size-3.5 text-warning" /><span className="flex-1 text-[0.58rem] font-extrabold">Interacción farmacológica sugiere revisión</span><time className="text-[0.53rem] font-bold text-ink-secondary">07:50 AM</time></li></ul></DoctorCard><DoctorCard className="p-4"><SectionHeading title="Recomendación IA" /><ul className="mt-3 grid gap-2 text-[0.58rem] font-extrabold"><li className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-success" />Priorizar seguimiento de hipertensión</li><li className="flex items-center gap-2"><FlaskConical className="size-3.5 text-accent" />Solicitar perfil lipídico</li><li className="flex items-center gap-2"><Link2 className="size-3.5 text-accent" />Revisar adherencia de tratamiento</li></ul></DoctorCard></div>
      </section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,0.9fr)]"><DoctorCard className="min-w-0 overflow-hidden"><div className="border-b border-line px-4 py-3 sm:px-5"><h2 className="text-[0.82rem] font-extrabold">Pacientes en vigilancia</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[700px] border-collapse text-left"><thead><tr className="border-b border-line bg-surface-subtle text-[0.55rem] font-extrabold text-ink-secondary"><th className="px-3 py-2.5 font-extrabold sm:px-4">Paciente</th><th className="px-3 py-2.5 font-extrabold">Motivo</th><th className="px-3 py-2.5 font-extrabold">Riesgo</th><th className="px-3 py-2.5 font-extrabold">Último control</th><th className="px-3 py-2.5 font-extrabold">Estado</th></tr></thead><tbody>{watchedPatients.map((patient) => <tr className="border-b border-line last:border-0 hover:bg-surface-subtle" key={patient.name}><td className="px-3 py-2.5 sm:px-4"><div className="flex items-center gap-2"><DoctorAvatar initials={patient.initials} tone={patient.avatarTone} size="sm" /><span className="whitespace-nowrap text-[0.6rem] font-extrabold">{patient.name}</span></div></td><td className="px-3 py-2.5 text-[0.58rem] font-extrabold">{patient.reason}</td><td className="px-3 py-2.5"><StatusBadge tone={patient.tone}>{patient.risk}</StatusBadge></td><td className="px-3 py-2.5 whitespace-nowrap text-[0.56rem] font-bold text-ink-secondary">{patient.last}</td><td className="px-3 py-2.5"><span className="inline-flex items-center gap-1.5 text-[0.56rem] font-extrabold text-success"><span className={`size-1.5 rounded-full ${patient.status === "Estable" ? "bg-accent" : "bg-success"}`} />{patient.status}</span></td></tr>)}</tbody></table></div><button className="flex min-h-10 w-full items-center justify-center gap-1 text-[0.58rem] font-extrabold text-accent focus-visible:outline-3 focus-visible:outline-focus" type="button">Ver todos los pacientes <ChevronRight className="size-3" /></button></DoctorCard>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2"><DoctorCard className="p-4"><h2 className="text-[0.82rem] font-extrabold">Resumen operativo</h2><ul className="mt-3 grid gap-2.5 text-[0.56rem] font-extrabold text-ink-secondary"><li className="flex items-center gap-2"><AlertTriangle className="size-3.5" />Pacientes de riesgo <b className="ml-auto text-ink">24</b></li><li className="flex items-center gap-2"><Clock3 className="size-3.5" />Controles pendientes <b className="ml-auto text-ink">12</b></li><li className="flex items-center gap-2"><CalendarDays className="size-3.5" />Saturación de agenda <b className="ml-auto text-warning">78%</b></li><li className="flex items-center gap-2"><CheckCircle2 className="size-3.5" />Cobertura analizada <b className="ml-auto text-success">92%</b></li></ul><button className="mt-3 text-[0.57rem] font-extrabold text-accent focus-visible:outline-3 focus-visible:outline-focus" type="button">Ver detalle operativo ›</button></DoctorCard><DoctorCard className="p-4"><h2 className="text-[0.82rem] font-extrabold">Fuentes clínicas</h2><ul className="mt-3 grid gap-2.5 text-[0.56rem] font-extrabold"><li className="flex items-center gap-2"><ShieldCheck className="size-3.5 text-ink-secondary" />HIS / EHR <span className="ml-auto text-success">● Conectado</span></li><li className="flex items-center gap-2"><FlaskConical className="size-3.5 text-ink-secondary" />Laboratorio <span className="ml-auto text-success">● Conectado</span></li><li className="flex items-center gap-2"><Video className="size-3.5 text-ink-secondary" />Telemedicina <span className="ml-auto text-success">● Conectado</span></li><li className="flex items-center gap-2"><HeartPulse className="size-3.5 text-ink-secondary" />Recetas <span className="ml-auto text-success">● Conectado</span></li></ul><button className="mt-3 text-[0.57rem] font-extrabold text-accent focus-visible:outline-3 focus-visible:outline-focus" type="button">Ver integraciones ›</button></DoctorCard></div></section>

      <DoctorCard className="mt-4 flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5"><span className="flex items-center gap-2 text-[0.56rem] font-bold text-ink-secondary"><CalendarDays className="size-3.5 text-accent" />Última actualización <b className="text-ink">Hoy, 10:30 AM</b></span><button className="text-[0.57rem] font-extrabold text-accent focus-visible:outline-3 focus-visible:outline-focus" type="button">Ver informe IA Epidemiológica ↗</button></DoctorCard>
    </div>
  );
}

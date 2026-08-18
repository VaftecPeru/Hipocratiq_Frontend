import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FlaskConical,
  HeartPulse,
  Pill,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import {
  DoctorAvatar,
  DoctorCard,
  LegendDot,
  MetricCard,
  SectionHeading,
  StatusBadge,
} from "@/features/doctors/ui/doctor-primitives";

type DashboardTone = "blue" | "green" | "orange" | "red" | "violet" | "slate";

type ActivityItem = {
  title: string;
  detail: string;
  time: string;
  icon: LucideIcon;
  tone: DashboardTone;
};

const metrics = [
  { label: "Consultas hoy", value: "12", trend: "↑ 20%", icon: CalendarDays, tone: "blue" as const },
  { label: "Pacientes atendidos", value: "18", trend: "↑ 15%", icon: Users, tone: "green" as const },
  { label: "Recetas emitidas", value: "7", trend: "↑ 12%", icon: Pill, tone: "red" as const },
  { label: "Resultados pendientes", value: "5", icon: Clock3, tone: "orange" as const },
  { label: "Teleconsultas hoy", value: "3", icon: Video, tone: "violet" as const },
] as const;

const appointments = [
  { time: "09:00", name: "Juan Pérez", reason: "Consulta nueva", status: "Completada", tone: "green" as const },
  { time: "10:30", name: "María López", reason: "Control cardiológico", status: "En curso", tone: "orange" as const },
  { time: "12:00", name: "Pedro García", reason: "Seguimiento post operatorio", status: "Programada", tone: "blue" as const },
  { time: "14:30", name: "Ana Torres", reason: "Teleconsulta", status: "Programada", tone: "violet" as const },
  { time: "16:00", name: "Carlos Méndez", reason: "Revisión de exámenes", status: "Pendiente", tone: "slate" as const },
] as const;

const recentActivity: readonly ActivityItem[] = [
  { title: "Consulta realizada", detail: "Juan Pérez · Checkup general", time: "Hoy 09:15 AM", icon: CalendarDays, tone: "blue" },
  { title: "Receta emitida", detail: "María López · Metformina 850mg", time: "Hoy 10:45 AM", icon: Pill, tone: "red" },
  { title: "Resultado de laboratorio", detail: "Pedro García · Hemograma", time: "Hoy 11:20 AM", icon: FlaskConical, tone: "blue" },
  { title: "Estudio de imagen", detail: "Ana Torres · Ecocardiograma", time: "Ayer 04:30 PM", icon: Activity, tone: "green" },
];

const frequentPatients = [
  { initials: "ML", name: "María López", detail: "Control cardiológico", visits: "2 citas", tone: "orange" as const },
  { initials: "JP", name: "Juan Pérez", detail: "Seguimiento hipertensión", visits: "3 citas", tone: "blue" as const },
  { initials: "PG", name: "Pedro García", detail: "Post operatorio", visits: "1 cita", tone: "slate" as const },
  { initials: "AT", name: "Ana Torres", detail: "Control prenatal", visits: "2 citas", tone: "violet" as const },
] as const;

function MonthlyIndicatorsChart() {
  return (
    <figure className="mt-4" aria-labelledby="monthly-chart-title monthly-chart-description">
      <figcaption id="monthly-chart-description" className="sr-only">Evolución mensual de consultas, pacientes y recetas.</figcaption>
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-[0.62rem] font-bold text-muted" aria-hidden="true">
        <span className="inline-flex items-center gap-1.5"><LegendDot tone="blue" />Consultas</span>
        <span className="inline-flex items-center gap-1.5"><LegendDot tone="green" />Pacientes</span>
        <span className="inline-flex items-center gap-1.5"><LegendDot tone="orange" />Recetas</span>
      </div>
      <svg className="h-auto w-full overflow-visible" viewBox="0 0 360 175" role="img" aria-labelledby="monthly-chart-title monthly-chart-description">
        <title id="monthly-chart-title">Indicadores del mes</title>
        {[25, 55, 85, 115, 145].map((y) => <line key={y} x1="36" y1={y} x2="348" y2={y} className="stroke-line" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
        {["40", "30", "20", "10", "0"].map((label, index) => <text key={label} x="2" y={29 + index * 30} className="fill-ink-secondary text-[9px]">{label}</text>)}
        <polyline points="38,114 75,91 112,92 149,72 186,77 223,58 260,58 297,49 334,59 348,51" className="fill-none stroke-accent" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <polyline points="38,136 75,122 112,119 149,106 186,112 223,96 260,96 297,86 334,96 348,91" className="fill-none stroke-success" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <polyline points="38,152 75,144 112,139 149,146 186,151 223,127 260,137 297,119 334,130 348,121" className="fill-none stroke-warning" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {["1 May", "8 May", "16 May", "24 May", "31 May"].map((label, index) => <text key={label} x={[38, 112, 186, 260, 334][index]} y="173" textAnchor="middle" className="fill-ink-secondary text-[9px]">{label}</text>)}
      </svg>
    </figure>
  );
}

function ConsultationDistribution() {
  return (
    <figure className="mt-2" aria-labelledby="distribution-title distribution-description">
      <figcaption id="distribution-description" className="sr-only">Distribución de consultas por especialidad.</figcaption>
      <div className="grid grid-cols-[minmax(132px,1fr)_1fr] items-center gap-3">
        <div className="relative grid place-items-center">
          <svg className="col-start-1 row-start-1 size-36 -rotate-90" viewBox="0 0 120 120" role="img" aria-labelledby="distribution-title distribution-description">
            <title id="distribution-title">Distribución de consultas</title>
            <circle cx="60" cy="60" r="43" className="fill-none stroke-surface-subtle" strokeWidth="13" />
            <circle cx="60" cy="60" r="43" pathLength="100" className="fill-none stroke-accent" strokeWidth="13" strokeDasharray="60 40" />
            <circle cx="60" cy="60" r="43" pathLength="100" className="fill-none stroke-success" strokeWidth="13" strokeDasharray="25 75" strokeDashoffset="-60" />
            <circle cx="60" cy="60" r="43" pathLength="100" className="fill-none stroke-warning" strokeWidth="13" strokeDasharray="10 90" strokeDashoffset="-85" />
            <circle cx="60" cy="60" r="43" pathLength="100" className="fill-none stroke-violet" strokeWidth="13" strokeDasharray="5 95" strokeDashoffset="-95" />
          </svg>
          <div className="col-start-1 row-start-1 text-center" aria-hidden="true">
            <strong className="block font-mono text-2xl tracking-[-0.07em]">48</strong>
            <span className="text-[0.58rem] font-bold text-muted">Total</span>
          </div>
        </div>
        <ul className="grid gap-3 text-[0.62rem]">
          <li className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-muted"><LegendDot tone="blue" />Cardiología</span><strong>60%</strong></li>
          <li className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-muted"><LegendDot tone="green" />Control</span><strong>25%</strong></li>
          <li className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-muted"><LegendDot tone="orange" />Seguimiento</span><strong>10%</strong></li>
          <li className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-muted"><LegendDot tone="violet" />Otros</span><strong>5%</strong></li>
        </ul>
      </div>
    </figure>
  );
}

export default async function DoctorDashboardPage() {
  const session = await getAuthenticatedSession();
  const fullName = session?.user.name?.trim() || "Doctor";
  const firstName = fullName.split(/\s+/)[0];

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      <header className="mb-4">
        <h1 className="text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.65rem]">Panel Médico</h1>
        <p className="mt-1 text-[0.76rem] font-extrabold text-ink-secondary">¡Buenos días, Dr. {firstName}! <span aria-hidden="true">👋</span></p>
        <p className="mt-1 text-[0.65rem] font-bold text-ink-secondary">Resumen de su actividad médica hoy</p>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5" aria-label="Resumen de actividad">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_1fr_0.95fr]" aria-label="Actividad clínica">
        <DoctorCard className="min-w-0 p-4 sm:p-4">
          <SectionHeading title="Agenda del día" action="Ver agenda completa" />
          <ol className="mt-3 divide-y divide-line">
            {appointments.map((appointment) => (
              <li className="relative flex min-h-[49px] items-center gap-2.5 py-2" key={`${appointment.time}-${appointment.name}`}>
                <span className={`relative z-10 grid size-3 shrink-0 place-items-center rounded-full ${appointment.tone === "green" ? "bg-success" : appointment.tone === "orange" ? "bg-warning" : appointment.tone === "violet" ? "bg-violet" : appointment.tone === "blue" ? "bg-accent" : "bg-muted"}`} aria-hidden="true" />
                <time className="w-11 shrink-0 font-mono text-[0.68rem] font-extrabold" dateTime={`2024-05-16T${appointment.time}`}>{appointment.time}</time>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.68rem] font-extrabold">{appointment.name}</p>
                  <p className="truncate text-[0.59rem] font-bold text-ink-secondary">{appointment.reason}</p>
                </div>
                <StatusBadge tone={appointment.tone}>{appointment.status}</StatusBadge>
                <span className={`grid size-5 shrink-0 place-items-center rounded-full ${toneClass(appointment.tone)}`} aria-hidden="true"><CheckCircle2 className="size-3" strokeWidth={2} /></span>
              </li>
            ))}
          </ol>
        </DoctorCard>

        <DoctorCard className="min-w-0 p-4 sm:p-4">
          <SectionHeading title="Actividad reciente" action="Ver todos" />
          <ol className="mt-3 divide-y divide-line">
            {recentActivity.map(({ title, detail, time, icon: Icon, tone }) => (
              <li className="flex min-w-0 items-center gap-2.5 py-2.5" key={`${title}-${time}`}>
                <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${toneClass(tone)}`}><Icon className="size-4" strokeWidth={1.8} aria-hidden="true" /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-[0.68rem] font-extrabold">{title}</p><p className="mt-0.5 truncate text-[0.59rem] font-bold text-ink-secondary">{detail}</p></div>
                <time className="shrink-0 text-[0.55rem] font-bold text-ink-secondary">{time}</time>
              </li>
            ))}
          </ol>
        </DoctorCard>

        <DoctorCard className="min-w-0 p-4 sm:p-4">
          <SectionHeading title="Pacientes frecuentes" action="Ver todos" />
          <ul className="mt-3 divide-y divide-line">
            {frequentPatients.map((patient) => (
              <li key={patient.name}>
                <button className="flex min-h-[48px] w-full items-center gap-2.5 py-1 text-left hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label={`Abrir ${patient.name}`}>
                  <DoctorAvatar initials={patient.initials} tone={patient.tone} size="md" />
                  <span className="min-w-0 flex-1"><span className="block truncate text-[0.67rem] font-extrabold">{patient.name}</span><span className="mt-0.5 block truncate text-[0.58rem] font-bold text-ink-secondary">{patient.detail}</span></span>
                  <span className={`shrink-0 rounded-md border px-2 py-1 text-[0.6rem] font-extrabold ${patient.tone === "orange" ? "border-danger/20 text-danger" : "border-accent/15 text-accent"}`}>{patient.visits}</span>
                </button>
              </li>
            ))}
          </ul>
        </DoctorCard>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[1.35fr_0.95fr_1fr_0.95fr]" aria-label="Indicadores y alertas">
        <DoctorCard className="min-w-0 p-4 sm:p-4">
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-[0.86rem] font-extrabold">Indicadores del mes</h2><p className="mt-1 text-[0.6rem] font-bold text-ink-secondary">Consultas, pacientes y recetas</p></div><button className="rounded-md border border-line px-2.5 py-1.5 text-[0.58rem] font-extrabold focus-visible:outline-3 focus-visible:outline-focus" type="button">Este mes⌄</button></div>
          <MonthlyIndicatorsChart />
        </DoctorCard>

        <DoctorCard className="min-w-0 p-4 sm:p-4">
          <div><h2 className="text-[0.86rem] font-extrabold">Distribución de consultas</h2><p className="mt-1 text-[0.6rem] font-bold text-ink-secondary">Por especialidad</p></div>
          <ConsultationDistribution />
        </DoctorCard>

        <DoctorCard className="min-w-0 p-4 sm:p-4">
          <SectionHeading title="Alertas y recordatorios" action="Ver todos" />
          <ul className="mt-3 grid gap-2">
            <li className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-2"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-warning-soft text-warning"><ClipboardCheck className="size-3.5" aria-hidden="true" /></span><span className="min-w-0 flex-1"><b className="block truncate text-[0.62rem]">3 resultados pendientes</b><small className="block truncate text-[0.56rem] font-bold text-ink-secondary">Laboratorio</small></span></li>
            <li className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-2"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-warning-soft text-warning"><Pill className="size-3.5" aria-hidden="true" /></span><span className="min-w-0 flex-1"><b className="block truncate text-[0.62rem]">2 recetas por renovar</b><small className="block truncate text-[0.56rem] font-bold text-ink-secondary">Pacientes frecuentes</small></span></li>
            <li className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-2"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-violet-soft text-violet"><Sparkles className="size-3.5" aria-hidden="true" /></span><span className="min-w-0 flex-1"><b className="block truncate text-[0.62rem]">Capacitación disponible</b><small className="block truncate text-[0.56rem] font-bold text-ink-secondary">Webinar · Cardiología</small></span></li>
            <li className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-2"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-success-soft text-success"><CalendarDays className="size-3.5" aria-hidden="true" /></span><span className="min-w-0 flex-1"><b className="block truncate text-[0.62rem]">Recordatorio</b><small className="block truncate text-[0.56rem] font-bold text-ink-secondary">Reunión clínica hoy 6:00 PM</small></span></li>
          </ul>
        </DoctorCard>

        <DoctorCard className="relative min-w-0 overflow-hidden p-4 sm:p-4">
          <span className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg bg-violet-soft text-violet"><BrainIcon /></span>
          <SectionHeading title="IA Epidemiológica" action="Ver informe" />
          <div className="mt-3 rounded-lg border border-line bg-surface-subtle p-3">
            <p className="text-[0.58rem] font-bold text-ink-secondary">Riesgo actual</p>
            <div className="mt-1 flex items-center justify-between"><strong className="text-lg font-extrabold text-success">Bajo</strong><span className="text-[0.62rem] font-bold text-ink-secondary">›</span></div>
            <p className="mt-0.5 text-[0.56rem] font-bold text-ink-secondary">Tendencia estable</p>
          </div>
          <div className="mt-2 rounded-lg border border-line bg-surface-subtle p-3"><p className="text-[0.58rem] font-bold text-ink-secondary">Última actualización</p><p className="mt-1 text-[0.62rem] font-extrabold">Hoy, 10:30 AM</p><p className="mt-0.5 text-[0.55rem] font-bold text-ink-secondary">Datos de la última hora</p></div>
          <button className="mt-3 inline-flex w-full items-center justify-center gap-1 text-[0.6rem] font-extrabold text-accent focus-visible:outline-3 focus-visible:outline-focus" type="button">Ver IA Epidemiológica <ArrowUpRight className="size-3" aria-hidden="true" /></button>
        </DoctorCard>
      </section>
    </div>
  );
}

function toneClass(tone: DashboardTone) {
  switch (tone) {
    case "green": return "bg-success-soft text-success";
    case "orange": return "bg-warning-soft text-warning";
    case "red": return "bg-danger-soft text-danger";
    case "violet": return "bg-violet-soft text-violet";
    case "slate": return "bg-surface-subtle text-muted";
    default: return "bg-accent-soft text-accent";
  }
}

function BrainIcon() {
  return <HeartPulse className="size-4" strokeWidth={1.8} aria-hidden="true" />;
}

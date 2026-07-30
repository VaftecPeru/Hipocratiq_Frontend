import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  Sparkles,
  Stethoscope,
  Users,
  Video,
} from "lucide-react";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";

type Metric = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: string;
};

const metrics: readonly Metric[] = [
  {
    label: "Consultas hoy",
    value: "8",
    detail: "6 completadas",
    icon: CalendarDays,
    tone: "bg-accent-soft text-accent",
  },
  {
    label: "Pacientes atendidos",
    value: "64",
    detail: "Este mes",
    icon: Users,
    tone: "bg-success-soft text-success",
  },
  {
    label: "Recetas emitidas",
    value: "41",
    detail: "+12% mensual",
    icon: FileText,
    tone: "bg-violet-soft text-violet",
  },
  {
    label: "Resultados pendientes",
    value: "3",
    detail: "Por revisar",
    icon: ClipboardCheck,
    tone: "bg-warning-soft text-warning",
  },
  {
    label: "Teleconsultas",
    value: "5",
    detail: "2 por iniciar",
    icon: Video,
    tone: "bg-accent-soft text-accent",
  },
];

const appointments = [
  { time: "09:00", name: "Laura Méndez", reason: "Control de hipertensión", status: "Completada", tone: "text-success" },
  { time: "10:30", name: "Marcos Ríos", reason: "Primera consulta", status: "En curso", tone: "text-accent" },
  { time: "12:00", name: "Ana Torres", reason: "Teleconsulta · seguimiento", status: "Próxima", tone: "text-violet" },
  { time: "15:30", name: "Julia Vega", reason: "Revisión de resultados", status: "Confirmada", tone: "text-muted" },
] as const;

const recentActivity = [
  { title: "Receta electrónica emitida", detail: "Para Roberto Silva", time: "Hace 18 min", icon: FileText, tone: "bg-violet-soft text-violet" },
  { title: "Resultado de laboratorio recibido", detail: "Perfil lipídico · Ana Torres", time: "Hace 42 min", icon: ClipboardCheck, tone: "bg-warning-soft text-warning" },
  { title: "Consulta finalizada", detail: "Laura Méndez · 38 min", time: "09:41", icon: CheckCircle2, tone: "bg-success-soft text-success" },
  { title: "Nota clínica actualizada", detail: "Expediente de Diego Luna", time: "Ayer", icon: Stethoscope, tone: "bg-accent-soft text-accent" },
] as const;

const frequentPatients = [
  { initials: "LM", name: "Laura Méndez", detail: "Hipertensión", visits: "7 consultas", tone: "bg-accent-soft text-accent" },
  { initials: "RS", name: "Roberto Silva", detail: "Diabetes tipo 2", visits: "5 consultas", tone: "bg-success-soft text-success" },
  { initials: "AT", name: "Ana Torres", detail: "Seguimiento general", visits: "4 consultas", tone: "bg-violet-soft text-violet" },
] as const;

const cardClass = "rounded-xl border border-line bg-surface shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]";

function MonthlyIndicatorsChart() {
  return (
    <figure className="mt-5" aria-labelledby="monthly-chart-title monthly-chart-description">
      <figcaption id="monthly-chart-description" className="sr-only">
        Evolución de consultas, pacientes y recetas de febrero a julio.
      </figcaption>
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-2xs font-bold text-muted" aria-hidden="true">
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-accent" />Consultas</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-success" />Pacientes</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-violet" />Recetas</span>
      </div>
      <svg className="h-auto w-full overflow-visible" viewBox="0 0 340 180" role="img" aria-labelledby="monthly-chart-title monthly-chart-description">
        <title id="monthly-chart-title">Indicadores clínicos de los últimos seis meses</title>
        {[30, 60, 90, 120, 150].map((y) => (
          <line key={y} x1="30" y1={y} x2="326" y2={y} className="stroke-line" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        <polyline points="34,124 91,108 148,94 205,73 262,66 319,42" className="fill-none stroke-accent" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <polyline points="34,139 91,126 148,115 205,101 262,89 319,72" className="fill-none stroke-success" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <polyline points="34,148 91,139 148,125 205,116 262,99 319,87" className="fill-none stroke-violet" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {[
          [34, 124], [91, 108], [148, 94], [205, 73], [262, 66], [319, 42],
        ].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" className="fill-surface stroke-accent" strokeWidth="2" />)}
        {[
          ["Feb", 34], ["Mar", 91], ["Abr", 148], ["May", 205], ["Jun", 262], ["Jul", 319],
        ].map(([label, x]) => <text key={label} x={x} y="172" textAnchor="middle" className="fill-muted text-[9px]">{label}</text>)}
      </svg>
    </figure>
  );
}

function ConsultationDistribution() {
  return (
    <figure className="mt-5" aria-labelledby="distribution-title distribution-description">
      <figcaption id="distribution-description" className="sr-only">
        58 por ciento de consultas presenciales, 27 por ciento teleconsultas y 15 por ciento urgencias.
      </figcaption>
      <div className="mx-auto grid max-w-60 place-items-center">
        <svg className="col-start-1 row-start-1 size-40 -rotate-90" viewBox="0 0 120 120" role="img" aria-labelledby="distribution-title distribution-description">
          <title id="distribution-title">Distribución de consultas</title>
          <circle cx="60" cy="60" r="44" className="fill-none stroke-surface-subtle" strokeWidth="13" />
          <circle cx="60" cy="60" r="44" pathLength="100" className="fill-none stroke-accent" strokeWidth="13" strokeDasharray="58 42" />
          <circle cx="60" cy="60" r="44" pathLength="100" className="fill-none stroke-success" strokeWidth="13" strokeDasharray="27 73" strokeDashoffset="-58" />
          <circle cx="60" cy="60" r="44" pathLength="100" className="fill-none stroke-violet" strokeWidth="13" strokeDasharray="15 85" strokeDashoffset="-85" />
        </svg>
        <div className="col-start-1 row-start-1 text-center" aria-hidden="true">
          <strong className="block font-mono text-2xl tracking-[-0.06em]">78</strong>
          <span className="text-2xs font-bold text-muted">consultas</span>
        </div>
      </div>
      <ul className="mt-5 grid gap-2.5 text-xs">
        <li className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-muted"><span className="size-2 rounded-full bg-accent" />Presenciales</span><strong>58%</strong></li>
        <li className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-muted"><span className="size-2 rounded-full bg-success" />Teleconsultas</span><strong>27%</strong></li>
        <li className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-muted"><span className="size-2 rounded-full bg-violet" />Urgencias</span><strong>15%</strong></li>
      </ul>
    </figure>
  );
}

export default async function DoctorDashboardPage() {
  const session = await getAuthenticatedSession();
  const doctor = session?.user.doctor;
  const fullName = session?.user.name?.trim() || "Doctor";
  const firstName = fullName.split(/\s+/)[0];
  const specialty = doctor?.specialty || "Medicina general";
  const practice = doctor?.practice_type === "clinic"
    ? doctor.clinic?.name || "Médico afiliado"
    : `Práctica independiente${doctor?.plan ? ` · Plan ${doctor.plan}` : ""}`;

  return (
    <div className="mx-auto w-full max-w-360 px-4 py-5 sm:px-6 lg:px-7 lg:py-6">
      <header className="relative overflow-hidden rounded-xl border border-line bg-surface px-5 py-5 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)] sm:px-6">
        <span className="absolute inset-y-0 left-0 w-1 bg-accent" aria-hidden="true" />
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <p className="font-mono text-2xs font-semibold tracking-[0.15em] text-accent uppercase">Espacio profesional</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2 py-1 text-[0.6rem] font-extrabold text-success">
                <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />Verificado
              </span>
            </div>
            <h1 className="mt-2 font-display text-[clamp(1.75rem,3vw,2.5rem)] italic leading-none tracking-[-0.03em]">Panel <span className="font-sans not-italic font-extrabold">Médico</span></h1>
            <p className="mt-3 text-sm font-extrabold">Buenos días, <span className="text-accent">{firstName}.</span></p>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">Tienes 8 consultas programadas y 3 resultados clínicos que requieren atención hoy.</p>
          </div>

          <dl className="grid shrink-0 gap-2 text-xs sm:grid-cols-2 md:max-w-md">
            <div className="rounded-lg bg-surface-subtle px-3 py-2.5">
              <dt className="text-2xs font-bold text-muted">Especialidad</dt>
              <dd className="mt-0.5 truncate font-extrabold">{specialty}</dd>
            </div>
            <div className="rounded-lg bg-surface-subtle px-3 py-2.5">
              <dt className="text-2xs font-bold text-muted">Modalidad</dt>
              <dd className="mt-0.5 max-w-52 truncate font-extrabold" title={practice}>{practice}</dd>
            </div>
            {doctor?.medical_license ? (
              <div className="rounded-lg bg-accent-soft px-3 py-2.5 sm:col-span-2">
                <dt className="text-2xs font-bold text-accent">Licencia médica</dt>
                <dd className="mt-0.5 font-mono font-bold text-ink">{doctor.medical_license}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </header>

      <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5" aria-label="Resumen clínico de hoy">
        {metrics.map(({ label, value, detail, icon: Icon, tone }, index) => (
          <article className={`${cardClass} min-w-0 p-3.5 motion-safe:animate-[fade-up-in_400ms_ease-out_both]`} key={label} style={{ animationDelay: `${index * 60}ms` }}>
            <div className="flex items-start justify-between gap-2">
              <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${tone}`}><Icon className="size-4" strokeWidth={1.8} aria-hidden="true" /></span>
              <strong className="font-mono text-xl tracking-[-0.06em]">{value}</strong>
            </div>
            <h2 className="mt-3 truncate text-xs font-extrabold" title={label}>{label}</h2>
            <p className="mt-0.5 text-2xs text-muted">{detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_0.95fr_0.8fr]" aria-label="Operación clínica del día">
        <article className={`${cardClass} min-w-0 p-4 sm:p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div><h2 className="text-sm font-extrabold">Agenda del día</h2><p className="mt-1 text-2xs text-muted">Miércoles, 30 de julio · 8 citas</p></div>
            <span className="rounded-md bg-accent-soft px-2 py-1 text-2xs font-bold text-accent">75% completada</span>
          </div>
          <ol className="mt-4 divide-y divide-line">
            {appointments.map((appointment) => (
              <li key={`${appointment.time}-${appointment.name}`}>
                <details className="group py-1">
                  <summary className="flex min-h-13 list-none items-center gap-3 rounded-lg px-2 outline-none transition-colors hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus [&::-webkit-details-marker]:hidden">
                    <time className="w-10 shrink-0 font-mono text-2xs font-bold text-muted" dateTime={`2026-07-30T${appointment.time}`}>{appointment.time}</time>
                    <span className="min-w-0 flex-1"><span className="block truncate text-xs font-extrabold">{appointment.name}</span><span className="mt-0.5 block truncate text-2xs text-muted">{appointment.reason}</span></span>
                    <span className={`shrink-0 text-[0.6rem] font-extrabold ${appointment.tone}`}>{appointment.status}</span>
                  </summary>
                  <div className="ml-15 border-l-2 border-accent-soft px-3 py-2 text-2xs leading-5 text-muted">Expediente preparado y datos de contacto verificados.</div>
                </details>
              </li>
            ))}
          </ol>
        </article>

        <article className={`${cardClass} min-w-0 p-4 sm:p-5`}>
          <div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-extrabold">Actividad reciente</h2><p className="mt-1 text-2xs text-muted">Últimos movimientos del consultorio</p></div><Activity className="size-4 text-accent" aria-hidden="true" /></div>
          <ol className="mt-4 grid gap-1">
            {recentActivity.map(({ title, detail, time, icon: Icon, tone }) => (
              <li className="flex gap-3 rounded-lg px-2 py-2.5 hover:bg-surface-subtle" key={`${title}-${time}`}>
                <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${tone}`}><Icon className="size-3.5" strokeWidth={1.8} aria-hidden="true" /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold">{title}</p><p className="mt-0.5 truncate text-2xs text-muted">{detail}</p></div>
                <time className="shrink-0 text-[0.58rem] text-muted">{time}</time>
              </li>
            ))}
          </ol>
        </article>

        <article className={`${cardClass} min-w-0 p-4 sm:p-5`}>
          <div><h2 className="text-sm font-extrabold">Pacientes frecuentes</h2><p className="mt-1 text-2xs text-muted">Mayor recurrencia en 90 días</p></div>
          <ul className="mt-4 grid gap-2">
            {frequentPatients.map((patient) => (
              <li key={patient.name}>
                <button className="group flex min-h-14 w-full items-center gap-3 rounded-lg px-2 text-left transition-colors hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label={`Ver resumen de ${patient.name}`}>
                  <span className={`grid size-9 shrink-0 place-items-center rounded-full text-2xs font-extrabold ${patient.tone}`}>{patient.initials}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-xs font-extrabold">{patient.name}</span><span className="mt-0.5 block truncate text-2xs text-muted">{patient.detail}</span></span>
                  <span className="text-right text-[0.58rem] font-bold text-muted group-hover:text-accent">{patient.visits}</span>
                </button>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-12" aria-label="Análisis y seguimiento clínico">
        <article className={`${cardClass} min-w-0 p-4 sm:p-5 xl:col-span-5`}>
          <div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-extrabold">Indicadores del mes</h2><p className="mt-1 text-2xs text-muted">Actividad clínica acumulada</p></div><span className="font-mono text-2xs font-bold text-success">+14.2%</span></div>
          <MonthlyIndicatorsChart />
        </article>

        <article className={`${cardClass} min-w-0 p-4 sm:p-5 xl:col-span-3`}>
          <div><h2 className="text-sm font-extrabold">Distribución de consultas</h2><p className="mt-1 text-2xs text-muted">Por modalidad · julio</p></div>
          <ConsultationDistribution />
        </article>

        <article className={`${cardClass} min-w-0 p-4 sm:p-5 xl:col-span-2`}>
          <div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-extrabold">Alertas y recordatorios</h2><p className="mt-1 text-2xs text-muted">2 acciones prioritarias</p></div><Bell className="size-4 text-warning" aria-hidden="true" /></div>
          <ul className="mt-4 grid gap-3">
            <li className="rounded-lg border border-warning/20 bg-warning-soft p-3">
              <p className="text-xs font-extrabold text-warning">Resultados pendientes</p>
              <p className="mt-1 text-2xs leading-4 text-muted">3 estudios requieren validación antes de las 16:00.</p>
              <button className="mt-3 inline-flex min-h-8 items-center gap-1 text-2xs font-extrabold text-warning focus-visible:outline-3 focus-visible:outline-focus" type="button">Revisar ahora <ArrowUpRight className="size-3" aria-hidden="true" /></button>
            </li>
            <li className="rounded-lg border border-line bg-surface-subtle p-3">
              <p className="text-xs font-extrabold">Seguimiento clínico</p>
              <p className="mt-1 text-2xs leading-4 text-muted">Contactar a Roberto Silva esta semana.</p>
              <div className="mt-3 flex items-center gap-1.5 text-2xs font-bold text-muted"><Clock3 className="size-3" aria-hidden="true" />Viernes, 10:00</div>
            </li>
          </ul>
        </article>

        <article className={`${cardClass} relative min-w-0 overflow-hidden p-4 sm:p-5 xl:col-span-2`}>
          <span className="absolute top-0 right-0 grid size-16 translate-x-4 -translate-y-4 place-items-end rounded-full bg-accent-soft p-3 text-accent" aria-hidden="true"><Sparkles className="size-4" /></span>
          <div className="relative"><p className="font-mono text-[0.58rem] font-bold tracking-[0.12em] text-accent uppercase">Vigilancia activa</p><h2 className="mt-2 text-sm font-extrabold">IA Epidemiológica</h2><p className="mt-1 text-2xs leading-4 text-muted">Señales clínicas de tu zona de atención.</p></div>
          <div className="relative mt-5 rounded-lg border border-accent/20 bg-accent-soft p-3">
            <div className="flex items-center gap-2 text-accent"><span className="size-2 rounded-full bg-accent" aria-hidden="true" /><strong className="text-2xs">Riesgo moderado</strong></div>
            <p className="mt-2 text-xs font-extrabold leading-5">Aumento estacional de cuadros respiratorios</p>
            <p className="mt-1 text-2xs leading-4 text-muted">18% más consultas compatibles durante los últimos 7 días.</p>
          </div>
          <button className="relative mt-4 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 text-2xs font-extrabold text-white transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus" type="button">Ver análisis <ArrowUpRight className="size-3" aria-hidden="true" /></button>
          <p className="relative mt-3 text-center text-[0.56rem] text-muted">Actualizado hoy, 10:30</p>
        </article>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Clock3,
  Cpu,
  Database,
  DollarSign,
  HardDrive,
  HeartPulse,

  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";

export const metadata: Metadata = {
  title: "Panel administrativo",
};

type Kpi = {
  label: string;
  value: string;
  unit?: string;
  change: string;
  direction: "up" | "down";
  icon: LucideIcon;
  tone: string;
};

const kpis: Kpi[] = [
  { label: "Clínicas Activas", value: "128", change: "+8 este mes", direction: "up", icon: Building2, tone: "bg-accent-soft text-accent" },
  { label: "Usuarios Activos", value: "8,642", change: "+5.4% mensual", direction: "up", icon: Users, tone: "bg-violet-soft text-violet" },
  { label: "Pacientes Activos", value: "312,450", change: "+12.8% mensual", direction: "up", icon: UserRound, tone: "bg-success-soft text-success" },
  { label: "Ingresos Mensuales", value: "$342,850", unit: "USD", change: "+9.2% mensual", direction: "up", icon: DollarSign, tone: "bg-warning-soft text-warning" },
  { label: "Uptime", value: "99.98%", change: "Objetivo 99.95%", direction: "up", icon: Activity, tone: "bg-success-soft text-success" },
];

const activityItems = [
  { title: "Nueva clínica registrada", detail: "Clínica San José · Ciudad de México", time: "Hace 5 min", icon: Building2, tone: "bg-success-soft text-success" },
  { title: "Nuevo usuario administrador", detail: "Ana Torres · Clínica del Valle", time: "Hace 15 min", icon: UserRound, tone: "bg-accent-soft text-accent" },
  { title: "Pago recibido", detail: "Clínica Arequipa · USD $3,250", time: "Hace 35 min", icon: DollarSign, tone: "bg-warning-soft text-warning" },
  { title: "Plan actualizado", detail: "Clínica San Pablo · Enterprise", time: "Hace 1 hora", icon: ShieldCheck, tone: "bg-violet-soft text-violet" },
  { title: "Clínica suspendida", detail: "Clínica Los Olivos · Incumplimiento de pago", time: "Hace 2 horas", icon: Building2, tone: "bg-danger-soft text-danger" },
] as const;

const activeClinics = [
  ["Clínica San José", "Ciudad de México, México"],
  ["Clínica del Valle", "Guadalajara, México"],
  ["Hospital Central", "Monterrey, México"],
  ["Clínica Arequipa", "Arequipa, Perú"],
  ["Clínica San Pablo", "Lima, Perú"],
] as const;

const usageMetrics = [
  { label: "CPU promedio", value: "28%", helper: "Estable durante las últimas 24 h", icon: Cpu, points: "3,30 18,26 33,31 48,21 63,24 78,18 93,20 108,14 123,18 137,15" },
  { label: "Memoria", value: "54%", helper: "4.3 TB de 7.9 TB", icon: Database, points: "3,27 18,25 33,26 48,23 63,25 78,20 93,22 108,18 123,20 137,17" },
  { label: "Solicitudes API", value: "1.2M", helper: "+11% frente al día anterior", icon: Zap, points: "3,34 18,31 33,27 48,24 63,21 78,18 93,15 108,13 123,11 137,9" },
  { label: "Almacenamiento", value: "61%", helper: "244 TB de 400 TB", icon: HardDrive, points: "3,29 18,28 33,27 48,25 63,23 78,21 93,19 108,17 123,15 137,13" },
] as const;

const revenueMonths = [
  ["Ago", 54, 190],
  ["Sep", 116, 174],
  ["Oct", 178, 154],
  ["Nov", 240, 138],
  ["Dic", 302, 120],
  ["Ene", 364, 108],
  ["Feb", 426, 92],
  ["Mar", 488, 78],
  ["Abr", 550, 72],
  ["May", 612, 58],
  ["Jun", 674, 48],
  ["Jul", 736, 40],
] as const;

const systemServices = [
  ["CPU promedio", "28%", "Normal"],
  ["Memoria", "54%", "Normal"],
  ["Base de datos", "32%", "Normal"],
  ["Almacenamiento", "61%", "Normal"],
  ["Uptime", "99.98%", "Estable"],
] as const;

function KpiCard({ item, index }: { item: Kpi; index: number }) {
  const Icon = item.icon;
  const TrendIcon = item.direction === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <article
      className="min-w-0 rounded-xl border border-line bg-surface p-3.5 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)] motion-safe:animate-[fade-up-in_400ms_ease-out_both]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-2xs font-bold leading-4 text-muted">{item.label}</p>
        <span className={`grid size-7 shrink-0 place-items-center rounded-lg ${item.tone}`} aria-hidden="true">
          <Icon className="size-3.5" strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-3 font-mono text-xl font-bold leading-none tracking-[-0.055em] text-ink sm:text-[1.35rem]">
        {item.unit ? <span className="mr-1.5 align-middle text-2xs font-semibold tracking-normal text-muted">{item.unit}</span> : null}
        {item.value}
      </p>
      <p className={`mt-2 flex items-center gap-1 text-2xs font-bold ${item.direction === "up" ? "text-success" : "text-danger"}`}>
        <TrendIcon className="size-3" strokeWidth={2} aria-hidden="true" />
        {item.change}
      </p>
    </article>
  );
}

function RevenueChart() {
  return (
    <article className="min-w-0 rounded-2xl border border-line bg-surface p-4 shadow-[0_0.5rem_2rem_rgb(16_27_51/4%)] sm:p-5" aria-labelledby="revenue-title">
      <header className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-2xs font-semibold tracking-[0.14em] text-accent uppercase">Rendimiento financiero</p>
          <h2 className="mt-1 text-sm font-extrabold" id="revenue-title">Ingresos SaaS · últimos 12 meses</h2>
        </div>
        <div className="sm:text-right">
          <p className="text-2xs font-semibold text-muted">Total anual</p>
          <p className="mt-0.5 font-mono text-xl font-bold tracking-tighter text-ink">USD $3,627,540</p>
          <p className="mt-1 inline-flex items-center gap-1 text-2xs font-bold text-success">
            <ArrowUpRight className="size-3" aria-hidden="true" /> 18.6% interanual
          </p>
        </div>
      </header>

      <figure className="mt-4 overflow-x-auto pb-1">
        <svg className="h-auto min-w-xl" viewBox="0 0 780 260" role="img" aria-labelledby="revenue-chart-title revenue-chart-description">
          <title id="revenue-chart-title">Evolución de ingresos SaaS mensuales</title>
          <desc id="revenue-chart-description">Gráfico de área ascendente desde agosto hasta julio, cuando los ingresos alcanzan 342 mil 850 dólares.</desc>
          <defs>
            <linearGradient id="revenue-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {[40, 85, 130, 175, 220].map((y) => (
            <line key={y} x1="54" x2="748" y1={y} y2={y} stroke="var(--line)" strokeDasharray="3 5" />
          ))}
          <text x="8" y="44" fill="var(--muted)" fontSize="10">$350k</text>
          <text x="8" y="89" fill="var(--muted)" fontSize="10">$300k</text>
          <text x="8" y="134" fill="var(--muted)" fontSize="10">$250k</text>
          <text x="8" y="179" fill="var(--muted)" fontSize="10">$200k</text>
          <text x="8" y="224" fill="var(--muted)" fontSize="10">$150k</text>

          <path
            d="M54 190 C80 186 90 170 116 174 C142 178 152 150 178 154 C204 158 214 133 240 138 C266 143 276 116 302 120 C328 124 338 105 364 108 C390 111 400 88 426 92 C452 96 462 72 488 78 C514 84 524 68 550 72 C576 76 586 52 612 58 C638 64 648 44 674 48 C700 52 710 34 736 40 L736 220 L54 220 Z"
            fill="url(#revenue-area)"
          />
          <path
            d="M54 190 C80 186 90 170 116 174 C142 178 152 150 178 154 C204 158 214 133 240 138 C266 143 276 116 302 120 C328 124 338 105 364 108 C390 111 400 88 426 92 C452 96 462 72 488 78 C514 84 524 68 550 72 C576 76 586 52 612 58 C638 64 648 44 674 48 C700 52 710 34 736 40"
            fill="none"
            stroke="var(--accent)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
          {revenueMonths.map(([month, x, y], index) => (
            <g key={month}>
              <circle cx={x} cy={y} r={index === revenueMonths.length - 1 ? 5 : 3} fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
              <text x={x} y="246" fill="var(--muted)" fontSize="10" textAnchor="middle">{month}</text>
            </g>
          ))}
          <g transform="translate(674 10)">
            <rect width="76" height="24" rx="7" fill="var(--ink)" />
            <text x="38" y="16" fill="white" fontSize="10" fontWeight="700" textAnchor="middle">$342,850</text>
          </g>
        </svg>
        <figcaption className="sr-only">Ingresos mensuales en crecimiento sostenido durante los últimos doce meses.</figcaption>
      </figure>
    </article>
  );
}

function CountryDistribution() {
  return (
    <article className="rounded-2xl border border-line bg-surface p-5 shadow-[0_0.5rem_2rem_rgb(16_27_51/4%)]" aria-labelledby="distribution-title">
      <p className="font-mono text-2xs font-semibold tracking-[0.14em] text-muted uppercase">Cobertura regional</p>
      <h2 className="mt-1 text-sm font-extrabold" id="distribution-title">Distribución de clínicas</h2>

      <div className="mt-6 grid place-items-center">
        <div
          className="grid size-40 place-items-center rounded-full p-5"
          style={{ background: "conic-gradient(var(--accent) 0 56%, var(--focus) 56% 100%)" }}
          role="img"
          aria-label="Distribución de clínicas: México 56 por ciento y Perú 44 por ciento"
        >
          <div className="grid size-full place-items-center rounded-full bg-surface text-center shadow-[inset_0_0_0_1px_var(--line)]">
            <div>
              <span className="block font-mono text-3xl font-bold tracking-[-0.06em]">128</span>
              <span className="text-2xs font-semibold text-muted">clínicas</span>
            </div>
          </div>
        </div>
      </div>

      <dl className="mt-6 grid gap-3">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-line pb-3">
          <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
          <dt className="text-xs font-bold">México</dt>
          <dd className="text-right"><span className="font-mono text-xs font-bold">72</span><span className="ml-2 text-2xs text-muted">56%</span></dd>
        </div>
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <span className="size-2 rounded-full bg-focus" aria-hidden="true" />
          <dt className="text-xs font-bold">Perú</dt>
          <dd className="text-right"><span className="font-mono text-xs font-bold">56</span><span className="ml-2 text-2xs text-muted">44%</span></dd>
        </div>
      </dl>
    </article>
  );
}

function ActiveClinicsCard() {
  return (
    <article className="rounded-2xl border border-line bg-surface p-5" aria-labelledby="active-clinics-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-2xs font-semibold tracking-[0.14em] text-muted uppercase">Red operativa</p>
          <h2 className="mt-1 text-sm font-extrabold" id="active-clinics-title">Clínicas Activas</h2>
        </div>
        <span className="rounded-md bg-success-soft px-2 py-1 text-2xs font-bold text-success">128 total</span>
      </div>
      <ul className="mt-4 divide-y divide-line">
        {activeClinics.map(([name, location]) => (
          <li className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0" key={name}>
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent" aria-hidden="true">
              <Stethoscope className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold">{name}</span>
              <span className="mt-0.5 block truncate text-2xs text-muted">{location}</span>
            </span>
            <span className="rounded-md bg-success-soft px-2 py-0.5 text-[0.58rem] font-bold text-success">Activa</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function RecentActivityCard() {
  return (
    <article className="rounded-2xl border border-line bg-surface p-5" aria-labelledby="recent-activity-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-2xs font-semibold tracking-[0.14em] text-muted uppercase">Registro global</p>
          <h2 className="mt-1 text-sm font-extrabold" id="recent-activity-title">Actividad Reciente</h2>
        </div>
        <Clock3 className="size-4 text-muted" aria-hidden="true" />
      </div>
      <ol className="mt-4 divide-y divide-line">
        {activityItems.map((item) => {
          const Icon = item.icon;
          return (
            <li className="grid grid-cols-[2rem_1fr] gap-3 py-3 first:pt-1 last:pb-0" key={item.title}>
              <span className={`grid size-8 place-items-center rounded-lg ${item.tone}`} aria-hidden="true"><Icon className="size-3.5" /></span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold">{item.title}</p>
                <p className="mt-0.5 truncate text-2xs text-muted">{item.detail}</p>
                <time className="mt-1 block text-2xs font-semibold text-ink-secondary">{item.time}</time>
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
}

function SystemHealthCard() {
  return (
    <article className="rounded-2xl border border-line bg-surface p-5" aria-labelledby="system-health-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-2xs font-semibold tracking-[0.14em] text-muted uppercase">Estado en tiempo real</p>
          <h2 className="mt-1 text-sm font-extrabold" id="system-health-title">Salud del Sistema</h2>
        </div>
        <span className="grid size-8 place-items-center rounded-lg bg-success-soft text-success" aria-hidden="true"><HeartPulse className="size-4" /></span>
      </div>
      <div className="mt-5 rounded-xl border border-success/20 bg-success-soft/60 p-3.5">
        <div className="flex items-center gap-2 text-xs font-extrabold text-success"><ShieldCheck className="size-4" aria-hidden="true" />Todos los sistemas operativos</div>
        <p className="mt-1 text-2xs leading-4 text-muted">Sin incidentes reportados en las últimas 24 horas.</p>
      </div>
      <dl className="mt-3 divide-y divide-line">
        {systemServices.map(([service, value, status]) => (
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-2 text-xs" key={service}>
            <dt className="font-semibold text-ink-secondary">{service}</dt>
            <dd className="grid size-9 place-items-center rounded-full border-2 border-success-soft font-mono text-[0.58rem] font-bold text-ink">{value}</dd>
            <dd className="flex w-12 items-center gap-1.5 text-[0.58rem] font-bold text-success"><span className="size-1.5 rounded-full bg-success" aria-hidden="true" />{status}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function UsageCard({ metric }: { metric: (typeof usageMetrics)[number] }) {
  const Icon = metric.icon;

  return (
    <article className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent" aria-hidden="true"><Icon className="size-3.5" /></span>
          <h3 className="text-xs font-bold">{metric.label}</h3>
        </div>
        <span className="size-2 rounded-full bg-success shadow-[0_0_0_3px_var(--success-soft)]" aria-hidden="true" />
      </div>
      <p className="mt-4 font-mono text-xl font-bold tracking-tighter">{metric.value}</p>
      <p className="mt-1 text-2xs text-muted">{metric.helper}</p>
      <svg className="mt-4 h-10 w-full" viewBox="0 0 140 40" role="img" aria-label={`Tendencia reciente de ${metric.label}: estable`} preserveAspectRatio="none">
        <line x1="2" x2="138" y1="36" y2="36" stroke="var(--line)" strokeDasharray="2 3" />
        <polyline points={metric.points} fill="none" stroke="var(--accent)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </article>
  );
}

export default async function DashboardPage() {
  const session = await getAuthenticatedSession();

  if (!session) {
    redirect("/");
  }

  const firstName = session.user.name.split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-2xs font-semibold tracking-[0.16em] text-accent uppercase">Super Administración</p>
          <h1 className="mt-2 text-[clamp(1.65rem,4vw,2.45rem)] font-extrabold leading-none tracking-[-0.045em]">Panel de Control Global</h1>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-muted sm:text-sm">Hola, {firstName}. Supervisa el rendimiento operativo, financiero y técnico de toda la plataforma.</p>
        </div>
        <div className="flex items-center gap-2 text-2xs font-semibold text-muted">
          <span className="relative flex size-2" aria-hidden="true"><span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-50" /><span className="relative inline-flex size-2 rounded-full bg-success" /></span>
          Datos operativos actualizados
        </div>
      </header>

      <section className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-5" aria-label="Indicadores clave de la plataforma">
        {kpis.map((item, index) => (
          <div className={index === kpis.length - 1 ? "col-span-2 xl:col-span-1" : ""} key={item.label}>
            <KpiCard item={item} index={index} />
          </div>
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]" aria-label="Resumen financiero y regional">
        <RevenueChart />
        <CountryDistribution />
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Operación de la plataforma">
        <ActiveClinicsCard />
        <RecentActivityCard />
        <div className="md:col-span-2 xl:col-span-1"><SystemHealthCard /></div>
      </section>

      <section className="mt-8" aria-labelledby="system-usage-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-2xs font-semibold tracking-[0.14em] text-accent uppercase">Infraestructura</p>
            <h2 className="mt-1 text-base font-extrabold" id="system-usage-title">Uso del Sistema</h2>
          </div>
          <p className="hidden text-2xs font-semibold text-muted sm:block">Promedio de los últimos 15 minutos</p>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {usageMetrics.map((metric) => <UsageCard key={metric.label} metric={metric} />)}
        </div>
      </section>

      <footer className="mt-8 flex flex-col gap-2 border-t border-line py-5 text-2xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Panel global · Datos estáticos de referencia operativa</p>
        <p className="flex items-center gap-1.5"><Clock3 className="size-3" aria-hidden="true" />Última actualización: hace 2 minutos</p>
      </footer>
    </div>
  );
}

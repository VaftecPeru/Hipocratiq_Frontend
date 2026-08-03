import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Clock3,
  Cpu,
  Database,
  Eye,
  Gauge,
  HardDrive,
  Info,
  MonitorCheck,
  RefreshCw,
  RotateCw,
  TriangleAlert,
  Users,
  XCircle,
} from "lucide-react";
import { CountryFlag, type CountryCode } from "@/shared/ui/country-flag";
import { DataBadge, type BadgeTone } from "@/shared/ui/data-badge";
import { Sparkline, type SparklineTone } from "@/shared/ui/sparkline";

export const metadata: Metadata = {
  title: "Monitoreo del Sistema",
};

type StatusLabel = "Normal" | "Excelente";

type Metric = {
  label: string;
  value: string;
  icon: LucideIcon;
  spark: SparklineTone;
  points: number[];
  variant?: "bars";
  status?: StatusLabel;
  change?: string;
};

const metrics: Metric[] = [
  { label: "CPU Promedio", value: "28%", icon: Cpu, spark: "accent", points: [24, 30, 26, 32, 28, 34, 27, 28], status: "Normal" },
  { label: "Memoria", value: "54%", icon: Database, spark: "accent", points: [50, 52, 55, 51, 56, 53, 54, 54], status: "Normal" },
  { label: "Almacenamiento", value: "61%", icon: HardDrive, spark: "accent", points: [55, 56, 57, 58, 59, 60, 60, 61], status: "Normal" },
  { label: "Uptime", value: "99.98%", icon: MonitorCheck, spark: "success", points: [99.9, 99.95, 99.92, 99.97, 99.96, 99.98, 99.99, 99.98], status: "Excelente" },
  { label: "Respuesta API", value: "120 ms", icon: Gauge, spark: "accent", points: [140, 132, 128, 135, 124, 130, 122, 120], status: "Normal" },
  { label: "Error API", value: "0.12%", icon: TriangleAlert, spark: "danger", points: [0.2, 0.18, 0.22, 0.15, 0.17, 0.13, 0.14, 0.12], status: "Normal" },
  { label: "Trabajos en Cola", value: "23", icon: Boxes, spark: "accent", points: [14, 22, 9, 30, 18, 26, 12, 23], variant: "bars", status: "Normal" },
  { label: "Sesiones Activas", value: "2,842", icon: Users, spark: "accent", points: [10, 16, 12, 20, 18, 24, 22, 28], variant: "bars", change: "↑ 12% vs ayer" },
];

type Region = {
  countryCode: CountryCode;
  name: string;
  region: string;
  uptime: string;
  latency: string;
  clinics: string;
  users: string;
  mapPath: string;
  dots: Array<[number, number]>;
};

const regions: Region[] = [
  {
    countryCode: "MX",
    name: "México",
    region: "CDMX",
    uptime: "99.99%",
    latency: "118 ms",
    clinics: "128",
    users: "6,421",
    mapPath: "M12 30 L28 20 L44 24 L58 18 L74 26 L86 22 L96 34 L88 52 L92 70 L78 82 L62 76 L50 88 L36 78 L40 60 L22 58 L14 44 Z",
    dots: [[52, 40], [66, 52], [44, 62]],
  },
  {
    countryCode: "PE",
    name: "Perú",
    region: "Lima",
    uptime: "99.97%",
    latency: "126 ms",
    clinics: "8",
    users: "221",
    mapPath: "M44 12 L60 18 L66 32 L60 46 L66 60 L58 76 L48 90 L38 80 L42 64 L34 52 L30 36 L36 22 Z",
    dots: [[46, 46], [52, 64]],
  },
];

type PlatformService = {
  name: string;
  availability: string;
  responseP95: string;
  errors: string;
  region: string;
};

const services: PlatformService[] = [
  { name: "API Gateway", availability: "99.99%", responseP95: "120 ms", errors: "0.08%", region: "MX / PE" },
  { name: "Auth Service", availability: "99.98%", responseP95: "96 ms", errors: "0.03%", region: "MX / PE" },
  { name: "Clínicas Service", availability: "99.96%", responseP95: "110 ms", errors: "0.07%", region: "MX / PE" },
  { name: "Usuarios Service", availability: "99.95%", responseP95: "105 ms", errors: "0.04%", region: "MX / PE" },
  { name: "Reportes Service", availability: "99.91%", responseP95: "220 ms", errors: "0.09%", region: "MX / PE" },
  { name: "Facturación Service", availability: "99.95%", responseP95: "180 ms", errors: "0.06%", region: "MX / PE" },
  { name: "Notificaciones Service", availability: "99.93%", responseP95: "140 ms", errors: "0.02%", region: "MX / PE" },
  { name: "Almacenamiento", availability: "100%", responseP95: "86 ms", errors: "0.00%", region: "MX / PE" },
];

type IncidentSeverity = "Advertencia" | "Resuelto" | "Observado" | "Crítico";

const INCIDENT_TONE: Record<IncidentSeverity, BadgeTone> = {
  Advertencia: "warning",
  Resuelto: "success",
  Observado: "accent",
  Crítico: "danger",
};

const INCIDENT_ICON: Record<IncidentSeverity, LucideIcon> = {
  Advertencia: AlertTriangle,
  Resuelto: CheckCircle2,
  Observado: Eye,
  Crítico: XCircle,
};

type Incident = { id: string; title: string; severity: IncidentSeverity; time: string; countryCode: CountryCode };

const incidents: Incident[] = [
  { id: "in-1", title: "Degradación en Reportes Service", severity: "Advertencia", time: "Hoy, 08:21 AM", countryCode: "MX" },
  { id: "in-2", title: "Error intermitente", severity: "Resuelto", time: "Ayer, 11:42 PM", countryCode: "PE" },
  { id: "in-3", title: "Alta latencia", severity: "Observado", time: "Ayer, 07:36 AM", countryCode: "MX" },
  { id: "in-4", title: "Fallos en envío de correos", severity: "Crítico", time: "12 May, 09:18 PM", countryCode: "PE" },
];

type Deployment = { version: string; description: string; time: string };

const deployments: Deployment[] = [
  { version: "v2.45.0", description: "Mejoras en Reportes y adopción", time: "Hoy, 09:15 AM" },
  { version: "v2.44.2", description: "Optimización de Consultas", time: "Ayer, 06:47 PM" },
  { version: "v2.44.1", description: "Corrección de Notificaciones", time: "11 May, 11:30 PM" },
  { version: "v2.43.9", description: "Actualización de Dependencias", time: "10 May, 08:12 PM" },
];

type LogBucket = { label: string; value: string; change: string; direction: "up" | "down"; tone: SparklineTone; icon: LucideIcon; points: number[] };

const logBuckets: LogBucket[] = [
  { label: "Informativos", value: "12,842", change: "8.2%", direction: "up", tone: "accent", icon: Info, points: [40, 44, 42, 48, 46, 52, 50, 55] },
  { label: "Advertencias", value: "312", change: "4.6%", direction: "up", tone: "warning", icon: AlertTriangle, points: [30, 28, 34, 32, 30, 36, 33, 35] },
  { label: "Errores", value: "28", change: "12.5%", direction: "down", tone: "danger", icon: XCircle, points: [40, 38, 34, 30, 28, 26, 24, 22] },
  { label: "Críticos", value: "3", change: "25.0%", direction: "down", tone: "danger", icon: TriangleAlert, points: [10, 8, 7, 6, 5, 4, 4, 3] },
];

function MiniBars({ values, ariaLabel }: { values: number[]; ariaLabel: string }) {
  const max = Math.max(...values);
  const width = 100;
  const height = 32;
  const slot = width / values.length;
  const barW = slot * 0.62;

  return (
    <svg className="h-7 w-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={ariaLabel}>
      {values.map((value, index) => {
        const h = Math.max(2, (value / max) * (height - 4));
        return <rect key={index} x={index * slot + (slot - barW) / 2} y={height - h} width={barW} height={h} rx="1" fill="var(--accent)" opacity={index === values.length - 1 ? 1 : 0.4} />;
      })}
    </svg>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;

  return (
    <article className="min-w-0 rounded-xl border border-line bg-surface p-3 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]">
      <div className="flex items-center gap-2">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent" aria-hidden="true"><Icon className="size-3.5" strokeWidth={1.8} /></span>
        <p className="truncate text-2xs font-bold text-muted">{metric.label}</p>
      </div>
      <p className="mt-2 font-mono text-lg font-bold leading-none tracking-tight text-ink">{metric.value}</p>
      <div className="mt-2">
        {metric.variant === "bars"
          ? <MiniBars values={metric.points} ariaLabel={`Tendencia de ${metric.label}`} />
          : <Sparkline values={metric.points} tone={metric.spark} area className="h-7 w-full" ariaLabel={`Tendencia de ${metric.label}`} />}
      </div>
      {metric.status ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-2xs font-bold text-success"><span className="size-1.5 rounded-full bg-success" aria-hidden="true" />{metric.status}</p>
      ) : (
        <p className="mt-1.5 text-2xs font-bold text-success">{metric.change}</p>
      )}
    </article>
  );
}

function RegionCard({ region }: { region: Region }) {
  return (
    <article className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <CountryFlag countryCode={region.countryCode} className="h-4 w-6 shrink-0 rounded-[2px]" />
          <h3 className="text-sm font-extrabold">{region.name}</h3>
        </div>
        <DataBadge tone="success" dot>Operativo</DataBadge>
      </div>
      <div className="mt-3 grid grid-cols-[6rem_1fr] items-center gap-3">
        <svg className="h-auto w-full" viewBox="0 0 108 100" role="img" aria-label={`Mapa de ${region.name}`}>
          <path d={region.mapPath} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round" />
          {region.dots.map(([cx, cy], index) => (
            <g key={index}>
              <circle cx={cx} cy={cy} r="4" fill="var(--accent)" opacity="0.25" />
              <circle cx={cx} cy={cy} r="2" fill="var(--accent)" />
            </g>
          ))}
        </svg>
        <dl className="grid gap-1.5 text-2xs">
          <div className="flex items-center justify-between gap-2"><dt className="text-muted">Región</dt><dd className="font-bold text-ink">{region.region}</dd></div>
          <div className="flex items-center justify-between gap-2"><dt className="text-muted">Uptime</dt><dd className="font-mono font-bold text-success">{region.uptime}</dd></div>
          <div className="flex items-center justify-between gap-2"><dt className="text-muted">Latencia Promedio</dt><dd className="font-mono font-bold text-ink">{region.latency}</dd></div>
          <div className="flex items-center justify-between gap-2"><dt className="text-muted">Clínicas activas</dt><dd className="font-mono font-bold text-ink">{region.clinics}</dd></div>
          <div className="flex items-center justify-between gap-2"><dt className="text-muted">Usuarios activos</dt><dd className="font-mono font-bold text-ink">{region.users}</dd></div>
        </dl>
      </div>
    </article>
  );
}

function ServicesTable() {
  return (
    <article className="min-w-0 rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="services-title">
      <h2 className="flex items-center gap-1.5 text-sm font-extrabold" id="services-title">Servicios de la Plataforma<Info className="size-3 text-muted" aria-hidden="true" /></h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-lg border-collapse text-left">
          <caption className="sr-only">Estado de los servicios de la plataforma</caption>
          <thead>
            <tr className="border-b border-line text-2xs font-bold text-muted">
              <th className="py-2 pr-3 font-bold" scope="col">Servicio</th>
              <th className="px-3 py-2 font-bold" scope="col">Estado</th>
              <th className="px-3 py-2 font-bold" scope="col">Disponibilidad</th>
              <th className="px-3 py-2 font-bold" scope="col">Respuesta (p95)</th>
              <th className="px-3 py-2 font-bold" scope="col">Errores (24h)</th>
              <th className="px-3 py-2 font-bold" scope="col">Región</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {services.map((service) => (
              <tr className="text-xs transition-colors hover:bg-accent-soft/35" key={service.name}>
                <th className="whitespace-nowrap py-2 pr-3 font-bold text-ink" scope="row">{service.name}</th>
                <td className="px-3 py-2"><span className="inline-flex items-center gap-1.5 text-2xs font-bold text-success"><span className="size-1.5 rounded-full bg-success" aria-hidden="true" />Operativo</span></td>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-muted">{service.availability}</td>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-muted">{service.responseP95}</td>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-muted">{service.errors}</td>
                <td className="whitespace-nowrap px-3 py-2 text-muted">{service.region}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function IncidentsCard() {
  return (
    <article className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="incidents-title">
      <h2 className="flex items-center gap-1.5 text-sm font-extrabold" id="incidents-title">Incidentes Recientes<Info className="size-3 text-muted" aria-hidden="true" /></h2>
      <ul className="mt-3 divide-y divide-line">
        {incidents.map((incident) => {
          const Icon = INCIDENT_ICON[incident.severity];
          return (
            <li className="flex items-center gap-3 py-2.5" key={incident.id}>
              <span className={`grid size-7 shrink-0 place-items-center rounded-md ${TONE_ICON[INCIDENT_TONE[incident.severity]]}`} aria-hidden="true"><Icon className="size-3.5" strokeWidth={1.8} /></span>
              <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-ink">{incident.title}</p><time className="text-2xs text-muted">{incident.time}</time></div>
              <DataBadge tone={INCIDENT_TONE[incident.severity]}>{incident.severity}</DataBadge>
              <CountryFlag countryCode={incident.countryCode} />
            </li>
          );
        })}
      </ul>
      <button className="mt-2 flex min-h-8 w-full items-center justify-center gap-1 rounded-lg text-2xs font-bold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled title="Disponible al conectar la gestión de incidentes">Ver todos los incidentes ›</button>
    </article>
  );
}

function DeploymentsCard() {
  return (
    <article className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="deployments-title">
      <h2 className="flex items-center gap-1.5 text-sm font-extrabold" id="deployments-title">Deployments Recientes<Info className="size-3 text-muted" aria-hidden="true" /></h2>
      <ul className="mt-3 divide-y divide-line">
        {deployments.map((deployment) => (
          <li className="flex items-center gap-3 py-2.5" key={deployment.version}>
            <span className="grid size-7 shrink-0 place-items-center rounded-md bg-accent-soft text-accent" aria-hidden="true"><Boxes className="size-3.5" strokeWidth={1.8} /></span>
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-ink"><span className="font-mono">{deployment.version}</span> · {deployment.description}</p><time className="text-2xs text-muted">{deployment.time}</time></div>
            <DataBadge tone="neutral">Producción</DataBadge>
            <DataBadge tone="success" dot>Exitoso</DataBadge>
          </li>
        ))}
      </ul>
      <button className="mt-2 flex min-h-8 w-full items-center justify-center gap-1 rounded-lg text-2xs font-bold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled title="Disponible al conectar el historial de deployments">Ver todos los deployments ›</button>
    </article>
  );
}

function LogsCard() {
  return (
    <article className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="logs-title">
      <h2 className="flex items-center gap-1.5 text-sm font-extrabold" id="logs-title">Logs y Eventos (24h)<Info className="size-3 text-muted" aria-hidden="true" /></h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {logBuckets.map((bucket) => {
          const Icon = bucket.icon;
          return (
            <div className="rounded-lg border border-line p-3" key={bucket.label}>
              <p className="flex items-center gap-1.5 text-2xs font-bold text-muted"><Icon className={`size-3.5 ${LOG_ICON_COLOR[bucket.tone]}`} strokeWidth={1.8} aria-hidden="true" />{bucket.label}</p>
              <p className="mt-1.5 font-mono text-lg font-bold tracking-tight text-ink">{bucket.value}</p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className={`text-2xs font-bold ${bucket.direction === "up" ? "text-success" : "text-success"}`}>{bucket.direction === "up" ? "↑" : "↓"} {bucket.change}</span>
                <span className="w-14"><Sparkline values={bucket.points} tone={bucket.tone} className="h-5 w-full" ariaLabel={`Tendencia de ${bucket.label}`} /></span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-lg bg-surface-subtle px-3 py-2.5">
        <span className="text-2xs font-bold text-muted">Total eventos</span>
        <span className="flex items-center gap-2"><span className="font-mono text-sm font-bold text-ink">13,185</span><span className="text-2xs font-bold text-success">↑ 6.1% vs ayer</span></span>
      </div>
      <button className="mt-2 flex min-h-8 w-full items-center justify-center gap-1 rounded-lg text-2xs font-bold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled title="Disponible al conectar el visor de logs">Ver logs detallados ›</button>
    </article>
  );
}

export default function MonitoringPage() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
        <div>
          <h1 className="text-[clamp(1.3rem,1.8vw,1.6rem)] font-extrabold tracking-[-0.03em]">Monitoreo del Sistema</h1>
          <p className="mt-0.5 text-xs text-muted">Estado de la infraestructura y plataforma MEDIQ en tiempo real.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-2xs text-muted"><Clock3 className="size-3" aria-hidden="true" />Última actualización: Hoy, 10:30 AM<RefreshCw className="size-3" aria-hidden="true" /></span>
          <button className="flex min-h-9 items-center gap-1.5 rounded-lg border border-success/40 bg-success-soft px-3 text-xs font-bold text-success transition-colors focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-70" type="button" disabled title="Actualización automática (demostración visual)">
            <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />Auto
          </button>
          <button className="flex min-h-9 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-xs font-bold text-white transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled title="Disponible al conectar el monitoreo en vivo">
            <RotateCw className="size-3.5" strokeWidth={2} aria-hidden="true" />Actualizar
          </button>
        </div>
      </div>

      <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 min-[1600px]:grid-cols-8" aria-label="Métricas de infraestructura">
        {metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-2" aria-label="Estado por país y servicios">
        <article className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="regions-title">
          <h2 className="flex items-center gap-1.5 text-sm font-extrabold" id="regions-title">Estado por País / Región<Info className="size-3 text-muted" aria-hidden="true" /></h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {regions.map((region) => <RegionCard key={region.countryCode} region={region} />)}
          </div>
        </article>
        <ServicesTable />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-3" aria-label="Incidentes, deployments y logs">
        <IncidentsCard />
        <DeploymentsCard />
        <LogsCard />
      </section>

      <footer className="mt-4 flex items-center gap-1.5 border-t border-line py-4 text-2xs text-muted">
        <Info className="size-3" aria-hidden="true" />Los datos se actualizan cada 10 minutos. Última actualización: Hoy, 10:30 AM
      </footer>
    </div>
  );
}

const TONE_ICON: Record<BadgeTone, string> = {
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  violet: "bg-violet-soft text-violet",
  neutral: "bg-surface-subtle text-muted",
  dark: "bg-plan-enterprise text-white",
};

const LOG_ICON_COLOR: Record<SparklineTone, string> = {
  accent: "text-accent",
  success: "text-success",
  danger: "text-danger",
  warning: "text-warning",
  violet: "text-violet",
};

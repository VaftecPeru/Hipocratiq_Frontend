import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Headset,
  Info,
  Inbox,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Star,
  Wrench,
} from "lucide-react";
import { CountryFlag, type CountryCode } from "@/shared/ui/country-flag";
import { DonutChart } from "@/shared/ui/donut-chart";
import { Sparkline } from "@/shared/ui/sparkline";
import { StatCard, type StatCardProps } from "@/shared/ui/stat-card";

export const metadata: Metadata = {
  title: "Soporte",
};

const stats: Array<StatCardProps> = [
  { label: "Tickets Totales", value: "1,458", change: "+9.6% vs mes anterior", direction: "up", icon: Headset, tone: "accent" },
  { label: "Abiertos", value: "248", change: "6.2% vs mes anterior", direction: "down", icon: Inbox, tone: "danger" },
  { label: "En Proceso", value: "326", change: "+4.8% vs mes anterior", direction: "up", icon: RefreshCw, tone: "warning" },
  { label: "Resueltos", value: "884", change: "+12.4% vs mes anterior", direction: "up", icon: CheckCircle2, tone: "success" },
  { label: "SLA Cumplido", value: "94.2%", change: "+3.1% vs mes anterior", direction: "up", icon: Star, tone: "violet" },
];

const priorityByLevel = [
  { label: "Alta", value: "412", percentage: 28, color: "var(--danger)" },
  { label: "Media", value: "746", percentage: 51, color: "var(--warning)" },
  { label: "Baja", value: "300", percentage: 21, color: "var(--accent)" },
];

type IncidentCategory = { rank: number; label: string; tickets: number };

const incidentCategories: IncidentCategory[] = [
  { rank: 1, label: "Acceso y Autenticación", tickets: 342 },
  { rank: 2, label: "Reportes e Información", tickets: 286 },
  { rank: 3, label: "Facturación y Pagos", tickets: 214 },
  { rank: 4, label: "Funciones Clínicas", tickets: 198 },
];

type Agent = { name: string; resolved: number; sla: string; rating: number };

const agents: Agent[] = [
  { name: "Ana Torres", resolved: 184, sla: "96.3%", rating: 4.8 },
  { name: "Luis Martínez", resolved: 162, sla: "95.1%", rating: 4.7 },
  { name: "María González", resolved: 149, sla: "94.6%", rating: 4.6 },
  { name: "Carlos Mendoza", resolved: 138, sla: "93.8%", rating: 4.6 },
  { name: "Sofía Herrera", resolved: 121, sla: "92.7%", rating: 4.5 },
];

type Escalation = { id: string; label: string; count: number; icon: LucideIcon; tone: "danger" | "warning" | "violet" };

const escalations: Escalation[] = [
  { id: "esc-1", label: "Escalaciones Abiertas", count: 18, icon: AlertTriangle, tone: "danger" },
  { id: "esc-2", label: "En Espera de Cliente", count: 27, icon: Clock, tone: "warning" },
  { id: "esc-3", label: "Escalada a Ingeniería", count: 11, icon: Wrench, tone: "violet" },
];

type ClinicSupport = { name: string; tickets: number; trend: number[] };

const clinicsMexico: ClinicSupport[] = [
  { name: "Clínica San José - CDMX", tickets: 128, trend: [4, 6, 5, 7, 6, 8, 7] },
  { name: "Clínica del Valle - GDL", tickets: 96, trend: [5, 4, 6, 5, 7, 6, 7] },
  { name: "Hospital Central - MTY", tickets: 82, trend: [3, 5, 4, 6, 5, 6, 7] },
  { name: "Clínica Cumbres - PUE", tickets: 61, trend: [4, 5, 4, 5, 6, 5, 6] },
  { name: "Clínica Santa Fe - CDMX", tickets: 54, trend: [3, 4, 5, 4, 5, 5, 6] },
];

const clinicsPeru: ClinicSupport[] = [
  { name: "Clínica Arequipa - Arequipa", tickets: 94, trend: [5, 6, 5, 7, 6, 7, 8] },
  { name: "Clínica San Pablo - Lima", tickets: 81, trend: [4, 5, 6, 5, 6, 7, 7] },
  { name: "Clínica del Norte - Trujillo", tickets: 63, trend: [3, 4, 5, 5, 6, 6, 6] },
  { name: "Clínica Miraflores - Lima", tickets: 49, trend: [4, 4, 5, 4, 5, 6, 5] },
  { name: "Clínica Chiclayo - Chiclayo", tickets: 36, trend: [3, 4, 4, 5, 4, 5, 5] },
];

type ActivityItem = { id: string; title: string; meta: string; time: string; tone: "danger" | "warning" | "accent" | "success" };

const recentActivity: ActivityItem[] = [
  { id: "TK-48217", title: "Problema de inicio de sesión", meta: "Usuario: Dr. Pérez · Clínica San José", time: "Hoy, 10:15 AM", tone: "danger" },
  { id: "TK-48216", title: "Error en generación de reporte", meta: "Usuario: Ana Torres · Clínica del Valle", time: "Hoy, 09:42 AM", tone: "warning" },
  { id: "TK-48215", title: "Duda sobre facturación", meta: "Usuario: Contabilidad · Hospital Central", time: "Hoy, 08:31 AM", tone: "accent" },
  { id: "TK-48214", title: "Integración con laboratorio", meta: "Usuario: Luis Martínez · Clínica Arequipa", time: "Ayer, 05:28 PM", tone: "success" },
  { id: "TK-48213", title: "Actualización de permisos", meta: "Usuario: Mariela López · Clínica Miraflores", time: "Ayer, 03:11 PM", tone: "success" },
];

const SLA_ACTUAL = 94.2;
const SLA_META = 90;

const numberFormatter = new Intl.NumberFormat("es-MX");

const ESCALATION_TONE: Record<Escalation["tone"], string> = {
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  violet: "bg-violet-soft text-violet",
};

const ACTIVITY_DOT: Record<ActivityItem["tone"], string> = {
  danger: "bg-danger",
  warning: "bg-warning",
  accent: "bg-accent",
  success: "bg-success",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={`size-3.5 ${index < rounded ? "fill-warning text-warning" : "fill-line/60 text-line/60"}`}
            strokeWidth={0}
          />
        ))}
      </span>
      <span className="font-mono text-2xs font-bold text-ink">{rating.toFixed(1)}</span>
    </span>
  );
}

function SlaGauge() {
  const cx = 100;
  const cy = 100;
  const r = 82;
  const toPoint = (fraction: number) => {
    const angle = Math.PI * (1 - fraction);
    return [Number((cx + r * Math.cos(angle)).toFixed(2)), Number((cy - r * Math.sin(angle)).toFixed(2))] as const;
  };
  const [startX, startY] = toPoint(0);
  const [endX, endY] = toPoint(1);
  const [valueX, valueY] = toPoint(SLA_ACTUAL / 100);
  const [metaX, metaY] = toPoint(SLA_META / 100);

  return (
    <article className="flex flex-col rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="sla-gauge-title">
      <h2 className="text-center text-xs font-extrabold" id="sla-gauge-title">Cumplimiento de SLA</h2>
      <div className="relative mx-auto mt-2 w-full max-w-[16rem]">
        <svg viewBox="0 0 200 118" className="w-full" role="img" aria-label={`Cumplimiento de SLA ${SLA_ACTUAL}%, meta ${SLA_META}%`}>
          <path d={`M${startX} ${startY} A${r} ${r} 0 0 1 ${endX} ${endY}`} fill="none" stroke="var(--surface-subtle)" strokeWidth="16" strokeLinecap="round" />
          <path d={`M${startX} ${startY} A${r} ${r} 0 0 1 ${valueX} ${valueY}`} fill="none" stroke="var(--success)" strokeWidth="16" strokeLinecap="round" />
          <circle cx={metaX} cy={metaY} r="3.5" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        </svg>
        <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
          <span className="font-mono text-3xl font-bold leading-none tracking-[-0.05em] text-success">{SLA_ACTUAL}%</span>
          <span className="mt-1 text-2xs font-bold text-muted">Meta: {SLA_META}%</span>
        </div>
      </div>
      <div className="mt-1 flex items-center justify-between text-2xs font-semibold text-muted">
        <span>0%</span>
        <span>100%</span>
      </div>
    </article>
  );
}

function IncidentCategoriesCard() {
  return (
    <article className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="incident-categories-title">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xs font-extrabold" id="incident-categories-title">Top Categorías de Incidentes</h2>
        <span className="text-2xs font-bold text-muted">Tickets</span>
      </div>
      <ul className="mt-3 divide-y divide-line">
        {incidentCategories.map((category) => (
          <li className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-3 py-2.5" key={category.rank}>
            <span className="grid size-6 place-items-center rounded-md bg-accent-soft font-mono text-2xs font-extrabold text-accent" aria-hidden="true">{category.rank}</span>
            <span className="truncate text-xs font-semibold text-ink">{category.label}</span>
            <span className="font-mono text-xs font-bold text-ink">{category.tickets}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function TeamPerformanceCard() {
  return (
    <article className="min-w-0 rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="team-performance-title">
      <h2 className="text-sm font-extrabold" id="team-performance-title">Rendimiento del Equipo de Soporte</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-lg border-collapse text-left">
          <caption className="sr-only">Rendimiento por agente de soporte</caption>
          <thead>
            <tr className="border-b border-line text-2xs font-bold text-muted">
              <th className="py-2 pr-3 font-bold" scope="col">Agente</th>
              <th className="px-3 py-2 font-bold" scope="col">Tickets Resueltos</th>
              <th className="px-3 py-2 font-bold" scope="col">SLA Cumplido</th>
              <th className="px-3 py-2 font-bold" scope="col">Calificación Promedio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {agents.map((agent) => (
              <tr className="text-xs transition-colors hover:bg-accent-soft/35" key={agent.name}>
                <th className="py-2.5 pr-3" scope="row">
                  <span className="flex items-center gap-2">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-2xs font-extrabold text-accent" aria-hidden="true">{getInitials(agent.name)}</span>
                    <span className="whitespace-nowrap font-bold text-ink">{agent.name}</span>
                  </span>
                </th>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-muted">{agent.resolved}</td>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-muted">{agent.sla}</td>
                <td className="whitespace-nowrap px-3 py-2.5"><StarRating rating={agent.rating} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function EscalationsCard() {
  return (
    <article className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="escalations-title">
      <h2 className="text-sm font-extrabold" id="escalations-title">Escalaciones</h2>
      <ul className="mt-3 grid gap-3">
        {escalations.map((escalation) => {
          const Icon = escalation.icon;
          return (
            <li key={escalation.id}>
              <button
                className="flex w-full items-center gap-3 rounded-xl border border-line px-3 py-3 text-left transition-colors hover:border-accent/60 disabled:cursor-not-allowed"
                type="button"
                disabled
                title="Disponible al conectar la gestión de escalaciones"
              >
                <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${ESCALATION_TONE[escalation.tone]}`} aria-hidden="true"><Icon className="size-4" strokeWidth={1.8} /></span>
                <span className="min-w-0 flex-1 truncate text-xs font-bold text-ink">{escalation.label}</span>
                <span className="font-mono text-lg font-bold tracking-[-0.05em] text-ink">{escalation.count}</span>
                <span className="text-muted" aria-hidden="true">›</span>
              </button>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

function ClinicSupportCard({ title, countryCode, clinics }: { title: string; countryCode: CountryCode; clinics: ClinicSupport[] }) {
  const titleId = `clinic-support-${countryCode}`;
  return (
    <article className="min-w-0 rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby={titleId}>
      <h2 className="flex items-center gap-2 text-sm font-extrabold" id={titleId}><CountryFlag countryCode={countryCode} />{title}</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-xs border-collapse text-left">
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr className="border-b border-line text-2xs font-bold text-muted">
              <th className="py-2 pr-3 font-bold" scope="col">Clínica</th>
              <th className="px-3 py-2 font-bold" scope="col">Tickets</th>
              <th className="py-2 pl-3 text-right font-bold" scope="col">Tendencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {clinics.map((clinic) => (
              <tr className="text-xs" key={clinic.name}>
                <th className="whitespace-nowrap py-2.5 pr-3 font-semibold text-ink" scope="row">{clinic.name}</th>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-muted">{clinic.tickets}</td>
                <td className="py-2.5 pl-3"><Sparkline values={clinic.trend} tone="accent" className="ml-auto h-6 w-20" ariaLabel={`Tendencia de ${clinic.name}`} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function RecentActivityCard() {
  return (
    <article className="min-w-0 rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="recent-activity-title">
      <h2 className="text-sm font-extrabold" id="recent-activity-title">Actividad Reciente de Soporte</h2>
      <ol className="mt-3 divide-y divide-line">
        {recentActivity.map((item) => (
          <li className="grid grid-cols-[auto_1fr_auto] items-start gap-2.5 py-2.5" key={item.id}>
            <span className={`mt-1.5 size-2 shrink-0 rounded-full ${ACTIVITY_DOT[item.tone]}`} aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-ink"><span className="font-mono text-accent">#{item.id}</span> {item.title}</p>
              <p className="mt-0.5 truncate text-2xs text-muted">{item.meta}</p>
            </div>
            <time className="whitespace-nowrap text-2xs text-muted">{item.time}</time>
          </li>
        ))}
      </ol>
    </article>
  );
}

export default function SupportPage() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
        <div>
          <h1 className="text-[clamp(1.3rem,1.8vw,1.6rem)] font-extrabold tracking-[-0.03em]">Soporte</h1>
          <p className="mt-0.5 text-xs text-muted">Gestiona tickets, SLA, escalaciones y rendimiento del soporte en la plataforma para México y Perú.</p>
        </div>
        <button className="flex min-h-9 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-xs font-bold text-white transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled title="Disponible al conectar la gestión de tickets">
          <Plus className="size-3.5" strokeWidth={2.4} aria-hidden="true" />Nuevo Ticket Interno
        </button>
      </div>

      <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5" aria-label="Indicadores de soporte">
        {stats.map((item, index) => (
          <div className={index === stats.length - 1 ? "col-span-2 md:col-span-1" : ""} key={item.label}>
            <StatCard {...item} index={index} />
          </div>
        ))}
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-3" aria-label="Prioridad, SLA y categorías">
        <DonutChart
          title="Tickets por Prioridad"
          centerValue={numberFormatter.format(1458)}
          centerLabel="Total"
          segments={priorityByLevel}
          action={
            <button className="grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-surface-subtle disabled:cursor-not-allowed" type="button" disabled title="Disponible al conectar las opciones del gráfico" aria-label="Más opciones">
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </button>
          }
        />
        <SlaGauge />
        <IncidentCategoriesCard />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" aria-label="Rendimiento y escalaciones">
        <TeamPerformanceCard />
        <EscalationsCard />
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-3" aria-label="Soporte por clínica y actividad">
        <ClinicSupportCard title="Clínicas con Más Soporte - México" countryCode="MX" clinics={clinicsMexico} />
        <ClinicSupportCard title="Clínicas con Más Soporte - Perú" countryCode="PE" clinics={clinicsPeru} />
        <RecentActivityCard />
      </section>

      <footer className="mt-4 flex items-center gap-1.5 border-t border-line py-4 text-2xs text-muted">
        <Info className="size-3" aria-hidden="true" />Los datos se actualizan cada 10 minutos. Última actualización: Hoy, 10:30 AM
      </footer>
    </div>
  );
}

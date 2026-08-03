import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowUpRight,
  Building2,
  ChevronDown,
  Calendar,
  DollarSign,
  Download,
  Info,
  RefreshCw,
  ShieldAlert,
  Users,
} from "lucide-react";
import { DonutChart } from "@/shared/ui/donut-chart";
import { Sparkline, type SparklineTone } from "@/shared/ui/sparkline";
import { StatCard, type StatCardProps } from "@/shared/ui/stat-card";

export const metadata: Metadata = {
  title: "Reportes",
};

const stats: Array<StatCardProps> = [
  { label: "Ingresos Totales", value: "USD $3,627,540", change: "+14.6% vs. mes anterior", direction: "up", icon: DollarSign, tone: "success" },
  { label: "Usuarios Activos", value: "8,642", change: "+8.7% vs. mes anterior", direction: "up", icon: Users, tone: "violet" },
  { label: "Clínicas Activas", value: "128", change: "+12.0% vs. mes anterior", direction: "up", icon: Building2, tone: "accent" },
  { label: "Alertas epidemiológicas", value: "18 activas", change: "6.2% bajo monitoreo IA", direction: "up", icon: ShieldAlert, tone: "warning" },
  { label: "Tasa de Retención (12m)", value: "92.8%", change: "+3.6% vs. mes anterior", direction: "up", icon: RefreshCw, tone: "success" },
];

// [mes, México (M USD), Perú (M USD)] — apilado; el total es la suma
const monthlyRevenue = [
  ["Jun'23", 1.30, 0.72],
  ["Jul'23", 1.42, 0.80],
  ["Ago'23", 1.55, 0.86],
  ["Sep'23", 1.63, 0.93],
  ["Oct'23", 1.72, 0.99],
  ["Nov'23", 1.80, 1.05],
  ["Dic'23", 1.90, 1.10],
  ["Ene'24", 1.98, 1.15],
  ["Feb'24", 2.05, 1.20],
  ["Mar'24", 2.13, 1.26],
  ["Abr'24", 2.19, 1.31],
  ["May'24", 2.25, 1.37],
] as const;

const patientsGrowth = {
  labels: ["Jun'23", "Ago'23", "Nov'23", "Feb'24", "Abr'24", "May'24"],
  series: [
    { label: "México", color: "var(--accent)", values: [2.85, 3.20, 3.62, 4.05, 4.55, 4.982] },
    { label: "Perú", color: "var(--focus)", values: [1.95, 2.30, 2.68, 3.05, 3.42, 3.660] },
    { label: "Total", color: "var(--success)", values: [4.80, 5.50, 6.30, 7.10, 7.97, 8.642] },
  ],
};

const retention = {
  labels: ["Mes 0", "Mes 1", "Mes 2", "Mes 3", "Mes 4", "Mes 5", "Mes 6", "Mes 7", "Mes 8", "Mes 9", "Mes 10", "Mes 11", "Mes 12"],
  series: [
    { label: "Total", color: "var(--success)", end: "62.4%", values: [100, 88, 80, 74, 70, 67, 65, 64, 63.4, 63, 62.7, 62.5, 62.4] },
    { label: "México", color: "var(--accent)", end: "60.8%", values: [100, 86, 77, 71, 67, 64, 62.5, 61.8, 61.4, 61.1, 60.9, 60.85, 60.8] },
    { label: "Perú", color: "var(--focus)", end: "52.1%", values: [100, 82, 71, 64, 59, 56, 54.5, 53.5, 53, 52.6, 52.3, 52.2, 52.1] },
  ],
};

const clinicsByCountry = [
  { label: "México", value: "72", percentage: 56, color: "var(--accent)" },
  { label: "Perú", value: "56", percentage: 44, color: "var(--focus)" },
];

const revenueByPlan = [
  { label: "Básico", value: "47%", percentage: 47, color: "var(--plan-basic)" },
  { label: "Profesional", value: "34%", percentage: 34, color: "var(--plan-professional)" },
  { label: "Enterprise", value: "19%", percentage: 19, color: "var(--plan-enterprise)" },
];

type ExecutiveTrend = { label: string; value: string; change: string; icon: LucideIcon; tone: SparklineTone; points: number[] };

const executiveTrends: ExecutiveTrend[] = [
  { label: "Ingresos Totales", value: "USD $3.63M", change: "+14.6%", icon: DollarSign, tone: "accent", points: [42, 45, 44, 48, 52, 56, 60, 64] },
  { label: "Usuarios Activos", value: "8,642", change: "+8.7%", icon: Users, tone: "accent", points: [30, 34, 38, 40, 46, 50, 55, 60] },
  { label: "Clínicas Activas", value: "128", change: "+12.0%", icon: Building2, tone: "accent", points: [20, 22, 21, 26, 30, 33, 38, 42] },
  { label: "Casos en vigilancia IA", value: "1,284", change: "+5.1%", icon: Activity, tone: "accent", points: [48, 40, 44, 38, 42, 36, 40, 34] },
  { label: "Tasa de Retención (12m)", value: "92.8%", change: "+3.6%", icon: RefreshCw, tone: "accent", points: [24, 26, 25, 28, 27, 30, 32, 34] },
];

const numberFormatter = new Intl.NumberFormat("es-MX");

/** Convierte una serie a coordenadas dentro del área útil del viewBox. */
function toPoints(values: readonly number[], yMax: number, width: number, height: number, padX: number, padTop: number, padBottom: number) {
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;
  const step = values.length > 1 ? innerW / (values.length - 1) : 0;
  return values.map((value, index) => {
    const x = padX + index * step;
    const y = padTop + innerH - (value / yMax) * innerH;
    return [Number(x.toFixed(2)), Number(y.toFixed(2))] as const;
  });
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-2xs font-semibold text-muted">
      <span className="size-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
      {label}
    </span>
  );
}

function RevenueBarChart() {
  const width = 340;
  const height = 180;
  const padX = 10;
  const padTop = 8;
  const padBottom = 22;
  const yMax = 5;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;
  const slot = innerW / monthlyRevenue.length;
  const barW = slot * 0.5;
  const baseline = padTop + innerH;

  const totalPoints = monthlyRevenue.map(([, mx, pe], index) => {
    const x = padX + slot * index + slot / 2;
    const y = baseline - ((mx + pe) / yMax) * innerH;
    return [Number(x.toFixed(2)), Number(y.toFixed(2))] as const;
  });

  return (
    <article className="min-w-0 rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="revenue-bar-title">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-extrabold" id="revenue-bar-title">Ingresos mensuales (USD)<Info className="size-3 text-muted" aria-hidden="true" /></h2>
          <div className="mt-2 flex flex-wrap gap-3">
            <LegendDot color="var(--accent)" label="México" />
            <LegendDot color="var(--focus)" label="Perú" />
            <LegendDot color="var(--success)" label="Total" />
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xs font-semibold text-muted">Total May 2024</p>
          <p className="mt-0.5 font-mono text-base font-bold tracking-tighter text-ink">USD $3,627,540</p>
        </div>
      </header>

      <figure className="mt-3">
        <svg className="h-auto w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Gráfico de barras apiladas de ingresos mensuales de México y Perú, en crecimiento sostenido de junio 2023 a mayo 2024.">
          {[0, 1, 2, 3, 4, 5].map((tick) => {
            const y = baseline - (tick / yMax) * innerH;
            return (
              <g key={tick}>
                <line x1={padX} x2={width - padX} y1={y} y2={y} stroke="var(--line)" strokeDasharray="3 5" />
                <text x={0} y={y + 3} fill="var(--muted)" fontSize="8">{tick === 0 ? "0" : `${tick}M`}</text>
              </g>
            );
          })}
          {monthlyRevenue.map(([month, mx, pe], index) => {
            const x = padX + slot * index + (slot - barW) / 2;
            const mxH = (mx / yMax) * innerH;
            const peH = (pe / yMax) * innerH;
            return (
              <g key={month}>
                <rect x={x} y={baseline - mxH} width={barW} height={mxH} fill="var(--accent)" rx="1.5" />
                <rect x={x} y={baseline - mxH - peH} width={barW} height={peH} fill="var(--focus)" rx="1.5" />
                <text x={x + barW / 2} y={height - 8} fill="var(--muted)" fontSize="7" textAnchor="middle">{month}</text>
              </g>
            );
          })}
          <polyline points={totalPoints.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {totalPoints.map(([x, y], index) => <circle key={index} cx={x} cy={y} r="2" fill="var(--surface)" stroke="var(--success)" strokeWidth="1.5" />)}
        </svg>
      </figure>

      <dl className="mt-2 grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
        <div><dt className="text-2xs text-muted">México</dt><dd className="mt-0.5 font-mono text-2xs font-bold text-ink">USD $2,254,320</dd></div>
        <div><dt className="text-2xs text-muted">Perú</dt><dd className="mt-0.5 font-mono text-2xs font-bold text-ink">USD $1,373,220</dd></div>
        <div><dt className="text-2xs text-muted">Total</dt><dd className="mt-0.5 font-mono text-2xs font-bold text-ink">USD $3,627,540</dd></div>
      </dl>
    </article>
  );
}

function PatientsGrowthChart() {
  const width = 340;
  const height = 180;
  const padX = 12;
  const padTop = 10;
  const padBottom = 22;
  const yMax = 10;
  const baseline = padTop + (height - padTop - padBottom);

  return (
    <article className="min-w-0 rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="patients-growth-title">
      <header className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-1.5 text-sm font-extrabold" id="patients-growth-title">Crecimiento de pacientes activos<Info className="size-3 text-muted" aria-hidden="true" /></h2>
        <div className="flex flex-wrap justify-end gap-3">
          {patientsGrowth.series.map((serie) => <LegendDot key={serie.label} color={serie.color} label={serie.label} />)}
        </div>
      </header>

      <figure className="mt-3">
        <svg className="h-auto w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Gráfico de líneas de crecimiento de pacientes activos por país; el total alcanza 8,642 en mayo 2024.">
          {[0, 2, 4, 6, 8, 10].map((tick) => {
            const y = baseline - (tick / yMax) * (height - padTop - padBottom);
            return (
              <g key={tick}>
                <line x1={padX} x2={width - padX} y1={y} y2={y} stroke="var(--line)" strokeDasharray="3 5" />
                <text x={0} y={y + 3} fill="var(--muted)" fontSize="8">{tick === 0 ? "0" : `${tick}K`}</text>
              </g>
            );
          })}
          {patientsGrowth.series.map((serie) => {
            const points = toPoints(serie.values, yMax, width, height, padX, padTop, padBottom);
            return (
              <g key={serie.label}>
                <polyline points={points.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke={serie.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                {points.map(([x, y], index) => <circle key={index} cx={x} cy={y} r="2" fill="var(--surface)" stroke={serie.color} strokeWidth="1.5" />)}
              </g>
            );
          })}
          {patientsGrowth.labels.map((label, index) => {
            const x = padX + (index / (patientsGrowth.labels.length - 1)) * (width - padX * 2);
            return <text key={label} x={x} y={height - 8} fill="var(--muted)" fontSize="7" textAnchor="middle">{label}</text>;
          })}
        </svg>
      </figure>

      <dl className="mt-2 grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
        <div><dt className="text-2xs text-muted">México</dt><dd className="mt-0.5 font-mono text-2xs font-bold text-ink">4,982</dd></div>
        <div><dt className="text-2xs text-muted">Perú</dt><dd className="mt-0.5 font-mono text-2xs font-bold text-ink">3,660</dd></div>
        <div><dt className="text-2xs text-muted">Total</dt><dd className="mt-0.5 font-mono text-2xs font-bold text-ink">8,642</dd></div>
      </dl>
    </article>
  );
}

function RetentionChart() {
  const width = 640;
  const height = 240;
  const padX = 34;
  const padTop = 12;
  const padBottom = 26;
  const yMax = 100;
  const innerH = height - padTop - padBottom;
  const baseline = padTop + innerH;

  return (
    <article className="min-w-0 rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="retention-title">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-extrabold" id="retention-title">Retención clínica y continuidad de uso<Info className="size-3 text-muted" aria-hidden="true" /></h2>
        <div className="flex flex-wrap items-center gap-3">
          {retention.series.map((serie) => <LegendDot key={serie.label} color={serie.color} label={serie.label} />)}
          <span className="text-2xs font-bold text-muted">Retención Mes 12</span>
        </div>
      </header>

      <div className="mt-3">
        <button className="flex min-h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-2xs font-bold text-ink transition-colors hover:border-accent/60 focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-70" type="button" disabled title="Disponible al conectar los reportes de cohortes">
          Cohorte de registro<ChevronDown className="size-3 text-muted" aria-hidden="true" />
        </button>
      </div>

      <figure className="mt-3 overflow-x-auto pb-1">
        <svg className="h-auto w-full min-w-lg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Curvas de retención por país que descienden y se estabilizan hacia el mes 12: Total 62.4%, México 60.8% y Perú 52.1%.">
          {[0, 25, 50, 75, 100].map((tick) => {
            const y = baseline - (tick / yMax) * innerH;
            return (
              <g key={tick}>
                <line x1={padX} x2={width - padX} y1={y} y2={y} stroke="var(--line)" strokeDasharray="3 5" />
                <text x={4} y={y + 3} fill="var(--muted)" fontSize="9">{tick}%</text>
              </g>
            );
          })}
          {retention.series.map((serie) => {
            const points = toPoints(serie.values, yMax, width, height, padX, padTop, padBottom);
            const [lastX, lastY] = points[points.length - 1];
            return (
              <g key={serie.label}>
                <polyline points={points.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke={serie.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                {points.map(([x, y], index) => <circle key={index} cx={x} cy={y} r="2.2" fill="var(--surface)" stroke={serie.color} strokeWidth="1.5" />)}
                <text x={lastX + 6} y={lastY + 3} fill={serie.color} fontSize="11" fontWeight="700">{serie.end}</text>
              </g>
            );
          })}
          {retention.labels.map((label, index) => {
            const x = padX + (index / (retention.labels.length - 1)) * (width - padX * 2);
            return <text key={label} x={x} y={height - 8} fill="var(--muted)" fontSize="8" textAnchor="middle">{label}</text>;
          })}
        </svg>
      </figure>

      <p className="mt-2 flex items-start gap-2 rounded-lg bg-accent-soft/60 px-3 py-2 text-2xs leading-4 text-ink-secondary">
        <Info className="mt-0.5 size-3 shrink-0 text-accent" aria-hidden="true" />
        La retención se calcula sobre usuarios activos que continúan activos cada mes desde su registro.
      </p>
    </article>
  );
}

function ExecutiveTrendsCard() {
  return (
    <article className="min-w-0 rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="executive-trends-title">
      <h2 className="flex items-center gap-1.5 text-sm font-extrabold" id="executive-trends-title">Tendencias ejecutivas e inteligencia clínica<Info className="size-3 text-muted" aria-hidden="true" /></h2>
      <ul className="mt-3 divide-y divide-line">
        {executiveTrends.map((trend) => {
          const Icon = trend.icon;
          return (
            <li className="grid grid-cols-[1.75rem_1fr_auto_5rem] items-center gap-3 py-2.5" key={trend.label}>
              <span className="grid size-7 place-items-center rounded-md bg-accent-soft text-accent" aria-hidden="true"><Icon className="size-3.5" strokeWidth={1.8} /></span>
              <div className="min-w-0">
                <p className="truncate text-2xs font-bold text-muted">{trend.label}</p>
                <p className="mt-0.5 font-mono text-xs font-bold text-ink">{trend.value}</p>
              </div>
              <span className="inline-flex items-center gap-0.5 text-2xs font-bold text-success"><ArrowUpRight className="size-3" aria-hidden="true" />{trend.change}</span>
              <Sparkline values={trend.points} tone={trend.tone} className="h-7 w-full" ariaLabel={`Tendencia de ${trend.label}`} />
            </li>
          );
        })}
      </ul>
      <button className="mt-2 flex min-h-8 w-full items-center justify-center gap-1 rounded-lg text-2xs font-bold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled title="Disponible al conectar el detalle de métricas">Ver más métricas en detalle ›</button>
    </article>
  );
}

export default function ReportsPage() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
        <div>
          <h1 className="text-[clamp(1.3rem,1.8vw,1.6rem)] font-extrabold tracking-[-0.03em]">Reportes</h1>
          <p className="mt-0.5 text-xs text-muted">Dashboard ejecutivo con negocio, adopción clínica y reporte epidemiológico global por país.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex min-h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-xs font-bold text-ink transition-colors hover:border-accent/60 focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-70" type="button" disabled title="Disponible al conectar el rango de fechas">
            <Calendar className="size-3.5 text-muted" strokeWidth={1.8} aria-hidden="true" />1 May 2024 - 31 May 2024<ChevronDown className="size-3 text-muted" aria-hidden="true" />
          </button>
          <button className="flex min-h-9 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-xs font-bold text-white transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled title="Disponible al conectar la exportación de reportes">
            <Download className="size-3.5" strokeWidth={2} aria-hidden="true" />Exportar reporte global
          </button>
        </div>
      </div>

      <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5" aria-label="Indicadores ejecutivos">
        {stats.map((item, index) => (
          <div className={index === stats.length - 1 ? "col-span-2 md:col-span-1" : ""} key={item.label}>
            <StatCard {...item} index={index} />
          </div>
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-2 min-[1600px]:grid-cols-4" aria-label="Negocio y adopción">
        <RevenueBarChart />
        <PatientsGrowthChart />
        <DonutChart title="Clínicas activas por país" centerValue={numberFormatter.format(128)} centerLabel="Total" segments={clinicsByCountry} />
        <DonutChart title="Distribución de ingresos por plan" centerValue="USD 3.63M" centerLabel="Total" segments={revenueByPlan} />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]" aria-label="Retención y tendencias">
        <RetentionChart />
        <ExecutiveTrendsCard />
      </section>

      <footer className="mt-4 flex items-center gap-1.5 border-t border-line py-4 text-2xs text-muted">
        <Info className="size-3" aria-hidden="true" />Los datos se actualizan cada 10 minutos. Última actualización: Hoy, 10:30 AM
      </footer>
    </div>
  );
}

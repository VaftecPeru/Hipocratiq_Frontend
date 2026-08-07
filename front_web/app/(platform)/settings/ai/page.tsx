import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BriefcaseMedical,
  ChartNoAxesColumn,
  Clock,
  Database,
  FileText,
  FlaskConical,
  Globe,
  Pill,
  Sparkles,
  Stethoscope,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { CountryFlag, type CountryCode } from "@/shared/ui/country-flag";
import {
  SettingsCard,
  SettingsCardList,
  SettingsPageHeader,
  SettingsSelect,
  type SettingsStat,
  SettingsStatCard,
  SettingsStatGrid,
  SettingsTableHead,
  SettingsTableWrap,
  SettingsToggle,
} from "@/features/platform/ui/settings-primitives";
import {
  AiFooterLink,
  DataSourceButton,
  ExpandMapButton,
  ModelToggleButton,
  PredictionDetailButton,
  RiskByRegionButton,
  SaveAiButton,
} from "@/features/platform/ui/settings-ai-modals";

export const metadata: Metadata = {
  title: "IA Epidemiológica",
};

const stats: SettingsStat[] = [
  { label: "Alertas activas", value: "24", hint: "+12 vs. ayer", hintTone: "success", icon: TriangleAlert, tone: "danger" },
  { label: "Modelos activos", value: "6", hint: "Todos operando", hintTone: "success", icon: Sparkles, tone: "violet" },
  { label: "Regiones en seguimiento", value: "18", hint: "MX: 10 · PE: 8", hintTone: "muted", icon: Globe, tone: "accent" },
  { label: "Precisión del modelo", value: "92%", hint: "+3% vs. semana pasada", hintTone: "success", icon: TrendingUp, tone: "success" },
];

type RiskLevel = "Alto" | "Medio" | "Bajo";

const RISK_BADGE: Record<RiskLevel, string> = {
  Alto: "bg-danger-soft text-danger",
  Medio: "bg-warning-soft text-warning",
  Bajo: "bg-success-soft text-success",
};

const RISK_FILL: Record<RiskLevel, string> = {
  Alto: "var(--danger)",
  Medio: "var(--warning)",
  Bajo: "var(--success)",
};

type RiskMap = {
  countryCode: CountryCode;
  name: string;
  landPath: string;
  hotZonePath: string;
  warmZonePath: string;
  markers: Array<{ cx: number; cy: number; level: RiskLevel }>;
};

const riskMaps: RiskMap[] = [
  {
    countryCode: "MX",
    name: "México",
    landPath: "M14 40 L34 24 L58 20 L82 28 L104 22 L124 34 L134 52 L124 74 L104 86 L82 80 L62 92 L42 82 L28 66 Z",
    hotZonePath: "M46 44 L74 38 L88 52 L80 72 L54 76 L40 62 Z",
    warmZonePath: "M84 30 L112 34 L122 50 L108 62 L88 56 Z",
    markers: [
      { cx: 62, cy: 52, level: "Medio" },
      { cx: 78, cy: 66, level: "Alto" },
      { cx: 92, cy: 70, level: "Alto" },
      { cx: 108, cy: 40, level: "Bajo" },
      { cx: 36, cy: 34, level: "Bajo" },
    ],
  },
  {
    countryCode: "PE",
    name: "Perú",
    landPath: "M52 16 L78 24 L92 44 L84 64 L92 82 L74 96 L54 90 L44 70 L32 52 L38 30 Z",
    hotZonePath: "M44 46 L64 42 L72 60 L58 74 L42 66 Z",
    warmZonePath: "M60 22 L82 30 L86 46 L68 50 L56 38 Z",
    markers: [
      { cx: 62, cy: 40, level: "Medio" },
      { cx: 56, cy: 58, level: "Alto" },
      { cx: 76, cy: 34, level: "Bajo" },
      { cx: 72, cy: 74, level: "Bajo" },
    ],
  },
];

type EngineModel = { label: string; icon: LucideIcon };

const engineModels: EngineModel[] = [
  { label: "Respiratorio", icon: Stethoscope },
  { label: "Dengue", icon: Sparkles },
  { label: "Gastrointestinal", icon: BriefcaseMedical },
  { label: "Ocupación hospitalaria", icon: ChartNoAxesColumn },
];

type DataSource = { label: string; icon: LucideIcon; status: "Conectado" | "Parcial" };

const dataSources: DataSource[] = [
  { label: "HIS / EHR", icon: Database, status: "Conectado" },
  { label: "Laboratorio", icon: FlaskConical, status: "Conectado" },
  { label: "Farmacia", icon: Pill, status: "Conectado" },
  { label: "Emergencias", icon: Activity, status: "Conectado" },
  { label: "Reportes manuales", icon: FileText, status: "Parcial" },
];

type Prediction = {
  id: string;
  countryCode: CountryCode;
  region: string;
  event: string;
  icon: LucideIcon;
  risk: RiskLevel;
  date: string;
  state: "Activa" | "En observación";
};

const predictions: Prediction[] = [
  { id: "pr-1", countryCode: "MX", region: "CDMX", event: "Enfermedades respiratorias", icon: Stethoscope, risk: "Alto", date: "24/05/2024 09:15 AM", state: "Activa" },
  { id: "pr-2", countryCode: "MX", region: "Guadalajara", event: "Dengue", icon: Sparkles, risk: "Medio", date: "24/05/2024 08:40 AM", state: "Activa" },
  { id: "pr-3", countryCode: "PE", region: "Lima", event: "Gastrointestinal", icon: BriefcaseMedical, risk: "Medio", date: "24/05/2024 08:20 AM", state: "Activa" },
  { id: "pr-4", countryCode: "PE", region: "Arequipa", event: "Enfermedades respiratorias", icon: Stethoscope, risk: "Medio", date: "24/05/2024 07:50 AM", state: "En observación" },
  { id: "pr-5", countryCode: "PE", region: "Trujillo", event: "Dengue", icon: Sparkles, risk: "Bajo", date: "24/05/2024 07:30 AM", state: "En observación" },
];

type Coverage = { countryCode: CountryCode; name: string; regions: string; updated: string };

const coverage: Coverage[] = [
  { countryCode: "MX", name: "México", regions: "10 regiones monitoreadas", updated: "Hoy 10:30 AM" },
  { countryCode: "PE", name: "Perú", regions: "8 regiones monitoreadas", updated: "Hoy 10:30 AM" },
];

function RiskBadge({ risk }: { risk: RiskLevel }) {
  return <span className={`inline-flex rounded px-2 py-0.5 text-2xs font-extrabold ${RISK_BADGE[risk]}`}>{risk}</span>;
}

function StateBadge({ state }: { state: Prediction["state"] }) {
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-2xs font-extrabold ${state === "Activa" ? "bg-success-soft text-success" : "border border-line bg-surface-subtle text-muted"}`}>
      {state}
    </span>
  );
}

function RiskMapPanel({ map }: { map: RiskMap }) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-2xs font-extrabold text-ink">
        <CountryFlag countryCode={map.countryCode} />
        {map.name}
      </p>
      <svg
        className="mt-2 h-auto w-full rounded-lg border border-line bg-surface-subtle"
        viewBox="0 0 148 112"
        role="img"
        aria-label={`Mapa de riesgo epidemiológico de ${map.name}`}
      >
        <path d={map.landPath} fill="var(--success-soft)" stroke="var(--line)" strokeWidth="1.5" strokeLinejoin="round" />
        <path d={map.warmZonePath} fill="var(--warning-soft)" opacity="0.9" />
        <path d={map.hotZonePath} fill="var(--danger-soft)" opacity="0.9" />
        {map.markers.map((marker, index) => (
          <g key={index}>
            <circle cx={marker.cx} cy={marker.cy} r="6" fill={RISK_FILL[marker.level]} opacity="0.22" />
            <circle cx={marker.cx} cy={marker.cy} r="3" fill={RISK_FILL[marker.level]} stroke="var(--surface)" strokeWidth="1.2" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function MapCard() {
  return (
    <SettingsCard
      title="Mapa Epidemiológico"
      titleId="map-title"
      action={
        <div className="flex items-center gap-2">
          <RiskByRegionButton />
          <ExpandMapButton>
            {riskMaps.map((map) => <RiskMapPanel key={map.countryCode} map={map} />)}
          </ExpandMapButton>
        </div>
      }
    >
      <div className="mt-3 grid gap-3 min-[26rem]:grid-cols-2">
        {riskMaps.map((map) => <RiskMapPanel key={map.countryCode} map={map} />)}
      </div>

      <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3">
        {(["Bajo", "Medio", "Alto"] as RiskLevel[]).map((level) => (
          <li className="flex items-center gap-1.5 text-2xs font-bold text-muted" key={level}>
            <span className="size-2 rounded-full" style={{ backgroundColor: RISK_FILL[level] }} aria-hidden="true" />
            Riesgo {level.toLowerCase()}
          </li>
        ))}
      </ul>
    </SettingsCard>
  );
}

function EngineCard() {
  return (
    <SettingsCard title="Configuración del Motor IA" titleId="engine-title">
      <div className="mt-3 grid gap-3 min-[26rem]:grid-cols-2">
        <SettingsSelect id="engine-frequency" label="Frecuencia de análisis" value="Diaria" options={["Diaria", "Semanal", "Cada 12 horas"]} />
        <SettingsSelect id="engine-window" label="Ventana predictiva" value="30 días" options={["30 días", "14 días", "60 días"]} />
        <SettingsSelect id="engine-sensitivity" label="Sensibilidad" value="Media" options={["Media", "Alta", "Baja"]} />
        <div className="grid gap-1.5">
          <span className="text-2xs font-bold text-muted">Alertas automáticas</span>
          <div className="flex h-9 items-center">
            <SettingsToggle label="Activar alertas automáticas" checked />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-2xs font-bold text-muted">Modelos habilitados</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {engineModels.map((model) => {
            const Icon = model.icon;

            return (
              <li key={model.label}>
                <ModelToggleButton label={model.label} icon={<Icon className="size-3.5" strokeWidth={1.8} />} />
              </li>
            );
          })}
        </ul>
      </div>
    </SettingsCard>
  );
}

function DataSourcesCard() {
  return (
    <SettingsCard title="Fuentes de Datos" titleId="sources-title">
      <ul className="mt-3 divide-y divide-line">
        {dataSources.map((source) => {
          const Icon = source.icon;

          return (
            <li key={source.label}>
              <DataSourceButton label={source.label} icon={<Icon className="size-3.5" strokeWidth={1.8} />} status={source.status} />
            </li>
          );
        })}
      </ul>
      <AiFooterLink
        label="Ver detalle de conexiones"
        title="Detalle de conexiones"
        description="Fuentes de datos conectadas al motor de IA"
        items={dataSources.map((source) => `${source.label} · ${source.status}`)}
      />
    </SettingsCard>
  );
}

function PredictionsCard() {
  return (
    <SettingsCard title="Predicciones Recientes" titleId="predictions-title">
      <SettingsTableWrap>
        <table className="w-full min-w-2xl border-collapse text-left">
          <caption className="sr-only">Predicciones epidemiológicas recientes por región</caption>
          <SettingsTableHead
            columns={[{ label: "Región" }, { label: "Evento" }, { label: "Riesgo" }, { label: "Fecha" }, { label: "Estado" }, { label: "Detalle", srOnly: true, align: "right" }]}
          />
          <tbody className="divide-y divide-line">
            {predictions.map((prediction) => {
              const Icon = prediction.icon;

              return (
                <tr className="text-xs transition-colors hover:bg-accent-soft/35" key={prediction.id}>
                  <th className="px-3 py-2.5 font-bold text-ink" scope="row">
                    <span className="flex items-center gap-2">
                      <CountryFlag countryCode={prediction.countryCode} />
                      {prediction.region}
                    </span>
                  </th>
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-2 font-bold text-ink">
                      <Icon className="size-3.5 shrink-0 text-accent" strokeWidth={1.8} aria-hidden="true" />
                      {prediction.event}
                    </span>
                  </td>
                  <td className="px-3 py-2.5"><RiskBadge risk={prediction.risk} /></td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-muted">{prediction.date}</td>
                  <td className="px-3 py-2.5"><StateBadge state={prediction.state} /></td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="inline-flex justify-end">
                      <PredictionDetailButton
                        region={prediction.region}
                        event={prediction.event}
                        risk={prediction.risk}
                        date={prediction.date}
                        state={prediction.state}
                      />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SettingsTableWrap>

      <SettingsCardList>
        {predictions.map((prediction) => {
          const Icon = prediction.icon;

          return (
            <li className="rounded-lg border border-line bg-surface-subtle p-3" key={prediction.id}>
              <div className="flex items-start justify-between gap-2">
                <p className="flex min-w-0 items-center gap-2 text-xs font-extrabold text-ink">
                  <CountryFlag countryCode={prediction.countryCode} />
                  <span className="truncate">{prediction.region}</span>
                </p>
                <RiskBadge risk={prediction.risk} />
              </div>
              <p className="mt-2 flex items-center gap-2 text-2xs font-bold text-ink">
                <Icon className="size-3.5 shrink-0 text-accent" strokeWidth={1.8} aria-hidden="true" />
                {prediction.event}
              </p>
              <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line pt-2.5">
                <span className="font-mono text-2xs text-muted">{prediction.date}</span>
                <StateBadge state={prediction.state} />
              </div>
            </li>
          );
        })}
      </SettingsCardList>

      <AiFooterLink
        label="Ver todas las predicciones"
        title="Todas las predicciones"
        description="Predicciones epidemiológicas registradas por el motor de IA"
        items={predictions.map((prediction) => `${prediction.region} · ${prediction.event} · ${prediction.risk}`)}
      />
    </SettingsCard>
  );
}

function CoverageCard() {
  return (
    <SettingsCard title="Resumen de Cobertura" titleId="coverage-title">
      <ul className="mt-3 grid gap-2.5">
        {coverage.map((item) => (
          <li className="rounded-lg border border-line bg-surface-subtle p-3" key={item.countryCode}>
            <div className="flex items-center justify-between gap-2">
              <p className="flex min-w-0 items-center gap-2 text-xs font-extrabold text-ink">
                <CountryFlag countryCode={item.countryCode} className="h-4 w-6 shrink-0 rounded-xs" />
                {item.name}
              </p>
              <span className="shrink-0 rounded-full bg-success-soft px-2 py-0.5 text-2xs font-extrabold text-success">Habilitado</span>
            </div>
            <p className="mt-2 text-2xs text-muted">{item.regions}</p>
            <p className="mt-0.5 text-2xs text-muted">Última actualización: {item.updated}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-2xs font-bold text-muted">
        <Clock className="size-3.5 shrink-0" strokeWidth={1.9} aria-hidden="true" />
        Actualización de modelos: Hoy 10:30 AM
      </p>
    </SettingsCard>
  );
}

export default function EpidemiologicalAiPage() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <SettingsPageHeader
        title="IA Epidemiológica"
        description="Configura la inteligencia epidemiológica y la analítica predictiva de MEDIQ para México y Perú."
        action={<SaveAiButton />}
      />

      <SettingsStatGrid label="Resumen de la IA epidemiológica">
        {stats.map((stat, index) => <SettingsStatCard index={index} key={stat.label} stat={stat} />)}
      </SettingsStatGrid>

      <section className="mt-4 grid gap-3 sm:gap-4 xl:grid-cols-[1.15fr_1fr_0.85fr]" aria-label="Mapa, motor y fuentes de datos">
        <MapCard />
        <EngineCard />
        <DataSourcesCard />
      </section>

      <section className="mt-4 grid gap-3 sm:gap-4 xl:grid-cols-[1fr_22rem]" aria-label="Predicciones y cobertura">
        <PredictionsCard />
        <CoverageCard />
      </section>
    </div>
  );
}

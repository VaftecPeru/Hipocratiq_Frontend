"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  Check,
  Plus,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { CountryFlag, type CountryCode } from "@/shared/ui/country-flag";
import { DataBadge, type BadgeTone } from "@/shared/ui/data-badge";
import { DonutChart } from "@/shared/ui/donut-chart";
import { StatCard, type StatTone } from "@/shared/ui/stat-card";

type Currency = "USD" | "PEN";
type TabId = "resumen" | "suscripciones" | "planes" | "historial";
type PlanName = "Básico" | "Profesional" | "Enterprise";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "resumen", label: "Resumen" },
  { id: "suscripciones", label: "Suscripciones" },
  { id: "planes", label: "Planes" },
  { id: "historial", label: "Historial de Facturación" },
];

const CURRENCIES: Array<{ id: Currency; label: string; flag: CountryCode }> = [
  { id: "USD", label: "USD", flag: "US" },
  { id: "PEN", label: "PEN", flag: "PE" },
];

type Kpi = {
  label: string;
  values: Record<Currency, string>;
  change: string;
  direction: "up" | "down";
  icon: LucideIcon;
  tone: StatTone;
};

const kpis: Kpi[] = [
  { label: "MRR · Ingresos Mensuales", values: { USD: "$48,250", PEN: "S/181,740" }, change: "+14.2% vs. mes anterior", direction: "up", icon: Wallet, tone: "accent" },
  { label: "ARR · Ingresos Anuales", values: { USD: "$579,000", PEN: "S/2,180,880" }, change: "+16.8% vs. año anterior", direction: "up", icon: TrendingUp, tone: "success" },
  { label: "Suscripciones Activas", values: { USD: "342", PEN: "342" }, change: "+18 este mes", direction: "up", icon: Users, tone: "violet" },
  { label: "Tasa de Renovación", values: { USD: "94.2%", PEN: "94.2%" }, change: "+2.1% vs. trimestre", direction: "up", icon: RefreshCw, tone: "warning" },
];

type Plan = {
  id: PlanName;
  description: string;
  price: Record<Currency, string>;
  period: string;
  color: string;
  subscribers: string;
  popular?: boolean;
  features: string[];
};

const plans: Plan[] = [
  {
    id: "Básico",
    description: "Para clínicas pequeñas que inician su digitalización.",
    price: { USD: "$49", PEN: "S/185" },
    period: "mes",
    color: "var(--plan-basic)",
    subscribers: "142 clínicas suscritas",
    features: ["Hasta 5 usuarios", "1,000 pacientes activos", "Historia clínica digital", "Soporte por correo", "Reportes básicos"],
  },
  {
    id: "Profesional",
    description: "Para clínicas en crecimiento que necesitan más alcance.",
    price: { USD: "$149", PEN: "S/560" },
    period: "mes",
    color: "var(--plan-professional)",
    subscribers: "156 clínicas suscritas",
    popular: true,
    features: ["Hasta 25 usuarios", "10,000 pacientes activos", "Telemedicina integrada", "Soporte prioritario 24/7", "Reportes avanzados con IA", "Facturación electrónica"],
  },
  {
    id: "Enterprise",
    description: "Para redes hospitalarias y grupos multi-sede.",
    price: { USD: "$399", PEN: "S/1,500" },
    period: "mes",
    color: "var(--plan-enterprise)",
    subscribers: "44 clínicas suscritas",
    features: ["Usuarios ilimitados", "Pacientes ilimitados", "Gestión multi-sede", "Gerente de cuenta dedicado", "API y personalización", "SLA garantizado 99.9%"],
  },
];

const subscriptionsByCountry = [
  { label: "México", value: "218", percentage: 63.7, color: "var(--accent)" },
  { label: "Perú", value: "124", percentage: 36.3, color: "var(--focus)" },
];

const subscriptionsByPlan = [
  { label: "Profesional", value: "156", percentage: 45.6, color: "var(--plan-professional)" },
  { label: "Básico", value: "142", percentage: 41.5, color: "var(--plan-basic)" },
  { label: "Enterprise", value: "44", percentage: 12.9, color: "var(--plan-enterprise)" },
];

const PLAN_TONE: Record<PlanName, BadgeTone> = {
  Básico: "neutral",
  Profesional: "accent",
  Enterprise: "dark",
};

type Renewal = {
  id: string;
  clinic: string;
  countryCode: CountryCode;
  plan: PlanName;
  amount: Record<Currency, string>;
  date: string;
  auto: boolean;
};

const renewals: Renewal[] = [
  { id: "r-1", clinic: "Clínica Salud Total", countryCode: "MX", plan: "Profesional", amount: { USD: "$149", PEN: "S/560" }, date: "05 Ago 2026", auto: true },
  { id: "r-2", clinic: "Hospital Central", countryCode: "MX", plan: "Enterprise", amount: { USD: "$399", PEN: "S/1,500" }, date: "08 Ago 2026", auto: true },
  { id: "r-3", clinic: "Clínica San Pablo", countryCode: "PE", plan: "Profesional", amount: { USD: "$149", PEN: "S/560" }, date: "12 Ago 2026", auto: false },
  { id: "r-4", clinic: "Clínica Bienestar", countryCode: "MX", plan: "Básico", amount: { USD: "$49", PEN: "S/185" }, date: "15 Ago 2026", auto: true },
  { id: "r-5", clinic: "Clínica Salud Plus", countryCode: "PE", plan: "Básico", amount: { USD: "$49", PEN: "S/185" }, date: "18 Ago 2026", auto: false },
  { id: "r-6", clinic: "Centro Médico Lima", countryCode: "PE", plan: "Profesional", amount: { USD: "$149", PEN: "S/560" }, date: "22 Ago 2026", auto: true },
];

function PlanBadge({ plan }: { plan: PlanName }) {
  return <DataBadge tone={PLAN_TONE[plan]}>{plan}</DataBadge>;
}

function RenewalBadge({ auto }: { auto: boolean }) {
  return (
    <DataBadge tone={auto ? "success" : "warning"} dot>
      {auto ? "Automática" : "Requiere acción"}
    </DataBadge>
  );
}

function PricingCard({ plan, currency }: { plan: Plan; currency: Currency }) {
  return (
    <article
      className={`relative flex flex-col rounded-xl bg-surface p-5 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)] ${
        plan.popular ? "border-2 border-accent" : "border border-line"
      }`}
    >
      {plan.popular ? (
        <span className="absolute -top-2.5 left-5 rounded-full bg-accent px-2.5 py-0.5 text-2xs font-extrabold text-white shadow-sm">
          Más popular
        </span>
      ) : null}

      <div className="flex items-center gap-2">
        <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: plan.color }} aria-hidden="true" />
        <h3 className="text-sm font-extrabold">{plan.id}</h3>
      </div>
      <p className="mt-1 text-2xs leading-4 text-muted">{plan.description}</p>

      <p className="mt-4 flex items-baseline gap-1">
        <span className="font-mono text-[1.75rem] font-bold leading-none tracking-[-0.05em] text-ink">{plan.price[currency]}</span>
        <span className="text-2xs font-semibold text-muted">/{plan.period}</span>
      </p>
      <p className="mt-1.5 text-2xs font-bold text-muted">{plan.subscribers}</p>

      <ul className="mt-4 grid flex-1 gap-2 border-t border-line pt-4">
        {plan.features.map((feature) => (
          <li className="flex items-start gap-2 text-xs" key={feature}>
            <Check className="mt-0.5 size-3.5 shrink-0 text-success" strokeWidth={2.4} aria-hidden="true" />
            <span className="text-ink-secondary">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className="mt-5 flex min-h-9 items-center justify-center rounded-lg border border-line text-xs font-bold text-ink transition-colors hover:border-accent/60 hover:bg-accent-soft hover:text-accent focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        disabled
        title="Disponible al conectar la gestión de planes"
      >
        Editar plan
      </button>
    </article>
  );
}

function RenewalsTable({ currency }: { currency: Currency }) {
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <caption className="sr-only">Próximas renovaciones de suscripción</caption>
          <thead>
            <tr className="border-b border-line bg-surface-subtle/50 text-2xs font-bold text-muted">
              <th className="px-3 py-2.5 font-bold" scope="col">Clínica</th>
              <th className="px-3 py-2.5 font-bold" scope="col">País</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Plan</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Monto</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Renovación</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {renewals.map((renewal) => (
              <tr className="text-xs transition-colors hover:bg-accent-soft/35" key={renewal.id}>
                <th className="whitespace-nowrap px-3 py-2.5 font-bold text-ink" scope="row">{renewal.clinic}</th>
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-2 text-muted"><CountryFlag countryCode={renewal.countryCode} />{renewal.countryCode === "MX" ? "México" : "Perú"}</span>
                </td>
                <td className="px-3 py-2.5"><PlanBadge plan={renewal.plan} /></td>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono font-bold text-ink">{renewal.amount[currency]}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-muted">{renewal.date}</td>
                <td className="px-3 py-2.5"><RenewalBadge auto={renewal.auto} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 lg:hidden">
        {renewals.map((renewal) => (
          <article className="rounded-xl border border-line p-4" key={renewal.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-xs font-extrabold">{renewal.clinic}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-2xs text-muted"><CountryFlag countryCode={renewal.countryCode} />{renewal.countryCode === "MX" ? "México" : "Perú"}</p>
              </div>
              <RenewalBadge auto={renewal.auto} />
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 text-xs">
              <div><dt className="text-2xs text-muted">Plan</dt><dd className="mt-1"><PlanBadge plan={renewal.plan} /></dd></div>
              <div><dt className="text-2xs text-muted">Monto</dt><dd className="mt-1 font-mono font-bold">{renewal.amount[currency]}</dd></div>
              <div><dt className="text-2xs text-muted">Renovación</dt><dd className="mt-1 font-medium">{renewal.date}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="mt-4 grid place-items-center rounded-xl border border-dashed border-line bg-surface px-6 py-16 text-center shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]">
      <span className="grid size-12 place-items-center rounded-full bg-accent-soft text-accent" aria-hidden="true">
        <Sparkles className="size-5" strokeWidth={1.8} />
      </span>
      <h2 className="mt-4 text-sm font-extrabold">{label}</h2>
      <p className="mt-1.5 max-w-sm text-xs leading-5 text-muted">
        Esta sección estará disponible al conectar el backend de membresías. Por ahora, solo el Resumen está habilitado.
      </p>
      <span className="mt-4"><DataBadge tone="neutral">Próximamente</DataBadge></span>
    </div>
  );
}

export function MembershipsView() {
  const [activeTab, setActiveTab] = useState<TabId>("resumen");
  const [currency, setCurrency] = useState<Currency>("USD");

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-[clamp(1.3rem,1.8vw,1.6rem)] font-extrabold tracking-[-0.03em]">Membresías y Planes</h1>
          <p className="mt-0.5 text-xs text-muted">Gestiona los planes de suscripción y el ciclo de ingresos de la plataforma.</p>
        </div>
        <button
          className="flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-3.5 text-xs font-bold text-white transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          disabled
          title="Disponible al conectar la gestión de planes"
        >
          <Plus className="size-3.5" strokeWidth={2.2} aria-hidden="true" />Crear Plan
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-b border-line sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Secciones de membresías">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                className={`relative min-h-9 whitespace-nowrap px-3 text-xs font-bold transition-colors focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-focus ${
                  isActive ? "text-accent" : "text-muted hover:text-ink"
                }`}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls="membership-panel"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {isActive ? <span className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-accent" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>

        <div className="mb-2 flex items-center gap-2 sm:mb-0">
          <span className="text-2xs font-bold text-muted">Moneda</span>
          <div className="inline-flex items-center rounded-lg border border-line bg-surface p-0.5 text-2xs font-bold" role="group" aria-label="Moneda de visualización">
            {CURRENCIES.map((option) => {
              const isActive = currency === option.id;
              return (
                <button
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-colors focus-visible:outline-3 focus-visible:outline-focus ${
                    isActive ? "bg-accent text-white" : "text-muted hover:text-ink"
                  }`}
                  type="button"
                  aria-pressed={isActive}
                  key={option.id}
                  onClick={() => setCurrency(option.id)}
                >
                  <CountryFlag countryCode={option.flag} className="h-2.5 w-4 shrink-0 rounded-[1px]" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div id="membership-panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
        {activeTab === "resumen" ? (
          <>
            <section className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Indicadores de ingresos">
              {kpis.map((kpi, index) => (
                <StatCard key={kpi.label} label={kpi.label} value={kpi.values[currency]} change={kpi.change} direction={kpi.direction} icon={kpi.icon} tone={kpi.tone} index={index} />
              ))}
            </section>

            <section className="mt-4" aria-label="Planes de suscripción">
              <div className="grid gap-4 lg:grid-cols-3">
                {plans.map((plan) => (
                  <PricingCard key={plan.id} plan={plan} currency={currency} />
                ))}
              </div>
            </section>

            <section className="mt-4 grid gap-4 lg:grid-cols-2" aria-label="Distribución de suscripciones">
              <DonutChart title="Suscripciones por País" centerValue="342" centerLabel="Activas" segments={subscriptionsByCountry} />
              <DonutChart title="Distribución por Plan" centerValue="342" centerLabel="Clínicas" segments={subscriptionsByPlan} />
            </section>

            <section className="mt-4 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="renewals-title">
              <div className="flex min-h-11 items-center justify-between gap-3 border-b border-line px-3">
                <h2 className="flex items-center gap-1.5 text-2xs font-extrabold" id="renewals-title">
                  <CalendarClock className="size-3.5 text-muted" strokeWidth={1.8} aria-hidden="true" />Próximas Renovaciones
                </h2>
                <span className="hidden text-2xs text-muted sm:block">Próximos 30 días</span>
              </div>
              <RenewalsTable currency={currency} />
            </section>
          </>
        ) : (
          <ComingSoon label={TABS.find((tab) => tab.id === activeTab)?.label ?? "Próximamente"} />
        )}
      </div>
    </div>
  );
}

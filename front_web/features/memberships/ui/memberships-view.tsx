"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  Check,
  Link2,
  Plus,
  RefreshCw,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { CountryFlag, type CountryCode } from "@/shared/ui/country-flag";
import { DataBadge, type BadgeTone } from "@/shared/ui/data-badge";
import { DonutChart, type DonutSegment } from "@/shared/ui/donut-chart";
import { StatCard, type StatTone } from "@/shared/ui/stat-card";
import {
  NewPlanModal,
  EditPlanModal,
  NewSubscriptionModal,
  UpgradeSubscriptionModal,
  CancelSubscriptionDialog,
} from "@/features/memberships/ui/membership-modals";
import type { MembershipCurrency, MembershipDashboard, MembershipPayment, MembershipPlan, MembershipSubscription } from "@/features/memberships/model/memberships.types";
import { getAdminMemberships, getMembershipClinics, type MembershipClinic } from "@/features/memberships/api/browser-memberships";
import { PlatformModuleLoading } from "@/shared/ui/platform-module-loading";

type Currency = MembershipCurrency;
type TabId = "resumen" | "suscripciones" | "planes" | "historial";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "resumen", label: "Resumen" },
  { id: "suscripciones", label: "Suscripciones" },
  { id: "planes", label: "Planes" },
  { id: "historial", label: "Historial de Facturación" },
];

const CURRENCIES: Array<{ id: Currency; label: string; flag: CountryCode }> = [
  { id: "USD", label: "USD", flag: "US" },
  { id: "MXN", label: "MXN", flag: "MX" },
  { id: "PEN", label: "PEN", flag: "PE" },
];

const usdFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const penFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 0,
});

const mxnFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("es-MX");

const dateFormatter = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" });

function formatterFor(currency: Currency): Intl.NumberFormat {
  return currency === "USD" ? usdFormatter : currency === "PEN" ? penFormatter : mxnFormatter;
}

function convertCents(amountCents: number, source: Currency, target: Currency, rates: MembershipDashboard["currencyRates"]): number | null {
  if (source === target) return amountCents;
  const sourceRate = rates[source];
  const targetRate = rates[target];
  if (!sourceRate || !targetRate) return null;
  return Math.round((amountCents / sourceRate) * targetRate);
}

function formatAmount(amountCents: number, source: Currency, target: Currency, rates: MembershipDashboard["currencyRates"]): string {
  const converted = convertCents(amountCents, source, target, rates);
  return formatterFor(converted === null ? source : target).format((converted ?? amountCents) / 100);
}

function formatPlanPrice(plan: MembershipPlan, currency: Currency, rates: MembershipDashboard["currencyRates"]): string {
  return formatAmount(plan.monthlyPriceCents, plan.currency, currency, rates);
}

function formatPlanCard(plan: MembershipPlan, currency: Currency, rates: MembershipDashboard["currencyRates"]): string {
  return formatPlanPrice(plan, currency, rates);
}

function formatRenewalDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

const COUNTRY_LABELS: Record<string, string> = {
  MX: "México",
  PE: "Perú",
  US: "Estados Unidos",
};

const COUNTRY_COLORS: Record<string, string> = {
  MX: "var(--accent)",
  PE: "var(--focus)",
  US: "var(--warning)",
};

const PLAN_COLORS: Record<string, string> = {
  basic: "var(--plan-basic)",
  professional: "var(--plan-professional)",
  enterprise: "var(--plan-enterprise)",
};

const PLAN_TONES: Record<string, BadgeTone> = {
  basic: "neutral",
  professional: "accent",
  enterprise: "dark",
};

function planLabel(plan: string): string {
  const byKey: Record<string, string> = {
    basic: "Básico",
    professional: "Profesional",
    enterprise: "Enterprise",
  };
  return byKey[plan] ?? plan;
}

function planTone(plan: string): BadgeTone {
  return PLAN_TONES[plan] ?? "neutral";
}

function planColor(plan: string): string {
  return PLAN_COLORS[plan] ?? "var(--muted)";
}

function PlanBadge({ plan }: { plan: string }) {
  return <DataBadge tone={planTone(plan)}>{planLabel(plan)}</DataBadge>;
}

function RenewalBadge({ auto }: { auto: boolean }) {
  return (
    <DataBadge tone={auto ? "success" : "warning"} dot>
      {auto ? "Automática" : "Requiere acción"}
    </DataBadge>
  );
}

function CountryCard({ countryCode }: { countryCode: string | null }) {
  return <CountryCell countryCode={countryCode} />;
}

function CountryCell({ countryCode }: { countryCode: string | null }) {
  const code = countryCode ?? "";
  const supported = code === "MX" || code === "PE" || code === "US";

  return (
    <span className="flex items-center gap-2 text-muted">
      {supported ? <CountryFlag countryCode={code as CountryCode} /> : <Link2 className="size-3.5" strokeWidth={1.7} aria-hidden="true" />}
      {COUNTRY_LABELS[code] ?? (code || "—")}
    </span>
  );
}

function PricingCard({
  plan,
  currency,
  currencyRates,
  onEdit,
}: {
  plan: MembershipPlan;
  currency: Currency;
  currencyRates: MembershipDashboard["currencyRates"];
  onEdit: () => void;
}) {
  const popular = plan.popular || plan.key === "professional";

  return (
    <article
      className={`relative flex flex-col rounded-xl bg-surface p-5 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)] ${
        popular ? "border-2 border-accent" : "border border-line"
      }`}
    >
      {popular ? (
        <span className="absolute -top-2.5 left-5 rounded-full bg-accent px-2.5 py-0.5 text-2xs font-extrabold text-white shadow-sm">
          Más popular
        </span>
      ) : null}

      <div className="flex items-center gap-2">
        <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: planColor(plan.key) }} aria-hidden="true" />
        <h3 className="text-sm font-extrabold">{plan.name}</h3>
      </div>
      <p className="mt-1 text-2xs leading-4 text-muted">{plan.description ?? "Plan de suscripción."}</p>

      <p className="mt-4 flex items-baseline gap-1">
        <span className="font-mono text-[1.75rem] font-bold leading-none tracking-[-0.05em] text-ink">{formatPlanCard(plan, currency, currencyRates)}</span>
        <span className="text-2xs font-semibold text-muted">/mes</span>
      </p>
      <p className="mt-1.5 text-2xs font-bold text-muted">{numberFormatter.format(plan.subscribers)} clínicas suscritas</p>

      <ul className="mt-4 grid flex-1 gap-2 border-t border-line pt-4">
        {plan.features.map((feature) => (
          <li className="flex items-start gap-2 text-xs" key={feature}>
            <Check className="mt-0.5 size-3.5 shrink-0 text-success" strokeWidth={2.4} aria-hidden="true" />
            <span className="text-ink-secondary">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className="mt-5 flex min-h-9 items-center justify-center rounded-lg border border-line text-xs font-bold text-ink transition-colors hover:border-accent/60 hover:bg-accent-soft hover:text-accent focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        onClick={onEdit}
      >
        Editar plan
      </button>
    </article>
  );
}

function RenewalsTable({
  renewals,
  currency,
  currencyRates,
  onUpgrade,
  onCancel,
}: {
  renewals: MembershipDashboard["upcomingRenewals"];
  currency: Currency;
  currencyRates: MembershipDashboard["currencyRates"];
  onUpgrade: (renewal: { id: number; clinic: string; plan: string }) => void;
  onCancel: (renewal: { id: number; clinic: string }) => void;
}) {
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
              <th className="px-3 py-2.5 text-right font-bold" scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {renewals.map((renewal) => (
              <tr className="text-xs transition-colors hover:bg-accent-soft/35" key={renewal.id}>
                <th className="whitespace-nowrap px-3 py-2.5 font-bold text-ink" scope="row">{renewal.clinic ?? "Clínica"}</th>
                <td className="px-3 py-2.5"><CountryCard countryCode={renewal.countryCode} /></td>
                <td className="px-3 py-2.5"><PlanBadge plan={renewal.plan} /></td>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono font-bold text-ink">{formatAmount(renewal.amountCents, renewal.currency, currency, currencyRates)}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-muted">{formatRenewalDate(renewal.renewalAt)}</td>
                <td className="px-3 py-2.5"><RenewalBadge auto={renewal.autoRenew} /></td>
                <td className="px-3 py-1.5">
                  <div className="flex justify-end gap-1.5">
                    <button
                      className="flex min-h-6.5 items-center gap-1 rounded-md border border-line px-2 text-2xs font-bold text-ink transition-colors hover:border-accent/60 hover:text-accent focus-visible:outline-3 focus-visible:outline-focus"
                      type="button"
                      onClick={() => onUpgrade({ id: renewal.id, clinic: renewal.clinic ?? "Clínica", plan: renewal.plan })}
                    >
                      Cambiar plan
                    </button>
                    <button
                      className="flex min-h-6.5 items-center gap-1 rounded-md border border-line px-2 text-2xs font-bold text-danger transition-colors hover:border-danger/50 hover:bg-danger-soft focus-visible:outline-3 focus-visible:outline-focus"
                      type="button"
                      onClick={() => onCancel({ id: renewal.id, clinic: renewal.clinic ?? "Clínica" })}
                    >
                      Cancelar
                    </button>
                  </div>
                </td>
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
                <h3 className="truncate text-xs font-extrabold">{renewal.clinic ?? "Clínica"}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-2xs text-muted"><CountryCard countryCode={renewal.countryCode} /></p>
              </div>
              <RenewalBadge auto={renewal.autoRenew} />
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 text-xs">
              <div><dt className="text-2xs text-muted">Plan</dt><dd className="mt-1"><PlanBadge plan={renewal.plan} /></dd></div>
               <div><dt className="text-2xs text-muted">Monto</dt><dd className="mt-1 font-mono font-bold">{formatAmount(renewal.amountCents, renewal.currency, currency, currencyRates)}</dd></div>
              <div><dt className="text-2xs text-muted">Renovación</dt><dd className="mt-1 font-medium">{formatRenewalDate(renewal.renewalAt)}</dd></div>
            </dl>
            <div className="mt-3 flex justify-end gap-1.5 border-t border-line pt-3">
              <button
                className="flex min-h-7 items-center gap-1 rounded-md border border-line px-2.5 text-2xs font-bold text-ink transition-colors hover:border-accent/60 hover:text-accent focus-visible:outline-3 focus-visible:outline-focus"
                type="button"
                onClick={() => onUpgrade({ id: renewal.id, clinic: renewal.clinic ?? "Clínica", plan: renewal.plan })}
              >
                Cambiar plan
              </button>
              <button
                className="flex min-h-7 items-center gap-1 rounded-md border border-line px-2.5 text-2xs font-bold text-danger transition-colors hover:border-danger/50 hover:bg-danger-soft focus-visible:outline-3 focus-visible:outline-focus"
                type="button"
                onClick={() => onCancel({ id: renewal.id, clinic: renewal.clinic ?? "Clínica" })}
              >
                Cancelar
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

const SUBSCRIPTION_STATUS_LABELS: Record<MembershipSubscription["status"], string> = {
  active: "Activa",
  past_due: "Pago vencido",
  canceled: "Cancelada",
  expired: "Expirada",
};

const SUBSCRIPTION_STATUS_CLASSES: Record<MembershipSubscription["status"], string> = {
  active: "bg-success-soft text-success",
  past_due: "bg-warning-soft text-warning",
  canceled: "bg-danger-soft text-danger",
  expired: "bg-surface-subtle text-muted",
};

function SubscriptionStatusBadge({ status }: { status: MembershipSubscription["status"] }) {
  return <span className={`rounded-full px-2 py-1 text-2xs font-bold ${SUBSCRIPTION_STATUS_CLASSES[status]}`}>{SUBSCRIPTION_STATUS_LABELS[status]}</span>;
}

function SubscriptionsPanel({
  subscriptions,
  currency,
  currencyRates,
  onUpgrade,
  onCancel,
}: {
  subscriptions: MembershipSubscription[];
  currency: Currency;
  currencyRates: MembershipDashboard["currencyRates"];
  onUpgrade: (subscription: MembershipSubscription) => void;
  onCancel: (subscription: MembershipSubscription) => void;
}) {
  return (
    <section className="mt-4 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="subscriptions-list-title">
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-line px-3"><h2 className="text-2xs font-extrabold" id="subscriptions-list-title">Suscripciones registradas</h2><span className="text-2xs text-muted">{subscriptions.length} mostradas</span></div>
      {subscriptions.length ? <><div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[780px] text-left text-xs"><caption className="sr-only">Suscripciones registradas</caption><thead className="bg-surface-subtle text-2xs text-muted"><tr><th className="px-3 py-2.5" scope="col">Clínica</th><th className="px-3 py-2.5" scope="col">Plan</th><th className="px-3 py-2.5" scope="col">Ciclo</th><th className="px-3 py-2.5" scope="col">Monto</th><th className="px-3 py-2.5" scope="col">Estado</th><th className="px-3 py-2.5" scope="col">Fin</th><th className="px-3 py-2.5 text-right" scope="col">Acciones</th></tr></thead><tbody className="divide-y divide-line">{subscriptions.map((subscription) => <tr key={subscription.id}><th className="px-3 py-3 font-bold" scope="row">{subscription.clinic ?? "Clínica"}</th><td className="px-3 py-3"><PlanBadge plan={subscription.plan ?? "basic"} /></td><td className="px-3 py-3 text-muted">{subscription.billingCycle === "annual" ? "Anual" : "Mensual"}</td><td className="px-3 py-3 font-mono font-bold">{formatAmount(subscription.amountCents, subscription.currency, currency, currencyRates)}</td><td className="px-3 py-3"><SubscriptionStatusBadge status={subscription.status} /></td><td className="px-3 py-3 text-muted">{subscription.endsAt ? formatRenewalDate(subscription.endsAt) : "Sin fecha"}</td><td className="px-3 py-3 text-right">{subscription.status === "active" ? <span className="inline-flex gap-1.5"><button className="rounded-md border border-line px-2 py-1 text-2xs font-bold hover:border-accent hover:text-accent focus-visible:outline-3 focus-visible:outline-focus" type="button" onClick={() => onUpgrade(subscription)}>Cambiar plan</button><button className="rounded-md border border-danger/25 px-2 py-1 text-2xs font-bold text-danger hover:bg-danger-soft focus-visible:outline-3 focus-visible:outline-focus" type="button" onClick={() => onCancel(subscription)}>Cancelar</button></span> : <span className="text-2xs text-muted">Sólo lectura</span>}</td></tr>)}</tbody></table></div><div className="grid gap-3 p-3 lg:hidden">{subscriptions.map((subscription) => <article className="rounded-xl border border-line p-4" key={subscription.id}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-xs font-extrabold">{subscription.clinic ?? "Clínica"}</h3><p className="mt-1 text-2xs text-muted">{subscription.planName ?? "Sin plan"}</p></div><SubscriptionStatusBadge status={subscription.status} /></div><dl className="mt-4 grid grid-cols-2 gap-3 border-y border-line py-3 text-xs"><div><dt className="text-2xs text-muted">Ciclo</dt><dd className="mt-1 font-semibold">{subscription.billingCycle === "annual" ? "Anual" : "Mensual"}</dd></div><div><dt className="text-2xs text-muted">Monto</dt><dd className="mt-1 font-mono font-bold">{formatAmount(subscription.amountCents, subscription.currency, currency, currencyRates)}</dd></div><div><dt className="text-2xs text-muted">Inicio</dt><dd className="mt-1 text-muted">{subscription.startsAt ? formatRenewalDate(subscription.startsAt) : "—"}</dd></div><div><dt className="text-2xs text-muted">Fin</dt><dd className="mt-1 text-muted">{subscription.endsAt ? formatRenewalDate(subscription.endsAt) : "Sin fecha"}</dd></div></dl>{subscription.status === "active" ? <div className="mt-3 flex justify-end gap-1.5"><button className="rounded-md border border-line px-2.5 py-1.5 text-2xs font-bold" type="button" onClick={() => onUpgrade(subscription)}>Cambiar plan</button><button className="rounded-md border border-danger/25 px-2.5 py-1.5 text-2xs font-bold text-danger" type="button" onClick={() => onCancel(subscription)}>Cancelar</button></div> : null}</article>)}</div></> : <p className="p-8 text-center text-xs text-muted">No hay suscripciones registradas.</p>}
    </section>
  );
}

function PaymentHistoryPanel({ payments, currency, currencyRates }: { payments: MembershipPayment[]; currency: Currency; currencyRates: MembershipDashboard["currencyRates"] }) {
  return <section className="mt-4 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="payment-history-title"><div className="flex min-h-11 items-center justify-between gap-3 border-b border-line px-3"><h2 className="text-2xs font-extrabold" id="payment-history-title">Historial de pagos</h2><span className="text-2xs text-muted">Datos confirmados del backend</span></div>{payments.length ? <div className="grid gap-3 p-3">{payments.map((payment) => <article className="rounded-xl border border-line p-4" key={payment.id}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-xs font-extrabold">{payment.clinic ?? "Clínica"}</h3><p className="mt-1 truncate font-mono text-2xs text-muted">{payment.reference ?? "Sin referencia"}</p></div><DataBadge tone={payment.status === "succeeded" ? "success" : payment.status === "refunded" ? "violet" : payment.status === "failed" ? "danger" : "warning"}>{payment.status === "succeeded" ? "Exitoso" : payment.status === "refunded" ? "Reembolsado" : payment.status === "failed" ? "Fallido" : "Pendiente"}</DataBadge></div><dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3 text-xs"><div><dt className="text-2xs text-muted">Plan</dt><dd className="mt-1 font-semibold">{payment.plan ?? "—"}</dd></div><div><dt className="text-2xs text-muted">Monto</dt><dd className="mt-1 font-mono font-bold">{formatAmount(payment.amountCents, payment.currency, currency, currencyRates)}</dd></div><div><dt className="text-2xs text-muted">Proveedor</dt><dd className="mt-1 text-muted">{payment.provider === "admin_manual" ? "Manual" : payment.provider}</dd></div><div><dt className="text-2xs text-muted">Fecha</dt><dd className="mt-1 text-muted">{formatRenewalDate(payment.refundedAt ?? payment.paidAt ?? payment.createdAt ?? "")}</dd></div></dl></article>)}</div> : <p className="p-8 text-center text-xs text-muted">No hay pagos registrados.</p>}</section>;
}

export function MembershipsView() {
  const [activeTab, setActiveTab] = useState<TabId>("resumen");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [data, setData] = useState<MembershipDashboard | null>(null);
  const [clinics, setClinics] = useState<MembershipClinic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [newPlanOpen, setNewPlanOpen] = useState(false);
  const [newSubscriptionOpen, setNewSubscriptionOpen] = useState(false);
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<{ id: number; clinic: string; plan: string } | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<{ id: number; clinic: string } | null>(null);

  const load = async (signal?: AbortSignal) => {
    const [dashboard, clinicList] = await Promise.all([
      getAdminMemberships(signal),
      getMembershipClinics(signal),
    ]);

    setData(dashboard);
    setClinics(clinicList);
  };

  const refresh = () => {
    setIsLoading(true);
    setError(null);

    load()
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : "No pudimos cargar las membresías.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([getAdminMemberships(controller.signal), getMembershipClinics(controller.signal)])
      .then(([dashboard, clinicList]) => {
        setData(dashboard);
        setClinics(clinicList);
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(requestError instanceof Error ? requestError.message : "No pudimos cargar las membresías.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  const kpis = useMemo<Array<{ label: string; value: string; change?: string; direction: "up" | "down"; icon: LucideIcon; tone: StatTone }>>(() => {
    if (!data) return [];

    const { kpis } = data;

    return [
      {
        label: "MRR · Ingresos Mensuales",
         value: formatterFor(currency).format(kpis.mrr.byCurrency[currency] / 100),
        change: kpis.mrr.changeNote || "Datos consolidados",
        direction: (kpis.mrr.changePct ?? 0) >= 0 ? "up" : "down",
        icon: Wallet,
        tone: "accent",
      },
      {
        label: "ARR · Ingresos Anuales",
         value: formatterFor(currency).format(kpis.arr.byCurrency[currency] / 100),
        change: kpis.arr.changeNote || "Datos consolidados",
        direction: (kpis.arr.changePct ?? 0) >= 0 ? "up" : "down",
        icon: TrendingUp,
        tone: "success",
      },
      {
        label: "Suscripciones Activas",
        value: numberFormatter.format(kpis.activeSubscriptions.count),
        change: kpis.activeSubscriptions.changeNote || "Datos consolidados",
        direction: kpis.activeSubscriptions.changeCount >= 0 ? "up" : "down",
        icon: Users,
        tone: "violet",
      },
      {
        label: "Tasa de Renovación",
        value: `${kpis.renewalRate.percentage}%`,
        change: kpis.renewalRate.changeNote || "Datos consolidados",
        direction: (kpis.renewalRate.changePct ?? 0) >= 0 ? "up" : "down",
        icon: RefreshCw,
        tone: "warning",
      },
    ];
  }, [data, currency]);

  const countryDonut: DonutSegment[] = useMemo(
    () =>
      (data?.subscriptionsByCountry ?? []).map((item) => ({
        label: COUNTRY_LABELS[item.countryCode] ?? item.countryCode,
        value: numberFormatter.format(item.count),
        percentage: item.percentage,
        color: COUNTRY_COLORS[item.countryCode] ?? "var(--muted)",
      })),
    [data],
  );

  const planDonut: DonutSegment[] = useMemo(
    () =>
      (data?.subscriptionsByPlan ?? []).map((item) => ({
        label: planLabel(item.plan),
        value: numberFormatter.format(item.count),
        percentage: item.percentage,
        color: planColor(item.plan),
      })),
    [data],
  );

  const totalSubscriptions = data?.kpis.activeSubscriptions.count ?? 0;

  if (!data) {
    if (error) {
      return <main className="mx-auto grid min-h-[48vh] max-w-2xl place-items-center px-4"><p className="rounded-xl border border-danger/25 bg-danger-soft p-5 text-center text-xs text-danger" role="alert">{error}</p></main>;
    }

    return <PlatformModuleLoading label="Cargando membresías" variant="memberships" />;
  }

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-[clamp(1.3rem,1.8vw,1.6rem)] font-extrabold tracking-[-0.03em]">Membresías y Planes</h1>
          <p className="mt-0.5 text-xs text-muted">Gestiona los planes de suscripción y el ciclo de ingresos de la plataforma.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isLoading ? <span className="self-center text-2xs font-bold text-accent" role="status">Actualizando...</span> : null}
          <button
            className="flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 text-xs font-bold text-ink transition-colors hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
            type="button"
            onClick={() => setNewSubscriptionOpen(true)}
            disabled={isLoading || data === null || clinics.length === 0}
          >
            <Plus className="size-3.5" strokeWidth={2.2} aria-hidden="true" />Nueva Suscripción
          </button>
          <button
            className="flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-3.5 text-xs font-bold text-white transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
            type="button"
            onClick={() => setNewPlanOpen(true)}
            disabled={isLoading || data === null}
          >
            <Plus className="size-3.5" strokeWidth={2.2} aria-hidden="true" />Crear Plan
          </button>
        </div>
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
        {error && !data ? (
          <div className="mt-4 rounded-xl border border-danger/25 bg-danger-soft p-6 text-center" role="alert">
            <p className="text-xs font-bold text-danger">No pudimos cargar las membresías.</p>
            <p className="mt-1 text-2xs text-muted">{error}</p>
            <button
              className="mt-4 inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-2xs font-bold text-white transition-colors hover:bg-accent-hover"
              type="button"
              onClick={refresh}
            >
              <RefreshCw className="size-3" strokeWidth={2} aria-hidden="true" />Reintentar
            </button>
          </div>
        ) : null}

        {activeTab === "resumen" ? (
          <>
            <section className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Indicadores de ingresos">
              {kpis.map((kpi, index) => (
                <StatCard key={kpi.label} label={kpi.label} value={kpi.value} change={kpi.change} direction={kpi.direction} icon={kpi.icon} tone={kpi.tone} index={index} />
              ))}
            </section>

            <section className="mt-4" aria-label="Planes de suscripción">
              <div className="grid gap-4 lg:grid-cols-3">
                {data.plans.map((plan) => (
                  <PricingCard
                    key={plan.id}
                    plan={plan}
                    currency={currency}
                    currencyRates={data.currencyRates}
                    onEdit={() => {
                      setSelectedPlan(plan);
                      setEditPlanOpen(true);
                    }}
                  />
                ))}
              </div>
            </section>

            <section className="mt-4 grid gap-4 lg:grid-cols-2" aria-label="Distribución de suscripciones">
              <DonutChart title="Suscripciones por País" centerValue={numberFormatter.format(totalSubscriptions)} centerLabel="Activas" segments={countryDonut} />
              <DonutChart title="Distribución por Plan" centerValue={numberFormatter.format(totalSubscriptions)} centerLabel="Clínicas" segments={planDonut} />
            </section>

            <section className="mt-4 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="renewals-title">
              <div className="flex min-h-11 items-center justify-between gap-3 border-b border-line px-3">
                <h2 className="flex items-center gap-1.5 text-2xs font-extrabold" id="renewals-title">
                  <CalendarClock className="size-3.5 text-muted" strokeWidth={1.8} aria-hidden="true" />Próximas Renovaciones
                </h2>
                <span className="hidden text-2xs text-muted sm:block">Próximos 30 días</span>
              </div>
              {data.upcomingRenewals.length === 0 ? (
                <p className="p-6 text-center text-xs text-muted">No hay renovaciones programadas en los próximos 30 días.</p>
              ) : (
                <RenewalsTable
                  currency={currency}
                  currencyRates={data.currencyRates}
                  renewals={data.upcomingRenewals}
                  onUpgrade={({ id, clinic, plan }) => {
                    setUpgradeTarget({ id, clinic, plan });
                    setUpgradeOpen(true);
                  }}
                  onCancel={({ id, clinic }) => {
                    setCancelTarget({ id, clinic });
                    setCancelOpen(true);
                  }}
                />
              )}
            </section>
          </>
        ) : null}

        {activeTab === "suscripciones" ? <SubscriptionsPanel subscriptions={data.subscriptions} currency={currency} currencyRates={data.currencyRates} onUpgrade={(subscription) => { setUpgradeTarget({ id: subscription.id, clinic: subscription.clinic ?? "Clínica", plan: subscription.plan ?? "basic" }); setUpgradeOpen(true); }} onCancel={(subscription) => { setCancelTarget({ id: subscription.id, clinic: subscription.clinic ?? "Clínica" }); setCancelOpen(true); }} /> : null}
        {activeTab === "planes" ? <section className="mt-4 grid gap-4 lg:grid-cols-3" aria-label="Planes de suscripción">{data.plans.map((plan) => <PricingCard key={plan.id} plan={plan} currency={currency} currencyRates={data.currencyRates} onEdit={() => { setSelectedPlan(plan); setEditPlanOpen(true); }} />)}</section> : null}
        {activeTab === "historial" ? <PaymentHistoryPanel payments={data.paymentHistory} currency={currency} currencyRates={data.currencyRates} /> : null}
      </div>

      <NewPlanModal
        isOpen={newPlanOpen}
        onClose={() => setNewPlanOpen(false)}
        onCreated={refresh}
      />
      <EditPlanModal
        isOpen={editPlanOpen}
        onClose={() => setEditPlanOpen(false)}
        plan={selectedPlan}
        onUpdated={refresh}
      />
      <NewSubscriptionModal
        isOpen={newSubscriptionOpen}
        onClose={() => setNewSubscriptionOpen(false)}
        clinics={clinics}
        plans={data?.plans ?? []}
        onCreated={refresh}
      />
      <UpgradeSubscriptionModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        subscriptionId={upgradeTarget?.id ?? 0}
        currentPlan={planLabel(upgradeTarget?.plan ?? "professional")}
        plans={data?.plans ?? []}
        onUpgraded={refresh}
      />
      <CancelSubscriptionDialog
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        subscriptionId={cancelTarget?.id ?? 0}
        clinicName={cancelTarget?.clinic ?? "la clínica"}
        onCanceled={refresh}
      />
    </div>
  );
}

import { cookies } from "next/headers";
import type {
  Clinic,
  ClinicActivity,
  ClinicCountryCode,
  ClinicPlan,
  ClinicsDashboardPageData,
  ClinicStatus,
} from "@/features/clinics/model/clinic.types";
import type { BillingCurrency } from "@/features/platform/model/admin-billing.types";
import { BILLING_CURRENCIES, isBillingCurrency } from "@/features/platform/lib/billing-currency";
import { serverEnv } from "@/shared/config/server-env";

type AdminClinicsQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  country?: ClinicCountryCode | "all";
  plan?: ClinicPlan | "all";
  status?: ClinicStatus | "all";
};

type ApiClinic = {
  id: number;
  name: string;
  country_code: ClinicCountryCode;
  address: string;
  plan: ClinicPlan;
  users: number;
  patients: number;
  status: ClinicStatus;
  monthly_billing: number;
  monthly_billing_currency: BillingCurrency;
  last_payment: string | null;
};

type ApiPagination = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

type ApiSummary = {
  revenue_currency: BillingCurrency;
  totals: {
    clinics: number;
    active_clinics: number;
    suspended_clinics: number;
    users: number;
    patients: number;
    monthly_revenue: number;
    annual_revenue: number;
    monthly_revenue_cents_by_currency: Record<BillingCurrency, number>;
    annual_revenue_cents_by_currency: Record<BillingCurrency, number>;
  };
  plan_distribution: Array<{
    plan: ClinicPlan;
    count: number;
    percentage: number;
  }>;
  recent_activity: Array<{
    id: number;
    type: ClinicActivity["type"];
    title: string;
    detail: string;
    occurred_at: string;
  }>;
};

type ApiClinicsResponse = {
  data: ApiClinic[];
  meta: ApiPagination;
  summary: ApiSummary;
};

export type ClinicsDashboardLoadResult =
  | { ok: true; data: ClinicsDashboardPageData }
  | { ok: false; message: string; status: number };

const countryNames: Record<ClinicCountryCode, string> = {
  MX: "México",
  PE: "Perú",
  US: "Estados Unidos",
};

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function isCurrencyAmountMap(value: unknown): value is Record<BillingCurrency, number> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    && BILLING_CURRENCIES.every((currency) => typeof (value as Record<string, unknown>)[currency] === "number");
}

function formatDate(value: string | null): string | null {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function errorMessage(status: number): string {
  if (status === 401) return "Tu sesión expiró. Inicia sesión nuevamente para consultar las clínicas.";
  if (status === 403) return "Tu cuenta no tiene permisos para consultar la administración global.";

  return "No pudimos cargar las clínicas desde el servidor. Intenta nuevamente en unos minutos.";
}

export async function getClinicsDashboardData(
  query: AdminClinicsQuery = {},
): Promise<ClinicsDashboardLoadResult> {
  const search = new URLSearchParams({ per_page: String(query.perPage ?? 10) });

  if (query.page && query.page > 1) search.set("page", String(query.page));
  if (query.search?.trim()) search.set("search", query.search.trim());
  if (query.country && query.country !== "all") search.set("country_code", query.country);
  if (query.plan && query.plan !== "all") search.set("plan", query.plan);
  if (query.status && query.status !== "all") search.set("status", query.status);

  try {
    const response = await fetch(
      `${serverEnv.backendUrl}/api/v1/auth/admin/clinics?${search.toString()}`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Cookie: (await cookies()).toString(),
          Origin: serverEnv.appUrl,
        },
      },
    );

    if (!response.ok) {
      return { ok: false, message: errorMessage(response.status), status: response.status };
    }

    const payload = (await response.json()) as ApiClinicsResponse;

    if (
      !Array.isArray(payload.data) ||
      !payload.data.every((clinic) => isBillingCurrency(clinic.monthly_billing_currency)) ||
      !payload.meta ||
      !payload.summary ||
       !Array.isArray(payload.summary.plan_distribution) ||
       !Array.isArray(payload.summary.recent_activity) ||
       !isBillingCurrency(payload.summary.revenue_currency) ||
       !isCurrencyAmountMap(payload.summary.totals.monthly_revenue_cents_by_currency) ||
       !isCurrencyAmountMap(payload.summary.totals.annual_revenue_cents_by_currency)
    ) {
      return {
        ok: false,
        message: "El servidor devolvió una respuesta de clínicas incompleta.",
        status: 502,
      };
    }

    const clinics: Clinic[] = payload.data.map((clinic) => ({
      id: clinic.id,
      name: clinic.name,
      countryCode: clinic.country_code,
      country: countryNames[clinic.country_code],
      city: clinic.address,
      plan: clinic.plan,
      users: clinic.users,
      patients: clinic.patients,
      status: clinic.status,
      monthlyBilling: clinic.monthly_billing,
      monthlyBillingCurrency: clinic.monthly_billing_currency,
      lastPayment: formatDate(clinic.last_payment),
    }));

    return {
      ok: true,
      data: {
        clinics,
        totals: {
          clinics: payload.summary.totals.clinics,
          activeClinics: payload.summary.totals.active_clinics,
          suspendedClinics: payload.summary.totals.suspended_clinics,
          users: payload.summary.totals.users,
          patients: payload.summary.totals.patients,
          monthlyRevenue: payload.summary.totals.monthly_revenue,
          annualRevenue: payload.summary.totals.annual_revenue,
          revenueCurrency: payload.summary.revenue_currency,
          monthlyRevenueByCurrency: Object.fromEntries(BILLING_CURRENCIES.map((currency) => [currency, payload.summary.totals.monthly_revenue_cents_by_currency[currency] / 100])) as Record<BillingCurrency, number>,
          annualRevenueByCurrency: Object.fromEntries(BILLING_CURRENCIES.map((currency) => [currency, payload.summary.totals.annual_revenue_cents_by_currency[currency] / 100])) as Record<BillingCurrency, number>,
        },
        planDistribution: payload.summary.plan_distribution,
        recentActivity: payload.summary.recent_activity.map((activity) => ({
          id: activity.id,
          type: activity.type,
          title: activity.title,
          detail: activity.detail,
          occurredAt: formatDate(activity.occurred_at) ?? activity.occurred_at,
        })),
        pagination: {
          currentPage: payload.meta.current_page,
          from: payload.meta.from,
          lastPage: payload.meta.last_page,
          perPage: payload.meta.per_page,
          to: payload.meta.to,
          total: payload.meta.total,
        },
      },
    };
  } catch {
    return {
      ok: false,
      message: "No pudimos conectar con el servidor de clínicas. Intenta nuevamente en unos minutos.",
      status: 503,
    };
  }
}

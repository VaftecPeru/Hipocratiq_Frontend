import { ApiError, getFromApi, patchToApi, postToApi } from "@/shared/api/http-client";
import { parseApiList } from "@/shared/api/parse-api-list";
import type {
  CreatePlanPayload,
  CreateSubscriptionPayload,
  MembershipDashboard,
  MembershipKpis,
  MembershipPlan,
  UpcomingRenewal,
  UpdatePlanPayload,
  UpgradeSubscriptionPayload,
} from "@/features/memberships/model/memberships.types";

type ApiKpi = {
  usd_cents: number;
  pen_cents: number;
  change_pct: number | null;
  change_note: string;
};

type ApiActiveSubscriptions = {
  count: number;
  change_count: number;
  change_note: string;
};

type ApiRenewalRate = {
  percentage: number;
  change_pct: number | null;
  change_note: string;
};

type ApiPlan = {
  id: number;
  key: string;
  name: string;
  description: string | null;
  monthly_price_usd_cents: number;
  annual_price_usd_cents: number;
  currency: string;
  features: string[];
  publicly_selectable: boolean;
  is_active: boolean;
  subscribers: number;
  popular: boolean;
};

type ApiCountryDistribution = {
  country_code: string;
  count: number;
  percentage: number;
};

type ApiPlanDistribution = {
  plan: string;
  count: number;
  percentage: number;
};

type ApiRenewal = {
  id: number;
  clinic_id: number;
  clinic: string | null;
  country_code: string | null;
  plan: string;
  amount_usd_cents: number;
  amount_pen_cents: number;
  renewal_at: string;
  auto_renew: boolean;
};

type ApiMembershipDashboard = {
  kpis: {
    mrr: ApiKpi;
    arr: ApiKpi;
    active_subscriptions: ApiActiveSubscriptions;
    renewal_rate: ApiRenewalRate;
  };
  plans: ApiPlan[];
  subscriptions_by_country: ApiCountryDistribution[];
  subscriptions_by_plan: ApiPlanDistribution[];
  upcoming_renewals: ApiRenewal[];
  conversion_rate: number;
  generated_at: string;
};

type ApiPlanItem = {
  id: number;
  key: string;
  name: string;
  description: string | null;
  monthly_price_usd_cents: number;
  annual_price_usd_cents: number;
  currency: string;
  features: string[];
  publicly_selectable: boolean;
  is_active: boolean;
};

function mapKpi(apiKpi: ApiKpi): MembershipKpis["mrr"] {
  return {
    usdCents: apiKpi.usd_cents,
    penCents: apiKpi.pen_cents,
    changePct: apiKpi.change_pct,
    changeNote: apiKpi.change_note,
  };
}

function mapPlan(apiPlan: ApiPlan): MembershipPlan {
  return {
    id: apiPlan.id,
    key: apiPlan.key,
    name: apiPlan.name,
    description: apiPlan.description,
    monthlyPriceUsdCents: apiPlan.monthly_price_usd_cents,
    annualPriceUsdCents: apiPlan.annual_price_usd_cents,
    currency: apiPlan.currency,
    features: parseApiList<string>(apiPlan.features, "memberships.plan.features"),
    publiclySelectable: apiPlan.publicly_selectable,
    isActive: apiPlan.is_active,
    subscribers: apiPlan.subscribers,
    popular: apiPlan.popular,
  };
}

function mapRenewal(apiRenewal: ApiRenewal): UpcomingRenewal {
  return {
    id: apiRenewal.id,
    clinicId: apiRenewal.clinic_id,
    clinic: apiRenewal.clinic,
    countryCode: apiRenewal.country_code,
    plan: apiRenewal.plan,
    amountUsdCents: apiRenewal.amount_usd_cents,
    amountPenCents: apiRenewal.amount_pen_cents,
    renewalAt: apiRenewal.renewal_at,
    autoRenew: apiRenewal.auto_renew,
  };
}

function toSnake(payload: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
      value,
    ]),
  );
}

export async function getAdminMemberships(signal?: AbortSignal): Promise<MembershipDashboard> {
  const payload = await getFromApi<{ data: ApiMembershipDashboard }>(
    "/api/v1/auth/admin/memberships",
    { signal },
  );

  if (
    !payload.data ||
    !payload.data.kpis
  ) {
    throw new ApiError("El servidor devolvió una respuesta de membresías incompleta.", 502);
  }

  const { kpis } = payload.data;

  return {
    kpis: {
      mrr: mapKpi(kpis.mrr),
      arr: mapKpi(kpis.arr),
      activeSubscriptions: {
        count: kpis.active_subscriptions.count,
        changeCount: kpis.active_subscriptions.change_count,
        changeNote: kpis.active_subscriptions.change_note,
      },
      renewalRate: {
        percentage: kpis.renewal_rate.percentage,
        changePct: kpis.renewal_rate.change_pct,
        changeNote: kpis.renewal_rate.change_note,
      },
    },
    plans: parseApiList<ApiPlan>(payload.data.plans, "memberships.plans").map(mapPlan),
    subscriptionsByCountry: parseApiList<ApiCountryDistribution>(payload.data.subscriptions_by_country, "memberships.subscriptions_by_country").map((item) => ({
      countryCode: item.country_code,
      count: item.count,
      percentage: item.percentage,
    })),
    subscriptionsByPlan: parseApiList<ApiPlanDistribution>(payload.data.subscriptions_by_plan, "memberships.subscriptions_by_plan").map((item) => ({
      plan: item.plan,
      count: item.count,
      percentage: item.percentage,
    })),
    upcomingRenewals: parseApiList<ApiRenewal>(payload.data.upcoming_renewals, "memberships.upcoming_renewals").map(mapRenewal),
    conversionRate: payload.data.conversion_rate,
    generatedAt: payload.data.generated_at,
  };
}

export type MembershipClinic = {
  id: number;
  name: string;
  countryCode: string;
};

type ApiClinicItem = {
  id: number;
  name: string;
  country_code: string;
};

export async function getMembershipClinics(signal?: AbortSignal): Promise<MembershipClinic[]> {
  const payload = await getFromApi<{ data: ApiClinicItem[] }>(
    "/api/v1/auth/admin/clinics?per_page=100",
    { signal },
  );

  if (!payload.data) {
    throw new ApiError("El servidor devolvió una respuesta de clínicas incompleta.", 502);
  }

  return parseApiList<ApiClinicItem>(payload.data, "memberships.clinics.data").map((clinic) => ({
    id: clinic.id,
    name: clinic.name,
    countryCode: clinic.country_code,
  }));
}

export async function createMembershipPlan(payload: CreatePlanPayload): Promise<MembershipPlan> {
  const body = await postToApi<{ data: ApiPlanItem }>(
    "/api/v1/auth/admin/memberships/plans",
    toSnake(payload),
  );

  return {
    ...mapPlan(body.data as ApiPlan),
    subscribers: 0,
    popular: false,
  };
}

export async function updateMembershipPlan(
  planId: number,
  payload: UpdatePlanPayload,
): Promise<MembershipPlan> {
  const body = await patchToApi<{ data: ApiPlanItem }>(
    `/api/v1/auth/admin/memberships/plans/${planId}`,
    toSnake(payload),
  );

  return {
    ...mapPlan(body.data as ApiPlan),
    subscribers: 0,
    popular: false,
  };
}

export async function createMembershipSubscription(
  payload: CreateSubscriptionPayload,
): Promise<number> {
  const body = await postToApi<{ data: { id: number } }>(
    "/api/v1/auth/admin/memberships/subscriptions",
    toSnake(payload),
  );

  return body.data.id;
}

export async function upgradeMembershipSubscription(
  subscriptionId: number,
  payload: UpgradeSubscriptionPayload,
): Promise<void> {
  await postToApi<{ data: { id: number } }>(
    `/api/v1/auth/admin/memberships/subscriptions/${subscriptionId}/upgrade`,
    toSnake(payload),
  );
}

export async function cancelMembershipSubscription(subscriptionId: number): Promise<void> {
  await postToApi<{ data: { id: number } }>(
    `/api/v1/auth/admin/memberships/subscriptions/${subscriptionId}/cancel`,
  );
}

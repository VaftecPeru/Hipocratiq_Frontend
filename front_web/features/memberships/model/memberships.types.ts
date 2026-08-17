export type MembershipCurrency = "USD" | "PEN";

export type BillingCycle = "monthly" | "annual";

export type SubscriptionStatus = "active" | "past_due" | "canceled" | "expired";

export type KpiMetric = {
  usdCents: number;
  penCents: number;
  changePct: number | null;
  changeNote: string;
};

export type ActiveSubscriptionsKpi = {
  count: number;
  changeCount: number;
  changeNote: string;
};

export type RenewalRateKpi = {
  percentage: number;
  changePct: number | null;
  changeNote: string;
};

export type MembershipKpis = {
  mrr: KpiMetric;
  arr: KpiMetric;
  activeSubscriptions: ActiveSubscriptionsKpi;
  renewalRate: RenewalRateKpi;
};

export type MembershipPlan = {
  id: number;
  key: string;
  name: string;
  description: string | null;
  monthlyPriceUsdCents: number;
  annualPriceUsdCents: number;
  currency: string;
  features: string[];
  publiclySelectable: boolean;
  isActive: boolean;
  subscribers: number;
  popular: boolean;
};

export type CountryDistribution = {
  countryCode: string;
  count: number;
  percentage: number;
};

export type PlanSubscription = {
  plan: string;
  count: number;
  percentage: number;
};

export type UpcomingRenewal = {
  id: number;
  clinicId: number;
  clinic: string | null;
  countryCode: string | null;
  plan: string;
  amountUsdCents: number;
  amountPenCents: number;
  renewalAt: string;
  autoRenew: boolean;
};

export type MembershipDashboard = {
  kpis: MembershipKpis;
  plans: MembershipPlan[];
  subscriptionsByCountry: CountryDistribution[];
  subscriptionsByPlan: PlanSubscription[];
  upcomingRenewals: UpcomingRenewal[];
  conversionRate: number;
  generatedAt: string;
};

export type CreatePlanPayload = {
  key: string;
  name: string;
  description?: string | null;
  monthlyPriceUsd: number;
  annualPriceUsd: number;
  features: string[];
  publiclySelectable?: boolean;
  isActive?: boolean;
};

export type UpdatePlanPayload = {
  key?: string;
  name?: string;
  description?: string | null;
  monthlyPriceUsd?: number;
  annualPriceUsd?: number;
  features?: string[];
  publiclySelectable?: boolean;
  isActive?: boolean;
};

export type CreateSubscriptionPayload = {
  clinicId: number;
  planId: number;
  billingCycle: BillingCycle;
  startsAt: string;
  autoRenew?: boolean;
};

export type UpgradeSubscriptionPayload = {
  planId: number;
  upgradeAt?: string;
};
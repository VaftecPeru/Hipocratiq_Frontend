export type MembershipCurrency = "USD" | "MXN" | "PEN";

export type CurrencyAmounts = Record<MembershipCurrency, number>;

export type BillingCycle = "monthly" | "annual";

export type SubscriptionStatus = "active" | "past_due" | "canceled" | "expired";

export type KpiMetric = {
  usdCents: number;
  penCents: number;
  byCurrency: CurrencyAmounts;
  changePct: number | null;
  changePctByCurrency: Record<MembershipCurrency, number | null>;
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
  monthlyPriceCents: number;
  annualPriceCents: number;
  monthlyPriceUsdCents: number;
  annualPriceUsdCents: number;
  currency: MembershipCurrency;
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
  amountCents: number;
  currency: MembershipCurrency;
  amountUsdCents: number | null;
  amountPenCents: number | null;
  renewalAt: string;
  autoRenew: boolean;
};

export type MembershipSubscription = {
  id: number;
  clinicId: number;
  clinic: string | null;
  countryCode: string | null;
  plan: string | null;
  planName: string | null;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  autoRenew: boolean;
  startsAt: string | null;
  endsAt: string | null;
  amountCents: number;
  currency: MembershipCurrency;
};

export type MembershipPayment = {
  id: number;
  reference: string | null;
  clinic: string | null;
  countryCode: string | null;
  plan: string | null;
  status: "succeeded" | "pending" | "failed" | "refunded";
  amountCents: number;
  currency: MembershipCurrency;
  provider: string;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string | null;
};

export type MembershipDashboard = {
  kpis: MembershipKpis;
  plans: MembershipPlan[];
  subscriptionsByCountry: CountryDistribution[];
  subscriptionsByPlan: PlanSubscription[];
  upcomingRenewals: UpcomingRenewal[];
  conversionRate: number | null;
  currencyRates: Record<MembershipCurrency, number | null>;
  subscriptions: MembershipSubscription[];
  paymentHistory: MembershipPayment[];
  generatedAt: string;
};

export type CreatePlanPayload = {
  key: string;
  name: string;
  description?: string | null;
  monthlyPriceUsd: number;
  annualPriceUsd: number;
  currency?: MembershipCurrency;
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
  currency?: MembershipCurrency;
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

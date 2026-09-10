import type { BillingCurrency } from "@/features/platform/model/admin-billing.types";

export type ClinicCountryCode = "MX" | "PE" | "US";
export type ClinicPlan = "enterprise" | "professional" | "basic";
export type ClinicStatus = "active" | "suspended";

export type Clinic = {
  id: number;
  name: string;
  countryCode: ClinicCountryCode;
  country: string;
  city: string;
  plan: ClinicPlan;
  users: number;
  patients: number;
  status: ClinicStatus;
  monthlyBilling: number;
  monthlyBillingCurrency: BillingCurrency;
  lastPayment: string | null;
};

export type PlanDistribution = {
  plan: ClinicPlan;
  count: number;
  percentage: number;
};

export type ClinicActivity = {
  id: number;
  type: "clinic" | "plan" | "payment" | "user" | "suspension";
  title: string;
  detail: string;
  occurredAt: string;
};

export type ClinicsDashboardData = {
  clinics: Clinic[];
  totals: {
    clinics: number;
    activeClinics: number;
    suspendedClinics: number;
    users: number;
    patients: number;
    monthlyRevenue: number;
    annualRevenue: number;
    revenueCurrency: BillingCurrency;
    monthlyRevenueByCurrency: Record<BillingCurrency, number>;
    annualRevenueByCurrency: Record<BillingCurrency, number>;
  };
  planDistribution: PlanDistribution[];
  recentActivity: ClinicActivity[];
};

export type ClinicsPagination = {
  currentPage: number;
  from: number | null;
  lastPage: number;
  perPage: number;
  to: number | null;
  total: number;
};

export type ClinicsDashboardPageData = ClinicsDashboardData & {
  pagination: ClinicsPagination;
};

export type ClinicsFilters = {
  search: string;
  country: ClinicCountryCode | "all";
  plan: ClinicPlan | "all";
  status: ClinicStatus | "all";
  page: number;
  perPage: number;
};

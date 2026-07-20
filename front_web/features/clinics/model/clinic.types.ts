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
  };
  planDistribution: PlanDistribution[];
  recentActivity: ClinicActivity[];
};

import type { BillingCurrency } from "@/features/platform/model/admin-billing.types";

export type ServiceStatus = "operational" | "degraded" | "unavailable";
export type SystemIncidentSeverity = "minor" | "major" | "critical";
export type SystemIncidentStatus = "investigating" | "identified" | "monitoring" | "resolved";

export type SystemIncident = {
  id: number;
  title: string;
  description: string;
  severity: SystemIncidentSeverity;
  status: SystemIncidentStatus;
  serviceKey: string | null;
  countryCode: string | null;
  createdBy: string | null;
  startedAt: string;
  resolvedAt: string | null;
};

export type SystemService = {
  key: string;
  label: string;
  status: ServiceStatus;
  latencyMs: number;
  detail: string;
};

export type CountryAggregate = {
  countryCode: string;
  clinics: number;
  users: number;
};

export type AdminDashboardData = {
  generatedAt: string;
  revenueCurrency: BillingCurrency;
  kpis: {
    activeClinics: number;
    clinicsAddedThisMonth: number;
    activeUsers: number;
    usersAddedThisMonth: number;
    activePatients: number;
    monthlyRevenueCents: number;
    previousMonthRevenueCents: number;
    monthlyRevenueByCurrency: Record<BillingCurrency, number>;
    previousMonthRevenueByCurrency: Record<BillingCurrency, number>;
    openSupportTickets: number;
    overdueSupportTickets: number;
  };
  revenue: Array<{ month: string; amountCents: number }>;
  revenueByCurrency: Record<BillingCurrency, Array<{ month: string; amountCents: number }>>;
  countries: CountryAggregate[];
  recentClinics: Array<{
    id: number;
    name: string;
    countryCode: string;
    address: string;
    createdAt: string;
  }>;
  recentActivity: Array<{
    id: number;
    module: string;
    action: string;
    resourceLabel: string | null;
    actorName: string | null;
    countryCode: string | null;
    critical: boolean;
    occurredAt: string;
  }>;
  system: SystemService[];
};

export type AdminMonitoringData = {
  generatedAt: string;
  overallStatus: "operational" | "degraded";
  metrics: {
    activeSessions: number;
    pendingJobs: number;
    failedJobs24h: number;
    auditEvents24h: number;
    criticalEvents24h: number;
    authenticationFailures24h: number;
    openSupportTickets: number;
    overdueSupportTickets: number;
    openIncidents: number;
  };
  countries: CountryAggregate[];
  services: SystemService[];
  operationalSignals: Array<{
    id: number;
    module: string;
    action: string;
    resourceLabel: string | null;
    countryCode: string | null;
    occurredAt: string;
  }>;
  incidents: SystemIncident[];
  eventVolume: {
    administrative: number;
    authentication: number;
    critical: number;
    failedAuthentication: number;
  };
};

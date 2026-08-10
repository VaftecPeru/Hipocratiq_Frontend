export type AuditActor = { id: number; name: string | null; email: string | null };
export type AuditClinic = { id: number; name: string | null };

export type AuditEvent = {
  id: string;
  source: "admin" | "authentication";
  actor: AuditActor | null;
  clinic: AuditClinic | null;
  countryCode: string | null;
  module: string;
  action: string;
  outcome: string;
  isCritical: boolean;
  resource: { type: string; id: string | null; label: string | null } | null;
  ipAddress: string | null;
  metadata: Record<string, unknown>;
  occurredAt: string;
};

export type AuditSummary = {
  totals: { events: number; uniqueUsers: number; countries: number; critical: number };
  topModules: Array<{ module: string; count: number; percentage: number }>;
  byCountry: Array<{ countryCode: string; count: number }>;
  criticalEvents: AuditEvent[];
  recentChanges: AuditEvent[];
  generatedAt: string;
};

export type AuditFilters = {
  page?: number;
  perPage?: number;
  search?: string;
  module?: string;
  action?: string;
  countryCode?: string;
  critical?: boolean;
  dateFrom?: string;
  dateTo?: string;
};

export type AuditEventList = {
  events: AuditEvent[];
  summary: AuditSummary;
  options: { modules: string[]; actions: string[]; countries: string[] };
  meta: { currentPage: number; lastPage: number; perPage: number; total: number };
};

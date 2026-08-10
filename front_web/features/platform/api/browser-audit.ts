import { ApiError, getFromApi } from "@/shared/api/http-client";
import type { AuditEvent, AuditEventList, AuditFilters, AuditSummary } from "@/features/platform/model/audit.types";

type ApiEvent = {
  id: string;
  source: "admin" | "authentication";
  actor: { id: number; name: string | null; email: string | null } | null;
  clinic: { id: number; name: string | null } | null;
  country_code: string | null;
  module: string;
  action: string;
  outcome: string;
  is_critical: boolean;
  resource: { type: string; id: string | null; label: string | null } | null;
  ip_address: string | null;
  metadata: Record<string, unknown>;
  occurred_at: string;
};

type ApiSummary = {
  totals: { events: number; unique_users: number; countries: number; critical: number };
  top_modules: Array<{ module: string; count: number; percentage: number }>;
  by_country: Array<{ country_code: string; count: number }>;
  critical_events: ApiEvent[];
  recent_changes: ApiEvent[];
  generated_at: string;
};

type ApiResponse = {
  data: ApiEvent[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
  summary: ApiSummary;
  filter_options: { modules: string[]; actions: string[]; countries: string[] };
};

function mapEvent(event: ApiEvent): AuditEvent {
  return {
    id: event.id,
    source: event.source,
    actor: event.actor,
    clinic: event.clinic,
    countryCode: event.country_code,
    module: event.module,
    action: event.action,
    outcome: event.outcome,
    isCritical: event.is_critical,
    resource: event.resource,
    ipAddress: event.ip_address,
    metadata: event.metadata,
    occurredAt: event.occurred_at,
  };
}

function mapSummary(summary: ApiSummary): AuditSummary {
  return {
    totals: {
      events: summary.totals.events,
      uniqueUsers: summary.totals.unique_users,
      countries: summary.totals.countries,
      critical: summary.totals.critical,
    },
    topModules: summary.top_modules,
    byCountry: summary.by_country.map((item) => ({ countryCode: item.country_code, count: item.count })),
    criticalEvents: summary.critical_events.map(mapEvent),
    recentChanges: summary.recent_changes.map(mapEvent),
    generatedAt: summary.generated_at,
  };
}

function queryString(filters: AuditFilters): string {
  const query = new URLSearchParams({ page: String(filters.page ?? 1), per_page: String(filters.perPage ?? 20) });
  const values: Array<[string, string | number | undefined]> = [
    ["search", filters.search?.trim() || undefined],
    ["module", filters.module],
    ["action", filters.action],
    ["country_code", filters.countryCode],
    ["critical", filters.critical === undefined ? undefined : filters.critical ? 1 : 0],
    ["date_from", filters.dateFrom],
    ["date_to", filters.dateTo],
  ];
  values.forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });
  return query.toString();
}

export async function getAdminAuditEvents(filters: AuditFilters = {}, signal?: AbortSignal): Promise<AuditEventList> {
  const payload = await getFromApi<ApiResponse>(`/api/v1/auth/admin/audit-events?${queryString(filters)}`, { signal });
  if (!Array.isArray(payload.data) || !payload.meta || !payload.summary || !payload.filter_options) {
    throw new ApiError("El servidor devolvió una respuesta de auditoría incompleta.", 502);
  }

  return {
    events: payload.data.map(mapEvent),
    summary: mapSummary(payload.summary),
    options: payload.filter_options,
    meta: {
      currentPage: payload.meta.current_page,
      lastPage: payload.meta.last_page,
      perPage: payload.meta.per_page,
      total: payload.meta.total,
    },
  };
}

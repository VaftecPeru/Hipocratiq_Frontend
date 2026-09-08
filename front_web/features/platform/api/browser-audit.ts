import { ApiError, getFromApi } from "@/shared/api/http-client";
import { parseApiList } from "@/shared/api/parse-api-list";
import type { AuditEvent, AuditEventList, AuditFilters, AuditSummary } from "@/features/platform/model/audit.types";
import { readPlatformDataCache, writePlatformDataCache } from "@/features/platform/model/platform-data-cache";

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
    topModules: parseApiList<typeof summary.top_modules[number]>(summary.top_modules, "audit.summary.top_modules"),
    byCountry: parseApiList<typeof summary.by_country[number]>(summary.by_country, "audit.summary.by_country").map((item) => ({ countryCode: item.country_code, count: item.count })),
    criticalEvents: parseApiList<ApiEvent>(summary.critical_events, "audit.summary.critical_events").map(mapEvent),
    recentChanges: parseApiList<ApiEvent>(summary.recent_changes, "audit.summary.recent_changes").map(mapEvent),
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

export async function getAdminAuditEvents(
  filters: AuditFilters = {},
  signal?: AbortSignal,
  options: { force?: boolean } = {},
): Promise<AuditEventList> {
  const key = queryString(filters);
  if (!options.force) {
    const cached = readPlatformDataCache<AuditEventList>("audit", key);
    if (cached) return cached;
  }

  const payload = await getFromApi<ApiResponse>(`/api/v1/auth/admin/audit-events?${key}`, { signal });
  if (!payload.meta || !payload.summary || !payload.filter_options) {
    throw new ApiError("El servidor devolvió una respuesta de auditoría incompleta.", 502);
  }

  return writePlatformDataCache("audit", key, {
    events: parseApiList<ApiEvent>(payload.data, "audit.data").map(mapEvent),
    summary: mapSummary(payload.summary),
    options: {
      modules: parseApiList<string>(payload.filter_options.modules, "audit.filter_options.modules"),
      actions: parseApiList<string>(payload.filter_options.actions, "audit.filter_options.actions"),
      countries: parseApiList<string>(payload.filter_options.countries, "audit.filter_options.countries"),
    },
    meta: {
      currentPage: payload.meta.current_page,
      lastPage: payload.meta.last_page,
      perPage: payload.meta.per_page,
      total: payload.meta.total,
    },
  });
}

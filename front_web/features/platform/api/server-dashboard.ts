import { cookies } from "next/headers";
import type {
  AdminDashboardData,
  AdminMonitoringData,
  CountryAggregate,
  SystemService,
} from "@/features/platform/model/admin-dashboard.types";
import { serverEnv } from "@/shared/config/server-env";

type LoadResult<T> = { ok: true; data: T } | { ok: false; message: string; status: number };

type ApiService = { key: string; label: string; status: SystemService["status"]; latency_ms: number; detail: string };
type ApiCountry = { country_code: string; clinics: number; users: number };

function mapService(service: ApiService): SystemService {
  return { key: service.key, label: service.label, status: service.status, latencyMs: service.latency_ms, detail: service.detail };
}

function mapCountry(country: ApiCountry): CountryAggregate {
  return { countryCode: country.country_code, clinics: country.clinics, users: country.users };
}

function errorMessage(status: number): string {
  if (status === 401) return "Tu sesión expiró. Inicia sesión nuevamente.";
  if (status === 403) return "Tu cuenta no tiene permisos para consultar la operación global.";
  return "No pudimos cargar los datos operativos desde el servidor.";
}

async function getAdminPayload<T>(path: string): Promise<LoadResult<T>> {
  try {
    const response = await fetch(`${serverEnv.backendUrl}${path}`, {
      cache: "no-store",
      headers: { Accept: "application/json", Cookie: (await cookies()).toString(), Origin: serverEnv.appUrl },
    });

    if (!response.ok) return { ok: false, message: errorMessage(response.status), status: response.status };
    const payload = (await response.json()) as { data?: T };
    if (!payload.data) return { ok: false, message: "El servidor devolvió una respuesta incompleta.", status: 502 };
    return { ok: true, data: payload.data };
  } catch {
    return { ok: false, message: "No pudimos conectar con el backend operativo.", status: 503 };
  }
}

type ApiDashboard = {
  generated_at: string;
  kpis: {
    active_clinics: number;
    clinics_added_this_month: number;
    active_users: number;
    users_added_this_month: number;
    active_patients: number;
    monthly_revenue_cents: number;
    previous_month_revenue_cents: number;
    open_support_tickets: number;
    overdue_support_tickets: number;
  };
  revenue: Array<{ month: string; amount_cents: number }>;
  countries: ApiCountry[];
  recent_clinics: Array<{ id: number; name: string; country_code: string; address: string; created_at: string }>;
  recent_activity: Array<{ id: number; module: string; action: string; resource_label: string | null; actor_name: string | null; country_code: string | null; critical: boolean; occurred_at: string }>;
  system: ApiService[];
};

export async function getAdminDashboard(): Promise<LoadResult<AdminDashboardData>> {
  const result = await getAdminPayload<ApiDashboard>("/api/v1/auth/admin/dashboard");
  if (!result.ok) return result;
  const data = result.data;

  return { ok: true, data: {
    generatedAt: data.generated_at,
    kpis: {
      activeClinics: data.kpis.active_clinics,
      clinicsAddedThisMonth: data.kpis.clinics_added_this_month,
      activeUsers: data.kpis.active_users,
      usersAddedThisMonth: data.kpis.users_added_this_month,
      activePatients: data.kpis.active_patients,
      monthlyRevenueCents: data.kpis.monthly_revenue_cents,
      previousMonthRevenueCents: data.kpis.previous_month_revenue_cents,
      openSupportTickets: data.kpis.open_support_tickets,
      overdueSupportTickets: data.kpis.overdue_support_tickets,
    },
    revenue: data.revenue.map((item) => ({ month: item.month, amountCents: item.amount_cents })),
    countries: data.countries.map(mapCountry),
    recentClinics: data.recent_clinics.map((clinic) => ({ id: clinic.id, name: clinic.name, countryCode: clinic.country_code, address: clinic.address, createdAt: clinic.created_at })),
    recentActivity: data.recent_activity.map((event) => ({ id: event.id, module: event.module, action: event.action, resourceLabel: event.resource_label, actorName: event.actor_name, countryCode: event.country_code, critical: event.critical, occurredAt: event.occurred_at })),
    system: data.system.map(mapService),
  } };
}

type ApiMonitoring = {
  generated_at: string;
  overall_status: AdminMonitoringData["overallStatus"];
  metrics: { active_sessions: number; pending_jobs: number; failed_jobs_24h: number; audit_events_24h: number; critical_events_24h: number; authentication_failures_24h: number; open_support_tickets: number; overdue_support_tickets: number; open_incidents: number };
  countries: ApiCountry[];
  services: ApiService[];
  operational_signals: Array<{ id: number; module: string; action: string; resource_label: string | null; country_code: string | null; occurred_at: string }>;
  incidents: Array<{ id: number; title: string; description: string; severity: "minor" | "major" | "critical"; status: "investigating" | "identified" | "monitoring" | "resolved"; service_key: string | null; country_code: string | null; created_by: string | null; started_at: string; resolved_at: string | null }>;
  event_volume: { administrative: number; authentication: number; critical: number; failed_authentication: number };
};

export async function getAdminMonitoring(): Promise<LoadResult<AdminMonitoringData>> {
  const result = await getAdminPayload<ApiMonitoring>("/api/v1/auth/admin/monitoring");
  if (!result.ok) return result;
  const data = result.data;

  return { ok: true, data: {
    generatedAt: data.generated_at,
    overallStatus: data.overall_status,
    metrics: {
      activeSessions: data.metrics.active_sessions,
      pendingJobs: data.metrics.pending_jobs,
      failedJobs24h: data.metrics.failed_jobs_24h,
      auditEvents24h: data.metrics.audit_events_24h,
      criticalEvents24h: data.metrics.critical_events_24h,
      authenticationFailures24h: data.metrics.authentication_failures_24h,
      openSupportTickets: data.metrics.open_support_tickets,
      overdueSupportTickets: data.metrics.overdue_support_tickets,
      openIncidents: data.metrics.open_incidents,
    },
    countries: data.countries.map(mapCountry),
    services: data.services.map(mapService),
    operationalSignals: data.operational_signals.map((signal) => ({ id: signal.id, module: signal.module, action: signal.action, resourceLabel: signal.resource_label, countryCode: signal.country_code, occurredAt: signal.occurred_at })),
    incidents: data.incidents.map((incident) => ({ id: incident.id, title: incident.title, description: incident.description, severity: incident.severity, status: incident.status, serviceKey: incident.service_key, countryCode: incident.country_code, createdBy: incident.created_by, startedAt: incident.started_at, resolvedAt: incident.resolved_at })),
    eventVolume: { administrative: data.event_volume.administrative, authentication: data.event_volume.authentication, critical: data.event_volume.critical, failedAuthentication: data.event_volume.failed_authentication },
  } };
}

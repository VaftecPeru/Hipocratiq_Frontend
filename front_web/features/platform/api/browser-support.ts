import { ApiError, getFromApi, patchToApi, postToApi } from "@/shared/api/http-client";
import type {
  CreateSupportTicketPayload,
  SupportAgent,
  SupportClinicOption,
  SupportDashboardSummary,
  SupportTicket,
  SupportTicketActivity,
  SupportTicketActivityType,
  SupportTicketCategory,
  SupportTicketFilters,
  SupportTicketList,
  SupportTicketPriority,
  SupportTicketStatus,
  UpdateSupportTicketPayload,
} from "@/features/platform/model/support.types";

type ApiPerson = { id: number; name: string; email: string };
type ApiClinic = { id: number; name: string; country_code: string };

type ApiTicketActivity = {
  id: number;
  ticket_id: string;
  ticket_subject: string | null;
  clinic: ApiClinic | null;
  actor: ApiPerson | null;
  type: SupportTicketActivityType;
  body: string | null;
  from_value: string | null;
  to_value: string | null;
  is_internal: boolean;
  created_at: string;
};

type ApiTicket = {
  id: number;
  ticket_id: string;
  clinic: ApiClinic | null;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  subject: string;
  description: string;
  contact_email: string;
  notify_on_create: boolean;
  requested_by: ApiPerson | null;
  assigned_to: ApiPerson | null;
  due_at: string | null;
  first_responded_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  last_activity_at: string | null;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
  activities?: ApiTicketActivity[];
};

type ApiAgent = ApiPerson & {
  assigned_tickets: number;
  active_tickets: number;
  resolved_tickets: number;
};

type ApiSummary = {
  totals: {
    tickets: number;
    open: number;
    in_progress: number;
    waiting_on_customer: number;
    resolved_today: number;
    overdue: number;
    unassigned: number;
  };
  sla: { compliance_percentage: number; target_percentage: number; evaluated_tickets: number };
  by_priority: Array<{ key: SupportTicketPriority; count: number; percentage: number }>;
  by_category: Array<{ key: SupportTicketCategory; count: number; percentage: number }>;
  by_country: Array<{ country_code: string; total: number; open: number; overdue: number }>;
  agents: ApiAgent[];
  escalations: ApiTicket[];
  recent_activity: ApiTicketActivity[];
  generated_at: string;
};

type ApiTicketList = {
  data: ApiTicket[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
  summary: ApiSummary;
  filter_options: {
    clinics: ApiClinic[];
    agents: ApiPerson[];
    countries: string[];
  };
};

function mapClinic(clinic: ApiClinic | null): SupportClinicOption | null {
  return clinic ? { id: clinic.id, name: clinic.name, countryCode: clinic.country_code } : null;
}

function mapActivity(activity: ApiTicketActivity): SupportTicketActivity {
  return {
    id: activity.id,
    ticketId: activity.ticket_id,
    ticketSubject: activity.ticket_subject,
    clinic: mapClinic(activity.clinic),
    actor: activity.actor,
    type: activity.type,
    body: activity.body,
    fromValue: activity.from_value,
    toValue: activity.to_value,
    isInternal: activity.is_internal,
    createdAt: activity.created_at,
  };
}

function mapTicket(ticket: ApiTicket): SupportTicket {
  return {
    id: ticket.id,
    ticketId: ticket.ticket_id,
    clinic: mapClinic(ticket.clinic),
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    subject: ticket.subject,
    description: ticket.description,
    contactEmail: ticket.contact_email,
    notifyOnCreate: ticket.notify_on_create,
    requestedBy: ticket.requested_by,
    assignedTo: ticket.assigned_to,
    dueAt: ticket.due_at,
    firstRespondedAt: ticket.first_responded_at,
    resolvedAt: ticket.resolved_at,
    closedAt: ticket.closed_at,
    lastActivityAt: ticket.last_activity_at,
    isOverdue: ticket.is_overdue,
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at,
    activities: ticket.activities?.map(mapActivity),
  };
}

function mapAgent(agent: ApiAgent): SupportAgent {
  return {
    id: agent.id,
    name: agent.name,
    email: agent.email,
    assignedTickets: agent.assigned_tickets,
    activeTickets: agent.active_tickets,
    resolvedTickets: agent.resolved_tickets,
  };
}

function mapSummary(summary: ApiSummary): SupportDashboardSummary {
  return {
    totals: {
      tickets: summary.totals.tickets,
      open: summary.totals.open,
      inProgress: summary.totals.in_progress,
      waitingOnCustomer: summary.totals.waiting_on_customer,
      resolvedToday: summary.totals.resolved_today,
      overdue: summary.totals.overdue,
      unassigned: summary.totals.unassigned,
    },
    sla: {
      compliancePercentage: summary.sla.compliance_percentage,
      targetPercentage: summary.sla.target_percentage,
      evaluatedTickets: summary.sla.evaluated_tickets,
    },
    byPriority: summary.by_priority,
    byCategory: summary.by_category,
    byCountry: summary.by_country.map((item) => ({
      countryCode: item.country_code,
      total: item.total,
      open: item.open,
      overdue: item.overdue,
    })),
    agents: summary.agents.map(mapAgent),
    escalations: summary.escalations.map(mapTicket),
    recentActivity: summary.recent_activity.map(mapActivity),
    generatedAt: summary.generated_at,
  };
}

function toSnake(payload: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(payload).map(([key, value]) => [
    key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
    value,
  ]));
}

function queryString(filters: SupportTicketFilters): string {
  const query = new URLSearchParams({
    page: String(filters.page ?? 1),
    per_page: String(filters.perPage ?? 20),
  });
  const values: Array<[string, string | number | boolean | undefined]> = [
    ["search", filters.search?.trim() || undefined],
    ["clinic_id", filters.clinicId],
    ["country_code", filters.countryCode],
    ["category", filters.category],
    ["priority", filters.priority],
    ["status", filters.status],
    ["assigned_to_user_id", filters.assignedToUserId],
    ["overdue", filters.overdue ? 1 : undefined],
  ];
  values.forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });
  return query.toString();
}

export async function getAdminSupportTickets(
  filters: SupportTicketFilters = {},
  signal?: AbortSignal,
): Promise<SupportTicketList> {
  const payload = await getFromApi<ApiTicketList>(
    `/api/v1/auth/admin/support-tickets?${queryString(filters)}`,
    { signal },
  );

  if (!Array.isArray(payload.data) || !payload.meta || !payload.summary || !payload.filter_options) {
    throw new ApiError("El servidor devolvió una respuesta de soporte incompleta.", 502);
  }

  return {
    tickets: payload.data.map(mapTicket),
    clinics: payload.filter_options.clinics.map(mapClinic).filter((clinic): clinic is SupportClinicOption => clinic !== null),
    agents: payload.summary.agents.map(mapAgent),
    countries: payload.filter_options.countries,
    summary: mapSummary(payload.summary),
    meta: {
      currentPage: payload.meta.current_page,
      lastPage: payload.meta.last_page,
      perPage: payload.meta.per_page,
      total: payload.meta.total,
    },
  };
}

export async function getAdminSupportTicket(ticketId: number, signal?: AbortSignal): Promise<SupportTicket> {
  const response = await getFromApi<{ data: ApiTicket }>(`/api/v1/auth/admin/support-tickets/${ticketId}`, { signal });
  return mapTicket(response.data);
}

export async function createAdminSupportTicket(payload: CreateSupportTicketPayload): Promise<SupportTicket> {
  const response = await postToApi<{ data: ApiTicket }>("/api/v1/auth/admin/support-tickets", toSnake(payload));
  if (!response.data?.ticket_id) throw new ApiError("El servidor no devolvió el Ticket ID creado.", 502);
  return mapTicket(response.data);
}

export async function updateAdminSupportTicket(ticketId: number, payload: UpdateSupportTicketPayload): Promise<SupportTicket> {
  const response = await patchToApi<{ data: ApiTicket }>(
    `/api/v1/auth/admin/support-tickets/${ticketId}`,
    toSnake(payload),
  );
  return mapTicket(response.data);
}

export async function addAdminSupportTicketComment(
  ticketId: number,
  body: string,
  isInternal = true,
): Promise<SupportTicketActivity> {
  const response = await postToApi<{ data: ApiTicketActivity }>(
    `/api/v1/auth/admin/support-tickets/${ticketId}/comments`,
    { body, is_internal: isInternal },
  );
  return mapActivity(response.data);
}

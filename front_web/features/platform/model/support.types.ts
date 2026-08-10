export type SupportTicketCategory = "technical" | "billing" | "functionality" | "general";

export type SupportTicketPriority = "low" | "normal" | "high" | "urgent";

export type SupportTicketStatus = "open" | "in_progress" | "waiting_on_customer" | "resolved" | "closed";

export type SupportClinicOption = {
  id: number;
  name: string;
  countryCode: string;
};

export type SupportTicket = {
  id: number;
  ticketId: string;
  clinic: SupportClinicOption | null;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  subject: string;
  description: string;
  contactEmail: string;
  notifyOnCreate: boolean;
  requestedBy: { id: number; name: string; email: string } | null;
  assignedTo: { id: number; name: string; email: string } | null;
  dueAt: string | null;
  firstRespondedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  lastActivityAt: string | null;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
  activities?: SupportTicketActivity[];
};

export type SupportTicketActivityType =
  | "created"
  | "comment"
  | "status_changed"
  | "priority_changed"
  | "assignment_changed";

export type SupportTicketActivity = {
  id: number;
  ticketId: string;
  ticketSubject: string | null;
  clinic: SupportClinicOption | null;
  actor: { id: number; name: string; email: string } | null;
  type: SupportTicketActivityType;
  body: string | null;
  fromValue: string | null;
  toValue: string | null;
  isInternal: boolean;
  createdAt: string;
};

export type SupportAgent = {
  id: number;
  name: string;
  email: string;
  assignedTickets: number;
  activeTickets: number;
  resolvedTickets: number;
};

export type SupportDashboardSummary = {
  totals: {
    tickets: number;
    open: number;
    inProgress: number;
    waitingOnCustomer: number;
    resolvedToday: number;
    overdue: number;
    unassigned: number;
  };
  sla: {
    compliancePercentage: number;
    targetPercentage: number;
    evaluatedTickets: number;
  };
  byPriority: Array<{ key: SupportTicketPriority; count: number; percentage: number }>;
  byCategory: Array<{ key: SupportTicketCategory; count: number; percentage: number }>;
  byCountry: Array<{ countryCode: string; total: number; open: number; overdue: number }>;
  agents: SupportAgent[];
  escalations: SupportTicket[];
  recentActivity: SupportTicketActivity[];
  generatedAt: string;
};

export type CreateSupportTicketPayload = {
  clinicId: number;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  subject: string;
  description: string;
  contactEmail: string;
  notifyOnCreate: boolean;
  assignToSelf: boolean;
};

export type SupportTicketList = {
  tickets: SupportTicket[];
  clinics: SupportClinicOption[];
  agents: SupportAgent[];
  countries: string[];
  summary: SupportDashboardSummary;
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
};

export type SupportTicketFilters = {
  page?: number;
  perPage?: number;
  search?: string;
  clinicId?: number;
  countryCode?: string;
  category?: SupportTicketCategory;
  priority?: SupportTicketPriority;
  status?: SupportTicketStatus;
  assignedToUserId?: number;
  overdue?: boolean;
};

export type UpdateSupportTicketPayload = {
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  assignedToUserId?: number | null;
};

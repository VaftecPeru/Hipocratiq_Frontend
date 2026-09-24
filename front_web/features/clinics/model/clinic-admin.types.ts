import type { CountryCode } from "@/shared/ui/country-flag";

export type ClinicMemberRole = "clinic_admin" | "receptionist" | "doctor";

export type ClinicEmergencyPolicy = {
  enabled: boolean;
  visibility: "reception_doctors_admins" | "doctors_admins" | "admins_only";
  label: string;
  color: "#EF2F3F" | "#F97316" | "#7C3AED";
  inheritance: "workflow_and_responsibles" | "responsibles_only" | "locked";
  defaultChannel: "priority_push" | "internal_alert" | "email" | "sms";
  escalationMinutes: 1 | 3 | 5 | 10;
  responsibles: Array<{ role: string; channel: string }>;
};

export type ClinicEmergencyGlobalOverride = {
  scope: "all";
  force: boolean;
  note: string | null;
  publishedAt: string | null;
  publishedBy: { id: number | null; name: string | null; email: string | null } | null;
  policy: ClinicEmergencyPolicy;
  responsibles: Array<{ role: string; channel: string }>;
};

export type ClinicEmergencyState = {
  local: ClinicEmergencyPolicy;
  effective: ClinicEmergencyPolicy;
  isOverridden: boolean;
  globalOverride: ClinicEmergencyGlobalOverride | null;
};

export type ClinicPreferences = {
  maintenance: boolean;
  audit: boolean;
  signatures: boolean;
  backups: boolean;
  emergency: ClinicEmergencyPolicy;
};

export type ClinicAdminInfo = {
  id: number;
  name: string;
  countryCode: CountryCode;
  contactPhone: string;
  address: string;
  status: "active" | "suspended";
  preferences: ClinicPreferences;
  emergency: ClinicEmergencyState;
};

export type ClinicTeamMember = {
  id: number;
  name: string;
  email: string | null;
  phoneNumber: string;
  countryCode: CountryCode | null;
  status: "pending_verification" | "active" | "suspended" | "disabled";
  role: ClinicMemberRole;
  roleName: string;
  specialty: string | null;
  medicalLicense: string | null;
  lastLoginAt: string | null;
};

export type ClinicPatientTriagePriority = "routine" | "urgent" | "emergency";

export type ClinicPatientTriage = {
  temperatureC: number | null;
  systolicBp: number | null;
  diastolicBp: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  oxygenSaturation: number | null;
  priority: ClinicPatientTriagePriority | null;
  notes: string | null;
  recordedAt: string | null;
  registrarName: string | null;
};

export type ClinicPatientAppointment = {
  id: number;
  scheduledAt: string;
  appointmentType: string;
  status: ClinicAppointmentStatus;
  statusLabel: string;
  doctor: { id: number; name: string; specialty: string | null } | null;
};

export type ClinicPatient = {
  id: number;
  patientCode: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  insurance: string | null;
  isReturningPatient: boolean;
  whatsappConsent: boolean;
  status: "pending_verification" | "active" | "suspended" | "disabled" | null;
  createdAt: string | null;
  age: number | null;
  lastAppointment: ClinicPatientAppointment | null;
  nextAppointment: ClinicPatientAppointment | null;
  triage?: ClinicPatientTriage | null;
};

export type ClinicPatientProfile = {
  documentType: string | null;
  documentNumber: string | null;
  dateOfBirth: string | null;
  sex: string | null;
  address: string | null;
  emergencyContact: string | null;
  insurance: string | null;
  isReturningPatient: boolean;
  whatsappConsent: boolean;
  countryCode: string | null;
};

export type ClinicPatientIntakeSummary = {
  reasonCategory: string | null;
  requestedDoctor: { id: number; name: string; specialty: string | null } | null;
  specialty: string | null;
  triage: {
    temperatureC: number | null;
    systolicBp: number | null;
    diastolicBp: number | null;
    heartRate: number | null;
    respiratoryRate: number | null;
    oxygenSaturation: number | null;
    priority: ClinicPatientTriagePriority | null;
    recordedAt: string | null;
  } | null;
};

export type ClinicPatientDetail = {
  patient: ClinicPatient;
  profile: ClinicPatientProfile;
  intake: ClinicPatientIntakeSummary | null;
  recentAppointments: ClinicPatientAppointment[];
  nextAppointment: ClinicPatientAppointment | null;
};

export type ClinicAppointmentStatus =
  | "pending"
  | "confirmed"
  | "waiting"
  | "in_consultation"
  | "completed"
  | "canceled"
  | "no_show";

export type ClinicAppointment = {
  id: number;
  scheduledAt: string;
  scheduledDate: string;
  time: string;
  appointmentType: string;
  status: ClinicAppointmentStatus;
  statusLabel: string;
  notes: string | null;
  patient: {
    id: number;
    patientCode: string;
    name: string | null;
    phoneNumber: string | null;
  };
  doctor: {
    id: number;
    name: string;
    specialty: string | null;
  } | null;
};

export type ClinicAppointmentSummary = {
  todayTotal: number;
  periodTotal?: number;
  confirmed: number;
  pending: number;
  waiting: number;
  inConsultation: number;
  noShow: number;
  canceled: number;
};

export type ClinicDashboardData = {
  clinic: ClinicAdminInfo;
  subscription: {
    plan: string | null;
    status: string | null;
    billingCycle: string | null;
  };
  metrics: {
    staffTotal: number;
    doctorsTotal: number;
    receptionistsTotal: number;
    patientsTotal: number;
  };
  appointmentSummary: ClinicAppointmentSummary;
  todayAppointments: ClinicAppointment[];
  team: ClinicTeamMember[];
  recentPatients: ClinicPatient[];
};

export type ClinicInvoiceStatus = "issued" | "partially_paid" | "paid" | "voided";

export type ClinicPaymentMethod = "cash" | "card" | "bank_transfer" | "other";

export type ClinicInvoiceItem = {
  id: number;
  description: string;
  quantity: number;
  unitAmountMinor: number;
  lineTotalMinor: number;
};

export type ClinicInvoicePayment = {
  id: number;
  amountMinor: number;
  currency: string;
  status: "confirmed" | "voided";
  paymentMethod: ClinicPaymentMethod;
  reference: string | null;
  note: string | null;
  paidAt: string | null;
  recordedByUserId: number | null;
  recordedByName: string | null;
};

export type ClinicInvoice = {
  id: number;
  invoiceNumber: string;
  patient: {
    id: number | null;
    name: string | null;
    email: string | null;
    phoneNumber: string | null;
  };
  issueDate: string | null;
  dueDate: string | null;
  currency: string;
  totalMinor: number;
  paidMinor: number;
  outstandingMinor: number;
  status: ClinicInvoiceStatus;
  createdAt: string | null;
  items?: ClinicInvoiceItem[];
  payments?: ClinicInvoicePayment[];
};

export type ClinicInvoicesPage = {
  invoices: ClinicInvoice[];
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
};

export type ClinicBillingCurrencySummary = {
  currency: string;
  invoiceCount: number;
  invoicedMinor: number;
  outstandingMinor: number;
  paymentCount: number;
  paidMinor: number;
};

export type ClinicBillingReport = {
  clinicId: number;
  period: { from: string; to: string };
  byCurrency: Record<string, ClinicBillingCurrencySummary>;
};

export type ClinicSubscription = {
  id: number;
  status: "active" | "past_due" | "canceled" | "expired";
  billingCycle: "monthly" | "annual";
  autoRenew: boolean;
  startsAt: string | null;
  endsAt: string | null;
  provider: string | null;
  plan: {
    id: number;
    key: string;
    name: string;
    description: string | null;
    currency: string;
    monthlyPriceCents: number;
    annualPriceCents: number;
    features: string[];
  } | null;
  usage: {
    patients: { used: number; limit: number | null };
    users: { used: number; limit: number | null };
    storage: { used: number | null; limit: number | null };
  };
};

export type ClinicReceptionistPreferences = {
  newAppointments: boolean;
  arrivals: boolean;
  pendingPayments: boolean;
  internalMessages: boolean;
  documents: boolean;
  onlineReception: boolean;
  whatsapp: boolean;
  autoPrint: boolean;
  duplicateTickets: boolean;
  shiftName: string | null;
  shiftStart: string | null;
  shiftEnd: string | null;
  counterName: string | null;
  printerName: string | null;
  paperSize: "A4" | "letter" | null;
};

export type ClinicReceptionistSettings = {
  profile: { id: number; name: string; email: string | null; phoneNumber: string; role: "receptionist" };
  clinic: { id: number; name: string };
  settings: { persisted: boolean; updatedAt: string | null; preferences: ClinicReceptionistPreferences };
  operation: {
    twoFactor: { status: "not_configured"; message: string };
    cashRegister: { status: "not_configured"; message: string };
  };
  metrics: {
    appointmentsToday: number;
    appointmentsYesterday: number;
    appointmentsChangePercent: number | null;
    unreadMessages: number;
    pendingPayments: number;
    cashRegister: { status: "not_configured"; openedAt: string | null };
  };
};

export type ClinicMessageContact = {
  userId: number;
  kind: "patient" | "team";
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  patientProfileId: number | null;
  role: string | null;
  roleName: string | null;
  specialty: string | null;
  status: "pending_verification" | "active" | "suspended" | "disabled" | null;
  unread: number;
  lastMessage: { body: string; createdAt: string | null } | null;
};

export type ClinicMessage = {
  id: number;
  patientProfileId: number | null;
  sender: { id: number; name: string } | null;
  recipient: { id: number; name: string } | null;
  body: string;
  isReceived: boolean;
  readAt: string | null;
  createdAt: string | null;
};

export type ClinicMessagesData = {
  contacts: ClinicMessageContact[];
  selectedContactId: number | null;
  messages: ClinicMessage[];
  unread: number;
};

export type ClinicEpidemiologyData = {
  generatedAt: string;
  period: { from: string; to: string; days: number };
  analysisAvailable: boolean;
  message: string;
  metrics: {
    monitoredPatients: number;
    activeAlerts: number;
    highRiskCases: number;
    trend: "not_configured" | "stable" | "rising" | "falling" | "mixed";
    appointments: number;
    consultations: number;
    laboratoryOrders: number;
    teleconsultations: number;
    prescriptions: number;
  };
  trend: Array<{ month: string; label: string; appointments: number; consultations: number; laboratoryOrders: number }>;
  forecasts: Array<Record<string, string | number>>;
  alerts: Array<{ title?: string; detail?: string; severity?: "info" | "warning" | "critical" }>;
  recommendations: string[];
  map: { status: "not_configured"; message: string };
  sources: Record<string, { status: "available" | "no_data"; label: string; count: number }>;
};

export type ClinicPatientsPage = {
  patients: ClinicPatient[];
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
};

export type ClinicScheduleBlock = {
  id: number;
  startsAt: string;
  endsAt: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  reason: string | null;
  scope: "clinic" | "doctor";

  doctor: {
    id: number;
    name: string;
  } | null;

  createdBy: {
    id: number;
    name: string;
  };
};

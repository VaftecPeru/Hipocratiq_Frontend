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

export type ClinicPatientsPage = {
  patients: ClinicPatient[];
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
};

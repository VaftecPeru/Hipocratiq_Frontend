import type { CountryCode } from "@/shared/ui/country-flag";

export type ClinicMemberRole = "clinic_admin" | "receptionist" | "doctor";

export type ClinicAdminInfo = {
  id: number;
  name: string;
  countryCode: CountryCode;
  contactPhone: string;
  address: string;
  status: "active" | "suspended";
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

export type ClinicPatient = {
  id: number;
  patientCode: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  status: "pending_verification" | "active" | "suspended" | "disabled" | null;
  createdAt: string | null;
  triage?: ClinicPatientTriage | null;
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

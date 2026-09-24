import type { CountryCode } from "@/shared/ui/country-flag";

export type AdminUserRole = "super_admin" | "clinic_admin" | "receptionist" | "doctor" | "patient" | "unassigned";
export type AdminAssignableRole = Exclude<AdminUserRole, "unassigned">;
export type AdminUserRoleLabel = "Superadministrador" | "Administrador de Clínica" | "Recepcionista" | "Médico" | "Paciente" | "Sin rol";
export type AdminUserStatus = "pending_verification" | "active" | "suspended" | "disabled";

export type ProfessionalCredentialStatus = "unverified" | "verified" | "rejected" | "not_applicable";

export type AdminProfessionalCredential = {
  doctorProfileId: number;
  medicalLicense: string;
  countryCode: string | null;
  issuer: string | null;
  verificationStatus: ProfessionalCredentialStatus;
  verifiedAt: string | null;
  verificationReference: string | null;
  specialtyLicense: string | null;
  specialtyVerificationStatus: ProfessionalCredentialStatus;
  specialtyVerifiedAt: string | null;
  specialtyVerificationReference: string | null;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string | null;
  phoneNumber: string;
  countryCode: CountryCode;
  role: AdminUserRole;
  assignableRoles: AdminAssignableRole[];
  clinic: { id: number; name: string; address: string } | null;
  professionalCredential: AdminProfessionalCredential | null;
  lastAccess: string;
  status: AdminUserStatus;
  createdAt: string;
};

export type AdminUserDistribution = {
  key: string;
  count: number;
  percentage: number;
};

export type AdminUsersDashboardData = {
  users: AdminUser[];
  totals: {
    users: number;
    activeUsers: number;
    administrators: number;
    receptionists: number;
    doctors: number;
    patients: number;
  };
  roleDistribution: AdminUserDistribution[];
  countryDistribution: AdminUserDistribution[];
  recentActivity: Array<{
    id: number;
    title: string;
    detail: string;
    role: AdminUserRole;
    occurredAt: string;
  }>;
  clinics: Array<{ id: number; name: string; countryCode: CountryCode; status: "active" | "suspended" }>;
  pagination: {
    currentPage: number;
    from: number | null;
    lastPage: number;
    perPage: number;
    to: number | null;
    total: number;
  };
};

export type AdminUsersFilters = {
  search: string;
  country: CountryCode | "all";
  clinic: number | "all";
  role: AdminUserRole | "all";
  status: AdminUserStatus | "all";
  page: number;
};

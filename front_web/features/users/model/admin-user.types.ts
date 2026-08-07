import type { CountryCode } from "@/shared/ui/country-flag";

export type AdminUserRole = "super_admin" | "clinic_admin" | "doctor" | "patient" | "unassigned";
export type AdminUserRoleLabel = "Superadministrador" | "Administrador de Clínica" | "Médico" | "Paciente" | "Sin rol";
export type AdminUserStatus = "pending_verification" | "active" | "suspended" | "disabled";

export type AdminUser = {
  id: number;
  name: string;
  email: string | null;
  phoneNumber: string;
  countryCode: CountryCode;
  role: AdminUserRole;
  clinic: { id: number; name: string; address: string } | null;
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
  clinics: Array<{ id: number; name: string }>;
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

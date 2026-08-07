import { ApiError, getFromApi } from "@/shared/api/http-client";
import type {
  AdminUser,
  AdminUserRole,
  AdminUsersDashboardData,
  AdminUsersFilters,
  AdminUserStatus,
} from "@/features/users/model/admin-user.types";
import type { CountryCode } from "@/shared/ui/country-flag";

type ApiUser = {
  id: number;
  name: string;
  email: string | null;
  phone_number: string;
  country_code: CountryCode;
  role: AdminUserRole;
  clinic: { id: number; name: string; address: string } | null;
  last_login_at: string | null;
  status: AdminUserStatus;
  created_at: string;
};

type ApiAdminUsersResponse = {
  data: ApiUser[];
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
  summary: {
    totals: {
      users: number;
      active_users: number;
      administrators: number;
      doctors: number;
      patients: number;
    };
    role_distribution: Array<{ role: AdminUserRole; count: number; percentage: number }>;
    country_distribution: Array<{ country_code: CountryCode; count: number; percentage: number }>;
    recent_activity: Array<{
      id: number;
      title: string;
      detail: string;
      role: AdminUserRole;
      occurred_at: string;
    }>;
  };
  filter_options: { clinics: Array<{ id: number; name: string }> };
};

const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(value: string | null, includeTime = false): string {
  if (!value) return "Nunca";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return (includeTime ? dateTimeFormatter : dateFormatter).format(date);
}

function mapUser(user: ApiUser): AdminUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phone_number,
    countryCode: user.country_code,
    role: user.role,
    clinic: user.clinic,
    lastAccess: formatDate(user.last_login_at, true),
    status: user.status,
    createdAt: formatDate(user.created_at),
  };
}

export async function getAdminUsers(
  filters: AdminUsersFilters,
  signal?: AbortSignal,
): Promise<AdminUsersDashboardData> {
  const query = new URLSearchParams({ per_page: "10", page: String(filters.page) });

  if (filters.search.trim()) query.set("search", filters.search.trim());
  if (filters.country !== "all") query.set("country_code", filters.country);
  if (filters.clinic !== "all") query.set("clinic_id", String(filters.clinic));
  if (filters.role !== "all") query.set("role", filters.role);
  if (filters.status !== "all") query.set("status", filters.status);

  const payload = await getFromApi<ApiAdminUsersResponse>(
    `/api/v1/auth/admin/users?${query.toString()}`,
    { signal },
  );

  if (
    !Array.isArray(payload.data) ||
    !payload.meta ||
    !payload.summary ||
    !Array.isArray(payload.summary.role_distribution) ||
    !Array.isArray(payload.summary.country_distribution) ||
    !Array.isArray(payload.summary.recent_activity) ||
    !Array.isArray(payload.filter_options?.clinics)
  ) {
    throw new ApiError("El servidor devolvió una respuesta de usuarios incompleta.", 502);
  }

  return {
    users: payload.data.map(mapUser),
    totals: {
      users: payload.summary.totals.users,
      activeUsers: payload.summary.totals.active_users,
      administrators: payload.summary.totals.administrators,
      doctors: payload.summary.totals.doctors,
      patients: payload.summary.totals.patients,
    },
    roleDistribution: payload.summary.role_distribution.map((item) => ({
      key: item.role,
      count: item.count,
      percentage: item.percentage,
    })),
    countryDistribution: payload.summary.country_distribution.map((item) => ({
      key: item.country_code,
      count: item.count,
      percentage: item.percentage,
    })),
    recentActivity: payload.summary.recent_activity.map((item) => ({
      id: item.id,
      title: item.title,
      detail: item.detail,
      role: item.role,
      occurredAt: formatDate(item.occurred_at, true),
    })),
    clinics: payload.filter_options.clinics,
    pagination: {
      currentPage: payload.meta.current_page,
      from: payload.meta.from,
      lastPage: payload.meta.last_page,
      perPage: payload.meta.per_page,
      to: payload.meta.to,
      total: payload.meta.total,
    },
  };
}

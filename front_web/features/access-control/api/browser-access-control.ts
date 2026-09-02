import { ApiError, getFromApi, patchToApi } from "@/shared/api/http-client";
import { parseApiList } from "@/shared/api/parse-api-list";
import type {
  AccessControlData,
  AccessClinic,
  AccessPermission,
  AccessRoleDefinition,
  UpdateUserAccessPayload,
} from "@/features/access-control/model/access-control.types";
import type { AdminAssignableRole } from "@/features/users/model/admin-user.types";
import type { CountryCode } from "@/shared/ui/country-flag";

type ApiAccessControlResponse = {
  data: {
    actor_user_id: number;
    enforcement: "catalog_gate";
    roles: Array<{
      key: AdminAssignableRole;
      name: string;
      scope: "global" | "organization";
      description: string;
      permissions: string[];
      user_count: number;
    }>;
    permissions: AccessPermission[];
    clinics: Array<{
      id: number;
      name: string;
      country_code: CountryCode;
      status: "active" | "suspended";
    }>;
    summary: {
      total_users: number;
      active_clinics: number;
      unassigned_users: number;
    };
    recent_changes: Array<{
      id: number;
      actor_name: string;
      resource_id: string | null;
      resource_label: string | null;
      metadata: {
        before?: { role?: string | null };
        after?: { role?: string | null };
      } | null;
      occurred_at: string;
    }>;
  };
};

const dateTimeFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date);
}

export async function getAccessControl(signal?: AbortSignal): Promise<AccessControlData> {
  const payload = await getFromApi<ApiAccessControlResponse>(
    "/api/v1/auth/admin/access-control",
    { signal },
  );

  if (
    !payload.data ||
    !payload.data.summary
  ) {
    throw new ApiError("El servidor devolvió una configuración de acceso incompleta.", 502);
  }

  const roles: AccessRoleDefinition[] = parseApiList<typeof payload.data.roles[number]>(payload.data.roles, "access_control.roles").map((role) => ({
    key: role.key,
    name: role.name,
    scope: role.scope,
    description: role.description,
    permissions: role.permissions,
    userCount: role.user_count,
  }));
  const clinics: AccessClinic[] = parseApiList<typeof payload.data.clinics[number]>(payload.data.clinics, "access_control.clinics").map((clinic) => ({
    id: clinic.id,
    name: clinic.name,
    countryCode: clinic.country_code,
    status: clinic.status,
  }));

  return {
    actorUserId: payload.data.actor_user_id,
    enforcement: payload.data.enforcement,
    roles,
    permissions: parseApiList<AccessPermission>(payload.data.permissions, "access_control.permissions"),
    clinics,
    summary: {
      totalUsers: payload.data.summary.total_users,
      activeClinics: payload.data.summary.active_clinics,
      unassignedUsers: payload.data.summary.unassigned_users,
    },
    recentChanges: parseApiList<typeof payload.data.recent_changes[number]>(payload.data.recent_changes, "access_control.recent_changes").map((change) => ({
      id: change.id,
      actorName: change.actor_name,
      resourceId: change.resource_id ? Number(change.resource_id) : null,
      resourceLabel: change.resource_label,
      beforeRole: change.metadata?.before?.role ?? null,
      afterRole: change.metadata?.after?.role ?? null,
      occurredAt: formatDateTime(change.occurred_at),
    })),
  };
}

export async function updateUserAccess(
  userId: number,
  payload: UpdateUserAccessPayload,
): Promise<void> {
  await patchToApi(`/api/v1/auth/admin/users/${userId}/access`, {
    role: payload.role,
    clinic_id: payload.role === "super_admin" ? null : payload.clinicId,
  });
}

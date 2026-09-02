import type { CountryCode } from "@/shared/ui/country-flag";
import type { AdminAssignableRole } from "@/features/users/model/admin-user.types";

export type AccessScope = "global" | "organization";
export type AccessClinicStatus = "active" | "suspended";

export type AccessRoleDefinition = {
  key: AdminAssignableRole;
  name: string;
  scope: AccessScope;
  description: string;
  permissions: string[];
  userCount: number;
};

export type AccessPermission = {
  key: string;
  label: string;
  group: string;
};

export type AccessClinic = {
  id: number;
  name: string;
  countryCode: CountryCode;
  status: AccessClinicStatus;
};

export type AccessChange = {
  id: number;
  actorName: string;
  resourceId: number | null;
  resourceLabel: string | null;
  beforeRole: string | null;
  afterRole: string | null;
  occurredAt: string;
};

export type AccessControlData = {
  actorUserId: number;
  enforcement: "catalog_gate";
  roles: AccessRoleDefinition[];
  permissions: AccessPermission[];
  clinics: AccessClinic[];
  summary: {
    totalUsers: number;
    activeClinics: number;
    unassignedUsers: number;
  };
  recentChanges: AccessChange[];
};

export type UpdateUserAccessPayload = {
  role: AdminAssignableRole;
  clinicId: number | null;
};

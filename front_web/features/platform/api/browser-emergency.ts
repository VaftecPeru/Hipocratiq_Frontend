import { ApiError, getFromApi, patchToApi, postToApi } from "@/shared/api/http-client";
import type { EmergencyPolicy, EmergencyPolicyData, EmergencyPublication } from "@/features/platform/model/emergency.types";
import { invalidatePlatformData, readPlatformDataCache, writePlatformDataCache } from "@/features/platform/model/platform-data-cache";
import { notifySuperadminNavigationMutation } from "@/features/platform/model/superadmin-navigation-invalidation";

type ApiEmergency = {
  policy: { enabled: boolean; visibility: EmergencyPolicy["visibility"]; label: string; color: EmergencyPolicy["color"]; inheritance: EmergencyPolicy["inheritance"]; default_channel: EmergencyPolicy["defaultChannel"]; escalation_minutes: EmergencyPolicy["escalationMinutes"] };
  responsibles: Array<{ role: string; channel: string }>;
  published_at: string | null;
  publication: {
    scope: "all";
    force: boolean;
    note: string | null;
    published_at: string | null;
    published_by: { id: number | null; name: string | null; email: string | null } | null;
    policy: ApiEmergency["policy"];
    responsibles: Array<{ role: string; channel: string }>;
  } | null;
  stats: { active_clinics: number; enabled_clinics: number; policy_changes_today: number };
};

type ApiEmergencyResponse = { data: ApiEmergency };

function mapPublication(publication: ApiEmergency["publication"]): EmergencyPublication | null {
  if (!publication) return null;

  return {
    scope: "all",
    force: publication.force,
    note: publication.note,
    publishedAt: publication.published_at,
    publishedBy: publication.published_by,
    policy: mapPolicy(publication.policy),
    responsibles: publication.responsibles,
  };
}

function mapPolicy(policy: ApiEmergency["policy"]): EmergencyPolicy {
  return {
    enabled: policy.enabled,
    visibility: policy.visibility,
    label: policy.label,
    color: policy.color,
    inheritance: policy.inheritance,
    defaultChannel: policy.default_channel,
    escalationMinutes: policy.escalation_minutes,
  };
}

export function mapEmergency(data: ApiEmergency): EmergencyPolicyData {
  return { policy: mapPolicy(data.policy), responsibles: data.responsibles, publishedAt: data.published_at, publication: mapPublication(data.publication), stats: { activeClinics: data.stats.active_clinics, enabledClinics: data.stats.enabled_clinics, policyChangesToday: data.stats.policy_changes_today } };
}

export async function getEmergencyPolicy(signal?: AbortSignal, options: { force?: boolean } = {}): Promise<EmergencyPolicyData> {
  if (!options.force) {
    const cached = readPlatformDataCache<EmergencyPolicyData>("emergency", "global");
    if (cached) return cached;
  }

  const response = await getFromApi<ApiEmergencyResponse>("/api/v1/auth/admin/emergency", { signal });
  if (!response.data) throw new ApiError("El servidor devolvió una política de emergencia incompleta.", 502);
  return writePlatformDataCache("emergency", "global", mapEmergency(response.data));
}

export async function updateEmergencyPolicy(policy: EmergencyPolicy, responsibles: EmergencyPolicyData["responsibles"]): Promise<EmergencyPolicyData> {
  const response = await patchToApi<ApiEmergencyResponse>("/api/v1/auth/admin/emergency", { enabled: policy.enabled, visibility: policy.visibility, label: policy.label, color: policy.color, inheritance: policy.inheritance, default_channel: policy.defaultChannel, escalation_minutes: policy.escalationMinutes, responsibles });
  const updated = mapEmergency(response.data);
  writePlatformDataCache("emergency", "global", updated);
  invalidatePlatformData(["audit"]);
  notifySuperadminNavigationMutation(["emergency", "audit"]);
  return updated;
}

export async function publishEmergencyPolicy(payload: { note: string }): Promise<{ affectedClinics: number; publishedAt: string }> {
  const response = await postToApi<{ data: { affected_clinics: number; published_at: string } }>("/api/v1/auth/admin/emergency/publish", { scope: "all", force: true, note: payload.note });
  invalidatePlatformData(["emergency", "audit"]);
  notifySuperadminNavigationMutation(["emergency", "audit"]);
  return { affectedClinics: response.data.affected_clinics, publishedAt: response.data.published_at };
}

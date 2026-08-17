import { patchToApi, postToApi } from "@/shared/api/http-client";
import type { EmergencyPolicy, EmergencyPolicyData } from "@/features/platform/model/emergency.types";

type ApiEmergency = {
  policy: { enabled: boolean; visibility: EmergencyPolicy["visibility"]; color: EmergencyPolicy["color"]; inheritance: EmergencyPolicy["inheritance"]; default_channel: EmergencyPolicy["defaultChannel"]; escalation_minutes: EmergencyPolicy["escalationMinutes"] };
  responsibles: Array<{ role: string; channel: string }>;
  published_at: string | null;
  stats: { active_clinics: number; enabled_clinics: number; policy_changes_today: number };
};

export function mapEmergency(data: ApiEmergency): EmergencyPolicyData {
  return { policy: { enabled: data.policy.enabled, visibility: data.policy.visibility, color: data.policy.color, inheritance: data.policy.inheritance, defaultChannel: data.policy.default_channel, escalationMinutes: data.policy.escalation_minutes }, responsibles: data.responsibles, publishedAt: data.published_at, stats: { activeClinics: data.stats.active_clinics, enabledClinics: data.stats.enabled_clinics, policyChangesToday: data.stats.policy_changes_today } };
}

export async function updateEmergencyPolicy(policy: EmergencyPolicy, responsibles: EmergencyPolicyData["responsibles"]): Promise<EmergencyPolicyData> {
  const response = await patchToApi<{ data: ApiEmergency }>("/api/v1/auth/admin/emergency", { enabled: policy.enabled, visibility: policy.visibility, color: policy.color, inheritance: policy.inheritance, default_channel: policy.defaultChannel, escalation_minutes: policy.escalationMinutes, responsibles });
  return mapEmergency(response.data);
}

export async function publishEmergencyPolicy(payload: { scope: "all" | "MX" | "PE" | "US"; force: boolean; note: string }): Promise<{ affectedClinics: number; publishedAt: string }> {
  const response = await postToApi<{ data: { affected_clinics: number; published_at: string } }>("/api/v1/auth/admin/emergency/publish", payload);
  return { affectedClinics: response.data.affected_clinics, publishedAt: response.data.published_at };
}

import { patchToApi, postToApi } from "@/shared/api/http-client";
import type {
  SystemIncidentSeverity,
  SystemIncidentStatus,
} from "@/features/platform/model/admin-dashboard.types";

export type CreateSystemIncidentPayload = {
  title: string;
  description: string;
  severity: SystemIncidentSeverity;
  serviceKey: string | null;
  countryCode: string | null;
};

export async function createSystemIncident(payload: CreateSystemIncidentPayload): Promise<void> {
  await postToApi("/api/v1/auth/admin/system-incidents", {
    title: payload.title,
    description: payload.description,
    severity: payload.severity,
    service_key: payload.serviceKey,
    country_code: payload.countryCode,
  });
}

export async function updateSystemIncident(
  incidentId: number,
  status: SystemIncidentStatus,
  note: string | null,
): Promise<void> {
  await patchToApi(`/api/v1/auth/admin/system-incidents/${incidentId}`, {
    status,
    note,
  });
}

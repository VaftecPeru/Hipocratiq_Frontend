import { ApiError, getFromApi, patchToApi, postToApi } from "@/shared/api/http-client";
import { parseApiList } from "@/shared/api/parse-api-list";
import type { AdminSpecialty, AdminSpecialtyPayload } from "@/features/specialties/model/admin-specialty.types";

type ApiSpecialty = {
  id: number;
  code: string;
  name: string;
  parent_id: number | null;
  parent: { id: number; name: string } | null;
  is_active: boolean;
  subspecialties_count: number;
  usage: {
    doctors: number;
    patient_intakes: number;
  };
};

type ApiSpecialtiesResponse = { data: ApiSpecialty[] };

function mapSpecialty(specialty: ApiSpecialty): AdminSpecialty {
  return {
    id: specialty.id,
    code: specialty.code,
    name: specialty.name,
    parentId: specialty.parent_id,
    parent: specialty.parent,
    isActive: specialty.is_active,
    subspecialtiesCount: specialty.subspecialties_count,
    usage: {
      doctors: specialty.usage.doctors,
      patientIntakes: specialty.usage.patient_intakes,
    },
  };
}

export async function getAdminSpecialties(signal?: AbortSignal): Promise<AdminSpecialty[]> {
  const payload = await getFromApi<ApiSpecialtiesResponse>("/api/v1/auth/admin/specialties", { signal });

  if (!payload || !Array.isArray(payload.data)) {
    throw new ApiError("El servidor devolvió un catálogo de especialidades incompleto.", 502);
  }

  return parseApiList<ApiSpecialty>(payload.data, "specialties.data").map(mapSpecialty);
}

function requestPayload(payload: AdminSpecialtyPayload): Record<string, unknown> {
  return {
    code: payload.code,
    name: payload.name,
    parent_id: payload.parentId,
    is_active: payload.isActive,
  };
}

export async function createAdminSpecialty(payload: AdminSpecialtyPayload): Promise<AdminSpecialty> {
  const response = await postToApi<{ data: ApiSpecialty }>("/api/v1/auth/admin/specialties", requestPayload(payload));

  return mapSpecialty(response.data);
}

export async function updateAdminSpecialty(id: number, payload: AdminSpecialtyPayload): Promise<AdminSpecialty> {
  const response = await patchToApi<{ data: ApiSpecialty }>(`/api/v1/auth/admin/specialties/${id}`, requestPayload(payload));

  return mapSpecialty(response.data);
}

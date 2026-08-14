import { ApiError, getFromApi, patchToApi, postToApi } from "@/shared/api/http-client";
import type {
  ClinicAdminInfo,
  ClinicDashboardData,
  ClinicMemberRole,
  ClinicPatient,
  ClinicPatientsPage,
  ClinicTeamMember,
} from "@/features/clinics/model/clinic-admin.types";
import type { CountryCode } from "@/shared/ui/country-flag";

type ApiClinic = {
  id: number;
  name: string;
  country_code: CountryCode;
  contact_phone: string;
  address: string;
  status: "active" | "suspended";
};

type ApiMember = {
  id: number;
  name: string;
  email: string | null;
  phone_number: string;
  status: ClinicTeamMember["status"];
  role: ClinicMemberRole;
  role_name: string;
  specialty: string | null;
  medical_license: string | null;
  last_login_at: string | null;
};

type ApiPatient = {
  id: number;
  patient_code: string;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  status: ClinicPatient["status"];
  created_at: string | null;
};

type ApiDashboardResponse = {
  data: {
    clinic: ApiClinic;
    subscription: { plan: string | null; status: string | null; billing_cycle: string | null };
    metrics: { staff_total: number; doctors_total: number; receptionists_total: number; patients_total: number };
    team: ApiMember[];
    recent_patients: ApiPatient[];
  };
};

type ApiPatientsResponse = {
  data: ApiPatient[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};

type ApiClinicResponse = { data: { clinic: ApiClinic } };

function mapClinic(clinic: ApiClinic): ClinicAdminInfo {
  return {
    id: clinic.id,
    name: clinic.name,
    countryCode: clinic.country_code,
    contactPhone: clinic.contact_phone,
    address: clinic.address,
    status: clinic.status,
  };
}

function mapMember(member: ApiMember): ClinicTeamMember {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    phoneNumber: member.phone_number,
    status: member.status,
    role: member.role,
    roleName: member.role_name,
    specialty: member.specialty,
    medicalLicense: member.medical_license,
    lastLoginAt: member.last_login_at,
  };
}

function mapPatient(patient: ApiPatient): ClinicPatient {
  return {
    id: patient.id,
    patientCode: patient.patient_code,
    name: patient.name,
    email: patient.email,
    phoneNumber: patient.phone_number,
    status: patient.status,
    createdAt: patient.created_at,
  };
}

function assertDashboardPayload(payload: ApiDashboardResponse): ApiDashboardResponse["data"] {
  if (!payload.data || !payload.data.clinic || !Array.isArray(payload.data.team) || !Array.isArray(payload.data.recent_patients)) {
    throw new ApiError("El servidor devolvió un panel clínico incompleto.", 502);
  }

  return payload.data;
}

export async function getClinicDashboard(signal?: AbortSignal): Promise<ClinicDashboardData> {
  const payload = assertDashboardPayload(await getFromApi<ApiDashboardResponse>("/api/v1/auth/clinic/dashboard", { signal }));

  return {
    clinic: mapClinic(payload.clinic),
    subscription: {
      plan: payload.subscription.plan,
      status: payload.subscription.status,
      billingCycle: payload.subscription.billing_cycle,
    },
    metrics: {
      staffTotal: payload.metrics.staff_total,
      doctorsTotal: payload.metrics.doctors_total,
      receptionistsTotal: payload.metrics.receptionists_total,
      patientsTotal: payload.metrics.patients_total,
    },
    team: payload.team.map(mapMember),
    recentPatients: payload.recent_patients.map(mapPatient),
  };
}

export async function getClinicMembers(signal?: AbortSignal): Promise<ClinicTeamMember[]> {
  const payload = await getFromApi<{ data: ApiMember[] }>("/api/v1/auth/clinic/members", { signal });
  if (!Array.isArray(payload.data)) throw new ApiError("El servidor devolvió un equipo clínico incompleto.", 502);
  return payload.data.map(mapMember);
}

export type CreateClinicReceptionistPayload = {
  name: string;
  email: string | null;
  phoneNumber: string;
  countryCode: CountryCode;
};

export async function createClinicReceptionist(
  payload: CreateClinicReceptionistPayload,
): Promise<ClinicTeamMember> {
  const response = await postToApi<{ data: ApiMember }>("/api/v1/auth/clinic/members", {
    name: payload.name,
    email: payload.email,
    phone_number: payload.phoneNumber,
    country_code: payload.countryCode,
  });

  if (!response.data) throw new ApiError("El servidor no devolvió la recepcionista creada.", 502);
  return mapMember(response.data);
}

export async function getClinicPatients(
  search = "",
  page = 1,
  signal?: AbortSignal,
): Promise<ClinicPatientsPage> {
  const query = new URLSearchParams({ per_page: "20", page: String(page) });
  if (search.trim()) query.set("search", search.trim());
  const payload = await getFromApi<ApiPatientsResponse>(`/api/v1/auth/clinic/patients?${query.toString()}`, { signal });
  if (!Array.isArray(payload.data) || !payload.meta) throw new ApiError("El servidor devolvió pacientes incompletos.", 502);

  return {
    patients: payload.data.map(mapPatient),
    pagination: {
      currentPage: payload.meta.current_page,
      lastPage: payload.meta.last_page,
      perPage: payload.meta.per_page,
      total: payload.meta.total,
    },
  };
}

export async function getClinicSettings(signal?: AbortSignal): Promise<ClinicAdminInfo> {
  const payload = await getFromApi<ApiClinicResponse>("/api/v1/auth/clinic/settings", { signal });
  if (!payload.data?.clinic) throw new ApiError("El servidor devolvió una configuración clínica incompleta.", 502);
  return mapClinic(payload.data.clinic);
}

export type UpdateClinicSettingsPayload = Partial<Pick<ClinicAdminInfo, "name" | "contactPhone" | "address">>;

export async function updateClinicSettings(payload: UpdateClinicSettingsPayload): Promise<ClinicAdminInfo> {
  const response = await patchToApi<ApiClinicResponse>("/api/v1/auth/clinic/settings", {
    name: payload.name,
    contact_phone: payload.contactPhone,
    address: payload.address,
  });
  if (!response.data?.clinic) throw new ApiError("El servidor no devolvió la configuración actualizada.", 502);
  return mapClinic(response.data.clinic);
}

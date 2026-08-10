import { patchToApi, postToApi } from "@/shared/api/http-client";
import type { Clinic, ClinicCountryCode, ClinicPlan, ClinicStatus } from "@/features/clinics/model/clinic.types";

type ApiClinic = {
  id: number;
  name: string;
  country_code: ClinicCountryCode;
  address: string;
  plan: ClinicPlan;
  users: number;
  patients: number;
  status: ClinicStatus;
  monthly_billing: number;
  last_payment: string | null;
};

export type UpdateAdminClinicPayload = {
  name?: string;
  countryCode?: ClinicCountryCode;
  address?: string;
  plan?: ClinicPlan;
  status?: ClinicStatus;
};

export type CreateAdminClinicPayload = {
  name: string;
  taxId: string;
  countryCode: ClinicCountryCode;
  contactPhone: string;
  address: string;
  plan: ClinicPlan;
  billingCycle: "monthly" | "annual";
};

const COUNTRY_LABELS: Record<ClinicCountryCode, string> = { MX: "México", PE: "Perú", US: "Estados Unidos" };

function mapClinic(clinic: ApiClinic): Clinic {
  return {
    id: clinic.id,
    name: clinic.name,
    countryCode: clinic.country_code,
    country: COUNTRY_LABELS[clinic.country_code],
    city: clinic.address,
    plan: clinic.plan,
    users: clinic.users,
    patients: clinic.patients,
    status: clinic.status,
    monthlyBilling: clinic.monthly_billing,
    lastPayment: clinic.last_payment,
  };
}

export async function createAdminClinic(payload: CreateAdminClinicPayload): Promise<Clinic> {
  const response = await postToApi<{ data: ApiClinic }>("/api/v1/auth/admin/clinics", {
    name: payload.name,
    tax_id: payload.taxId,
    country_code: payload.countryCode,
    contact_phone: payload.contactPhone,
    address: payload.address,
    plan: payload.plan,
    billing_cycle: payload.billingCycle,
  });

  return mapClinic(response.data);
}

export async function updateAdminClinic(id: number, payload: UpdateAdminClinicPayload): Promise<Clinic> {
  const response = await patchToApi<{ data: ApiClinic }>(`/api/v1/auth/admin/clinics/${id}`, {
    name: payload.name,
    country_code: payload.countryCode,
    address: payload.address,
    plan: payload.plan,
    status: payload.status,
  });
  return mapClinic(response.data);
}

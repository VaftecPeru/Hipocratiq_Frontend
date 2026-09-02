import type { ClinicPlan } from "@/features/auth/api/clinic-registration";
import { getFromApi, postToApi } from "@/shared/api/http-client";

export type DoctorPracticeType = "clinic" | "independent";

export type RegistrationClinic = {
  id: number;
  name: string;
  country_code: string;
  address: string;
};

export type RegistrationSpecialty = {
  id: number;
  code: string;
  name: string;
  subspecialties: Array<{ id: number; code: string; name: string }>;
};

export type DoctorRegistrationDraft = {
  doctor_name: string;
  doctor_email: string;
  country_code: string;
  doctor_phone_number: string;
  medical_license: string;
  specialty: string;
  specialty_id: number | null;
  subspecialty_id: number | null;
  practice_type: DoctorPracticeType;
  clinic_id: number | null;
  password: string;
  password_confirmation: string;
  terms_accepted: boolean;
};

type ChallengeData = { challenge_id: string; expires_in: number; resend_after: number; resends_remaining: number; next_step: "verify_otp" };
type DraftResponse = { data: ChallengeData | { next_step: "select_plan" } };
type ChallengeResponse = { data: ChallengeData };
type ClinicsResponse = { data: RegistrationClinic[] };
type SpecialtiesResponse = { data: RegistrationSpecialty[] };
type PlansResponse = { data: ClinicPlan[] };

export function getDoctorRegistrationClinics(): Promise<ClinicsResponse> {
  return getFromApi<ClinicsResponse>("/api/v1/auth/register/doctor/clinics");
}

export function getDoctorRegistrationSpecialties(signal?: AbortSignal): Promise<SpecialtiesResponse> {
  return getFromApi<SpecialtiesResponse>("/api/v1/auth/register/doctor/specialties", { signal });
}

export function getDoctorPlans(): Promise<PlansResponse> {
  return getFromApi<PlansResponse>("/api/v1/auth/register/clinic/plans");
}

export function startDoctorRegistration(payload: DoctorRegistrationDraft): Promise<DraftResponse> {
  return postToApi<DraftResponse>("/api/v1/auth/register/doctor/draft", payload as unknown as Record<string, unknown>);
}

export function selectDoctorPlan(plan: string, billingCycle: "monthly" | "annual"): Promise<ChallengeResponse> {
  return postToApi<ChallengeResponse>("/api/v1/auth/register/doctor/plan", { plan, billing_cycle: billingCycle });
}

export function verifyDoctorRegistration(challengeId: string, code: string): Promise<unknown> {
  return postToApi("/api/v1/auth/register/doctor/verify-otp", { challenge_id: challengeId, code });
}

export function resendDoctorRegistrationOtp(): Promise<ChallengeResponse> {
  return postToApi<ChallengeResponse>("/api/v1/auth/register/doctor/resend-otp");
}

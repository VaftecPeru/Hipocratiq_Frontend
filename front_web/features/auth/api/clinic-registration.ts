import { getFromApi, postToApi } from "@/shared/api/http-client";

export type ClinicPlan = {
  key: "basic" | "professional";
  name: string;
  monthly_price_cents: number;
  annual_price_cents: number;
  currency: string;
  features: string[];
};

export type ClinicRegistrationDraft = {
  clinic_name: string;
  tax_id: string;
  country_code: string;
  contact_phone: string;
  address: string;
  admin_name: string;
  admin_email: string;
  admin_phone_number: string;
  password: string;
  password_confirmation: string;
  terms_accepted: boolean;
};

type PlansResponse = { data: ClinicPlan[] };
type ChallengeResponse = { data: { challenge_id: string; expires_in: number; resend_after: number; resends_remaining: number } };

export function getClinicPlans(): Promise<PlansResponse> {
  return getFromApi<PlansResponse>("/api/v1/auth/register/clinic/plans");
}

export function startClinicRegistration(payload: ClinicRegistrationDraft): Promise<unknown> {
  return postToApi("/api/v1/auth/register/clinic/draft", payload as unknown as Record<string, unknown>);
}

export function selectClinicPlan(plan: string, billingCycle: "monthly" | "annual"): Promise<ChallengeResponse> {
  return postToApi<ChallengeResponse>("/api/v1/auth/register/clinic/plan", { plan, billing_cycle: billingCycle });
}

export function verifyClinicRegistration(challengeId: string, code: string): Promise<unknown> {
  return postToApi("/api/v1/auth/register/clinic/verify-otp", { challenge_id: challengeId, code });
}

export function resendClinicRegistrationOtp(): Promise<ChallengeResponse> {
  return postToApi<ChallengeResponse>("/api/v1/auth/register/clinic/resend-otp");
}

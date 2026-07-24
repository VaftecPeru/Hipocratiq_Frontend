import { getFromApi, postToApi } from "@/shared/api/http-client";

export type PatientRegistrationClinic = {
  id: number;
  name: string;
  country_code: string;
  address: string;
};

export type PatientRegistrationDraft = {
  name: string;
  email: string;
  country_code: string;
  phone_number: string;
  clinic_id: number | null;
  password: string;
  password_confirmation: string;
  terms_accepted: boolean;
};

export type PatientChallengeData = {
  challenge_id: string;
  expires_in: number;
  resend_after: number;
  resends_remaining: number;
};

type ClinicsResponse = { data: PatientRegistrationClinic[] };
type ChallengeResponse = { data: PatientChallengeData };

export function getPatientRegistrationClinics(): Promise<ClinicsResponse> {
  return getFromApi<ClinicsResponse>("/api/v1/auth/register/patient/clinics");
}

export function startPatientRegistration(payload: PatientRegistrationDraft): Promise<ChallengeResponse> {
  return postToApi<ChallengeResponse>("/api/v1/auth/register/patient", payload as unknown as Record<string, unknown>);
}

export function verifyPatientRegistration(challengeId: string, code: string): Promise<unknown> {
  return postToApi("/api/v1/auth/register/verify-otp", { challenge_id: challengeId, code });
}

export function resendPatientRegistrationOtp(challengeId: string): Promise<ChallengeResponse> {
  return postToApi<ChallengeResponse>("/api/v1/auth/otp/resend", { challenge_id: challengeId });
}

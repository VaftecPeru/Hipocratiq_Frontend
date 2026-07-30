export type LoginIdentifierType = "email" | "phone";
export type LoginActorContext = "staff" | "patient";
export type AuthStep = "credentials" | "otp" | "success";
export type CountryCode = "PE" | "MX" | "US";

export type AuthenticatedUser = {
  id: number;
  name: string;
  email: string | null;
  phone_number: string;
  country_code: string;
  status: string;
  onboarding_status: string;
  roles: string[];
  is_global: boolean;
  clinic?: { id: number; name: string; plan: string; status: string } | null;
  doctor?: { medical_license: string; specialty: string; practice_type: "clinic" | "independent"; clinic: { id: number; name: string } | null; plan: string | null } | null;
  patient?: { clinic: { id: number; name: string } | null; plan: string | null } | null;
};

export type AuthenticatedSession = {
  user: AuthenticatedUser;
  client_type: "web" | "mobile";
  actor_context: "staff" | "patient" | "clinic_admin" | "doctor";
};

export type SessionResponse = {
  success: boolean;
  data: AuthenticatedSession;
};

export type WebLoginVerificationResponse = {
  success: true;
  data: {
    user: AuthenticatedUser;
    actor_context: AuthenticatedSession["actor_context"];
    next_step: null;
  };
};

export type OtpChallengeResponse = {
  success: true;
  data: {
    challenge_id: string;
    next_step: "verify_otp";
    expires_in: number;
    resend_after: number;
    resends_remaining: number;
  };
};

export type LoginIdentifierType = "email" | "phone";
export type LoginRole = "healthcare" | "receptionist" | "patient" | "administrator" | "support";
export type LoginActorContext = "staff" | "patient";
export type LoginRequestedRole = "super_admin" | "clinic_admin" | "receptionist" | "doctor" | "patient";
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
  actor_context: "staff" | "patient" | "clinic_admin" | "receptionist" | "doctor";
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


export type GoogleRegistrationType = "clinic" | "doctor" | "patient";

export type GoogleIdentityProfile = {
  name: string;
  email: string;
  avatar: string | null;
};

export type GoogleAuthCompleteResponse = {
  success: true;
  data:
    | {
        status: "authenticated";
        user: AuthenticatedUser;
        actor_context: AuthenticatedSession["actor_context"];
      }
    | {
        status: "registration_required";
        registration_type: GoogleRegistrationType;
        registration_token: string;
        identity: GoogleIdentityProfile;
      };
};

export type GoogleRegistrationProfileResponse = {
  success: true;
  data: {
    registration_type: GoogleRegistrationType;
    identity: GoogleIdentityProfile;
  };
};

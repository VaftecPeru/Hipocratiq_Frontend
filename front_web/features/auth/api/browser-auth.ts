import type {
  LoginActorContext,
  LoginRequestedRole,
  OtpChallengeResponse,
  WebLoginVerificationResponse,
} from "@/features/auth/model/auth.types";
import { invalidatePlatformData } from "@/features/platform/model/platform-data-cache";
import { ApiError, postToApi } from "@/shared/api/http-client";

type RequestLoginOtpInput =
  | { identifier: string; actorContext: "staff"; requestedRole: Exclude<LoginRequestedRole, "patient">; password: string }
  | { identifier: string; actorContext: "patient"; requestedRole: "patient"; password?: never };

function clearLegacyBrowserToken(): void {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem("token");
  document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
}

export function requestLoginOtp(input: RequestLoginOtpInput): Promise<OtpChallengeResponse> {
  clearLegacyBrowserToken();
  invalidatePlatformData(["audit", "emergency", "support"]);

  const payload: Record<string, unknown> & { actor_context: LoginActorContext } = {
    purpose: "login",
    client_type: "web",
    actor_context: input.actorContext,
    requested_role: input.requestedRole,
    identifier: input.identifier,
  };

  if (input.actorContext === "staff") {
    payload.password = input.password;
  }

  return postToApi<OtpChallengeResponse>("/api/v1/auth/otp/request", payload);
}

export function verifyLoginOtp(
  challengeId: string,
  code: string,
): Promise<WebLoginVerificationResponse> {
  return postToApi<WebLoginVerificationResponse>("/api/v1/auth/otp/verify", {
    purpose: "login",
    challenge_id: challengeId,
    code,
  });
}

export function requestPasswordResetOtp(identifier: string): Promise<OtpChallengeResponse> {
  return postToApi<OtpChallengeResponse>("/api/v1/auth/otp/request", {
    purpose: "password_reset",
    client_type: "web",
    actor_context: "staff",
    identifier,
  });
}

export function verifyPasswordResetOtp(
  challengeId: string,
  code: string,
  password: string,
  passwordConfirmation: string,
): Promise<{ success: true; data: { next_step: "login" } }> {
  return postToApi("/api/v1/auth/otp/verify", {
    purpose: "password_reset",
    challenge_id: challengeId,
    code,
    password,
    password_confirmation: passwordConfirmation,
  });
}

export function resendOtp(challengeId: string): Promise<OtpChallengeResponse> {
  return postToApi<OtpChallengeResponse>("/api/v1/auth/otp/resend", {
    challenge_id: challengeId,
  });
}

export async function logout(): Promise<void> {
  try {
    await postToApi("/api/v1/auth/logout");
  } catch (error) {
    if (! (error instanceof ApiError && error.status === 401)) {
      throw error;
    }
  } finally {
    clearLegacyBrowserToken();
    invalidatePlatformData(["audit", "emergency", "support"]);
  }
}

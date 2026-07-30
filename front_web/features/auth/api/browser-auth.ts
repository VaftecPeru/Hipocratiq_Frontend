import type { OtpChallengeResponse } from "@/features/auth/model/auth.types";
import { postToApi } from "@/shared/api/http-client";

type RequestLoginOtpInput = {
  identifier: string;
  password: string;
};

export function requestLoginOtp(input: RequestLoginOtpInput): Promise<OtpChallengeResponse> {
  return postToApi<OtpChallengeResponse>("/api/v1/auth/otp/request", {
    purpose: "login",
    client_type: "web",
    actor_context: "staff",
    identifier: input.identifier,
    password: input.password,
  });
}

export function verifyLoginOtp(
  challengeId: string,
  code: string,
): Promise<{
  data: {
    token_type: string;
    access_token: string;
    expires_at: string;
    user: unknown;
    actor_context: string;
    next_step: string | null;
  };
}> {
  return postToApi("/api/v1/auth/otp/verify", {
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

export function logout(): Promise<unknown> {
  return postToApi("/api/v1/auth/logout");
}

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

export function verifyLoginOtp(challengeId: string, code: string): Promise<{ data: { actor_context: string } }> {
  return postToApi("/api/v1/auth/otp/verify", {
    purpose: "login",
    challenge_id: challengeId,
    code,
  });
}

export function logout(): Promise<unknown> {
  return postToApi("/api/v1/auth/logout");
}

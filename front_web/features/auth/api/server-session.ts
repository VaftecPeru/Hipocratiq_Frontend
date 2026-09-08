import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthenticatedSession, SessionResponse } from "@/features/auth/model/auth.types";
import { serverEnv } from "@/shared/config/server-env";

const AUTH_REQUEST_TIMEOUT_MS = 3_500;
const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 200;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return status === 502 || status === 503 || status === 504;
}

function isRetryableNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}

export const getAuthenticatedSession = cache(async (): Promise<AuthenticatedSession | null> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader) {
    return null;
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(`${serverEnv.backendUrl}/api/v1/auth/me`, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Cookie: cookieHeader,
          Origin: serverEnv.appUrl,
          Referer: `${serverEnv.appUrl}/`,
        },
        signal: AbortSignal.timeout(AUTH_REQUEST_TIMEOUT_MS),
      });

      if (response.status === 401 || response.status === 403) {
        return null;
      }

      if (isRetryableStatus(response.status) && attempt < MAX_ATTEMPTS) {
        await delay(RETRY_DELAY_MS);
        continue;
      }

      if (!response.ok) {
        lastError = new Error(`Authentication backend returned HTTP ${response.status}.`);
        throw lastError;
      }

      const payload = (await response.json()) as SessionResponse;

      return payload.data;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS && isRetryableNetworkError(error)) {
        await delay(RETRY_DELAY_MS);
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Authentication backend is unavailable.");
});

export type ClinicRole = "clinic_admin" | "receptionist";

function isClinicRole(actorContext: AuthenticatedSession["actor_context"]): actorContext is ClinicRole {
  return actorContext === "clinic_admin" || actorContext === "receptionist";
}

export async function requireClinicRoles(
  roles: readonly ClinicRole[],
): Promise<AuthenticatedSession> {
  const session = await getAuthenticatedSession();

  if (!session || !session.user.clinic || !isClinicRole(session.actor_context) || !roles.includes(session.actor_context)) {
    redirect("/clinic/dashboard");
  }

  return session;
}

export async function requireClinicRole(role: ClinicRole): Promise<AuthenticatedSession> {
  return requireClinicRoles([role]);
}

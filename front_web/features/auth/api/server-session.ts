import { cache } from "react";
import { cookies } from "next/headers";
import type { AuthenticatedSession, SessionResponse } from "@/features/auth/model/auth.types";
import { serverEnv } from "@/shared/config/server-env";

const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 350;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
        signal: AbortSignal.timeout(8_000),
      });

      // Definitive "not logged in" — no point retrying.
      if (response.status === 401 || response.status === 403) {
        return null;
      }

      // Transient upstream failure (5xx, gateway, cold start). Retry before giving up.
      if (response.status >= 500) {
        lastError = new Error(`Authentication backend returned HTTP ${response.status}.`);
        if (attempt < MAX_ATTEMPTS) {
          await delay(RETRY_DELAY_MS);
          continue;
        }
        throw lastError;
      }

      if (!response.ok) {
        throw new Error(`Authentication backend returned HTTP ${response.status}.`);
      }

      const payload = (await response.json()) as SessionResponse;

      return payload.data;
    } catch (error) {
      // Network error or AbortSignal timeout — retry once, then surface.
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
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

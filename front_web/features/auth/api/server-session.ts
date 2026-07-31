import { cache } from "react";
import { cookies } from "next/headers";
import type { AuthenticatedSession, SessionResponse } from "@/features/auth/model/auth.types";
import { serverEnv } from "@/shared/config/server-env";

export const getAuthenticatedSession = cache(async (): Promise<AuthenticatedSession | null> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader) {
    return null;
  }

  const response = await fetch(`${serverEnv.backendUrl}/api/v1/auth/me`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
      Origin: serverEnv.appUrl,
      Referer: `${serverEnv.appUrl}/`,
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Authentication backend returned HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as SessionResponse;

  return payload.data;
});

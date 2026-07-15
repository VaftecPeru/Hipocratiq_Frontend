import { cookies } from "next/headers";
import type { AuthenticatedSession, SessionResponse } from "@/features/auth/model/auth.types";
import { serverEnv } from "@/shared/config/server-env";

export async function getAuthenticatedSession(): Promise<AuthenticatedSession | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader) {
    return null;
  }

  try {
    const response = await fetch(`${serverEnv.backendUrl}/api/v1/auth/me`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
        Origin: serverEnv.appUrl,
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as SessionResponse;

    return payload.data;
  } catch {
    return null;
  }
}

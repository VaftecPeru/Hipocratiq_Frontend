import { cache } from "react";
import { cookies } from "next/headers";
import type { AuthenticatedSession, SessionResponse } from "@/features/auth/model/auth.types";
import { serverEnv } from "@/shared/config/server-env";

export const getAuthenticatedSession = cache(async (): Promise<AuthenticatedSession | null> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  
  //  LEER TOKEN DE LA COOKIE (guardado por el cliente)
  const token = cookieStore.get("token")?.value;

  if (!cookieHeader && !token) {
    return null;
  }

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      Origin: serverEnv.appUrl,
    };

    if (cookieHeader) {
      headers.Cookie = cookieHeader;
    }
    
    // ENVIAR TOKEN EN AUTHORIZATION (Sanctum lo requiere)
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${serverEnv.backendUrl}/api/v1/auth/me`, {
      cache: "no-store",
      headers,
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as SessionResponse;

    return payload.data;
  } catch {
    return null;
  }
});

import { cookies } from "next/headers";
import { mapEmergency } from "@/features/platform/api/browser-emergency";
import type { EmergencyPolicyData } from "@/features/platform/model/emergency.types";
import { serverEnv } from "@/shared/config/server-env";

export async function getEmergencyPolicy(): Promise<{ ok: true; data: EmergencyPolicyData } | { ok: false; message: string }> {
  try {
    const response = await fetch(`${serverEnv.backendUrl}/api/v1/auth/admin/emergency`, { cache: "no-store", headers: { Accept: "application/json", Cookie: (await cookies()).toString(), Origin: serverEnv.appUrl } });
    if (!response.ok) return { ok: false, message: "No pudimos cargar la política global de emergencia." };
    const payload = await response.json() as { data: Parameters<typeof mapEmergency>[0] };
    return { ok: true, data: mapEmergency(payload.data) };
  } catch {
    return { ok: false, message: "No pudimos conectar con el backend de emergencia." };
  }
}

import { cookies } from "next/headers";
import type { AdminBackupManifest, AdminInfrastructure, InfrastructureStatus } from "@/features/platform/model/admin-infrastructure.types";
import { serverEnv } from "@/shared/config/server-env";

type Result = { ok: true; data: AdminInfrastructure } | { ok: false; message: string };

export async function getAdminInfrastructure(): Promise<Result> {
  try {
    const response = await fetch(`${serverEnv.backendUrl}/api/v1/auth/admin/infrastructure`, {
      cache: "no-store",
      headers: { Accept: "application/json", Cookie: (await cookies()).toString(), Origin: serverEnv.appUrl },
    });
    if (!response.ok) return { ok: false, message: response.status === 403 ? "No tienes permiso para consultar infraestructura." : "No pudimos cargar el estado de infraestructura." };
    const payload = await response.json() as {
      data: {
        backups: { status: InfrastructureStatus; provider: string | null; storage_disk: string | null; retention_days: number; schedule: string | null; history: Array<{ id: string; provider: string; database: string; disk: string; dump_path: string; sha256: string; size_bytes: number; created_at: string; verified_at: string | null }>; capabilities: { create: boolean; download: boolean; restore: boolean; verify: boolean }; message: string };
        integrations: Array<{ key: string; name: string; adapter: string | null; productionReady: boolean; status: InfrastructureStatus; purpose: string }>;
        generated_at: string;
      };
    };
    if (!payload.data?.backups || !Array.isArray(payload.data.integrations)) return { ok: false, message: "El backend devolvió un inventario de infraestructura incompleto." };
    const history: AdminBackupManifest[] = payload.data.backups.history.map((item) => ({
      id: item.id,
      provider: item.provider,
      database: item.database,
      disk: item.disk,
      dumpPath: item.dump_path,
      sha256: item.sha256,
      sizeBytes: item.size_bytes,
      createdAt: item.created_at,
      verifiedAt: item.verified_at,
    }));
    return { ok: true, data: {
      backups: { status: payload.data.backups.status, provider: payload.data.backups.provider, storageDisk: payload.data.backups.storage_disk, retentionDays: payload.data.backups.retention_days, schedule: payload.data.backups.schedule, history, capabilities: payload.data.backups.capabilities, message: payload.data.backups.message },
      integrations: payload.data.integrations,
      generatedAt: payload.data.generated_at,
    } };
  } catch {
    return { ok: false, message: "No pudimos conectar con el backend de infraestructura." };
  }
}

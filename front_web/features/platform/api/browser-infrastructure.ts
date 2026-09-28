import { postToApi } from "@/shared/api/http-client";

export async function createDatabaseBackup(): Promise<void> {
  await postToApi("/api/v1/auth/admin/backups");
}

export async function verifyDatabaseBackup(backupId: string): Promise<void> {
  await postToApi(`/api/v1/auth/admin/backups/${encodeURIComponent(backupId)}/verify`);
}

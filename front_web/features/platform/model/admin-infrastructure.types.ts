export type InfrastructureStatus = "configured" | "not_configured" | "sandbox" | "local";

export type AdminBackupInfrastructure = {
  status: InfrastructureStatus;
  provider: string | null;
  storageDisk: string | null;
  retentionDays: number;
  schedule: string | null;
  history: unknown[];
  capabilities: { create: boolean; download: boolean; restore: boolean; verify: boolean };
  message: string;
};

export type AdminIntegration = {
  key: string;
  name: string;
  adapter: string | null;
  productionReady: boolean;
  status: InfrastructureStatus;
  purpose: string;
};

export type AdminInfrastructure = {
  backups: AdminBackupInfrastructure;
  integrations: AdminIntegration[];
  generatedAt: string;
};

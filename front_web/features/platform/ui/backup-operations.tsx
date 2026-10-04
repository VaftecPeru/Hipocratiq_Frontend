"use client";

import { Archive, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createDatabaseBackup, verifyDatabaseBackup } from "@/features/platform/api/browser-infrastructure";

type Props = {
  configured: boolean;
  latestUnverifiedBackupId: string | null;
};

export function BackupOperations({ configured, latestUnverifiedBackupId }: Props) {
  const router = useRouter();
  const [action, setAction] = useState<"create" | "verify" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runCreate(): Promise<void> {
    setAction("create");
    setMessage(null);
    setError(null);
    try {
      await createDatabaseBackup();
      setMessage("Respaldo generado correctamente. Actualizamos el historial.");
      router.refresh();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "No se pudo generar el respaldo.");
    } finally {
      setAction(null);
    }
  }

  async function runVerify(): Promise<void> {
    if (!latestUnverifiedBackupId) return;
    setAction("verify");
    setMessage(null);
    setError(null);
    try {
      await verifyDatabaseBackup(latestUnverifiedBackupId);
      setMessage("Integridad SHA-256 verificada correctamente.");
      router.refresh();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "No se pudo verificar el respaldo.");
    } finally {
      setAction(null);
    }
  }

  return (
    <section className="mt-4 rounded-xl border border-line bg-surface p-4 shadow-sm" aria-labelledby="backup-operations-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-extrabold" id="backup-operations-title">
            <Archive className="size-4 text-accent" aria-hidden="true" />
            Operaciones de respaldo
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">
            Crear y verificar están disponibles desde la consola web. Restaurar permanece restringido a operación administrativa controlada para evitar recuperaciones accidentales.
          </p>
        </div>
        <span className={`inline-flex min-h-7 items-center gap-1.5 self-start rounded-full border px-2.5 text-2xs font-extrabold ${configured ? "border-success/25 bg-success-soft text-success" : "border-warning/30 bg-warning-soft text-warning"}`}>
          {configured ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : <ShieldCheck className="size-3.5" aria-hidden="true" />}
          {configured ? "Servicio operativo" : "Requiere configuración"}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-xs font-extrabold text-white transition hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={!configured || action !== null}
          onClick={() => void runCreate()}
        >
          {action === "create" ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Archive className="size-4" aria-hidden="true" />}
          {action === "create" ? "Generando…" : "Crear respaldo ahora"}
        </button>
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-4 text-xs font-extrabold text-ink transition hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={!configured || !latestUnverifiedBackupId || action !== null}
          onClick={() => void runVerify()}
        >
          {action === "verify" ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="size-4 text-success" aria-hidden="true" />}
          {action === "verify" ? "Verificando…" : "Verificar respaldo pendiente"}
        </button>
      </div>

      {message ? <p className="mt-3 rounded-lg border border-success/25 bg-success-soft px-3 py-2 text-xs font-bold text-success" role="status">{message}</p> : null}
      {error ? <p className="mt-3 rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-xs font-bold text-danger" role="alert">{error}</p> : null}
    </section>
  );
}

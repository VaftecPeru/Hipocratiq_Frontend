import type { Metadata } from "next";
import { AlertTriangle, Archive, CheckCircle2, Database, Download, History, RotateCcw, ShieldCheck } from "lucide-react";
import { getAdminInfrastructure } from "@/features/platform/api/server-infrastructure";
import { SettingsCard, SettingsPageHeader } from "@/features/platform/ui/settings-primitives";

export const metadata: Metadata = { title: "Respaldos" };

const capabilityLabels = { create: "Crear respaldo", download: "Descargar artefacto", restore: "Restaurar datos", verify: "Verificar integridad" } as const;
const capabilityIcons = { create: Archive, download: Download, restore: RotateCcw, verify: ShieldCheck } as const;

export default async function BackupsPage() {
  const result = await getAdminInfrastructure();
  if (!result.ok) return <main className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center px-5"><section className="rounded-xl border border-danger/25 bg-surface p-6 text-center" role="alert"><AlertTriangle className="mx-auto size-7 text-danger" /><h1 className="mt-3 text-lg font-extrabold">Respaldos no disponibles</h1><p className="mt-2 text-sm text-muted">{result.message}</p></section></main>;
  const backup = result.data.backups;
  const configured = backup.status === "configured";

  return (
    <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <SettingsPageHeader title="Respaldos" description="Estado real del servicio de copias de seguridad y recuperación." />
      <section className={`mt-4 flex items-start gap-3 rounded-xl border p-4 ${configured ? "border-success/25 bg-success-soft/50" : "border-warning/30 bg-warning-soft/60"}`} role="status">
        {configured ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" /> : <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />}
        <div><h2 className="text-sm font-extrabold">{configured ? "Proveedor declarado" : "Servicio no configurado"}</h2><p className="mt-1 text-xs leading-5 text-muted">{backup.message}</p></div>
      </section>
      <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)]">
        <SettingsCard title="Capacidades verificadas" description="Sólo se habilitan operaciones respaldadas por un proveedor y manifiestos reales." icon={Database} titleId="backup-capabilities">
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {Object.entries(backup.capabilities).map(([key, enabled]) => {
              const capability = key as keyof typeof capabilityLabels;
              const Icon = capabilityIcons[capability];
              return <li className="flex items-center gap-3 rounded-lg border border-line bg-surface-subtle p-3" key={key}><span className={`grid size-8 place-items-center rounded-lg ${enabled ? "bg-success-soft text-success" : "bg-line/60 text-muted"}`}><Icon className="size-4" /></span><div><p className="text-xs font-bold">{capabilityLabels[capability]}</p><p className="mt-0.5 text-2xs text-muted">{enabled ? "Disponible" : "No disponible"}</p></div></li>;
            })}
          </ul>
        </SettingsCard>
        <SettingsCard title="Configuración detectada" icon={Archive} titleId="backup-configuration">
          <dl className="mt-4 divide-y divide-line text-xs">
            <div className="flex justify-between gap-3 py-2.5"><dt className="text-muted">Proveedor</dt><dd className="font-bold">{backup.provider ?? "Sin configurar"}</dd></div>
            <div className="flex justify-between gap-3 py-2.5"><dt className="text-muted">Almacenamiento</dt><dd className="font-bold">{backup.storageDisk ?? "Sin configurar"}</dd></div>
            <div className="flex justify-between gap-3 py-2.5"><dt className="text-muted">Retención deseada</dt><dd className="font-bold">{backup.retentionDays} días</dd></div>
            <div className="flex justify-between gap-3 py-2.5"><dt className="text-muted">Programación</dt><dd className="font-bold">{backup.schedule ?? "Sin configurar"}</dd></div>
          </dl>
        </SettingsCard>
      </section>
      <SettingsCard className="mt-4" title="Historial verificado" description="Manifiestos emitidos por el proveedor de respaldos." icon={History} titleId="backup-history">
        <div className="mt-4 rounded-lg border border-dashed border-line px-4 py-10 text-center"><History className="mx-auto size-6 text-muted" /><p className="mt-2 text-xs font-bold">No hay manifiestos disponibles</p><p className="mt-1 text-2xs text-muted">La vista ya no muestra respaldos de ejemplo ni fechas ficticias.</p></div>
      </SettingsCard>
    </div>
  );
}

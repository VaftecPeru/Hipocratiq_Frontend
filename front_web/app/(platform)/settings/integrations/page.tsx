import type { Metadata } from "next";
import { AlertTriangle, Boxes, CheckCircle2, CircleDashed, FlaskConical, HardDrive, PlugZap } from "lucide-react";
import { getAdminInfrastructure } from "@/features/platform/api/server-infrastructure";
import type { InfrastructureStatus } from "@/features/platform/model/admin-infrastructure.types";
import { SettingsCard, SettingsPageHeader } from "@/features/platform/ui/settings-primitives";

export const metadata: Metadata = { title: "Integraciones" };

const statusLabels: Record<InfrastructureStatus, string> = { configured: "Configurado", not_configured: "No configurado", sandbox: "Simulado / pruebas", local: "Sólo local" };
const statusClasses: Record<InfrastructureStatus, string> = { configured: "bg-success-soft text-success", not_configured: "bg-line/60 text-muted", sandbox: "bg-warning-soft text-warning", local: "bg-violet-soft text-violet" };

export default async function IntegrationsPage() {
  const result = await getAdminInfrastructure();
  if (!result.ok) return <main className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center px-5"><section className="rounded-xl border border-danger/25 bg-surface p-6 text-center" role="alert"><AlertTriangle className="mx-auto size-7 text-danger" /><h1 className="mt-3 text-lg font-extrabold">Integraciones no disponibles</h1><p className="mt-2 text-sm text-muted">{result.message}</p></section></main>;
  const integrations = result.data.integrations;
  const productionReady = integrations.filter((item) => item.productionReady).length;
  const pending = integrations.filter((item) => item.status === "not_configured").length;

  return (
    <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <SettingsPageHeader title="Integraciones" description="Inventario obtenido del backend; no expone credenciales ni presenta conexiones ficticias." />
      <section className="mt-4 grid gap-3 sm:grid-cols-3" aria-label="Resumen de integraciones">
        {[{ label: "Adaptadores detectados", value: integrations.length, icon: Boxes, tone: "text-accent bg-accent-soft" }, { label: "Listos para producción", value: productionReady, icon: CheckCircle2, tone: "text-success bg-success-soft" }, { label: "Pendientes", value: pending, icon: CircleDashed, tone: "text-warning bg-warning-soft" }].map((item) => <article className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4" key={item.label}><span className={`grid size-9 place-items-center rounded-lg ${item.tone}`}><item.icon className="size-4" /></span><div><p className="text-2xs font-bold text-muted">{item.label}</p><p className="mt-0.5 font-mono text-xl font-extrabold">{item.value}</p></div></article>)}
      </section>
      <SettingsCard className="mt-4" title="Capacidades del backend" description="El estado se deriva de los adaptadores y configuración activa del servidor." icon={PlugZap} titleId="integration-inventory">
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {integrations.map((integration) => {
            const Icon = integration.status === "sandbox" ? FlaskConical : integration.status === "local" ? HardDrive : integration.productionReady ? CheckCircle2 : CircleDashed;
            return <li className="rounded-xl border border-line bg-surface-subtle p-3.5" key={integration.key}><div className="flex items-start justify-between gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface text-accent"><Icon className="size-4" /></span><span className={`rounded-full px-2 py-1 text-2xs font-extrabold ${statusClasses[integration.status]}`}>{statusLabels[integration.status]}</span></div><h3 className="mt-3 text-xs font-extrabold">{integration.name}</h3><p className="mt-1 min-h-8 text-2xs leading-4 text-muted">{integration.purpose}</p><dl className="mt-3 border-t border-line pt-2 text-2xs"><div className="flex justify-between gap-3"><dt className="text-muted">Adaptador</dt><dd className="max-w-[60%] truncate font-mono font-bold">{integration.adapter ?? "—"}</dd></div></dl></li>;
          })}
        </ul>
      </SettingsCard>
      <p className="mt-4 rounded-lg border border-warning/25 bg-warning-soft/50 p-3 text-2xs leading-5 text-muted"><strong className="text-ink">Gestión de credenciales:</strong> se mantiene fuera de la interfaz. Debe realizarse mediante secretos del entorno y despliegue controlado.</p>
    </div>
  );
}

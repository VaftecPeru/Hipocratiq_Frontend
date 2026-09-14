import type { Metadata } from "next";
import { AlertTriangle, Boxes, CheckCircle2, CircleDashed, CreditCard, Database, FlaskConical, HardDrive, Image as ImageIcon, Mail, MessageSquare, PlugZap, Stethoscope } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getAdminInfrastructure } from "@/features/platform/api/server-infrastructure";
import type { InfrastructureStatus } from "@/features/platform/model/admin-infrastructure.types";
import { SettingsCard, SettingsPageHeader } from "@/features/platform/ui/settings-primitives";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings.integrations");
  return { title: t("pageTitle") };
}

const statusClasses: Record<InfrastructureStatus, string> = { configured: "bg-success-soft text-success", not_configured: "bg-line/60 text-muted", sandbox: "bg-warning-soft text-warning", local: "bg-violet-soft text-violet" };
const integrationKeys = ["email", "sms", "billing", "storage", "cache", "his_ehr", "laboratory", "pacs"] as const;
type IntegrationKey = (typeof integrationKeys)[number];

function isIntegrationKey(value: string): value is IntegrationKey {
  return integrationKeys.includes(value as IntegrationKey);
}

const integrationIcons: Record<string, LucideIcon> = {
  email: Mail,
  sms: MessageSquare,
  billing: CreditCard,
  storage: HardDrive,
  cache: Database,
  his_ehr: Stethoscope,
  laboratory: FlaskConical,
  pacs: ImageIcon,
};

export default async function IntegrationsPage() {
  const t = await getTranslations("settings.integrations");
  const result = await getAdminInfrastructure();
  if (!result.ok) return <main className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center px-5"><section className="rounded-xl border border-danger/25 bg-surface p-6 text-center" role="alert"><AlertTriangle className="mx-auto size-7 text-danger" aria-hidden="true" /><h1 className="mt-3 text-lg font-extrabold">{t("unavailableTitle")}</h1><p className="mt-2 text-sm text-muted">{result.message || t("unavailableFallback")}</p></section></main>;
  const integrations = result.data.integrations;
  const productionReady = integrations.filter((item) => item.productionReady).length;
  const pending = integrations.filter((item) => item.status === "not_configured").length;

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <SettingsPageHeader title={t("pageTitle")} description={t("pageDescription")} />
      <section className="mt-4 grid min-w-0 gap-2.5 sm:grid-cols-3" aria-label={t("summaryLabel")}>
        {[
          { label: t("detected"), value: integrations.length, icon: Boxes, tone: "text-accent bg-accent-soft" },
          { label: t("productionReady"), value: productionReady, icon: CheckCircle2, tone: "text-success bg-success-soft" },
          { label: t("pending"), value: pending, icon: CircleDashed, tone: "text-warning bg-warning-soft" },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <article className="flex min-w-0 items-center gap-3 rounded-xl border border-line bg-surface p-3.5" key={item.label}>
              <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${item.tone}`} aria-hidden="true">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-2xs font-bold text-muted">{item.label}</p>
                <p className="mt-0.5 font-mono text-xl font-extrabold">{item.value}</p>
              </div>
            </article>
          );
        })}
      </section>
      <SettingsCard className="mt-4 min-w-0" title={t("inventoryTitle")} description={t("inventoryDescription")} icon={PlugZap} titleId="integration-inventory">
        <ul className="mt-4 grid min-w-0 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {integrations.map((integration) => {
            const Icon = integrationIcons[integration.key] ?? PlugZap;
            const translatedKey = isIntegrationKey(integration.key) ? integration.key : null;
            const name = translatedKey ? t(`items.${translatedKey}.name`) : integration.name;
            const purpose = translatedKey ? t(`items.${translatedKey}.purpose`) : integration.purpose;

            return (
              <li className="min-w-0 rounded-xl border border-line bg-surface-subtle p-3" key={integration.key}>
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface text-accent" aria-hidden="true">
                    <Icon className="size-4" />
                  </span>
                  <span className={`max-w-[65%] shrink-0 rounded-full px-2 py-1 text-center text-2xs font-extrabold ${statusClasses[integration.status]}`}>
                    {t(`status.${integration.status}`)}
                  </span>
                </div>
                <h3 className="mt-3 break-words text-xs font-extrabold">{name}</h3>
                <p className="mt-1 min-h-8 break-words text-2xs leading-4 text-muted">{purpose}</p>
                <dl className="mt-3 border-t border-line pt-2 text-2xs">
                  <div className="flex min-w-0 justify-between gap-3">
                    <dt className="shrink-0 text-muted">{t("adapter")}</dt>
                    <dd className="min-w-0 max-w-[65%] truncate text-right font-mono font-bold">{integration.adapter ?? t("noAdapter")}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      </SettingsCard>
      <p className="mt-4 break-words rounded-lg border border-warning/25 bg-warning-soft/50 p-3 text-2xs leading-5 text-muted"><strong className="text-ink">{t("credentialsTitle")}</strong> {t("credentialsDescription")}</p>
    </div>
   );
}

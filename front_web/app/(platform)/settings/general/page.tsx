import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Bell, Database, Globe, Headphones, Languages, Plug, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { BrandingSettingsForm } from "@/features/platform/ui/platform-product-settings";
import { PlatformRegionCountrySetting } from "@/features/platform/ui/platform-region-settings";
import { SettingsCard, SettingsPageHeader } from "@/features/platform/ui/settings-primitives";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings.general");
  return { title: t("pageTitle") };
}

type QuickModule = {
  key: "languages" | "integrations" | "ai" | "notifications" | "backups" | "support";
  href: string;
  icon: typeof Languages;
};

const QUICK_MODULES: readonly QuickModule[] = [
  { key: "languages", href: "/settings/languages", icon: Languages },
  { key: "integrations", href: "/settings/integrations", icon: Plug },
  { key: "ai", href: "/settings/ai", icon: Sparkles },
  { key: "notifications", href: "/settings/notifications", icon: Bell },
  { key: "backups", href: "/settings/backups", icon: Database },
  { key: "support", href: "/support", icon: Headphones },
];

async function QuickModulesCard() {
  const t = await getTranslations("settings.general");

  return (
    <SettingsCard
      className="mt-4"
      description={t("quickDescription")}
      icon={Globe}
      title={t("quickTitle")}
      titleId="general-quick-modules"
    >
      <ul className="mt-4 grid gap-2.5 min-[26rem]:grid-cols-2 xl:grid-cols-3">
        {QUICK_MODULES.map((module) => {
          const Icon = module.icon;

          return (
            <li key={module.href}>
              <Link
                className="group block h-full rounded-lg border border-line bg-surface-subtle p-3 transition-colors hover:border-accent/60 hover:bg-accent-soft/40 focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-focus"
                href={module.href}
              >
                <span className="flex items-center gap-2">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent" aria-hidden="true">
                    <Icon className="size-3.5" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 truncate text-2xs font-extrabold text-ink">{t(`quick.${module.key}.label`)}</span>
                  <ArrowUpRight className="ml-auto size-3.5 text-accent transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
                <span className="mt-2 block text-2xs leading-4 text-muted">{t(`quick.${module.key}.description`)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </SettingsCard>
  );
}

export default async function GeneralSettingsPage() {
  const t = await getTranslations("settings.general");

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <SettingsPageHeader
        description={t("pageDescription")}
        title={t("pageTitle")}
      />

      <section className="mt-4 flex items-start gap-3 rounded-xl border border-accent/20 border-l-4 bg-accent-soft/55 p-3.5 sm:p-4" aria-label={t("scopeLabel")}>
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface text-accent" aria-hidden="true">
          <Globe className="size-4" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <p className="text-2xs font-extrabold uppercase tracking-[0.12em] text-accent">{t("scopeLabel")}</p>
          <h2 className="mt-1 text-sm font-extrabold tracking-[-0.02em]">{t("scopeTitle")}</h2>
          <p className="mt-1 max-w-3xl text-2xs leading-5 text-muted sm:text-xs">{t("scopeDescription")}</p>
        </div>
      </section>

      <div className="mt-4 grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <BrandingSettingsForm />

        <SettingsCard
          description={t("countryCardDescription")}
          icon={Globe}
          title={t("countryCardTitle")}
          titleId="general-country"
        >
          <div className="mt-4">
            <PlatformRegionCountrySetting />
          </div>
        </SettingsCard>
      </div>

      <QuickModulesCard />
    </div>
  );
}

import type { Metadata } from "next";
import { BarChart3, Building2, Coins, FileText, Globe } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LocalizationSettingsForm } from "@/features/platform/ui/platform-product-settings";
import { PlatformRegionCountrySetting } from "@/features/platform/ui/platform-region-settings";
import { SettingsCard, SettingsPageHeader } from "@/features/platform/ui/settings-primitives";

const CURRENCY_CODES = ["USD", "MXN", "PEN"] as const;
const CURRENCY_SCOPE_ITEMS = [
  { key: "clinic", icon: Building2 },
  { key: "plan", icon: FileText },
  { key: "aggregate", icon: BarChart3 },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings.languagesPage");
  return { title: t("pageTitle") };
}

export default async function LanguagesPage() {
  const t = await getTranslations("settings.languagesPage");

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <SettingsPageHeader title={t("pageTitle")} description={t("pageDescription")} />
      <div className="mt-4 min-w-0"><LocalizationSettingsForm /></div>
      <SettingsCard className="mt-4" title={t("regionTitle")} description={t("regionDescription")} icon={Globe} titleId="language-country">
        <div className="mt-4 min-w-0 max-w-xl"><PlatformRegionCountrySetting /></div>
      </SettingsCard>
      <SettingsCard className="mt-4" title={t("monetaryTitle")} description={t("monetaryDescription")} icon={Coins} titleId="language-monetary">
        <div className="mt-4 grid min-w-0 gap-2.5 sm:grid-cols-3" aria-label={t("currencyListLabel")}>
          {CURRENCY_CODES.map((currency) => (
            <div className="min-w-0 rounded-lg border border-line bg-surface-subtle p-3" key={currency}>
              <p className="font-mono text-xs font-extrabold text-accent">{currency}</p>
              <p className="mt-1 break-words text-2xs leading-4 text-muted">{t(`currencyNames.${currency}`)}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 grid min-w-0 gap-2.5 lg:grid-cols-3">
          {CURRENCY_SCOPE_ITEMS.map(({ key, icon: Icon }) => (
            <div className="flex min-w-0 items-start gap-2.5 rounded-lg border border-line bg-surface p-3" key={key}>
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent" aria-hidden="true">
                <Icon className="size-3.5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <h3 className="text-2xs font-extrabold text-ink">{t(`currencyScopes.${key}.label`)}</h3>
                <p className="mt-1 break-words text-2xs leading-4 text-muted">{t(`currencyScopes.${key}.description`)}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 break-words rounded-lg border border-accent/20 bg-accent-soft/55 p-3 text-xs leading-5 text-muted">{t("monetaryPolicy")}</p>
      </SettingsCard>
    </div>
  );
}

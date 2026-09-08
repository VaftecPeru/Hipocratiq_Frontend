import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AiSettingsForm } from "@/features/platform/ui/platform-product-settings";
import { SettingsPageHeader } from "@/features/platform/ui/settings-primitives";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings.ai");
  return { title: t("pageTitle") };
}

export default async function EpidemiologicalAiPage() {
  const t = await getTranslations("settings.ai");

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <SettingsPageHeader title={t("pageTitle")} description={t("pageDescription")} />
      <div className="mt-4 min-w-0"><AiSettingsForm /></div>
    </div>
  );
}

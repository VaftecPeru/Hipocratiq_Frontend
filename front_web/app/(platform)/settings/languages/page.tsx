import type { Metadata } from "next";
import { LocalizationSettingsForm } from "@/features/platform/ui/platform-product-settings";
import { PlatformRegionCountrySetting } from "@/features/platform/ui/platform-region-settings";
import { SettingsCard, SettingsPageHeader } from "@/features/platform/ui/settings-primitives";
import { Globe } from "lucide-react";

export const metadata: Metadata = { title: "Idiomas y Región" };

export default function LanguagesPage() {
  return <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6"><SettingsPageHeader title="Idiomas y Región" description="Locales y región global obtenidos del backend." /><div className="mt-4"><LocalizationSettingsForm /></div><SettingsCard className="mt-4" title="Región predeterminada" description="Controla la cobertura global y los países visibles en la plataforma." icon={Globe} titleId="language-country"><div className="mt-4 max-w-md"><PlatformRegionCountrySetting /></div></SettingsCard></div>;
}

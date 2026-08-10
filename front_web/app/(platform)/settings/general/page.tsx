import type { Metadata } from "next";
import { BrandingSettingsForm } from "@/features/platform/ui/platform-product-settings";
import { PlatformRegionCountrySetting } from "@/features/platform/ui/platform-region-settings";
import { SettingsCard, SettingsPageHeader } from "@/features/platform/ui/settings-primitives";
import { Globe } from "lucide-react";

export const metadata: Metadata = { title: "Configuración General" };

export default function GeneralSettingsPage() {
  return <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6"><SettingsPageHeader title="Configuración General" description="Identidad y alcance regional persistidos en el backend." /><div className="mt-4"><BrandingSettingsForm /></div><SettingsCard className="mt-4" title="País predeterminado" description="México siempre permanece disponible; el país secundario controla banderas y cobertura." icon={Globe} titleId="general-country"><div className="mt-4 max-w-md"><PlatformRegionCountrySetting /></div></SettingsCard></div>;
}

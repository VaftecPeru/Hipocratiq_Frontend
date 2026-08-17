import type { Metadata } from "next";
import { AiSettingsForm } from "@/features/platform/ui/platform-product-settings";
import { SettingsPageHeader } from "@/features/platform/ui/settings-primitives";

export const metadata: Metadata = { title: "IA Epidemiológica" };

export default function EpidemiologicalAiPage() {
  return <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6"><SettingsPageHeader title="IA Epidemiológica" description="Parámetros persistentes y estado real del servicio de inferencia." /><div className="mt-4"><AiSettingsForm /></div></div>;
}

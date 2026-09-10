import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SpecialtiesPage } from "@/features/specialties/ui/specialties-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("navigation");
  return { title: t("specialties") };
}

export default function Page() {
  return <SpecialtiesPage />;
}

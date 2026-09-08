import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MembershipsView } from "@/features/memberships/ui/memberships-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("navigation");
  return { title: t("memberships") };
}

export default function MembershipsPage() {
  return <MembershipsView />;
}

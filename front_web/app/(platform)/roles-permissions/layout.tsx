import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("navigation");
  return { title: t("accessControl") };
}

export default function RolesPermissionsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}

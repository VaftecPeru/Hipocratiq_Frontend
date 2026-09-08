import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NotificationsCenter } from "@/features/platform/ui/notifications-center";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("navigation");
  return { title: t("notifications") };
}

export default function NotificationsPage() {
  return <NotificationsCenter />;
}

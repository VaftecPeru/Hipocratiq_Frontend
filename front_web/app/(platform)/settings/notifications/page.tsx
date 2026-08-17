import type { Metadata } from "next";
import { NotificationsCenter } from "@/features/platform/ui/notifications-center";

export const metadata: Metadata = { title: "Centro de notificaciones" };

export default function NotificationsPage() {
  return <NotificationsCenter />;
}

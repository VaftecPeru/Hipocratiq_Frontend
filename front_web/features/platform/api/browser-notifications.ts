import { getFromApi, postToApi } from "@/shared/api/http-client";
import type { AdminNotificationCenterData } from "@/features/platform/model/admin-notification.types";

type ApiNotificationResponse = {
  data: Array<{
    id: string;
    type: "audit" | "incident" | "support";
    title: string;
    message: string;
    severity: "warning" | "critical";
    country_code: string | null;
    href: string;
    occurred_at: string;
    read: boolean;
  }>;
  meta: { total: number; unread_count: number; generated_at: string };
};

export async function getAdminNotifications(signal?: AbortSignal): Promise<AdminNotificationCenterData> {
  const payload = await getFromApi<ApiNotificationResponse>("/api/v1/auth/admin/notifications", { signal });

  return {
    notifications: payload.data.map((notification) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      severity: notification.severity,
      countryCode: notification.country_code,
      href: notification.href,
      occurredAt: notification.occurred_at,
      read: notification.read,
    })),
    total: payload.meta.total,
    unreadCount: payload.meta.unread_count,
    generatedAt: payload.meta.generated_at,
  };
}

export async function markAdminNotificationsRead(notificationIds: string[]): Promise<void> {
  if (notificationIds.length === 0) return;
  await postToApi("/api/v1/auth/admin/notifications/read", { notification_ids: notificationIds });
}

export async function markAllAdminNotificationsRead(): Promise<void> {
  await postToApi("/api/v1/auth/admin/notifications/read-all");
}

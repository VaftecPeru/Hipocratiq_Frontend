import { getFromApi, postToApi } from "@/shared/api/http-client";
import type { ClinicalNotificationCenterData } from "@/features/platform/model/clinical-notification.types";
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

type ClinicalNotificationResponse = {
  data: Array<{
    id: string;
    type: "emergency";
    event_key: "emergency_published" | "emergency_activated";
    title_key: string;
    message_key: string;
    severity: "critical";
    href: string;
    payload: {
      clinic_name?: string | null;
      policy_label?: string | null;
      role_key?: string | null;
      note?: string | null;
    };
    clinic: { id: number | null; name: string | null; country_code: string | null };
    occurred_at: string;
    read_at: string | null;
    is_read: boolean;
  }>;
  meta: { unread_count: number };
};

export async function getClinicalNotifications(signal?: AbortSignal): Promise<ClinicalNotificationCenterData> {
  const payload = await getFromApi<ClinicalNotificationResponse>("/api/v1/auth/clinical/notifications", { signal });

  return {
    notifications: payload.data.map((notification) => ({
      id: notification.id,
      type: notification.type,
      eventKey: notification.event_key,
      titleKey: notification.title_key,
      messageKey: notification.message_key,
      severity: notification.severity,
      href: notification.href,
      payload: {
        clinicName: notification.payload?.clinic_name ?? null,
        policyLabel: notification.payload?.policy_label ?? null,
        roleKey: notification.payload?.role_key ?? null,
        note: notification.payload?.note ?? null,
      },
      clinic: {
        id: notification.clinic?.id ?? null,
        name: notification.clinic?.name ?? null,
        countryCode: notification.clinic?.country_code ?? null,
      },
      occurredAt: notification.occurred_at,
      readAt: notification.read_at,
      read: notification.is_read,
    })),
    unreadCount: payload.meta.unread_count,
  };
}

export async function markClinicalNotificationsRead(notificationIds: string[]): Promise<void> {
  if (notificationIds.length === 0) return;
  await postToApi("/api/v1/auth/clinical/notifications/read", { notification_ids: notificationIds });
}

export async function markAllClinicalNotificationsRead(): Promise<void> {
  await postToApi("/api/v1/auth/clinical/notifications/read-all");
}

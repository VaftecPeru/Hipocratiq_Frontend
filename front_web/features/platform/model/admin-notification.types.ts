export type AdminNotificationType = "audit" | "incident" | "support";
export type AdminNotificationSeverity = "warning" | "critical";

export type AdminNotification = {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  severity: AdminNotificationSeverity;
  countryCode: string | null;
  href: string;
  occurredAt: string;
  read: boolean;
};

export type AdminNotificationCenterData = {
  notifications: AdminNotification[];
  total: number;
  unreadCount: number;
  generatedAt: string;
};

export type ClinicalNotificationEventKey = "emergency_published" | "emergency_activated";
export type ClinicalNotificationSeverity = "critical";

export type ClinicalNotification = {
  id: string;
  type: "emergency";
  eventKey: ClinicalNotificationEventKey;
  titleKey: string;
  messageKey: string;
  severity: ClinicalNotificationSeverity;
  href: string;
  payload: {
    clinicName: string | null;
    policyLabel: string | null;
    roleKey: string | null;
    note: string | null;
  };
  clinic: {
    id: number | null;
    name: string | null;
    countryCode: string | null;
  };
  occurredAt: string;
  readAt: string | null;
  read: boolean;
};

export type ClinicalNotificationCenterData = {
  notifications: ClinicalNotification[];
  unreadCount: number;
};

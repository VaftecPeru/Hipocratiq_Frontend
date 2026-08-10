export type EmergencyPolicy = {
  enabled: boolean;
  visibility: "reception_doctors_admins" | "doctors_admins" | "admins_only";
  color: "#EF2F3F" | "#F97316" | "#7C3AED";
  inheritance: "workflow_and_responsibles" | "responsibles_only" | "locked";
  defaultChannel: "priority_push" | "internal_alert" | "email" | "sms";
  escalationMinutes: 1 | 3 | 5 | 10;
};

export type EmergencyPolicyData = {
  policy: EmergencyPolicy;
  responsibles: Array<{ role: string; channel: string }>;
  publishedAt: string | null;
  stats: { activeClinics: number; enabledClinics: number; policyChangesToday: number };
};

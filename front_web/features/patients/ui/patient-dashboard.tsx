"use client";

import type { AuthenticatedUser } from "@/features/auth/model/auth.types";
import { PatientPortalView } from "./patient-portal";

export function PatientDashboard({ user }: { user: AuthenticatedUser }) {
  return <PatientPortalView user={user} view="dashboard" />;
}

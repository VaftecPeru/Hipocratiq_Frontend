import type { AuthenticatedSession } from "@/features/auth/model/auth.types";

export function dashboardPathForActorContext(
  actorContext: AuthenticatedSession["actor_context"],
): string {
  return actorContext === "clinic_admin" || actorContext === "receptionist"
    ? "/clinic/dashboard"
    : actorContext === "doctor"
      ? "/doctor/dashboard"
      : actorContext === "patient"
        ? "/patient/dashboard"
        : "/dashboard";
}

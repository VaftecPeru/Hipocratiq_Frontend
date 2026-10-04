import type { AuthenticatedSession } from "@/features/auth/model/auth.types";

export function dashboardPathForActorContext(
  actorContext: AuthenticatedSession["actor_context"],
): string {
  switch (actorContext) {
    case "clinic_admin":
    case "receptionist":
      return "/clinic/dashboard";
    case "doctor":
      return "/doctor/dashboard";
    case "patient":
      return "/patient/dashboard";
    case "staff":
      return "/dashboard";
    default:
      return "/unauthorized";
  }
}

export type ClinicRole = "clinic_admin" | "receptionist";

export function dashboardPathForSession(
  session: Pick<AuthenticatedSession, "actor_context" | "user">,
): string {
  if ((session.actor_context === "clinic_admin" || session.actor_context === "receptionist") && !session.user.clinic) {
    return "/unauthorized?reason=clinic-context-required";
  }

  if (session.actor_context === "doctor" && !session.user.doctor) {
    return "/unauthorized?reason=doctor-profile-required";
  }

  return dashboardPathForActorContext(session.actor_context);
}

export function clinicAccessRedirectForSession(
  session: AuthenticatedSession | null,
  roles: readonly ClinicRole[],
): string | null {
  if (!session) return "/";

  const context = session.actor_context;
  if (context !== "clinic_admin" && context !== "receptionist") {
    return dashboardPathForSession(session);
  }
  if (!session.user.clinic) return "/unauthorized?reason=clinic-context-required";
  if (!roles.includes(context)) return "/unauthorized";

  return null;
}

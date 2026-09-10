export const SUPERADMIN_NAVIGATION_INVALIDATED_EVENT = "hipocratiq:superadmin-navigation-invalidated";

export type SuperadminNavigationScope =
  | "clinics"
  | "specialties"
  | "users"
  | "access-control"
  | "audit"
  | "emergency"
  | "support";

export function notifySuperadminNavigationMutation(
  scopes: readonly SuperadminNavigationScope[],
): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(SUPERADMIN_NAVIGATION_INVALIDATED_EVENT, { detail: { scopes } }));
}

export function notifySuperadminClinicMutation(): void {
  notifySuperadminNavigationMutation(["clinics"]);
}

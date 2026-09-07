export const SUPERADMIN_NAVIGATION_CACHE_EVENT = "hipocratiq:superadmin-navigation-cache-invalidated";

export function notifySuperadminClinicMutation(): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(SUPERADMIN_NAVIGATION_CACHE_EVENT, { detail: { scope: "clinics" } }));
}

import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
import { StatusPage } from "@/shared/ui/status-page";
import { getTranslations } from "next-intl/server";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { dashboardPathForSession } from "@/features/auth/lib/dashboard-path";
import { LogoutButton } from "@/features/auth/ui/logout-button";

export const metadata: Metadata = {
  title: "Acceso no autorizado",
  description: "No tienes autorización para acceder a esta sección de Hipocratiq.",
};

export default async function UnauthorizedPage() {
  const session = await getAuthenticatedSession();
  const dashboardHref = session ? dashboardPathForSession(session) : undefined;
  const unresolvedContext = dashboardHref?.startsWith("/unauthorized") ?? false;
  const t = await getTranslations("status.unauthorized");

  return (
    <StatusPage
      code="403"
      status="unauthorized"
      icon={LockKeyhole}
      primaryHref={unresolvedContext ? undefined : "/"}
      secondaryHref={unresolvedContext ? undefined : dashboardHref}
      detail={unresolvedContext ? t(dashboardHref?.includes("clinic-context-required") ? "clinicContextDetail" : "accountContextDetail") : undefined}
      recoveryAction={session ? <LogoutButton /> : undefined}
    />
  );
}

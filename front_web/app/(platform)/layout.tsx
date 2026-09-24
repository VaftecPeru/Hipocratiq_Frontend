import { redirect } from "next/navigation";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { PlatformShell } from "@/features/platform/ui/platform-shell";
import { dashboardPathForActorContext } from "@/features/auth/lib/dashboard-path";

export default async function PlatformLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getAuthenticatedSession();

  if (!session) {
    redirect("/");
  }

  if (session.actor_context !== "staff") {
    redirect(dashboardPathForActorContext(session.actor_context));
  }

  return <PlatformShell userName={session.user.name}>{children}</PlatformShell>;
}

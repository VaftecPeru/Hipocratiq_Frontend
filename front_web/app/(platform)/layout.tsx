import { redirect } from "next/navigation";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { PlatformShell } from "@/features/platform/ui/platform-shell";

export default async function PlatformLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getAuthenticatedSession();

  if (!session) {
    redirect("/");
  }

  if (session.actor_context === "clinic_admin") {
    redirect("/clinic/dashboard");
  }

  return <PlatformShell userName={session.user.name}>{children}</PlatformShell>;
}

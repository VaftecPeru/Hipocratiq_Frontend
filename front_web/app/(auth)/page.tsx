import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginFlow } from "@/features/auth/ui/login-flow";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { AuthVisualPanel } from "@/features/auth/ui/auth-visual-panel";
import { PreferenceControls } from "@/shared/ui/preference-controls";
import { dashboardPathForSession } from "@/features/auth/lib/dashboard-path";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

type HomeProps = {
  searchParams: Promise<{ role?: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const session = await getAuthenticatedSession();
  if (session) redirect(dashboardPathForSession(session));

  const requestedRole = await searchParams;
  const initialLoginRole = (Array.isArray(requestedRole.role) ? requestedRole.role[0] : requestedRole.role) === "support" ? "support" : "healthcare";
  const currentYear = new Date().getFullYear();

  return (
    <main id="main-content" className="min-h-dvh bg-surface min-[1100px]:grid min-[1100px]:grid-cols-2">
      <section className="relative flex min-h-dvh min-w-0 flex-col bg-surface px-[clamp(1.25rem,4vw,4.5rem)] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]" aria-label="Inicio de sesión">
        <header className="flex min-h-16 items-center justify-end gap-3 py-3" aria-label="Utilidades de autenticación">
          <PreferenceControls className="shrink-0" idPrefix="auth-login" menuAlign="right" />
        </header>
        <div className="mx-auto flex w-full max-w-[42rem] flex-1 items-center py-5 sm:py-8">
          <LoginFlow key={initialLoginRole} initialRole={initialLoginRole} />
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line/70 py-4 text-xs text-ink-secondary">
          <span>© {currentYear} HipocratiQ</span>
          <Link href="/?role=support" className="min-h-9 content-center font-medium hover:text-accent focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring">Acceso superadministrador</Link>
        </footer>
      </section>
      <AuthVisualPanel />
    </main>
  );
}

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

  if (session) {
    redirect(dashboardPathForSession(session));
  }

  const requestedRole = await searchParams;
  const initialLoginRole = (Array.isArray(requestedRole.role) ? requestedRole.role[0] : requestedRole.role) === "support" ? "support" : "healthcare";
  const currentYear = new Date().getFullYear();

  return (
    <main id="main-content" className="auth-login-shell fixed inset-0 grid overflow-hidden bg-surface min-[900px]:grid-cols-[minmax(24rem,46fr)_minmax(0,54fr)]">
      <section className="auth-login-form-panel grid h-dvh min-h-0 grid-rows-[auto_1fr_auto] overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]" aria-label="Inicio de sesión">
        <header className="relative z-30 flex flex-wrap items-center justify-end gap-3 px-[clamp(1.25rem,5vw,4.5rem)] pt-4 pb-2 text-2xs text-footer-text sm:pt-6" aria-label="Utilidades de autenticación">
          <PreferenceControls className="shrink-0" idPrefix="auth-login" menuAlign="right" />
        </header>

        <div className="grid min-h-0 place-items-center overflow-y-auto overscroll-contain px-[clamp(1.25rem,4.5vw,4rem)] py-[clamp(1.4rem,3.5vh,2.6rem)] scrollbar-none max-sm:items-start max-sm:pt-8 [&::-webkit-scrollbar]:hidden">
          <LoginFlow key={initialLoginRole} initialRole={initialLoginRole} />
        </div>

        <footer className="flex min-h-12 flex-wrap items-center justify-between gap-x-3 gap-y-1 px-[clamp(1.25rem,4vw,3rem)] py-1 text-2xs text-footer-text">
          <span className="shrink-0 whitespace-nowrap">© {currentYear} Hipocratiq</span>
          <Link href="/?role=support" className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap transition-colors hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring">Superadministrador</Link>
        </footer>
      </section>

      <AuthVisualPanel />
    </main>
  );
}

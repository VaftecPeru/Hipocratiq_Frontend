import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PasswordResetFlow } from "@/features/auth/ui/password-reset-flow";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { AuthVisualPanel } from "@/features/auth/ui/auth-visual-panel";
import { PreferenceControls } from "@/shared/ui/preference-controls";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
};

export default async function RecoverPage() {
  const session = await getAuthenticatedSession();

  if (session) {
    redirect(
      session.actor_context === "clinic_admin"
        ? "/clinic/dashboard"
        : session.actor_context === "doctor"
          ? "/doctor/dashboard"
          : session.actor_context === "patient"
            ? "/patient/dashboard"
            : "/dashboard",
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <main id="main-content" className="fixed inset-0 grid overflow-hidden bg-surface min-[900px]:grid-cols-[minmax(34rem,38%)_1fr]">
      <section
        className="grid h-dvh min-h-0 grid-rows-[auto_1fr_auto] overflow-hidden bg-surface pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
        aria-label="Recuperar contraseña"
      >
        <header className="relative z-30 flex flex-wrap items-center justify-end gap-2 px-[clamp(1.25rem,5vw,3.25rem)] pt-4 pb-2 text-2xs text-footer-text sm:pt-6" aria-label="Utilidades de autenticación">
          <PreferenceControls className="shrink-0" idPrefix="auth-recover" menuAlign="right" />
        </header>

        <div className="grid min-h-0 place-items-center overflow-y-auto px-[clamp(1.25rem,6vw,4.5rem)] py-[clamp(2.5rem,6vh,5rem)] max-sm:items-start max-sm:pt-12">
          <PasswordResetFlow />
        </div>

        <footer className="flex min-h-12 items-center justify-between gap-3 px-[clamp(1.25rem,4vw,3rem)] py-1 text-2xs text-footer-text">
          <span className="shrink-0 whitespace-nowrap">© {currentYear} Hipocratiq</span>
          <Link href="/?role=support" className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap transition-colors hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring">Soporte</Link>
        </footer>
      </section>

      <AuthVisualPanel />
    </main>
  );
}

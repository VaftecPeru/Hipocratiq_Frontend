import Link from "next/link";
import { redirect } from "next/navigation";
import { PasswordResetFlow } from "@/features/auth/ui/password-reset-flow";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { AuthVisualPanel } from "@/features/auth/ui/auth-visual-panel";

export const metadata = {
  title: "Recuperar contraseña — Hipocratiq",
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

  return (
    <main className="fixed inset-0 grid overflow-hidden bg-white min-[900px]:grid-cols-[minmax(34rem,38%)_1fr]">
      <section
        className="grid h-dvh min-h-0 grid-rows-[1fr_auto] overflow-hidden bg-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
        aria-label="Recuperar contraseña"
      >
        <div className="grid min-h-0 place-items-center overflow-y-auto px-[clamp(1.25rem,6vw,4.5rem)] py-[clamp(2.5rem,6vh,5rem)] max-sm:items-start max-sm:pt-12">
          <PasswordResetFlow />
        </div>

        <footer className="flex min-h-16 items-center justify-between gap-4 px-[clamp(1.25rem,4vw,3rem)] text-2xs text-footer-text max-sm:flex-col max-sm:items-start max-sm:py-4">
          <span>© 2026 Hipocratiq</span>
          <div className="flex gap-5">
            <Link href="/soporte" className="transition-colors hover:text-ink">Soporte</Link>
            <Link href="/seguridad" className="transition-colors hover:text-ink">Seguridad</Link>
          </div>
        </footer>
      </section>

      <AuthVisualPanel />
    </main>
  );
}

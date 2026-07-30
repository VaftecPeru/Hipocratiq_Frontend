import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginFlow } from "@/features/auth/ui/login-flow";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { AuthVisualPanel } from "@/features/auth/ui/auth-visual-panel";

export default async function Home() {
  const session = await getAuthenticatedSession();

  if (session) {
    redirect(session.actor_context === "clinic_admin" ? "/clinic/dashboard" : session.actor_context === "doctor" ? "/doctor/dashboard" : session.actor_context === "patient" ? "/patient/dashboard" : "/dashboard");
  }

  return (
    <main className="fixed inset-0 grid overflow-hidden bg-white min-[900px]:grid-cols-[minmax(34rem,38%)_1fr]">
      <section className="grid h-dvh min-h-0 grid-rows-[1fr_auto] overflow-hidden bg-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]" aria-label="Inicio de sesión">
        <div className="grid min-h-0 place-items-center overflow-y-auto overscroll-contain px-[clamp(1.25rem,6vw,4.5rem)] py-[clamp(1.5rem,4vh,3rem)] scrollbar-none max-sm:items-start max-sm:pt-8 [&::-webkit-scrollbar]:hidden">
          <LoginFlow />
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

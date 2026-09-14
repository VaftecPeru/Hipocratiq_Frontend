import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginFlow } from "@/features/auth/ui/login-flow";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { AuthPlatformSettingsProvider } from "@/features/auth/ui/auth-platform-settings";
import { AuthVisualPanel } from "@/features/auth/ui/auth-visual-panel";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

type HomeProps = {
  searchParams: Promise<{ role?: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const session = await getAuthenticatedSession();

  if (session) {
    redirect(session.actor_context === "clinic_admin" || session.actor_context === "receptionist" ? "/clinic/dashboard" : session.actor_context === "doctor" ? "/doctor/dashboard" : session.actor_context === "patient" ? "/patient/dashboard" : "/dashboard");
  }

  const requestedRole = await searchParams;
  const initialLoginRole = (Array.isArray(requestedRole.role) ? requestedRole.role[0] : requestedRole.role) === "support" ? "support" : "healthcare";
  const currentYear = new Date().getFullYear();

  return (
    <AuthPlatformSettingsProvider>
      <main className="fixed inset-0 grid overflow-hidden bg-white min-[900px]:grid-cols-2">
        <section className="grid h-dvh min-h-0 grid-rows-[1fr_auto] overflow-hidden bg-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]" aria-label="Inicio de sesión">
          <div className="grid min-h-0 place-items-center overflow-y-auto overscroll-contain px-[clamp(1.25rem,5vw,4.5rem)] py-[clamp(1.5rem,4vh,3rem)] scrollbar-none max-sm:items-start max-sm:pt-8 [&::-webkit-scrollbar]:hidden">
            <LoginFlow key={initialLoginRole} initialRole={initialLoginRole} />
          </div>

          <footer className="flex min-h-12 items-center justify-between gap-3 px-[clamp(1.25rem,4vw,3rem)] py-1 text-2xs text-footer-text">
            <span className="shrink-0 whitespace-nowrap">© {currentYear} Hipocratiq</span>
            <Link href="/?role=support" className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap transition-colors hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring">Superadministrador / Soporte</Link>
          </footer>
        </section>

        <AuthVisualPanel />
      </main>
    </AuthPlatformSettingsProvider>
  );
}

import { redirect } from "next/navigation";
import { LoginFlow } from "@/features/auth/ui/login-flow";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { AuthVisualPanel } from "@/features/auth/ui/auth-visual-panel";

export default async function Home() {
  const session = await getAuthenticatedSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="grid h-dvh overflow-hidden bg-white min-[900px]:grid-cols-[minmax(30rem,34%)_1fr]">
      <section className="grid h-dvh min-h-0 grid-rows-[1fr_auto] overflow-hidden bg-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]" aria-label="Inicio de sesión">
        <div className="grid min-h-0 place-items-center overflow-y-auto px-[clamp(1.25rem,6vw,4.5rem)] py-[clamp(2.5rem,6vh,5rem)] max-sm:items-start max-sm:pt-12">
          <LoginFlow />
        </div>

        <footer className="flex min-h-16 items-center justify-between gap-4 px-[clamp(1.25rem,4vw,3rem)] text-[0.58rem] text-[#91a0b8] max-sm:flex-col max-sm:items-start max-sm:py-4">
          <span>© 2026 Hipocratiq</span>
          <div className="flex gap-5">
            <span>Soporte</span>
            <span>Seguridad</span>
          </div>
        </footer>
      </section>

      <AuthVisualPanel />
    </main>
  );
}

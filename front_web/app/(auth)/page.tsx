import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { LoginFlow } from "@/features/auth/ui/login-flow";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";

export default async function Home() {
  const session = await getAuthenticatedSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="grid h-svh overflow-hidden bg-white min-[900px]:grid-cols-[minmax(25rem,41%)_1fr]">
      <section className="grid h-svh min-h-0 grid-rows-[1fr_auto] overflow-hidden bg-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]" aria-label="Inicio de sesión">
        <div className="grid min-h-0 place-items-center overflow-y-auto px-[clamp(1.25rem,6vw,4.5rem)] py-[clamp(1.5rem,5vh,3.5rem)] max-sm:items-start max-sm:pt-8">
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

      <aside className="relative hidden h-svh overflow-hidden bg-[radial-gradient(circle_at_72%_15%,rgb(255_255_255/34%),transparent_27%),linear-gradient(155deg,#dceaff_0%,#77a9eb_53%,#1265d3_100%)] min-[900px]:block" aria-label="Seguridad de la plataforma">
        <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/7%)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/7%)_1px,transparent_1px)] bg-[size:4rem_4rem] mask-[linear-gradient(to_bottom,transparent,black_35%,black)]" aria-hidden="true" />

        <div className="absolute top-5 right-6 z-10 flex min-h-9 items-center gap-3 rounded-full border border-white/55 bg-white/75 px-4 text-[0.61rem] font-bold text-[#496584] backdrop-blur-xl">
          <span>PE</span>
          <span className="h-3.5 w-px bg-[#c3d2e5]" aria-hidden="true" />
          <span>ES</span>
        </div>

        <div className="absolute right-[clamp(2rem,12%,9rem)] bottom-[clamp(3rem,12vh,8rem)] z-10 w-[min(24rem,calc(100%_-_4rem))] rounded-[1.1rem] border border-white/30 bg-white/15 p-7 text-white shadow-[0_1.2rem_3.5rem_rgb(6_42_102/18%)] backdrop-blur-2xl">
          <span className="mb-5 grid size-10 place-items-center rounded-xl bg-white/15" aria-hidden="true">
            <ShieldCheck className="size-6" strokeWidth={1.7} />
          </span>
          <h2 className="text-base font-bold tracking-[-0.025em]">Seguridad de grado médico</h2>
          <p className="mt-2 max-w-76 text-[0.68rem] leading-5 text-white/70">Tu acceso está protegido con contraseña, verificación en dos pasos y sesiones cifradas.</p>
          <div className="mt-5 flex items-center gap-2 text-[0.61rem] font-bold">
            <span className="size-2 rounded-full bg-[#b9f7dd] shadow-[0_0_0_0.2rem_rgb(185_247_221/16%)]" aria-hidden="true" />
            Sistema operativo
          </div>
        </div>
      </aside>
    </main>
  );
}

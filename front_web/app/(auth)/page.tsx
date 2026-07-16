import { redirect } from "next/navigation";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import MexicoFlag from "country-flag-icons/react/3x2/MX";
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

      <aside className="relative hidden h-svh overflow-hidden bg-[linear-gradient(155deg,#e4eefb_0%,#b8d4f5_40%,#8ab8ef_100%)] min-[900px]:block" aria-label="Vista previa de la plataforma">
        <div className="absolute top-5 right-6 z-10 flex min-h-9 items-center gap-2 rounded-full border border-white/55 bg-white/75 px-3.5 text-[0.61rem] font-bold text-[#496584] backdrop-blur-xl">
          <MexicoFlag className="h-3 w-4.5 rounded-[2px]" aria-hidden="true" />
          <span>MX</span>
          <span className="h-3.5 w-px bg-[#c3d2e5]" aria-hidden="true" />
          <span>ES</span>
        </div>

        <div className="absolute top-[clamp(5rem,18%,10rem)] right-[clamp(2rem,8%,5rem)] left-[clamp(2rem,8%,5rem)] z-10 flex items-center justify-center">
          <Image
            className="h-auto w-full max-w-[38rem] rounded-xl object-contain"
            src="/plateral-login.webp"
            alt="Panel de control Hipocratiq"
            width={1136}
            height={720}
            priority
          />
        </div>

        <div className="absolute bottom-[clamp(2rem,6vh,4rem)] left-[clamp(1.5rem,6%,4rem)] z-10 w-[min(20rem,calc(100%_-_3rem))] rounded-xl border border-white/30 bg-white/20 p-5 text-white shadow-[0_1rem_3rem_rgb(6_42_102/12%)] backdrop-blur-2xl">
          <span className="mb-3 grid size-9 place-items-center rounded-lg bg-white/20" aria-hidden="true">
            <ShieldCheck className="size-5" strokeWidth={1.7} />
          </span>
          <h2 className="text-[0.82rem] font-bold tracking-[-0.015em]">Seguridad de grado médico</h2>
          <p className="mt-1 max-w-64 text-[0.6rem] leading-[1.6] text-white/75">Toda la información de tus pacientes está encriptada de extremo a extremo cumpliendo con las normativas HIPAA y GDPR.</p>
        </div>
      </aside>
    </main>
  );
}

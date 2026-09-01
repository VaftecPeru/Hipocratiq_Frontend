import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export function AuthVisualPanel() {
  return (
    <aside
      className="relative hidden h-dvh min-h-0 overflow-hidden bg-[linear-gradient(155deg,#e4eefb_0%,#a8c9f2_45%,#3178d8_100%)] min-[900px]:block"
      aria-label="Vista previa de la plataforma"
    >
      <div className="absolute top-[clamp(5rem,16%,8.5rem)] right-[clamp(1.5rem,8%,5rem)] left-[clamp(1.5rem,8%,5rem)] z-10 flex items-center justify-center">
        <Image
          className="h-auto w-full max-w-[38rem] rounded-xl object-contain"
          src="/plateral-login.webp"
          alt="Panel de control Hipocratiq"
          width={1136}
          height={720}
        />
      </div>

      <div className="absolute bottom-[clamp(2rem,6vh,4rem)] left-[clamp(1.5rem,7%,4rem)] z-10 w-[min(20rem,calc(100%_-_3rem))] rounded-xl border border-white/30 bg-white/20 p-5 text-white shadow-[0_1rem_3rem_rgb(6_42_102/14%),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-2xl">
        <span className="mb-3 grid size-9 place-items-center rounded-lg bg-white/20" aria-hidden="true">
          <ShieldCheck className="size-5" strokeWidth={1.7} />
        </span>
        <h2 className="text-sm font-bold tracking-[-0.015em]">Seguridad de grado médico</h2>
        <p className="mt-1 max-w-64 text-2xs leading-[1.6] text-white/80">
          Toda la información de tus pacientes está encriptada de extremo a extremo cumpliendo con las normativas HIPAA y GDPR.
        </p>
      </div>
    </aside>
  );
}

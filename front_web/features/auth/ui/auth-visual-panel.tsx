import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export function AuthVisualPanel() {
  return (
    <aside
      className="relative hidden h-dvh min-h-0 overflow-hidden bg-[#dce9f8] min-[900px]:block"
      aria-label="Vista previa de la plataforma"
    >
      <Image
        className="absolute inset-0 size-full object-cover object-center"
        src="/plateral-login.webp"
        alt="Vista del panel clínico de HIPOCRATIQ"
        fill
        priority
        sizes="60vw"
      />

      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,32,76,0.04)_0%,rgba(0,82,204,0.12)_48%,rgba(0,54,135,0.72)_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_70%_22%,rgba(255,255,255,0.22),transparent_38%)]"
        aria-hidden="true"
      />

      <div className="absolute right-[clamp(2rem,5vw,4.5rem)] bottom-[clamp(2rem,6vh,4rem)] left-[clamp(2rem,5vw,4rem)] z-10 max-w-[28rem] rounded-2xl border border-white/25 bg-white/14 p-7 text-white shadow-[0_1.5rem_4rem_rgb(0_27_76/28%),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md">
        <span className="mb-5 grid size-12 place-items-center rounded-xl bg-white/18" aria-hidden="true">
          <ShieldCheck className="size-5" strokeWidth={1.8} />
        </span>
        <h2 className="text-[clamp(1.15rem,2vw,1.5rem)] font-extrabold tracking-[-0.025em]">
          Seguridad de grado médico
        </h2>
        <p className="mt-3 max-w-[24rem] text-sm leading-6 text-white/82">
          Protección de información clínica mediante cifrado, control de acceso, trazabilidad y sesiones seguras,
          preparada para políticas de seguridad y privacidad del entorno sanitario.
        </p>
      </div>
    </aside>
  );
}

"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Activity, LockKeyhole, ShieldCheck } from "lucide-react";

export function AuthVisualPanel() {
  const reducedMotion = useReducedMotion();

  return (
    <aside
      className="relative hidden h-dvh min-h-0 overflow-hidden bg-[#051c42] min-[950px]:block"
      aria-label="Vista previa de la plataforma clínica"
    >
      <motion.div
        className="absolute inset-0"
        initial={reducedMotion ? false : { opacity: 0.7, scale: 1.035 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.85, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <Image
          className="size-full object-cover object-center"
          src="/plateral-login.webp"
          alt="Vista ilustrativa del panel clínico HIPOCRATIQ"
          fill
          priority
          sizes="(min-width: 1280px) 43vw, (min-width: 950px) 38vw, 0px"
        />
      </motion.div>

      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,16,43,0.08)_0%,rgba(0,49,118,0.18)_40%,rgba(0,27,77,0.87)_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_84%_19%,rgba(63,157,255,0.25),transparent_42%)]"
        aria-hidden="true"
      />

      <motion.div
        className="absolute top-[clamp(1.5rem,5vh,4rem)] right-[clamp(1.25rem,4vw,3.5rem)] z-10 inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#072859]/70 px-3 py-2 text-xs font-semibold tracking-wide text-white/90 shadow-lg backdrop-blur-md"
        initial={reducedMotion ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.5 }}
      >
        <Activity className="size-4 text-[#7ed4ff]" strokeWidth={1.8} aria-hidden="true" />
        HIPOCRATIQ · Web + App
      </motion.div>

      <motion.div
        className="absolute right-[clamp(1rem,3vw,3.2rem)] bottom-[clamp(1.5rem,5vh,3.4rem)] left-[clamp(1rem,3vw,3.2rem)] z-10 max-w-[32rem] rounded-[1.35rem] border border-white/30 bg-[#153c74]/70 p-[clamp(1rem,2.4vw,2rem)] text-white shadow-[0_1.5rem_4rem_rgb(0_15_52/32%),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl"
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-3 flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/20 bg-[#096df0]/70" aria-hidden="true">
            <ShieldCheck className="size-6" strokeWidth={1.8} />
          </span>
          <h2 className="text-[clamp(1rem,1.8vw,1.5rem)] font-extrabold tracking-[-0.025em]">
            Seguridad de grado médico
          </h2>
        </div>
        <p className="max-w-[29rem] text-xs leading-5 text-white/85 sm:text-sm sm:leading-6">
          Protección de información clínica mediante cifrado, control de acceso y trazabilidad,
          diseñada para un entorno sanitario moderno.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/20 pt-3 text-[0.68rem] font-medium text-white/85">
          <span className="inline-flex items-center gap-1.5"><LockKeyhole className="size-3.5 text-[#92d7ff]" aria-hidden="true" /> Datos cifrados</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-[#92d7ff]" aria-hidden="true" /> Accesos controlados</span>
        </div>
      </motion.div>
    </aside>
  );
}

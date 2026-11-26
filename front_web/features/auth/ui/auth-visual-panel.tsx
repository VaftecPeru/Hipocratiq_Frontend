"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { CalendarDays, ClipboardPlus, FileSignature, ShieldCheck, Sparkles } from "lucide-react";

const FEATURES = [
  { icon: ClipboardPlus, title: "Historia clínica electrónica", description: "Información clínica centralizada y trazable." },
  { icon: CalendarDays, title: "Gestión de citas", description: "Agenda y seguimiento de consultas." },
  { icon: Sparkles, title: "Asistente con IA", description: "Herramientas de apoyo a la práctica clínica." },
  { icon: FileSignature, title: "Firma digital", description: "Gestión de consentimientos y documentos." },
  { icon: ShieldCheck, title: "Seguridad y control de acceso", description: "Acceso por roles y seguimiento de actividad." },
] as const;

export function AuthVisualPanel() {
  const reducedMotion = useReducedMotion();

  return (
    <aside className="relative hidden min-h-dvh min-w-0 overflow-hidden bg-[#06295a] text-white min-[1100px]:block" aria-label="Características de HIPOCRATIQ">
      <Image
        src="/plateral-login.webp"
        alt="Imagen ilustrativa de la plataforma de atención clínica"
        fill
        priority
        sizes="50vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,26,67,0.96)_0%,rgba(5,45,103,0.88)_50%,rgba(0,41,97,0.32)_100%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_12%,rgba(25,148,255,0.22),transparent_45%)]" aria-hidden="true" />
      <motion.div
        className="relative z-10 flex min-h-dvh max-w-[42rem] flex-col justify-center px-[clamp(2rem,4vw,4.5rem)] py-16"
        initial={reducedMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="max-w-[33rem] text-[clamp(2rem,3vw,3rem)] leading-[1.13] font-extrabold tracking-[-0.04em]">
          Tu expediente clínico digital <span className="block text-[#52e4ff]">más inteligente</span>
        </h2>
        <p className="mt-5 max-w-[32rem] text-base leading-7 text-white/90">
          Gestiona consultas, historias clínicas, citas y documentos desde una plataforma de salud con herramientas de inteligencia artificial.
        </p>
        <ul className="mt-10 grid gap-5">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex items-center gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-sky-300/25 bg-sky-400/15 shadow-inner backdrop-blur-sm" aria-hidden="true">
                <Icon className="size-7 text-[#9ce6ff]" strokeWidth={1.7} />
              </span>
              <span>
                <strong className="block text-base font-bold">{title}</strong>
                <span className="mt-1 block text-sm leading-5 text-white/85">{description}</span>
              </span>
            </li>
          ))}
        </ul>
      </motion.div>
    </aside>
  );
}

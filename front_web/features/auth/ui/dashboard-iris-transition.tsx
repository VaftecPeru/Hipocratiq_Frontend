"use client";

import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";

/**
 * La transición sólo se muestra después de verificar OTP y al pulsar
 * "Ir al dashboard". Nunca revela datos del dashboard antes de autenticar.
 */
export function DashboardIrisTransition({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      data-testid="dashboard-iris-transition"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_48%,#167cf5_0%,#0757d7_46%,#061e4c_100%)]"
      initial={{ clipPath: "circle(0% at 50% 54%)" }}
      animate={{ clipPath: "circle(155% at 50% 54%)" }}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={onComplete}
    >
      <motion.span
        className="grid size-20 place-items-center rounded-[1.5rem] border border-white/30 bg-white/15 text-white shadow-[0_1.5rem_5rem_rgb(0_20_65/30%)] backdrop-blur-sm"
        initial={{ opacity: 0, scale: 0.78 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.22 }}
      >
        <ShieldCheck className="size-10" strokeWidth={1.6} />
      </motion.span>
    </motion.div>
  );
}

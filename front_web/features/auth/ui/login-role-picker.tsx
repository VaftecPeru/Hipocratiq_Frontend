"use client";

import { motion, useReducedMotion } from "motion/react";
import { Building2, ClipboardList, ShieldCheck, Stethoscope, UserRound } from "lucide-react";
import type { LoginRole } from "@/features/auth/model/auth.types";

type LoginRoleOption = {
  value: LoginRole;
  label: { es: string; en: string };
  description: { es: string; en: string };
  icon: typeof ShieldCheck;
};

const ROLE_OPTIONS: readonly LoginRoleOption[] = [
  { value: "administrator", label: { es: "Administrador de clínica", en: "Clinic administrator" }, description: { es: "Gestión de clínica o institución", en: "Manage a clinic or institution" }, icon: Building2 },
  { value: "healthcare", label: { es: "Profesional de salud", en: "Healthcare professional" }, description: { es: "Médico con acceso clínico", en: "Clinical access for doctors" }, icon: Stethoscope },
  { value: "receptionist", label: { es: "Recepción", en: "Reception" }, description: { es: "Agenda y atención clínica", en: "Appointments and check-in" }, icon: ClipboardList },
  { value: "patient", label: { es: "Paciente", en: "Patient" }, description: { es: "Accede a tu historial clínico", en: "Access your medical records" }, icon: UserRound },
];

const SUPPORT_ROLE: LoginRoleOption = {
  value: "support",
  label: { es: "Superadministrador", en: "Superadministrator" },
  description: { es: "Administración de la plataforma", en: "Platform administration" },
  icon: ShieldCheck,
};

type LoginRolePickerProps = {
  selectedRole: LoginRole;
  onRoleChange: (role: LoginRole) => void;
  disabled?: boolean;
  locale: string;
  groupLabel: string;
};

export function LoginRolePicker({ selectedRole, onRoleChange, disabled = false, locale, groupLabel }: LoginRolePickerProps) {
  const reducedMotion = useReducedMotion();
  const lang = locale.startsWith("en") ? "en" : "es";
  const roles = selectedRole === "support" ? [...ROLE_OPTIONS, SUPPORT_ROLE] : ROLE_OPTIONS;

  return (
    <div className="login-role-grid-container min-w-0">
      <div className="login-role-grid" role="group" aria-label={groupLabel}>
        {roles.map(({ value, label, description, icon: Icon }) => {
          const selected = selectedRole === value;
          return (
            <motion.button
              key={value}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              title={`${label[lang]} · ${description[lang]}`}
              aria-label={`${label[lang]}. ${description[lang]}`}
              data-testid={`login-role-${value}`}
              data-selected={selected ? "true" : "false"}
              className={`login-role-card group relative isolate flex min-w-0 flex-col items-center justify-center overflow-hidden rounded-xl border px-2 py-3 text-center focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${selected ? "border-accent text-accent" : "border-line text-ink"}`}
              onClick={() => onRoleChange(value)}
              whileHover={!reducedMotion && !disabled ? { y: -3 } : undefined}
              whileTap={!reducedMotion && !disabled ? { scale: 0.97 } : undefined}
              transition={{ type: "spring", stiffness: 370, damping: 26 }}
            >
              {selected ? (
                <motion.span layoutId="selected-login-role" className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-accent-soft" transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 350, damping: 32 }} aria-hidden="true" />
              ) : null}
              <span className={`login-role-icon grid size-11 shrink-0 place-items-center rounded-full ${selected ? "bg-surface text-accent" : "bg-surface-subtle text-ink-secondary"}`} aria-hidden="true">
                <Icon className="size-6" strokeWidth={1.8} />
              </span>
              <span className="mt-2 text-[clamp(0.68rem,0.85vw,0.82rem)] leading-4 font-bold text-balance">{label[lang]}</span>
              <span className="mt-1 text-[0.65rem] leading-4 text-ink-secondary">{description[lang]}</span>
              {selected ? <span className="absolute top-2 right-2 grid size-5 place-items-center rounded-full bg-accent text-xs text-white" aria-hidden="true">✓</span> : null}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

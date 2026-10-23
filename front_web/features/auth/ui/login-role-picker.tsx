"use client";

import { motion, useReducedMotion } from "motion/react";
import { Building2, ClipboardList, FlaskConical, ShieldCheck, Stethoscope, UserRound } from "lucide-react";
import type { LoginRole } from "@/features/auth/model/auth.types";

type LoginRoleOption = {
  value: LoginRole | "laboratory";
  label: { es: string; en: string };
  description: { es: string; en: string };
  icon: typeof ShieldCheck;
  unavailable?: boolean;
};

const ROLE_OPTIONS: readonly LoginRoleOption[] = [
  {
    value: "support",
    label: { es: "Super Admin", en: "Super Admin" },
    description: { es: "Administración de la plataforma", en: "Platform management" },
    icon: ShieldCheck,
  },
  {
    value: "administrator",
    label: { es: "Admin. de clínica", en: "Clinic admin" },
    description: { es: "Gestión de clínica", en: "Clinic management" },
    icon: Building2,
  },
  {
    value: "healthcare",
    label: { es: "Profesional de salud", en: "Healthcare professional" },
    description: { es: "Médico clínico o independiente", en: "Clinic or independent doctor" },
    icon: Stethoscope,
  },
  {
    value: "receptionist",
    label: { es: "Recepción", en: "Reception" },
    description: { es: "Agenda y atención", en: "Appointments and check-in" },
    icon: ClipboardList,
  },
  {
    value: "laboratory",
    label: { es: "Laboratorio", en: "Laboratory" },
    description: { es: "Acceso en preparación", en: "Access coming soon" },
    icon: FlaskConical,
    unavailable: true,
  },
  {
    value: "patient",
    label: { es: "Paciente", en: "Patient" },
    description: { es: "Tu historial clínico", en: "Your medical records" },
    icon: UserRound,
  },
];

type LoginRolePickerProps = {
  selectedRole: LoginRole;
  onRoleChange: (role: LoginRole) => void;
  disabled?: boolean;
  locale: string;
  groupLabel: string;
};

export function LoginRolePicker({
  selectedRole,
  onRoleChange,
  disabled = false,
  locale,
  groupLabel,
}: LoginRolePickerProps) {
  const reducedMotion = useReducedMotion();
  const lang = locale.startsWith("en") ? "en" : "es";

  return (
    <div className="login-role-grid-container min-w-0">
      <div className="login-role-grid" role="group" aria-label={groupLabel}>
        {ROLE_OPTIONS.map(({ value, label, description, icon: Icon, unavailable }) => {
          const selected = selectedRole === value;
          const cardDisabled = disabled || unavailable;

          return (
            <motion.button
              key={value}
              type="button"
              disabled={cardDisabled}
              aria-pressed={unavailable ? undefined : selected}
              title={unavailable ? description[lang] : `${label[lang]} · ${description[lang]}`}
              aria-label={`${label[lang]}. ${description[lang]}`}
              data-testid={`login-role-${value}`}
              data-selected={selected ? "true" : "false"}
              className={`login-role-card group relative isolate flex min-w-0 flex-col items-center justify-center overflow-hidden rounded-xl border px-2 py-3 text-center focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${selected ? "border-accent text-accent" : "border-line text-ink"} ${unavailable ? "cursor-not-allowed opacity-65" : ""}`}
              onClick={() => {
                if (!unavailable && !disabled) onRoleChange(value as LoginRole);
              }}
              whileHover={!reducedMotion && !cardDisabled ? { y: -5, scale: 1.035 } : undefined}
              whileTap={!reducedMotion && !cardDisabled ? { scale: 0.96 } : undefined}
              transition={{ type: "spring", stiffness: 370, damping: 26 }}
            >
              {selected ? (
                <motion.span
                  layoutId="selected-login-role"
                  className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-accent-soft"
                  transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 350, damping: 32 }}
                  aria-hidden="true"
                />
              ) : null}
              <span
                className={`login-role-icon grid size-10 shrink-0 place-items-center rounded-full ${selected ? "bg-surface text-accent" : "bg-surface-subtle text-ink-secondary"}`}
                aria-hidden="true"
              >
                <Icon className="size-5" strokeWidth={1.8} />
              </span>
              <span className="mt-2 text-[clamp(0.65rem,0.8vw,0.78rem)] leading-4 font-bold text-balance">
                {label[lang]}
              </span>
              {unavailable ? (
                <span className="mt-1 text-[0.625rem] leading-3 text-muted">
                  {lang === "en" ? "Coming soon" : "Próximamente"}
                </span>
              ) : null}
              {selected && !unavailable ? (
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent" aria-hidden="true" />
              ) : null}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

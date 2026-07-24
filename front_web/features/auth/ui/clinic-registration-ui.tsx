"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Building2, Check, ChevronDown, CircleAlert, CreditCard, Eye, EyeOff, LockKeyhole } from "lucide-react";
import type { ClinicRegistrationDraft } from "@/features/auth/api/clinic-registration";
import type { DoctorRegistrationDraft } from "@/features/auth/api/doctor-registration";
import type { PatientRegistrationDraft } from "@/features/auth/api/patient-registration";

export type RegistrationStep = "role" | "clinic" | "plan" | "otp" | "success";
export type RegistrationFieldName = keyof ClinicRegistrationDraft | keyof DoctorRegistrationDraft | keyof PatientRegistrationDraft;
export type RegistrationFieldErrors = Partial<Record<RegistrationFieldName, string>>;

export const registrationButtonClasses = "flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-2xs font-extrabold text-white shadow-[0_0.5rem_1rem_rgb(8_98_221/18%)] transition-[background-color,transform,box-shadow] not-disabled:hover:-translate-y-px not-disabled:hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-[3px] focus-visible:outline-offset-3 focus-visible:outline-focus";

const fieldClasses = "min-h-10 w-full rounded-lg border bg-surface-input px-3 text-2xs text-ink outline-none placeholder:text-placeholder transition-[border-color,background-color,box-shadow] focus:border-accent focus:bg-white focus:ring-3 focus:ring-focus/30";
const invalidFieldClasses = "border-danger bg-danger-soft/30 focus:border-danger focus:ring-danger/15";

/* ── Inline error ── */

export function InlineError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="flex items-start gap-1.5 text-xs leading-5 text-danger" role="alert">
      <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  ) : null;
}

/* ── Global error ── */

export function GlobalError({ message }: { message: string | null }) {
  return message ? (
    <div className="motion-safe:animate-[field-error-enter_200ms_cubic-bezier(0.22,1,0.36,1)]" aria-live="polite">
      <p className="flex items-start gap-2 border-l-2 border-danger bg-danger-soft px-3 py-2.5 text-xs leading-5 text-danger" role="alert">
        <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        {message}
      </p>
    </div>
  ) : null;
}

/* ── Step progress bar ── */

type StepConfig = { key: string; label: string; icon: typeof Building2 };

const CLINIC_STEPS: StepConfig[] = [
  { key: "clinic", label: "Datos", icon: Building2 },
  { key: "plan", label: "Plan", icon: CreditCard },
  { key: "otp", label: "Verificar", icon: LockKeyhole },
];

export function RegistrationHeader({ step, onBack, steps }: { step: Exclude<RegistrationStep, "role" | "success">; onBack: () => void; steps?: StepConfig[] }) {
  const allSteps = steps ?? CLINIC_STEPS;
  const currentIndex = allSteps.findIndex((s) => s.key === step);
  const backLabels: Record<string, string> = { clinic: "Volver a selección", plan: "Volver a datos", otp: "Volver a planes" };

  return (
    <div className="mb-8">
      <button
        className="mb-6 flex min-h-9 items-center gap-1.5 text-2xs font-semibold text-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        type="button"
        onClick={onBack}
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        {backLabels[step] ?? "Volver"}
      </button>

      {/* Step progress */}
      <nav aria-label="Progreso de registro" className="flex items-center justify-center gap-0">
        {allSteps.map((s, index) => {
          const Icon = s.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div key={s.key} className="flex items-center">
              {index > 0 && (
                <div className={`mx-2 h-px w-8 sm:mx-3 sm:w-12 transition-colors duration-300 ${isCompleted ? "bg-accent" : "bg-line"}`} />
              )}
              <div className="flex items-center gap-2">
                <span className={`grid size-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                  isCompleted
                    ? "border-accent bg-accent text-white"
                    : isCurrent
                      ? "border-accent bg-accent-soft text-accent shadow-[0_0_0_4px_rgb(8_98_221/8%)]"
                      : "border-line bg-surface-subtle text-muted"
                }`}>
                  {isCompleted ? <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" /> : <Icon className="size-3.5" strokeWidth={1.8} aria-hidden="true" />}
                </span>
                <span className={`hidden text-2xs font-bold sm:block transition-colors duration-200 ${
                  isCurrent ? "text-accent" : isCompleted ? "text-ink" : "text-muted"
                }`}>
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

/* ── Registration field with password toggle ── */

export function RegistrationField({ label, name, value, onChange, error, type = "text", placeholder, autoComplete, hint, inputMode, maxLength, className = "" }: {
  label: string;
  name: RegistrationFieldName;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  maxLength?: number;
  className?: string;
}) {
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`grid gap-1.5 ${className}`}>
      <label className="text-2xs font-bold text-ink" htmlFor={name}>{label}</label>
      <div className="relative">
        <input
          className={`${fieldClasses} ${isPassword ? "pr-10" : ""} ${error ? invalidFieldClasses : "border-line"}`}
          id={name}
          name={name}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute top-1/2 right-1 grid size-8 -translate-y-1/2 place-items-center rounded text-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
            tabIndex={-1}
          >
            {showPassword
              ? <EyeOff className="size-4" strokeWidth={1.7} aria-hidden="true" />
              : <Eye className="size-4" strokeWidth={1.7} aria-hidden="true" />}
          </button>
        )}
      </div>
      {hint ? <p id={hintId} className="text-2xs leading-4 text-muted">{hint}</p> : null}
      <InlineError id={errorId} message={error} />
    </div>
  );
}

/* ── Styled custom select dropdown ── */

type SelectOption = { value: string; label: string; detail?: string };

export function RegistrationSelect({ label, name, value, onChange, error, hint, disabled, disabledHint, placeholder, options, children, className = "" }: {
  label: string;
  name: RegistrationFieldName;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  disabled?: boolean;
  disabledHint?: string;
  placeholder: string;
  options?: SelectOption[];
  children?: ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  const listboxId = `${name}-listbox`;

  // If no options prop, fall back to native select with children
  const hasCustomOptions = Boolean(options && options.length > 0);

  const close = useCallback(() => { setIsOpen(false); setFocusedIndex(-1); }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) close();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[role=option]");
      (items?.[focusedIndex] as HTMLElement)?.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, focusedIndex]);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!hasCustomOptions) return;
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        if (isOpen && focusedIndex >= 0 && options) {
          onChange(options[focusedIndex].value);
          close();
        } else if (!isOpen) {
          setIsOpen(true);
          const selectedIdx = options?.findIndex((o) => o.value === String(value)) ?? -1;
          setFocusedIndex(selectedIdx >= 0 ? selectedIdx : 0);
        }
        break;
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else if (options) {
          setFocusedIndex((prev) => Math.min(prev + 1, options.length - 1));
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (isOpen) setFocusedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        close();
        break;
    }
  }

  const selectedOption = hasCustomOptions ? options?.find((o) => o.value === String(value)) : null;
  const displayLabel = selectedOption?.label ?? "";

  return (
    <div className={`grid gap-2 ${className}`} ref={containerRef}>
      <label className="text-2xs font-bold text-ink" htmlFor={name}>{label}</label>

      {hasCustomOptions ? (
        /* Custom styled dropdown */
        <div className="relative">
          <button
            ref={buttonRef}
            id={name}
            type="button"
            className={`${fieldClasses} flex items-center justify-between pr-10 text-left ${error ? invalidFieldClasses : "border-line"} ${disabled ? "cursor-not-allowed bg-surface-subtle text-muted opacity-70" : "cursor-pointer hover:border-accent/60"}`}
            onClick={() => { if (!disabled) { setIsOpen((v) => !v); if (!isOpen) { const idx = options?.findIndex((o) => o.value === String(value)) ?? -1; setFocusedIndex(idx >= 0 ? idx : 0); } } }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
          >
            <span className={displayLabel ? "truncate text-ink" : "truncate text-placeholder"}>{displayLabel || placeholder}</span>
            <ChevronDown className={`pointer-events-none absolute top-1/2 right-3.5 size-3.5 -translate-y-1/2 transition-transform duration-150 ${isOpen ? "rotate-180" : ""} ${error ? "text-danger" : "text-muted"}`} strokeWidth={2} aria-hidden="true" />
          </button>

          {isOpen && options && (
            <ul
              id={listboxId}
              ref={listRef}
              role="listbox"
              className="absolute top-[calc(100%+0.35rem)] left-0 z-50 max-h-64 w-full overflow-y-auto rounded-xl border border-line bg-white py-1.5 shadow-[0_10px_32px_rgb(16_27_51/14%),0_2px_8px_rgb(16_27_51/8%)] motion-safe:animate-[field-error-enter_150ms_cubic-bezier(0.22,1,0.36,1)]"
            >
              {options.map((option, index) => {
                const isSelected = option.value === String(value);
                const isFocused = index === focusedIndex;
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    className={`flex min-h-9 cursor-pointer items-center gap-3 px-3 py-2 text-2xs transition-colors duration-75 ${isFocused ? "bg-surface-focused" : "hover:bg-surface-subtle"} ${isSelected ? "font-bold text-accent" : "text-ink"}`}
                    onClick={() => { onChange(option.value); close(); }}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{option.label}</span>
                      {option.detail ? <span className="mt-0.5 block truncate text-2xs text-muted">{option.detail}</span> : null}
                    </span>
                    {isSelected && <Check className="size-3.5 shrink-0 text-accent" strokeWidth={2.5} aria-hidden="true" />}
                  </li>
                );
              })}
              {options.length === 0 && (
                <li className="px-3.5 py-4 text-center text-xs text-muted">Sin opciones disponibles</li>
              )}
            </ul>
          )}
        </div>
      ) : (
        /* Fallback: native select with children */
        <div className="relative">
          <select
            className={`${fieldClasses} appearance-none pr-10 ${error ? invalidFieldClasses : "border-line"} ${disabled ? "cursor-not-allowed bg-surface-subtle text-muted opacity-70" : "cursor-pointer hover:border-accent/60"}`}
            id={name}
            name={name}
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            required
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
          >
            <option value="">{placeholder}</option>
            {children}
          </select>
          <ChevronDown className={`pointer-events-none absolute top-1/2 right-3.5 size-3.5 -translate-y-1/2 ${error ? "text-danger" : "text-muted"}`} strokeWidth={2} aria-hidden="true" />
        </div>
      )}

      {disabled && disabledHint ? <p className="text-2xs leading-4 text-muted">{disabledHint}</p> : hint ? <p id={hintId} className="text-2xs leading-4 text-muted">{hint}</p> : null}
      <InlineError id={errorId} message={error} />
    </div>
  );
}

/* ── Form group ── */

export function FormGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-5 border-0 p-0">
      <legend className="sr-only">{label}</legend>
      {children}
    </fieldset>
  );
}

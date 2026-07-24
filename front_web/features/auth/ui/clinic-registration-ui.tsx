import type { ReactNode } from "react";
import { ArrowLeft, Building2, ChevronDown, CircleAlert, CreditCard, LockKeyhole } from "lucide-react";
import type { ClinicRegistrationDraft } from "@/features/auth/api/clinic-registration";
import type { DoctorRegistrationDraft } from "@/features/auth/api/doctor-registration";
import type { PatientRegistrationDraft } from "@/features/auth/api/patient-registration";

export type RegistrationStep = "role" | "clinic" | "plan" | "otp" | "success";
export type RegistrationFieldName = keyof ClinicRegistrationDraft | keyof DoctorRegistrationDraft | keyof PatientRegistrationDraft;
export type RegistrationFieldErrors = Partial<Record<RegistrationFieldName, string>>;

export const registrationButtonClasses = "flex min-h-12 items-center justify-center gap-2 rounded-[0.65rem] bg-accent px-4 text-xs font-extrabold text-white shadow-[0_0.6rem_1.15rem_rgb(8_98_221/22%)] transition-[background-color,transform,box-shadow] not-disabled:hover:-translate-y-px not-disabled:hover:bg-[#064fb8] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-[3px] focus-visible:outline-offset-3 focus-visible:outline-focus";

const fieldClasses = "min-h-12 w-full rounded-[0.65rem] border bg-[#f8fafc] px-3.5 text-xs text-ink outline-none placeholder:text-[#a5b2c7] transition-[border-color,background-color,box-shadow] focus:border-accent focus:bg-white focus:ring-3 focus:ring-focus/30";
const invalidFieldClasses = "border-danger bg-danger-soft/30 focus:border-danger focus:ring-danger/15";

export function InlineError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="flex items-start gap-1.5 text-xs leading-5 text-danger" role="alert">
      <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  ) : null;
}

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

export function RegistrationHeader({ step, onBack }: { step: Exclude<RegistrationStep, "role" | "success">; onBack: () => void }) {
  const details = {
    clinic: { label: "Registro de clínica", icon: Building2, back: "Volver a selección" },
    plan: { label: "Selección de plan", icon: CreditCard, back: "Volver a datos" },
    otp: { label: "Verificación segura", icon: LockKeyhole, back: "Volver a planes" },
  }[step];
  const Icon = details.icon;

  return (
    <div className="mb-6">
      <button
        className="mb-6 flex min-h-9 items-center gap-1.5 text-2xs font-semibold text-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        type="button"
        onClick={onBack}
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        {details.back}
      </button>
      <p className="flex items-center gap-2 text-2xs font-extrabold tracking-widest text-accent uppercase">
        <span className="grid size-7 place-items-center rounded-md bg-accent-soft"><Icon className="size-3.5" aria-hidden="true" /></span>
        {details.label}
      </p>
    </div>
  );
}

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
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`grid gap-2 ${className}`}>
      <label className="text-xs font-bold text-ink" htmlFor={name}>{label}</label>
      <input
        className={`${fieldClasses} ${error ? invalidFieldClasses : "border-line"}`}
        id={name}
        name={name}
        type={type}
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
      {hint ? <p id={hintId} className="text-2xs leading-4 text-muted">{hint}</p> : null}
      <InlineError id={errorId} message={error} />
    </div>
  );
}

export function RegistrationSelect({ label, name, value, onChange, error, hint, disabled, disabledHint, placeholder, children, className = "" }: {
  label: string;
  name: RegistrationFieldName;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  disabled?: boolean;
  disabledHint?: string;
  placeholder: string;
  children: ReactNode;
  className?: string;
}) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`grid gap-2 ${className}`}>
      <label className="text-xs font-bold text-ink" htmlFor={name}>{label}</label>
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
      {disabled && disabledHint ? <p className="text-2xs leading-4 text-muted">{disabledHint}</p> : hint ? <p id={hintId} className="text-2xs leading-4 text-muted">{hint}</p> : null}
      <InlineError id={errorId} message={error} />
    </div>
  );
}

export function FormGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-5 border-0 p-0">
      <legend className="sr-only">{label}</legend>
      {children}
    </fieldset>
  );
}

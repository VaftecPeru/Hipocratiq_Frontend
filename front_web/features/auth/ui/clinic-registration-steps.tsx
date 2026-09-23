import type { FormEvent } from "react";
import Link from "next/link";
import { Building2, Check, Stethoscope, UserRound } from "lucide-react";
import type { ClinicPlan } from "@/features/auth/api/clinic-registration";
import { GlobalError, RegistrationHeader, registrationButtonClasses } from "@/features/auth/ui/clinic-registration-ui";
import { OtpCodeInput } from "@/features/auth/ui/otp-code-input";
import { Spinner } from "@/shared/ui/spinner";

export function RoleStep({ onSelectClinic, onSelectDoctor, onSelectPatient }: { onSelectClinic: () => void; onSelectDoctor: () => void; onSelectPatient: () => void }) {
  return (
    <div className="w-full max-w-108 py-4">
      <h1 className="text-[clamp(1.55rem,4vw,2rem)] font-extrabold tracking-[-0.04em]">Elige tu rol</h1>
      <p className="mt-2.5 text-xs leading-5 text-muted">Selecciona cómo deseas unirte a Hipocratiq para personalizar tu experiencia.</p>

      <div className="mt-7 grid gap-3.5" aria-label="Tipo de registro">
        <button className="flex min-h-18 items-center gap-3.5 rounded-xl border border-line px-5 text-left hover:border-accent focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus" type="button" onClick={onSelectClinic}>
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><Building2 className="size-4" aria-hidden="true" /></span>
          <span className="min-w-0"><strong className="block text-xs font-extrabold">Clínica / Hospital</strong><small className="mt-1 block text-2xs text-muted">Para instituciones de salud.</small></span>
        </button>
        <button className="flex min-h-18 items-center gap-3.5 rounded-xl border border-line px-5 text-left hover:border-accent focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus" type="button" onClick={onSelectDoctor}>
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><Stethoscope className="size-4" aria-hidden="true" /></span>
          <span><strong className="block text-xs font-extrabold">Médico</strong><small className="mt-1 block text-2xs text-muted">Para profesionales afiliados o independientes.</small></span>
        </button>
        <button className="flex min-h-18 items-center gap-3.5 rounded-xl border border-line px-5 text-left hover:border-accent focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus" type="button" onClick={onSelectPatient}>
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><UserRound className="size-4" aria-hidden="true" /></span>
          <span><strong className="block text-xs font-extrabold">Paciente</strong><small className="mt-1 block text-2xs text-muted">Elige una clínica; configurarás el plan después.</small></span>
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-muted">¿Ya tienes una cuenta? <Link className="font-bold text-accent hover:underline" href="/">Inicia sesión</Link></p>
    </div>
  );
}

export function PlanStep({ plans, selected, cycle, pending, error, subject = "clinic", onSelect, onCycleChange, onBack }: { plans: ClinicPlan[]; selected: string; cycle: "monthly" | "annual"; pending: boolean; error: string | null; subject?: "clinic" | "doctor"; onSelect: (plan: ClinicPlan) => void; onCycleChange: (cycle: "monthly" | "annual") => void; onBack: () => void }) {
  return (
    <div className="w-full max-w-152 py-2">
      <RegistrationHeader step="plan" onBack={onBack} />
      <h1 className="text-[clamp(1.55rem,4vw,2rem)] font-extrabold tracking-[-0.04em]">Elige un plan para {subject === "doctor" ? "tu práctica" : "tu clínica"}</h1>
      <p className="mt-2.5 text-xs text-muted">Puedes cambiar de plan más adelante.</p>

      <div className="mt-6 inline-flex rounded-lg bg-surface-subtle p-1 text-xs font-bold">
        <button className={`min-h-9 rounded-md px-4 ${cycle === "monthly" ? "bg-surface text-accent shadow-sm" : "text-muted"}`} type="button" onClick={() => onCycleChange("monthly")}>Mensual</button>
        <button className={`min-h-9 rounded-md px-4 ${cycle === "annual" ? "bg-surface text-accent shadow-sm" : "text-muted"}`} type="button" onClick={() => onCycleChange("annual")}>Anual · ahorra 20%</button>
      </div>

      <div className="mt-7 divide-y divide-line border-y border-line">
        {plans.map((plan) => {
          const price = cycle === "annual" ? plan.annual_price_cents : plan.monthly_price_cents;
          const isSelected = selected === plan.key;
          return (
            <article className="grid gap-5 py-6 sm:grid-cols-[1fr_auto] sm:items-center" key={plan.key}>
              <div>
                <div className="flex items-center gap-2"><h2 className="text-sm font-extrabold">{plan.name}</h2>{plan.key === "professional" ? <span className="text-2xs font-bold text-success">Recomendado</span> : null}</div>
                <p className="mt-1.5 text-xs text-muted">{plan.key === "basic" ? "Para clínicas pequeñas." : "Para equipos en crecimiento."}</p>
                <ul className="mt-3.5 grid gap-2 text-xs text-muted">{plan.features.slice(0, 3).map((feature) => <li className="flex gap-2" key={feature}><Check className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden="true" />{feature}</li>)}</ul>
              </div>
              <div className="sm:text-right">
                <p className="font-mono text-xl font-bold">${(price / 100).toFixed(0)}<span className="font-sans text-2xs font-normal text-muted"> / {cycle === "annual" ? "año" : "mes"}</span></p>
                <button className={`mt-3.5 min-h-10 rounded-lg px-4 text-xs font-extrabold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus ${isSelected ? "bg-accent text-white" : "border border-line text-accent hover:border-accent"}`} type="button" disabled={pending} onClick={() => onSelect(plan)}>{isSelected && pending ? <><Spinner /> Preparando</> : isSelected ? "Seleccionado" : "Elegir plan"}</button>
              </div>
            </article>
          );
        })}
      </div>
      <div className="mt-5"><GlobalError message={error} /></div>
    </div>
  );
}

export function ClinicOtpStep({ challengeId, expiresIn, resendAfter, resendsRemaining, code, setCode, pending, error, recipientDescription = "móvil del administrador clínico", onVerify, onResend, onBack }: { challengeId: string; expiresIn: number; resendAfter: number; resendsRemaining: number; code: string[]; setCode: (code: string[]) => void; pending: boolean; error: string | null; recipientDescription?: string; onVerify: (event: FormEvent<HTMLFormElement>) => void; onResend: () => void; onBack: () => void }) {
  return (
    <div className="w-full max-w-108 py-4">
      <RegistrationHeader step="otp" onBack={onBack} />
      <h1 className="text-[clamp(1.55rem,4vw,2rem)] font-extrabold tracking-[-0.04em]">Verifica tu identidad</h1>
      <p className="mt-2.5 text-xs leading-5 text-muted">Enviamos un código de 6 dígitos al {recipientDescription}.</p>
      <form className="mt-7 grid gap-6" onSubmit={onVerify} aria-busy={pending} noValidate>
        <OtpCodeInput value={code} onChange={setCode} disabled={pending} hasError={Boolean(error)} />
        <GlobalError message={error} />
        <button className={registrationButtonClasses} type="submit" disabled={pending || !challengeId || expiresIn === 0}>{pending ? <><Spinner />Verificando</> : "Verificar y crear cuenta"}</button>
        <button className="min-h-10 text-xs font-bold text-accent disabled:text-muted" type="button" disabled={pending || resendAfter > 0 || resendsRemaining === 0} onClick={onResend}>{resendsRemaining === 0 ? "Límite de 5 reenvíos alcanzado" : resendAfter > 0 ? `Reenviar en ${resendAfter}s · ${resendsRemaining} disponibles` : `Reenviar código · ${resendsRemaining} disponibles`}</button>
      </form>
    </div>
  );
}

export function RegistrationSuccessStep({ onContinue, title = "Registro exitoso", description = "Tu clínica y membresía fueron activadas. Ya puedes entrar al panel clínico.", buttonLabel = "Entrar al panel clínico" }: { onContinue: () => void; title?: string; description?: string; buttonLabel?: string }) {
  return (
    <div className="w-full max-w-108 py-4 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-success-soft text-success"><Check className="size-7" strokeWidth={3} aria-hidden="true" /></span>
      <h1 className="mt-5 text-[clamp(1.6rem,4vw,2.2rem)] font-extrabold tracking-[-0.04em]">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
      <button className={`${registrationButtonClasses} mt-7 w-full`} type="button" onClick={onContinue}>{buttonLabel}</button>
    </div>
  );
}

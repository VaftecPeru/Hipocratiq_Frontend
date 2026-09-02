"use client";

import { FormEvent, startTransition, useEffect, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, CircleAlert, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { requestPasswordResetOtp, resendOtp, verifyPasswordResetOtp } from "@/features/auth/api/browser-auth";
import { COUNTRY_OPTIONS, maskPhoneNumber, toE164PhoneNumber } from "@/features/auth/lib/phone-number";
import type { CountryCode } from "@/features/auth/model/auth.types";
import { CountrySelect } from "@/features/auth/ui/country-select";
import { OtpCodeInput } from "@/features/auth/ui/otp-code-input";
import { BrandLogo } from "@/shared/ui/brand-logo";
import { Spinner } from "@/shared/ui/spinner";
import { ApiError } from "@/shared/api/http-client";

type ResetStep = "identifier" | "otp" | "new-password" | "success";
type FieldName = "identifier" | "code" | "password" | "password_confirmation";
type FieldErrors = Partial<Record<FieldName, string>>;

type FlowState = {
  step: ResetStep;
  otpDigits: string[];
  expiresIn: number;
  resendAfter: number;
  destination: string;
  error: string | null;
  fieldErrors: FieldErrors;
  isPending: boolean;
};

type FlowAction =
  | { type: "pending"; value: boolean }
  | { type: "error"; message: string }
  | { type: "validationFailed"; errors: FieldErrors }
  | { type: "fieldCleared"; field: FieldName }
  | { type: "otpIssued"; expiresIn: number; resendAfter: number; destination: string }
  | { type: "otpChanged"; value: string[] }
  | { type: "tick" }
  | { type: "otpVerified" }
  | { type: "backToOtp"; error: string }
  | { type: "passwordReset" }
  | { type: "back" };

function createEmptyOtp(): string[] {
  return Array.from({ length: 6 }, () => "");
}

const INITIAL: FlowState = {
  step: "identifier",
  otpDigits: createEmptyOtp(),
  expiresIn: 0,
  resendAfter: 0,
  destination: "",
  error: null,
  fieldErrors: {},
  isPending: false,
};

function reducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "pending":
      return { ...state, isPending: action.value, error: action.value ? null : state.error, fieldErrors: action.value ? {} : state.fieldErrors };
    case "error":
      return { ...state, error: action.message, isPending: false };
    case "validationFailed":
      return { ...state, error: null, fieldErrors: action.errors, isPending: false };
    case "fieldCleared": {
      const fieldErrors = { ...state.fieldErrors };
      delete fieldErrors[action.field];
      return { ...state, error: null, fieldErrors };
    }
    case "otpIssued":
      return { ...state, step: "otp", otpDigits: createEmptyOtp(), expiresIn: action.expiresIn, resendAfter: action.resendAfter, destination: action.destination, error: null, fieldErrors: {}, isPending: false };
    case "otpChanged":
      return { ...state, otpDigits: action.value, fieldErrors: { ...state.fieldErrors, code: undefined } };
    case "tick":
      return { ...state, expiresIn: Math.max(0, state.expiresIn - 1), resendAfter: Math.max(0, state.resendAfter - 1) };
    case "otpVerified":
      return { ...state, step: "new-password", otpDigits: createEmptyOtp(), error: null, fieldErrors: {}, isPending: false };
    case "backToOtp":
      return { ...state, step: "otp", otpDigits: createEmptyOtp(), error: null, fieldErrors: { code: action.error }, isPending: false };
    case "passwordReset":
      return { ...state, step: "success", error: null, fieldErrors: {}, isPending: false };
    case "back":
      return { ...INITIAL, otpDigits: createEmptyOtp() };
  }
}

const FOCUS_RING = "focus-visible:outline-[3px] focus-visible:outline-offset-3 focus-visible:outline-focus-ring";
const FIELD_CONTAINER = "flex min-h-10 items-center overflow-hidden rounded-lg border border-line bg-white transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgb(8_98_221/12%)]";
const INVALID_FIELD = "border-danger focus-within:border-danger focus-within:shadow-[0_0_0_3px_rgb(186_59_70/14%)]";
const PRIMARY_BUTTON = `flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border-0 bg-accent text-2xs font-extrabold text-white shadow-[0_0.5rem_1rem_rgb(8_98_221/18%)] transition-[background-color,transform,box-shadow] not-disabled:hover:-translate-y-px not-disabled:hover:bg-accent-hover not-disabled:hover:shadow-[0_0.6rem_1.2rem_rgb(8_98_221/24%)] disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`;

const PASSWORD_RULES = [
  { label: "Mínimo 8 caracteres", test: (value: string) => value.length >= 8 },
  { label: "Una mayúscula", test: (value: string) => /[A-Z]/.test(value) },
  { label: "Un número", test: (value: string) => /\d/.test(value) },
  { label: "Carácter especial", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

function InlineError({ id, message }: { id?: string; message?: string }) {
  return (
    <div className={`grid transition-[grid-template-rows,opacity,transform] duration-200 ease-out motion-reduce:transition-none ${message ? "grid-rows-[1fr] translate-y-0 opacity-100" : "grid-rows-[0fr] -translate-y-1 opacity-0"}`} aria-live="polite" aria-atomic="true">
      <div className="overflow-hidden">
        <p id={id} className="flex min-h-5 items-start gap-2 text-xs leading-5 text-danger" role={message ? "alert" : undefined}>
          {message ? <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /> : null}
          {message}
        </p>
      </div>
    </div>
  );
}

function GlobalError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="motion-safe:animate-[field-error-enter_200ms_cubic-bezier(0.22,1,0.36,1)]" aria-live="polite">
      <p className="border-l-2 border-danger bg-danger-soft px-3 py-2.5 text-xs leading-5 text-danger" role="alert">{message}</p>
    </div>
  );
}

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`;
}

type NewPasswordStepProps = {
  flow: FlowState;
  password: string;
  confirmation: string;
  passwordInputType: "password" | "text";
  confirmationInputType: "password" | "text";
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPasswordChange: (value: string) => void;
  onConfirmationChange: (value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmation: () => void;
};

function NewPasswordStep({
  flow,
  password,
  confirmation,
  passwordInputType,
  confirmationInputType,
  onSubmit,
  onPasswordChange,
  onConfirmationChange,
  onTogglePassword,
  onToggleConfirmation,
}: NewPasswordStepProps) {
  return (
    <div className="w-full max-w-96">
      <BrandLogo className="mb-7 h-11 w-auto" />
      <h1 className="text-balance text-[clamp(1.5rem,3.5vw,2rem)] leading-[1.15] font-extrabold tracking-[-0.045em]">Nueva contraseña</h1>
      <p className="mt-3 text-sm leading-6 text-muted">Crea una contraseña segura para proteger tu cuenta.</p>

      <form className="mt-6 grid gap-5" onSubmit={onSubmit} aria-busy={flow.isPending} noValidate>
        <div className="grid gap-2">
          <label className="text-2xs font-bold text-ink" htmlFor="new-password">Nueva contraseña</label>
          <div className={`${FIELD_CONTAINER} ${flow.fieldErrors.password ? INVALID_FIELD : ""}`}>
            <LockKeyhole className={`mx-3 size-4 shrink-0 transition-colors duration-200 ${flow.fieldErrors.password ? "text-danger" : "text-icon-input"}`} strokeWidth={1.7} aria-hidden="true" />
            <input
              className="min-h-9 w-full min-w-0 border-0 bg-transparent pr-1 text-2xs text-ink outline-0"
              id="new-password"
              type={passwordInputType}
              autoComplete="new-password"
              maxLength={72}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              aria-invalid={flow.fieldErrors.password ? true : undefined}
              aria-describedby={flow.fieldErrors.password ? "password-error" : "password-requirements"}
            />
            <button type="button" className={`mr-1 grid size-8 shrink-0 place-items-center rounded border-0 bg-transparent text-muted transition-colors hover:text-accent ${FOCUS_RING}`} onClick={onTogglePassword} aria-label={passwordInputType === "text" ? "Ocultar contraseña" : "Mostrar contraseña"}>
              {passwordInputType === "text" ? <EyeOff className="size-4" strokeWidth={1.8} aria-hidden="true" /> : <Eye className="size-4" strokeWidth={1.8} aria-hidden="true" />}
            </button>
          </div>
          <InlineError id="password-error" message={flow.fieldErrors.password} />
        </div>

        <div className="grid gap-2">
          <label className="text-2xs font-bold text-ink" htmlFor="confirm-password">Confirmar contraseña</label>
          <div className={`${FIELD_CONTAINER} ${flow.fieldErrors.password_confirmation ? INVALID_FIELD : ""}`}>
            <LockKeyhole className={`mx-3 size-4 shrink-0 transition-colors duration-200 ${flow.fieldErrors.password_confirmation ? "text-danger" : "text-icon-input"}`} strokeWidth={1.7} aria-hidden="true" />
            <input
              className="min-h-9 w-full min-w-0 border-0 bg-transparent pr-1 text-2xs text-ink outline-0"
              id="confirm-password"
              type={confirmationInputType}
              autoComplete="new-password"
              maxLength={72}
              placeholder="Repite tu contraseña"
              value={confirmation}
              onChange={(event) => onConfirmationChange(event.target.value)}
              aria-invalid={flow.fieldErrors.password_confirmation ? true : undefined}
              aria-describedby={flow.fieldErrors.password_confirmation ? "confirm-error" : undefined}
            />
            <button type="button" className={`mr-1 grid size-8 shrink-0 place-items-center rounded border-0 bg-transparent text-muted transition-colors hover:text-accent ${FOCUS_RING}`} onClick={onToggleConfirmation} aria-label={confirmationInputType === "text" ? "Ocultar confirmación" : "Mostrar confirmación"}>
              {confirmationInputType === "text" ? <EyeOff className="size-4" strokeWidth={1.8} aria-hidden="true" /> : <Eye className="size-4" strokeWidth={1.8} aria-hidden="true" />}
            </button>
          </div>
          <InlineError id="confirm-error" message={flow.fieldErrors.password_confirmation} />
        </div>

        <div className="rounded-lg border border-line bg-surface-subtle px-4 py-3" id="password-requirements">
          <p className="mb-2 text-2xs font-extrabold uppercase tracking-wider text-muted">Requisitos de seguridad:</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
            {PASSWORD_RULES.map((rule) => {
              const passes = password.length > 0 && rule.test(password);
              return (
                <li key={rule.label} className={`flex items-center gap-2 text-2xs font-bold ${passes ? "text-success" : "text-muted"}`}>
                  <span className={`size-1.5 rounded-full ${passes ? "bg-success" : "bg-muted/40"}`} aria-hidden="true" />
                  {rule.label}
                </li>
              );
            })}
          </ul>
        </div>

        <GlobalError message={flow.error} />

        <button className={PRIMARY_BUTTON} type="submit" disabled={flow.isPending}>
          {flow.isPending ? <><Spinner /> Restableciendo…</> : "Restablecer contraseña"}
        </button>
      </form>

      <p className="mt-6 text-center">
        <Link href="/" className={`text-xs font-bold text-accent hover:underline ${FOCUS_RING}`}>Volver al inicio de sesión</Link>
      </p>
    </div>
  );
}

type OtpStepProps = {
  flow: FlowState;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onOtpChange: (value: string[]) => void;
  onResend: () => void;
};

function OtpStep({ flow, onSubmit, onOtpChange, onResend }: OtpStepProps) {
  return (
    <div className="w-full max-w-96">
      <BrandLogo className="mb-7 h-11 w-auto" />
      <h1 className="text-balance text-[clamp(1.5rem,3.5vw,2rem)] leading-[1.15] font-extrabold tracking-[-0.045em]">Código de recuperación</h1>
      <p className="mt-3 text-sm leading-6 text-muted">Hemos enviado un código de 6 dígitos a tu número {flow.destination}.</p>

      <form className="mt-5 grid gap-5" onSubmit={onSubmit} aria-busy={flow.isPending} noValidate>
        <div className="flex items-center justify-between gap-4">
          <span className="text-2xs font-bold text-ink">Código de seguridad</span>
          <span className="font-mono text-2xs text-muted tabular-nums" aria-live="polite">{flow.expiresIn > 0 ? formatCountdown(flow.expiresIn) : "Expirado"}</span>
        </div>
        <OtpCodeInput value={flow.otpDigits} onChange={onOtpChange} disabled={flow.isPending} hasError={Boolean(flow.fieldErrors.code)} />

        <InlineError message={flow.fieldErrors.code} />
        <GlobalError message={flow.error} />

        <button className={PRIMARY_BUTTON} type="submit" disabled={flow.isPending || flow.expiresIn === 0}>
          {flow.isPending ? <><Spinner /> Verificando…</> : "Verificar código"}
        </button>

        <p className="text-center text-xs text-muted">
          ¿No recibiste el código?{" "}
          <button className={`border-0 bg-transparent p-0 text-xs font-bold text-accent ${FOCUS_RING}`} type="button" onClick={onResend} disabled={flow.resendAfter > 0 || flow.isPending}>
            {flow.resendAfter > 0 ? `Reenviar en ${formatCountdown(flow.resendAfter)}` : "Reenviar"}
          </button>
        </p>
      </form>

      <p className="mt-6 text-center">
        <Link href="/" className={`text-xs font-bold text-accent hover:underline ${FOCUS_RING}`}>Volver al inicio de sesión</Link>
      </p>
    </div>
  );
}

export function PasswordResetFlow() {
  const router = useRouter();
  const challengeId = useRef("");
  const verifiedCode = useRef("");
  const phoneInput = useRef<HTMLInputElement>(null);
  const [flow, dispatch] = useReducer(reducer, INITIAL);
  const [country, setCountry] = useState<CountryCode>("PE");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const resolvedIdentifier = useRef("");

  useEffect(() => {
    if (flow.step !== "otp") return;
    const timer = window.setInterval(() => dispatch({ type: "tick" }), 1000);
    return () => window.clearInterval(timer);
  }, [flow.step]);

  function handleError(caughtError: unknown) {
    if (caughtError instanceof ApiError && caughtError.errors) {
      const fieldErrors: FieldErrors = {
        identifier: caughtError.errors.identifier?.[0],
        code: caughtError.errors.code?.[0],
        password: caughtError.errors.password?.[0],
        password_confirmation: caughtError.errors.password_confirmation?.[0],
      };
      if (Object.values(fieldErrors).some(Boolean)) {
        dispatch({ type: "validationFailed", errors: fieldErrors });
        return;
      }
    }
    dispatch({
      type: "error",
      message: caughtError instanceof Error ? caughtError.message : "No pudimos conectar con el servicio. Inténtalo nuevamente.",
    });
  }

  function submitIdentifier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let identifier: string;
    try {
      identifier = toE164PhoneNumber(phone, country);
    } catch (caughtError) {
      dispatch({ type: "validationFailed", errors: { identifier: caughtError instanceof Error ? caughtError.message : "Ingresa un número válido." } });
      return;
    }

    resolvedIdentifier.current = identifier;
    dispatch({ type: "pending", value: true });

    startTransition(async () => {
      try {
        const response = await requestPasswordResetOtp(identifier);
        challengeId.current = response.data.challenge_id;
        dispatch({ type: "otpIssued", expiresIn: response.data.expires_in, resendAfter: response.data.resend_after, destination: maskPhoneNumber(identifier) });
      } catch (caughtError) {
        handleError(caughtError);
      } finally {
        dispatch({ type: "pending", value: false });
      }
    });
  }

  function submitOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = flow.otpDigits.join("");
    if (code.length !== 6) {
      dispatch({ type: "validationFailed", errors: { code: "Completa los seis dígitos del código." } });
      return;
    }
    verifiedCode.current = code;
    dispatch({ type: "otpVerified" });
  }

  function handleResend() {
    if (flow.resendAfter > 0 || flow.isPending) return;
    dispatch({ type: "pending", value: true });
    startTransition(async () => {
      try {
        const response = await resendOtp(challengeId.current);
        challengeId.current = response.data.challenge_id;
        dispatch({ type: "otpIssued", expiresIn: response.data.expires_in, resendAfter: response.data.resend_after, destination: flow.destination });
      } catch (caughtError) {
        handleError(caughtError);
      } finally {
        dispatch({ type: "pending", value: false });
      }
    });
  }

  function submitNewPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors: FieldErrors = {};
    if (!password) {
      errors.password = "Ingresa tu nueva contraseña.";
    } else if (!PASSWORD_RULES.every((rule) => rule.test(password))) {
      errors.password = "La contraseña no cumple los requisitos de seguridad.";
    }
    if (!confirmation) {
      errors.password_confirmation = "Confirma tu nueva contraseña.";
    } else if (password !== confirmation) {
      errors.password_confirmation = "Las contraseñas no coinciden.";
    }
    if (Object.keys(errors).length > 0) {
      dispatch({ type: "validationFailed", errors });
      return;
    }

    dispatch({ type: "pending", value: true });

    startTransition(async () => {
      try {
        await verifyPasswordResetOtp(challengeId.current, verifiedCode.current, password, confirmation);
        setPassword("");
        setConfirmation("");
        dispatch({ type: "passwordReset" });
      } catch (caughtError) {
        if (caughtError instanceof ApiError && caughtError.errors?.code?.[0]) {
          dispatch({ type: "backToOtp", error: caughtError.errors.code[0] });
          return;
        }
        handleError(caughtError);
      } finally {
        dispatch({ type: "pending", value: false });
      }
    });
  }

  function goToLogin() {
    if (isNavigating) return;
    setIsNavigating(true);
    startTransition(() => router.replace("/"));
  }

  if (flow.step === "success") {
    return (
      <div className="w-full max-w-96 text-center" role="status">
        <span className="mx-auto mb-6 grid size-16 place-items-center rounded-full border-[0.65rem] border-success-soft bg-success text-white motion-safe:animate-[field-error-enter_300ms_cubic-bezier(0.22,1,0.36,1)]" aria-hidden="true">
          <Check className="size-5" strokeWidth={3} />
        </span>
        <h1 className="text-balance text-[clamp(1.5rem,3.5vw,2rem)] leading-[1.15] font-extrabold tracking-[-0.045em]">¡Contraseña actualizada!</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Tu contraseña ha sido restablecida correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.</p>
        <button className={`${PRIMARY_BUTTON} mt-7`} type="button" onClick={goToLogin} disabled={isNavigating}>
          {isNavigating ? <><Spinner /> Redirigiendo…</> : "Ir al inicio de sesión"}
        </button>
      </div>
    );
  }

  if (flow.step === "new-password") {
    return (
      <NewPasswordStep
        flow={flow}
        password={password}
        confirmation={confirmation}
        passwordInputType={isPasswordVisible ? "text" : "password"}
        confirmationInputType={isConfirmVisible ? "text" : "password"}
        onSubmit={submitNewPassword}
        onPasswordChange={(value) => {
          setPassword(value);
          dispatch({ type: "fieldCleared", field: "password" });
        }}
        onConfirmationChange={(value) => {
          setConfirmation(value);
          dispatch({ type: "fieldCleared", field: "password_confirmation" });
        }}
        onTogglePassword={() => setIsPasswordVisible((visible) => !visible)}
        onToggleConfirmation={() => setIsConfirmVisible((visible) => !visible)}
      />
    );
  }

  if (flow.step === "otp") {
    return (
      <OtpStep
        flow={flow}
        onSubmit={submitOtp}
        onOtpChange={(value) => dispatch({ type: "otpChanged", value })}
        onResend={handleResend}
      />
    );
  }

  return (
    <div className="w-full max-w-96">
      <BrandLogo className="mb-7 h-11 w-auto" />
      <h1 className="text-balance text-[clamp(1.5rem,3.5vw,2rem)] leading-[1.15] font-extrabold tracking-[-0.045em]">Recuperar contraseña</h1>
      <p className="mt-3 text-sm leading-6 text-muted">Ingresa tu número de celular y te enviaremos un código para restablecer tu contraseña.</p>

      <form className="mt-6 grid gap-5" onSubmit={submitIdentifier} aria-busy={flow.isPending} noValidate>
        <div className="grid gap-2">
          <label className="text-2xs font-bold text-ink" htmlFor="reset-phone">Número de celular</label>
          <div className="flex items-center gap-0">
            <CountrySelect value={country} onChange={(value) => { setCountry(value); setPhone(""); dispatch({ type: "fieldCleared", field: "identifier" }); }} hasError={Boolean(flow.fieldErrors.identifier)} ariaDescribedBy={flow.fieldErrors.identifier ? "identifier-error" : undefined} />
            <div className={`${FIELD_CONTAINER} flex-1 rounded-l-none border-l-0 ${flow.fieldErrors.identifier ? INVALID_FIELD : ""}`}>
              <input
                ref={phoneInput}
                className="min-h-9 w-full min-w-0 border-0 bg-transparent px-3 text-2xs text-ink outline-0 placeholder:text-placeholder"
                id="reset-phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="tel-national"
                spellCheck={false}
                maxLength={COUNTRY_OPTIONS[country].nationalLength}
                placeholder={COUNTRY_OPTIONS[country].placeholder}
                value={phone}
                onChange={(event) => { setPhone(event.target.value.replace(/\D/g, "").slice(0, COUNTRY_OPTIONS[country].nationalLength)); dispatch({ type: "fieldCleared", field: "identifier" }); }}
                aria-invalid={flow.fieldErrors.identifier ? true : undefined}
                aria-describedby={flow.fieldErrors.identifier ? "identifier-error" : undefined}
              />
            </div>
          </div>
          <InlineError id="identifier-error" message={flow.fieldErrors.identifier} />
        </div>

        <GlobalError message={flow.error} />

        <button className={PRIMARY_BUTTON} type="submit" disabled={flow.isPending}>
          {flow.isPending ? <><Spinner /> Enviando código…</> : "Enviar código"}
        </button>
      </form>

      <p className="mt-6 text-center">
        <Link href="/" className={`text-xs font-bold text-accent hover:underline ${FOCUS_RING}`}>Volver al inicio de sesión</Link>
      </p>
    </div>
  );
}

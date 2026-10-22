import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEventHandler, type RefObject } from "react";
import { Check, CircleAlert, Eye, EyeOff, LockKeyhole, Mail, Smartphone } from "lucide-react";
import { COUNTRY_OPTIONS } from "@/features/auth/lib/phone-number";
import type { CountryCode, LoginActorContext, LoginIdentifierType, LoginRole } from "@/features/auth/model/auth.types";
import { BrandLogo } from "@/shared/ui/brand-logo";
import { CountrySelect } from "@/features/auth/ui/country-select";
import { OtpCodeInput } from "@/features/auth/ui/otp-code-input";
import { LoginRolePicker } from "@/features/auth/ui/login-role-picker";
import { Spinner } from "@/shared/ui/spinner";
import Link from "next/link";

const FIELD_CONTAINER_CLASSES = "flex min-h-10 items-center overflow-hidden rounded-lg border border-line bg-surface transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgb(8_98_221/12%)]";
const INVALID_FIELD_CLASSES = "border-danger focus-within:border-danger focus-within:shadow-[0_0_0_3px_rgb(186_59_70/14%)]";
const FOCUS_RING_CLASSES = "focus-visible:outline-[3px] focus-visible:outline-offset-3 focus-visible:outline-focus-ring";
const PRIMARY_BUTTON_CLASSES = `flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border-0 bg-accent text-2xs font-extrabold text-white shadow-[0_0.5rem_1rem_rgb(8_98_221/18%)] transition-[background-color,transform,box-shadow] not-disabled:hover:-translate-y-px not-disabled:hover:bg-accent-hover not-disabled:hover:shadow-[0_0.6rem_1.2rem_rgb(8_98_221/24%)] disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING_CLASSES}`;

function InlineError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <div
      className="translate-y-0 opacity-100 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <p id={id} className="flex min-h-5 items-start gap-2 text-xs leading-5 text-danger" role="alert">
        <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        {message}
      </p>
    </div>
  );
}

function GlobalError({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <div className="motion-safe:animate-[field-error-enter_200ms_cubic-bezier(0.22,1,0.36,1)]" aria-live="polite">
      <p className="border-l-2 border-danger bg-danger-soft px-3 py-2.5 text-xs leading-5 text-danger" role="alert">{message}</p>
    </div>
  );
}

type CredentialsStepProps = {
  loginRole: LoginRole;
  actorContext: LoginActorContext;
  identifierType: LoginIdentifierType;
  country: CountryCode;
  email: string;
  phone: string;
  password: string;
  identifierError?: string;
  passwordError?: string;
  globalError: string | null;
  isPending: boolean;
  emailInput: RefObject<HTMLInputElement | null>;
  phoneInput: RefObject<HTMLInputElement | null>;
  passwordInput: RefObject<HTMLInputElement | null>;
  onLoginRoleChange: (role: LoginRole) => void;
  onIdentifierTypeChange: (type: LoginIdentifierType) => void;
  onCountryChange: (country: CountryCode) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onIdentifierBlur: () => void;
  onPasswordBlur: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function CredentialsStep({
  loginRole,
  actorContext,
  identifierType,
  country,
  email,
  phone,
  password,
  identifierError,
  passwordError,
  globalError,
  isPending,
  emailInput,
  phoneInput,
  passwordInput,
  onLoginRoleChange,
  onIdentifierTypeChange,
  onCountryChange,
  onEmailChange,
  onPhoneChange,
  onPasswordChange,
  onIdentifierBlur,
  onPasswordBlur,
  onSubmit,
}: CredentialsStepProps) {
  const locale = useLocale();
  const t = useTranslations("auth");
  const countryOption = COUNTRY_OPTIONS[country];
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isSupportLogin = loginRole === "support";

  return (
    <div className="w-full max-w-[49rem]">
      <div className="mb-5 flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-accent shadow-[0_0.5rem_1rem_rgb(8_98_221/18%)]">
          <BrandLogo className="h-9 w-10 brightness-0 invert" />
        </span>
        <Image className="auth-brand-logo h-auto w-[12rem] max-w-full" src="/logo_hipogratiq_1.png" alt="HIPOCRATIQ" width={1567} height={183} priority />
      </div>

      <h1 className="text-[clamp(1.55rem,4vw,2rem)] leading-tight font-extrabold tracking-[-0.04em]">
         {t("welcome")} <span className="text-accent">HipocratiQ</span>
      </h1>
       <p className="mt-2 text-sm leading-5 text-muted">{t("secureAccess")}</p>

      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-ink">{t("signInAs")}</p>
        <LoginRolePicker
          selectedRole={loginRole}
          onRoleChange={onLoginRoleChange}
          disabled={isPending}
          locale={locale}
          groupLabel={t("accountType")}
        />
      </div>

      <div className="mt-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" aria-hidden="true" />
         <span>{t("continueWith")}</span>
        <span className="h-px flex-1 bg-line" aria-hidden="true" />
      </div>

       <div className="mt-4 grid grid-cols-2 rounded-[0.7rem] border border-line bg-surface-subtle p-1" role="group" aria-label={t("accessMethod")}>
        <button type="button" className={`flex min-h-8 items-center justify-center gap-2 rounded-md border-0 text-2xs font-bold transition-[background-color,color,box-shadow] hover:text-accent ${identifierType === "phone" ? "bg-surface text-accent shadow-[0_0.2rem_0.8rem_rgb(50_73_108/10%)]" : "bg-transparent text-muted"} ${FOCUS_RING_CLASSES}`} onClick={() => onIdentifierTypeChange("phone")} aria-pressed={identifierType === "phone"}>
           <Smartphone className="size-3.5" strokeWidth={1.8} aria-hidden="true" /> {t("phoneMethod")}
        </button>
        <button type="button" className={`flex min-h-8 items-center justify-center gap-2 rounded-md border-0 text-2xs font-bold transition-[background-color,color,box-shadow] hover:text-accent ${identifierType === "email" ? "bg-surface text-accent shadow-[0_0.2rem_0.8rem_rgb(50_73_108/10%)]" : "bg-transparent text-muted"} ${FOCUS_RING_CLASSES}`} onClick={() => onIdentifierTypeChange("email")} aria-pressed={identifierType === "email"}>
           <Mail className="size-3.5" strokeWidth={1.8} aria-hidden="true" /> {t("emailMethod")}
        </button>
      </div>

      <form className="mt-5 grid gap-4" onSubmit={onSubmit} aria-busy={isPending} noValidate>
        {identifierType === "email" ? (
          <div className="grid gap-2">
             <label className="text-2xs font-bold text-ink" htmlFor="email">{t("emailLabel")}</label>
            <div className={`${FIELD_CONTAINER_CLASSES} ${identifierError ? INVALID_FIELD_CLASSES : ""}`}>
              <Mail className={`mx-3 size-4 shrink-0 transition-colors duration-200 ${identifierError ? "text-danger" : "text-icon-input"}`} strokeWidth={1.7} aria-hidden="true" />
               <input ref={emailInput} className="min-h-9 w-full min-w-0 border-0 bg-transparent pr-4 text-2xs text-ink outline-0 placeholder:text-placeholder" id="email" name="email" type="email" inputMode="email" autoComplete="username" spellCheck={false} maxLength={255} placeholder={t("emailPlaceholder")} value={email} onChange={(event) => onEmailChange(event.target.value)} onBlur={onIdentifierBlur} aria-invalid={identifierError ? true : undefined} aria-describedby={identifierError ? "identifier-error" : undefined} />
            </div>
            <InlineError id="identifier-error" message={identifierError} />
          </div>
        ) : (
          <div className="grid gap-2">
             <label className="text-2xs font-bold text-ink" htmlFor="phone">{t("phoneLabel")}</label>
            <div className="flex items-center gap-0">
              <CountrySelect id="login-phone-country" value={country} onChange={onCountryChange} hasError={Boolean(identifierError)} ariaDescribedBy={identifierError ? "identifier-error" : undefined} />
              <div className={`${FIELD_CONTAINER_CLASSES} flex-1 rounded-l-none border-l-0 ${identifierError ? INVALID_FIELD_CLASSES : ""}`}>
                <input ref={phoneInput} className="min-h-9 w-full min-w-0 border-0 bg-transparent px-3 text-2xs text-ink outline-0 placeholder:text-placeholder" id="phone" name="phone" type="tel" inputMode="numeric" pattern="[0-9]*" autoComplete="tel-national" spellCheck={false} maxLength={countryOption.nationalLength} placeholder={countryOption.placeholder} value={phone} onChange={(event) => onPhoneChange(event.target.value)} onBlur={onIdentifierBlur} aria-invalid={identifierError ? true : undefined} aria-describedby={identifierError ? "identifier-error" : undefined} />
              </div>
            </div>
            <InlineError id="identifier-error" message={identifierError} />
          </div>
        )}

        {actorContext === "staff" ? (
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-4">
               <label className="text-2xs font-bold text-ink" htmlFor="password">{t("password")}</label>
               <Link href="/recover" className={`text-2xs font-medium text-muted hover:text-accent hover:underline ${FOCUS_RING_CLASSES}`}>{t("forgotPassword")}</Link>
            </div>
            <div className={`${FIELD_CONTAINER_CLASSES} ${passwordError ? INVALID_FIELD_CLASSES : ""}`}>
              <LockKeyhole className={`mx-3 size-4 shrink-0 transition-colors duration-200 ${passwordError ? "text-danger" : "text-icon-input"}`} strokeWidth={1.7} aria-hidden="true" />
              <input ref={passwordInput} className="min-h-9 w-full min-w-0 border-0 bg-transparent pr-1 text-2xs text-ink outline-0" id="password" name="password" type={isPasswordVisible ? "text" : "password"} autoComplete="current-password" maxLength={72} value={password} onChange={(event) => onPasswordChange(event.target.value)} onBlur={onPasswordBlur} aria-invalid={passwordError ? true : undefined} aria-describedby={passwordError ? "password-error" : undefined} />
              <button
                type="button"
                className={`mr-1 grid size-8 shrink-0 place-items-center rounded border-0 bg-transparent text-muted transition-colors hover:text-accent ${FOCUS_RING_CLASSES}`}
                onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
                 aria-label={isPasswordVisible ? t("hidePassword") : t("showPassword")}
                aria-pressed={isPasswordVisible}
              >
                {isPasswordVisible
                  ? <EyeOff className="size-4" strokeWidth={1.8} aria-hidden="true" />
                  : <Eye className="size-4" strokeWidth={1.8} aria-hidden="true" />}
              </button>
            </div>
            <InlineError id="password-error" message={passwordError} />
          </div>
        ) : null}

        <GlobalError message={globalError} />

        <button className={PRIMARY_BUTTON_CLASSES} type="submit" disabled={isPending}>
           {isPending ? <><Spinner /> {t("sendingCode")}</> : t("sendCode")}
        </button>
      </form>

      {!isSupportLogin ? (
        <p className="mt-7 text-center text-xs text-muted">
           {t("registerPrompt")} {" "}
           <Link href="/register" className={`border-0 bg-transparent p-0 text-xs font-bold text-accent hover:underline ${FOCUS_RING_CLASSES}`}>{t("register")}</Link>
        </p>
      ) : null}
    </div>
  );
}

type OtpStepProps = {
  destination: string;
  otpDigits: string[];
  expiresIn: number;
  resendAfter: number;
  codeError?: string;
  globalError: string | null;
  isPending: boolean;
  onOtpChange: (value: string[]) => void;
  onBack: () => void;
  onResend: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`;
}

export function OtpStep({ destination, otpDigits, expiresIn, resendAfter, codeError, globalError, isPending, onOtpChange, onBack, onResend, onSubmit }: OtpStepProps) {
  const t = useTranslations("auth");

  return (
    <div className="relative w-full max-w-96">
       <button className={`absolute top-0 right-0 grid size-10 place-items-center rounded-full border border-line bg-surface text-muted ${FOCUS_RING_CLASSES}`} type="button" onClick={onBack} aria-label={t("backToSignIn")}>
        <ArrowLeft className="size-4" strokeWidth={2} aria-hidden="true" />
      </button>
      <BrandLogo className="mb-7 h-11 w-auto" />
       <p className="mb-2 text-2xs font-extrabold tracking-[0.13em] text-accent uppercase">{t("secondFactor")}</p>
       <h1 className="text-balance text-[clamp(1.5rem,3.5vw,2rem)] leading-[1.15] font-extrabold tracking-[-0.045em]">{t("verifyIdentity")}</h1>
       <p className="mt-3 text-sm leading-6 text-muted">{t("codeSent", { destination })}</p>

      <form className="mt-5 grid gap-5" onSubmit={onSubmit} aria-busy={isPending} noValidate>
        <div className="flex items-center justify-between gap-4">
           <span className="text-2xs font-bold text-ink">{t("securityCode")}</span>
           <span className="font-mono text-2xs text-muted tabular-nums" aria-live="polite">{expiresIn > 0 ? formatCountdown(expiresIn) : t("expired")}</span>
        </div>
        <OtpCodeInput value={otpDigits} onChange={onOtpChange} disabled={isPending} hasError={Boolean(codeError)} />

        <InlineError message={codeError} />
        <GlobalError message={globalError} />

        <button className={PRIMARY_BUTTON_CLASSES} type="submit" disabled={isPending || expiresIn === 0}>
           {isPending ? <><Spinner /> {t("verifying")}</> : t("verifyCode")}
        </button>

        <p className="m-0 text-center text-xs text-muted">
           {t("noCode")} {" "}
          <button className={`border-0 bg-transparent p-0 text-xs font-bold text-accent ${FOCUS_RING_CLASSES}`} type="button" onClick={onResend} disabled={resendAfter > 0 || isPending}>
             {resendAfter > 0 ? t("resendIn", { seconds: resendAfter }) : t("resend")}
          </button>
        </p>
      </form>
    </div>
  );
}

export function SuccessStep({ onContinue, isNavigating }: { onContinue: () => void; isNavigating: boolean }) {
  const t = useTranslations("auth");

  return (
    <div className="w-full max-w-96 text-center" role="status" aria-busy={isNavigating}>
      <span className="mx-auto mb-6 grid size-16 place-items-center rounded-full border-[0.65rem] border-success-soft bg-success text-white motion-safe:animate-[field-error-enter_300ms_cubic-bezier(0.22,1,0.36,1)]" aria-hidden="true"><Check className="size-5" strokeWidth={3} /></span>
       <p className="mb-2 text-2xs font-extrabold tracking-[0.13em] text-accent uppercase">{t("identityConfirmed")}</p>
       <h1 className="text-balance text-[clamp(1.5rem,3.5vw,2rem)] leading-[1.15] font-extrabold tracking-[-0.045em]">{t("verificationSuccess")}</h1>
       <p className="mt-3 text-sm leading-6 text-muted">{t("validatedAccess")}</p>
      <button className={`${PRIMARY_BUTTON_CLASSES} mt-7`} type="button" onClick={onContinue} disabled={isNavigating}>
         {isNavigating ? <><Spinner /> {t("entering")}</> : t("goDashboard")}
      </button>
    </div>
  );
}

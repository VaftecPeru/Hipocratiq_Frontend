"use client";

import { FormEvent, startTransition, useEffect, useReducer, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "motion/react";
import { DashboardIrisTransition } from "@/features/auth/ui/dashboard-iris-transition";
import { requestLoginOtp, verifyLoginOtp } from "@/features/auth/api/browser-auth";
import { COUNTRY_OPTIONS, toE164PhoneNumber } from "@/features/auth/lib/phone-number";
import type { AuthStep, CountryCode, LoginActorContext, LoginIdentifierType, LoginRequestedRole, LoginRole } from "@/features/auth/model/auth.types";
import { CredentialsStep, OtpStep, SuccessStep } from "@/features/auth/ui/auth-steps";
import { useAuthPlatformSettings } from "@/features/auth/ui/auth-platform-settings";
import { useAuthDocumentTitle } from "@/features/auth/ui/auth-document-title";
import { ApiError } from "@/shared/api/http-client";
import { dashboardPathForSession } from "@/features/auth/lib/dashboard-path";

type FieldName = "identifier" | "password" | "code";
type FieldErrors = Partial<Record<FieldName, string>>;
type LoginFlowProps = {
  initialRole?: LoginRole;
};

const LOGIN_ROLE_REQUESTS = {
  healthcare: { actorContext: "staff", requestedRole: "doctor" },
  receptionist: { actorContext: "staff", requestedRole: "receptionist" },
  patient: { actorContext: "patient", requestedRole: "patient" },
  administrator: { actorContext: "staff", requestedRole: "clinic_admin" },
  support: { actorContext: "staff", requestedRole: "super_admin" },
} satisfies Record<LoginRole, { actorContext: LoginActorContext; requestedRole: LoginRequestedRole }>;

const LOGIN_CREDENTIAL_TITLE_KEYS = {
  healthcare: "healthcare",
  receptionist: "receptionist",
  patient: "patient",
  administrator: "administrator",
  support: "supportAccess",
} satisfies Record<LoginRole, "healthcare" | "receptionist" | "patient" | "administrator" | "supportAccess">;

const LOGIN_ROLE_TITLE_OVERRIDES: Partial<Record<LoginRole, { es: string; en: string }>> = {
  administrator: { es: "Administrador de clínica", en: "Clinic administrator" },
  support: { es: "Superadministrador", en: "Superadministrator" },
};

const OTP_DESTINATION_COPY = {
  es: {
    registeredEmail: "el correo electrónico registrado en tu cuenta",
    enteredEmail: "tu correo electrónico",
  },
  en: {
    registeredEmail: "the email registered to your account",
    enteredEmail: "your email address",
  },
} as const;

type FlowState = {
  step: AuthStep;
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
  | { type: "fieldInvalid"; field: FieldName; message: string }
  | { type: "fieldCleared"; field: FieldName }
  | { type: "otpIssued"; expiresIn: number; resendAfter: number; destination: string }
  | { type: "otpChanged"; value: string[] }
  | { type: "tick" }
  | { type: "verified" }
  | { type: "back" };

function createEmptyOtp(): string[] {
  return Array.from({ length: 6 }, () => "");
}

const INITIAL_FLOW_STATE: FlowState = {
  step: "credentials",
  otpDigits: createEmptyOtp(),
  expiresIn: 0,
  resendAfter: 0,
  destination: "tu correo electrónico registrado",
  error: null,
  fieldErrors: {},
  isPending: false,
};

function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "pending":
      return {
        ...state,
        isPending: action.value,
        error: action.value ? null : state.error,
        fieldErrors: action.value ? {} : state.fieldErrors,
      };
    case "error":
      return { ...state, error: action.message, isPending: false };
    case "validationFailed":
      return { ...state, error: null, fieldErrors: action.errors, isPending: false };
    case "fieldInvalid":
      return { ...state, error: null, fieldErrors: { ...state.fieldErrors, [action.field]: action.message } };
    case "fieldCleared": {
      const fieldErrors = { ...state.fieldErrors };
      delete fieldErrors[action.field];
      return { ...state, error: null, fieldErrors };
    }
    case "otpIssued":
      return {
        ...state,
        step: "otp",
        otpDigits: createEmptyOtp(),
        expiresIn: action.expiresIn,
        resendAfter: action.resendAfter,
        destination: action.destination,
        error: null,
        fieldErrors: {},
        isPending: false,
      };
    case "otpChanged":
      return { ...state, otpDigits: action.value, fieldErrors: { ...state.fieldErrors, code: undefined } };
    case "tick":
      return {
        ...state,
        expiresIn: Math.max(0, state.expiresIn - 1),
        resendAfter: Math.max(0, state.resendAfter - 1),
      };
    case "verified":
      return { ...state, step: "success", otpDigits: createEmptyOtp(), error: null, fieldErrors: {}, isPending: false };
    case "back":
      return { ...INITIAL_FLOW_STATE, otpDigits: createEmptyOtp(), fieldErrors: {} };
  }
}

export function LoginFlow({ initialRole = "healthcare" }: LoginFlowProps) {
  const locale = useLocale();
  const t = useTranslations("auth");
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const navigationTriggered = useRef(false);
  const { defaultCountryCode } = useAuthPlatformSettings();
  const challengeId = useRef("");
  const emailInput = useRef<HTMLInputElement>(null);
  const phoneInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const [flow, dispatch] = useReducer(flowReducer, INITIAL_FLOW_STATE);
  const [loginRole, setLoginRole] = useState<LoginRole>(initialRole);
  const [identifierType, setIdentifierType] = useState<LoginIdentifierType>("phone");
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const dashboardPath = useRef("/dashboard");
  const country = selectedCountry ?? defaultCountryCode;
  const { actorContext, requestedRole } = LOGIN_ROLE_REQUESTS[loginRole];
  const roleTitleOverride = LOGIN_ROLE_TITLE_OVERRIDES[loginRole];
  const localizedRoleTitle = roleTitleOverride
    ? roleTitleOverride[locale.startsWith("en") ? "en" : "es"]
    : t(LOGIN_CREDENTIAL_TITLE_KEYS[loginRole]);
  const otpDestinationCopy = locale.startsWith("en") ? OTP_DESTINATION_COPY.en : OTP_DESTINATION_COPY.es;
  const documentTitle = flow.step === "otp"
    ? t("verifyIdentity")
    : flow.step === "success"
      ? t("identityConfirmed")
      : `${t("signInAs")} — ${localizedRoleTitle}`;

  useAuthDocumentTitle(documentTitle);

  useEffect(() => {
    if (flow.step !== "otp") {
      return;
    }

    const timer = window.setInterval(() => dispatch({ type: "tick" }), 1000);
    return () => window.clearInterval(timer);
  }, [flow.step]);

  function getIdentifierValidationMessage(): string | null {
    if (identifierType === "email") {
      const normalizedEmail = email.trim();
       if (!normalizedEmail) return t("validationEmailRequired");
       if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
         return t("validationEmailInvalid");
      }
      return null;
    }

    try {
      toE164PhoneNumber(phone, country);
      return null;
    } catch (caughtError) {
       return caughtError instanceof Error ? caughtError.message : t("validationPhoneRequired");
    }
  }

  function focusFirstError(errors: FieldErrors) {
    const target = errors.identifier
      ? identifierType === "email" ? emailInput.current : phoneInput.current
      : actorContext === "staff" && errors.password ? passwordInput.current : null;
    window.requestAnimationFrame(() => target?.focus());
  }

  function handleError(caughtError: unknown) {
    if (caughtError instanceof ApiError && caughtError.errors) {
      const fieldErrors: FieldErrors = {
        identifier: caughtError.errors.identifier?.[0],
        password: caughtError.errors.password?.[0],
        code: caughtError.errors.code?.[0],
      };

      if (Object.values(fieldErrors).some(Boolean)) {
        dispatch({ type: "validationFailed", errors: fieldErrors });
        focusFirstError(fieldErrors);
        return;
      }
    }

    dispatch({
      type: "error",
      message: caughtError instanceof Error
        ? caughtError.message
        : t("serviceUnavailable"),
    });
  }

  function validateCredentials(): boolean {
    const identifierMessage = getIdentifierValidationMessage();
    const fieldErrors: FieldErrors = {
      identifier: identifierMessage ?? undefined,
      password: actorContext === "staff" && !password ? t("validationPasswordRequired") : undefined,
    };

    if (Object.values(fieldErrors).some(Boolean)) {
      dispatch({ type: "validationFailed", errors: fieldErrors });
      focusFirstError(fieldErrors);
      return false;
    }

    return true;
  }

  async function sendOtp() {
    const identifier = identifierType === "email"
      ? email.trim().toLowerCase()
      : toE164PhoneNumber(phone, country);
    const response = await requestLoginOtp(actorContext === "staff"
      ? { identifier, actorContext, requestedRole, password }
      : { identifier, actorContext, requestedRole });
    challengeId.current = response.data.challenge_id;
    dispatch({
      type: "otpIssued",
      expiresIn: response.data.expires_in,
      resendAfter: response.data.resend_after,
      destination: identifierType === "phone"
        ? otpDestinationCopy.registeredEmail
        : otpDestinationCopy.enteredEmail,
    });
  }

  function submitCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateCredentials()) return;
    dispatch({ type: "pending", value: true });

    startTransition(async () => {
      try {
        await sendOtp();
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
      dispatch({ type: "validationFailed", errors: { code: t("validationCodeRequired") } });
      return;
    }
    dispatch({ type: "pending", value: true });

    startTransition(async () => {
      try {
        const response = await verifyLoginOtp(challengeId.current, code);
        const destination = dashboardPathForSession(response.data);

        setPassword("");
        dashboardPath.current = destination;
        dispatch({ type: "verified" });
      } catch (caughtError) {
        handleError(caughtError);
      } finally {
        dispatch({ type: "pending", value: false });
      }
    });
  }

  function resendOtp() {
    if (flow.resendAfter > 0 || flow.isPending) return;
    dispatch({ type: "pending", value: true });
    startTransition(async () => {
      try {
        await sendOtp();
      } catch (caughtError) {
        handleError(caughtError);
      } finally {
        dispatch({ type: "pending", value: false });
      }
    });
  }

  function validateIdentifierField() {
    const message = getIdentifierValidationMessage();
    dispatch(message
      ? { type: "fieldInvalid", field: "identifier", message }
      : { type: "fieldCleared", field: "identifier" });
  }

  function finishDashboardNavigation() {
    if (navigationTriggered.current) return;
    navigationTriggered.current = true;
    startTransition(() => router.replace(dashboardPath.current));
  }

  function continueToDashboard() {
    if (isNavigating || flow.step !== "success") return;

    // Las animaciones nunca retrasan el acceso si el usuario solicita movimiento reducido.
    setIsNavigating(true);
    if (reducedMotion) finishDashboardNavigation();
  }

  if (flow.step === "success") {
    return (
      <>
        <SuccessStep onContinue={continueToDashboard} isNavigating={isNavigating} />
        {isNavigating && !reducedMotion ? (
          <DashboardIrisTransition onComplete={finishDashboardNavigation} />
        ) : null}
      </>
    );
  }

  if (flow.step === "otp") {
    return (
      <OtpStep
        destination={flow.destination}
        otpDigits={flow.otpDigits}
        expiresIn={flow.expiresIn}
        resendAfter={flow.resendAfter}
        codeError={flow.fieldErrors.code}
        globalError={flow.error}
        isPending={flow.isPending}
        onOtpChange={(value) => dispatch({ type: "otpChanged", value })}
        onBack={() => { challengeId.current = ""; dispatch({ type: "back" }); }}
        onResend={resendOtp}
        onSubmit={submitOtp}
      />
    );
  }

  return (
    <CredentialsStep
      loginRole={loginRole}
      actorContext={actorContext}
      identifierType={identifierType}
      country={country}
      email={email}
      phone={phone}
      password={password}
      identifierError={flow.fieldErrors.identifier}
      passwordError={flow.fieldErrors.password}
      globalError={flow.error}
      isPending={flow.isPending}
      emailInput={emailInput}
      phoneInput={phoneInput}
      passwordInput={passwordInput}
      onLoginRoleChange={(role) => {
        setLoginRole(role);
        setPassword("");
        dispatch({ type: "fieldCleared", field: "password" });
      }}
      onIdentifierTypeChange={(type) => { setIdentifierType(type); dispatch({ type: "fieldCleared", field: "identifier" }); }}
      onCountryChange={(value) => { setSelectedCountry(value); setPhone(""); dispatch({ type: "fieldCleared", field: "identifier" }); }}
      onEmailChange={(value) => { setEmail(value); dispatch({ type: "fieldCleared", field: "identifier" }); }}
      onPhoneChange={(value) => { setPhone(value.replace(/\D/g, "").slice(0, COUNTRY_OPTIONS[country].nationalLength)); dispatch({ type: "fieldCleared", field: "identifier" }); }}
      onPasswordChange={(value) => { setPassword(value); dispatch({ type: "fieldCleared", field: "password" }); }}
      onIdentifierBlur={validateIdentifierField}
      onPasswordBlur={() => {
        if (actorContext !== "staff") return;
        dispatch(password
          ? { type: "fieldCleared", field: "password" }
          : { type: "fieldInvalid", field: "password", message: t("validationPasswordRequired") });
      }}
      onSubmit={submitCredentials}
    />
  );
}

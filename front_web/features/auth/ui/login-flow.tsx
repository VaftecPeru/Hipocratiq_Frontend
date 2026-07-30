"use client";

import { FormEvent, startTransition, useEffect, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { requestLoginOtp, verifyLoginOtp } from "@/features/auth/api/browser-auth";
import { COUNTRY_OPTIONS, maskPhoneNumber, toE164PhoneNumber } from "@/features/auth/lib/phone-number";
import type { AuthStep, CountryCode, LoginIdentifierType } from "@/features/auth/model/auth.types";
import { CredentialsStep, OtpStep, SuccessStep } from "@/features/auth/ui/auth-steps";
import { ApiError } from "@/shared/api/http-client";

type FieldName = "identifier" | "password" | "code";
type FieldErrors = Partial<Record<FieldName, string>>;

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
  destination: "tu teléfono registrado",
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

export function LoginFlow() {
  const router = useRouter();
  const challengeId = useRef("");
  const emailInput = useRef<HTMLInputElement>(null);
  const phoneInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const [flow, dispatch] = useReducer(flowReducer, INITIAL_FLOW_STATE);
  const [identifierType, setIdentifierType] = useState<LoginIdentifierType>("phone");
  const [country, setCountry] = useState<CountryCode>("PE");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const dashboardPath = useRef("/dashboard");

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
      if (!normalizedEmail) return "Ingresa tu correo electrónico.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return "Usa un correo válido, por ejemplo nombre@organizacion.com.";
      }
      return null;
    }

    try {
      toE164PhoneNumber(phone, country);
      return null;
    } catch (caughtError) {
      return caughtError instanceof Error ? caughtError.message : "Ingresa un número de celular válido.";
    }
  }

  function focusFirstError(errors: FieldErrors) {
    const target = errors.identifier
      ? identifierType === "email" ? emailInput.current : phoneInput.current
      : errors.password ? passwordInput.current : null;
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
        : "No pudimos conectar con el servicio. Inténtalo nuevamente.",
    });
  }

  function validateCredentials(): boolean {
    const identifierMessage = getIdentifierValidationMessage();
    const fieldErrors: FieldErrors = {
      identifier: identifierMessage ?? undefined,
      password: password ? undefined : "Ingresa tu contraseña.",
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
    const response = await requestLoginOtp({ identifier, password });
    challengeId.current = response.data.challenge_id;
    dispatch({
      type: "otpIssued",
      expiresIn: response.data.expires_in,
      resendAfter: response.data.resend_after,
      destination: identifierType === "phone"
        ? maskPhoneNumber(identifier)
        : "el teléfono registrado en tu cuenta",
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
      dispatch({ type: "validationFailed", errors: { code: "Completa los seis dígitos del código." } });
      return;
    }
    dispatch({ type: "pending", value: true });

    startTransition(async () => {
      try {

const response = await verifyLoginOtp(challengeId.current, code);

//  GUARDAR TOKEN para que el servidor SSR pueda autenticarse
if (response.data.access_token) {
  localStorage.setItem("token", response.data.access_token);
  document.cookie = `token=${response.data.access_token}; path=/; max-age=7200; SameSite=Lax; Secure`;
}

const destination = response.data.actor_context === "clinic_admin"
  ? "/clinic/dashboard"
  : response.data.actor_context === "doctor"
    ? "/doctor/dashboard"
    : "/dashboard";
setPassword("");
dashboardPath.current = destination;
dispatch({ type: "verified" });
router.prefetch(destination);
        
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

  function continueToDashboard() {
    if (isNavigating) {
      return;
    }

    setIsNavigating(true);
    startTransition(() => router.replace(dashboardPath.current));
  }

  if (flow.step === "success") {
    return <SuccessStep onContinue={continueToDashboard} isNavigating={isNavigating} />;
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
      onIdentifierTypeChange={(type) => { setIdentifierType(type); dispatch({ type: "fieldCleared", field: "identifier" }); }}
      onCountryChange={(value) => { setCountry(value); setPhone(""); dispatch({ type: "fieldCleared", field: "identifier" }); }}
      onEmailChange={(value) => { setEmail(value); dispatch({ type: "fieldCleared", field: "identifier" }); }}
      onPhoneChange={(value) => { setPhone(value.replace(/\D/g, "").slice(0, COUNTRY_OPTIONS[country].nationalLength)); dispatch({ type: "fieldCleared", field: "identifier" }); }}
      onPasswordChange={(value) => { setPassword(value); dispatch({ type: "fieldCleared", field: "password" }); }}
      onIdentifierBlur={validateIdentifierField}
      onPasswordBlur={() => dispatch(password
        ? { type: "fieldCleared", field: "password" }
        : { type: "fieldInvalid", field: "password", message: "Ingresa tu contraseña." })}
      onSubmit={submitCredentials}
    />
  );
}

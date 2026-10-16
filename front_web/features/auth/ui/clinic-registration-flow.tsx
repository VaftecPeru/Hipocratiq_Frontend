"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  getClinicPlans,
  resendClinicRegistrationOtp,
  selectClinicPlan,
  startClinicRegistration,
  verifyClinicRegistration,
  type ClinicPlan,
  type ClinicRegistrationDraft,
} from "@/features/auth/api/clinic-registration";
import { toE164PhoneNumber } from "@/features/auth/lib/phone-number";
import type { CountryCode } from "@/features/auth/model/auth.types";
import { ClinicRegistrationForm } from "@/features/auth/ui/clinic-registration-form";
import { DoctorRegistrationFlow } from "@/features/auth/ui/doctor-registration-flow";
import { PatientRegistrationFlow } from "@/features/auth/ui/patient-registration-flow";
import { ClinicOtpStep, PlanStep, RegistrationSuccessStep, RoleStep } from "@/features/auth/ui/clinic-registration-steps";
import type { RegistrationFieldErrors, RegistrationFieldName, RegistrationStep } from "@/features/auth/ui/clinic-registration-ui";
import { ApiError } from "@/shared/api/http-client";
import { getGoogleRegistrationProfile } from "@/features/auth/api/browser-auth";
import type { GoogleIdentityProfile, GoogleRegistrationType } from "@/features/auth/model/auth.types";
import { useAuthDocumentTitle } from "@/features/auth/ui/auth-document-title";
import { Spinner } from "@/shared/ui/spinner";

const initialDraft: ClinicRegistrationDraft = {
  clinic_name: "",
  tax_id: "",
  country_code: "PE",
  contact_phone: "",
  address: "",
  admin_name: "",
  admin_email: "",
  admin_phone_number: "",
  password: "",
  password_confirmation: "",
  terms_accepted: false,
};

const CLINIC_REGISTRATION_TITLES = {
  role: "Crear cuenta",
  clinic: "Registrar clínica",
  plan: "Elegir plan",
  otp: "Verificar registro",
  success: "Registro exitoso",
} satisfies Record<RegistrationStep, string>;

function validateDraft(draft: ClinicRegistrationDraft): RegistrationFieldErrors {
  const errors: RegistrationFieldErrors = {};
  const add = (field: RegistrationFieldName, message: string) => { errors[field] = message; };

  if (draft.clinic_name.trim().length < 2) add("clinic_name", "Ingresa el nombre de tu clínica.");
  const taxId = draft.tax_id.trim().toUpperCase();
  if (draft.country_code === "MX") {
    if (![12, 13].includes(taxId.length)) add("tax_id", "El RFC debe tener 12 o 13 caracteres.");
    else if (!/^[A-Z0-9Ñ&]+$/u.test(taxId)) add("tax_id", "El RFC contiene caracteres no válidos.");
  } else if (taxId.length < 3) {
    add("tax_id", "Ingresa el identificador fiscal de la institución.");
  }
  if (!draft.address.trim()) add("address", "Ingresa la dirección de la institución.");
  if (draft.admin_name.trim().length < 2) add("admin_name", "Ingresa el nombre del administrador.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.admin_email.trim())) add("admin_email", "Usa un correo válido, por ejemplo admin@clinica.com.");

  for (const field of ["contact_phone", "admin_phone_number"] as const) {
    try {
      toE164PhoneNumber(draft[field], draft.country_code as CountryCode);
    } catch (caught) {
      add(field, caught instanceof Error ? caught.message : "Ingresa un número válido.");
    }
  }

  if (draft.password.length < 10 || !/[A-Z]/.test(draft.password) || !/[a-z]/.test(draft.password) || !/\d/.test(draft.password)) {
    add("password", "Usa al menos 10 caracteres, mayúsculas, minúsculas y números.");
  }
  if (!draft.password_confirmation) add("password_confirmation", "Confirma tu contraseña.");
  else if (draft.password !== draft.password_confirmation) add("password_confirmation", "Las contraseñas no coinciden.");
  if (!draft.terms_accepted) add("terms_accepted", "Debes aceptar los términos para continuar.");

  return errors;
}

type ClinicRegistrationFlowProps = {
  googleRegistrationToken?: string;
  googleRegistrationType?: GoogleRegistrationType;
};

export function ClinicRegistrationFlow({
  googleRegistrationToken,
  googleRegistrationType,
}: ClinicRegistrationFlowProps = {}) {
  const router = useRouter();
  const [step, setStep] = useState<RegistrationStep>(googleRegistrationType === "clinic" ? "clinic" : "role");
  const [isDoctorRegistration, setIsDoctorRegistration] = useState(googleRegistrationType === "doctor");
  const [isPatientRegistration, setIsPatientRegistration] = useState(googleRegistrationType === "patient");
  const [googleIdentity, setGoogleIdentity] = useState<GoogleIdentityProfile | null>(null);
  const [googleLoading, setGoogleLoading] = useState(Boolean(googleRegistrationToken && googleRegistrationType));
  const [draft, setDraft] = useState<ClinicRegistrationDraft>({
    ...initialDraft,
    google_registration_token: googleRegistrationToken,
  });
  const [plans, setPlans] = useState<ClinicPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");
  const [challengeId, setChallengeId] = useState("");
  const [expiresIn, setExpiresIn] = useState(0);
  const [resendAfter, setResendAfter] = useState(0);
  const [resendsRemaining, setResendsRemaining] = useState(5);
  const [code, setCode] = useState(() => Array.from({ length: 6 }, () => ""));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegistrationFieldErrors>({});

  useAuthDocumentTitle(
    isDoctorRegistration || isPatientRegistration ? null : CLINIC_REGISTRATION_TITLES[step],
  );

  useEffect(() => {
    document.getElementById("registration-scroll-region")?.scrollTo({ top: 0 });
  }, [step]);

  useEffect(() => {
    if (!googleRegistrationToken || !googleRegistrationType) return;

    let active = true;
    getGoogleRegistrationProfile(googleRegistrationToken, googleRegistrationType)
      .then((response) => {
        if (!active) return;
        setGoogleIdentity(response.data.identity);
        if (googleRegistrationType === "clinic") {
          setDraft((current) => ({
            ...current,
            admin_name: response.data.identity.name,
            admin_email: response.data.identity.email,
            google_registration_token: googleRegistrationToken,
          }));
        }
      })
      .catch((caught: unknown) => {
        if (!active) return;
        setError(caught instanceof Error ? caught.message : "No pudimos validar la identidad de Google.");
      })
      .finally(() => {
        if (active) setGoogleLoading(false);
      });

    return () => {
      active = false;
    };
  }, [googleRegistrationToken, googleRegistrationType]);

  useEffect(() => {
    if (step !== "plan") return;
    getClinicPlans().then((response) => setPlans(response.data)).catch(handleError);
  }, [step]);

  useEffect(() => {
    if (step !== "otp") return;
    const timer = window.setInterval(() => {
      setExpiresIn((value) => Math.max(0, value - 1));
      setResendAfter((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  function handleError(caught: unknown) {
    if (caught instanceof ApiError && caught.errors) {
      const nextErrors = Object.entries(caught.errors).reduce<RegistrationFieldErrors>((result, [field, messages]) => {
        if (field in initialDraft && messages[0]) result[field as RegistrationFieldName] = messages[0];
        return result;
      }, {});
      if (Object.keys(nextErrors).length > 0) {
        setFieldErrors(nextErrors);
        setError(null);
        const firstField = Object.keys(nextErrors)[0];
        window.requestAnimationFrame(() => document.getElementById(firstField)?.focus());
        return;
      }
    }
    setError(caught instanceof Error ? caught.message : "No pudimos completar el registro.");
  }

  function backToManualRegistration() {
    router.replace("/register");
  }

  function clearFieldError(field: RegistrationFieldName) {
    if (!fieldErrors[field]) return;
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function submitDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateDraft(draft);
    setFieldErrors(errors);
    setError(null);
    if (Object.keys(errors).length > 0) {
      window.requestAnimationFrame(() => document.getElementById(Object.keys(errors)[0])?.focus());
      return;
    }
    setPending(true);
    try {
      await startClinicRegistration(draft);
      setStep("plan");
    } catch (caught) {
      handleError(caught);
    } finally {
      setPending(false);
    }
  }

  async function choosePlan(plan: ClinicPlan) {
    setSelectedPlan(plan.key);
    setPending(true);
    setError(null);
    try {
      const response = await selectClinicPlan(plan.key, cycle);
      setChallengeId(response.data.challenge_id);
      setExpiresIn(response.data.expires_in);
      setResendAfter(response.data.resend_after);
      setResendsRemaining(response.data.resends_remaining);
      setStep("otp");
    } catch (caught) {
      handleError(caught);
    } finally {
      setPending(false);
    }
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    if (code.join("").length !== 6) {
      setError("Completa los seis dígitos del código.");
      setPending(false);
      return;
    }
    try {
      await verifyClinicRegistration(challengeId, code.join(""));
      setStep("success");
    } catch (caught) {
      handleError(caught);
    } finally {
      setPending(false);
    }
  }

  async function resend() {
    setPending(true);
    setError(null);
    try {
      const response = await resendClinicRegistrationOtp();
      setChallengeId(response.data.challenge_id);
      setExpiresIn(response.data.expires_in);
      setResendAfter(response.data.resend_after);
      setResendsRemaining(response.data.resends_remaining);
      setCode(Array.from({ length: 6 }, () => ""));
    } catch (caught) {
      handleError(caught);
    } finally {
      setPending(false);
    }
  }

  if (googleLoading) {
    return (
      <div className="grid min-h-72 place-items-center text-center">
        <div><Spinner /><p className="mt-3 text-sm font-bold text-muted">Validando tu identidad de Google…</p></div>
      </div>
    );
  }

  if (googleRegistrationToken && googleRegistrationType && !googleIdentity && error) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-danger/20 bg-surface p-6 text-center">
        <h1 className="text-lg font-extrabold text-ink">No pudimos continuar con Google</h1>
        <p className="mt-2 text-sm text-muted">{error}</p>
        <button className="mt-5 rounded-lg bg-accent px-4 py-2 text-xs font-extrabold text-white" type="button" onClick={() => router.replace("/register")}>Iniciar registro manual</button>
      </div>
    );
  }

  if (isDoctorRegistration) return <DoctorRegistrationFlow onBack={googleRegistrationType ? backToManualRegistration : () => setIsDoctorRegistration(false)} googleIdentity={googleIdentity ?? undefined} googleRegistrationToken={googleRegistrationToken} />;
  if (isPatientRegistration) return <PatientRegistrationFlow onBack={googleRegistrationType ? backToManualRegistration : () => setIsPatientRegistration(false)} googleIdentity={googleIdentity ?? undefined} googleRegistrationToken={googleRegistrationToken} />;
  if (step === "role") return <RoleStep onSelectClinic={() => setStep("clinic")} onSelectDoctor={() => setIsDoctorRegistration(true)} onSelectPatient={() => setIsPatientRegistration(true)} />;
  if (step === "clinic") return <ClinicRegistrationForm draft={draft} setDraft={setDraft} errors={fieldErrors} pending={pending} globalError={error} onClearError={clearFieldError} onBack={googleRegistrationType ? backToManualRegistration : () => setStep("role")} onSubmit={submitDraft} />;
  if (step === "plan") return <PlanStep plans={plans} selected={selectedPlan} cycle={cycle} pending={pending} error={error} onSelect={choosePlan} onCycleChange={setCycle} onBack={() => setStep("clinic")} />;
  if (step === "otp") return <ClinicOtpStep challengeId={challengeId} expiresIn={expiresIn} resendAfter={resendAfter} resendsRemaining={resendsRemaining} code={code} setCode={setCode} pending={pending} error={error} onVerify={verify} onResend={resend} onBack={() => setStep("plan")} />;
  return <RegistrationSuccessStep onContinue={() => router.replace("/clinic/dashboard")} />;
}

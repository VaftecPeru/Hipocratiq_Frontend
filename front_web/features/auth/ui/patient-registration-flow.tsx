"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  getPatientRegistrationClinics,
  resendPatientRegistrationOtp,
  startPatientRegistration,
  verifyPatientRegistration,
  type PatientChallengeData,
  type PatientRegistrationClinic,
  type PatientRegistrationDraft,
} from "@/features/auth/api/patient-registration";
import { toE164PhoneNumber } from "@/features/auth/lib/phone-number";
import type { CountryCode } from "@/features/auth/model/auth.types";
import { ClinicOtpStep, RegistrationSuccessStep } from "@/features/auth/ui/clinic-registration-steps";
import type { RegistrationFieldErrors, RegistrationFieldName } from "@/features/auth/ui/clinic-registration-ui";
import { PatientRegistrationForm } from "@/features/auth/ui/patient-registration-form";
import { ApiError } from "@/shared/api/http-client";
import { useAuthDocumentTitle } from "@/features/auth/ui/auth-document-title";

const initialDraft: PatientRegistrationDraft = {
  name: "",
  email: "",
  country_code: "MX",
  phone_number: "",
  clinic_id: null,
  terms_accepted: false,
};

const PATIENT_REGISTRATION_TITLES = {
  details: "Registro de paciente",
  otp: "Verificar registro de paciente",
  success: "Cuenta de paciente activada",
} satisfies Record<"details" | "otp" | "success", string>;

function validateDraft(draft: PatientRegistrationDraft): RegistrationFieldErrors {
  const errors: RegistrationFieldErrors = {};
  if (draft.name.trim().length < 2) errors.name = "Ingresa tu nombre completo.";
  if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) errors.email = "Ingresa un correo válido.";
  if (!draft.clinic_id) errors.clinic_id = "Selecciona una clínica.";
  try { toE164PhoneNumber(draft.phone_number, draft.country_code as CountryCode); } catch (caught) { errors.phone_number = caught instanceof Error ? caught.message : "Ingresa un número válido."; }
  if (!draft.terms_accepted) errors.terms_accepted = "Debes aceptar los términos para continuar.";
  return errors;
}

export function PatientRegistrationFlow({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "otp" | "success">("details");
  const [draft, setDraft] = useState(initialDraft);
  const [clinics, setClinics] = useState<PatientRegistrationClinic[]>([]);
  const [challengeId, setChallengeId] = useState("");
  const [expiresIn, setExpiresIn] = useState(0);
  const [resendAfter, setResendAfter] = useState(0);
  const [resendsRemaining, setResendsRemaining] = useState(5);
  const [code, setCode] = useState(() => Array.from({ length: 6 }, () => ""));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegistrationFieldErrors>({});

  useAuthDocumentTitle(PATIENT_REGISTRATION_TITLES[step]);

  useEffect(() => { getPatientRegistrationClinics().then((response) => setClinics(response.data)).catch(handleError); }, []);
  useEffect(() => { document.getElementById("registration-scroll-region")?.scrollTo({ top: 0 }); }, [step]);
  useEffect(() => {
    if (step !== "otp") return;
    const timer = window.setInterval(() => { setExpiresIn((value) => Math.max(0, value - 1)); setResendAfter((value) => Math.max(0, value - 1)); }, 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  function handleError(caught: unknown) {
    if (caught instanceof ApiError && caught.errors) {
      const nextErrors = Object.entries(caught.errors).reduce<RegistrationFieldErrors>((result, [field, messages]) => {
        if (field in initialDraft && messages[0]) result[field as RegistrationFieldName] = messages[0];
        return result;
      }, {});
      if (Object.keys(nextErrors).length > 0) { setFieldErrors(nextErrors); setError(null); return; }
    }
    setError(caught instanceof Error ? caught.message : "No pudimos completar el registro de paciente.");
  }

  function applyChallenge(data: PatientChallengeData) {
    setChallengeId(data.challenge_id);
    setExpiresIn(data.expires_in);
    setResendAfter(data.resend_after);
    setResendsRemaining(data.resends_remaining);
    setStep("otp");
  }

  async function submitDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateDraft(draft); setFieldErrors(errors); setError(null);
    if (Object.keys(errors).length > 0) { window.requestAnimationFrame(() => document.getElementById(Object.keys(errors)[0])?.focus()); return; }
    setPending(true);
    try { applyChallenge((await startPatientRegistration(draft)).data); } catch (caught) { handleError(caught); } finally { setPending(false); }
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.join("").length !== 6) { setError("Completa los seis dígitos del código."); return; }
    setPending(true); setError(null);
    try { await verifyPatientRegistration(challengeId, code.join("")); setStep("success"); } catch (caught) { handleError(caught); } finally { setPending(false); }
  }

  async function resend() {
    setPending(true); setError(null);
    try { applyChallenge((await resendPatientRegistrationOtp(challengeId)).data); setCode(Array.from({ length: 6 }, () => "")); } catch (caught) { handleError(caught); } finally { setPending(false); }
  }

  function clearFieldError(field: RegistrationFieldName) {
    setFieldErrors((current) => { if (!current[field]) return current; const next = { ...current }; delete next[field]; return next; });
  }

  if (step === "details") return <PatientRegistrationForm draft={draft} clinics={clinics} errors={fieldErrors} pending={pending} globalError={error} onChange={setDraft} onClearError={clearFieldError} onBack={onBack} onSubmit={submitDraft} />;
  if (step === "otp") return <ClinicOtpStep challengeId={challengeId} expiresIn={expiresIn} resendAfter={resendAfter} resendsRemaining={resendsRemaining} code={code} setCode={setCode} pending={pending} error={error} recipientDescription="móvil del paciente" onVerify={verify} onResend={resend} onBack={() => setStep("details")} />;
  return <RegistrationSuccessStep title="Cuenta de paciente activada" description="Tu teléfono fue verificado y tu clínica quedó asociada. Podrás elegir un plan después desde tu cuenta." buttonLabel="Entrar a mi cuenta" onContinue={() => router.replace("/patient/dashboard")} />;
}

"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  getDoctorPlans,
  getDoctorRegistrationClinics,
  getDoctorRegistrationSpecialties,
  resendDoctorRegistrationOtp,
  selectDoctorPlan,
  startDoctorRegistration,
  verifyDoctorRegistration,
  type DoctorRegistrationDraft,
  type RegistrationClinic,
  type RegistrationSpecialty,
} from "@/features/auth/api/doctor-registration";
import type { ClinicPlan } from "@/features/auth/api/clinic-registration";
import { toE164PhoneNumber } from "@/features/auth/lib/phone-number";
import type { CountryCode, GoogleIdentityProfile } from "@/features/auth/model/auth.types";
import { DoctorRegistrationForm } from "@/features/auth/ui/doctor-registration-form";
import { ClinicOtpStep, PlanStep, RegistrationSuccessStep } from "@/features/auth/ui/clinic-registration-steps";
import type { RegistrationFieldErrors, RegistrationFieldName } from "@/features/auth/ui/clinic-registration-ui";
import { ApiError } from "@/shared/api/http-client";
import { useAuthDocumentTitle } from "@/features/auth/ui/auth-document-title";

const initialDraft: DoctorRegistrationDraft = {
  doctor_name: "", doctor_email: "", country_code: "PE", doctor_phone_number: "", medical_license: "", specialty: "", specialty_id: null, subspecialty_id: null, practice_type: "clinic", clinic_id: null, password: "", password_confirmation: "", terms_accepted: false,
};

type DoctorStep = "details" | "plan" | "otp" | "success";

const DOCTOR_REGISTRATION_TITLES = {
  details: "Registro médico",
  plan: "Plan médico",
  otp: "Verificar registro médico",
  success: "Cuenta médica activada",
} satisfies Record<DoctorStep, string>;

function validateDraft(draft: DoctorRegistrationDraft, catalogStatus: "loading" | "available" | "unavailable"): RegistrationFieldErrors {
  const errors: RegistrationFieldErrors = {};
  if (draft.doctor_name.trim().length < 2) errors.doctor_name = "Ingresa tu nombre completo.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.doctor_email.trim())) errors.doctor_email = "Ingresa un correo válido.";
  if (draft.medical_license.trim().length < 3) errors.medical_license = "Ingresa tu licencia o número de colegiatura.";
  if (!draft.specialty_id && draft.specialty.trim().length < 2) {
    errors[catalogStatus === "unavailable" ? "specialty" : "specialty_id"] = catalogStatus === "unavailable" ? "Ingresa tu especialidad." : "Selecciona una especialidad.";
  }
  if (draft.practice_type === "clinic" && !draft.clinic_id) errors.clinic_id = "Selecciona la clínica donde trabajas.";
  try { toE164PhoneNumber(draft.doctor_phone_number, draft.country_code as CountryCode); } catch (caught) { errors.doctor_phone_number = caught instanceof Error ? caught.message : "Ingresa un número válido."; }
  if (draft.password.length < 10 || !/[A-Z]/.test(draft.password) || !/[a-z]/.test(draft.password) || !/\d/.test(draft.password)) errors.password = "Usa al menos 10 caracteres, mayúsculas, minúsculas y números.";
  if (!draft.password_confirmation) errors.password_confirmation = "Confirma tu contraseña.";
  else if (draft.password !== draft.password_confirmation) errors.password_confirmation = "Las contraseñas no coinciden.";
  if (!draft.terms_accepted) errors.terms_accepted = "Debes aceptar los términos para continuar.";
  return errors;
}

type DoctorRegistrationFlowProps = {
  onBack: () => void;
  googleIdentity?: GoogleIdentityProfile;
  googleRegistrationToken?: string;
};

export function DoctorRegistrationFlow({
  onBack,
  googleIdentity,
  googleRegistrationToken,
}: DoctorRegistrationFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<DoctorStep>("details");
  const [draft, setDraft] = useState<DoctorRegistrationDraft>({
    ...initialDraft,
    doctor_name: googleIdentity?.name ?? "",
    doctor_email: googleIdentity?.email ?? "",
    google_registration_token: googleRegistrationToken,
  });
  const [clinics, setClinics] = useState<RegistrationClinic[]>([]);
  const [specialties, setSpecialties] = useState<RegistrationSpecialty[]>([]);
  const [catalogStatus, setCatalogStatus] = useState<"loading" | "available" | "unavailable">("loading");
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

  useAuthDocumentTitle(DOCTOR_REGISTRATION_TITLES[step]);

  useEffect(() => { getDoctorRegistrationClinics().then((response) => setClinics(response.data)).catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "No pudimos completar el registro médico.")); }, []);
  useEffect(() => { getDoctorRegistrationSpecialties().then((response) => { setSpecialties(response.data); setCatalogStatus("available"); }).catch(() => setCatalogStatus("unavailable")); }, []);
  useEffect(() => { document.getElementById("registration-scroll-region")?.scrollTo({ top: 0 }); }, [step]);
  useEffect(() => {
    if (step !== "otp") return;
    const timer = window.setInterval(() => { setExpiresIn((value) => Math.max(0, value - 1)); setResendAfter((value) => Math.max(0, value - 1)); }, 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  function handleError(caught: unknown) {
    if (caught instanceof ApiError && caught.errors) {
      const nextErrors = Object.entries(caught.errors).reduce<RegistrationFieldErrors>((result, [field, messages]) => {
        const errorField = catalogStatus === "unavailable" && field === "specialty_id" ? "specialty" : field;
        if (errorField in initialDraft && messages[0]) result[errorField as RegistrationFieldName] = messages[0];
        return result;
      }, {});
      if (Object.keys(nextErrors).length > 0) { setFieldErrors(nextErrors); setError(null); return; }
    }
    setError(caught instanceof Error ? caught.message : "No pudimos completar el registro médico.");
  }

  function applyChallenge(data: { challenge_id: string; expires_in: number; resend_after: number; resends_remaining: number }) {
    setChallengeId(data.challenge_id); setExpiresIn(data.expires_in); setResendAfter(data.resend_after); setResendsRemaining(data.resends_remaining); setStep("otp");
  }

  async function submitDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateDraft(draft, catalogStatus); setFieldErrors(errors); setError(null);
    if (Object.keys(errors).length > 0) { window.requestAnimationFrame(() => document.getElementById(Object.keys(errors)[0])?.focus()); return; }
    setPending(true);
    try {
      const response = await startDoctorRegistration(draft);
      if (response.data.next_step === "verify_otp") {
        applyChallenge(response.data);
      } else {
        const plansResponse = await getDoctorPlans();
        setPlans(plansResponse.data);
        setStep("plan");
      }
    } catch (caught) { handleError(caught); } finally { setPending(false); }
  }

  async function choosePlan(plan: ClinicPlan) {
    setSelectedPlan(plan.key); setPending(true); setError(null);
    try { applyChallenge((await selectDoctorPlan(plan.key, cycle)).data); } catch (caught) { handleError(caught); } finally { setPending(false); }
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.join("").length !== 6) { setError("Completa los seis dígitos del código."); return; }
    setPending(true); setError(null);
    try { await verifyDoctorRegistration(challengeId, code.join("")); setStep("success"); } catch (caught) { handleError(caught); } finally { setPending(false); }
  }

  async function resend() {
    setPending(true); setError(null);
    try { applyChallenge((await resendDoctorRegistrationOtp()).data); setCode(Array.from({ length: 6 }, () => "")); } catch (caught) { handleError(caught); } finally { setPending(false); }
  }

  function clearFieldError(field: RegistrationFieldName) {
    setFieldErrors((current) => { if (!current[field]) return current; const next = { ...current }; delete next[field]; return next; });
  }

  if (step === "details") return <DoctorRegistrationForm draft={draft} clinics={clinics} specialties={specialties} catalogStatus={catalogStatus} errors={fieldErrors} pending={pending} globalError={error} onChange={setDraft} onClearError={clearFieldError} onBack={onBack} onSubmit={submitDraft} />;
  if (step === "plan") return <PlanStep plans={plans} selected={selectedPlan} cycle={cycle} pending={pending} error={error} subject="doctor" onSelect={choosePlan} onCycleChange={setCycle} onBack={() => setStep("details")} />;
  if (step === "otp") return <ClinicOtpStep challengeId={challengeId} expiresIn={expiresIn} resendAfter={resendAfter} resendsRemaining={resendsRemaining} code={code} setCode={setCode} pending={pending} error={error} recipientDescription="correo del médico" onVerify={verify} onResend={resend} onBack={() => setStep(draft.practice_type === "independent" ? "plan" : "details")} />;
  return <RegistrationSuccessStep title="Cuenta médica activada" description="Tu identidad fue verificada y ya puedes entrar a tu panel profesional." buttonLabel="Entrar al panel médico" onContinue={() => router.replace("/doctor/dashboard")} />;
}

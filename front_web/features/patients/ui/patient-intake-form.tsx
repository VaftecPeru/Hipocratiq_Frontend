"use client";

import { AlertTriangle, CheckCircle2, Download, FileText, Info, LoaderCircle, RefreshCw, Save, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  getPatientIntakeDraft,
  savePatientIntakeDraft,
  type PatientIdentificationDraft,
  type PatientIntakeDraft,
  type PatientIntakeDraftPayload,
  type PatientIntakeDraftSections,
} from "@/features/patients/api/patient-intake";
import { ApiError } from "@/shared/api/http-client";

type DraftFormState = {
  patientIdentification: Record<keyof PatientIdentificationDraft, string>;
  familyHistory: { description: string };
  nonPathologicalHistory: { description: string };
  pathologicalHistory: { description: string };
  gynecoObstetricHistory: { description: string };
  presentIllness: { reason: string; illnessNarrative: string };
  systemsReview: { description: string };
  vitalSigns: Record<keyof PatientIntakeDraftSections["vitalSigns"], string>;
};

type DraftLoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready" };

function errorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "No pudimos completar esta acción. Inténtalo nuevamente.";
}

function fieldErrorsFrom(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !error.errors) return {};

  return Object.fromEntries(
    Object.entries(error.errors).map(([field, messages]) => [field, messages.join(" ")]),
  );
}

function textValue(value: string | number | null): string {
  return value === null ? "" : String(value);
}

function numberValue(value: number | null): string {
  return value === null ? "" : String(value);
}

function formFromDraft(draft: PatientIntakeDraft): DraftFormState {
  const identity = draft.sections.patientIdentification;
  const vitalSigns = draft.sections.vitalSigns;

  return {
    patientIdentification: {
      name: textValue(identity.name),
      age: numberValue(identity.age),
      documentType: textValue(identity.documentType),
      documentNumber: textValue(identity.documentNumber),
      birthDate: textValue(identity.birthDate),
      gender: textValue(identity.gender),
      occupation: textValue(identity.occupation),
      address: textValue(identity.address),
      guardianName: textValue(identity.guardianName),
      relationship: textValue(identity.relationship),
      phoneNumber: textValue(identity.phoneNumber),
      email: textValue(identity.email),
      emergencyContact: textValue(identity.emergencyContact),
      insurance: textValue(identity.insurance),
    },
    familyHistory: { description: textValue(draft.sections.familyHistory.description) },
    nonPathologicalHistory: { description: textValue(draft.sections.nonPathologicalHistory.description) },
    pathologicalHistory: { description: textValue(draft.sections.pathologicalHistory.description) },
    gynecoObstetricHistory: { description: textValue(draft.sections.gynecoObstetricHistory.description) },
    presentIllness: {
      reason: textValue(draft.sections.presentIllness.reason),
      illnessNarrative: textValue(draft.sections.presentIllness.illnessNarrative),
    },
    systemsReview: { description: textValue(draft.sections.systemsReview.description) },
    vitalSigns: {
      bloodPressureSystolic: numberValue(vitalSigns.bloodPressureSystolic),
      bloodPressureDiastolic: numberValue(vitalSigns.bloodPressureDiastolic),
      temperatureC: numberValue(vitalSigns.temperatureC),
      heartRate: numberValue(vitalSigns.heartRate),
      respiratoryRate: numberValue(vitalSigns.respiratoryRate),
      oxygenSaturation: numberValue(vitalSigns.oxygenSaturation),
      weightKg: numberValue(vitalSigns.weightKg),
      heightCm: numberValue(vitalSigns.heightCm),
      notes: textValue(vitalSigns.notes),
    },
  };
}

function nullableText(value: string): string | null {
  const normalized = value.trim();
  return normalized === "" ? null : normalized;
}

function nullableNumber(value: string): number | null {
  const normalized = value.trim();
  if (normalized === "") return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function toGender(value: string): PatientIdentificationDraft["gender"] {
  return value === "Femenino" || value === "Masculino" || value === "Otro" ? value : null;
}

function payloadFromForm(form: DraftFormState): PatientIntakeDraftPayload {
  const identity = form.patientIdentification;
  const vitalSigns = form.vitalSigns;

  return {
    declarationAccepted: true,
    sections: {
      patientIdentification: {
        name: nullableText(identity.name),
        age: nullableNumber(identity.age),
        documentType: nullableText(identity.documentType),
        documentNumber: nullableText(identity.documentNumber),
        birthDate: nullableText(identity.birthDate),
        gender: toGender(identity.gender),
        occupation: nullableText(identity.occupation),
        address: nullableText(identity.address),
        guardianName: nullableText(identity.guardianName),
        relationship: nullableText(identity.relationship),
        phoneNumber: nullableText(identity.phoneNumber),
        email: nullableText(identity.email),
        emergencyContact: nullableText(identity.emergencyContact),
        insurance: nullableText(identity.insurance),
      },
      familyHistory: { description: nullableText(form.familyHistory.description) },
      nonPathologicalHistory: { description: nullableText(form.nonPathologicalHistory.description) },
      pathologicalHistory: { description: nullableText(form.pathologicalHistory.description) },
      gynecoObstetricHistory: { description: nullableText(form.gynecoObstetricHistory.description) },
      presentIllness: {
        reason: nullableText(form.presentIllness.reason),
        illnessNarrative: nullableText(form.presentIllness.illnessNarrative),
      },
      systemsReview: { description: nullableText(form.systemsReview.description) },
      vitalSigns: {
        bloodPressureSystolic: nullableNumber(vitalSigns.bloodPressureSystolic),
        bloodPressureDiastolic: nullableNumber(vitalSigns.bloodPressureDiastolic),
        temperatureC: nullableNumber(vitalSigns.temperatureC),
        heartRate: nullableNumber(vitalSigns.heartRate),
        respiratoryRate: nullableNumber(vitalSigns.respiratoryRate),
        oxygenSaturation: nullableNumber(vitalSigns.oxygenSaturation),
        weightKg: nullableNumber(vitalSigns.weightKg),
        heightCm: nullableNumber(vitalSigns.heightCm),
        notes: nullableText(vitalSigns.notes),
      },
    },
  };
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <span id={id} className="text-xs font-bold text-danger" role="alert">{message}</span> : null;
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  inputMode,
  min,
  max,
  step,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: "text" | "email" | "date" | "number";
  inputMode?: "decimal" | "numeric" | "text";
  min?: string;
  max?: string;
  step?: string;
}) {
  const errorId = `${id}-error`;

  return (
    <label className="grid min-w-0 gap-1.5 text-xs font-extrabold text-ink-secondary" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        className="patient-form-control min-h-11 rounded-lg border border-line bg-surface-input px-3 text-sm font-medium text-ink outline-none transition focus:border-focus focus:ring-2 focus:ring-focus/20"
        type={type}
        inputMode={inputMode}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      <FieldError id={errorId} message={error} />
    </label>
  );
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <label className="grid min-w-0 gap-1.5 text-xs font-extrabold text-ink-secondary" htmlFor={id}>
      <span>{label}</span>
      {hint ? <span id={hintId} className="font-medium text-muted">{hint}</span> : null}
      <textarea
        id={id}
        className="patient-form-control min-h-28 resize-y rounded-lg border border-line bg-surface-input px-3 py-2 text-sm font-medium leading-relaxed text-ink outline-none transition focus:border-focus focus:ring-2 focus:ring-focus/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined}
      />
      <FieldError id={errorId} message={error} />
    </label>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <fieldset className="patient-form-section rounded-xl border border-line bg-surface p-4 shadow-sm sm:p-5">
      <legend className="px-1 text-base font-black tracking-tight text-ink">{title}</legend>
      <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
      <div className="mt-4 grid gap-4">{children}</div>
    </fieldset>
  );
}

function formErrorFor(errors: Record<string, string>, path: string): string | undefined {
  return errors[path];
}

function safeFileName(value: string | null): string {
  const normalized = (value ?? "paciente")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return `historia-clinica-${normalized || "paciente"}.pdf`;
}

export function PatientIntakeForm() {
  const [loadState, setLoadState] = useState<DraftLoadState>({ status: "loading" });
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [draft, setDraft] = useState<PatientIntakeDraft | null>(null);
  const [form, setForm] = useState<DraftFormState | null>(null);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const controller = new AbortController();

    getPatientIntakeDraft(controller.signal)
      .then((loadedDraft) => {
        setDraft(loadedDraft);
        setForm(formFromDraft(loadedDraft));
        setDeclarationAccepted(loadedDraft.declarationAcceptedAt !== null);
        setDirty(false);
        setLoadState({ status: "ready" });
      })
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          setLoadState({ status: "error", message: errorMessage(loadError) });
        }
      });

    return () => controller.abort();
  }, [loadAttempt]);

  function markChanged() {
    setDirty(true);
    setMessage(null);
    setError(null);
  }

  function updateIdentity(field: keyof DraftFormState["patientIdentification"], value: string) {
    markChanged();
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[`sections.patient_identification.${field === "documentType" ? "document_type" : field === "documentNumber" ? "document_number" : field === "birthDate" ? "birth_date" : field === "guardianName" ? "guardian_name" : field === "phoneNumber" ? "phone_number" : field === "emergencyContact" ? "emergency_contact" : field}`];
      return next;
    });
    setForm((current) => current ? { ...current, patientIdentification: { ...current.patientIdentification, [field]: value } } : current);
  }

  function updateNarrative(section: "familyHistory" | "nonPathologicalHistory" | "pathologicalHistory" | "gynecoObstetricHistory" | "systemsReview", value: string) {
    markChanged();
    const apiSection = section === "nonPathologicalHistory"
      ? "non_pathological_history"
      : section === "gynecoObstetricHistory"
        ? "gyneco_obstetric_history"
        : section.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[`sections.${apiSection}.description`];
      return next;
    });
    setForm((current) => current ? { ...current, [section]: { description: value } } : current);
  }

  function updatePresentIllness(field: keyof DraftFormState["presentIllness"], value: string) {
    markChanged();
    const apiField = field === "illnessNarrative" ? "illness_narrative" : field;
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[`sections.present_illness.${apiField}`];
      return next;
    });
    setForm((current) => current ? { ...current, presentIllness: { ...current.presentIllness, [field]: value } } : current);
  }

  function updateVital(field: keyof DraftFormState["vitalSigns"], value: string) {
    markChanged();
    const apiField = field.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[`sections.vital_signs.${apiField}`];
      return next;
    });
    setForm((current) => current ? { ...current, vitalSigns: { ...current.vitalSigns, [field]: value } } : current);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;

    setSaving(true);
    setMessage(null);
    setError(null);
    setFieldErrors({});

    try {
      const savedDraft = await savePatientIntakeDraft(payloadFromForm(form));
      setDraft(savedDraft);
      setForm(formFromDraft(savedDraft));
      setDeclarationAccepted(savedDraft.declarationAcceptedAt !== null);
      setDirty(false);
      setMessage("Formulario guardado. El contenido permanece pendiente de verificación clínica.");
    } catch (saveError) {
      setError(errorMessage(saveError));
      setFieldErrors(fieldErrorsFrom(saveError));
    } finally {
      setSaving(false);
    }
  }

  async function exportPdf() {
    if (!draft || dirty || !draft.declarationAcceptedAt) {
      setError("Guarda el formulario y confirma la declaración antes de exportar el PDF.");
      return;
    }

    setExporting(true);
    setMessage(null);
    setError(null);

    try {
      const [{ pdf }, { PatientIntakePdf }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/features/patients/ui/patient-intake-pdf"),
      ]);
      const blob = await pdf(<PatientIntakePdf draft={draft} />).toBlob();

      if (blob.type !== "application/pdf") {
        throw new Error("La exportación no devolvió un archivo PDF válido.");
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = safeFileName(draft.sections.patientIdentification.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage("PDF exportado correctamente.");
    } catch (exportError) {
      setError(errorMessage(exportError));
    } finally {
      setExporting(false);
    }
  }

  function reloadDraft() {
    if (dirty && !window.confirm("Tienes cambios sin guardar. ¿Quieres descartarlos y recargar el formulario?")) return;

    setLoadState({ status: "loading" });
    setMessage(null);
    setError(null);
    setFieldErrors({});
    setLoadAttempt((attempt) => attempt + 1);
  }

  if (loadState.status === "error") {
    return (
      <div className="patient-page">
        <section className="rounded-xl border border-danger/30 bg-danger-soft p-5" role="alert">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden="true" />
            <div>
              <h2 className="text-base font-black text-ink">No pudimos cargar tu formulario</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{loadState.message}</p>
              <button className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 text-xs font-extrabold text-paper transition hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus" type="button" onClick={reloadDraft}><RefreshCw className="size-4" aria-hidden="true" />Intentar nuevamente</button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (loadState.status === "loading" || form === null) {
    return <div className="patient-page" role="status" aria-live="polite">Cargando formulario de ingreso…</div>;
  }

  const savedLabel = draft?.updatedAt ? `Último guardado: ${new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(draft.updatedAt))}` : "Todavía no has guardado este formulario.";
  const pdfHelp = dirty
    ? "Guarda los cambios para habilitar un PDF actualizado."
    : !draft?.declarationAcceptedAt
      ? "Acepta la declaración y guarda el formulario para habilitar el PDF."
      : "El PDF incluirá una marca visible de autoría del paciente y pendiente de verificación.";

  return (
    <div className="patient-page">
      <section className="patient-intake-hero relative overflow-hidden rounded-2xl border border-line border-l-4 border-l-accent bg-surface p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-accent">Ingreso clínico virtual</p>
            <h2 className="mt-2 max-w-2xl text-2xl font-black tracking-tight text-ink sm:text-3xl">Cuéntale al equipo clínico lo que necesitas antes de tu atención.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">Completa tus antecedentes y síntomas con tus propias palabras. El documento se guarda como borrador de paciente y requiere verificación profesional.</p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Acciones del formulario">
            <button className="patient-secondary-action inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3 text-xs font-extrabold text-ink transition hover:border-line-strong hover:bg-surface-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={reloadDraft} disabled={saving || exporting}><RefreshCw className="size-4" aria-hidden="true" />Recargar</button>
            <button className="patient-primary-action inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-3 text-xs font-extrabold text-paper transition hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={() => void exportPdf()} disabled={saving || exporting || dirty || !draft?.declarationAcceptedAt} aria-describedby="pdf-help"><Download className="size-4" aria-hidden="true" />{exporting ? "Generando PDF…" : "Exportar PDF"}</button>
          </div>
        </div>
         <p id="pdf-help" className="mt-4 text-xs font-bold text-muted">{pdfHelp}</p>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <form className="grid gap-4" aria-busy={saving} aria-describedby={error ? "intake-form-error" : message ? "intake-form-message" : undefined} onSubmit={(event) => void submit(event)}>
          <FormSection title="Ficha de identificación" description="Revisa los datos personales que quieres presentar al equipo clínico en este ingreso.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <TextField id="intake-name" label="Nombre completo" value={form.patientIdentification.name} onChange={(value) => updateIdentity("name", value)} error={formErrorFor(fieldErrors, "sections.patient_identification.name")} />
              <TextField id="intake-age" label="Edad" type="number" inputMode="numeric" min="0" max="130" value={form.patientIdentification.age} onChange={(value) => updateIdentity("age", value)} error={formErrorFor(fieldErrors, "sections.patient_identification.age")} />
              <TextField id="intake-document-type" label="Tipo de documento" value={form.patientIdentification.documentType} onChange={(value) => updateIdentity("documentType", value)} error={formErrorFor(fieldErrors, "sections.patient_identification.document_type")} />
              <TextField id="intake-document-number" label="Número de documento" value={form.patientIdentification.documentNumber} onChange={(value) => updateIdentity("documentNumber", value)} error={formErrorFor(fieldErrors, "sections.patient_identification.document_number")} />
              <TextField id="intake-birth-date" label="Fecha de nacimiento" type="date" value={form.patientIdentification.birthDate} onChange={(value) => updateIdentity("birthDate", value)} error={formErrorFor(fieldErrors, "sections.patient_identification.birth_date")} />
              <label className="grid min-w-0 gap-1.5 text-xs font-extrabold text-ink-secondary" htmlFor="intake-gender"><span>Género</span><select id="intake-gender" className="min-h-11 rounded-lg border border-line bg-surface-input px-3 text-sm font-medium text-ink outline-none transition focus:border-focus focus:ring-2 focus:ring-focus/20" value={form.patientIdentification.gender} onChange={(event) => updateIdentity("gender", event.target.value)} aria-invalid={fieldErrors["sections.patient_identification.gender"] ? true : undefined} aria-describedby={fieldErrors["sections.patient_identification.gender"] ? "intake-gender-error" : undefined}><option value="">No informar</option><option value="Femenino">Femenino</option><option value="Masculino">Masculino</option><option value="Otro">Otro</option></select><FieldError id="intake-gender-error" message={formErrorFor(fieldErrors, "sections.patient_identification.gender")} /></label>
              <TextField id="intake-occupation" label="Ocupación" value={form.patientIdentification.occupation} onChange={(value) => updateIdentity("occupation", value)} error={formErrorFor(fieldErrors, "sections.patient_identification.occupation")} />
              <TextField id="intake-phone" label="Teléfono" value={form.patientIdentification.phoneNumber} onChange={(value) => updateIdentity("phoneNumber", value)} error={formErrorFor(fieldErrors, "sections.patient_identification.phone_number")} />
              <TextField id="intake-email" label="Correo electrónico" type="email" value={form.patientIdentification.email} onChange={(value) => updateIdentity("email", value)} error={formErrorFor(fieldErrors, "sections.patient_identification.email")} />
              <TextAreaField id="intake-address" label="Domicilio" value={form.patientIdentification.address} onChange={(value) => updateIdentity("address", value)} error={formErrorFor(fieldErrors, "sections.patient_identification.address")} />
              <TextField id="intake-guardian" label="Padre o tutor" value={form.patientIdentification.guardianName} onChange={(value) => updateIdentity("guardianName", value)} error={formErrorFor(fieldErrors, "sections.patient_identification.guardian_name")} />
              <TextField id="intake-relationship" label="Parentesco" value={form.patientIdentification.relationship} onChange={(value) => updateIdentity("relationship", value)} error={formErrorFor(fieldErrors, "sections.patient_identification.relationship")} />
              <TextField id="intake-emergency" label="Contacto de emergencia" value={form.patientIdentification.emergencyContact} onChange={(value) => updateIdentity("emergencyContact", value)} error={formErrorFor(fieldErrors, "sections.patient_identification.emergency_contact")} />
              <TextField id="intake-insurance" label="Seguro o cobertura" value={form.patientIdentification.insurance} onChange={(value) => updateIdentity("insurance", value)} error={formErrorFor(fieldErrors, "sections.patient_identification.insurance")} />
            </div>
          </FormSection>

          <FormSection title="Antecedentes heredo-familiares" description="Enfermedades o antecedentes relevantes en familiares directos.">
            <TextAreaField id="intake-family-history" label="Antecedentes familiares" value={form.familyHistory.description} onChange={(value) => updateNarrative("familyHistory", value)} error={formErrorFor(fieldErrors, "sections.family_history.description")} />
          </FormSection>

          <FormSection title="Antecedentes personales no patológicos" description="Hábitos, alimentación, vivienda, escolaridad y otros antecedentes que consideres relevantes.">
            <TextAreaField id="intake-non-pathological" label="Antecedentes no patológicos" value={form.nonPathologicalHistory.description} onChange={(value) => updateNarrative("nonPathologicalHistory", value)} error={formErrorFor(fieldErrors, "sections.non_pathological_history.description")} />
          </FormSection>

          <FormSection title="Antecedentes personales patológicos" description="Enfermedades, alergias, cirugías, traumatismos, transfusiones o tratamientos previos.">
            <TextAreaField id="intake-pathological" label="Antecedentes patológicos" value={form.pathologicalHistory.description} onChange={(value) => updateNarrative("pathologicalHistory", value)} error={formErrorFor(fieldErrors, "sections.pathological_history.description")} />
          </FormSection>

          <FormSection title="Antecedentes gineco-obstétricos" description="Completa esta sección solo con la información que corresponda a tu atención.">
            <TextAreaField id="intake-gyneco" label="Antecedentes gineco-obstétricos" value={form.gynecoObstetricHistory.description} onChange={(value) => updateNarrative("gynecoObstetricHistory", value)} error={formErrorFor(fieldErrors, "sections.gyneco_obstetric_history.description")} />
          </FormSection>

          <FormSection title="Padecimiento actual" description="Explica el motivo de consulta y cómo ha evolucionado lo que estás sintiendo.">
            <TextField id="intake-reason" label="Motivo de consulta" value={form.presentIllness.reason} onChange={(value) => updatePresentIllness("reason", value)} error={formErrorFor(fieldErrors, "sections.present_illness.reason")} />
            <TextAreaField id="intake-illness" label="Enfermedad actual" value={form.presentIllness.illnessNarrative} onChange={(value) => updatePresentIllness("illnessNarrative", value)} error={formErrorFor(fieldErrors, "sections.present_illness.illness_narrative")} hint="Incluye inicio, evolución, intensidad y factores que lo mejoran o empeoran, si los conoces." />
          </FormSection>

          <FormSection title="Interrogatorio por aparatos y sistemas" description="Describe síntomas o cambios relevantes por sistemas. No hace falta completar aquello que no conozcas.">
            <TextAreaField id="intake-systems" label="Revisión por sistemas" value={form.systemsReview.description} onChange={(value) => updateNarrative("systemsReview", value)} error={formErrorFor(fieldErrors, "sections.systems_review.description")} hint="Puedes organizar la respuesta por cardiovascular, respiratorio, gastrointestinal, genitourinario, endocrino, nervioso, musculoesquelético y piel." />
          </FormSection>

          <FormSection title="Signos vitales y medidas autorreportadas" description="Opcional: registra valores medidos por ti. El equipo clínico debe verificarlos antes de usarlos para decisiones de atención.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <TextField id="intake-systolic" label="Presión sistólica (mmHg)" type="number" inputMode="numeric" min="60" max="250" value={form.vitalSigns.bloodPressureSystolic} onChange={(value) => updateVital("bloodPressureSystolic", value)} error={formErrorFor(fieldErrors, "sections.vital_signs.blood_pressure_systolic")} />
              <TextField id="intake-diastolic" label="Presión diastólica (mmHg)" type="number" inputMode="numeric" min="30" max="160" value={form.vitalSigns.bloodPressureDiastolic} onChange={(value) => updateVital("bloodPressureDiastolic", value)} error={formErrorFor(fieldErrors, "sections.vital_signs.blood_pressure_diastolic")} />
              <TextField id="intake-temperature" label="Temperatura (°C)" type="number" inputMode="decimal" min="30" max="45" step="0.1" value={form.vitalSigns.temperatureC} onChange={(value) => updateVital("temperatureC", value)} error={formErrorFor(fieldErrors, "sections.vital_signs.temperature_c")} />
              <TextField id="intake-heart-rate" label="Frecuencia cardíaca (lpm)" type="number" inputMode="numeric" min="30" max="220" value={form.vitalSigns.heartRate} onChange={(value) => updateVital("heartRate", value)} error={formErrorFor(fieldErrors, "sections.vital_signs.heart_rate")} />
              <TextField id="intake-respiratory-rate" label="Frecuencia respiratoria (rpm)" type="number" inputMode="numeric" min="5" max="60" value={form.vitalSigns.respiratoryRate} onChange={(value) => updateVital("respiratoryRate", value)} error={formErrorFor(fieldErrors, "sections.vital_signs.respiratory_rate")} />
              <TextField id="intake-oxygen" label="Saturación de oxígeno (%)" type="number" inputMode="numeric" min="70" max="100" value={form.vitalSigns.oxygenSaturation} onChange={(value) => updateVital("oxygenSaturation", value)} error={formErrorFor(fieldErrors, "sections.vital_signs.oxygen_saturation")} />
              <TextField id="intake-weight" label="Peso (kg)" type="number" inputMode="decimal" min="0.1" max="500" step="0.1" value={form.vitalSigns.weightKg} onChange={(value) => updateVital("weightKg", value)} error={formErrorFor(fieldErrors, "sections.vital_signs.weight_kg")} />
              <TextField id="intake-height" label="Talla (cm)" type="number" inputMode="decimal" min="30" max="250" step="0.1" value={form.vitalSigns.heightCm} onChange={(value) => updateVital("heightCm", value)} error={formErrorFor(fieldErrors, "sections.vital_signs.height_cm")} />
            </div>
            <TextAreaField id="intake-vital-notes" label="Notas de medición" value={form.vitalSigns.notes} onChange={(value) => updateVital("notes", value)} error={formErrorFor(fieldErrors, "sections.vital_signs.notes")} />
          </FormSection>

          <section className="rounded-xl border border-warning/30 bg-warning-soft p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
              <div>
                <h2 className="text-base font-black text-ink">Declaración del paciente</h2>
                <p className="mt-1 text-xs leading-relaxed text-ink-secondary">Tu información se guarda como autorreporte. La aceptación se registra con fecha y hora en el servidor y no convierte este formulario en una historia clínica firmada.</p>
              </div>
            </div>
            <label className="mt-4 flex items-start gap-3 text-sm font-bold leading-relaxed text-ink" htmlFor="intake-declaration">
              <input id="intake-declaration" className="mt-1 size-5 shrink-0 accent-accent" type="checkbox" checked={declarationAccepted} onChange={(event) => { markChanged(); setDeclarationAccepted(event.target.checked); }} disabled={saving || Boolean(draft?.declarationAcceptedAt)} required aria-describedby="intake-declaration-help" />
              <span>Declaro que la información fue proporcionada por mí y entiendo que debe ser revisada y verificada por personal clínico antes de utilizarse en mi atención.</span>
            </label>
            <p id="intake-declaration-help" className="mt-2 pl-8 text-xs text-muted">La declaración es obligatoria para guardar y exportar el PDF.</p>
          </section>

          {error ? <p className="rounded-lg bg-danger-soft p-3 text-sm font-bold text-danger" id="intake-form-error" role="alert">{error}</p> : null}
          {message ? <p className="rounded-lg bg-success-soft p-3 text-sm font-bold text-success" id="intake-form-message" role="status">{message}</p> : null}

          <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-bold text-muted">{savedLabel}{dirty ? " · Tienes cambios sin guardar." : ""}</p>
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-xs font-extrabold text-paper transition hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={saving || exporting}>{saving ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}{saving ? "Guardando…" : "Guardar formulario"}</button>
          </div>
        </form>

        <aside className="grid content-start gap-4" aria-label="Alcance y seguridad del formulario">
          <section className="rounded-xl border border-accent/25 bg-accent-soft p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-black text-ink">Tu información queda aislada</h2>
                <p className="mt-2 text-xs leading-relaxed text-ink-secondary">Solo se puede leer y guardar el borrador asociado a la cuenta autenticada y a la clínica actual.</p>
              </div>
            </div>
          </section>
          <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-2"><FileText className="size-4 text-accent" aria-hidden="true" /><h2 className="text-sm font-black text-ink">Se guardará</h2></div>
            <ul className="mt-3 grid gap-2 text-xs leading-relaxed text-ink-secondary">
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />Identificación y antecedentes que escribas.</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />Motivo, padecimiento actual y revisión por sistemas.</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />Mediciones opcionales marcadas como autorreportadas.</li>
            </ul>
          </section>
          <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-2"><AlertTriangle className="size-4 text-warning" aria-hidden="true" /><h2 className="text-sm font-black text-ink">No se guarda aquí</h2></div>
            <p className="mt-3 text-xs leading-relaxed text-ink-secondary">Exploración física, resultados de laboratorio o imagen, diagnósticos, tratamientos, pronóstico e identificación del clínico quedan fuera del formulario del paciente.</p>
          </section>
          <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <h2 className="text-sm font-black text-ink">Estado del documento</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted">{draft?.declarationAcceptedAt ? "Declaración registrada. El PDF se puede exportar después de guardar todos los cambios." : "Aún no hay una declaración registrada."}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

"use client";

import { FileText, Save, X } from "lucide-react";
import { useState } from "react";
import { DoctorCard } from "@/features/doctors/ui/doctor-primitives";
import type { DoctorConsultationStatus } from "@/features/doctors/api/doctor-clinical";
import { Spinner } from "@/shared/ui/spinner";
import { CLINICAL_SECTIONS, emptyClinicalValues, type ClinicalInput } from "@/features/doctors/ui/clinical-sections";

export type ConsultationFormValues = {
  chiefComplaint: string;
  objective: string;
  status: DoctorConsultationStatus;
  sections: Record<string, Record<string, string>>;
};

type ConsultationFormProps = {
  mode: "create" | "edit";
  patientLabel: string;
  pending: boolean;
  serverError: string | null;
  initialValues: Partial<ConsultationFormValues>;
  onSubmit: (values: ConsultationFormValues) => Promise<void> | void;
  onCancel: () => void;
};

function inputId(sectionKey: string, inputKey: string): string {
  return `clinical-${sectionKey}-${inputKey}`;
}

function SectionInput({
  sectionKey,
  input,
  value,
  error,
  onChange,
}: Readonly<{ sectionKey: string; input: ClinicalInput; value: string; error?: string; onChange: (value: string) => void }>) {
  const id = inputId(sectionKey, input.key);
  const helpId = `${id}-help`;
  const invalid = Boolean(error);
  const baseClassName =
    "h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none placeholder:text-placeholder focus:border-focus focus:ring-2 focus:ring-focus/20 disabled:opacity-60";
  const textareaClassName =
    "min-h-20 w-full rounded-lg border border-line bg-surface-input px-2.5 py-2 text-xs text-ink outline-none placeholder:text-placeholder focus:border-focus focus:ring-2 focus:ring-focus/20 disabled:opacity-60";
  const errorClassName = "border-danger";

  return (
    <label className="grid gap-1 text-[0.58rem] font-bold text-ink-secondary">
      {input.label}
      {input.type === "textarea" ? (
        <textarea
          id={id}
          className={`${textareaClassName} ${invalid ? errorClassName : ""}`}
          rows={2}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={invalid ? helpId : undefined}
          aria-invalid={invalid ? "true" : undefined}
        />
      ) : input.type === "select" ? (
        <select
          id={id}
          className={`${baseClassName} ${invalid ? errorClassName : ""}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={invalid ? helpId : undefined}
          aria-invalid={invalid ? "true" : undefined}
        >
          <option value="">Selecciona…</option>
          {(input.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={input.type}
          className={`${baseClassName} ${invalid ? errorClassName : ""}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={invalid ? helpId : undefined}
          aria-invalid={invalid ? "true" : undefined}
        />
      )}
      {invalid ? (
        <span id={helpId} className="text-[0.55rem] font-bold text-danger">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function ConsultationForm({
  mode,
  patientLabel,
  pending,
  serverError,
  initialValues,
  onSubmit,
  onCancel,
}: ConsultationFormProps) {
  const [chiefComplaint, setChiefComplaint] = useState(initialValues.chiefComplaint ?? "");
  const [objective, setObjective] = useState(initialValues.objective ?? "");
  const [status, setStatus] = useState<DoctorConsultationStatus>(initialValues.status ?? "in_progress");
  const [sections, setSections] = useState<Record<string, Record<string, string>>>(
    initialValues.sections ?? emptyClinicalValues(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const canSign = mode === "edit" && initialValues.status === "completed";

  function setSectionValue(sectionKey: string, inputKey: string, value: string): void {
    setSections((current) => ({
      ...current,
      [sectionKey]: { ...(current[sectionKey] ?? {}), [inputKey]: value },
    }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (chiefComplaint.trim().length < 5) {
      nextErrors.chiefComplaint = "El motivo de consulta es obligatorio.";
    }
    if (objective.trim() === "") {
      nextErrors.objective = "El objetivo de la consulta es obligatorio.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!validate()) return;
    void onSubmit({ chiefComplaint: chiefComplaint.trim(), objective: objective.trim(), status, sections });
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={pending}>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <DoctorCard className="min-w-0 p-4">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent" aria-hidden="true">
              <FileText className="size-4" />
            </span>
            <div>
              <h2 className="text-[0.82rem] font-extrabold">Historia clínica estructurada</h2>
              <p className="text-[0.56rem] font-bold text-ink-secondary">{patientLabel}</p>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="grid gap-1 text-[0.58rem] font-bold text-ink-secondary">
              Motivo de consulta
              <input
                className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none placeholder:text-placeholder focus:border-focus focus:ring-2 focus:ring-focus/20 disabled:opacity-60"
                value={chiefComplaint}
                onChange={(event) => setChiefComplaint(event.target.value)}
                placeholder="Motivo por el que acude"
                aria-describedby={errors.chiefComplaint ? "chief-complaint-err" : undefined}
                aria-invalid={errors.chiefComplaint ? "true" : undefined}
              />
              {errors.chiefComplaint ? (
                <span id="chief-complaint-err" className="text-[0.55rem] font-bold text-danger" role="alert">
                  {errors.chiefComplaint}
                </span>
              ) : null}
            </label>
            <label className="grid gap-1 text-[0.58rem] font-bold text-ink-secondary">
              Objetivo
              <input
                className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none placeholder:text-placeholder focus:border-focus focus:ring-2 focus:ring-focus/20 disabled:opacity-60"
                value={objective}
                onChange={(event) => setObjective(event.target.value)}
                placeholder="Objetivo de la consulta"
                aria-describedby={errors.objective ? "objective-err" : undefined}
                aria-invalid={errors.objective ? "true" : undefined}
              />
              {errors.objective ? (
                <span id="objective-err" className="text-[0.55rem] font-bold text-danger" role="alert">
                  {errors.objective}
                </span>
              ) : null}
            </label>
          </div>

          <div className="mt-3 grid gap-3">
            {CLINICAL_SECTIONS.map((section) => (
              <fieldset key={section.key} className="rounded-lg border border-line p-3">
                <legend className="px-1 text-[0.68rem] font-extrabold text-ink">{section.title}</legend>
                <p className="mb-2 text-[0.55rem] font-bold text-ink-secondary">{section.description}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {section.inputs.map((input) => (
                    <SectionInput
                      key={input.key}
                      sectionKey={section.key}
                      input={input}
                      value={sections[section.key]?.[input.key] ?? ""}
                      onChange={(value) => setSectionValue(section.key, input.key, value)}
                    />
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </DoctorCard>

        <aside className="grid gap-4">
          <DoctorCard className="p-4">
            <h2 className="text-[0.82rem] font-extrabold">Registro clínico</h2>
            <label className="mt-3 grid gap-1 text-[0.58rem] font-bold text-ink-secondary">
              Estado
              <select
                className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20"
                value={status}
                onChange={(event) => setStatus(event.target.value as DoctorConsultationStatus)}
                aria-label="Estado de la consulta"
              >
                <option value="in_progress">En curso</option>
                 <option value="completed">Completada</option>
                 {canSign || status === "signed" ? <option value="signed">Firmar consulta</option> : null}
                 <option value="draft">Borrador</option>
              </select>
            </label>
            <p className="mt-3 text-[0.56rem] font-bold leading-4 text-ink-secondary">
              Los valores de los 15 apartados se guardan como historia clínica vinculada a esta consulta. Si no escribes
              un objetivo, se conserva el de la admisión clínica del paciente.
            </p>
          </DoctorCard>

          {serverError || errors.chiefComplaint || errors.objective ? (
            <DoctorCard className="border-danger/30 p-4">
              <p className="text-xs font-bold text-danger" role="alert" aria-live="polite">
                {serverError ?? (errors.chiefComplaint || errors.objective)}
              </p>
            </DoctorCard>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[0.65rem] font-extrabold text-white hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus disabled:opacity-60"
              type="submit"
              disabled={pending}
            >
              {pending ? <Spinner className="size-3.5" /> : <Save className="size-3.5" aria-hidden="true" />}
              {mode === "create" ? "Crear consulta" : "Guardar cambios"}
            </button>
            <button
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-line px-4 text-[0.65rem] font-extrabold hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus"
              type="button"
              onClick={onCancel}
              disabled={pending}
            >
              <X className="size-3.5" aria-hidden="true" />
              Cancelar
            </button>
          </div>
        </aside>
      </div>
    </form>
  );
}

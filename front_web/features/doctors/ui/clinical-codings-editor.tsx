"use client";

import { Plus, Tags, Trash2 } from "lucide-react";
import type { ClinicalCoding, ClinicalCodingCategory } from "@/features/doctors/api/doctor-clinical";

const CATEGORY_OPTIONS: Array<{ value: ClinicalCodingCategory; label: string }> = [
  { value: "diagnosis", label: "Diagnóstico" },
  { value: "problem", label: "Problema" },
  { value: "symptom", label: "Síntoma" },
  { value: "allergy", label: "Alergia" },
  { value: "observation", label: "Observación" },
  { value: "procedure", label: "Procedimiento" },
  { value: "medication", label: "Medicamento" },
];

const SYSTEM_OPTIONS = [
  { value: "http://snomed.info/sct", label: "SNOMED CT" },
  { value: "http://id.who.int/icd/release/11/mms", label: "ICD-11 / CIE-11" },
  { value: "urn:hipocratiq:local", label: "Catálogo local" },
];

const emptyCoding = (): ClinicalCoding => ({
  category: "diagnosis",
  system: "http://snomed.info/sct",
  code: "",
  display: "",
  status: "active",
});

type Props = Readonly<{
  value: ClinicalCoding[];
  onChange: (value: ClinicalCoding[]) => void;
  disabled?: boolean;
}>;

export function ClinicalCodingsEditor({ value, onChange, disabled = false }: Props) {
  function update(index: number, patch: Partial<ClinicalCoding>): void {
    onChange(value.map((coding, itemIndex) => (itemIndex === index ? { ...coding, ...patch } : coding)));
  }

  function remove(index: number): void {
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <fieldset className="rounded-lg border border-line p-3" disabled={disabled}>
      <legend className="px-1 text-[0.68rem] font-extrabold text-ink">Terminología clínica</legend>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex max-w-2xl items-start gap-2">
          <Tags className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
          <p className="text-[0.56rem] font-bold leading-4 text-ink-secondary">
            Registra conceptos estructurados con su sistema, código y descripción. HIPOCRATIQ conserva estos datos
            junto con la consulta y los incluye en la huella de integridad al firmar. La validación contra un
            terminology server externo se mantiene desacoplada.
          </p>
        </div>
        {!disabled ? (
          <button
            className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-accent/25 px-3 text-[0.58rem] font-extrabold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus"
            type="button"
            onClick={() => onChange([...value, emptyCoding()])}
          >
            <Plus className="size-3.5" aria-hidden="true" />Agregar concepto
          </button>
        ) : null}
      </div>

      {value.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line-strong bg-surface-subtle p-3 text-[0.58rem] font-bold text-muted">
          No hay conceptos codificados en esta consulta.
        </p>
      ) : (
        <div className="grid gap-3">
          {value.map((coding, index) => (
            <div className="grid gap-2 rounded-lg border border-line bg-surface-subtle p-3" key={coding.system + "-" + coding.code + "-" + index}>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="grid gap-1 text-[0.58rem] font-bold text-ink-secondary">
                  Categoría
                  <select
                    className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20"
                    value={coding.category}
                    onChange={(event) => update(index, { category: event.target.value as ClinicalCodingCategory })}
                  >
                    {CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label className="grid gap-1 text-[0.58rem] font-bold text-ink-secondary">
                  Sistema
                  <select
                    className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20"
                    value={SYSTEM_OPTIONS.some((option) => option.value === coding.system) ? coding.system : "urn:hipocratiq:local"}
                    onChange={(event) => update(index, { system: event.target.value })}
                  >
                    {SYSTEM_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
              </div>

              <div className="grid gap-2 sm:grid-cols-[minmax(8rem,0.55fr)_minmax(0,1fr)_auto]">
                <label className="grid gap-1 text-[0.58rem] font-bold text-ink-secondary">
                  Código
                  <input
                    className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20"
                    value={coding.code}
                    maxLength={120}
                    placeholder="Código"
                    onChange={(event) => update(index, { code: event.target.value })}
                  />
                </label>
                <label className="grid gap-1 text-[0.58rem] font-bold text-ink-secondary">
                  Descripción clínica
                  <input
                    className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20"
                    value={coding.display}
                    maxLength={255}
                    placeholder="Descripción del concepto"
                    onChange={(event) => update(index, { display: event.target.value })}
                  />
                </label>
                {!disabled ? (
                  <button
                    className="mt-auto inline-flex size-9 items-center justify-center rounded-lg border border-danger/25 text-danger hover:bg-danger-soft focus-visible:outline-3 focus-visible:outline-focus"
                    type="button"
                    aria-label="Eliminar concepto"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </fieldset>
  );
}

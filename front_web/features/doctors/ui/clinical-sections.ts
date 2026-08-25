/**
 * The 15 clinical history sections surfaced in the doctor consultation form.
 *
 * These mirror the backend `clinical_history_sections` catalog keys and the field
 * intent of the source clinical history templates (structural metadata only — no
 * patient-identifying values).
 */

export type ClinicalInputType = "text" | "textarea" | "date" | "time" | "number" | "select";

export type ClinicalInput = {
  key: string;
  label: string;
  type: ClinicalInputType;
  options?: string[];
};

export type ClinicalSection = {
  key: string;
  title: string;
  description: string;
  inputs: ClinicalInput[];
};

export const CLINICAL_SECTIONS: ClinicalSection[] = [
  {
    key: "record_metadata",
    title: "Datos de la institución y del expediente",
    description: "Unidad médica, número de expediente, fecha/hora y tipo de interrogatorio.",
    inputs: [
      { key: "unit", label: "Unidad médica", type: "text" },
      { key: "record_number", label: "No. de expediente", type: "text" },
      { key: "date", label: "Fecha de elaboración", type: "date" },
      { key: "time", label: "Hora de elaboración", type: "time" },
      { key: "interview_type", label: "Tipo de interrogatorio", type: "select", options: ["directo", "indirecto"] },
    ],
  },
  {
    key: "patient_identification",
    title: "Ficha de identificación",
    description: "Datos generales y de identificación del paciente.",
    inputs: [
      { key: "name", label: "Nombre del paciente", type: "text" },
      { key: "age", label: "Edad", type: "number" },
      { key: "gender", label: "Género", type: "select", options: ["femenino", "masculino", "otro"] },
      { key: "birth_date", label: "Fecha de nacimiento", type: "date" },
      { key: "occupation", label: "Ocupación", type: "text" },
      { key: "address", label: "Domicilio", type: "text" },
      { key: "guardian_name", label: "Nombre del padre o tutor", type: "text" },
      { key: "relationship", label: "Parentesco", type: "text" },
    ],
  },
  {
    key: "family_history",
    title: "Antecedentes heredo-familiares",
    description: "Antecedentes de enfermedad en familiares directos.",
    inputs: [{ key: "description", label: "Antecedentes familiares", type: "textarea" }],
  },
  {
    key: "non_pathological_history",
    title: "Antecedentes personales no patológicos",
    description: "Hábitos, vivienda, escolaridad, alimentación y antecedentes no patológicos.",
    inputs: [{ key: "description", label: "Antecedentes no patológicos", type: "textarea" }],
  },
  {
    key: "pathological_history",
    title: "Antecedentes personales patológicos",
    description: "Enfermedades, alergias, transfusiones, traumatismos y cirugías previas.",
    inputs: [{ key: "description", label: "Antecedentes patológicos", type: "textarea" }],
  },
  {
    key: "gyneco_obstetric_history",
    title: "Antecedentes gineco-obstétricos",
    description: "Antecedentes ginecológicos y obstétricos del paciente.",
    inputs: [{ key: "description", label: "Antecedentes gineco-obstétricos", type: "textarea" }],
  },
  {
    key: "present_illness",
    title: "Padecimiento actual",
    description: "Motivo de consulta y narrativa del padecimiento actual.",
    inputs: [
      { key: "reason", label: "Motivo de consulta", type: "text" },
      { key: "illness_narrative", label: "Enfermedad actual", type: "textarea" },
    ],
  },
  {
    key: "systems_review",
    title: "Interrogatorio por aparatos y sistemas",
    description: "Revisión por sistemas: cardiovascular, respiratorio, gastrointestinal, genitourinario, hematológico, endocrino, nervioso, musculoesquelético y piel.",
    inputs: [
      { key: "cardiovascular", label: "Cardiovascular", type: "textarea" },
      { key: "respiratory", label: "Respiratorio", type: "textarea" },
      { key: "gastrointestinal", label: "Gastrointestinal", type: "textarea" },
      { key: "genitourinary", label: "Genitourinario", type: "textarea" },
      { key: "hematologic_lymphatic", label: "Hemático y linfático", type: "textarea" },
      { key: "endocrine", label: "Endocrino", type: "textarea" },
      { key: "nervous", label: "Nervioso", type: "textarea" },
      { key: "musculoskeletal", label: "Musculoesquelético", type: "textarea" },
      { key: "skin_mucosa_appendages", label: "Piel, mucosas y anexos", type: "textarea" },
    ],
  },
  {
    key: "vital_signs",
    title: "Signos vitales",
    description: "Tensión arterial, temperatura, frecuencia cardíaca y respiratoria, peso y talla.",
    inputs: [
      { key: "blood_pressure", label: "T/A", type: "text" },
      { key: "temperature", label: "Temperatura", type: "text" },
      { key: "heart_rate", label: "F.C.", type: "text" },
      { key: "respiratory_rate", label: "F.R.", type: "text" },
      { key: "weight", label: "Peso", type: "text" },
      { key: "height", label: "Talla", type: "text" },
    ],
  },
  {
    key: "physical_examination",
    title: "Exploración física",
    description: "Exploración por regiones: hábito exterior, cabeza, cuello, tórax, abdomen, genitales, extremidades y piel.",
    inputs: [
      { key: "habitus_exterior", label: "Hábito exterior", type: "textarea" },
      { key: "head", label: "Cabeza", type: "textarea" },
      { key: "neck", label: "Cuello", type: "textarea" },
      { key: "thorax", label: "Tórax", type: "textarea" },
      { key: "abdomen", label: "Abdomen", type: "textarea" },
      { key: "genitalia", label: "Genitales", type: "textarea" },
      { key: "extremities", label: "Extremidades", type: "textarea" },
      { key: "skin", label: "Piel", type: "textarea" },
    ],
  },
  {
    key: "labs_imaging",
    title: "Resultados de laboratorio y gabinete",
    description: "Resultados previos y actuales de laboratorio, gabinete y otros estudios.",
    inputs: [{ key: "results", label: "Resultados de laboratorio y gabinete", type: "textarea" }],
  },
  {
    key: "diagnoses_problems",
    title: "Diagnóstico o problemas clínicos",
    description: "Diagnósticos o problemas clínicos identificados.",
    inputs: [{ key: "diagnoses", label: "Diagnóstico(s) o problema(s) clínico(s)", type: "textarea" }],
  },
  {
    key: "pharmacological_treatment",
    title: "Tratamiento farmacológico",
    description: "Tratamiento farmacológico e indicaciones generales.",
    inputs: [{ key: "treatment", label: "Tratamiento farmacológico", type: "textarea" }],
  },
  {
    key: "prognosis",
    title: "Pronóstico",
    description: "Pronóstico clínico del paciente.",
    inputs: [{ key: "prognosis", label: "Pronóstico", type: "textarea" }],
  },
  {
    key: "clinician_identification",
    title: "Identificación del clínico",
    description: "Identificación y firma del clínico responsable.",
    inputs: [
      { key: "clinician_name", label: "Nombre del clínico", type: "text" },
      { key: "title", label: "Título / cédula profesional", type: "text" },
      { key: "unit", label: "Unidad de adscripción", type: "text" },
    ],
  },
];

/** Build a blank values object keyed by section -> input. */
export function emptyClinicalValues(): Record<string, Record<string, string>> {
  return CLINICAL_SECTIONS.reduce<Record<string, Record<string, string>>>(
    (acc, section) => {
      acc[section.key] = section.inputs.reduce<Record<string, string>>((values, input) => {
        values[input.key] = "";
        return values;
      }, {});
      return acc;
    },
    {},
  );
}

export function findClinicalSection(key: string): ClinicalSection | undefined {
  return CLINICAL_SECTIONS.find((section) => section.key === key);
}

import { ApiError, getFromApi, patchToApi } from "@/shared/api/http-client";

export const CLINICIAN_ONLY_SECTION_KEYS = [
  "physical_examination",
  "labs_imaging",
  "diagnoses_problems",
  "pharmacological_treatment",
  "prognosis",
  "clinician_identification",
] as const;

export type ClinicianOnlySectionKey = typeof CLINICIAN_ONLY_SECTION_KEYS[number];

export type PatientIdentificationDraft = {
  name: string | null;
  age: number | null;
  documentType: string | null;
  documentNumber: string | null;
  birthDate: string | null;
  gender: "Femenino" | "Masculino" | "Otro" | null;
  occupation: string | null;
  address: string | null;
  guardianName: string | null;
  relationship: string | null;
  phoneNumber: string | null;
  email: string | null;
  emergencyContact: string | null;
  insurance: string | null;
};

export type PatientNarrativeDraft = {
  description: string | null;
};

export type PatientPresentIllnessDraft = {
  reason: string | null;
  illnessNarrative: string | null;
};

export type PatientReportedVitalSignsDraft = {
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  temperatureC: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  oxygenSaturation: number | null;
  weightKg: number | null;
  heightCm: number | null;
  notes: string | null;
};

export type PatientIntakeDraftSections = {
  patientIdentification: PatientIdentificationDraft;
  familyHistory: PatientNarrativeDraft;
  nonPathologicalHistory: PatientNarrativeDraft;
  pathologicalHistory: PatientNarrativeDraft;
  gynecoObstetricHistory: PatientNarrativeDraft;
  presentIllness: PatientPresentIllnessDraft;
  systemsReview: PatientNarrativeDraft;
  vitalSigns: PatientReportedVitalSignsDraft;
};

export type PatientIntakeDraft = {
  id: number | null;
  status: "draft";
  sections: PatientIntakeDraftSections;
  declarationAcceptedAt: string | null;
  updatedAt: string | null;
  clinic: { id: number; name: string } | null;
};

export type PatientIntakeDraftPayload = {
  sections: PatientIntakeDraftSections;
  declarationAccepted: true;
};

type ApiPatientIdentificationDraft = {
  name: string | null;
  age: number | null;
  document_type: string | null;
  document_number: string | null;
  birth_date: string | null;
  gender: PatientIdentificationDraft["gender"];
  occupation: string | null;
  address: string | null;
  guardian_name: string | null;
  relationship: string | null;
  phone_number: string | null;
  email: string | null;
  emergency_contact: string | null;
  insurance: string | null;
};

type ApiPatientNarrativeDraft = {
  description: string | null;
};

type ApiPatientPresentIllnessDraft = {
  reason: string | null;
  illness_narrative: string | null;
};

type ApiPatientReportedVitalSignsDraft = {
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  temperature_c: number | null;
  heart_rate: number | null;
  respiratory_rate: number | null;
  oxygen_saturation: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  notes: string | null;
};

type ApiPatientIntakeDraftSections = {
  patient_identification: ApiPatientIdentificationDraft;
  family_history: ApiPatientNarrativeDraft;
  non_pathological_history: ApiPatientNarrativeDraft;
  pathological_history: ApiPatientNarrativeDraft;
  gyneco_obstetric_history: ApiPatientNarrativeDraft;
  present_illness: ApiPatientPresentIllnessDraft;
  systems_review: ApiPatientNarrativeDraft;
  vital_signs: ApiPatientReportedVitalSignsDraft;
};

type ApiPatientIntakeDraft = {
  id: number | null;
  status: "draft";
  sections: ApiPatientIntakeDraftSections;
  declaration_accepted_at: string | null;
  updated_at: string | null;
  clinic: { id: number; name: string } | null;
};

function mapSections(sections: ApiPatientIntakeDraftSections): PatientIntakeDraftSections {
  return {
    patientIdentification: {
      name: sections.patient_identification.name,
      age: sections.patient_identification.age,
      documentType: sections.patient_identification.document_type,
      documentNumber: sections.patient_identification.document_number,
      birthDate: sections.patient_identification.birth_date,
      gender: sections.patient_identification.gender,
      occupation: sections.patient_identification.occupation,
      address: sections.patient_identification.address,
      guardianName: sections.patient_identification.guardian_name,
      relationship: sections.patient_identification.relationship,
      phoneNumber: sections.patient_identification.phone_number,
      email: sections.patient_identification.email,
      emergencyContact: sections.patient_identification.emergency_contact,
      insurance: sections.patient_identification.insurance,
    },
    familyHistory: sections.family_history,
    nonPathologicalHistory: sections.non_pathological_history,
    pathologicalHistory: sections.pathological_history,
    gynecoObstetricHistory: sections.gyneco_obstetric_history,
    presentIllness: {
      reason: sections.present_illness.reason,
      illnessNarrative: sections.present_illness.illness_narrative,
    },
    systemsReview: sections.systems_review,
    vitalSigns: {
      bloodPressureSystolic: sections.vital_signs.blood_pressure_systolic,
      bloodPressureDiastolic: sections.vital_signs.blood_pressure_diastolic,
      temperatureC: sections.vital_signs.temperature_c,
      heartRate: sections.vital_signs.heart_rate,
      respiratoryRate: sections.vital_signs.respiratory_rate,
      oxygenSaturation: sections.vital_signs.oxygen_saturation,
      weightKg: sections.vital_signs.weight_kg,
      heightCm: sections.vital_signs.height_cm,
      notes: sections.vital_signs.notes,
    },
  };
}

function mapDraft(draft: ApiPatientIntakeDraft): PatientIntakeDraft {
  if (draft.status !== "draft") {
    throw new ApiError("El servidor devolvió un estado de formulario inesperado.", 502);
  }

  return {
    id: draft.id,
    status: "draft",
    sections: mapSections(draft.sections),
    declarationAcceptedAt: draft.declaration_accepted_at,
    updatedAt: draft.updated_at,
    clinic: draft.clinic,
  };
}

function toApiSections(sections: PatientIntakeDraftSections): ApiPatientIntakeDraftSections {
  return {
    patient_identification: {
      name: sections.patientIdentification.name,
      age: sections.patientIdentification.age,
      document_type: sections.patientIdentification.documentType,
      document_number: sections.patientIdentification.documentNumber,
      birth_date: sections.patientIdentification.birthDate,
      gender: sections.patientIdentification.gender,
      occupation: sections.patientIdentification.occupation,
      address: sections.patientIdentification.address,
      guardian_name: sections.patientIdentification.guardianName,
      relationship: sections.patientIdentification.relationship,
      phone_number: sections.patientIdentification.phoneNumber,
      email: sections.patientIdentification.email,
      emergency_contact: sections.patientIdentification.emergencyContact,
      insurance: sections.patientIdentification.insurance,
    },
    family_history: sections.familyHistory,
    non_pathological_history: sections.nonPathologicalHistory,
    pathological_history: sections.pathologicalHistory,
    gyneco_obstetric_history: sections.gynecoObstetricHistory,
    present_illness: {
      reason: sections.presentIllness.reason,
      illness_narrative: sections.presentIllness.illnessNarrative,
    },
    systems_review: sections.systemsReview,
    vital_signs: {
      blood_pressure_systolic: sections.vitalSigns.bloodPressureSystolic,
      blood_pressure_diastolic: sections.vitalSigns.bloodPressureDiastolic,
      temperature_c: sections.vitalSigns.temperatureC,
      heart_rate: sections.vitalSigns.heartRate,
      respiratory_rate: sections.vitalSigns.respiratoryRate,
      oxygen_saturation: sections.vitalSigns.oxygenSaturation,
      weight_kg: sections.vitalSigns.weightKg,
      height_cm: sections.vitalSigns.heightCm,
      notes: sections.vitalSigns.notes,
    },
  };
}

export async function getPatientIntakeDraft(signal?: AbortSignal): Promise<PatientIntakeDraft> {
  const response = await getFromApi<{ data: ApiPatientIntakeDraft }>("/api/v1/auth/patient/intake-draft", { signal });

  if (!response.data?.sections) {
    throw new ApiError("El servidor devolvió un formulario de ingreso incompleto.", 502);
  }

  return mapDraft(response.data);
}

export async function savePatientIntakeDraft(payload: PatientIntakeDraftPayload): Promise<PatientIntakeDraft> {
  const response = await patchToApi<{ data: ApiPatientIntakeDraft }>("/api/v1/auth/patient/intake-draft", {
    declaration_accepted: payload.declarationAccepted,
    sections: toApiSections(payload.sections),
  });

  if (!response.data?.sections) {
    throw new ApiError("El servidor no devolvió el formulario guardado.", 502);
  }

  return mapDraft(response.data);
}

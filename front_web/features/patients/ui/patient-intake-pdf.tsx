"use client";

import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { PatientIntakeDraft, PatientNarrativeDraft } from "@/features/patients/api/patient-intake";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#f7f9fc",
    color: "#101b33",
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingBottom: 42,
    paddingHorizontal: 34,
    paddingTop: 34,
  },
  header: {
    borderBottomColor: "#dce4f0",
    borderBottomWidth: 1,
    marginBottom: 16,
    paddingBottom: 12,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 7,
  },
  logo: {
    height: 32,
    objectFit: "contain",
    width: 32,
  },
  brandName: {
    color: "#101b33",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 1.2,
  },
  eyebrow: {
    color: "#0862dd",
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1.2,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  title: {
    color: "#101b33",
    fontSize: 19,
    fontWeight: 700,
    marginBottom: 5,
  },
  subtitle: {
    color: "#496584",
    fontSize: 9,
    lineHeight: 1.4,
  },
  notice: {
    backgroundColor: "#fff1e7",
    borderColor: "#f0b98f",
    borderRadius: 5,
    borderWidth: 1,
    color: "#8f3e18",
    fontSize: 8,
    fontWeight: 700,
    lineHeight: 1.45,
    marginBottom: 14,
    padding: 9,
  },
  metadata: {
    backgroundColor: "#e9f2ff",
    borderColor: "#c9ddfb",
    borderRadius: 5,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
    padding: 9,
  },
  metadataItem: {
    width: "31%",
  },
  metadataLabel: {
    color: "#496584",
    fontSize: 7,
    fontWeight: 700,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  metadataValue: {
    color: "#101b33",
    fontSize: 8,
  },
  section: {
    borderColor: "#dce4f0",
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  sectionTitle: {
    borderBottomColor: "#e5ebf4",
    borderBottomWidth: 1,
    color: "#0862dd",
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 8,
    paddingBottom: 5,
  },
  fieldGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  field: {
    marginBottom: 3,
    width: "31%",
  },
  fieldWide: {
    marginBottom: 3,
    width: "64%",
  },
  fieldFull: {
    marginBottom: 3,
    width: "100%",
  },
  fieldLabel: {
    color: "#496584",
    fontSize: 7,
    fontWeight: 700,
    marginBottom: 2,
  },
  fieldValue: {
    color: "#101b33",
    fontSize: 8.5,
    lineHeight: 1.35,
  },
  unavailable: {
    backgroundColor: "#f1f5fa",
    color: "#6e7f9d",
    fontSize: 8,
    lineHeight: 1.4,
    padding: 7,
  },
  footer: {
    bottom: 18,
    color: "#6e7f9d",
    fontSize: 7,
    left: 34,
    position: "absolute",
    right: 34,
    textAlign: "center",
  },
});

const EMPTY_VALUE = "No informado por el paciente";
const CLINICIAN_UNAVAILABLE = "No disponible. Se completará y verificará por personal clínico.";

function valueOrEmpty(value: string | number | null | undefined): string {
  return value === null || value === undefined || value === "" ? EMPTY_VALUE : String(value);
}

function formatDate(value: string | null): string {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE;

  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function Field({ label, value, width = "field" }: { label: string; value: string | number | null | undefined; width?: "field" | "fieldWide" | "fieldFull" }) {
  return (
    <View style={styles[width]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{valueOrEmpty(value)}</Text>
    </View>
  );
}

function NarrativeSection({ title, content }: { title: string; content: PatientNarrativeDraft }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.fieldValue}>{valueOrEmpty(content.description)}</Text>
    </View>
  );
}

function ClinicianOnlySection({ title }: { title: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.unavailable}>{CLINICIAN_UNAVAILABLE}</Text>
    </View>
  );
}

export function PatientIntakePdf({ draft }: { draft: PatientIntakeDraft }) {
  const { patientIdentification, presentIllness, vitalSigns } = draft.sections;

  return (
    <Document
      author="HipocratiQ"
      subject="Formulario virtual de ingreso clínico aportado por el paciente"
      title="Historia clínica — formulario de ingreso del paciente"
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Image src="/logo_hipogratiq_1.png" style={styles.logo} />
            <View>
              <Text style={styles.brandName}>HIPOCRATIQ</Text>
              <Text style={styles.eyebrow}>Expediente de atención</Text>
            </View>
          </View>
          <Text style={styles.title}>Historia clínica</Text>
          <Text style={styles.subtitle}>Formulario virtual de ingreso clínico aportado por el paciente.</Text>
        </View>

        <Text style={styles.notice}>
          DOCUMENTO APORTADO POR EL PACIENTE · PENDIENTE DE VERIFICACIÓN CLÍNICA. Este PDF no es un diagnóstico, una indicación terapéutica ni un registro clínico firmado.
        </Text>

        <View style={styles.metadata}>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Estado</Text>
            <Text style={styles.metadataValue}>Borrador del paciente</Text>
          </View>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Declaración aceptada</Text>
            <Text style={styles.metadataValue}>{formatDate(draft.declarationAcceptedAt)}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Clínica</Text>
            <Text style={styles.metadataValue}>{valueOrEmpty(draft.clinic?.name)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del expediente</Text>
          <View style={styles.fieldGrid}>
            <Field label="Tipo de interrogatorio" value="Directo · formulario virtual" width="fieldWide" />
            <Field label="Fecha de exportación" value={formatDate(new Date().toISOString())} />
            <Field label="Número de expediente" value="Pendiente de asignación clínica" width="fieldWide" />
            <Field label="Origen" value="Autorreporte del paciente" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ficha de identificación</Text>
          <View style={styles.fieldGrid}>
            <Field label="Nombre completo" value={patientIdentification.name} width="fieldWide" />
            <Field label="Edad" value={patientIdentification.age === null ? null : `${patientIdentification.age} años`} />
            <Field label="Tipo de documento" value={patientIdentification.documentType} />
            <Field label="Número de documento" value={patientIdentification.documentNumber} />
            <Field label="Fecha de nacimiento" value={patientIdentification.birthDate} />
            <Field label="Género" value={patientIdentification.gender} />
            <Field label="Ocupación" value={patientIdentification.occupation} />
            <Field label="Teléfono" value={patientIdentification.phoneNumber} />
            <Field label="Correo electrónico" value={patientIdentification.email} width="fieldWide" />
            <Field label="Domicilio" value={patientIdentification.address} width="fieldFull" />
            <Field label="Padre o tutor" value={patientIdentification.guardianName} />
            <Field label="Parentesco" value={patientIdentification.relationship} />
            <Field label="Contacto de emergencia" value={patientIdentification.emergencyContact} />
            <Field label="Seguro o cobertura" value={patientIdentification.insurance} width="fieldWide" />
          </View>
        </View>

        <NarrativeSection title="Antecedentes heredo-familiares" content={draft.sections.familyHistory} />
        <NarrativeSection title="Antecedentes personales no patológicos" content={draft.sections.nonPathologicalHistory} />
        <NarrativeSection title="Antecedentes personales patológicos" content={draft.sections.pathologicalHistory} />
        <NarrativeSection title="Antecedentes gineco-obstétricos" content={draft.sections.gynecoObstetricHistory} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Padecimiento actual</Text>
          <View style={styles.fieldGrid}>
            <Field label="Motivo de consulta" value={presentIllness.reason} width="fieldFull" />
            <Field label="Enfermedad actual" value={presentIllness.illnessNarrative} width="fieldFull" />
          </View>
        </View>

        <NarrativeSection title="Interrogatorio por aparatos y sistemas" content={draft.sections.systemsReview} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Signos vitales · autorreporte del paciente</Text>
          <View style={styles.fieldGrid}>
            <Field label="Tensión arterial sistólica" value={vitalSigns.bloodPressureSystolic === null ? null : `${vitalSigns.bloodPressureSystolic} mmHg`} />
            <Field label="Tensión arterial diastólica" value={vitalSigns.bloodPressureDiastolic === null ? null : `${vitalSigns.bloodPressureDiastolic} mmHg`} />
            <Field label="Temperatura" value={vitalSigns.temperatureC === null ? null : `${vitalSigns.temperatureC} °C`} />
            <Field label="Frecuencia cardíaca" value={vitalSigns.heartRate === null ? null : `${vitalSigns.heartRate} lpm`} />
            <Field label="Frecuencia respiratoria" value={vitalSigns.respiratoryRate === null ? null : `${vitalSigns.respiratoryRate} rpm`} />
            <Field label="Saturación de oxígeno" value={vitalSigns.oxygenSaturation === null ? null : `${vitalSigns.oxygenSaturation} %`} />
            <Field label="Peso" value={vitalSigns.weightKg === null ? null : `${vitalSigns.weightKg} kg`} />
            <Field label="Talla" value={vitalSigns.heightCm === null ? null : `${vitalSigns.heightCm} cm`} />
            <Field label="Notas de medición" value={vitalSigns.notes} width="fieldFull" />
          </View>
        </View>

        <ClinicianOnlySection title="Exploración física" />
        <ClinicianOnlySection title="Resultados de laboratorio y gabinete" />
        <ClinicianOnlySection title="Diagnóstico o problemas clínicos" />
        <ClinicianOnlySection title="Tratamiento farmacológico" />
        <ClinicianOnlySection title="Pronóstico" />
        <ClinicianOnlySection title="Identificación del clínico" />

        <Text fixed style={styles.footer}>HipocratiQ · Documento aportado por el paciente · Pendiente de verificación clínica</Text>
      </Page>
    </Document>
  );
}

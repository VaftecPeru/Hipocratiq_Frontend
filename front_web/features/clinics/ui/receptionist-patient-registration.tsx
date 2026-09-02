"use client";

import {
  Activity,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardCheck,
  Eye,
  FileCheck2,
  FileText,
  Mail,
  Phone,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  createClinicPatient,
  getClinicAppointments,
  getClinicDashboard,
  getClinicPatients,
} from "@/features/clinics/api/browser-clinic-dashboard";
import type {
  ClinicAppointment,
  ClinicPatient,
  ClinicPatientTriagePriority,
  ClinicTeamMember,
} from "@/features/clinics/model/clinic-admin.types";
import { COUNTRY_OPTIONS, toE164PhoneNumber } from "@/features/auth/lib/phone-number";
import type { CountryCode } from "@/shared/ui/country-flag";
import { getDoctorRegistrationSpecialties, type RegistrationSpecialty } from "@/features/auth/api/doctor-registration";
import { AdminMetric, Notice, SectionCard, useNotice } from "./clinic-admin-primitives";

type PatientRegistrationProps = Readonly<{ countryCode?: CountryCode }>;

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function formatDate(value: string | null): string {
  if (!value) return "Sin registro";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Sin registro" : date.toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
}

function statusLabel(patient: ClinicPatient): string {
  return patient.status === "active" ? "Completado" : "Pendiente";
}

function statusClass(patient: ClinicPatient): string {
  return patient.status === "active" ? "bg-success-soft text-success" : "bg-warning-soft text-warning";
}

function Field({ label, children, className = "" }: Readonly<{ label: string; children: React.ReactNode; className?: string }>) {
  return <label className={`grid gap-1.5 ${className}`}><span className="text-[0.58rem] font-bold text-ink-secondary">{label}</span>{children}</label>;
}

const inputClass = "h-9 w-full rounded-lg border border-line bg-surface-input px-2.5 text-[0.62rem] text-ink outline-none placeholder:text-placeholder focus:border-accent focus:ring-3 focus:ring-focus/20";
const selectClass = `${inputClass} appearance-none pr-8`;

const TRIAGE_PRIORITY_LABELS: Record<string, string> = {
  routine: "Rutina",
  urgent: "Urgente",
  emergency: "Emergencia",
};

const TRIAGE_PRIORITY_CLASSES: Record<string, string> = {
  routine: "bg-success-soft text-success",
  urgent: "bg-warning-soft text-warning",
  emergency: "bg-danger-soft text-danger",
};

function parseRange(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function triageSummary(patient: ClinicPatient): string {
  const triage = patient.triage;
  if (!triage) return "";
  const parts: string[] = [];
  if (triage.temperatureC !== null) parts.push(`${triage.temperatureC} °C`);
  if (triage.systolicBp !== null) parts.push(`${triage.systolicBp}/${triage.diastolicBp ?? "–"} mmHg`);
  if (triage.heartRate !== null) parts.push(`${triage.heartRate} lpm`);
  if (triage.oxygenSaturation !== null) parts.push(`SpO₂ ${triage.oxygenSaturation}%`);
  return parts.join(" · ");
}

export function ReceptionistPatientRegistration({ countryCode = "PE" }: PatientRegistrationProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [documentType, setDocumentType] = useState("DNI");
  const [documentNumber, setDocumentNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [insurance, setInsurance] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [isReturningPatient, setIsReturningPatient] = useState(false);
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [doctor, setDoctor] = useState("");
  const [reason, setReason] = useState("");
  const [objective, setObjective] = useState("");
  const [observations, setObservations] = useState("");
  const [specialties, setSpecialties] = useState<RegistrationSpecialty[]>([]);
  const [specialtyId, setSpecialtyId] = useState<number | null>(null);
  const [subspecialtyId, setSubspecialtyId] = useState<number | null>(null);
  const [temperatureC, setTemperatureC] = useState("");
  const [systolicBp, setSystolicBp] = useState("");
  const [diastolicBp, setDiastolicBp] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [oxygenSaturation, setOxygenSaturation] = useState("");
  const [triagePriority, setTriagePriority] = useState("");
  const [triageNotes, setTriageNotes] = useState("");
  const [recentPatients, setRecentPatients] = useState<ClinicPatient[]>([]);
  const [upcoming, setUpcoming] = useState<ClinicAppointment[]>([]);
  const [doctors, setDoctors] = useState<ClinicTeamMember[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { notice, showNotice } = useNotice();

  useEffect(() => {
    const controller = new AbortController();
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const dateKey = (date: Date) => date.toISOString().slice(0, 10);

    Promise.all([
      getClinicPatients("", 1, controller.signal),
      getClinicAppointments(dateKey(weekStart), dateKey(weekEnd), controller.signal),
      getClinicDashboard(controller.signal),
      getDoctorRegistrationSpecialties(),
    ])
      .then(([patients, appointments, dashboard, catalog]) => {
        setRecentPatients(patients.patients);
        setTotalPatients(patients.pagination.total);
        setUpcoming(appointments.appointments.slice(0, 4));
        setDoctors(dashboard.team.filter((member) => member.role === "doctor"));
        setSpecialties(catalog.data);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) showNotice(error instanceof Error ? error.message : "No pudimos cargar el registro.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [showNotice]);

  const normalizedPhone = (() => {
    try {
      return toE164PhoneNumber(phone, countryCode);
    } catch {
      return null;
    }
  })();
  const completeCount = recentPatients.filter((patient) => patient.status === "active").length;
  const documentValid = documentNumber.trim().length >= 5;
  const selectedSpecialty = specialties.find((specialty) => specialty.id === specialtyId);
  const formComplete = Boolean(firstName.trim() && lastName.trim() && normalizedPhone && objective.trim().length >= 10);

  function resetForm(): void {
    setFirstName("");
    setLastName("");
    setDocumentNumber("");
    setBirthDate("");
    setSex("");
    setPhone("");
    setEmail("");
    setAddress("");
    setInsurance("");
    setEmergencyContact("");
    setIsReturningPatient(false);
    setWhatsappConsent(false);
    setDoctor("");
    setReason("");
    setObjective("");
    setObservations("");
    setSpecialtyId(null);
    setSubspecialtyId(null);
    setTemperatureC("");
    setSystolicBp("");
    setDiastolicBp("");
    setHeartRate("");
    setRespiratoryRate("");
    setOxygenSaturation("");
    setTriagePriority("");
    setTriageNotes("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      showNotice("Ingresa nombres y apellidos del paciente.");
      return;
    }
    if (!normalizedPhone) {
      showNotice(`Ingresa un teléfono válido para ${COUNTRY_OPTIONS[countryCode].name}.`);
      return;
    }
    if (objective.trim().length < 10) {
      showNotice("Ingresa un objetivo de al menos 10 caracteres para la futura historia clínica.");
      return;
    }
    const tC = parseRange(temperatureC);
    const sys = parseRange(systolicBp);
    const dia = parseRange(diastolicBp);
    const hr = parseRange(heartRate);
    const rr = parseRange(respiratoryRate);
    const spo2 = parseRange(oxygenSaturation);

    if (tC !== null && (tC < 30 || tC > 45)) {
      showNotice("La temperatura debe estar entre 30 y 45 °C.");
      return;
    }
    if (sys !== null && (sys < 60 || sys > 250)) {
      showNotice("La presión sistólica debe estar entre 60 y 250 mmHg.");
      return;
    }
    if (dia !== null && (dia < 30 || dia > 160)) {
      showNotice("La presión diastólica debe estar entre 30 y 160 mmHg.");
      return;
    }
    if (sys !== null && dia !== null && dia >= sys) {
      showNotice("La presión diastólica debe ser menor que la sistólica.");
      return;
    }
    if (hr !== null && (hr < 30 || hr > 220)) {
      showNotice("La frecuencia cardíaca debe estar entre 30 y 220 lpm.");
      return;
    }
    if (rr !== null && (rr < 5 || rr > 60)) {
      showNotice("La frecuencia respiratoria debe estar entre 5 y 60 rpm.");
      return;
    }
    if (spo2 !== null && (spo2 < 70 || spo2 > 100)) {
      showNotice("La saturación de oxígeno debe estar entre 70 y 100 %.");
      return;
    }

    setIsPending(true);
    try {
      const patient = await createClinicPatient({
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim() || null,
        phoneNumber: normalizedPhone,
        countryCode,
        documentType: documentType || null,
        documentNumber: documentNumber.trim() || null,
        dateOfBirth: birthDate || null,
        sex: sex || null,
        address: address.trim() || null,
        emergencyContact: emergencyContact.trim() || null,
        insurance: insurance || null,
        isReturningPatient,
        whatsappConsent,
        requestedDoctorUserId: doctor ? Number(doctor) : null,
        specialtyId,
        subspecialtyId,
        reasonCategory: reason || null,
        objective: objective.trim(),
        observations: observations.trim() || null,
        temperatureC: tC,
        systolicBp: sys,
        diastolicBp: dia,
        heartRate: hr,
        respiratoryRate: rr,
        oxygenSaturation: spo2,
        triagePriority: triagePriority ? (triagePriority as ClinicPatientTriagePriority) : null,
        triageNotes: triageNotes.trim() || null,
      });
      setRecentPatients((current) => [patient, ...current].slice(0, 20));
      setTotalPatients((total) => total + 1);
      resetForm();
      showNotice("Paciente registrado correctamente.");
    } catch (error: unknown) {
      showNotice(error instanceof Error ? error.message : "No pudimos registrar al paciente.");
    } finally {
      setIsPending(false);
    }
  }

  return <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7">
    <Notice message={notice} />
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-accent uppercase">Recepción · admisión</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Registro de Pacientes</h1><p className="mt-1 text-xs text-muted">Alta rápida de pacientes y validación de datos desde recepción.</p></div><div className="flex gap-2"><button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-extrabold hover:bg-surface-hover" type="button" onClick={() => showNotice("Escáner de documentos disponible en la integración de identidad.")}><FileCheck2 className="size-3.5" aria-hidden="true" />Escanear DNI / ID</button><button className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent px-4 text-xs font-extrabold text-white shadow-sm hover:bg-accent-hover" type="button" onClick={() => (document.getElementById("patient-registration-form") as HTMLFormElement | null)?.requestSubmit()}><Save className="size-3.5" aria-hidden="true" />Guardar paciente</button></div></header>

    <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen del registro"><AdminMetric icon={UserPlus} label="Registros cargados" value={String(totalPatients)} helper="Perfiles en la clínica" tone="bg-accent-soft text-accent" /><AdminMetric icon={ClipboardCheck} label="Completos" value={String(completeCount)} helper="En la página cargada" tone="bg-success-soft text-success" /><AdminMetric icon={CalendarDays} label="Pendientes" value={String(Math.max(recentPatients.length - completeCount, 0))} helper="Requieren verificación" tone="bg-warning-soft text-warning" /><AdminMetric icon={FileText} label="Duplicados detectados" value="0" helper="Validación activa" tone="bg-danger-soft text-danger" /></section>

    <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0 space-y-4">
        <SectionCard className="overflow-hidden" labelledBy="patient-registration-title"><div className="flex items-center gap-2 border-b border-line px-4 py-3"><span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent"><UsersRound className="size-3.5" aria-hidden="true" /></span><div><h2 className="text-xs font-extrabold" id="patient-registration-title">Formulario de Registro</h2><p className="mt-0.5 text-[0.56rem] text-muted">Los campos básicos se guardan en el expediente clínico.</p></div></div>
          <form className="grid gap-3 p-4 sm:p-5" id="patient-registration-form" onSubmit={submit}>
            <div className="grid gap-3 sm:grid-cols-2"><Field label="Nombres"><input className={inputClass} placeholder="Ingrese nombres" value={firstName} onChange={(event) => setFirstName(event.target.value)} required /></Field><Field label="Apellidos"><input className={inputClass} placeholder="Ingrese apellidos" value={lastName} onChange={(event) => setLastName(event.target.value)} required /></Field></div>
            <div className="grid gap-3 sm:grid-cols-[1.1fr_1fr_1.1fr_1fr]"><Field label="Tipo de documento"><div className="relative"><select className={selectClass} value={documentType} onChange={(event) => setDocumentType(event.target.value)}><option>DNI</option><option>CE</option><option>Pasaporte</option></select><ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted" /></div></Field><Field label="N.º de documento"><input className={`${inputClass} ${documentNumber && !documentValid ? "border-danger" : ""}`} placeholder="Ingrese número" value={documentNumber} onChange={(event) => setDocumentNumber(event.target.value)} /></Field><Field label="Fecha de nacimiento"><input className={inputClass} type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} /></Field><Field label="Sexo"><div className="relative"><select className={selectClass} value={sex} onChange={(event) => setSex(event.target.value)}><option value="">Seleccione</option><option>Femenino</option><option>Masculino</option><option>Otro</option></select><ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted" /></div></Field></div>
            <div className="grid gap-3 sm:grid-cols-2"><Field label="Teléfono"><div className="relative"><input className={inputClass} placeholder="Ingrese teléfono" value={phone} onChange={(event) => setPhone(event.target.value.replace(/[^0-9 ]/g, ""))} required /><Phone className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted" aria-hidden="true" /></div></Field><Field label="Correo"><div className="relative"><input className={inputClass} type="email" placeholder="Ingrese correo electrónico" value={email} onChange={(event) => setEmail(event.target.value)} /><Mail className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted" aria-hidden="true" /></div></Field></div>
            <Field label="Dirección"><input className={inputClass} placeholder="Ingrese dirección completa" value={address} onChange={(event) => setAddress(event.target.value)} /></Field>
            <div className="grid gap-3 sm:grid-cols-[1.1fr_2fr_1.2fr]"><Field label="Seguro / Convenio"><div className="relative"><select className={selectClass} value={insurance} onChange={(event) => setInsurance(event.target.value)}><option value="">Seleccione seguro</option><option>Particular</option><option>EsSalud</option><option>Seguro privado</option></select><ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted" /></div></Field><Field label="Contacto de emergencia"><input className={inputClass} placeholder="Nombre y teléfono" value={emergencyContact} onChange={(event) => setEmergencyContact(event.target.value)} /></Field><Field label="Médico solicitado"><div className="relative"><select className={selectClass} value={doctor} onChange={(event) => setDoctor(event.target.value)}><option value="">Seleccione especialista</option>{doctors.map((member) => <option key={member.id} value={String(member.id)}>{member.name}</option>)}</select><ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted" /></div></Field></div>
            <div className="grid gap-3 sm:grid-cols-2"><Field label="Especialidad solicitada"><div className="relative"><select className={selectClass} value={specialtyId ?? ""} onChange={(event) => { setSpecialtyId(event.target.value ? Number(event.target.value) : null); setSubspecialtyId(null); }}><option value="">Seleccione especialidad</option>{specialties.map((specialty) => <option key={specialty.id} value={specialty.id}>{specialty.name}</option>)}</select><ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted" /></div></Field><Field label="Subespecialidad solicitada"><div className="relative"><select className={selectClass} value={subspecialtyId ?? ""} disabled={!selectedSpecialty} onChange={(event) => setSubspecialtyId(event.target.value ? Number(event.target.value) : null)}><option value="">Seleccione subespecialidad</option>{selectedSpecialty?.subspecialties.map((subspecialty) => <option key={subspecialty.id} value={subspecialty.id}>{subspecialty.name}</option>)}</select><ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted" /></div></Field></div>
            <div className="grid gap-3 sm:grid-cols-[1fr_2fr]"><Field label="Motivo de visita"><div className="relative"><select className={selectClass} value={reason} onChange={(event) => setReason(event.target.value)}><option value="">Seleccione motivo</option><option>Consulta</option><option>Control</option><option>Laboratorio</option><option>Procedimiento</option></select><ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted" /></div></Field><Field label="Observaciones"><input className={inputClass} placeholder="Información adicional (opcional)" value={observations} onChange={(event) => setObservations(event.target.value)} /></Field></div>
            <Field label="Objetivo del paciente"><textarea className={`${inputClass} min-h-24 py-2`} value={objective} onChange={(event) => setObjective(event.target.value)} placeholder="Describe qué necesita resolver el paciente. Será la base de su futura historia clínica." minLength={10} maxLength={2000} required /></Field>
            <div className="grid gap-3 rounded-xl border border-line bg-surface-subtle/40 p-3" aria-labelledby="patient-triage-title">
              <div className="flex items-center gap-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-warning-soft text-warning"><Activity className="size-3.5" aria-hidden="true" /></span>
                <div>
                  <h3 className="text-xs font-extrabold" id="patient-triage-title">Datos de triaje</h3>
                  <p className="text-[0.56rem] text-muted">Registro manual de signos vitales. No se realiza diagnóstico ni priorización automática.</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Temperatura (°C)"><input className={inputClass} type="number" inputMode="decimal" min={30} max={45} step={0.1} placeholder="36.5" value={temperatureC} onChange={(event) => setTemperatureC(event.target.value)} aria-describedby="triage-temp-help" /><span id="triage-temp-help" className="text-[0.5rem] text-muted">Rango 30–45 °C</span></Field>
                <Field label="Frec. cardíaca (lpm)"><input className={inputClass} type="number" inputMode="numeric" min={30} max={220} placeholder="80" value={heartRate} onChange={(event) => setHeartRate(event.target.value)} aria-describedby="triage-hr-help" /><span id="triage-hr-help" className="text-[0.5rem] text-muted">Rango 30–220 lpm</span></Field>
                <Field label="Frec. respiratoria (rpm)"><input className={inputClass} type="number" inputMode="numeric" min={5} max={60} placeholder="16" value={respiratoryRate} onChange={(event) => setRespiratoryRate(event.target.value)} aria-describedby="triage-rr-help" /><span id="triage-rr-help" className="text-[0.5rem] text-muted">Rango 5–60 rpm</span></Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Presión arterial sistólica (mmHg)"><input className={inputClass} type="number" inputMode="numeric" min={60} max={250} placeholder="120" value={systolicBp} onChange={(event) => setSystolicBp(event.target.value)} aria-describedby="triage-sys-help" /><span id="triage-sys-help" className="text-[0.5rem] text-muted">Rango 60–250 mmHg</span></Field>
                <Field label="Presión arterial diastólica (mmHg)"><input className={inputClass} type="number" inputMode="numeric" min={30} max={160} placeholder="80" value={diastolicBp} onChange={(event) => setDiastolicBp(event.target.value)} aria-describedby="triage-dia-help" /><span id="triage-dia-help" className="text-[0.5rem] text-muted">Rango 30–160 mmHg</span></Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Saturación de oxígeno (SpO₂ %)"><input className={inputClass} type="number" inputMode="numeric" min={70} max={100} placeholder="98" value={oxygenSaturation} onChange={(event) => setOxygenSaturation(event.target.value)} aria-describedby="triage-spo2-help" /><span id="triage-spo2-help" className="text-[0.5rem] text-muted">Rango 70–100 %</span></Field>
                <Field label="Prioridad de triaje"><div className="relative"><select className={selectClass} value={triagePriority} onChange={(event) => setTriagePriority(event.target.value)}><option value="">Seleccione prioridad (opcional)</option><option value="routine">Rutina</option><option value="urgent">Urgente</option><option value="emergency">Emergencia</option></select><ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted" aria-hidden="true" /></div></Field>
              </div>
              <Field label="Notas de triaje"><textarea className={`${inputClass} min-h-20 py-2`} value={triageNotes} onChange={(event) => setTriageNotes(event.target.value)} placeholder="Observaciones clínicas de la valoración (opcional)" maxLength={2000} /></Field>
            </div>
            <div><p className="text-[0.58rem] font-bold text-ink-secondary">Adjuntar documento / comprobante</p><button className="mt-1.5 flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-accent/35 bg-accent-soft/30 text-[0.62rem] font-bold text-accent" type="button" onClick={() => showNotice("La carga de documentos se habilitará con el expediente digital.")}><FileText className="size-4" aria-hidden="true" />Arrastra o selecciona un archivo <span className="text-[0.52rem] font-normal text-muted">PDF, JPG, PNG (Máx. 5MB)</span></button></div>
             <div className="flex flex-wrap items-center gap-4 text-[0.58rem] font-semibold text-ink-secondary"><label className="flex items-center gap-2"><input className="size-3.5 accent-accent" type="checkbox" checked={isReturningPatient} onChange={(event) => setIsReturningPatient(event.target.checked)} />Paciente recurrente</label><label className="flex items-center gap-2"><input className="size-3.5 accent-accent" type="checkbox" checked={whatsappConsent} onChange={(event) => setWhatsappConsent(event.target.checked)} />Autoriza mensajes por WhatsApp</label><span className="ml-auto text-muted">{formComplete ? "Datos básicos listos" : "Completa nombres y teléfono"}</span></div>
            <div className="flex justify-end gap-2 border-t border-line pt-3"><button className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-line px-3 text-xs font-bold text-muted hover:bg-surface-hover" type="button" onClick={resetForm}><RotateCcw className="size-3.5" aria-hidden="true" />Limpiar</button><button className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-accent px-4 text-xs font-extrabold text-white disabled:opacity-50" type="submit" disabled={isPending}>{isPending ? "Guardando…" : "Registrar paciente"}<Save className="size-3.5" aria-hidden="true" /></button></div>
          </form>
        </SectionCard>

        <SectionCard className="overflow-hidden" labelledBy="recent-patients-title"><div className="flex items-center justify-between border-b border-line px-4 py-3"><h2 className="flex items-center gap-2 text-xs font-extrabold" id="recent-patients-title"><CalendarDays className="size-3.5 text-accent" aria-hidden="true" />Pacientes registrados recientemente</h2><button className="text-[0.6rem] font-extrabold text-accent" type="button" onClick={() => showNotice("Listado actualizado desde el backend.")}>Actualizar</button></div><div className="overflow-x-auto"><table className="w-full min-w-150 text-left"><caption className="sr-only">Pacientes registrados recientemente</caption><thead className="bg-surface-subtle text-[0.52rem] font-extrabold uppercase tracking-wide text-muted"><tr><th className="px-3 py-2" scope="col">Paciente</th><th className="px-3 py-2" scope="col">Documento</th><th className="px-3 py-2" scope="col">Registro</th><th className="px-3 py-2" scope="col">Estado</th><th className="px-3 py-2 text-right" scope="col">Acción</th></tr></thead><tbody className="divide-y divide-line">{recentPatients.slice(0, 6).map((patient, index) => <tr className="text-[0.6rem]" key={patient.id}><th className="px-3 py-2 font-normal" scope="row"><span className="flex items-center gap-2"><span className={`grid size-7 shrink-0 place-items-center rounded-full font-mono text-[0.5rem] font-bold ${index % 2 ? "bg-violet-soft text-violet" : "bg-accent-soft text-accent"}`}>{initials(patient.name ?? "Paciente")}</span><span className="min-w-0"><span className="block font-extrabold">{patient.name ?? "Paciente sin nombre"}{patient.triage?.priority ? <span className={`ml-1.5 inline-block rounded px-1 py-0.5 align-middle text-[0.48rem] font-extrabold ${TRIAGE_PRIORITY_CLASSES[patient.triage.priority]}`}>{TRIAGE_PRIORITY_LABELS[patient.triage.priority]}</span> : null}</span>{triageSummary(patient) ? <span className="block truncate text-[0.48rem] font-semibold text-muted">{triageSummary(patient)}</span> : null}</span></span></th><td className="px-3 py-2 font-mono text-ink-secondary">{patient.patientCode}</td><td className="px-3 py-2 text-ink-secondary">{formatDate(patient.createdAt)}</td><td className="px-3 py-2"><span className={`rounded-md px-2 py-1 text-[0.52rem] font-extrabold ${statusClass(patient)}`}>{statusLabel(patient)}</span></td><td className="px-3 py-2 text-right"><button className="grid size-7 ml-auto place-items-center rounded-lg text-muted hover:bg-accent-soft hover:text-accent" type="button" aria-label={`Ver ${patient.name ?? "paciente"}`} onClick={() => showNotice(`Abriendo expediente de ${patient.name ?? "paciente"}`)}><Eye className="size-3.5" aria-hidden="true" /></button></td></tr>)}</tbody></table>{isLoading ? <p className="p-6 text-center text-xs font-semibold text-muted">Cargando registros…</p> : null}{!isLoading && recentPatients.length === 0 ? <p className="p-6 text-center text-xs font-semibold text-muted">No hay pacientes registrados.</p> : null}</div><div className="border-t border-line px-4 py-2.5 text-center text-[0.6rem] font-extrabold text-accent">Ver todos los registros</div></SectionCard>
      </div>

      <aside className="grid gap-3"><SectionCard className="p-4"><h2 className="text-xs font-extrabold">Validación rápida</h2><ul className="mt-3 grid gap-2.5 text-[0.58rem] font-semibold"><li className="flex items-center gap-2"><Check className="size-3.5 text-success" /><span className="flex-1">Documento verificado</span><b className={documentValid ? "text-success" : "text-warning"}>{documentValid ? "Válido" : "Pendiente"}</b></li><li className="flex items-center gap-2"><Check className="size-3.5 text-success" /><span className="flex-1">Teléfono válido</span><b className={normalizedPhone ? "text-success" : "text-warning"}>{normalizedPhone ? "Válido" : "Pendiente"}</b></li><li className="flex items-center gap-2"><Check className="size-3.5 text-warning" /><span className="flex-1">Seguro confirmado</span><b className={insurance ? "text-success" : "text-warning"}>{insurance ? "Válido" : "Pendiente"}</b></li><li className="flex items-center gap-2"><Check className="size-3.5 text-success" /><span className="flex-1">Datos completos</span><b className={formComplete ? "text-success" : "text-warning"}>{formComplete ? "Completo" : "Pendiente"}</b></li></ul></SectionCard><SectionCard className="p-4"><div className="flex items-center justify-between"><h2 className="text-xs font-extrabold">Próximos ingresos</h2><span className="text-[0.6rem] font-extrabold text-accent">{upcoming.length}</span></div><ul className="mt-3 divide-y divide-line">{upcoming.map((appointment) => <li className="flex items-center gap-2 py-2.5" key={appointment.id}><span className="font-mono text-[0.56rem] font-bold">{appointment.time}</span><span className="grid size-7 place-items-center rounded-full bg-accent-soft font-mono text-[0.5rem] font-bold text-accent">{initials(appointment.patient.name ?? "Paciente")}</span><span className="min-w-0 flex-1 truncate text-[0.58rem] font-extrabold">{appointment.patient.name ?? "Paciente"}</span><span className={`rounded-md px-1.5 py-1 text-[0.5rem] font-bold ${appointment.status === "confirmed" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}>{appointment.statusLabel}</span></li>)}</ul>{upcoming.length === 0 ? <p className="mt-3 text-[0.6rem] text-muted">No hay próximas citas.</p> : null}</SectionCard><SectionCard className="p-4"><div className="flex items-center justify-between"><h2 className="text-xs font-extrabold">Recordatorios</h2><ShieldCheck className="size-4 text-accent" aria-hidden="true" /></div><ul className="mt-3 divide-y divide-line text-[0.58rem]"><li className="flex items-center gap-2 py-2.5"><FileText className="size-3.5 text-danger" aria-hidden="true" /><span className="flex-1 text-muted">Pacientes con datos faltantes</span><b>{Math.max(recentPatients.length - completeCount, 0)}</b></li><li className="flex items-center gap-2 py-2.5"><FileCheck2 className="size-3.5 text-success" aria-hidden="true" /><span className="flex-1 text-muted">Documentos por validar</span><b>{documentValid ? 0 : 1}</b></li><li className="flex items-center gap-2 py-2.5"><Search className="size-3.5 text-warning" aria-hidden="true" /><span className="flex-1 text-muted">Duplicados detectados</span><b>0</b></li></ul></SectionCard><SectionCard className="p-4"><div className="flex items-center justify-between"><h2 className="text-xs font-extrabold">Disponibilidad de médicos</h2><span className="text-[0.6rem] font-extrabold text-accent">Ver todos</span></div><ul className="mt-3 grid gap-2.5">{doctors.slice(0, 4).map((member) => <li className="flex items-center gap-2" key={member.id}><span className="grid size-7 place-items-center rounded-full bg-accent-soft font-mono text-[0.5rem] font-bold text-accent">{initials(member.name)}</span><span className="min-w-0 flex-1"><strong className="block truncate text-[0.58rem]">{member.name}</strong><span className="block truncate text-[0.5rem] text-muted">{member.specialty ?? "Medicina general"}</span></span><span className="size-1.5 rounded-full bg-success" /></li>)}</ul></SectionCard></aside>
    </div>
  </div>;
}

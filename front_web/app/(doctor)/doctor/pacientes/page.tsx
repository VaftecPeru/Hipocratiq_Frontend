"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, ChevronRight, FileText, HeartPulse, Pencil, Plus, RefreshCw, Save, Users, X } from "lucide-react";
import { DoctorAvatar, DoctorCard, MetricCard, SectionHeading } from "@/features/doctors/ui/doctor-primitives";
import { Spinner } from "@/shared/ui/spinner";
import {
  getDoctorClinicalHistory,
  getDoctorPatients,
  createDoctorPatient,
  updateDoctorPatient,
  type ClinicalHistoryRecord,
  type DoctorPatientPayload,
  type DoctorPatient,
} from "@/features/doctors/api/doctor-clinical";
import { getDoctorProfile } from "@/features/doctors/api/doctor-profile";

const dateFormatter = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" });

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function initialsOf(name: string | null | undefined): string {
  return (name ?? "Paciente").split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "PA";
}

type PatientFormState = DoctorPatientPayload;

function emptyPatientForm(): PatientFormState {
  return {
    name: "",
    email: "",
    phone_number: "",
    country_code: "MX",
    document_type: "",
    document_number: "",
    date_of_birth: "",
    sex: "",
    address: "",
    emergency_contact: "",
    insurance: "",
    whatsapp_consent: false,
  };
}

function patientToForm(patient: DoctorPatient): PatientFormState {
  return {
    name: patient.name ?? "",
    email: patient.email ?? "",
    phone_number: patient.phoneNumber ?? "",
    country_code: patient.countryCode ?? "MX",
    document_type: patient.documentType ?? "",
    document_number: patient.documentNumber ?? "",
    date_of_birth: patient.dateOfBirth ?? "",
    sex: patient.sex ?? "",
    address: patient.address ?? "",
    emergency_contact: patient.emergencyContact ?? "",
    insurance: patient.insurance ?? "",
    whatsapp_consent: patient.whatsappConsent,
  };
}

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [history, setHistory] = useState<ClinicalHistoryRecord[]>([]);
  const [historyPatient, setHistoryPatient] = useState<number | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isIndependent, setIsIndependent] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<DoctorPatient | null>(null);
  const [form, setForm] = useState<PatientFormState>(emptyPatientForm);
  const [formPending, setFormPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getDoctorPatients(controller.signal)
      .then((list) => {
        setPatients(list);
        if (list.length > 0) setSelectedPatientId(list[0].id);
      })
      .catch((caught: unknown) => {
        if (!(caught instanceof DOMException && caught.name === "AbortError")) {
          setError(caught instanceof Error ? caught.message : "No pudimos cargar los pacientes.");
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getDoctorProfile(controller.signal)
      .then((profile) => setIsIndependent(profile.practiceType === "independent"))
      .catch((caught: unknown) => {
        if (!(caught instanceof DOMException && caught.name === "AbortError")) setIsIndependent(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (selectedPatientId === null) return;
    const controller = new AbortController();
    getDoctorClinicalHistory(selectedPatientId, controller.signal)
      .then((records) => {
        setHistory(records);
        setHistoryPatient(selectedPatientId);
        setHistoryError(null);
      })
      .catch((caught: unknown) => {
        if (!(caught instanceof DOMException && caught.name === "AbortError")) {
          setHistoryError(caught instanceof Error ? caught.message : "No pudimos cargar el historial clínico.");
        }
        setHistoryPatient(selectedPatientId);
      });
    return () => controller.abort();
  }, [selectedPatientId]);

  const historyLoading = selectedPatientId !== null && historyPatient !== selectedPatientId;

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) ?? null,
    [patients, selectedPatientId],
  );

  function openCreateForm(): void {
    setEditingPatient(null);
    setForm(emptyPatientForm());
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(patient: DoctorPatient): void {
    setEditingPatient(patient);
    setForm(patientToForm(patient));
    setFormError(null);
    setFormOpen(true);
  }

  async function handlePatientSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormPending(true);
    setFormError(null);

    try {
      const payload: DoctorPatientPayload = {
        ...form,
        name: form.name.trim(),
        email: form.email?.trim() || null,
        phone_number: form.phone_number.trim(),
        document_type: form.document_type?.trim() || null,
        document_number: form.document_number?.trim() || null,
        date_of_birth: form.date_of_birth || null,
        sex: form.sex || null,
        address: form.address?.trim() || null,
        emergency_contact: form.emergency_contact?.trim() || null,
        insurance: form.insurance?.trim() || null,
      };

      if (editingPatient) {
        const updated = await updateDoctorPatient(editingPatient.id, payload);
        setPatients((current) => current.map((patient) => patient.id === updated.id ? updated : patient));
        setFormOpen(false);
      } else {
        const created = await createDoctorPatient(payload);
        setPatients((current) => [created, ...current]);
        setSelectedPatientId(created.id);
        setFormOpen(false);
      }
    } catch (caught: unknown) {
      setFormError(caught instanceof Error ? caught.message : "No pudimos guardar el paciente.");
    } finally {
      setFormPending(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
        <DoctorCard className="flex min-h-48 items-center justify-center p-6">
          <p className="flex items-center gap-2 text-xs font-bold text-muted" aria-busy="true">
            <Spinner className="size-4" /> Cargando pacientes…
          </p>
        </DoctorCard>
      </div>
    );
  }

  if (error && patients.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
        <DoctorCard className="p-6">
          <p className="text-xs font-bold text-danger" role="alert">{error}</p>
        </DoctorCard>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.65rem]">Pacientes</h1>
          <p className="mt-1 text-[0.68rem] font-bold text-ink-secondary">Pacientes vinculados a tus consultas e ingresos en la clínica.</p>
        </div>
        {isIndependent ? <button className="inline-flex min-h-9 items-center justify-center gap-2 self-start rounded-lg bg-accent px-3.5 text-[0.65rem] font-extrabold text-white shadow-[0_5px_14px_rgb(8_98_221/18%)] hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus sm:self-auto" type="button" onClick={openCreateForm}><Plus className="size-3.5" aria-hidden="true" />Nuevo paciente</button> : null}
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Resumen de pacientes">
        <MetricCard label="Pacientes vinculados" value={String(patients.length)} icon={Users} tone="green" />
        <MetricCard label="Con historial clínico" value={String(history.length)} icon={FileText} tone="blue" />
        <MetricCard label="Consulta por registrar" value="—" icon={CalendarPlus} tone="violet" />
        <MetricCard label="Activos" value={String(patients.length)} icon={HeartPulse} tone="orange" />
      </section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_420px]" aria-label="Gestión de pacientes">
        <DoctorCard className="min-w-0 overflow-hidden">
          <div className="border-b border-line px-4 py-3 sm:px-5"><SectionHeading title="Listado de pacientes" /></div>
          <div className="overflow-x-auto">
            {patients.length === 0 ? (
              <div className="grid place-items-center px-6 py-12 text-center">
                <p className="text-xs font-bold text-ink-secondary">Aún no tienes pacientes vinculados a tus consultas.</p>
              </div>
            ) : (
              <table className="w-full min-w-[680px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-surface-subtle text-[0.55rem] font-extrabold text-ink-secondary">
                    <th className="px-3 py-2.5 font-extrabold sm:px-4">Paciente</th>
                    <th className="px-3 py-2.5 font-extrabold">Documento</th>
                    <th className="px-3 py-2.5 font-extrabold">Sexo</th>
                    <th className="px-3 py-2.5 font-extrabold">Nacimiento</th>
                     <th className="px-3 py-2.5 font-extrabold">Historial</th>
                     {isIndependent ? <th className="px-3 py-2.5 font-extrabold">Acciones</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr
                      className={`cursor-pointer border-b border-line last:border-0 hover:bg-surface-subtle ${selectedPatientId === patient.id ? "bg-accent-soft/50" : ""}`}
                      key={patient.id}
                      onClick={() => setSelectedPatientId(patient.id)}
                    >
                      <td className="px-3 py-2.5 sm:px-4">
                        <div className="flex items-center gap-2.5">
                          <DoctorAvatar initials={initialsOf(patient.name)} tone={patient.id % 2 === 0 ? "blue" : "orange"} size="md" />
                          <div>
                            <p className="whitespace-nowrap text-[0.62rem] font-extrabold">{patient.name}</p>
                            <p className="mt-0.5 text-[0.55rem] font-bold text-ink-secondary">{patient.clinic?.name ?? "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-[0.6rem] font-extrabold">{patient.documentType ?? "—"} {patient.documentNumber ?? ""}</td>
                      <td className="px-3 py-2.5 text-[0.6rem] font-extrabold">{patient.sex ?? "—"}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-[0.6rem] font-extrabold">{formatDate(patient.dateOfBirth)}</td>
                      <td className="px-3 py-2.5">
                        <button
                          className="inline-flex min-h-7 items-center gap-1.5 rounded-md border border-accent/20 px-2.5 text-[0.58rem] font-extrabold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus"
                          type="button"
                          onClick={(event) => { event.stopPropagation(); setSelectedPatientId(patient.id); }}
                        >
                          Ver historial <ChevronRight className="size-3" aria-hidden="true" />
                        </button>
                      </td>
                      {isIndependent ? <td className="px-3 py-2.5"><button className="inline-flex min-h-7 items-center gap-1.5 rounded-md border border-line px-2.5 text-[0.58rem] font-extrabold text-ink-secondary hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" onClick={(event) => { event.stopPropagation(); openEditForm(patient); }}><Pencil className="size-3" aria-hidden="true" />Editar</button></td> : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DoctorCard>

        <DoctorCard className="min-w-0 overflow-hidden">
          <div className="border-b border-line px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <DoctorAvatar initials={initialsOf(selectedPatient?.name)} tone="blue" size="sm" />
                <div>
                  <h2 className="text-[0.82rem] font-extrabold">{selectedPatient?.name ?? "Paciente"}</h2>
                  <p className="text-[0.56rem] font-bold text-ink-secondary">{selectedPatient?.documentType ? `${selectedPatient.documentType} ${selectedPatient.documentNumber}` : "Sin documento"}</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-success-soft px-2 py-1 text-[0.56rem] font-extrabold text-success">
                <RefreshCw className="size-3" aria-hidden="true" />Activo
              </span>
            </div>
          </div>

          <div className="max-h-[520px] overflow-y-auto p-4">
            {historyLoading ? (
              <p className="flex items-center gap-2 py-8 text-xs font-bold text-muted" aria-busy="true">
                <Spinner className="size-4" /> Cargando historial…
              </p>
            ) : historyError ? (
              <p className="py-8 text-center text-xs font-bold text-danger" role="alert">{historyError}</p>
            ) : history.length === 0 ? (
              <p className="py-10 text-center text-xs font-bold text-ink-secondary">Sin registros de historia clínica para este paciente.</p>
            ) : (
              <ul className="grid gap-2">
                {history.map((record) => (
                  <li className="rounded-lg border border-line p-3" key={record.id}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[0.6rem] font-extrabold text-ink">Historia clínica #{record.id}</p>
                      <span className="text-[0.55rem] font-bold text-ink-secondary">{formatDate(record.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-[0.56rem] font-bold text-ink-secondary">Objetivo: {record.objective ?? "—"}</p>
                    <p className="mt-1 text-[0.56rem] font-bold text-ink-secondary">{record.sections.length} de 15 apartados guardados</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DoctorCard>
      </section>

      {formOpen ? <dialog open className="fixed inset-0 z-50 m-0 grid h-full w-full max-w-none place-items-center overflow-y-auto bg-ink/35 p-4" onCancel={() => setFormOpen(false)} aria-labelledby="patient-form-title"><div className="my-4 w-full max-w-2xl rounded-xl border border-line bg-surface p-5 shadow-2xl"><div className="flex items-center justify-between gap-4"><div><h2 id="patient-form-title" className="text-base font-extrabold">{editingPatient ? "Editar paciente" : "Nuevo paciente"}</h2><p className="mt-1 text-xs font-bold text-ink-secondary">Los pacientes independientes quedan vinculados únicamente a tu práctica.</p></div><button className="grid size-8 place-items-center rounded-lg border border-line text-ink-secondary hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Cerrar formulario" disabled={formPending} onClick={() => setFormOpen(false)}><X className="size-4" aria-hidden="true" /></button></div><form className="mt-5 grid gap-3" onSubmit={(event) => void handlePatientSubmit(event)}><div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1 text-xs font-bold text-ink-secondary">Nombre completo<input className="h-10 rounded-lg border border-line bg-surface-input px-3 text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} minLength={2} maxLength={160} required /></label><label className="grid gap-1 text-xs font-bold text-ink-secondary">Correo electrónico<input className="h-10 rounded-lg border border-line bg-surface-input px-3 text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" type="email" value={form.email ?? ""} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></label></div><div className="grid gap-3 sm:grid-cols-[1fr_120px]"><label className="grid gap-1 text-xs font-bold text-ink-secondary">Teléfono<input className="h-10 rounded-lg border border-line bg-surface-input px-3 text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" value={form.phone_number} onChange={(event) => setForm((current) => ({ ...current, phone_number: event.target.value }))} maxLength={32} required /></label><label className="grid gap-1 text-xs font-bold text-ink-secondary">País<select className="h-10 rounded-lg border border-line bg-surface-input px-3 text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" value={form.country_code} onChange={(event) => setForm((current) => ({ ...current, country_code: event.target.value }))}><option value="MX">México</option><option value="PE">Perú</option><option value="US">Estados Unidos</option></select></label></div><div className="grid gap-3 sm:grid-cols-3"><label className="grid gap-1 text-xs font-bold text-ink-secondary">Tipo de documento<input className="h-10 rounded-lg border border-line bg-surface-input px-3 text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" value={form.document_type ?? ""} onChange={(event) => setForm((current) => ({ ...current, document_type: event.target.value }))} /></label><label className="grid gap-1 text-xs font-bold text-ink-secondary">Número de documento<input className="h-10 rounded-lg border border-line bg-surface-input px-3 text-sm font-extrabold text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" value={form.document_number ?? ""} onChange={(event) => setForm((current) => ({ ...current, document_number: event.target.value }))} /></label><label className="grid gap-1 text-xs font-bold text-ink-secondary">Fecha de nacimiento<input className="h-10 rounded-lg border border-line bg-surface-input px-3 text-sm font-extrabold text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" type="date" value={form.date_of_birth ?? ""} onChange={(event) => setForm((current) => ({ ...current, date_of_birth: event.target.value }))} /></label></div><div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1 text-xs font-bold text-ink-secondary">Sexo<select className="h-10 rounded-lg border border-line bg-surface-input px-3 text-sm font-extrabold text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" value={form.sex ?? ""} onChange={(event) => setForm((current) => ({ ...current, sex: event.target.value }))}><option value="">Sin especificar</option><option value="Femenino">Femenino</option><option value="Masculino">Masculino</option><option value="Otro">Otro</option></select></label><label className="grid gap-1 text-xs font-bold text-ink-secondary">Seguro médico<input className="h-10 rounded-lg border border-line bg-surface-input px-3 text-sm font-extrabold text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" value={form.insurance ?? ""} onChange={(event) => setForm((current) => ({ ...current, insurance: event.target.value }))} /></label></div><label className="grid gap-1 text-xs font-bold text-ink-secondary">Dirección<input className="h-10 rounded-lg border border-line bg-surface-input px-3 text-sm font-extrabold text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" value={form.address ?? ""} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} /></label><label className="grid gap-1 text-xs font-bold text-ink-secondary">Contacto de emergencia<input className="h-10 rounded-lg border border-line bg-surface-input px-3 text-sm font-extrabold text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" value={form.emergency_contact ?? ""} onChange={(event) => setForm((current) => ({ ...current, emergency_contact: event.target.value }))} /></label><label className="flex items-center gap-2 text-xs font-bold text-ink-secondary"><input type="checkbox" checked={Boolean(form.whatsapp_consent)} onChange={(event) => setForm((current) => ({ ...current, whatsapp_consent: event.target.checked }))} />Acepta comunicaciones por WhatsApp</label>{formError ? <p className="text-xs font-bold text-danger" role="alert">{formError}</p> : null}<div className="flex justify-end gap-2 pt-2"><button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-line px-4 text-xs font-extrabold hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus disabled:opacity-60" type="button" disabled={formPending} onClick={() => setFormOpen(false)}>Cancelar</button><button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-xs font-extrabold text-white hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus disabled:opacity-60" type="submit" disabled={formPending}>{formPending ? <Spinner className="size-3.5" /> : <Save className="size-3.5" aria-hidden="true" />}{editingPatient ? "Guardar cambios" : "Crear paciente"}</button></div></form></div></dialog> : null}
    </div>
  );
}

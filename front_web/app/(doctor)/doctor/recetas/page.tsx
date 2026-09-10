"use client";

import { CheckCircle2, ClipboardCheck, Clock3, FileText, Plus, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import {
  createDoctorPrescription,
  getDoctorPatients,
  getDoctorPrescriptions,
  type DoctorPatient,
  type DoctorPrescription,
  type DoctorPrescriptionMeta,
  type DoctorPrescriptionStatus,
} from "@/features/doctors/api/doctor-clinical";
import { DoctorAvatar, DoctorCard, MetricCard, StatusBadge } from "@/features/doctors/ui/doctor-primitives";
import { DoctorModuleAlert, DoctorModuleEmpty, DoctorModuleError, DoctorModuleLoading } from "@/features/doctors/ui/doctor-module-state";

const dateFormatter = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function initialsOf(name: string | null): string {
  return (name ?? "Paciente").split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "PA";
}

function statusTone(status: DoctorPrescriptionStatus): "green" | "orange" | "red" | "slate" {
  if (status === "active") return "green";
  if (status === "renewal_due") return "orange";
  if (status === "canceled") return "red";
  return "slate";
}

const EMPTY_META: DoctorPrescriptionMeta = { total: 0, active: 0, renewal_due: 0, pending: 0 };

export default function DoctorPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<DoctorPrescription[]>([]);
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [meta, setMeta] = useState<DoctorPrescriptionMeta>(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ patientId: "", medication: "", dosage: "", frequency: "", durationDays: "", notes: "" });

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getDoctorPrescriptions(controller.signal), getDoctorPatients(controller.signal)])
      .then(([prescriptionResult, patientList]) => {
        setPrescriptions(prescriptionResult.items);
        setMeta(prescriptionResult.meta);
        setPatients(patientList);
        if (patientList[0]) setForm((current) => ({ ...current, patientId: String(patientList[0].id) }));
        setError(null);
      })
      .catch((caught: unknown) => {
        if (!(caught instanceof DOMException && caught.name === "AbortError")) setError(caught instanceof Error ? caught.message : "No pudimos cargar las recetas.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      const created = await createDoctorPrescription({
        patient_profile_id: Number(form.patientId),
        medication: form.medication.trim(),
        dosage: form.dosage.trim() || null,
        frequency: form.frequency.trim() || null,
        duration_days: form.durationDays ? Number(form.durationDays) : null,
        notes: form.notes.trim() || null,
      });
      setPrescriptions((current) => [created, ...current]);
      setMeta((current) => ({ ...current, total: current.total + 1, active: current.active + 1 }));
      setForm((current) => ({ ...current, medication: "", dosage: "", frequency: "", durationDays: "", notes: "" }));
      setSuccess("Receta registrada correctamente.");
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "No pudimos registrar la receta.");
    } finally {
      setPending(false);
    }
  }

  const metrics = [
    { label: "Recetas registradas", value: String(meta.total), icon: ClipboardCheck, tone: "blue" as const },
    { label: "Por renovar", value: String(meta.renewal_due), icon: Clock3, tone: "orange" as const },
    { label: "Activas", value: String(meta.active), icon: CheckCircle2, tone: "green" as const },
    { label: "Pendientes", value: String(meta.pending), icon: Timer, tone: "violet" as const },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.65rem]">Recetas</h1><p className="mt-1 text-[0.68rem] font-bold text-ink-secondary">Registra indicaciones farmacológicas y renovaciones dentro de tu práctica.</p></div>
        <span className="inline-flex min-h-9 items-center gap-2 self-start rounded-lg border border-line bg-surface px-3 text-[0.62rem] font-extrabold text-ink-secondary sm:self-auto"><FileText className="size-3.5 text-accent" aria-hidden="true" />Datos persistidos</span>
      </header>

      {error && prescriptions.length > 0 ? <DoctorModuleAlert>{error}</DoctorModuleAlert> : null}
      {success ? <DoctorModuleAlert tone="success">{success}</DoctorModuleAlert> : null}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Resumen de recetas">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]" aria-label="Gestión de recetas">
        <DoctorCard className="min-w-0 overflow-hidden">
          <div className="border-b border-line px-4 py-3 sm:px-5"><h2 className="text-[0.86rem] font-extrabold">Recetas recientes</h2></div>
          {loading ? <DoctorModuleLoading label="Cargando recetas…" /> : error && prescriptions.length === 0 ? <DoctorModuleError message={error} /> : prescriptions.length === 0 ? <DoctorModuleEmpty message="Aún no hay recetas registradas para tus pacientes." /> : (
            <div className="overflow-x-auto"><table className="w-full min-w-[680px] border-collapse text-left"><caption className="sr-only">Recetas registradas</caption><thead><tr className="border-b border-line bg-surface-subtle text-[0.55rem] font-extrabold text-ink-secondary"><th className="px-3 py-2.5 font-extrabold sm:px-4">Paciente</th><th className="px-3 py-2.5 font-extrabold">Medicamento</th><th className="px-3 py-2.5 font-extrabold">Fecha</th><th className="px-3 py-2.5 font-extrabold">Estado</th></tr></thead><tbody>{prescriptions.map((prescription) => <tr className="border-b border-line last:border-0 hover:bg-surface-subtle" key={prescription.id}><td className="px-3 py-2.5 sm:px-4"><div className="flex items-center gap-2"><DoctorAvatar initials={initialsOf(prescription.patient.name)} tone={prescription.id % 2 === 0 ? "blue" : "orange"} size="sm" /><span className="whitespace-nowrap text-[0.61rem] font-extrabold">{prescription.patient.name ?? prescription.patient.patientCode}</span></div></td><td className="px-3 py-2.5"><p className="text-[0.6rem] font-extrabold">{prescription.medication}</p><p className="mt-0.5 text-[0.55rem] font-bold text-ink-secondary">{[prescription.dosage, prescription.frequency].filter(Boolean).join(" · ") || "Sin indicación adicional"}</p></td><td className="px-3 py-2.5 whitespace-nowrap text-[0.58rem] font-bold text-ink-secondary">{formatDate(prescription.issuedAt)}</td><td className="px-3 py-2.5"><StatusBadge tone={statusTone(prescription.status)}>{prescription.statusLabel}</StatusBadge></td></tr>)}</tbody></table></div>
          )}
        </DoctorCard>

        <DoctorCard className="p-4">
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-[0.86rem] font-extrabold">Nueva receta</h2><p className="mt-1 text-[0.58rem] font-bold text-ink-secondary">Se vincula al paciente y al médico autenticado.</p></div><Plus className="size-4 text-accent" aria-hidden="true" /></div>
          <form className="mt-4 grid gap-3" onSubmit={(event) => void handleSubmit(event)}>
            <label className="grid gap-1 text-[0.6rem] font-bold text-ink-secondary">Paciente<select className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20 disabled:opacity-60" required value={form.patientId} onChange={(event) => setForm((current) => ({ ...current, patientId: event.target.value }))} disabled={patients.length === 0 || pending}><option value="">Selecciona un paciente</option>{patients.map((patient) => <option key={patient.id} value={String(patient.id)}>{patient.name ?? patient.patientCode}</option>)}</select></label>
            <label className="grid gap-1 text-[0.6rem] font-bold text-ink-secondary">Medicamento<input className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" required minLength={2} maxLength={180} value={form.medication} onChange={(event) => setForm((current) => ({ ...current, medication: event.target.value }))} disabled={pending} /></label>
            <div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1 text-[0.6rem] font-bold text-ink-secondary">Dosis<input className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" value={form.dosage} onChange={(event) => setForm((current) => ({ ...current, dosage: event.target.value }))} disabled={pending} /></label><label className="grid gap-1 text-[0.6rem] font-bold text-ink-secondary">Frecuencia<input className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" placeholder="Cada 12 horas" value={form.frequency} onChange={(event) => setForm((current) => ({ ...current, frequency: event.target.value }))} disabled={pending} /></label></div>
            <label className="grid gap-1 text-[0.6rem] font-bold text-ink-secondary">Duración en días<input className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" type="number" min="1" max="3650" value={form.durationDays} onChange={(event) => setForm((current) => ({ ...current, durationDays: event.target.value }))} disabled={pending} /></label>
            <label className="grid gap-1 text-[0.6rem] font-bold text-ink-secondary">Notas<textarea className="min-h-20 rounded-lg border border-line bg-surface-input px-2 py-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" maxLength={2000} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} disabled={pending} /></label>
            <button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[0.62rem] font-extrabold text-white hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={pending || patients.length === 0}>{pending ? "Guardando…" : "Registrar receta"}</button>
            {patients.length === 0 && !loading ? <p className="text-[0.58rem] font-bold text-ink-secondary">Primero registra o vincula un paciente para emitir una receta.</p> : null}
          </form>
        </DoctorCard>
      </section>
    </div>
  );
}

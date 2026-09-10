"use client";

import { CheckCircle2, Clock3, Plus, ShieldOff, Users, Video } from "lucide-react";
import { useEffect, useState } from "react";
import {
  createDoctorTeleconsultation,
  getDoctorPatients,
  getDoctorTeleconsultations,
  updateDoctorTeleconsultationStatus,
  type DoctorPatient,
  type DoctorTeleconsultation,
  type DoctorTeleconsultationMeta,
  type TeleconsultationStatus,
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

function statusTone(status: TeleconsultationStatus): "blue" | "green" | "orange" | "red" | "violet" | "slate" {
  if (status === "completed") return "green";
  if (status === "waiting" || status === "in_progress") return "orange";
  if (status === "canceled") return "red";
  return "blue";
}

function nextStatus(status: TeleconsultationStatus): { value: TeleconsultationStatus; label: string } | null {
  if (status === "scheduled") return { value: "waiting", label: "Abrir sala" };
  if (status === "waiting") return { value: "in_progress", label: "Iniciar" };
  if (status === "in_progress") return { value: "completed", label: "Finalizar" };
  return null;
}

const EMPTY_META: DoctorTeleconsultationMeta = { total: 0, scheduled: 0, waiting: 0, in_progress: 0, completed: 0, connection: { status: "not_configured", message: "", } };

export default function DoctorTelemedicinePage() {
  const [sessions, setSessions] = useState<DoctorTeleconsultation[]>([]);
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [meta, setMeta] = useState<DoctorTeleconsultationMeta>(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ patientId: "", scheduledAt: "", notes: "" });

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getDoctorTeleconsultations(controller.signal), getDoctorPatients(controller.signal)])
      .then(([sessionResult, patientList]) => {
        setSessions(sessionResult.items);
        setMeta(sessionResult.meta);
        setPatients(patientList);
        if (patientList[0]) setForm((current) => ({ ...current, patientId: String(patientList[0].id) }));
        setError(null);
      })
      .catch((caught: unknown) => {
        if (!(caught instanceof DOMException && caught.name === "AbortError")) setError(caught instanceof Error ? caught.message : "No pudimos cargar las teleconsultas.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      const created = await createDoctorTeleconsultation({ patient_profile_id: Number(form.patientId), scheduled_at: new Date(form.scheduledAt).toISOString(), notes: form.notes.trim() || null });
      setSessions((current) => [...current, created].sort((left, right) => (left.scheduledAt ?? "").localeCompare(right.scheduledAt ?? "")));
      setMeta((current) => ({ ...current, total: current.total + 1, scheduled: current.scheduled + 1 }));
      setForm((current) => ({ ...current, scheduledAt: "", notes: "" }));
      setSuccess("Teleconsulta programada. La conexión de video permanece deshabilitada hasta configurar un proveedor.");
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "No pudimos programar la teleconsulta.");
    } finally {
      setPending(false);
    }
  }

  async function handleStatus(session: DoctorTeleconsultation): Promise<void> {
    const next = nextStatus(session.status);
    if (!next) return;
    setPending(true);
    setError(null);
    try {
      const updated = await updateDoctorTeleconsultationStatus(session.id, next.value);
      setSessions((current) => current.map((item) => item.id === updated.id ? updated : item));
      setMeta((current) => {
        const nextMeta = { ...current };
        if (session.status === "scheduled" || session.status === "waiting" || session.status === "in_progress" || session.status === "completed") nextMeta[session.status] = Math.max(0, nextMeta[session.status] - 1);
        if (next.value === "scheduled" || next.value === "waiting" || next.value === "in_progress" || next.value === "completed") nextMeta[next.value] += 1;
        return nextMeta;
      });
      setSuccess("Estado de la teleconsulta actualizado.");
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "No pudimos actualizar la teleconsulta.");
    } finally {
      setPending(false);
    }
  }

  const metrics = [
    { label: "Teleconsultas programadas", value: String(meta.total), icon: Video, tone: "violet" as const },
    { label: "En sala de espera", value: String(meta.waiting), icon: Users, tone: "orange" as const },
    { label: "Finalizadas", value: String(meta.completed), icon: CheckCircle2, tone: "green" as const },
    { label: "En curso", value: String(meta.in_progress), icon: Clock3, tone: "blue" as const },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.65rem]">Telemedicina</h1><p className="mt-1 text-[0.68rem] font-bold text-ink-secondary">Programa y controla sesiones remotas. No se habilita una videollamada ficticia.</p></div><span className="inline-flex min-h-9 items-center gap-2 self-start rounded-lg border border-warning/30 bg-warning-soft px-3 text-[0.62rem] font-extrabold text-warning sm:self-auto"><ShieldOff className="size-3.5" aria-hidden="true" />Video no configurado</span></header>
      {error && sessions.length > 0 ? <DoctorModuleAlert>{error}</DoctorModuleAlert> : null}
      {success ? <DoctorModuleAlert tone="success">{success}</DoctorModuleAlert> : null}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Resumen de telemedicina">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]" aria-label="Operación de telemedicina">
        <DoctorCard className="min-w-0 overflow-hidden"><div className="border-b border-line px-4 py-3 sm:px-5"><h2 className="text-[0.86rem] font-extrabold">Sesiones registradas</h2></div>{loading ? <DoctorModuleLoading label="Cargando teleconsultas…" /> : error && sessions.length === 0 ? <DoctorModuleError message={error} /> : sessions.length === 0 ? <DoctorModuleEmpty message="Aún no hay teleconsultas programadas." /> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] border-collapse text-left"><caption className="sr-only">Teleconsultas registradas</caption><thead><tr className="border-b border-line bg-surface-subtle text-[0.55rem] font-extrabold text-ink-secondary"><th className="px-3 py-2.5 font-extrabold sm:px-4">Fecha</th><th className="px-3 py-2.5 font-extrabold">Paciente</th><th className="px-3 py-2.5 font-extrabold">Estado</th><th className="px-3 py-2.5 font-extrabold">Acción</th></tr></thead><tbody>{sessions.map((session) => { const next = nextStatus(session.status); return <tr className="border-b border-line last:border-0 hover:bg-surface-subtle" key={session.id}><td className="px-3 py-2.5 whitespace-nowrap text-[0.59rem] font-extrabold sm:px-4">{formatDate(session.scheduledAt)}</td><td className="px-3 py-2.5"><div className="flex items-center gap-2"><DoctorAvatar initials={initialsOf(session.patient.name)} tone={session.id % 2 === 0 ? "blue" : "violet"} size="sm" /><span className="whitespace-nowrap text-[0.61rem] font-extrabold">{session.patient.name ?? session.patient.patientCode}</span></div></td><td className="px-3 py-2.5"><StatusBadge tone={statusTone(session.status)}>{session.statusLabel}</StatusBadge></td><td className="px-3 py-2.5">{session.connection.joinable ? <button className="rounded-md bg-accent px-2 py-1.5 text-[0.56rem] font-extrabold text-white focus-visible:outline-3 focus-visible:outline-focus" type="button">Unirse</button> : next ? <button className="rounded-md border border-accent/20 px-2 py-1.5 text-[0.56rem] font-extrabold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus disabled:opacity-60" type="button" disabled={pending} onClick={() => void handleStatus(session)}>{next.label}</button> : <span className="text-[0.56rem] font-bold text-muted">Sin acciones</span>}</td></tr>; })}</tbody></table></div>}</DoctorCard>

        <DoctorCard className="p-4"><div className="flex items-center justify-between gap-3"><div><h2 className="text-[0.86rem] font-extrabold">Nueva teleconsulta</h2><p className="mt-1 text-[0.58rem] font-bold text-ink-secondary">El registro queda listo para conectar un proveedor aprobado.</p></div><Plus className="size-4 text-accent" aria-hidden="true" /></div><form className="mt-4 grid gap-3" onSubmit={(event) => void handleCreate(event)}><label className="grid gap-1 text-[0.6rem] font-bold text-ink-secondary">Paciente<select className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20 disabled:opacity-60" required value={form.patientId} onChange={(event) => setForm((current) => ({ ...current, patientId: event.target.value }))} disabled={pending || patients.length === 0}><option value="">Selecciona un paciente</option>{patients.map((patient) => <option key={patient.id} value={String(patient.id)}>{patient.name ?? patient.patientCode}</option>)}</select></label><label className="grid gap-1 text-[0.6rem] font-bold text-ink-secondary">Fecha y hora<input className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" type="datetime-local" required value={form.scheduledAt} onChange={(event) => setForm((current) => ({ ...current, scheduledAt: event.target.value }))} disabled={pending} /></label><label className="grid gap-1 text-[0.6rem] font-bold text-ink-secondary">Notas<textarea className="min-h-20 rounded-lg border border-line bg-surface-input px-2 py-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" maxLength={2000} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} disabled={pending} /></label><button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[0.62rem] font-extrabold text-white hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={pending || patients.length === 0}>{pending ? "Guardando…" : "Programar teleconsulta"}</button></form><div className="mt-4 rounded-lg border border-warning/30 bg-warning-soft p-3"><p className="text-[0.59rem] font-extrabold text-warning">Conexión no disponible</p><p className="mt-1 text-[0.56rem] font-bold text-ink-secondary">{meta.connection.message || "Configura un proveedor de video antes de habilitar el acceso."}</p></div></DoctorCard>
      </section>
    </div>
  );
}

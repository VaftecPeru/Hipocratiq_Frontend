"use client";

import { AlertTriangle, CheckCircle2, Clock3, FlaskConical, History, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  createDoctorLaboratoryOrder,
  getDoctorLaboratory,
  getDoctorPatients,
  updateDoctorLaboratoryStatus,
  type DoctorPatient,
  type LaboratoryOrder,
  type LaboratoryOrderMeta,
  type LaboratoryOrderStatus,
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

function statusTone(status: LaboratoryOrderStatus): "blue" | "green" | "orange" | "red" | "slate" {
  if (status === "ready" || status === "reviewed") return "green";
  if (status === "in_progress") return "orange";
  if (status === "canceled") return "red";
  return "blue";
}

function nextStatus(status: LaboratoryOrderStatus): { value: LaboratoryOrderStatus; label: string } | null {
  if (status === "requested") return { value: "in_progress", label: "Iniciar" };
  if (status === "in_progress") return { value: "ready", label: "Marcar listo" };
  if (status === "ready") return { value: "reviewed", label: "Marcar revisado" };
  return null;
}

type CountedLaboratoryStatus = "requested" | "in_progress" | "ready" | "reviewed";

function isCountedLaboratoryStatus(status: LaboratoryOrderStatus): status is CountedLaboratoryStatus {
  return status !== "canceled";
}

const EMPTY_META: LaboratoryOrderMeta = { total: 0, requested: 0, in_progress: 0, ready: 0, reviewed: 0, critical: 0 };

export default function DoctorLaboratoryPage() {
  const [orders, setOrders] = useState<LaboratoryOrder[]>([]);
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [meta, setMeta] = useState<LaboratoryOrderMeta>(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ patientId: "", studyName: "", priority: "normal" as "normal" | "urgent", notes: "" });

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getDoctorLaboratory(controller.signal), getDoctorPatients(controller.signal)])
      .then(([orderResult, patientList]) => {
        setOrders(orderResult.items);
        setMeta(orderResult.meta);
        setPatients(patientList);
        if (patientList[0]) setForm((current) => ({ ...current, patientId: String(patientList[0].id) }));
        setError(null);
      })
      .catch((caught: unknown) => {
        if (!(caught instanceof DOMException && caught.name === "AbortError")) setError(caught instanceof Error ? caught.message : "No pudimos cargar los estudios.");
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
      const created = await createDoctorLaboratoryOrder({ patient_profile_id: Number(form.patientId), study_name: form.studyName.trim(), priority: form.priority, notes: form.notes.trim() || null });
      setOrders((current) => [created, ...current]);
      setMeta((current) => ({ ...current, total: current.total + 1, requested: current.requested + 1 }));
      setForm((current) => ({ ...current, studyName: "", notes: "" }));
      setSuccess("Solicitud de laboratorio registrada correctamente.");
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "No pudimos registrar el estudio.");
    } finally {
      setPending(false);
    }
  }

  async function handleStatus(order: LaboratoryOrder): Promise<void> {
    const next = nextStatus(order.status);
    if (!next) return;
    setPending(true);
    setError(null);
    try {
      const updated = await updateDoctorLaboratoryStatus(order.id, next.value);
      setOrders((current) => current.map((item) => item.id === updated.id ? updated : item));
      setMeta((current) => {
        const nextMeta = { ...current };
        if (isCountedLaboratoryStatus(order.status)) nextMeta[order.status] = Math.max(0, nextMeta[order.status] - 1);
        if (isCountedLaboratoryStatus(next.value)) nextMeta[next.value] += 1;
        return nextMeta;
      });
      setSuccess("Estado del estudio actualizado.");
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "No pudimos actualizar el estudio.");
    } finally {
      setPending(false);
    }
  }

  const metrics = [
    { label: "Resultados pendientes", value: String(meta.requested + meta.in_progress), icon: FlaskConical, tone: "violet" as const },
    { label: "Críticos", value: String(meta.critical), icon: AlertTriangle, tone: "red" as const },
    { label: "Completados", value: String(meta.ready + meta.reviewed), icon: CheckCircle2, tone: "green" as const },
    { label: "En proceso", value: String(meta.in_progress), icon: Clock3, tone: "orange" as const },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.65rem]">Laboratorio</h1><p className="mt-1 text-[0.68rem] font-bold text-ink-secondary">Registra solicitudes y revisa resultados internos sin inventar estados de proveedores externos.</p></div><span className="inline-flex min-h-9 items-center gap-2 self-start rounded-lg border border-line bg-surface px-3 text-[0.62rem] font-extrabold text-ink-secondary sm:self-auto"><History className="size-3.5 text-accent" aria-hidden="true" />Flujo clínico interno</span></header>
      {error && orders.length > 0 ? <DoctorModuleAlert>{error}</DoctorModuleAlert> : null}
      {success ? <DoctorModuleAlert tone="success">{success}</DoctorModuleAlert> : null}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Resumen de laboratorio">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.85fr)]" aria-label="Gestión de laboratorio">
        <DoctorCard className="min-w-0 overflow-hidden"><div className="border-b border-line px-4 py-3 sm:px-5"><h2 className="text-[0.86rem] font-extrabold">Solicitudes y resultados</h2></div>{loading ? <DoctorModuleLoading label="Cargando laboratorio…" /> : error && orders.length === 0 ? <DoctorModuleError message={error} /> : orders.length === 0 ? <DoctorModuleEmpty message="Aún no hay solicitudes de laboratorio para tus pacientes." /> : <div className="overflow-x-auto"><table className="w-full min-w-[740px] border-collapse text-left"><caption className="sr-only">Solicitudes de laboratorio</caption><thead><tr className="border-b border-line bg-surface-subtle text-[0.55rem] font-extrabold text-ink-secondary"><th className="px-3 py-2.5 font-extrabold sm:px-4">Paciente</th><th className="px-3 py-2.5 font-extrabold">Estudio</th><th className="px-3 py-2.5 font-extrabold">Fecha</th><th className="px-3 py-2.5 font-extrabold">Estado</th><th className="px-3 py-2.5 font-extrabold">Acción</th></tr></thead><tbody>{orders.map((order) => { const next = nextStatus(order.status); return <tr className="border-b border-line last:border-0 hover:bg-surface-subtle" key={order.id}><td className="px-3 py-2.5 sm:px-4"><div className="flex items-center gap-2"><DoctorAvatar initials={initialsOf(order.patient.name)} tone={order.id % 2 === 0 ? "blue" : "orange"} size="sm" /><span className="whitespace-nowrap text-[0.61rem] font-extrabold">{order.patient.name ?? order.patient.patientCode}</span></div></td><td className="px-3 py-2.5"><p className="text-[0.6rem] font-extrabold">{order.studyName}</p><p className="mt-0.5 text-[0.55rem] font-bold text-ink-secondary">{order.priority === "urgent" ? "Prioridad urgente" : "Prioridad normal"}{order.isCritical ? " · Resultado crítico" : ""}</p></td><td className="px-3 py-2.5 whitespace-nowrap text-[0.58rem] font-bold text-ink-secondary">{formatDate(order.orderedAt)}</td><td className="px-3 py-2.5"><StatusBadge tone={statusTone(order.status)}>{order.statusLabel}</StatusBadge></td><td className="px-3 py-2.5">{next ? <button className="rounded-md border border-accent/20 px-2 py-1.5 text-[0.56rem] font-extrabold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus disabled:opacity-60" type="button" disabled={pending} onClick={() => void handleStatus(order)}>{next.label}</button> : <span className="text-[0.56rem] font-bold text-muted">Sin acciones</span>}</td></tr>; })}</tbody></table></div>}</DoctorCard>

        <DoctorCard className="p-4"><div className="flex items-center justify-between gap-3"><div><h2 className="text-[0.86rem] font-extrabold">Solicitar estudio</h2><p className="mt-1 text-[0.58rem] font-bold text-ink-secondary">La solicitud queda ligada al paciente y médico activos.</p></div><Plus className="size-4 text-accent" aria-hidden="true" /></div><form className="mt-4 grid gap-3" onSubmit={(event) => void handleCreate(event)}><label className="grid gap-1 text-[0.6rem] font-bold text-ink-secondary">Paciente<select className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20 disabled:opacity-60" required value={form.patientId} onChange={(event) => setForm((current) => ({ ...current, patientId: event.target.value }))} disabled={pending || patients.length === 0}><option value="">Selecciona un paciente</option>{patients.map((patient) => <option key={patient.id} value={String(patient.id)}>{patient.name ?? patient.patientCode}</option>)}</select></label><label className="grid gap-1 text-[0.6rem] font-bold text-ink-secondary">Estudio<input className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" required minLength={2} maxLength={180} value={form.studyName} onChange={(event) => setForm((current) => ({ ...current, studyName: event.target.value }))} disabled={pending} /></label><label className="grid gap-1 text-[0.6rem] font-bold text-ink-secondary">Prioridad<select className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as "normal" | "urgent" }))} disabled={pending}><option value="normal">Normal</option><option value="urgent">Urgente</option></select></label><label className="grid gap-1 text-[0.6rem] font-bold text-ink-secondary">Notas<textarea className="min-h-20 rounded-lg border border-line bg-surface-input px-2 py-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" maxLength={2000} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} disabled={pending} /></label><button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[0.62rem] font-extrabold text-white hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={pending || patients.length === 0}>{pending ? "Guardando…" : "Solicitar estudio"}</button>{patients.length === 0 && !loading ? <p className="text-[0.58rem] font-bold text-ink-secondary">Primero registra o vincula un paciente.</p> : null}</form></DoctorCard>
      </section>
    </div>
  );
}

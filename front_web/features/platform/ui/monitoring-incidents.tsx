"use client";

import { AlertTriangle, CheckCircle2, Plus, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSystemIncident, updateSystemIncident } from "@/features/platform/api/browser-incidents";
import type {
  SystemIncident,
  SystemIncidentSeverity,
  SystemIncidentStatus,
} from "@/features/platform/model/admin-dashboard.types";
import { CountryFlag } from "@/shared/ui/country-flag";
import { DataBadge, type BadgeTone } from "@/shared/ui/data-badge";
import { FilterSelect } from "@/shared/ui/filter-select";
import { Modal } from "@/shared/ui/modal";
import { ModalField, ModalPrimaryButton, ModalSecondaryButton, ModalTextarea } from "@/shared/ui/modal-parts";

const SEVERITY_LABELS: Record<SystemIncidentSeverity, string> = { minor: "Menor", major: "Mayor", critical: "Crítico" };
const SEVERITY_TONES: Record<SystemIncidentSeverity, BadgeTone> = { minor: "warning", major: "danger", critical: "dark" };
const STATUS_LABELS: Record<SystemIncidentStatus, string> = { investigating: "Investigando", identified: "Identificado", monitoring: "Monitoreando", resolved: "Resuelto" };
const STATUS_TONES: Record<SystemIncidentStatus, BadgeTone> = { investigating: "danger", identified: "warning", monitoring: "accent", resolved: "success" };
const SERVICE_LABELS: Record<string, string> = { api: "Aplicación API", database: "Base de datos", cache: "Caché", queue: "Cola de trabajos", storage: "Almacenamiento", platform: "Plataforma general" };
const dateTimeFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });

function allowedStatuses(status: SystemIncidentStatus): SystemIncidentStatus[] {
  const transitions: Record<SystemIncidentStatus, SystemIncidentStatus[]> = {
    investigating: ["investigating", "identified", "resolved"],
    identified: ["identified", "monitoring", "resolved"],
    monitoring: ["monitoring", "investigating", "resolved"],
    resolved: ["resolved", "investigating"],
  };
  return transitions[status];
}

export function MonitoringIncidents({ incidents }: { incidents: SystemIncident[] }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<SystemIncident | null>(null);

  return (
    <section className="mt-4 min-w-0 rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="incidents-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="flex items-center gap-1.5 text-sm font-extrabold" id="incidents-title"><ShieldAlert className="size-4 text-danger" aria-hidden="true" />Incidentes operativos</h2><p className="mt-0.5 text-2xs text-muted">Registro, seguimiento y resolución supervisada.</p></div>
        <button className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg bg-accent px-3 text-2xs font-bold text-white hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus" type="button" onClick={() => setCreateOpen(true)}><Plus className="size-3" aria-hidden="true" />Registrar incidente</button>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {incidents.map((incident) => (
          <article className={`rounded-xl border p-4 ${incident.status === "resolved" ? "border-line bg-surface-subtle/45" : incident.severity === "critical" ? "border-danger/35 bg-danger-soft/25" : "border-line"}`} key={incident.id}>
            <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><p className="text-2xs font-bold text-muted">INC-{String(incident.id).padStart(4, "0")} · {incident.serviceKey ? SERVICE_LABELS[incident.serviceKey] ?? incident.serviceKey : "Plataforma"}</p><h3 className="mt-1 break-words text-xs font-extrabold">{incident.title}</h3></div><div className="flex flex-wrap justify-end gap-1.5"><DataBadge tone={SEVERITY_TONES[incident.severity]}>{SEVERITY_LABELS[incident.severity]}</DataBadge><DataBadge tone={STATUS_TONES[incident.status]}>{STATUS_LABELS[incident.status]}</DataBadge></div></div>
            <p className="mt-2 line-clamp-2 text-2xs leading-5 text-muted">{incident.description}</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3"><p className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 break-words text-2xs text-muted">{incident.countryCode ? <CountryFlag countryCode={incident.countryCode} /> : null}{incident.createdBy ?? "Sistema"} · {dateTimeFormatter.format(new Date(incident.startedAt))}</p><button className="min-h-7 shrink-0 rounded-lg border border-line px-2.5 text-2xs font-bold text-ink hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" onClick={() => setSelectedIncident(incident)}>{incident.status === "resolved" ? "Reabrir" : "Actualizar"}</button></div>
          </article>
        ))}
        {incidents.length === 0 ? <p className="col-span-full rounded-xl border border-dashed border-line py-10 text-center text-xs text-muted"><CheckCircle2 className="mx-auto mb-2 size-5 text-success" aria-hidden="true" />No hay incidentes registrados.</p> : null}
      </div>
      <CreateIncidentModal key={createOpen ? "incident-create-open" : "incident-create-closed"} isOpen={createOpen} onClose={() => setCreateOpen(false)} onSaved={() => router.refresh()} />
      <UpdateIncidentModal key={selectedIncident?.id ?? "no-incident"} incident={selectedIncident} onClose={() => setSelectedIncident(null)} onSaved={() => router.refresh()} />
    </section>
  );
}

function CreateIncidentModal({ isOpen, onClose, onSaved }: { isOpen: boolean; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<SystemIncidentSeverity>("major");
  const [serviceKey, setServiceKey] = useState("platform");
  const [countryCode, setCountryCode] = useState("global");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    if (isSaving || title.trim().length < 4 || description.trim().length < 10) return;
    setIsSaving(true); setError(null);
    try {
      await createSystemIncident({ title: title.trim(), description: description.trim(), severity, serviceKey, countryCode: countryCode === "global" ? null : countryCode });
      onSaved(); onClose();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "No pudimos registrar el incidente."); }
    finally { setIsSaving(false); }
  }

  return <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Registrar incidente" description="Abre un seguimiento operativo auditable" footer={<><ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton><ModalPrimaryButton disabled={isSaving || title.trim().length < 4 || description.trim().length < 10} onClick={save}>{isSaving ? "Registrando..." : "Registrar incidente"}</ModalPrimaryButton></>}><div className="space-y-4"><ModalField id="incident-title" label="Título" value={title} onChange={(event) => setTitle(event.target.value)} required /><ModalTextarea id="incident-description" label="Descripción" rows={5} value={description} onChange={(event) => setDescription(event.target.value)} required /><div className="grid gap-3 sm:grid-cols-3"><FilterSelect label="Severidad" options={Object.entries(SEVERITY_LABELS).map(([value, label]) => ({ value, label }))} value={severity} onChange={(value) => setSeverity(value as SystemIncidentSeverity)} density="form" surface="input" required /><FilterSelect label="Servicio afectado" options={Object.entries(SERVICE_LABELS).map(([value, label]) => ({ value, label }))} value={serviceKey} onChange={setServiceKey} density="form" surface="input" required /><FilterSelect label="Alcance" options={[{ value: "global", label: "Global" }, { value: "MX", label: "México" }, { value: "PE", label: "Perú" }, { value: "US", label: "Estados Unidos" }]} value={countryCode} onChange={setCountryCode} density="form" surface="input" required /></div>{error ? <p className="rounded-lg border border-danger/25 bg-danger-soft p-3 text-xs text-danger" role="alert">{error}</p> : null}</div></Modal>;
}

function UpdateIncidentModal({ incident, onClose, onSaved }: { incident: SystemIncident | null; onClose: () => void; onSaved: () => void }) {
  const [status, setStatus] = useState<SystemIncidentStatus>(incident?.status ?? "investigating");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  if (!incident) return null;
  const activeIncident = incident;

  async function save() {
    if (isSaving) return;
    setIsSaving(true); setError(null);
    try { await updateSystemIncident(activeIncident.id, status, note.trim() || null); onSaved(); onClose(); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "No pudimos actualizar el incidente."); }
    finally { setIsSaving(false); }
  }

  return <Modal isOpen onClose={onClose} size="md" title="Actualizar incidente" description={`INC-${String(incident.id).padStart(4, "0")} · ${incident.title}`} footer={<><ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton><ModalPrimaryButton disabled={isSaving} onClick={save}>{isSaving ? "Guardando..." : "Guardar estado"}</ModalPrimaryButton></>}><div className="space-y-4"><FilterSelect label="Estado operativo" options={allowedStatuses(incident.status).map((value) => ({ value, label: STATUS_LABELS[value] }))} value={status} onChange={setStatus} density="form" surface="input" required /><ModalTextarea id="incident-note" label="Nota de seguimiento" rows={4} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Hallazgos, mitigación o causa raíz..." /><p className="flex gap-2 rounded-lg bg-surface-subtle p-3 text-2xs leading-5 text-muted"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />Cada transición queda registrada en Auditoría global. Al resolver se guarda fecha y responsable.</p>{error ? <p className="rounded-lg border border-danger/25 bg-danger-soft p-3 text-xs text-danger" role="alert">{error}</p> : null}</div></Modal>;
}

"use client";

import { Building2, ClipboardList, Save, Send, ShieldAlert, Workflow } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { publishEmergencyPolicy, updateEmergencyPolicy } from "@/features/platform/api/browser-emergency";
import type { EmergencyPolicy, EmergencyPolicyData } from "@/features/platform/model/emergency.types";
import { FilterSelect } from "@/shared/ui/filter-select";
import { Modal } from "@/shared/ui/modal";
import { ModalField, ModalPrimaryButton, ModalSecondaryButton } from "@/shared/ui/modal-parts";

const fieldClass = "h-10 w-full rounded-lg border border-line bg-surface px-3 text-xs text-ink outline-none focus:border-accent focus:ring-3 focus:ring-focus/40";
const dateFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });
let responsibleKeyCounter = 0;

function newResponsibleKey(): string {
  responsibleKeyCounter += 1;
  return `global-responsible-${responsibleKeyCounter}`;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

export function EmergencyPolicyView({ initialData }: { initialData: EmergencyPolicyData }) {
  const [data, setData] = useState(initialData);
  const [policy, setPolicy] = useState(initialData.policy);
  const [responsibles, setResponsibles] = useState(initialData.responsibles);
  const [responsibleRowKeys, setResponsibleRowKeys] = useState<string[]>(() => initialData.responsibles.map(() => newResponsibleKey()));
  const [publishOpen, setPublishOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function updatePolicy<K extends keyof EmergencyPolicy>(key: K, value: EmergencyPolicy[K]) {
    setPolicy((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const updated = await updateEmergencyPolicy(policy, responsibles);
      setData(updated);
      setPolicy(updated.policy);
      setResponsibles(updated.responsibles);
      setResponsibleRowKeys(updated.responsibles.map(() => newResponsibleKey()));
      setNotice("Política guardada y registrada en auditoría.");
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos guardar la política.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-2xs font-extrabold tracking-[0.14em] text-danger uppercase">Configuración SaaS</p>
          <h1 className="mt-1 text-[clamp(1.3rem,1.8vw,1.6rem)] font-extrabold">Botón de Emergencia</h1>
          <p className="mt-1 max-w-3xl text-xs text-muted">Política global persistente para todos los países; las publicaciones críticas quedan auditadas.</p>
        </div>
        <div className="flex gap-2">
          <Link className="flex min-h-11 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-bold sm:min-h-9" href="/audit"><ClipboardList className="size-3.5" aria-hidden="true" />Auditoría</Link>
          <button className="flex min-h-11 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-9" type="button" disabled={saving} onClick={() => setPublishOpen(true)}><Send className="size-3.5" aria-hidden="true" />Publicar política</button>
        </div>
      </div>

      <section className="mt-4 grid gap-3 sm:grid-cols-3" aria-label="Indicadores de emergencia">
        <Stat label="Clínicas activas" value={data.stats.activeClinics} icon={Building2} />
        <Stat label="Política habilitada" value={data.stats.enabledClinics} icon={ShieldAlert} />
        <Stat label="Cambios hoy" value={data.stats.policyChangesToday} icon={Workflow} />
      </section>

      <section className="mt-4 rounded-xl border border-danger/25 bg-danger-soft/60 p-4" aria-labelledby="emergency-publication-title" role="status">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div><h2 className="text-sm font-extrabold text-danger" id="emergency-publication-title">Última publicación global</h2><p className="mt-1 text-2xs text-ink">Toda publicación activa reemplaza temporalmente la configuración local en todas las clínicas.</p></div>
          <span className="w-fit rounded-full bg-danger px-2.5 py-1 text-2xs font-extrabold text-white">{data.publication ? "Override activo" : "Sin publicación"}</span>
        </div>
        {data.publication ? <dl className="mt-3 grid gap-2 text-2xs sm:grid-cols-3"><div><dt className="font-bold text-muted">Alcance</dt><dd className="mt-0.5 font-extrabold">Todas las clínicas</dd></div><div><dt className="font-bold text-muted">Publicada</dt><dd className="mt-0.5 font-extrabold">{formatDate(data.publication.publishedAt)}</dd></div><div><dt className="font-bold text-muted">Responsables</dt><dd className="mt-0.5 font-extrabold">{data.publication.responsibles.length} configurados</dd></div></dl> : <p className="mt-3 text-2xs font-semibold text-muted">Guarda una política y publícala para activar el override global.</p>}
      </section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="text-sm font-extrabold">Política global</h2><p className="mt-0.5 text-2xs text-muted">Configuración efectiva en backend</p></div>
            <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={policy.enabled} onChange={(event) => updatePolicy("enabled", event.target.checked)} />Habilitada</label>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ModalField id="global-emergency-label" label="Etiqueta del botón" value={policy.label} onChange={(event) => updatePolicy("label", event.target.value)} maxLength={60} />
            <Select label="Visibilidad" value={policy.visibility} onChange={(value) => updatePolicy("visibility", value as EmergencyPolicy["visibility"])} options={[["reception_doctors_admins", "Recepción, médicos y administradores"], ["doctors_admins", "Médicos y administradores"], ["admins_only", "Solo administradores"]]} />
            <Select label="Color" value={policy.color} onChange={(value) => updatePolicy("color", value as EmergencyPolicy["color"])} options={[["#EF2F3F", "Rojo emergencia"], ["#F97316", "Naranja alerta"], ["#7C3AED", "Violeta crítico"]]} />
            <Select label="Herencia" value={policy.inheritance} onChange={(value) => updatePolicy("inheritance", value as EmergencyPolicy["inheritance"])} options={[["workflow_and_responsibles", "Flujo y responsables editables"], ["responsibles_only", "Solo responsables editables"], ["locked", "Política bloqueada"]]} />
            <Select label="Canal predeterminado" value={policy.defaultChannel} onChange={(value) => updatePolicy("defaultChannel", value as EmergencyPolicy["defaultChannel"])} options={[["priority_push", "Push prioritario"], ["internal_alert", "Alerta interna"], ["email", "Correo"], ["sms", "SMS"]]} />
            <Select label="Escalar tras" value={String(policy.escalationMinutes)} onChange={(value) => updatePolicy("escalationMinutes", Number(value) as EmergencyPolicy["escalationMinutes"])} options={[["1", "1 minuto"], ["3", "3 minutos"], ["5", "5 minutos"], ["10", "10 minutos"]]} />
          </div>
        </article>

        <article className="rounded-xl border border-line bg-surface p-4">
          <h2 className="text-sm font-extrabold">Responsables predeterminados</h2>
          <p className="mt-0.5 text-2xs text-muted">Plantilla para clínicas nuevas</p>
          <div className="mt-4 grid gap-3">
            {responsibles.map((responsible, index) => (
              <div className="grid gap-2 rounded-lg border border-line p-3 sm:grid-cols-2" key={responsibleRowKeys[index] ?? responsible.role}>
                <label className="grid gap-1 text-2xs font-bold text-muted" htmlFor={`global-emergency-role-${responsibleRowKeys[index] ?? index}`}>Rol<input id={`global-emergency-role-${responsibleRowKeys[index] ?? index}`} className={fieldClass} value={responsible.role} onChange={(event) => setResponsibles((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, role: event.target.value } : item))} /></label>
                <label className="grid gap-1 text-2xs font-bold text-muted" htmlFor={`global-emergency-channel-${responsibleRowKeys[index] ?? index}`}>Canal / acción<input id={`global-emergency-channel-${responsibleRowKeys[index] ?? index}`} className={fieldClass} value={responsible.channel} onChange={(event) => setResponsibles((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, channel: event.target.value } : item))} /></label>
              </div>
            ))}
          </div>
        </article>
      </section>

      {error ? <p className="mt-3 rounded-lg bg-danger-soft p-3 text-xs text-danger" role="alert">{error}</p> : null}
      {notice ? <p className="mt-3 rounded-lg bg-success-soft p-3 text-xs text-success" role="status">{notice}</p> : null}
      <div className="mt-4 flex justify-end"><button className="flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10" type="button" disabled={saving} onClick={() => void save()}><Save className="size-4" aria-hidden="true" />{saving ? "Guardando..." : "Guardar cambios"}</button></div>
      <PublishModal isOpen={publishOpen} onClose={() => setPublishOpen(false)} onPublished={(affected, publishedAt, note) => { setData((current) => ({ ...current, publishedAt, publication: { scope: "all", force: true, note: note || null, publishedAt, publishedBy: null, policy: current.policy, responsibles: current.responsibles } })); setNotice(`Política publicada para ${affected} clínicas.`); }} />
    </>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Building2 }) {
  return <article className="rounded-xl border border-line bg-surface p-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-accent-soft text-accent"><Icon className="size-4" aria-hidden="true" /></span><div><p className="text-2xs font-bold text-muted">{label}</p><p className="font-mono text-xl font-bold">{value}</p></div></div></article>;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[][]; onChange: (value: string) => void }) {
  return <FilterSelect label={label} value={value} options={options.map(([option, text]) => ({ value: option, label: text }))} onChange={onChange} density="form" />;
}

function PublishModal({ isOpen, onClose, onPublished }: { isOpen: boolean; onClose: () => void; onPublished: (affected: number, publishedAt: string, note: string) => void }) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function publish() {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const result = await publishEmergencyPolicy({ note });
      onPublished(result.affectedClinics, result.publishedAt, note);
      setNote("");
      onClose();
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos publicar la política.");
    } finally {
      setLoading(false);
    }
  }

  return <Modal isOpen={isOpen} onClose={() => { if (!loading) onClose(); }} size="md" title="Publicar política global" description="Registra una versión obligatoria para todas las clínicas" footer={<><ModalSecondaryButton onClick={onClose} disabled={loading}>Cancelar</ModalSecondaryButton><ModalPrimaryButton onClick={() => void publish()} disabled={loading}>{loading ? "Publicando..." : "Publicar para todas"}</ModalPrimaryButton></>}><div className="space-y-4"><p className="rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-xs font-semibold text-danger" role="note">Esta publicación reemplaza temporalmente la política local de todas las clínicas. El alcance no puede limitarse por país.</p><ModalField id="publish-note" label="Nota de versión" value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} />{error ? <p className="rounded-lg bg-danger-soft p-3 text-xs text-danger" role="alert">{error}</p> : null}</div></Modal>;
}

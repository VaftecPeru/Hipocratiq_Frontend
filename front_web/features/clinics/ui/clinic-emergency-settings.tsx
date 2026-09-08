"use client";

import { AlertTriangle, ArrowLeft, CheckCircle2, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getClinicSettings, updateClinicSettings } from "@/features/clinics/api/browser-clinic-dashboard";
import type { ClinicAdminInfo, ClinicEmergencyPolicy } from "@/features/clinics/model/clinic-admin.types";
import { FilterSelect } from "@/shared/ui/filter-select";
import { Notice, SectionCard, Toggle, useNotice } from "./clinic-admin-primitives";

const DEFAULT_LOCAL_POLICY: ClinicEmergencyPolicy = {
  enabled: true,
  visibility: "reception_doctors_admins",
  label: "Emergencia",
  color: "#EF2F3F",
  inheritance: "workflow_and_responsibles",
  defaultChannel: "priority_push",
  escalationMinutes: 3,
  responsibles: [
    { role: "Recepción central", channel: "WhatsApp + alerta interna" },
    { role: "Jefe de guardia", channel: "Push + correo prioritario" },
    { role: "Equipo médico de turno", channel: "Asignación automática" },
  ],
};

const VISIBILITY_OPTIONS = [
  { value: "reception_doctors_admins", label: "Recepción, médicos y administrador clínico" },
  { value: "doctors_admins", label: "Médicos y administrador clínico" },
  { value: "admins_only", label: "Solo administrador clínico" },
] as const;

const COLORS = [
  { label: "Rojo emergencia", value: "#EF2F3F", className: "bg-[#ef3340]" },
  { label: "Naranja alerta", value: "#F97316", className: "bg-[#f58a0b]" },
  { label: "Violeta crítico", value: "#7C3AED", className: "bg-violet" },
] as const;

const fieldClass = "h-11 w-full rounded-lg border border-line bg-surface-input px-3 text-xs font-semibold text-ink outline-none focus:border-accent focus:ring-3 focus:ring-focus/20 md:h-10";
const dateFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });
let responsibleKeyCounter = 0;

function newResponsibleKey(): string {
  responsibleKeyCounter += 1;
  return `responsible-${responsibleKeyCounter}`;
}

function responsibleKeys(count: number): string[] {
  return Array.from({ length: count }, () => newResponsibleKey());
}

function clonePolicy(policy: ClinicEmergencyPolicy): ClinicEmergencyPolicy {
  return { ...policy, responsibles: policy.responsibles.map((responsible) => ({ ...responsible })) };
}

function visibilityLabel(value: ClinicEmergencyPolicy["visibility"]): string {
  return VISIBILITY_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function channelLabel(value: ClinicEmergencyPolicy["defaultChannel"]): string {
  return {
    priority_push: "Push prioritario",
    internal_alert: "Alerta interna",
    email: "Correo",
    sms: "SMS",
  }[value];
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function EmergencySkeleton() {
  return (
    <div className="mx-auto w-full max-w-[100rem] animate-pulse px-4 py-5 sm:px-6 lg:px-7" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando configuración de emergencia</span>
      <div className="h-3 w-36 rounded bg-danger-soft" />
      <div className="mt-2 h-8 w-64 rounded-lg bg-line/70" />
      <div className="mt-2 h-3.5 w-96 max-w-full rounded bg-line/40" />
      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
        {Array.from({ length: 2 }, (_, index) => (
          <div className="rounded-xl border border-line bg-surface p-5" key={index}>
            <div className="h-4 w-44 rounded bg-line/60" />
            <div className="mt-4 h-11 rounded-lg bg-surface-subtle" />
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, field) => <div className="h-11 rounded-lg bg-surface-subtle" key={field} />)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 h-36 rounded-xl border border-line bg-surface" />
    </div>
  );
}

export function ClinicEmergencySettings() {
  const [settings, setSettings] = useState<ClinicAdminInfo | null>(null);
  const [policy, setPolicy] = useState<ClinicEmergencyPolicy>(() => clonePolicy(DEFAULT_LOCAL_POLICY));
  const [responsibleRowKeys, setResponsibleRowKeys] = useState<string[]>(() => responsibleKeys(DEFAULT_LOCAL_POLICY.responsibles.length));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notice, showNotice } = useNotice();

  useEffect(() => {
    const controller = new AbortController();
    getClinicSettings(controller.signal)
      .then((clinic) => {
        setSettings(clinic);
        setPolicy(clonePolicy(clinic.emergency.local));
        setResponsibleRowKeys(responsibleKeys(clinic.emergency.local.responsibles.length));
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(requestError instanceof Error ? requestError.message : "No pudimos cargar la configuración de emergencia.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  function updatePolicy<K extends keyof ClinicEmergencyPolicy>(key: K, value: ClinicEmergencyPolicy[K]) {
    setPolicy((current) => ({ ...current, [key]: value }));
  }

  function updateResponsible(index: number, key: "role" | "channel", value: string) {
    setPolicy((current) => ({
      ...current,
      responsibles: current.responsibles.map((responsible, responsibleIndex) => responsibleIndex === index ? { ...responsible, [key]: value } : responsible),
    }));
  }

  function addResponsible() {
    setPolicy((current) => ({ ...current, responsibles: [...current.responsibles, { role: "", channel: "" }] }));
    setResponsibleRowKeys((current) => [...current, newResponsibleKey()]);
  }

  function removeResponsible(index: number) {
    setPolicy((current) => current.responsibles.length <= 1
      ? current
      : { ...current, responsibles: current.responsibles.filter((_, responsibleIndex) => responsibleIndex !== index) });
    setResponsibleRowKeys((current) => current.filter((_, responsibleIndex) => responsibleIndex !== index));
  }

  function restoreLocalFlow() {
    setPolicy(clonePolicy(DEFAULT_LOCAL_POLICY));
    setResponsibleRowKeys(responsibleKeys(DEFAULT_LOCAL_POLICY.responsibles.length));
    showNotice("Flujo local restaurado. Guarda los cambios para aplicarlo.");
  }

  async function saveChanges() {
    if (isSaving || !settings) return;
    if (policy.responsibles.some((responsible) => !responsible.role.trim() || !responsible.channel.trim())) {
      setError("Completa el rol y el canal de cada responsable antes de guardar.");
      return;
    }
    setIsSaving(true);
    setError(null);

    try {
      const updated = await updateClinicSettings({
        preferences: { ...settings.preferences, emergency: clonePolicy(policy) },
      });
      setSettings(updated);
      setPolicy(clonePolicy(updated.emergency.local));
      setResponsibleRowKeys(responsibleKeys(updated.emergency.local.responsibles.length));
      showNotice("Configuración de emergencia guardada y auditada.");
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos guardar la configuración de emergencia.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <EmergencySkeleton />;

  if (!settings) {
    return (
      <main className="mx-auto grid min-h-[52vh] max-w-2xl place-items-center px-4" aria-live="polite">
        <section className="w-full rounded-xl border border-danger/25 bg-surface p-6 text-center" role="alert">
          <AlertTriangle className="mx-auto size-7 text-danger" aria-hidden="true" />
          <h1 className="mt-3 text-lg font-extrabold">Configuración no disponible</h1>
          <p className="mt-2 text-sm text-muted">{error ?? "No encontramos la configuración de emergencia de esta clínica."}</p>
        </section>
      </main>
    );
  }

  const effective = settings.emergency.effective;
  const isOverridden = settings.emergency.isOverridden;

  return (
    <div className="mx-auto w-full max-w-[100rem] px-4 py-5 sm:px-6 lg:px-7">
      <Notice message={notice} />
      <Link className="mb-3 inline-flex min-h-11 items-center gap-1 text-xs font-bold text-accent sm:min-h-8" href="/clinic/configuracion"><ArrowLeft className="size-3.5" aria-hidden="true" />Volver a configuración</Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-2xs font-extrabold tracking-[0.14em] text-danger uppercase">Configuración clínica</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Botón de Emergencia</h1>
          <p className="mt-1 max-w-2xl text-xs text-muted">Configura la versión local y consulta la política efectiva que recibe esta clínica.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-extrabold sm:min-h-9" type="button" onClick={restoreLocalFlow} disabled={isSaving}><RotateCcw className="size-3.5" aria-hidden="true" />Restaurar flujo</button>
          <button className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-9" type="button" onClick={() => void saveChanges()} disabled={isSaving}><Save className="size-3.5" aria-hidden="true" />{isSaving ? "Guardando..." : "Guardar cambios"}</button>
        </div>
      </header>

      {error ? <p className="mt-4 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-xs font-semibold text-danger" role="alert">{error}</p> : null}

      {isOverridden ? (
        <section className="mt-4 rounded-xl border border-danger/30 bg-danger-soft/60 p-4" role="status" aria-live="polite">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-extrabold text-danger">Override global activo</h2>
              <p className="mt-1 text-xs leading-5 text-ink">Superadmin publicó una política obligatoria para todas las clínicas. Tu configuración local queda guardada como borrador, pero no modifica el comportamiento efectivo mientras el override esté activo.</p>
              <p className="mt-2 text-2xs font-bold text-danger">Publicada {formatDate(settings.emergency.globalOverride?.publishedAt ?? null)}{settings.emergency.globalOverride?.note ? ` · ${settings.emergency.globalOverride.note}` : ""}</p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="mt-5 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
        <SectionCard className="overflow-hidden" labelledBy="clinic-emergency-local-title">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div><h2 className="text-sm font-extrabold" id="clinic-emergency-local-title">Configuración local</h2><p className="text-2xs text-muted">Borrador editable de esta clínica</p></div>
            <span className={`rounded-full px-3 py-1 text-2xs font-bold ${policy.enabled ? "bg-success-soft text-success" : "bg-surface-subtle text-muted"}`}>{policy.enabled ? "Activo" : "Inactivo"}</span>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-input p-4">
              <div className="min-w-0 flex-1"><p className="text-xs font-extrabold">Activar botón de emergencia</p><p className="mt-1 text-2xs text-muted">Disponible según visibilidad y roles configurados.</p></div>
              <Toggle checked={policy.enabled} onChange={(checked) => updatePolicy("enabled", checked)} label="Activar botón de emergencia en la configuración local" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <FilterSelect label="Visibilidad" value={policy.visibility} options={VISIBILITY_OPTIONS} onChange={(value) => updatePolicy("visibility", value as ClinicEmergencyPolicy["visibility"])} density="form" surface="input" />
              <label className="grid gap-1.5 text-2xs font-bold text-muted" htmlFor="clinic-emergency-label"><span>Etiqueta del botón</span><input className={fieldClass} id="clinic-emergency-label" value={policy.label} onChange={(event) => updatePolicy("label", event.target.value)} maxLength={60} /></label>
            </div>
            <fieldset className="mt-4"><legend className="text-2xs font-bold text-muted">Color</legend><div className="mt-2 grid grid-cols-1 gap-2 min-[26rem]:grid-cols-3">{COLORS.map((color) => <button className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 text-left text-2xs font-bold ${policy.color === color.value ? "border-accent bg-accent-soft" : "border-line"}`} type="button" key={color.value} aria-pressed={policy.color === color.value} aria-label={`Usar color ${color.label}`} onClick={() => updatePolicy("color", color.value)}><span className={`size-6 shrink-0 rounded-lg ${color.className}`} aria-hidden="true" />{color.label}</button>)}</div></fieldset>
          </div>
        </SectionCard>

        <SectionCard className="overflow-hidden" labelledBy="clinic-emergency-effective-title">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4"><div><h2 className="text-sm font-extrabold" id="clinic-emergency-effective-title">Política efectiva</h2><p className="text-2xs text-muted">La configuración que aplica ahora</p></div><span className={`rounded-full px-3 py-1 text-2xs font-bold ${isOverridden ? "bg-danger-soft text-danger" : "bg-success-soft text-success"}`}>{isOverridden ? "Global obligatoria" : "Local"}</span></div>
          <dl className="grid gap-3 p-5 text-xs"><div className="flex items-start justify-between gap-3"><dt className="text-2xs font-bold text-muted">Estado</dt><dd className="font-extrabold">{effective.enabled ? "Activo" : "Inactivo"}</dd></div><div className="flex items-start justify-between gap-3"><dt className="text-2xs font-bold text-muted">Visibilidad</dt><dd className="max-w-[65%] text-right font-semibold">{visibilityLabel(effective.visibility)}</dd></div><div className="flex items-center justify-between gap-3"><dt className="text-2xs font-bold text-muted">Canal predeterminado</dt><dd className="font-semibold">{channelLabel(effective.defaultChannel)}</dd></div><div className="flex items-center justify-between gap-3"><dt className="text-2xs font-bold text-muted">Escalamiento</dt><dd className="font-semibold">{effective.escalationMinutes} min</dd></div></dl>
          <div className="border-t border-line px-5 py-4"><h3 className="text-2xs font-extrabold text-muted">Responsables efectivos</h3><ul className="mt-2 grid gap-2">{effective.responsibles.map((responsible) => <li className="flex items-start gap-2 rounded-lg border border-line bg-surface-input p-2.5 text-2xs" key={`${responsible.role}-${responsible.channel}`}><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden="true" /><span className="min-w-0"><span className="block font-bold">{responsible.role}</span><span className="mt-0.5 block text-muted">{responsible.channel}</span></span></li>)}{effective.responsibles.length === 0 ? <li className="rounded-lg border border-dashed border-line p-4 text-center text-2xs text-muted">No hay responsables configurados.</li> : null}</ul></div>
        </SectionCard>
      </div>

      <SectionCard className="mt-4 overflow-hidden" labelledBy="clinic-emergency-responsibles-title">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4"><div><h2 className="text-sm font-extrabold" id="clinic-emergency-responsibles-title">Responsables locales</h2><p className="text-2xs text-muted">Se guardan como borrador y vuelven a aplicar cuando no exista un override global.</p></div><button className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-line px-3 text-2xs font-bold text-accent sm:min-h-9" type="button" onClick={addResponsible}><Plus className="size-3.5" aria-hidden="true" />Agregar</button></div>
         <div className="grid gap-2 p-5">{policy.responsibles.map((responsible, index) => <div className="grid gap-2 rounded-xl border border-line bg-surface-input p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end" key={responsibleRowKeys[index] ?? responsible.role}><label className="grid gap-1 text-2xs font-bold text-muted" htmlFor={`clinic-responsible-role-${responsibleRowKeys[index] ?? index}`}><span>Rol</span><input className={fieldClass} id={`clinic-responsible-role-${responsibleRowKeys[index] ?? index}`} value={responsible.role} onChange={(event) => updateResponsible(index, "role", event.target.value)} maxLength={100} /></label><label className="grid gap-1 text-2xs font-bold text-muted" htmlFor={`clinic-responsible-channel-${responsibleRowKeys[index] ?? index}`}><span>Canal / acción</span><input className={fieldClass} id={`clinic-responsible-channel-${responsibleRowKeys[index] ?? index}`} value={responsible.channel} onChange={(event) => updateResponsible(index, "channel", event.target.value)} maxLength={160} /></label><button className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-line text-danger hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-10" type="button" aria-label={`Eliminar responsable ${responsible.role || index + 1}`} disabled={policy.responsibles.length <= 1} onClick={() => removeResponsible(index)}><Trash2 className="size-4" aria-hidden="true" /></button></div>)}{policy.responsibles.length === 0 ? <p className="rounded-lg border border-dashed border-line p-5 text-center text-xs text-muted">Agrega al menos un responsable para guardar la configuración.</p> : null}</div>
      </SectionCard>

      <SectionCard className="mt-4 overflow-hidden" labelledBy="clinic-emergency-flow-title">
        <div className="border-b border-line px-5 py-4"><h2 className="text-sm font-extrabold" id="clinic-emergency-flow-title">Flujo efectivo de atención</h2><p className="mt-1 text-2xs text-muted">Resumen generado a partir de la política real recibida por la clínica.</p></div>
        <ol className="grid gap-2 p-5 sm:grid-cols-2 xl:grid-cols-5">{[["Activación", effective.enabled ? `Botón visible para ${visibilityLabel(effective.visibility).toLowerCase()}.` : "El botón está desactivado."], ["Registro rápido", "Datos mínimos del paciente y motivo."], ["Triaje", `Prioridad por color ${effective.color}.`], ["Notificación", `${channelLabel(effective.defaultChannel)} para los responsables efectivos.`], ["Escalamiento", `Escala después de ${effective.escalationMinutes} minutos.`]].map(([title, description], index) => <li className={`rounded-xl border p-4 ${index === 0 && effective.enabled ? "border-danger/20 bg-danger-soft" : "border-line bg-surface-input"}`} key={title}><span className="grid size-7 place-items-center rounded-lg bg-surface font-mono text-2xs font-bold text-accent">{index + 1}</span><h3 className="mt-4 text-2xs font-extrabold">{title}</h3><p className="mt-1 text-2xs leading-4 text-muted">{description}</p></li>)}</ol>
      </SectionCard>
    </div>
  );
}

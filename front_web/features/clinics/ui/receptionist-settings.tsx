"use client";

import { Bell, CalendarDays, ChevronRight, Printer, Save, ShieldCheck, SlidersHorizontal, UserRound } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { getClinicReceptionistSettings, updateClinicReceptionistSettings } from "@/features/clinics/api/browser-clinic-dashboard";
import type { ClinicReceptionistPreferences, ClinicReceptionistSettings as ReceptionistSettingsData } from "@/features/clinics/model/clinic-admin.types";
import { ClinicModuleLoading } from "@/shared/ui/clinic-module-loading";
import { Notice, SectionCard, Toggle, useNotice } from "./clinic-admin-primitives";

type ReceptionistSettingsProps = Readonly<{
  userName: string;
  email: string | null;
  phoneNumber: string;
  clinicName: string;
}>;

type BooleanPreferenceKey = "newAppointments" | "arrivals" | "pendingPayments" | "internalMessages" | "documents" | "onlineReception" | "whatsapp" | "autoPrint" | "duplicateTickets";

function SettingsRow({ label, value, children }: Readonly<{ label: string; value?: string; children?: ReactNode }>) {
  return <div className="flex items-center gap-3 border-b border-line py-3 last:border-0"><span className="flex-1 text-[0.6rem] font-semibold text-ink-secondary">{label}</span>{value ? <strong className="text-right text-[0.6rem] font-extrabold text-ink">{value}</strong> : null}{children}</div>;
}

function SettingInput({ label, value, onChange, type = "text", placeholder }: Readonly<{ label: string; value: string; onChange: (value: string) => void; type?: "text" | "time"; placeholder?: string }>) {
  return <label className="grid gap-1.5"><span className="text-[0.54rem] font-bold text-muted">{label}</span><input className="h-9 rounded-lg border border-line bg-surface-input px-3 text-[0.6rem] font-semibold outline-none focus:border-accent focus:ring-3 focus:ring-focus/20" type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

function formatHours(preferences: ClinicReceptionistPreferences): string {
  if (!preferences.shiftStart || !preferences.shiftEnd) return "No configurado";
  return `${preferences.shiftStart} - ${preferences.shiftEnd}`;
}

function formatStatus(status: string | null): string {
  if (status === "not_configured") return "No configurado";
  if (status === "active") return "Activo";
  if (status === "suspended") return "Suspendido";
  if (status === "disabled") return "Deshabilitado";
  if (status === "pending_verification") return "Pendiente de verificación";
  return "No disponible";
}

export function ReceptionistSettings({ userName, email, phoneNumber, clinicName }: ReceptionistSettingsProps) {
  const [data, setData] = useState<ReceptionistSettingsData | null>(null);
  const [preferences, setPreferences] = useState<ClinicReceptionistPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { notice, showNotice } = useNotice();

  useEffect(() => {
    const controller = new AbortController();
    getClinicReceptionistSettings(controller.signal)
      .then((settings) => {
        setData(settings);
        setPreferences(settings.settings.preferences);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) setError(reason instanceof Error ? reason.message : "No pudimos cargar la configuración de recepción.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [reloadKey]);

  function toggle(key: BooleanPreferenceKey, checked: boolean): void {
    setPreferences((current) => current === null ? current : { ...current, [key]: checked });
  }

  function updatePreference<Key extends keyof ClinicReceptionistPreferences>(key: Key, value: ClinicReceptionistPreferences[Key]): void {
    setPreferences((current) => current === null ? current : { ...current, [key]: value });
  }

  async function saveChanges(): Promise<void> {
    if (preferences === null || isSaving) return;
    setIsSaving(true);
    try {
      const updated = await updateClinicReceptionistSettings(preferences);
      setData(updated);
      setPreferences(updated.settings.preferences);
      showNotice("Preferencias de recepción guardadas correctamente.");
    } catch (reason: unknown) {
      showNotice(reason instanceof Error ? reason.message : "No pudimos guardar la configuración de recepción.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading && data === null) return <ClinicModuleLoading title="configuración de recepción" description="Consultando preferencias y métricas de operación." />;

  if (error !== null && data === null) {
    return <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7"><div role="alert"><SectionCard className="p-6"><h1 className="text-xl font-extrabold">No pudimos cargar configuración</h1><p className="mt-2 text-sm text-muted">{error}</p><button className="mt-4 min-h-10 rounded-lg bg-accent px-4 text-xs font-extrabold text-white hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-focus" type="button" onClick={() => { setError(null); setIsLoading(true); setReloadKey((current) => current + 1); }}>Reintentar</button></SectionCard></div></div>;
  }

  if (data === null || preferences === null) return null;
  const profile = data.profile;

  return <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7">
    <Notice message={notice} />
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="min-w-0"><p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-accent uppercase">Recepción · preferencias</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Configuración</h1><p className="mt-1 text-xs text-muted">Ajustes persistentes del usuario y operación de la clínica.</p></div><button className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl bg-accent px-4 text-xs font-extrabold text-white shadow-sm hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto" type="button" disabled={isSaving} onClick={saveChanges}><Save className="size-3.5" aria-hidden="true" />{isSaving ? "Guardando..." : "Guardar cambios"}</button></header>
    {!data.settings.persisted ? <p className="mt-3 rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-[0.58rem] font-semibold text-warning" role="status">Se muestran valores iniciales. Guarda cambios para persistir la configuración de esta cuenta.</p> : null}

    <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]"><div className="grid gap-4">
      <SectionCard className="p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent"><UserRound className="size-4" aria-hidden="true" /></span><div><h2 className="text-xs font-extrabold">Perfil de recepción</h2><p className="mt-0.5 text-[0.54rem] text-muted">Datos de la cuenta actualmente autenticada.</p></div></div><dl className="mt-4"><SettingsRow label="Nombre" value={profile.name || userName} /><SettingsRow label="Correo" value={profile.email ?? email ?? "No registrado"} /><SettingsRow label="Teléfono" value={profile.phoneNumber || phoneNumber} /><SettingsRow label="Clínica" value={data.clinic.name || clinicName} /><SettingsRow label="Estado" value="Activo" /><SettingsRow label="Rol" value="Recepción" /></dl><div className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-line-strong px-3 py-2 text-[0.56rem] font-semibold text-muted"><span className="flex-1">Edición de perfil</span><span>No disponible aquí</span><ChevronRight className="size-3" aria-hidden="true" /></div></SectionCard>
      <SectionCard className="p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent"><CalendarDays className="size-4" aria-hidden="true" /></span><div><h2 className="text-xs font-extrabold">Turno y operación</h2><p className="mt-0.5 text-[0.54rem] text-muted">Valores configurables para este usuario.</p></div></div><div className="mt-4"><SettingsRow label="Turno actual" value={preferences.shiftName ?? "No configurado"} /><SettingsRow label="Horario" value={formatHours(preferences)} /><SettingsRow label="Mostrador activo" value={preferences.counterName ?? "No configurado"} /><SettingsRow label="Recepción de citas en línea"><Toggle checked={preferences.onlineReception} onChange={(checked) => toggle("onlineReception", checked)} label="Recepción de citas en línea" /></SettingsRow><SettingsRow label="Confirmación automática por WhatsApp"><Toggle checked={preferences.whatsapp} onChange={(checked) => toggle("whatsapp", checked)} label="Confirmación automática por WhatsApp" /></SettingsRow></div><div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2"><SettingInput label="Nombre del turno" value={preferences.shiftName ?? ""} placeholder="Ej. Matutino" onChange={(value) => updatePreference("shiftName", value || null)} /><SettingInput label="Mostrador" value={preferences.counterName ?? ""} placeholder="Ej. Mostrador 1" onChange={(value) => updatePreference("counterName", value || null)} /><SettingInput label="Inicio" type="time" value={preferences.shiftStart ?? ""} onChange={(value) => updatePreference("shiftStart", value || null)} /><SettingInput label="Fin" type="time" value={preferences.shiftEnd ?? ""} onChange={(value) => updatePreference("shiftEnd", value || null)} /></div></SectionCard>
      <SectionCard className="p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent"><Printer className="size-4" aria-hidden="true" /></span><div><h2 className="text-xs font-extrabold">Impresoras y comprobantes</h2><p className="mt-0.5 text-[0.54rem] text-muted">Preferencias persistidas de salida.</p></div></div><div className="mt-4"><SettingsRow label="Impresora principal" value={preferences.printerName ?? "No configurada"} /><SettingsRow label="Tamaño de papel" value={preferences.paperSize ?? "No configurado"} /><SettingsRow label="Impresión automática de comprobantes"><Toggle checked={preferences.autoPrint} onChange={(checked) => toggle("autoPrint", checked)} label="Impresión automática de comprobantes" /></SettingsRow><SettingsRow label="Duplicado de tickets"><Toggle checked={preferences.duplicateTickets} onChange={(checked) => toggle("duplicateTickets", checked)} label="Duplicado de tickets" /></SettingsRow></div><div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-[minmax(0,1fr)_8rem]"><SettingInput label="Impresora principal" value={preferences.printerName ?? ""} placeholder="Nombre registrado" onChange={(value) => updatePreference("printerName", value || null)} /><label className="grid gap-1.5"><span className="text-[0.54rem] font-bold text-muted">Tamaño de papel</span><select className="h-9 rounded-lg border border-line bg-surface-input px-3 text-[0.6rem] font-semibold outline-none focus:border-accent focus:ring-3 focus:ring-focus/20" value={preferences.paperSize ?? ""} onChange={(event) => updatePreference("paperSize", event.target.value === "A4" || event.target.value === "letter" ? event.target.value : null)}><option value="">No configurado</option><option value="A4">A4</option><option value="letter">Carta</option></select></label></div></SectionCard>
    </div>

      <aside className="grid gap-4"><SectionCard className="p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent"><Bell className="size-4" aria-hidden="true" /></span><div><h2 className="text-xs font-extrabold">Notificaciones</h2><p className="mt-0.5 text-[0.54rem] text-muted">Alertas persistidas para recepción.</p></div></div><div className="mt-4"><SettingsRow label="Citas nuevas"><Toggle checked={preferences.newAppointments} onChange={(checked) => toggle("newAppointments", checked)} label="Citas nuevas" /></SettingsRow><SettingsRow label="Pacientes en llegada"><Toggle checked={preferences.arrivals} onChange={(checked) => toggle("arrivals", checked)} label="Pacientes en llegada" /></SettingsRow><SettingsRow label="Pagos pendientes"><Toggle checked={preferences.pendingPayments} onChange={(checked) => toggle("pendingPayments", checked)} label="Pagos pendientes" /></SettingsRow><SettingsRow label="Mensajes internos"><Toggle checked={preferences.internalMessages} onChange={(checked) => toggle("internalMessages", checked)} label="Mensajes internos" /></SettingsRow><SettingsRow label="Recordatorios de documentos"><Toggle checked={preferences.documents} onChange={(checked) => toggle("documents", checked)} label="Recordatorios de documentos" /></SettingsRow></div></SectionCard><SectionCard className="p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent"><ShieldCheck className="size-4" aria-hidden="true" /></span><div><h2 className="text-xs font-extrabold">Seguridad y sesión</h2><p className="mt-0.5 text-[0.54rem] text-muted">Estado devuelto por la cuenta autenticada.</p></div></div><div className="mt-4"><SettingsRow label="Cambiar contraseña" value="Gestionar desde cuenta" /><SettingsRow label="Autenticación de dos factores (2FA)" value={formatStatus(data.operation.twoFactor.status)} /></div><p className="mt-3 rounded-lg border border-dashed border-line-strong px-3 py-2 text-[0.54rem] leading-5 text-muted">{data.operation.twoFactor.message}</p></SectionCard></aside>
    </div>

    <SectionCard className="mt-4 p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent"><SlidersHorizontal className="size-4" aria-hidden="true" /></span><div><h2 className="text-xs font-extrabold">Resumen de operación</h2><p className="mt-0.5 text-[0.54rem] text-muted">Métricas calculadas desde la clínica actual.</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-xl border border-line bg-surface-subtle p-3"><p className="text-[0.54rem] text-muted">Citas hoy</p><strong className="mt-1 block font-mono text-xl">{data.metrics.appointmentsToday}</strong><span className="text-[0.5rem] font-bold text-muted">{data.metrics.appointmentsChangePercent === null ? "Sin comparación" : `${data.metrics.appointmentsChangePercent > 0 ? "+" : ""}${data.metrics.appointmentsChangePercent}% vs. ayer`}</span></div><div className="rounded-xl border border-line bg-surface-subtle p-3"><p className="text-[0.54rem] text-muted">Mensajes no leídos</p><strong className="mt-1 block font-mono text-xl">{data.metrics.unreadMessages}</strong><span className="text-[0.5rem] font-bold text-muted">Desde mensajes internos</span></div><div className="rounded-xl border border-line bg-surface-subtle p-3"><p className="text-[0.54rem] text-muted">Pagos pendientes</p><strong className="mt-1 block font-mono text-xl">{data.metrics.pendingPayments}</strong><span className="text-[0.5rem] font-bold text-muted">Facturas emitidas o parciales</span></div><div className="rounded-xl border border-line bg-surface-subtle p-3"><p className="text-[0.54rem] text-muted">Caja</p><strong className="mt-1 block text-xl">No configurada</strong><span className="text-[0.5rem] font-bold text-muted">{data.operation.cashRegister.message}</span></div></div></SectionCard>
  </div>;
}

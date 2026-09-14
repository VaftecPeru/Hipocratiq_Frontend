"use client";

import { ArrowUpRight, BellRing, Building2, Crown, Globe2, Save, ShieldCheck, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getClinicSettings, getClinicSubscription, updateClinicSettings } from "@/features/clinics/api/browser-clinic-dashboard";
import type { ClinicAdminInfo, ClinicPreferences, ClinicSubscription } from "@/features/clinics/model/clinic-admin.types";
import { Notice, SectionCard, Toggle, useNotice } from "./clinic-admin-primitives";

function Field({ label, value, onChange, className = "" }: Readonly<{ label: string; value: string; onChange?: (value: string) => void; className?: string }>) {
  return <label className={`grid gap-1.5 ${className}`}><span className="text-[0.54rem] font-bold text-muted">{label}</span><input className="h-9 rounded-lg border border-line bg-surface-input px-3 text-[0.6rem] font-semibold outline-none focus:border-accent focus:ring-3 focus:ring-focus/20" value={value} readOnly={!onChange} onChange={(event) => onChange?.(event.target.value)} /></label>;
}

const DEFAULT_PREFERENCES: ClinicPreferences = {
  maintenance: false,
  audit: true,
  signatures: true,
  backups: true,
  emergency: {
    enabled: true,
    visibility: "reception_doctors_admins",
    label: "Emergencia",
    color: "#EF2F3F",
    inheritance: "workflow_and_responsibles",
    defaultChannel: "priority_push",
    escalationMinutes: 3,
    responsibles: [],
  },
};

type BooleanPreferenceKey = "maintenance" | "audit" | "signatures" | "backups";

function subscriptionStatus(status: ClinicSubscription["status"]): string {
  if (status === "active") return "Activo";
  if (status === "past_due") return "Pago pendiente";
  if (status === "canceled") return "Cancelado";
  return "Expirado";
}

function subscriptionStatusClass(status: ClinicSubscription["status"]): string {
  return status === "active" ? "bg-success-soft text-success" : "bg-warning-soft text-warning";
}

function formatDate(value: string | null): string {
  if (value === null) return "Sin fecha registrada";
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(value));
}

function formatCurrency(minor: number, currency: string): string {
  try {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(minor / 100);
  } catch {
    return `${(minor / 100).toFixed(2)} ${currency}`;
  }
}

function usagePercentage(used: number | null, limit: number | null): number {
  if (used === null || limit === null || limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

function SubscriptionCard({ subscription, isLoading }: Readonly<{ subscription: ClinicSubscription | null; isLoading: boolean }>) {
  if (isLoading) return <SectionCard className="p-5"><div className="h-5 w-36 animate-pulse rounded bg-surface-subtle" /><div className="mt-4 h-28 animate-pulse rounded-xl bg-surface-subtle" /></SectionCard>;
  if (subscription === null) return <SectionCard className="p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-warning-soft text-warning"><Crown className="size-5" aria-hidden="true" /></span><div><p className="text-xs font-extrabold">Membresía actual</p><h2 className="mt-1 text-sm font-extrabold">Sin suscripción disponible</h2></div></div><p className="mt-4 rounded-lg border border-dashed border-line-strong p-3 text-[0.56rem] leading-5 text-muted">No hay una suscripción clínica activa para mostrar. Los datos de uso y características no están disponibles.</p></SectionCard>;

  const usage = [
    { label: "Pacientes", value: subscription.usage.patients },
    { label: "Usuarios", value: subscription.usage.users },
    { label: "Almacenamiento", value: subscription.usage.storage },
  ];

  return <SectionCard className="overflow-hidden p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-violet-soft text-violet"><Crown className="size-5" aria-hidden="true" /></span><div><p className="text-xs font-extrabold">Membresía actual</p><h2 className="mt-1 text-sm font-extrabold">{subscription.plan?.name ?? "Plan sin nombre"} <span className={`ml-2 rounded-full px-2 py-1 text-[0.5rem] ${subscriptionStatusClass(subscription.status)}`}>{subscriptionStatus(subscription.status)}</span></h2></div></div><div className="mt-4 rounded-xl bg-[linear-gradient(135deg,var(--violet-soft),var(--accent-soft))] p-4"><div className="flex flex-wrap justify-between gap-2 text-[0.54rem]"><span>{subscription.endsAt ? `Vence el ${formatDate(subscription.endsAt)}` : "Sin fecha de vencimiento"}</span><span className="font-bold">{subscription.plan ? formatCurrency(subscription.billingCycle === "annual" ? subscription.plan.annualPriceCents : subscription.plan.monthlyPriceCents, subscription.plan.currency) : "Precio no disponible"}</span></div><div className="mt-4 grid grid-cols-3 gap-3">{usage.map(({ label, value }) => { const percentage = usagePercentage(value.used, value.limit); return <div key={label}><p className="text-[0.48rem] text-muted">{label}</p><p className="mt-1 font-mono text-[0.5rem] font-bold">{value.used === null ? "No disponible" : `${value.used}${value.limit === null ? "" : ` / ${value.limit}`}`}</p>{value.limit !== null ? <div className="mt-2 h-1 rounded bg-white/70"><i className="block h-full rounded bg-accent" style={{ width: `${percentage}%` }} /></div> : <p className="mt-2 text-[0.46rem] font-bold text-muted">Sin límite configurado</p>}</div>; })}</div></div><h3 className="mt-5 text-[0.6rem] font-extrabold">Características incluidas</h3>{subscription.plan?.features.length ? <ul className="mt-3 grid gap-2 text-[0.54rem] text-ink-secondary">{subscription.plan.features.map((feature) => <li className="flex items-center gap-2" key={feature}><ShieldCheck className="size-3.5 shrink-0 text-success" aria-hidden="true" />{feature}</li>)}</ul> : <p className="mt-3 text-[0.54rem] text-muted">No hay características configuradas para este plan.</p>}</SectionCard>;
}

export function ClinicSettings() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [status, setStatus] = useState<ClinicAdminInfo["status"] | null>(null);
  const [subscription, setSubscription] = useState<ClinicSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<ClinicPreferences>(DEFAULT_PREFERENCES);
  const { notice, showNotice } = useNotice();
  const toggle = (key: BooleanPreferenceKey, checked: boolean) => setPreferences((current) => ({ ...current, [key]: checked }));

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getClinicSettings(controller.signal), getClinicSubscription(controller.signal)])
      .then(([clinic, currentSubscription]) => {
        setName(clinic.name);
        setAddress(clinic.address);
        setContactPhone(clinic.contactPhone);
        setStatus(clinic.status);
        setPreferences(clinic.preferences);
        setSubscription(currentSubscription);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) showNotice(error instanceof Error ? error.message : "No pudimos cargar la configuración de la clínica");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [showNotice]);

  async function saveChanges(): Promise<void> {
    if (isSaving || !name.trim() || !address.trim()) return;
    setIsSaving(true);
    try {
      const clinic = await updateClinicSettings({ name: name.trim(), address: address.trim(), contactPhone: contactPhone.trim(), preferences });
      setName(clinic.name);
      setAddress(clinic.address);
      setContactPhone(clinic.contactPhone);
      setStatus(clinic.status);
      showNotice("Datos de la clínica guardados correctamente");
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "No pudimos guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  }

  return <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7"><Notice message={notice} />
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="min-w-0"><p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-accent uppercase">Administración clínica</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Configuración</h1><p className="mt-1 text-xs text-muted">Administra los datos persistidos de la sede y personaliza la plataforma.</p></div><button className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl bg-accent px-4 text-xs font-extrabold text-white hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto" type="button" disabled={isLoading || isSaving} onClick={saveChanges}><Save className="size-3.5" aria-hidden="true" />{isSaving ? "Guardando..." : "Guardar cambios"}</button></header>
    <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.75fr)]"><div className="grid gap-4"><SectionCard className="p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent"><Building2 className="size-4" aria-hidden="true" /></span><div><h2 className="text-xs font-extrabold">Información de la clínica</h2><p className="mt-0.5 text-[0.54rem] text-muted">Identidad y datos públicos de la sede.</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Field label="Nombre de la clínica" value={name} onChange={setName} className="sm:col-span-2 lg:col-span-3" /><Field label="Teléfono de contacto" value={contactPhone} onChange={setContactPhone} /><Field label="Estado" value={isLoading ? "Cargando..." : status === "active" ? "Activa" : "Suspendida"} /><Field label="Dirección" value={address} onChange={setAddress} className="sm:col-span-2 lg:col-span-3" /></div></SectionCard>
      <SectionCard className="p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent"><Globe2 className="size-4" aria-hidden="true" /></span><div><h2 className="text-xs font-extrabold">Configuración regional</h2><p className="mt-0.5 text-[0.54rem] text-muted">Valores regionales disponibles para esta clínica.</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Field label="Idioma" value="No configurado" /><Field label="Moneda" value="No configurada" /><Field label="Formato de fecha" value="No configurado" /><Field label="Formato de hora" value="No configurado" /></div></SectionCard>
      <SectionCard className="p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent"><SlidersHorizontal className="size-4" aria-hidden="true" /></span><div><h2 className="text-xs font-extrabold">Preferencias del sistema</h2><p className="mt-0.5 text-[0.54rem] text-muted">Controles operativos de esta clínica.</p></div></div><div className="mt-4 divide-y divide-line">{[["maintenance", "Modo mantenimiento", "Pausa el acceso de usuarios"], ["audit", "Registro de auditoría", "Conserva las acciones del sistema"], ["signatures", "Firmas electrónicas", "Habilita firmas en documentos"], ["backups", "Respaldos automáticos", "Crea copias diarias"]].map(([key, label, description]) => { const preferenceKey = key as BooleanPreferenceKey; return <div className="flex items-center gap-3 py-2.5" key={key}><div className="flex-1"><p className="text-[0.6rem] font-extrabold">{label}</p><p className="text-[0.51rem] text-muted">{description}</p></div><Toggle checked={preferences[preferenceKey]} onChange={(checked) => toggle(preferenceKey, checked)} label={label} /></div>; })}</div></SectionCard></div>
      <aside className="grid gap-4"><SubscriptionCard subscription={subscription} isLoading={isLoading} /><SectionCard className="p-5"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-danger-soft text-danger"><BellRing className="size-4" aria-hidden="true" /></span><div><h2 className="text-xs font-extrabold">Botón de emergencia</h2><p className="mt-1 text-[0.55rem] leading-4 text-muted">Configura visibilidad, responsables y el flujo operativo.</p></div></div><Link className="mt-4 inline-flex min-h-9 w-full items-center justify-center gap-1 rounded-lg bg-danger-soft text-[0.6rem] font-extrabold text-danger hover:bg-danger/10 focus-visible:outline-2 focus-visible:outline-focus" href="/clinic/configuracion/emergencia">Configurar emergencia <ArrowUpRight className="size-3" aria-hidden="true" /></Link></SectionCard></aside></div>
  </div>;
}

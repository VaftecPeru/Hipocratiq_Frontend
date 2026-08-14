"use client";

import { ArrowUpRight, BellRing, Building2, Crown, Globe2, Save, ShieldCheck, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getClinicSettings, updateClinicSettings } from "@/features/clinics/api/browser-clinic-dashboard";
import { Notice, SectionCard, Toggle, useNotice } from "./clinic-admin-primitives";

function Field({ label, value, onChange, className = "" }: Readonly<{ label: string; value: string; onChange?: (value: string) => void; className?: string }>) {
  return <label className={`grid gap-1.5 ${className}`}><span className="text-[0.54rem] font-bold text-muted">{label}</span><input className="h-9 rounded-lg border border-line bg-surface-input px-3 text-[0.6rem] font-semibold outline-none focus:border-accent focus:ring-3 focus:ring-focus/20" value={value} readOnly={!onChange} onChange={(event) => onChange?.(event.target.value)} /></label>;
}

export function ClinicSettings() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState({ maintenance: false, audit: true, signatures: true, backups: true });
  const { notice, showNotice } = useNotice();
  const toggle = (key: keyof typeof preferences, checked: boolean) => setPreferences((current) => ({ ...current, [key]: checked }));
  useEffect(() => {
    const controller = new AbortController();
    getClinicSettings(controller.signal)
      .then((clinic) => {
        setName(clinic.name);
        setAddress(clinic.address);
        setContactPhone(clinic.contactPhone);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          showNotice(error instanceof Error ? error.message : "No pudimos cargar la configuración de la clínica");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [showNotice]);

  async function saveChanges() {
    if (isSaving || !name.trim() || !address.trim()) return;
    setIsSaving(true);
    try {
      const clinic = await updateClinicSettings({ name: name.trim(), address: address.trim(), contactPhone: contactPhone.trim() });
      setName(clinic.name);
      setAddress(clinic.address);
      setContactPhone(clinic.contactPhone);
      showNotice("Datos de la clínica guardados correctamente");
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "No pudimos guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  }

  return <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7"><Notice message={notice} />
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-accent uppercase">Administración clínica</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Configuración</h1><p className="mt-1 text-xs text-muted">Administra los datos de la sede y personaliza la plataforma.</p></div><button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-xs font-extrabold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled={isLoading || isSaving} onClick={saveChanges}><Save className="size-3.5" />{isSaving ? "Guardando..." : "Guardar cambios"}</button></header>
    <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.75fr)]"><div className="grid gap-4"><SectionCard className="p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent"><Building2 className="size-4" /></span><div><h2 className="text-xs font-extrabold">Información de la clínica</h2><p className="mt-0.5 text-[0.54rem] text-muted">Identidad y datos públicos de la sede.</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Field label="Nombre de la clínica" value={name} onChange={setName} className="sm:col-span-2 lg:col-span-3" /><Field label="Teléfono de contacto" value={contactPhone} onChange={setContactPhone} /><Field label="Estado" value={isLoading ? "Cargando..." : "Activa"} /><Field label="Dirección" value={address} onChange={setAddress} className="sm:col-span-2 lg:col-span-3" /></div></SectionCard>
      <SectionCard className="p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent"><Globe2 className="size-4" /></span><div><h2 className="text-xs font-extrabold">Configuración regional</h2><p className="mt-0.5 text-[0.54rem] text-muted">Formato local para el equipo clínico.</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Field label="Idioma" value="Español" /><Field label="Moneda" value="USD · Dólar" /><Field label="Formato de fecha" value="DD/MM/AAAA" /><Field label="Formato de hora" value="12 horas" /></div></SectionCard>
      <SectionCard className="p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent"><SlidersHorizontal className="size-4" /></span><div><h2 className="text-xs font-extrabold">Preferencias del sistema</h2><p className="mt-0.5 text-[0.54rem] text-muted">Controles operativos de esta clínica.</p></div></div><div className="mt-4 divide-y divide-line">{[["maintenance","Modo mantenimiento","Pausa el acceso de usuarios"],["audit","Registro de auditoría","Conserva las acciones del sistema"],["signatures","Firmas electrónicas","Habilita firmas en documentos"],["backups","Respaldos automáticos","Crea copias diarias"]].map(([key,label,description]) => <div className="flex items-center gap-3 py-2.5" key={key}><div className="flex-1"><p className="text-[0.6rem] font-extrabold">{label}</p><p className="text-[0.51rem] text-muted">{description}</p></div><Toggle checked={preferences[key as keyof typeof preferences]} onChange={(checked) => toggle(key as keyof typeof preferences, checked)} label={label} /></div>)}</div></SectionCard></div>
      <aside className="grid gap-4"><SectionCard className="overflow-hidden p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-violet-soft text-violet"><Crown className="size-5" /></span><div><p className="text-xs font-extrabold">Membresía actual</p><h2 className="mt-1 text-sm font-extrabold">Plan Profesional <span className="ml-2 rounded-full bg-success-soft px-2 py-1 text-[0.5rem] text-success">Activo</span></h2></div></div><div className="mt-4 rounded-xl bg-[linear-gradient(135deg,var(--violet-soft),var(--accent-soft))] p-4"><div className="flex justify-between text-[0.54rem]"><span>Vence el 24/06/2027</span><button className="rounded-lg bg-surface px-2 py-1 font-bold text-accent" type="button" onClick={() => showNotice("Gestión de membresía abierta")}>Gestionar membresía</button></div><div className="mt-4 grid grid-cols-3 gap-3">{[["Pacientes","2,450 / 5,000","49%"],["Almacenamiento","68 / 200 GB","34%"],["Usuarios","8 / 20","40%"]].map(([label,value,width]) => <div key={label}><p className="text-[0.48rem] text-muted">{label}</p><p className="mt-1 font-mono text-[0.5rem] font-bold">{value}</p><div className="mt-2 h-1 rounded bg-white/70"><i className="block h-full rounded bg-accent" style={{width}} /></div></div>)}</div></div><h3 className="mt-5 text-[0.6rem] font-extrabold">Características incluidas</h3><ul className="mt-3 grid gap-2 text-[0.54rem] text-ink-secondary">{["Expediente clínico electrónico ilimitado","Agenda y citas ilimitadas","Facturación electrónica","Reportes avanzados","IA Epidemiológica","Soporte prioritario 24/7","Integraciones con laboratorio y farmacia"].map((item) => <li className="flex items-center gap-2" key={item}><ShieldCheck className="size-3.5 shrink-0 text-success" />{item}</li>)}</ul></SectionCard>
      <SectionCard className="p-5"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-danger-soft text-danger"><BellRing className="size-4" /></span><div><h2 className="text-xs font-extrabold">Botón de emergencia</h2><p className="mt-1 text-[0.55rem] leading-4 text-muted">Configura visibilidad, responsables y el flujo operativo.</p></div></div><Link className="mt-4 inline-flex min-h-9 w-full items-center justify-center gap-1 rounded-lg bg-danger-soft text-[0.6rem] font-extrabold text-danger hover:bg-danger/10" href="/clinic/configuracion/emergencia">Configurar emergencia <ArrowUpRight className="size-3" /></Link></SectionCard></aside></div>
  </div>;
}

"use client";

import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Globe2,
  Printer,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Notice, SectionCard, Toggle, useNotice } from "./clinic-admin-primitives";

type ReceptionistSettingsProps = Readonly<{
  userName: string;
  email: string | null;
  phoneNumber: string;
  clinicName: string;
}>;

function SettingsRow({ label, value, children }: Readonly<{ label: string; value?: string; children?: React.ReactNode }>) {
  return <div className="flex items-center gap-3 border-b border-line py-3 last:border-0"><span className="flex-1 text-[0.6rem] font-semibold text-ink-secondary">{label}</span>{value ? <strong className="text-right text-[0.6rem] font-extrabold text-ink">{value}</strong> : null}{children}</div>;
}

export function ReceptionistSettings({ userName, email, phoneNumber, clinicName }: ReceptionistSettingsProps) {
  const [preferences, setPreferences] = useState({ newAppointments: true, arrivals: true, pendingPayments: true, internalMessages: true, documents: true, onlineReception: true, whatsapp: true, autoPrint: true, duplicateTickets: false });
  const { notice, showNotice } = useNotice();

  function toggle(key: keyof typeof preferences, checked: boolean): void {
    setPreferences((current) => ({ ...current, [key]: checked }));
  }

  function saveChanges(): void {
    showNotice("Preferencias de recepción guardadas en esta sesión.");
  }

  return <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7">
    <Notice message={notice} />
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="min-w-0"><p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-accent uppercase">Recepción · preferencias</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Configuración</h1><p className="mt-1 text-xs text-muted">Ajustes operativos y preferencias del área de recepción.</p></div><div className="flex flex-wrap gap-2"><button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-extrabold hover:bg-surface-hover" type="button" onClick={() => showNotice("Configuración preparada para exportar.")}><Save className="size-3.5" aria-hidden="true" />Exportar configuración</button><button className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent px-4 text-xs font-extrabold text-white shadow-sm hover:bg-accent-hover" type="button" onClick={saveChanges}><Check className="size-3.5" aria-hidden="true" />Guardar cambios</button></div></header>

    <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]"><div className="grid gap-4"><SectionCard className="p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent"><UserRound className="size-4" aria-hidden="true" /></span><div><h2 className="text-xs font-extrabold">Perfil de Recepción</h2><p className="mt-0.5 text-[0.54rem] text-muted">Datos del usuario actualmente autenticado.</p></div></div><dl className="mt-4"><SettingsRow label="Nombre" value={userName} /><SettingsRow label="Correo" value={email ?? "No registrado"} /><SettingsRow label="Teléfono" value={phoneNumber} /><SettingsRow label="Sede" value="Recepción Central" /><SettingsRow label="Clínica" value={clinicName} /><SettingsRow label="Rol" value="Recepción" /></dl><button className="mt-4 inline-flex min-h-8 items-center gap-2 rounded-lg border border-line px-3 text-[0.58rem] font-extrabold text-accent" type="button" onClick={() => showNotice("La edición de perfil se habilitará en el módulo de cuenta.")}>Editar perfil <ChevronRight className="size-3" aria-hidden="true" /></button></SectionCard>
      <SectionCard className="p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent"><CalendarDays className="size-4" aria-hidden="true" /></span><div><h2 className="text-xs font-extrabold">Turno y Operación</h2><p className="mt-0.5 text-[0.54rem] text-muted">Control del flujo diario de recepción.</p></div></div><div className="mt-4"><SettingsRow label="Turno actual"><span className="rounded-md bg-success-soft px-2 py-1 text-[0.52rem] font-extrabold text-success">Matutino</span></SettingsRow><SettingsRow label="Horario" value="07:00 AM - 03:00 PM" /><SettingsRow label="Mostrador activo" value="2" /><SettingsRow label="Recepción de citas en línea"><Toggle checked={preferences.onlineReception} onChange={(checked) => toggle("onlineReception", checked)} label="Recepción de citas en línea" /></SettingsRow><SettingsRow label="Confirmación automática por WhatsApp"><Toggle checked={preferences.whatsapp} onChange={(checked) => toggle("whatsapp", checked)} label="Confirmación automática por WhatsApp" /></SettingsRow></div></SectionCard>
      <SectionCard className="p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent"><Printer className="size-4" aria-hidden="true" /></span><div><h2 className="text-xs font-extrabold">Impresoras y Comprobantes</h2><p className="mt-0.5 text-[0.54rem] text-muted">Preferencias de salida para caja y admisión.</p></div></div><div className="mt-4"><SettingsRow label="Impresora principal" value="HP LaserJet Front Desk" /><SettingsRow label="Tamaño de papel" value="A4" /><SettingsRow label="Impresión automática de comprobantes"><Toggle checked={preferences.autoPrint} onChange={(checked) => toggle("autoPrint", checked)} label="Impresión automática de comprobantes" /></SettingsRow><SettingsRow label="Duplicado de tickets"><Toggle checked={preferences.duplicateTickets} onChange={(checked) => toggle("duplicateTickets", checked)} label="Duplicado de tickets" /></SettingsRow></div></SectionCard></div>

      <aside className="grid gap-4"><SectionCard className="p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent"><Bell className="size-4" aria-hidden="true" /></span><div><h2 className="text-xs font-extrabold">Notificaciones</h2><p className="mt-0.5 text-[0.54rem] text-muted">Alertas que verá recepción.</p></div></div><div className="mt-4"><SettingsRow label="Citas nuevas"><Toggle checked={preferences.newAppointments} onChange={(checked) => toggle("newAppointments", checked)} label="Citas nuevas" /></SettingsRow><SettingsRow label="Pacientes en llegada"><Toggle checked={preferences.arrivals} onChange={(checked) => toggle("arrivals", checked)} label="Pacientes en llegada" /></SettingsRow><SettingsRow label="Pagos pendientes"><Toggle checked={preferences.pendingPayments} onChange={(checked) => toggle("pendingPayments", checked)} label="Pagos pendientes" /></SettingsRow><SettingsRow label="Mensajes internos"><Toggle checked={preferences.internalMessages} onChange={(checked) => toggle("internalMessages", checked)} label="Mensajes internos" /></SettingsRow><SettingsRow label="Recordatorios de documentos"><Toggle checked={preferences.documents} onChange={(checked) => toggle("documents", checked)} label="Recordatorios de documentos" /></SettingsRow></div></SectionCard><SectionCard className="p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent"><ShieldCheck className="size-4" aria-hidden="true" /></span><div><h2 className="text-xs font-extrabold">Seguridad y Sesión</h2><p className="mt-0.5 text-[0.54rem] text-muted">Protección de acceso de la cuenta.</p></div></div><div className="mt-4"><SettingsRow label="Cambiar contraseña"><ChevronRight className="size-3.5 text-muted" aria-hidden="true" /></SettingsRow><SettingsRow label="Autenticación de dos factores (2FA)"><span className="inline-flex items-center gap-1 text-[0.56rem] font-extrabold text-success">Activado <i className="size-1.5 rounded-full bg-success" /></span></SettingsRow><SettingsRow label="Última actividad" value="Hoy 10:30 AM" /><SettingsRow label="Cerrar sesión en otros dispositivos"><ChevronRight className="size-3.5 text-muted" aria-hidden="true" /></SettingsRow></div></SectionCard><SectionCard className="p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-violet-soft text-violet"><Globe2 className="size-4" aria-hidden="true" /></span><div><h2 className="text-xs font-extrabold">Idioma y Formato</h2><p className="mt-0.5 text-[0.54rem] text-muted">Preferencias visuales del panel.</p></div></div><div className="mt-4"><SettingsRow label="Idioma" value="Español" /><SettingsRow label="País" value="Perú" /><SettingsRow label="Zona horaria" value="PET (GMT-05:00)" /><SettingsRow label="Formato de fecha" value="DD/MM/AAAA" /></div></SectionCard></aside>
    </div>

    <SectionCard className="mt-4 p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent"><SlidersHorizontal className="size-4" aria-hidden="true" /></span><div><h2 className="text-xs font-extrabold">Resumen rápido</h2><p className="mt-0.5 text-[0.54rem] text-muted">Estado de operación del turno actual.</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-xl border border-line bg-surface-subtle p-3"><p className="text-[0.54rem] text-muted">Citas hoy</p><strong className="mt-1 block font-mono text-xl">52</strong><span className="text-[0.5rem] font-bold text-success">+15% vs ayer</span></div><div className="rounded-xl border border-line bg-surface-subtle p-3"><p className="text-[0.54rem] text-muted">Mensajes no leídos</p><strong className="mt-1 block font-mono text-xl">2</strong><span className="text-[0.5rem] font-bold text-accent">Nuevos</span></div><div className="rounded-xl border border-line bg-surface-subtle p-3"><p className="text-[0.54rem] text-muted">Pagos pendientes</p><strong className="mt-1 block font-mono text-xl">8</strong><span className="text-[0.5rem] font-bold text-warning">Revisar caja</span></div><div className="rounded-xl border border-line bg-surface-subtle p-3"><p className="text-[0.54rem] text-muted">Caja abierta</p><strong className="mt-1 block text-xl">Sí</strong><span className="text-[0.5rem] font-bold text-success">Desde 09:00 AM</span></div></div></SectionCard>
  </div>;
}

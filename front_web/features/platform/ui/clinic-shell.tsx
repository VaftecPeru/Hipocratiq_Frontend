"use client";

import { Bell, Building2, CalendarDays, ChartNoAxesCombined, FileText, House, LogOut, Menu, Settings, Users, X } from "lucide-react";
import { useState } from "react";
import { logout } from "@/features/auth/api/browser-auth";

export function ClinicShell({ children, clinicName, userName }: { children: React.ReactNode; clinicName: string; userName: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = [
    ["Resumen Clínica", House],
    ["Agenda", CalendarDays],
    ["Médicos", Users],
    ["Facturación", FileText],
    ["Pacientes", Users],
    ["Reportes", ChartNoAxesCombined],
    ["Configuración", Settings],
  ] as const;

  async function handleLogout() {
    await logout();
    window.location.assign("/");
  }

  return <div className="min-h-svh bg-[#f5f8fc] text-[#101b33]"><aside className={`${menuOpen ? "flex" : "hidden"} fixed inset-y-0 left-0 z-30 w-60 flex-col border-r border-line bg-white lg:flex`}><div className="flex h-16 items-center border-b border-line px-5"><span className="grid size-9 place-items-center rounded-xl bg-accent"><Building2 className="size-5 text-white" aria-hidden="true" /></span><span className="ml-2 text-sm font-extrabold tracking-[0.06em]">HIPOCRATIQ</span></div><nav className="flex-1 p-3" aria-label="Navegación de clínica"><ul className="grid gap-1">{navigation.map(([label, Icon], index) => <li key={label}><button className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[0.7rem] font-bold ${index === 0 ? "bg-accent-soft text-accent" : "text-[#587095] hover:bg-surface-subtle"}`} type="button"><Icon className="size-4" aria-hidden="true" />{label}</button></li>)}</ul></nav><div className="border-t border-line p-3"><div className="mb-2 rounded-lg bg-surface-subtle px-3 py-2"><p className="truncate text-[0.66rem] font-extrabold">{clinicName}</p><p className="text-[0.56rem] text-muted">Administrador clínico</p></div><button className="flex min-h-9 w-full items-center gap-2 rounded-lg border border-danger-soft px-3 text-[0.64rem] font-bold text-danger hover:bg-danger-soft" type="button" onClick={handleLogout}><LogOut className="size-3.5" aria-hidden="true" />Cerrar sesión</button></div></aside><header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-white px-4 lg:ml-60 lg:px-7"><button className="grid size-9 place-items-center rounded-lg text-muted lg:hidden" type="button" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}</button><div className="hidden w-full max-w-md items-center rounded-lg border border-line bg-[#f7f9fc] px-3 py-2 text-[0.65rem] text-muted sm:flex">Buscar pacientes, expedientes, facturas...</div><div className="ml-auto flex items-center gap-3"><span className="hidden rounded-full bg-success-soft px-3 py-1.5 text-[0.58rem] font-extrabold text-success sm:block">● SINCRONIZADO</span><button className="relative text-muted" type="button" aria-label="Ver notificaciones"><Bell className="size-4" /><span className="absolute -top-2 -right-2 grid size-3.5 place-items-center rounded-full bg-accent text-[0.45rem] text-white">3</span></button><div className="hidden border-l border-line pl-3 text-right sm:block"><p className="text-[0.65rem] font-extrabold">{userName}</p><p className="text-[0.54rem] font-bold text-accent">Admin de Clínica</p></div></div></header><main className="min-w-0 lg:ml-60">{children}</main></div>;
}

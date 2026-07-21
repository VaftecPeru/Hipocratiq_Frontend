"use client";

import { Bell, CalendarDays, ClipboardList, House, Menu, Settings, Stethoscope, Users, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { LogoutButton } from "@/features/auth/ui/logout-button";

const navigation = [
  { label: "Resumen", href: "/doctor/dashboard", icon: House, available: true },
  { label: "Agenda", href: "/doctor/agenda", icon: CalendarDays },
  { label: "Pacientes", href: "/doctor/pacientes", icon: Users },
  { label: "Expedientes", href: "/doctor/expedientes", icon: ClipboardList },
  { label: "Configuración", href: "/doctor/configuracion", icon: Settings },
];

export function DoctorShell({ children, userName, subtitle }: { children: React.ReactNode; userName: string; subtitle: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-svh bg-[#f5f8fc] text-[#101b33]">
      <aside className={`${menuOpen ? "flex" : "hidden"} fixed inset-y-0 left-0 z-30 w-60 flex-col border-r border-line bg-white lg:flex`}>
        <div className="flex h-16 items-center border-b border-line px-5"><span className="grid size-9 place-items-center rounded-xl bg-accent"><Stethoscope className="size-5 text-white" aria-hidden="true" /></span><span className="ml-2 text-sm font-extrabold tracking-[0.06em]">HIPOCRATIQ</span></div>
        <nav className="flex-1 p-3" aria-label="Navegación médica"><ul className="grid gap-1">{navigation.map(({ label, href, icon: Icon, available }) => <li key={href}>{available ? <Link className="flex min-h-10 items-center gap-3 rounded-lg bg-accent-soft px-3 text-[0.7rem] font-bold text-accent focus-visible:outline-3 focus-visible:outline-focus" href={href} aria-current="page" onClick={() => setMenuOpen(false)}><Icon className="size-4" aria-hidden="true" />{label}</Link> : <span className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-[0.7rem] font-bold text-muted/70" aria-disabled="true" title="Disponible próximamente"><Icon className="size-4" aria-hidden="true" />{label}</span>}</li>)}</ul></nav>
        <div className="border-t border-line p-3"><div className="mb-2 rounded-lg bg-surface-subtle px-3 py-2"><p className="truncate text-[0.66rem] font-extrabold">{userName}</p><p className="truncate text-[0.56rem] text-muted">{subtitle}</p></div><LogoutButton appearance="navigation" /></div>
      </aside>
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-white px-4 lg:ml-60 lg:px-7"><button className="grid size-9 place-items-center rounded-lg text-muted focus-visible:outline-3 focus-visible:outline-focus lg:hidden" type="button" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}</button><p className="text-[0.68rem] font-bold text-muted">Panel médico</p><button className="ml-auto text-muted" type="button" aria-label="Ver notificaciones"><Bell className="size-4" aria-hidden="true" /></button></header>
      <main className="min-w-0 lg:ml-60">{children}</main>
    </div>
  );
}

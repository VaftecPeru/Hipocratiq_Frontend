"use client";

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BrainCircuit,
  CalendarDays,
  ClipboardList,
  FileText,
  FlaskConical,
  House,
  ImageIcon,
  Mail,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Stethoscope,
  Users,
  Video,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoutButton } from "@/features/auth/ui/logout-button";

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  available?: boolean;
};

const navigation: NavigationItem[] = [
  { label: "Inicio", href: "/doctor/dashboard", icon: House, available: true },
  { label: "Agenda", href: "/doctor/agenda", icon: CalendarDays, available: true },
  { label: "Pacientes", href: "/doctor/pacientes", icon: Users, available: true },
  { label: "Consultas", href: "/doctor/consultas", icon: ClipboardList, available: true },
  { label: "Recetas", href: "/doctor/recetas", icon: FileText, available: true },
  { label: "Laboratorio", href: "/doctor/laboratorio", icon: FlaskConical, available: true },
  { label: "Imagenología", href: "/doctor/imagenologia", icon: ImageIcon },
  { label: "Telemedicina", href: "/doctor/telemedicina", icon: Video, available: true },
  { label: "Mensajes", href: "/doctor/mensajes", icon: MessageSquare, available: true },
  { label: "Reportes", href: "/doctor/reportes", icon: BarChart3, available: true },
  { label: "IA Epidemiológica", href: "/doctor/epidemiologia", icon: BrainCircuit, available: true },
  { label: "Configuración", href: "/doctor/configuracion", icon: Settings, available: true },
];

function SidebarLink({ item, pathname, closeMenu }: Readonly<{ item: NavigationItem; pathname: string; closeMenu: () => void }>) {
  const Icon = item.icon;
  const isActive = pathname === item.href;

  if (!item.available) {
    return (
      <span className="flex min-h-9 items-center gap-3 rounded-lg px-3 text-[0.7rem] font-extrabold text-ink-secondary/80" aria-disabled="true" title="Disponible próximamente">
        <Icon className="size-[15px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
        {item.label}
        {item.label === "Mensajes" ? <span className="ml-auto grid size-5 place-items-center rounded-md bg-accent text-[0.58rem] font-extrabold text-white">3</span> : null}
      </span>
    );
  }

  return (
    <Link
      className={`relative flex min-h-9 items-center gap-3 rounded-lg px-3 text-[0.7rem] font-extrabold transition-colors focus-visible:outline-3 focus-visible:outline-focus ${isActive ? "bg-accent-soft text-accent after:absolute after:inset-y-0 after:right-0 after:w-[3px] after:rounded-l-full after:bg-accent" : "text-ink-secondary hover:bg-surface-subtle hover:text-ink"}`}
      href={item.href}
      onClick={closeMenu}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="size-[15px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
      {item.label}
      {item.label === "Mensajes" ? <span className="ml-auto grid size-5 place-items-center rounded-md bg-accent text-[0.58rem] font-extrabold text-white">3</span> : null}
    </Link>
  );
}

export function DoctorShell({ children, userName, subtitle }: { children: React.ReactNode; userName: string; subtitle: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const initials = userName.split(/\s+/).map((name) => name[0]).join("").slice(0, 2).toUpperCase() || "DR";

  return (
    <div className="min-h-svh bg-paper text-ink">
      <aside className={`${menuOpen ? "flex" : "hidden"} fixed inset-y-0 left-0 z-40 w-[206px] flex-col border-r border-line bg-surface lg:flex`}>
        <div className="flex h-[60px] items-center border-b border-line px-4">
          <div className="grid size-[34px] place-items-center rounded-[10px] bg-accent" aria-label="Hipocratiq">
            <Stethoscope className="size-[18px] text-white" strokeWidth={2.1} aria-hidden="true" />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Navegación médica">
          <ul className="grid gap-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <SidebarLink item={item} pathname={pathname} closeMenu={() => setMenuOpen(false)} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-line p-3">
          <div className="mb-2 flex items-center gap-2 rounded-[9px] border border-line bg-surface px-2.5 py-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
              <Stethoscope className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[0.62rem] font-extrabold">Clínica Santa María</p>
              <p className="truncate text-[0.55rem] font-semibold text-muted">Sede Central · CDMX</p>
            </div>
            <span className="ml-auto text-muted" aria-hidden="true">›</span>
          </div>
          <LogoutButton appearance="navigation" />
        </div>
      </aside>

      {menuOpen ? <div className="fixed inset-0 z-30 bg-ink/20 backdrop-blur-sm lg:hidden" aria-hidden="true" onClick={() => setMenuOpen(false)} /> : null}

      <header className="sticky top-0 z-20 flex h-[60px] items-center gap-3 border-b border-line bg-surface/95 px-3 backdrop-blur-md sm:px-5 lg:ml-[206px] lg:px-6">
        <button
          className="grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus lg:hidden"
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
        </button>

        <label className="flex h-9 min-w-0 max-w-[550px] flex-1 items-center gap-2 rounded-[9px] border border-line bg-surface-input px-3 text-muted focus-within:border-focus focus-within:ring-2 focus-within:ring-focus/20">
          <Search className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
          <span className="sr-only">Buscar</span>
          <input className="min-w-0 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-placeholder" placeholder="Buscar pacientes, expedientes, consultas..." />
        </label>

        <div className="ml-auto hidden items-center gap-3 text-[0.66rem] font-extrabold text-ink-secondary xl:flex">
          <span className="inline-flex items-center gap-2 whitespace-nowrap border-r border-line pr-5">
            <CalendarDays className="size-4 text-ink" strokeWidth={1.8} aria-hidden="true" />
            Jueves, 16 de Mayo 2024
          </span>
          <button className="relative grid size-8 place-items-center rounded-lg text-ink-secondary hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Ver notificaciones">
            <Bell className="size-[17px]" strokeWidth={1.8} aria-hidden="true" />
            <span className="absolute right-0 top-0 grid size-3.5 place-items-center rounded-full bg-danger text-[0.5rem] font-extrabold text-white">3</span>
          </button>
          <button className="relative grid size-8 place-items-center rounded-lg text-ink-secondary hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Ver mensajes">
            <Mail className="size-[17px]" strokeWidth={1.8} aria-hidden="true" />
            <span className="absolute right-1 top-0 size-1.5 rounded-full bg-accent" />
          </button>
          <button className="grid size-8 place-items-center rounded-lg text-ink-secondary hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Ayuda">
            <span className="grid size-4 place-items-center rounded-full border border-current text-[0.65rem] font-extrabold">?</span>
          </button>
        </div>

        <button className="flex min-w-0 items-center gap-2 rounded-[10px] border border-line bg-surface px-2 py-1.5 text-left hover:border-line-strong focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Abrir perfil de usuario">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-[0.6rem] font-extrabold text-white ring-2 ring-accent-soft">{initials}</span>
          <span className="hidden min-w-0 sm:block">
            <span className="block max-w-28 truncate text-[0.68rem] font-extrabold">{userName}</span>
            <span className="block max-w-28 truncate text-[0.55rem] font-bold text-ink-secondary">{subtitle.split("·")[0].trim()}</span>
          </span>
          <span className="hidden text-muted sm:block" aria-hidden="true">⌄</span>
        </button>
        <span className="hidden items-center gap-1.5 rounded-full bg-success-soft px-2 py-1 text-[0.56rem] font-extrabold text-success md:inline-flex">
          <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />En línea
        </span>
      </header>

      <main className="min-w-0 lg:ml-[206px]">{children}</main>
    </div>
  );
}

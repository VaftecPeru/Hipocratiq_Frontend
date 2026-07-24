"use client";

import type { LucideIcon } from "lucide-react";
import { Bell, Building2, CalendarDays, ChartNoAxesCombined, FileText, House, LogOut, Menu, Settings, Users, X } from "lucide-react";
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
  { label: "Resumen Clínica", href: "/clinic/dashboard", icon: House, available: true },
  { label: "Agenda", href: "/clinic/agenda", icon: CalendarDays },
  { label: "Médicos", href: "/clinic/medicos", icon: Users },
  { label: "Facturación", href: "/clinic/facturacion", icon: FileText },
  { label: "Pacientes", href: "/clinic/pacientes", icon: Users },
  { label: "Reportes", href: "/clinic/reportes", icon: ChartNoAxesCombined },
  { label: "Configuración", href: "/clinic/configuracion", icon: Settings },
];

export function ClinicShell({ children, clinicName, userName }: { children: React.ReactNode; clinicName: string; userName: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-svh bg-paper text-ink">
      <aside className={`${menuOpen ? "flex" : "hidden"} fixed inset-y-0 left-0 z-30 w-60 flex-col border-r border-line bg-surface lg:flex`}>
        <div className="flex h-16 items-center border-b border-line px-5">
          <span className="grid size-9 place-items-center rounded-xl bg-accent">
            <Building2 className="size-5 text-white" aria-hidden="true" />
          </span>
          <span className="ml-2 text-sm font-extrabold tracking-[0.06em]">HIPOCRATIQ</span>
        </div>

        <nav className="flex-1 p-3" aria-label="Navegación de clínica">
          <ul className="grid gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  {item.available ? (
                    <Link
                      className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-xs font-bold transition-colors focus-visible:outline-3 focus-visible:outline-focus ${isActive ? "bg-accent-soft text-accent" : "text-icon-nav-inactive hover:bg-surface-subtle hover:text-ink"}`}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className="size-4" strokeWidth={1.7} aria-hidden="true" />
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-xs font-bold text-muted/70"
                      aria-disabled="true"
                      title="Disponible próximamente"
                    >
                      <Icon className="size-4" strokeWidth={1.7} aria-hidden="true" />
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-line p-3">
          <div className="mb-2 rounded-lg bg-surface-subtle px-3 py-2">
            <p className="truncate text-xs font-extrabold">{clinicName}</p>
            <p className="text-2xs text-muted">Administrador clínico</p>
          </div>
          <LogoutButton appearance="navigation" />
        </div>
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-20 bg-ink/20 backdrop-blur-sm lg:hidden" aria-hidden="true" onClick={() => setMenuOpen(false)} />
      ) : null}

      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur-md lg:ml-60 lg:px-7">
        <button
          className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus lg:hidden"
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
        </button>
        <p className="text-xs font-bold text-muted">Panel clínico</p>
        <button className="ml-auto relative grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Ver notificaciones">
          <Bell className="size-4" strokeWidth={1.7} aria-hidden="true" />
        </button>
      </header>

      <main className="min-w-0 lg:ml-60">{children}</main>
    </div>
  );
}

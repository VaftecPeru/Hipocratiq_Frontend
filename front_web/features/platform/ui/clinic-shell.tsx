"use client";

import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BrainCircuit,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  CreditCard,
  FileText,
  House,
  Menu,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LogoutButton } from "@/features/auth/ui/logout-button";
import { ClinicalNotificationBell } from "@/features/platform/ui/clinical-notification-bell";

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  available: boolean;
  clinicAdminOnly?: boolean;
};

const navigation: readonly NavigationItem[] = [
  { label: "Resumen Clínica", href: "/clinic/dashboard", icon: House, available: true },
  { label: "Agenda", href: "/clinic/agenda", icon: CalendarDays, available: true },
  { label: "Médicos", href: "/clinic/medicos", icon: Users, available: true },
  { label: "Equipo", href: "/clinic/equipo", icon: Users, available: true, clinicAdminOnly: true },
  { label: "Facturación", href: "/clinic/facturacion", icon: FileText, available: true, clinicAdminOnly: true },
  { label: "Pacientes", href: "/clinic/pacientes", icon: Users, available: true },
  { label: "Reportes", href: "/clinic/reportes", icon: ChartNoAxesCombined, available: true },
  { label: "IA Epidemiológica", href: "/clinic/epidemiologia", icon: BrainCircuit, available: true, clinicAdminOnly: true },
  { label: "Configuración", href: "/clinic/configuracion", icon: Settings, available: true },
];

const receptionistNavigation: readonly NavigationItem[] = [
  { label: "Inicio", href: "/clinic/dashboard", icon: House, available: true },
  { label: "Agenda", href: "/clinic/agenda", icon: CalendarDays, available: true },
  { label: "Pacientes", href: "/clinic/pacientes", icon: Users, available: true },
  { label: "Registro de Pacientes", href: "/clinic/registro-pacientes", icon: FileText, available: true },
  { label: "Mensajes", href: "/clinic/mensajes", icon: Bell, available: true },
  { label: "Caja y Pagos", href: "/clinic/caja-pagos", icon: CreditCard, available: true },
  { label: "Reportes", href: "/clinic/reportes", icon: ChartNoAxesCombined, available: true },
  { label: "Configuración", href: "/clinic/configuracion", icon: Settings, available: true },
];

type ClinicShellProps = Readonly<{
  children: React.ReactNode;
  clinicName: string;
  userName: string;
  actorContext: "clinic_admin" | "receptionist";
}>;

type ClinicNavigationProps = Readonly<{
  clinicName: string;
  actorContext: "clinic_admin" | "receptionist";
  pathname: string;
  onNavigate?: () => void;
}>;

function ClinicNavigation({ clinicName, actorContext, pathname, onNavigate }: ClinicNavigationProps) {
  const visibleNavigation = actorContext === "receptionist"
    ? receptionistNavigation
    : navigation.filter((item) => !item.clinicAdminOnly || actorContext === "clinic_admin");

  return (
    <>
      <div className="flex h-16 items-center border-b border-line px-5">
        <Link className="flex min-h-11 min-w-0 items-center focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus" href="/clinic/dashboard" onClick={onNavigate ? () => onNavigate() : undefined}>
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent p-1.5 shadow-[0_0.45rem_1rem_rgb(8_98_221/22%)]">
            <Image className="size-full object-contain brightness-0 invert" src="/logo_hipocratiq.webp" width={28} height={28} alt="" priority />
          </span>
          <span className="ml-2 truncate text-sm font-extrabold tracking-[0.06em]">HIPOCRATIQ</span>
        </Link>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col overflow-hidden" aria-label="Navegación de clínica">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
          <ul className="grid gap-1">
            {visibleNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === "/clinic/configuracion" && pathname.startsWith(`${item.href}/`));
              return (
                <li key={`${actorContext}-${item.label}`}>
                  {item.available ? (
                    <Link
                      className={`relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-xs font-bold transition-colors focus-visible:outline-3 focus-visible:outline-focus lg:min-h-10 ${isActive ? "bg-accent-soft text-accent after:absolute after:inset-y-2 after:right-0 after:w-0.5 after:rounded-full after:bg-accent" : "text-icon-nav-inactive hover:bg-surface-subtle hover:text-ink"}`}
                      href={item.href}
                      onClick={onNavigate ? () => onNavigate() : undefined}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className="size-4 shrink-0" strokeWidth={1.7} aria-hidden="true" />
                      {item.label}
                    </Link>
                  ) : (
                    <span className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-xs font-bold text-muted/65 lg:min-h-10" aria-disabled="true" title="Disponible próximamente">
                      <Icon className="size-4 shrink-0" strokeWidth={1.7} aria-hidden="true" />
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="shrink-0 border-t border-line p-3">
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-line bg-surface-subtle px-3 py-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><Building2 className="size-4" aria-hidden="true" /></span>
            <div className="min-w-0"><p className="truncate text-xs font-extrabold">{actorContext === "receptionist" ? "Recepción Central" : clinicName}</p><p className="truncate text-2xs text-muted">{actorContext === "receptionist" ? clinicName : "Sede principal"}</p></div>
          </div>
          <LogoutButton appearance="navigation" />
        </div>
      </nav>
    </>
  );
}

export function ClinicShell({ children, clinicName, userName, actorContext }: ClinicShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavigationRef = useRef<HTMLDialogElement>(null);

  const closeMobileNavigation = useCallback((restoreFocus: boolean) => {
    setMenuOpen(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    }
  }, []);

  const handleNavigation = useCallback(() => {
    closeMobileNavigation(false);
  }, [closeMobileNavigation]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const drawer = mobileNavigationRef.current;
    if (!drawer) return undefined;

    const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusableElements = Array.from(drawer.querySelectorAll<HTMLElement>(focusableSelector));
    focusableElements[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobileNavigation(true);
        return;
      }

      if (event.key !== "Tab" || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeMobileNavigation, menuOpen]);

  const toggleMobileNavigation = useCallback(() => {
    if (menuOpen) {
      closeMobileNavigation(true);
      return;
    }
    setNotificationOpen(false);
    setMenuOpen(true);
  }, [closeMobileNavigation, menuOpen]);

  return (
    <div className="min-h-svh bg-paper text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface lg:flex">
        <ClinicNavigation actorContext={actorContext} clinicName={clinicName} pathname={pathname} />
      </aside>

      {menuOpen ? <button className="fixed inset-0 z-[25] cursor-default bg-ink/20 backdrop-blur-sm lg:hidden" aria-label="Cerrar menú" type="button" onClick={() => closeMobileNavigation(true)} /> : null}

      <header className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur-md lg:ml-60 lg:px-6">
        <button ref={menuButtonRef} className="grid size-11 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus lg:hidden" type="button" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen} aria-controls="clinic-mobile-navigation" onClick={toggleMobileNavigation}>
          {menuOpen ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
        </button>
        <label className="relative hidden w-full max-w-sm sm:block">
          <span className="sr-only">Buscar en el panel</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input className="h-11 w-full rounded-lg border border-line bg-surface-input pr-3 pl-9 text-xs outline-none placeholder:text-placeholder focus:border-accent focus:ring-3 focus:ring-focus/30 sm:h-9" type="search" placeholder="Buscar pacientes, expedientes, facturas..." />
        </label>
        <span className="ml-auto hidden items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[0.58rem] font-extrabold tracking-wide text-success md:inline-flex"><span className="size-1.5 rounded-full bg-success" /> SINCRONIZADO</span>
        <div className="ml-auto md:ml-0">
          <ClinicalNotificationBell isDrawerOpen={menuOpen} isOpen={notificationOpen} onOpenChange={setNotificationOpen} />
        </div>
        <div className="hidden items-center gap-2 border-l border-line pl-3 sm:flex">
          <div className="max-w-32 text-right"><p className="truncate text-2xs font-extrabold">{userName}</p><p className="text-[0.58rem] font-bold text-accent">{actorContext === "receptionist" ? "Recepción" : "Admin de Clínica"}</p></div>
          <span className="grid size-8 place-items-center rounded-full bg-ink font-mono text-[0.6rem] font-bold text-white">{userName.split(" ").slice(0, 2).map((part) => part[0]).join("")}</span>
          <ChevronDown className="size-3 text-muted" aria-hidden="true" />
        </div>
      </header>

      {menuOpen ? (
        <dialog
          open
          ref={mobileNavigationRef}
          id="clinic-mobile-navigation"
          className="m-0 fixed inset-x-0 top-16 z-30 flex max-h-[calc(100dvh-4rem)] flex-col overflow-hidden border-0 border-b border-line bg-surface p-0 text-ink shadow-[0_1.25rem_3rem_rgb(16_27_51/12%)] lg:hidden"
          aria-modal="true"
          aria-label="Navegación de clínica"
          onCancel={(event) => {
            event.preventDefault();
            closeMobileNavigation(true);
          }}
        >
          <ClinicNavigation actorContext={actorContext} clinicName={clinicName} pathname={pathname} onNavigate={handleNavigation} />
        </dialog>
      ) : null}

      <main id="main-content" className="min-w-0 lg:ml-60">{children}</main>
    </div>
  );
}

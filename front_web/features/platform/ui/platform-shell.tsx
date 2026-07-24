"use client";

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  CircleAlert,
  CreditCard,
  FileText,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Monitor,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import MexicoFlag from "country-flag-icons/react/3x2/MX";
import PeruFlag from "country-flag-icons/react/3x2/PE";
import { LogoutButton } from "@/features/auth/ui/logout-button";
import { BrandLogo } from "@/shared/ui/brand-logo";

type PlatformShellProps = {
  children: React.ReactNode;
  userName: string;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  available?: boolean;
};

const navigationItems: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, available: true },
  { label: "Clínicas", href: "/clinics", icon: Building2, available: true },
  { label: "Usuarios", href: "/users", icon: Users },
  { label: "Membresías", href: "/memberships", icon: CreditCard },
  { label: "Facturación", href: "/billing", icon: FileText },
  { label: "Reportes", href: "/reports", icon: BarChart3 },
  { label: "Monitoreo del sistema", href: "/monitoring", icon: Monitor },
  { label: "Auditoría global", href: "/audit", icon: CircleAlert },
  { label: "Soporte", href: "/support", icon: MessageSquare },
];

const settingsItems = ["General", "Idiomas y región", "Integraciones", "IA epidemiológica", "Notificaciones", "Respaldos"];

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function Navigation({ idPrefix, onNavigate }: { idPrefix: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsId = `${idPrefix}-settings`;

  return (
    <nav aria-label="Navegación principal" className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="grid gap-0.5 px-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                {item.available ? (
                  <Link
                    className={"flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-focus lg:min-h-7 " + (isActive ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-subtle hover:text-ink")}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="size-3.5 shrink-0" strokeWidth={1.7} aria-hidden="true" />
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-muted/70 lg:min-h-7"
                    aria-disabled="true"
                    title="Disponible próximamente"
                  >
                    <Icon className="size-3.5 shrink-0" strokeWidth={1.7} aria-hidden="true" />
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-2 border-t border-line px-2 pt-2">
          <button
            className="flex min-h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus lg:min-h-7"
            type="button"
            aria-expanded={isSettingsOpen}
            aria-controls={settingsId}
            onClick={() => setIsSettingsOpen((current) => !current)}
          >
            <Settings className="size-3.5 text-muted" strokeWidth={1.7} aria-hidden="true" />
            <span>Configuración</span>
            <ChevronDown className={`ml-auto size-3 text-muted transition-transform ${isSettingsOpen ? "rotate-180" : ""}`} strokeWidth={1.7} aria-hidden="true" />
          </button>
          {isSettingsOpen ? (
            <ul className="mt-1 grid gap-0.5 border-l border-line pl-7" id={settingsId}>
              {settingsItems.map((item) => (
                <li className="px-2.5 py-1 text-2xs text-muted/80" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-line p-2">
        <LogoutButton appearance="navigation" />
      </div>
    </nav>
  );
}

function Brand() {
  return (
    <Link className="flex h-14 items-center gap-2.5 px-4 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-focus" href="/dashboard">
      <BrandLogo className="h-8 w-9" priority />
      <span className="text-sm font-extrabold tracking-[0.07em] text-ink">HIPOCRATIQ</span>
    </Link>
  );
}

export function PlatformShell({ children, userName }: PlatformShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-svh bg-paper text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-52 border-r border-line bg-surface lg:flex lg:flex-col">
        <Brand />
        <Navigation idPrefix="desktop" />
      </aside>

      <header className="sticky top-0 z-20 flex h-13 items-center gap-2.5 border-b border-line bg-surface/95 px-4 backdrop-blur-md lg:ml-52 lg:px-5">
        <button
          className="grid size-10 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-3 focus-visible:outline-focus lg:hidden"
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? "Cerrar navegación" : "Abrir navegación"}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          {isMenuOpen ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
        </button>

        <div className="hidden lg:block">
          <span className="sr-only">Hipocratiq</span>
        </div>

        <form action="/clinics" className="relative hidden w-full max-w-xl md:block" role="search">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-icon-input" strokeWidth={1.7} aria-hidden="true" />
          <input
            className="h-8 w-full rounded-lg border border-line bg-paper pr-2.5 pl-8 text-xs text-ink outline-none transition-colors placeholder:text-placeholder focus:border-accent focus:ring-3 focus:ring-focus/45"
            type="search"
            name="q"
            aria-label="Buscar en la plataforma"
            placeholder="Buscar clínicas, usuarios, reportes..."
          />
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center overflow-hidden rounded-lg border border-line text-2xs font-bold sm:flex" aria-label="Países administrados">
            <span className="flex h-7 items-center gap-1.5 border-r border-line px-2.5"><MexicoFlag className="h-3 w-4.5 rounded-[2px]" aria-hidden="true" />MX</span>
            <span className="flex h-7 items-center gap-1.5 px-2.5"><PeruFlag className="h-3 w-4.5 rounded-[2px]" aria-hidden="true" />PE</span>
          </div>
          <button className="relative grid size-7 place-items-center rounded-lg text-muted hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Ver notificaciones">
            <Bell className="size-3.5" strokeWidth={1.7} aria-hidden="true" />
            <span className="absolute top-0 right-0 grid size-3.5 place-items-center rounded-full bg-danger text-2xs font-extrabold text-white">3</span>
          </button>
          <div className="hidden h-8 w-px bg-line sm:block" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-accent text-2xs font-extrabold text-white" aria-hidden="true">{getInitials(userName)}</span>
            <div className="hidden xl:block">
              <p className="max-w-36 truncate text-xs font-extrabold">{userName}</p>
              <p className="text-2xs text-muted">Super Administrador</p>
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen ? (
        <>
          <div className="fixed inset-0 z-20 bg-ink/20 backdrop-blur-sm lg:hidden" aria-hidden="true" onClick={() => setIsMenuOpen(false)} />
          <aside id="mobile-navigation" className="fixed inset-x-0 top-13 z-30 flex max-h-[calc(100dvh-3.25rem)] flex-col overflow-hidden border-b border-line bg-surface shadow-[0_1.25rem_3rem_rgb(16_27_51/12%)] lg:hidden">
            <div className="border-b border-line"><Brand /></div>
            <Navigation idPrefix="mobile" onNavigate={() => setIsMenuOpen(false)} />
          </aside>
        </>
      ) : null}

      <main id="main-content" className="min-w-0 lg:ml-52">
        {children}
      </main>
    </div>
  );
}

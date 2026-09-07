"use client";

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
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
  ShieldCheck,
  Siren,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { LogoutButton } from "@/features/auth/ui/logout-button";
import { getAdminPlatformSettings } from "@/features/platform/api/browser-platform-settings";
import { PLATFORM_SETTINGS_UPDATED_EVENT } from "@/features/platform/model/platform-settings.types";
import { NotificationBell } from "@/features/platform/ui/notification-bell";
import {
  SUPERADMIN_NAVIGATION_INVALIDATED_EVENT,
  type SuperadminNavigationScope,
} from "@/features/platform/model/superadmin-navigation-invalidation";
import { BrandLogo } from "@/shared/ui/brand-logo";
import { CountryFlag, type CountryCode } from "@/shared/ui/country-flag";

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
  { label: "Usuarios", href: "/users", icon: Users, available: true },
  { label: "Roles y permisos", href: "/roles-permissions", icon: ShieldCheck, available: true },
  { label: "Membresías", href: "/memberships", icon: CreditCard, available: true },
  { label: "Facturación", href: "/billing", icon: FileText, available: true },
  { label: "Reportes", href: "/reports", icon: BarChart3, available: true },
  { label: "Monitoreo del sistema", href: "/monitoring", icon: Monitor, available: true },
  { label: "Auditoría global", href: "/audit", icon: CircleAlert, available: true },
  { label: "Emergencia", href: "/emergency", icon: Siren, available: true },
  { label: "Soporte", href: "/support", icon: MessageSquare, available: true },
];

type SettingsItem = { label: string; href: string; available: boolean };

const NAVIGATION_SCOPE_PATHS: Record<SuperadminNavigationScope, readonly string[]> = {
  clinics: ["/dashboard", "/clinics"],
  users: ["/users", "/roles-permissions"],
  "access-control": ["/users", "/roles-permissions"],
};
const PREFETCHABLE_SUPERADMIN_PATHS = new Set(["/dashboard", "/clinics", "/users", "/roles-permissions"]);
const PREFETCH_TTL_MS = 15_000;
const MAX_PREFETCH_ENTRIES = 20;

function isRouteInScopes(key: string, scopes: readonly SuperadminNavigationScope[]): boolean {
  const pathname = key.split("?", 1)[0] ?? "";
  return scopes.some((scope) => NAVIGATION_SCOPE_PATHS[scope].includes(pathname));
}

const settingsItems: SettingsItem[] = [
  { label: "General", href: "/settings/general", available: true },
  { label: "Idiomas y región", href: "/settings/languages", available: true },
  { label: "Integraciones", href: "/settings/integrations", available: true },
  { label: "IA epidemiológica", href: "/settings/ai", available: true },
  { label: "Notificaciones", href: "/settings/notifications", available: true },
  { label: "Respaldos", href: "/settings/backups", available: true },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function Navigation({ idPrefix, onNavigate, onPrefetch }: { idPrefix: string; onNavigate?: () => void; onPrefetch: (href: string) => void }) {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(pathname.startsWith("/settings"));
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
                    className={"flex min-h-11 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-focus lg:min-h-7 " + (isActive ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-subtle hover:text-ink")}
                    href={item.href}
                    prefetch={false}
                    onMouseEnter={() => onPrefetch(item.href)}
                    onFocus={() => onPrefetch(item.href)}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="size-3.5 shrink-0" strokeWidth={1.7} aria-hidden="true" />
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="flex min-h-11 items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-muted/70 lg:min-h-7"
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
            className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus lg:min-h-7"
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
            <ul className="mt-1 grid gap-0.5 border-l border-line pl-4" id={settingsId}>
              {settingsItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <li key={item.label}>
                    {item.available ? (
                      <Link
                        className={"flex min-h-11 items-center rounded-lg px-2.5 text-2xs font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-focus lg:min-h-7 " + (isActive ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-subtle hover:text-ink")}
                        href={item.href}
                        prefetch={false}
                        onMouseEnter={() => onPrefetch(item.href)}
                        onFocus={() => onPrefetch(item.href)}
                        onClick={onNavigate}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="flex min-h-11 items-center rounded-lg px-2.5 text-2xs font-medium text-muted/70 lg:min-h-7" aria-disabled="true" title="Disponible próximamente">
                        {item.label}
                      </span>
                    )}
                  </li>
                );
              })}
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

function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link className="flex h-14 items-center gap-2.5 px-4 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-focus" href="/dashboard" prefetch={false} onClick={onNavigate}>
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent" aria-hidden="true"><BrandLogo className="h-6 w-6 brightness-0 invert" priority /></span>
      <span className="text-sm font-extrabold tracking-[0.07em] text-ink">HIPOCRATIQ</span>
    </Link>
  );
}

export function PlatformShell({ children, userName }: PlatformShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const prefetchedHrefs = useRef(new Map<string, number>());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [headerCountryCodes, setHeaderCountryCodes] = useState<CountryCode[]>(["MX"]);

  const prefetchOnIntent = useCallback((href: string) => {
    if (!PREFETCHABLE_SUPERADMIN_PATHS.has(href.split("?", 1)[0] ?? "")) return;
    const prefetchedAt = prefetchedHrefs.current.get(href);
    if (prefetchedAt && Date.now() - prefetchedAt < PREFETCH_TTL_MS) return;

    prefetchedHrefs.current.set(href, Date.now());
    while (prefetchedHrefs.current.size > MAX_PREFETCH_ENTRIES) {
      const oldestHref = prefetchedHrefs.current.keys().next().value;
      if (oldestHref === undefined) break;
      prefetchedHrefs.current.delete(oldestHref);
    }
    router.prefetch(href, { kind: PrefetchKind.AUTO, onInvalidate: () => prefetchedHrefs.current.delete(href) });
  }, [router]);

  useEffect(() => {
    const invalidateNavigationRoutes = (event: Event) => {
      const detail = (event as CustomEvent<{ scopes?: SuperadminNavigationScope[] }>).detail;
      const scopes: readonly SuperadminNavigationScope[] = detail?.scopes?.length ? detail.scopes : ["clinics"];
      const scopeRoutes = scopes.flatMap((scope) => NAVIGATION_SCOPE_PATHS[scope]);
      const candidateHrefs = new Set([
        ...scopeRoutes,
        ...prefetchedHrefs.current.keys(),
      ]);
      const affectedHrefs = [...candidateHrefs].filter((key) => isRouteInScopes(key, scopes));

      affectedHrefs.forEach((href) => {
        prefetchedHrefs.current.delete(href);
      });

      if (isRouteInScopes(pathname, scopes)) {
        router.refresh();
      }

      for (const href of affectedHrefs) {
        if (href === pathname) continue;
        router.prefetch(href, { kind: PrefetchKind.AUTO, onInvalidate: () => prefetchedHrefs.current.delete(href) });
      }
    };

    window.addEventListener(SUPERADMIN_NAVIGATION_INVALIDATED_EVENT, invalidateNavigationRoutes);
    return () => window.removeEventListener(SUPERADMIN_NAVIGATION_INVALIDATED_EVENT, invalidateNavigationRoutes);
  }, [pathname, router]);

  const handleNavigation = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const refreshSettings = async () => {
      try {
        const settings = await getAdminPlatformSettings(controller.signal);
        setHeaderCountryCodes([
          settings.defaultCountryCode,
          ...settings.headerCountryCodes.filter((countryCode) => countryCode !== settings.defaultCountryCode),
        ]);
      } catch {
        // México permanece como fallback cuando la configuración no está disponible.
      }
    };

    void refreshSettings();
    window.addEventListener(PLATFORM_SETTINGS_UPDATED_EVENT, refreshSettings);

    return () => {
      controller.abort();
      window.removeEventListener(PLATFORM_SETTINGS_UPDATED_EVENT, refreshSettings);
    };
  }, []);

  return (
    <div className="min-h-svh bg-paper text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-52 border-r border-line bg-surface lg:flex lg:flex-col">
        <Brand onNavigate={handleNavigation} />
        <Navigation idPrefix="desktop" onPrefetch={prefetchOnIntent} onNavigate={handleNavigation} />
      </aside>

      <header className="sticky top-0 z-20 flex h-13 items-center gap-2.5 border-b border-line bg-surface/95 px-4 backdrop-blur-md lg:ml-52 lg:px-5">
        <button
          className="grid size-11 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-3 focus-visible:outline-focus lg:hidden"
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
            {headerCountryCodes.map((countryCode) => (
              <span className="flex h-7 items-center gap-1.5 px-2.5 first:border-r first:border-line" key={countryCode}>
                <CountryFlag countryCode={countryCode} className="h-3 w-4.5 rounded-[2px]" />
                {countryCode}
              </span>
            ))}
          </div>
          <NotificationBell />
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
            <div className="border-b border-line"><Brand onNavigate={handleNavigation} /></div>
            <Navigation idPrefix="mobile" onNavigate={handleNavigation} onPrefetch={prefetchOnIntent} />
          </aside>
        </>
      ) : null}

      <main id="main-content" className="min-w-0 lg:ml-52">
        {children}
      </main>
    </div>
  );
}

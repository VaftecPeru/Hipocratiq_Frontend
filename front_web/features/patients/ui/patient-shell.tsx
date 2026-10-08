"use client";

import {
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileText,
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  LoaderCircle,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { LogoutButton } from "@/features/auth/ui/logout-button";
import { PreferenceControls } from "@/shared/ui/preference-controls";

type NavigationItem = {
  labelKey: string;
  href: string;
  icon: typeof LayoutDashboard;
  enabled: boolean;
};

const FOCUSABLE_ELEMENT_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex=\"-1\"])",
].join(",");

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENT_SELECTOR));
}

function PatientAvatar({ userName }: { userName: string }) {
  const initials = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span className="patient-avatar" aria-hidden="true">
      <span className="patient-avatar__hair" />
      <span className="patient-avatar__face">{initials || "P"}</span>
      <span className="patient-avatar__shirt" />
    </span>
  );
}

type PatientTranslator = (key: string, values?: Record<string, string | number>) => string;

function pageMeta(pathname: string, userName: string, t: PatientTranslator) {
  const firstName = userName.trim().split(/\s+/)[0] || "Paciente";

  if (pathname.includes("/citas")) {
    return { title: t("page.appointments.title"), subtitle: t("page.appointments.subtitle") };
  }

  if (pathname.includes("/triaje")) {
    return { title: t("page.triage.title"), subtitle: t("page.triage.subtitle") };
  }

  if (pathname.includes("/historia-clinica")) {
    return { title: t("page.intake.title"), subtitle: t("page.intake.subtitle") };
  }

  if (pathname.includes("/resultados")) {
    return { title: t("page.results.title"), subtitle: t("page.results.subtitle") };
  }

  if (pathname.includes("/historial")) {
    return { title: t("page.history.title"), subtitle: t("page.history.subtitle") };
  }

  if (pathname.includes("/recetas")) {
    return { title: t("page.prescriptions.title"), subtitle: t("page.prescriptions.subtitle") };
  }

  if (pathname.includes("/ia")) {
    return { title: t("page.epidemiology.title"), subtitle: t("page.epidemiology.subtitle") };
  }

  if (pathname.includes("/membresia")) {
    return { title: t("page.membership.title"), subtitle: t("page.membership.subtitle") };
  }

  if (pathname.includes("/perfil")) {
    return { title: t("page.profile.title"), subtitle: t("page.profile.subtitle") };
  }

  return { title: t("page.default.title", { name: firstName }), subtitle: t("page.default.subtitle") };
}

export function PatientShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const t = useTranslations("patient");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [routeTransition, setRouteTransition] = useState<"idle" | "loading" | "complete">("idle");
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const pendingPathRef = useRef<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const menuWasOpenRef = useRef(false);
  const pathname = usePathname();
  const meta = pageMeta(pathname, userName, t);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 920px)");
    const updateViewport = () => setIsMobileViewport(media.matches);
    updateViewport();
    media.addEventListener("change", updateViewport);
    return () => media.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      if (menuWasOpenRef.current) {
        menuWasOpenRef.current = false;
        menuButtonRef.current?.focus();
      }
      return;
    }

    const sidebar = sidebarRef.current;
    if (sidebar === null) return;
    const drawer: HTMLElement = sidebar;

    menuWasOpenRef.current = true;

    function focusFirstElement() {
      const [firstElement] = getFocusableElements(drawer);
      (firstElement ?? drawer).focus();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements(drawer);
      if (focusableElements.length === 0) {
        event.preventDefault();
        drawer.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    function handleFocusIn(event: FocusEvent) {
      if (event.target instanceof Node && !drawer.contains(event.target)) {
        focusFirstElement();
      }
    }

    focusFirstElement();
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (routeTransition !== "loading") return;
    if (pendingPathRef.current === null || pendingPathRef.current !== pathname) return;

    pendingPathRef.current = null;
    setRouteTransition("complete");
    const timeout = window.setTimeout(() => setRouteTransition("idle"), 420);
    return () => window.clearTimeout(timeout);
  }, [pathname, routeTransition]);

  function handlePatientNavigation(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const anchor = target.closest<HTMLAnchorElement>("a[href]");
    if (!anchor) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (anchor.target === "_blank") return;

    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (!url.pathname.startsWith("/patient/")) return;
    if (url.pathname === pathname) return;

    pendingPathRef.current = url.pathname;
    setRouteTransition("loading");
  }

  const navigation: NavigationItem[] = [
    { labelKey: "dashboard", href: "/patient/dashboard", icon: LayoutDashboard, enabled: true },
    { labelKey: "appointments", href: "/patient/citas", icon: CalendarDays, enabled: true },
    { labelKey: "results", href: "/patient/resultados", icon: FlaskConical, enabled: true },
    { labelKey: "history", href: "/patient/historial", icon: FileText, enabled: true },
    { labelKey: "prescriptions", href: "/patient/recetas", icon: HeartPulse, enabled: true },
    { labelKey: "epidemiology", href: "/patient/ia", icon: BrainCircuit, enabled: true },
    { labelKey: "membership", href: "/patient/membresia", icon: CreditCard, enabled: true },
    { labelKey: "profile", href: "/patient/perfil", icon: UserRound, enabled: true },
  ];

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function handleSidebarToggle() {
    if (isMobileViewport) {
      setMenuOpen((open) => !open);
      return;
    }

    setSidebarCollapsed((collapsed) => !collapsed);
  }

  return (
    <div
      className={`patient-shell ${sidebarCollapsed ? "patient-shell--sidebar-collapsed" : ""}`}
      onClickCapture={handlePatientNavigation}
    >
      <aside
        ref={sidebarRef}
        id="patient-mobile-navigation"
        className={`patient-sidebar ${menuOpen ? "patient-sidebar--open" : ""} ${sidebarCollapsed ? "patient-sidebar--collapsed" : ""}`}
        tabIndex={-1}
      >
        <Link className="patient-brand" href="/patient/dashboard" aria-label="HIPOCRATIQ">
          <span className="patient-brand__mark-wrap" aria-hidden="true">
            <Image
              className="patient-brand__symbol"
              src="/logo_hipocratiq.webp"
              alt=""
              width={34}
              height={34}
              priority
            />
          </span>
          <Image
            className="patient-brand__wordmark"
            src="/logo_hipogratiq_1.png"
            alt="HIPOCRATIQ"
            width={146}
            height={26}
            priority
          />
        </Link>

        <div className="patient-user-card">
          <PatientAvatar userName={userName} />
          <div className="patient-user-card__copy">
            <p>{userName || "Paciente"}</p>
          <span>{t("account")}</span>
          </div>
        </div>

        <nav className="patient-nav" aria-label={t("navigation.ariaLabel")}>
          <ul>
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  {item.enabled ? (
                    <Link
                      className={`patient-nav__item ${active ? "patient-nav__item--active" : ""}`}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon className="size-[17px]" strokeWidth={1.8} aria-hidden="true" />
                       <span>{t(`navigation.${item.labelKey}`)}</span>
                    </Link>
                  ) : (
                    <span className="patient-nav__item patient-nav__item--disabled" aria-disabled="true">
                      <Icon className="size-[17px]" strokeWidth={1.8} aria-hidden="true" />
                       <span>{t(`navigation.${item.labelKey}`)}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="patient-sidebar__footer">
          <LogoutButton appearance="navigation" />
        </div>
      </aside>

      {menuOpen ? (
        <button
          className="patient-sidebar__overlay"
          type="button"
           aria-label={t("closeMenu")}
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <div className="patient-content">
        <header className="patient-topbar">
          <button
            ref={menuButtonRef}
            className="patient-mobile-menu"
            type="button"
             aria-label={
              isMobileViewport
                ? (menuOpen ? t("closeMenu") : t("openMenu"))
                : (sidebarCollapsed ? "Mostrar menú lateral" : "Ocultar menú lateral")
            }
            aria-expanded={isMobileViewport ? menuOpen : !sidebarCollapsed}
            aria-controls="patient-mobile-navigation"
            onClick={handleSidebarToggle}
          >
            {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>

          <div className="patient-topbar__heading">
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>

          <div className="patient-topbar__actions">
            <PreferenceControls idPrefix="patient-header" />
            <Link className="patient-topbar__cta" href="/patient/triaje">
              <ClipboardCheck className="size-4" aria-hidden="true" />
              <span>{t("prepareAppointment")}</span>
            </Link>
          </div>

        </header>

        <main id="main-content" className="patient-main">{children}</main>
      </div>

      {routeTransition !== "idle" ? (
        <div
          className={`patient-route-transition patient-route-transition--${routeTransition}`}
          role="status"
          aria-live="polite"
          aria-busy={routeTransition === "loading"}
          data-testid="patient-route-transition"
        >
          <div className="patient-route-transition__card">
            <span className="patient-route-transition__logo" aria-hidden="true">
              <Image src="/logo_hipocratiq.webp" alt="" width={50} height={50} priority />
            </span>
            <div className="patient-route-transition__brand">HIPOCRATIQ</div>
            <div className="patient-route-transition__status">
              {routeTransition === "loading" ? (
                <LoaderCircle className="size-5 patient-route-transition__spinner" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="size-5" aria-hidden="true" />
              )}
              <strong>{routeTransition === "loading" ? "Cargando..." : "Completado"}</strong>
            </div>
            <div className="patient-route-transition__track" aria-hidden="true">
              <span />
            </div>
            <p>{routeTransition === "loading" ? "Preparando tu información de salud" : "Vista lista"}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

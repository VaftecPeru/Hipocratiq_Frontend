"use client";

import {
  BrainCircuit,
  CalendarDays,
  CreditCard,
  FileText,
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoutButton } from "@/features/auth/ui/logout-button";

type NavigationItem = {
  label: string;
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

function pageMeta(pathname: string, userName: string) {
  const firstName = userName.trim().split(/\s+/)[0] || "Paciente";

  if (pathname.includes("/citas")) {
    return {
      title: "Mis Citas",
      subtitle: "Consulta las citas registradas y sus datos de atención.",
    };
  }

  if (pathname.includes("/triaje")) {
    return {
      title: "Dashboard Paciente · Triaje",
      subtitle: "Completa tus signos vitales y motivo de consulta antes de la atención.",
    };
  }

  if (pathname.includes("/resultados")) {
    return {
      title: "Resultados",
      subtitle: "Consulta los estudios de laboratorio vinculados a tu perfil.",
    };
  }

  if (pathname.includes("/historial")) {
    return {
      title: "Historial Clínico",
      subtitle: "Revisa las consultas finalizadas o firmadas disponibles.",
    };
  }

  if (pathname.includes("/recetas")) {
    return {
      title: "Recetas",
      subtitle: "Consulta las recetas registradas por tus profesionales.",
    };
  }

  if (pathname.includes("/ia")) {
    return {
      title: "IA Epidemiológica",
      subtitle: "Consulta si existe una fuente epidemiológica vinculada a tu cuenta.",
    };
  }

  if (pathname.includes("/membresia")) {
    return {
      title: "Membresía",
      subtitle: "Consulta si existe una membresía individual persistida para tu cuenta.",
    };
  }

  if (pathname.includes("/perfil")) {
    return {
      title: "Mi Perfil",
      subtitle: "Gestiona tu información personal, datos de contacto y preferencias.",
    };
  }

  return {
    title: `Bienvenida de nuevo, ${firstName}`,
    subtitle: "Aquí puedes revisar tus citas, resultados y recetas en un solo lugar.",
  };
}

export function PatientShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const menuWasOpenRef = useRef(false);
  const pathname = usePathname();
  const meta = pageMeta(pathname, userName);

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

  const navigation: NavigationItem[] = [
    { label: "Mi Panel", href: "/patient/dashboard", icon: LayoutDashboard, enabled: true },
    { label: "Mis Citas", href: "/patient/citas", icon: CalendarDays, enabled: true },
    { label: "Triaje", href: "/patient/triaje", icon: SlidersHorizontal, enabled: true },
    { label: "Resultados", href: "/patient/resultados", icon: FlaskConical, enabled: true },
    { label: "Historial Clínico", href: "/patient/historial", icon: FileText, enabled: true },
    { label: "Recetas", href: "/patient/recetas", icon: HeartPulse, enabled: true },
    { label: "IA Epidemiológica", href: "/patient/ia", icon: BrainCircuit, enabled: true },
    { label: "Membresía", href: "/patient/membresia", icon: CreditCard, enabled: true },
    { label: "Mi Perfil", href: "/patient/perfil", icon: UserRound, enabled: true },
  ];

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="patient-shell">
      <aside
        ref={sidebarRef}
        id="patient-mobile-navigation"
        className={`patient-sidebar ${menuOpen ? "patient-sidebar--open" : ""}`}
        tabIndex={-1}
      >
        <div className="patient-brand" aria-label="MEDIQ">
          <span className="patient-brand__mark">
            <ShieldCheck className="size-5" strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className="patient-brand__word">MEDIQ</span>
        </div>

        <div className="patient-user-card">
          <PatientAvatar userName={userName} />
          <div className="patient-user-card__copy">
            <p>{userName || "Paciente"}</p>
            <span>Cuenta autenticada</span>
          </div>
        </div>

        <nav className="patient-nav" aria-label="Navegación del paciente">
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
                      <span>{item.label}</span>
                    </Link>
                  ) : (
                    <span className="patient-nav__item patient-nav__item--disabled" aria-disabled="true">
                      <Icon className="size-[17px]" strokeWidth={1.8} aria-hidden="true" />
                      <span>{item.label}</span>
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
          aria-label="Cerrar menú"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <div className="patient-content">
        <header className="patient-topbar">
          <button
            ref={menuButtonRef}
            className="patient-mobile-menu"
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="patient-mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>

          <div className="patient-topbar__heading">
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>

        </header>

        <main id="main-content" className="patient-main">{children}</main>
      </div>
    </div>
  );
}

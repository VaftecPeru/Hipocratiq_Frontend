"use client";

import {
  Bell,
  BrainCircuit,
  CalendarDays,
  CreditCard,
  FileText,
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoutButton } from "@/features/auth/ui/logout-button";

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  enabled: boolean;
};

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
      <span className="patient-avatar__face">{initials || "AM"}</span>
      <span className="patient-avatar__shirt" />
    </span>
  );
}

function pageMeta(pathname: string, userName: string) {
  const firstName = userName.trim().split(/\s+/)[0] || "Paciente";

  if (pathname.includes("/citas")) {
    return {
      title: "Mis Citas",
      subtitle: "Administra tus próximas citas, historial y teleconsultas.",
      action: "Agendar Nueva Cita",
    };
  }

  if (pathname.includes("/triaje")) {
    return {
      title: "Dashboard Paciente · Triaje",
      subtitle: "Completa tus signos vitales y motivo de consulta antes de la atención.",
      action: "Enviar Triaje",
    };
  }

  if (pathname.includes("/resultados")) {
    return {
      title: "Resultados",
      subtitle: "Consulta tus estudios, análisis y documentos médicos.",
      action: "Agendar Nueva Cita",
    };
  }

  if (pathname.includes("/historial")) {
    return {
      title: "Historial Clínico",
      subtitle: "Revisa tus atenciones, diagnósticos y evolución médica.",
      action: "Agendar Nueva Cita",
    };
  }

  if (pathname.includes("/recetas")) {
    return {
      title: "Recetas",
      subtitle: "Gestiona tus medicamentos, renovaciones y tratamientos.",
      action: "Agendar Nueva Cita",
    };
  }

  if (pathname.includes("/ia")) {
    return {
      title: "IA Epidemiológica",
      subtitle: "Monitorea el riesgo epidemiológico en tu zona y recibe recomendaciones para cuidarte.",
      action: "Agendar Nueva Cita",
    };
  }

  if (pathname.includes("/membresia")) {
    return {
      title: "Membresía",
      subtitle: "Administra tu plan MEDIQ, beneficios, pagos y cobertura familiar.",
      action: "Agendar Nueva Cita",
    };
  }

  if (pathname.includes("/perfil")) {
    return {
      title: "Mi Perfil",
      subtitle: "Gestiona tu información personal, datos de contacto y preferencias.",
      action: "Agendar Nueva Cita",
    };
  }

  return {
    title: `Bienvenida de nuevo, ${firstName}`,
    subtitle: "Aquí puedes revisar tus citas, resultados y recetas en un solo lugar.",
    action: "Agendar Nueva Cita",
  };
}

export function PatientShell({
  children,
  userName,
  patientId,
}: {
  children: React.ReactNode;
  userName: string;
  patientId?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const meta = pageMeta(pathname, userName);
  const showTriage = pathname.includes("/triaje");

  const navigation: NavigationItem[] = [
    { label: "Mi Panel", href: "/patient/dashboard", icon: LayoutDashboard, enabled: true },
    { label: "Mis Citas", href: "/patient/citas", icon: CalendarDays, enabled: true },
    ...(showTriage
      ? [{ label: "Triaje", href: "/patient/triaje", icon: SlidersHorizontal, enabled: true }]
      : []),
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
      <aside className={`patient-sidebar ${menuOpen ? "patient-sidebar--open" : ""}`}>
        <div className="patient-brand" aria-label="MEDIQ">
          <span className="patient-brand__mark">
            <ShieldCheck className="size-5" strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className="patient-brand__word">MEDIQ</span>
        </div>

        <div className="patient-user-card">
          <PatientAvatar userName={userName} />
          <div className="patient-user-card__copy">
            <p>{userName || "Ana Martínez"}</p>
            <span>Paciente #{patientId || "44021"}</span>
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
            className="patient-mobile-menu"
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>

          <div className="patient-topbar__heading">
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>

          <div className="patient-topbar__actions">
            <button className="patient-icon-button" type="button" aria-label="Ver notificaciones">
              <Bell className="size-[17px]" strokeWidth={1.8} aria-hidden="true" />
              <span className="patient-notification-dot" aria-hidden="true" />
            </button>
            <button className="patient-icon-button" type="button" aria-label="Abrir mensajes">
              <MessageCircle className="size-[17px]" strokeWidth={1.8} aria-hidden="true" />
            </button>
            <button className="patient-primary-button patient-topbar__cta" type="button">
              {showTriage ? <Plus className="size-4" aria-hidden="true" /> : <CalendarDays className="size-4" aria-hidden="true" />}
              <span>{meta.action}</span>
            </button>
          </div>
        </header>

        <main className="patient-main">{children}</main>
      </div>
    </div>
  );
}

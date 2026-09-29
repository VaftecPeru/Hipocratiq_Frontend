"use client";

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
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
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LogoutButton } from "@/features/auth/ui/logout-button";
import { ClinicalNotificationBell } from "@/features/platform/ui/clinical-notification-bell";
import { PreferenceControls } from "@/shared/ui/preference-controls";

type NavigationItem = {
  labelKey: string;
  href: string;
  icon: LucideIcon;
  available?: boolean;
};

const navigation: NavigationItem[] = [
  { labelKey: "home", href: "/doctor/dashboard", icon: House, available: true },
  { labelKey: "agenda", href: "/doctor/agenda", icon: CalendarDays, available: true },
  { labelKey: "patients", href: "/doctor/pacientes", icon: Users, available: true },
  { labelKey: "consultations", href: "/doctor/consultas", icon: ClipboardList, available: true },
  { labelKey: "prescriptions", href: "/doctor/recetas", icon: FileText, available: true },
  { labelKey: "laboratory", href: "/doctor/laboratorio", icon: FlaskConical, available: true },
  { labelKey: "imaging", href: "/doctor/imagenologia", icon: ImageIcon, available: true },
  { labelKey: "telemedicine", href: "/doctor/telemedicina", icon: Video, available: true },
  { labelKey: "messages", href: "/doctor/mensajes", icon: MessageSquare, available: true },
  { labelKey: "reports", href: "/doctor/reportes", icon: BarChart3, available: true },
  { labelKey: "epidemiology", href: "/doctor/epidemiologia", icon: BrainCircuit, available: true },
  { labelKey: "settings", href: "/doctor/configuracion", icon: Settings, available: true },
];

function SidebarLink({ item, pathname, closeMenu }: Readonly<{ item: NavigationItem; pathname: string; closeMenu: () => void }>) {
  const t = useTranslations("doctor");
  const Icon = item.icon;
  const isActive = pathname === item.href;

  if (!item.available) {
    return (
        <span className="flex min-h-9 items-center gap-3 rounded-lg px-3 text-[0.7rem] font-extrabold text-ink-secondary/80" aria-disabled="true" title={t("navigation.soon")}>
        <Icon className="size-[15px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
        {t(`navigation.${item.labelKey}`)}
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
      {t(`navigation.${item.labelKey}`)}
    </Link>
  );
}

export function DoctorShell({
  children,
  userName,
  subtitle,
  practiceName,
  practiceDetail,
  currentDate,
}: {
  children: React.ReactNode;
  userName: string;
  subtitle: string;
  practiceName: string;
  practiceDetail: string;
  currentDate: string;
}) {
  const t = useTranslations("doctor");
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const initials = userName.split(/\s+/).map((name) => name[0]).join("").slice(0, 2).toUpperCase() || "DR";

  return (
    <div className="min-h-svh bg-paper text-ink">
      <aside className={`${menuOpen ? "flex" : "hidden"} fixed inset-y-0 left-0 z-40 w-60 flex-col border-r border-line bg-surface lg:flex`}>
        <div className="flex h-[70px] items-center border-b border-line px-4">
          <Link className="flex min-h-11 min-w-0 items-center focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus" href="/doctor/dashboard" onClick={() => setMenuOpen(false)}>
            <span className="grid size-[34px] shrink-0 place-items-center rounded-[10px] bg-accent p-1.5 shadow-[0_0.45rem_1rem_rgb(8_98_221/22%)]">
              <Image className="size-full object-contain brightness-0 invert" src="/logo_hipocratiq.webp" width={28} height={28} alt="" priority />
            </span>
            <span className="ml-2 truncate text-sm font-extrabold tracking-[0.06em]">HIPOCRATIQ</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label={t("navigation.ariaLabel")}>
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
               <p className="truncate text-[0.62rem] font-extrabold">{practiceName}</p>
               <p className="truncate text-[0.55rem] font-semibold text-muted">{practiceDetail}</p>
            </div>
            <span className="ml-auto text-muted" aria-hidden="true">›</span>
          </div>
          <LogoutButton appearance="navigation" />
        </div>
      </aside>

      {menuOpen ? (
        <button
          className="fixed inset-0 z-30 cursor-default border-0 bg-ink/20 backdrop-blur-sm lg:hidden"
          type="button"
          aria-label={t("closeMenu")}
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <header className="sticky top-0 z-20 flex h-[70px] items-center gap-3 border-b border-line bg-surface/95 px-3 backdrop-blur-md sm:px-5 lg:ml-60 lg:px-6">
        <button
          className="grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus lg:hidden"
          type="button"
           aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
        </button>

        <label className="flex h-9 min-w-0 max-w-[550px] flex-1 items-center gap-2 rounded-[9px] border border-line bg-surface-input px-3 text-muted focus-within:border-focus focus-within:ring-2 focus-within:ring-focus/20">
          <Search className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
           <span className="sr-only">{t("searchLabel")}</span>
           <input className="min-w-0 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-placeholder" placeholder={t("searchPlaceholder")} />
        </label>

        <div className="ml-auto hidden items-center gap-3 text-[0.66rem] font-extrabold text-ink-secondary xl:flex">
          <span className="inline-flex items-center gap-2 whitespace-nowrap border-r border-line pr-5">
            <CalendarDays className="size-4 text-ink" strokeWidth={1.8} aria-hidden="true" />
             {currentDate}
           </span>
             <Link className="relative grid size-8 place-items-center rounded-lg text-ink-secondary hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" href="/doctor/mensajes" aria-label={t("viewMessages")}>
             <Mail className="size-[17px]" strokeWidth={1.8} aria-hidden="true" />
           </Link>
           <button className="grid size-8 place-items-center rounded-lg text-ink-secondary hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label={t("help")}>
            <span className="grid size-4 place-items-center rounded-full border border-current text-[0.65rem] font-extrabold">?</span>
          </button>
         </div>

          <PreferenceControls idPrefix="doctor-header" />
          <ClinicalNotificationBell />
          <button className="flex min-w-0 items-center gap-2 rounded-[10px] border border-line bg-surface px-2 py-1.5 text-left hover:border-line-strong focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label={t("profile")}>
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-[0.6rem] font-extrabold text-white ring-2 ring-accent-soft">{initials}</span>
          <span className="hidden min-w-0 sm:block">
            <span className="block max-w-28 truncate text-[0.68rem] font-extrabold">{userName}</span>
            <span className="block max-w-28 truncate text-[0.55rem] font-bold text-ink-secondary">{subtitle.split("·")[0].trim()}</span>
          </span>
          <span className="hidden text-muted sm:block" aria-hidden="true">⌄</span>
        </button>
         <span className="hidden items-center gap-1.5 rounded-full bg-success-soft px-2 py-1 text-[0.56rem] font-extrabold text-success md:inline-flex">
           <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />{t("online")}
        </span>
      </header>

      <main className="min-w-0 lg:ml-60">{children}</main>
    </div>
  );
}

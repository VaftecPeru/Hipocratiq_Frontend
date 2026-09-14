"use client";

import { Bell, CheckCheck, ShieldAlert, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getClinicalNotifications,
  markAllClinicalNotificationsRead,
  markClinicalNotificationsRead,
} from "@/features/platform/api/browser-notifications";
import type { ClinicalNotificationCenterData } from "@/features/platform/model/clinical-notification.types";

type ClinicalNotificationBellProps = Readonly<{
  isDrawerOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}>;

export function ClinicalNotificationBell({
  isDrawerOpen = false,
  isOpen: controlledIsOpen,
  onOpenChange,
}: ClinicalNotificationBellProps = {}) {
  const t = useTranslations("clinicalNotifications");
  const locale = useLocale();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerOpenRef = useRef(isDrawerOpen);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = !isDrawerOpen && (controlledIsOpen ?? internalIsOpen);
  const [data, setData] = useState<ClinicalNotificationCenterData | null>(null);
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
    [locale],
  );

  useEffect(() => {
    drawerOpenRef.current = isDrawerOpen;
  }, [isDrawerOpen]);

  const setOpen = useCallback((open: boolean) => {
    if (open && drawerOpenRef.current) return;
    if (!isControlled) setInternalIsOpen(open);
    onOpenChange?.(open);
  }, [isControlled, onOpenChange]);

  const closeMenu = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => {
        if (!drawerOpenRef.current) triggerRef.current?.focus();
      });
    }
  }, [setOpen]);

  useEffect(() => {
    const controller = new AbortController();
    const load = () => {
      void getClinicalNotifications(controller.signal)
        .then(setData)
        .catch(() => undefined);
    };

    load();
    const interval = window.setInterval(load, 60_000);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!isOpen || isDrawerOpen) return undefined;

    const menu = menuRef.current;
    if (!menu) return undefined;

    const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusableElements = () => Array.from(menu.querySelectorAll<HTMLElement>(focusableSelector));
    getFocusableElements()[0]?.focus();

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) closeMenu(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;
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

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [closeMenu, isDrawerOpen, isOpen]);

  async function openNotification(id: string, href: string, isRead: boolean) {
    if (isDrawerOpen) return;

    if (!isRead) {
      try {
        await markClinicalNotificationsRead([id]);
        setData((current) => current ? {
          ...current,
          unreadCount: Math.max(0, current.unreadCount - 1),
          notifications: current.notifications.map((item) => item.id === id ? { ...item, read: true } : item),
        } : current);
      } catch {
        // Navigation remains available even if the read acknowledgement fails.
      }
    }

    closeMenu(false);
    router.push(href);
  }

  async function markAll() {
    try {
      await markAllClinicalNotificationsRead();
      setData((current) => current ? {
        ...current,
        unreadCount: 0,
        notifications: current.notifications.map((item) => ({ ...item, read: true })),
      } : current);
    } catch {
      // The next polling cycle will reconcile the state if the request failed.
    }
  }

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        ref={triggerRef}
        className="relative grid size-11 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-3 focus-visible:outline-focus sm:size-9"
        type="button"
        aria-label={unreadCount > 0 ? t("viewWithCount", { count: unreadCount }) : t("view")}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls="clinical-notifications-menu"
        onClick={() => (isOpen ? closeMenu(true) : setOpen(true))}
      >
        <Bell className="size-4" strokeWidth={1.7} aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 grid min-w-3.5 place-items-center rounded-full bg-danger px-1 text-[0.55rem] font-extrabold leading-3.5 text-white" aria-hidden="true">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <dialog
          open
          ref={menuRef}
          className="m-0 absolute top-[calc(100%+0.65rem)] right-0 left-auto z-50 w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-line bg-surface p-0 text-ink shadow-[0_1rem_3rem_rgb(16_27_51/16%)] sm:w-96 sm:max-w-[calc(100vw-2rem)]"
          id="clinical-notifications-menu"
          aria-modal="true"
          aria-label={t("title")}
          onCancel={(event) => {
            event.preventDefault();
            closeMenu(true);
          }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-xs font-extrabold">{t("title")}</p>
              <p className="text-2xs text-muted">{t("unreadCount", { count: unreadCount })}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-2xs font-bold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus disabled:opacity-50 sm:min-h-8"
                type="button"
                disabled={unreadCount === 0}
                onClick={() => void markAll()}
              >
                <CheckCheck className="size-3" aria-hidden="true" />
                {t("markAll")}
              </button>
              <button
                className="grid size-11 place-items-center rounded-lg text-muted hover:bg-surface-subtle hover:text-ink focus-visible:outline-3 focus-visible:outline-focus sm:size-8"
                type="button"
                aria-label={t("close")}
                onClick={() => closeMenu(true)}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <ul className="max-h-[min(20rem,calc(100dvh-9rem))] divide-y divide-line overflow-y-auto">
            {(data?.notifications.slice(0, 6) ?? []).map((notification) => {
              const isPublished = notification.eventKey === "emergency_published";
              const title = isPublished ? t("emergency.publishedTitle") : t("emergency.activatedTitle");
              const message = isPublished
                ? t("emergency.publishedMessage", { clinic: notification.payload.clinicName ?? notification.clinic.name ?? t("unknownClinic") })
                : t("emergency.activatedMessage", { clinic: notification.payload.clinicName ?? notification.clinic.name ?? t("unknownClinic") });

              return (
                <li key={notification.id}>
                  <button
                    className={`flex min-h-11 w-full items-start gap-2.5 px-3 py-3 text-left hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-inset focus-visible:outline-focus ${notification.read ? "opacity-70" : "bg-danger-soft/20"}`}
                    type="button"
                    onClick={() => void openNotification(notification.id, notification.href, notification.read)}
                  >
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-danger-soft text-danger" aria-hidden="true">
                      <ShieldAlert className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-extrabold">{title}</span>
                      <span className="mt-0.5 block truncate text-2xs text-muted">{message}</span>
                      {notification.payload.note ? <span className="mt-0.5 block truncate text-2xs text-muted">{notification.payload.note}</span> : null}
                      <time className="mt-1 block text-2xs text-muted" dateTime={notification.occurredAt}>{dateFormatter.format(new Date(notification.occurredAt))}</time>
                    </span>
                    {!notification.read ? <><span className="mt-1.5 size-1.5 rounded-full bg-danger" aria-hidden="true" /><span className="sr-only">{t("unread")}</span></> : null}
                  </button>
                </li>
              );
            })}
            {data?.notifications.length === 0 ? <li className="p-6 text-center text-xs text-muted">{t("empty")}</li> : null}
            {!data ? <li className="p-6 text-center text-xs text-muted" aria-live="polite">{t("loading")}</li> : null}
          </ul>
        </dialog>
      ) : null}
    </div>
  );
}

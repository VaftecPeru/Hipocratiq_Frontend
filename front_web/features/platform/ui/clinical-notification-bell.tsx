"use client";

import { Bell, CheckCheck, ShieldAlert } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getClinicalNotifications,
  markAllClinicalNotificationsRead,
  markClinicalNotificationsRead,
} from "@/features/platform/api/browser-notifications";
import type { ClinicalNotificationCenterData } from "@/features/platform/model/clinical-notification.types";

export function ClinicalNotificationBell() {
  const t = useTranslations("clinicalNotifications");
  const locale = useLocale();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<ClinicalNotificationCenterData | null>(null);
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
    [locale],
  );

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
    if (!isOpen) return undefined;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        window.requestAnimationFrame(() => triggerRef.current?.focus());
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  async function openNotification(id: string, href: string, isRead: boolean) {
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

    setIsOpen(false);
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
    <div className="relative" ref={containerRef}>
      <button
        ref={triggerRef}
        className="relative grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        aria-label={unreadCount > 0 ? t("viewWithCount", { count: unreadCount }) : t("view")}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls="clinical-notifications-menu"
        onClick={() => setIsOpen((current) => !current)}
      >
        <Bell className="size-4" strokeWidth={1.7} aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 grid min-w-3.5 place-items-center rounded-full bg-danger px-1 text-[0.55rem] font-extrabold leading-3.5 text-white" aria-hidden="true">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          className="absolute top-[calc(100%+0.65rem)] right-0 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line bg-surface text-ink shadow-[0_1rem_3rem_rgb(16_27_51/16%)]"
          id="clinical-notifications-menu"
          role="dialog"
          aria-label={t("title")}
        >
          <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2.5">
            <div>
              <p className="text-xs font-extrabold">{t("title")}</p>
              <p className="text-2xs text-muted">{t("unreadCount", { count: unreadCount })}</p>
            </div>
            <button
              className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-2xs font-bold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus disabled:opacity-50"
              type="button"
              disabled={unreadCount === 0}
              onClick={() => void markAll()}
            >
              <CheckCheck className="size-3" aria-hidden="true" />
              {t("markAll")}
            </button>
          </div>
          <ul className="max-h-80 divide-y divide-line overflow-y-auto">
            {(data?.notifications.slice(0, 6) ?? []).map((notification) => {
              const isPublished = notification.eventKey === "emergency_published";
              const title = isPublished ? t("emergency.publishedTitle") : t("emergency.activatedTitle");
              const message = isPublished
                ? t("emergency.publishedMessage", { clinic: notification.payload.clinicName ?? notification.clinic.name ?? t("unknownClinic") })
                : t("emergency.activatedMessage", { clinic: notification.payload.clinicName ?? notification.clinic.name ?? t("unknownClinic") });

              return (
                <li key={notification.id}>
                  <button
                    className={`flex w-full items-start gap-2.5 px-3 py-3 text-left hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-inset focus-visible:outline-focus ${notification.read ? "opacity-70" : "bg-danger-soft/20"}`}
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
        </div>
      ) : null}
    </div>
  );
}

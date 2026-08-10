"use client";

import { Bell, CheckCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getAdminNotifications, markAdminNotificationsRead, markAllAdminNotificationsRead } from "@/features/platform/api/browser-notifications";
import type { AdminNotificationCenterData } from "@/features/platform/model/admin-notification.types";

const dateFormatter = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export function NotificationBell() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<AdminNotificationCenterData | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = () => { void getAdminNotifications(controller.signal).then(setData).catch(() => undefined); };
    load();
    const interval = window.setInterval(load, 60_000);
    return () => { controller.abort(); window.clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [isOpen]);

  async function openNotification(id: string, href: string, isRead: boolean) {
    if (!isRead) {
      await markAdminNotificationsRead([id]);
      setData((current) => current ? { ...current, unreadCount: Math.max(0, current.unreadCount - 1), notifications: current.notifications.map((item) => item.id === id ? { ...item, read: true } : item) } : current);
    }
    setIsOpen(false);
    router.push(href);
  }

  async function markAll() {
    await markAllAdminNotificationsRead();
    setData((current) => current ? { ...current, unreadCount: 0, notifications: current.notifications.map((item) => ({ ...item, read: true })) } : current);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button className="relative grid size-7 place-items-center rounded-lg text-muted hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Ver notificaciones" aria-expanded={isOpen} onClick={() => setIsOpen((current) => !current)}>
        <Bell className="size-3.5" strokeWidth={1.7} aria-hidden="true" />
        {data?.unreadCount ? <span className="absolute -top-1 -right-1 grid min-w-3.5 place-items-center rounded-full bg-danger px-1 text-[0.55rem] font-extrabold leading-3.5 text-white">{data.unreadCount > 99 ? "99+" : data.unreadCount}</span> : null}
      </button>
      {isOpen ? (
        <div className="absolute top-[calc(100%+0.65rem)] right-0 z-50 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line bg-surface shadow-[0_1rem_3rem_rgb(16_27_51/16%)]">
          <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2.5"><div><p className="text-xs font-extrabold">Notificaciones</p><p className="text-2xs text-muted">{data?.unreadCount ?? 0} sin leer</p></div><button className="inline-flex min-h-7 items-center gap-1 rounded-lg px-2 text-2xs font-bold text-accent hover:bg-accent-soft disabled:opacity-50" type="button" disabled={!data?.unreadCount} onClick={() => void markAll()}><CheckCheck className="size-3" aria-hidden="true" />Leer todas</button></div>
          <ul className="max-h-80 overflow-y-auto divide-y divide-line">
            {(data?.notifications.slice(0, 6) ?? []).map((notification) => (
              <li key={notification.id}><button className={`flex w-full items-start gap-2.5 px-3 py-3 text-left hover:bg-surface-subtle ${notification.read ? "opacity-70" : "bg-accent-soft/25"}`} type="button" onClick={() => void openNotification(notification.id, notification.href, notification.read)}><span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg ${notification.severity === "critical" ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning"}`}><ShieldAlert className="size-3.5" aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-extrabold">{notification.title}</span><span className="mt-0.5 block truncate text-2xs text-muted">{notification.message}</span><time className="mt-1 block text-2xs text-muted">{dateFormatter.format(new Date(notification.occurredAt))}</time></span>{!notification.read ? <span className="mt-1.5 size-1.5 rounded-full bg-accent" aria-label="Sin leer" /> : null}</button></li>
            ))}
            {data?.notifications.length === 0 ? <li className="p-6 text-center text-xs text-muted">No hay notificaciones operativas.</li> : null}
          </ul>
          <Link className="flex min-h-9 items-center justify-center border-t border-line text-2xs font-bold text-accent hover:bg-accent-soft" href="/settings/notifications" onClick={() => setIsOpen(false)}>Abrir centro de notificaciones</Link>
        </div>
      ) : null}
    </div>
  );
}

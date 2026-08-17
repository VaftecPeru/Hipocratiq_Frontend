"use client";

import { Bell, CheckCheck, RefreshCw, ShieldAlert, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAdminNotifications, markAdminNotificationsRead, markAllAdminNotificationsRead } from "@/features/platform/api/browser-notifications";
import type { AdminNotification, AdminNotificationCenterData, AdminNotificationType } from "@/features/platform/model/admin-notification.types";
import { CountryFlag } from "@/shared/ui/country-flag";
import { DataBadge } from "@/shared/ui/data-badge";
import { FilterSelect } from "@/shared/ui/filter-select";
import { StatCard } from "@/shared/ui/stat-card";

const TYPE_LABELS: Record<AdminNotificationType, string> = { audit: "Auditoría", incident: "Incidente", support: "Soporte" };
const dateTimeFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });

export function NotificationsCenter() {
  const [data, setData] = useState<AdminNotificationCenterData | null>(null);
  const [type, setType] = useState<AdminNotificationType | "all">("all");
  const [visibility, setVisibility] = useState<"all" | "unread">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(signal?: AbortSignal) {
    try { const result = await getAdminNotifications(signal); setData(result); setError(null); }
    catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setError(requestError instanceof Error ? requestError.message : "No pudimos cargar las notificaciones.");
    } finally { if (!signal?.aborted) setIsLoading(false); }
  }

  useEffect(() => {
    const controller = new AbortController();
    getAdminNotifications(controller.signal)
      .then((result) => { setData(result); setError(null); })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(requestError instanceof Error ? requestError.message : "No pudimos cargar las notificaciones.");
      })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => (data?.notifications ?? []).filter((notification) => {
    if (type !== "all" && notification.type !== type) return false;
    if (visibility === "unread" && notification.read) return false;
    return true;
  }), [data?.notifications, type, visibility]);
  const criticalCount = data?.notifications.filter((item) => item.severity === "critical" && !item.read).length ?? 0;
  const warningCount = data?.notifications.filter((item) => item.severity === "warning" && !item.read).length ?? 0;

  async function markRead(notification: AdminNotification) {
    if (notification.read) return;
    await markAdminNotificationsRead([notification.id]);
    setData((current) => current ? { ...current, unreadCount: Math.max(0, current.unreadCount - 1), notifications: current.notifications.map((item) => item.id === notification.id ? { ...item, read: true } : item) } : current);
  }

  async function markAll() {
    await markAllAdminNotificationsRead();
    setData((current) => current ? { ...current, unreadCount: 0, notifications: current.notifications.map((item) => ({ ...item, read: true })) } : current);
  }

  const stats = [
    { label: "Notificaciones", value: String(data?.total ?? 0), change: "Fuentes operativas", direction: "up" as const, icon: Bell, tone: "accent" as const },
    { label: "Sin leer", value: String(data?.unreadCount ?? 0), change: "Pendientes de revisión", direction: "down" as const, icon: ShieldAlert, tone: "violet" as const },
    { label: "Críticas", value: String(criticalCount), change: "Atención prioritaria", direction: "down" as const, icon: ShieldAlert, tone: "warning" as const },
    { label: "Advertencias", value: String(warningCount), change: "SLA y señales", direction: "down" as const, icon: TriangleAlert, tone: "success" as const },
  ];

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-2xs font-extrabold tracking-[0.14em] text-accent uppercase">Supervisión global</p><h1 className="mt-1 text-[clamp(1.3rem,1.8vw,1.6rem)] font-extrabold tracking-[-0.03em]">Centro de notificaciones</h1><p className="mt-0.5 text-xs text-muted">Incidentes, eventos críticos y tickets fuera de SLA desde fuentes reales.</p></div><div className="flex gap-2"><button className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-bold hover:bg-surface-subtle disabled:opacity-50" type="button" disabled={!data?.unreadCount} onClick={() => void markAll()}><CheckCheck className="size-3.5" aria-hidden="true" />Marcar todo leído</button><button className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-bold text-white hover:bg-accent-hover" type="button" onClick={() => { setIsLoading(true); void load(); }}><RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />Actualizar</button></div></header>
      <section className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Resumen de notificaciones">{stats.map((stat, index) => <StatCard {...stat} index={index} key={stat.label} />)}</section>
      <section className="mt-4 rounded-xl border border-line bg-surface shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="notification-list-title">
        <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-end"><div className="mr-auto"><h2 className="text-xs font-extrabold" id="notification-list-title">Bandeja operativa</h2><p className="mt-0.5 text-2xs text-muted">{filtered.length} elementos visibles</p></div><FilterSelect className="w-full sm:w-44" label="Fuente" options={[{ value: "all", label: "Todas" }, { value: "incident", label: "Incidentes" }, { value: "audit", label: "Auditoría" }, { value: "support", label: "Soporte" }]} value={type} onChange={setType} /><FilterSelect className="w-full sm:w-44" label="Estado" options={[{ value: "all", label: "Todas" }, { value: "unread", label: "Sin leer" }]} value={visibility} onChange={setVisibility} /></div>
        {error ? <p className="m-3 rounded-lg border border-danger/25 bg-danger-soft p-4 text-xs text-danger" role="alert">{error}</p> : null}
        <ul className="divide-y divide-line">
          {filtered.map((notification) => (
            <li className={`grid gap-3 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center ${notification.read ? "opacity-70" : "bg-accent-soft/15"}`} key={notification.id}>
              <span className={`grid size-9 place-items-center rounded-lg ${notification.severity === "critical" ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning"}`} aria-hidden="true"><ShieldAlert className="size-4" /></span>
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-xs font-extrabold">{notification.title}</h3><DataBadge tone={notification.type === "incident" ? "danger" : notification.type === "support" ? "warning" : "accent"}>{TYPE_LABELS[notification.type]}</DataBadge>{!notification.read ? <span className="rounded-full bg-accent-soft px-2 py-0.5 text-2xs font-bold text-accent">Nueva</span> : null}</div><p className="mt-1 truncate text-2xs text-muted">{notification.message}</p><p className="mt-1 flex items-center gap-2 text-2xs text-muted">{notification.countryCode ? <CountryFlag countryCode={notification.countryCode} /> : null}<time>{dateTimeFormatter.format(new Date(notification.occurredAt))}</time></p></div>
              <div className="flex items-center gap-2 sm:justify-end">{!notification.read ? <button className="min-h-8 rounded-lg border border-line px-2.5 text-2xs font-bold hover:bg-surface-subtle" type="button" onClick={() => void markRead(notification)}>Marcar leída</button> : null}<Link className="inline-flex min-h-8 items-center rounded-lg bg-accent px-3 text-2xs font-bold text-white hover:bg-accent-hover" href={notification.href} onClick={() => void markRead(notification)}>Revisar</Link></div>
            </li>
          ))}
          {!isLoading && filtered.length === 0 ? <li className="p-10 text-center text-xs text-muted">No hay notificaciones para estos filtros.</li> : null}
          {isLoading ? <li className="p-10 text-center text-xs font-bold text-accent">Actualizando bandeja...</li> : null}
        </ul>
      </section>
      <p className="mt-4 rounded-xl border border-line bg-surface-subtle p-4 text-2xs leading-5 text-muted">Este centro consolida señales internas reales. La entrega outbound por WhatsApp, push y plantillas multicanal permanece fuera de alcance hasta configurar proveedores y credenciales verificables.</p>
    </div>
  );
}

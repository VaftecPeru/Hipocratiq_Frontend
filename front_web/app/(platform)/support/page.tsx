"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Headset,
  Inbox,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createAdminSupportTicket,
  getAdminSupportTickets,
} from "@/features/platform/api/browser-support";
import type {
  SupportDashboardSummary,
  SupportTicket,
  SupportTicketFilters,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/features/platform/model/support.types";
import { SupportTicketModal } from "@/features/platform/ui/support-ticket-modal";
import { SupportTicketWorkflowModal } from "@/features/platform/ui/support-ticket-workflow-modal";
import { CountryFlag } from "@/shared/ui/country-flag";
import { DonutChart } from "@/shared/ui/donut-chart";
import { FilterSelect } from "@/shared/ui/filter-select";
import { StatCard, type StatCardProps } from "@/shared/ui/stat-card";
import { PlatformModuleLoading } from "@/shared/ui/platform-module-loading";

const EMPTY_SUMMARY: SupportDashboardSummary = {
  totals: { tickets: 0, open: 0, inProgress: 0, waitingOnCustomer: 0, resolvedToday: 0, overdue: 0, unassigned: 0 },
  sla: { compliancePercentage: 100, targetPercentage: 90, evaluatedTickets: 0 },
  byPriority: [],
  byCategory: [],
  byCountry: [],
  agents: [],
  escalations: [],
  recentActivity: [],
  generatedAt: "",
};

const STATUS_LABELS: Record<SupportTicketStatus, string> = {
  open: "Abierto",
  in_progress: "En proceso",
  waiting_on_customer: "Esperando cliente",
  resolved: "Resuelto",
  closed: "Cerrado",
};

const PRIORITY_LABELS: Record<SupportTicketPriority, string> = {
  low: "Baja",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
};

const CATEGORY_LABELS: Record<string, string> = {
  technical: "Técnico",
  billing: "Facturación",
  functionality: "Funcionalidad",
  general: "Consulta general",
};

const PRIORITY_COLORS: Record<SupportTicketPriority, string> = {
  urgent: "var(--danger)",
  high: "var(--warning)",
  normal: "var(--accent)",
  low: "var(--success)",
};

const numberFormatter = new Intl.NumberFormat("es-MX");

const TICKET_STATUS_CLASSES: Record<SupportTicketStatus, string> = {
  open: "bg-danger-soft text-danger",
  in_progress: "bg-warning-soft text-warning",
  waiting_on_customer: "bg-violet-soft text-violet",
  resolved: "bg-success-soft text-success",
  closed: "bg-surface-subtle text-muted",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function TicketStatusBadge({ status }: { status: SupportTicketStatus }) {
  return <span className={`inline-flex rounded-md px-2 py-1 text-2xs font-extrabold ${TICKET_STATUS_CLASSES[status]}`}>{STATUS_LABELS[status]}</span>;
}

function SupportFilters({
  filters,
  countries,
  onChange,
}: {
  filters: SupportTicketFilters;
  countries: string[];
  onChange: (changes: Partial<SupportTicketFilters>) => void;
}) {
  return (
    <section className="grid gap-3 rounded-xl border border-line bg-surface p-3 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)] sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1.8fr)_repeat(3,minmax(9rem,1fr))]" aria-label="Filtros de soporte">
      <label className="grid gap-1 text-2xs font-bold text-muted">
        Buscar ticket
        <span className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2" />
          <input
            className="h-9 w-full rounded-lg border border-line bg-surface-input pl-9 pr-3 text-xs text-ink outline-none focus:border-accent focus:ring-3 focus:ring-focus/40"
            type="search"
            placeholder="Ticket ID, asunto o email..."
            value={filters.search ?? ""}
            onChange={(event) => onChange({ search: event.target.value, page: 1 })}
          />
        </span>
      </label>
      <FilterSelect label="País" value={filters.countryCode ?? ""} options={[{ value: "", label: "Todos los países" }, ...countries.map((country) => ({ value: country, label: country }))]} onChange={(countryCode) => onChange({ countryCode: countryCode || undefined, page: 1 })} />
      <FilterSelect label="Estado" value={filters.status ?? ""} options={[{ value: "", label: "Todos" }, ...(Object.keys(STATUS_LABELS) as SupportTicketStatus[]).map((status) => ({ value: status, label: STATUS_LABELS[status] }))]} onChange={(status) => onChange({ status: (status || undefined) as SupportTicketStatus | undefined, page: 1 })} />
      <FilterSelect label="Prioridad" value={filters.priority ?? ""} options={[{ value: "", label: "Todas" }, ...(Object.keys(PRIORITY_LABELS) as SupportTicketPriority[]).map((priority) => ({ value: priority, label: PRIORITY_LABELS[priority] }))]} onChange={(priority) => onChange({ priority: (priority || undefined) as SupportTicketPriority | undefined, page: 1 })} />
    </section>
  );
}

export default function SupportPage() {
  const [filters, setFilters] = useState<SupportTicketFilters>({ page: 1, perPage: 20 });
  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminSupportTickets>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [createVersion, setCreateVersion] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      setError(null);
      getAdminSupportTickets(filters, controller.signal)
        .then(setData)
        .catch((requestError: unknown) => {
          if (requestError instanceof DOMException && requestError.name === "AbortError") return;
          setError(requestError instanceof Error ? requestError.message : "No pudimos cargar soporte.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsLoading(false);
        });
    }, filters.search ? 300 : 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [filters, refreshVersion]);

  const refresh = useCallback(() => setRefreshVersion((version) => version + 1), []);
  const summary = data?.summary ?? EMPTY_SUMMARY;
  const stats = useMemo<Array<StatCardProps>>(() => [
    { label: "Tickets Totales", value: numberFormatter.format(summary.totals.tickets), change: "Cobertura global", direction: "up", icon: Headset, tone: "accent" },
    { label: "Abiertos", value: numberFormatter.format(summary.totals.open), change: `${summary.totals.unassigned} sin asignar`, direction: summary.totals.unassigned > 0 ? "down" : "up", icon: Inbox, tone: "danger" },
    { label: "En Proceso", value: numberFormatter.format(summary.totals.inProgress), change: `${summary.totals.waitingOnCustomer} esperando cliente`, direction: "up", icon: RefreshCw, tone: "warning" },
    { label: "Resueltos Hoy", value: numberFormatter.format(summary.totals.resolvedToday), change: "Cierres operativos", direction: "up", icon: CheckCircle2, tone: "success" },
    { label: "SLA Cumplido", value: `${summary.sla.compliancePercentage}%`, change: `Meta ${summary.sla.targetPercentage}%`, direction: summary.sla.compliancePercentage >= summary.sla.targetPercentage ? "up" : "down", icon: ShieldCheck, tone: "violet" },
  ], [summary]);

  if (!data) {
    if (error) {
      return <main className="mx-auto grid min-h-[48vh] max-w-2xl place-items-center px-4"><p className="rounded-xl border border-danger/25 bg-danger-soft p-5 text-center text-xs text-danger" role="alert">{error}</p></main>;
    }

    return <PlatformModuleLoading label="Cargando soporte" />;
  }

  const prioritySegments = summary.byPriority.map((item) => ({
    label: PRIORITY_LABELS[item.key],
    value: numberFormatter.format(item.count),
    percentage: item.percentage,
    color: PRIORITY_COLORS[item.key],
  }));

  const handleCreated = async (payload: Parameters<typeof createAdminSupportTicket>[0]) => {
    const ticket = await createAdminSupportTicket(payload);
    refresh();
    return ticket;
  };

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6">
      <header className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
        <div>
          <p className="text-xs font-bold tracking-[0.13em] text-accent uppercase">Operación global</p>
          <h1 className="mt-0.5 text-[clamp(1.3rem,1.8vw,1.6rem)] font-extrabold tracking-[-0.03em]">Centro de Soporte</h1>
          <p className="mt-0.5 text-xs text-muted">Supervisa tickets, SLA, responsables y escalaciones de todos los países.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex min-h-11 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-xs font-bold text-ink sm:min-h-9" type="button" onClick={refresh}><RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />Actualizar</button>
          <button className="flex min-h-11 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-xs font-bold text-white hover:bg-accent-hover sm:min-h-9" type="button" onClick={() => { setCreateVersion((version) => version + 1); setCreateOpen(true); }}><Plus className="size-3.5" aria-hidden="true" />Nuevo ticket</button>
        </div>
      </header>

      {error ? <p className="mt-4 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-xs font-semibold text-danger" role="alert">{error}</p> : null}

      <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5" aria-label="Indicadores reales de soporte">
        {stats.map((item, index) => <StatCard {...item} index={index} key={item.label} />)}
      </section>

      <div className="mt-4"><SupportFilters filters={filters} countries={data?.countries ?? []} onChange={(changes) => setFilters((current) => ({ ...current, ...changes }))} /></div>

      <section className="mt-4 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="support-queue-title">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div><h2 className="text-sm font-extrabold" id="support-queue-title">Cola global de tickets</h2><p className="mt-0.5 text-2xs text-muted">{numberFormatter.format(data?.meta.total ?? 0)} solicitudes encontradas</p></div>
          {summary.totals.overdue > 0 ? <span className="flex items-center gap-1 rounded-full bg-danger-soft px-2.5 py-1 text-2xs font-extrabold text-danger"><AlertTriangle className="size-3" />{summary.totals.overdue} vencidos</span> : null}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[68rem] border-collapse text-left">
            <thead className="bg-surface-subtle text-2xs font-bold text-muted"><tr><th className="px-4 py-2.5">Ticket</th><th className="px-3 py-2.5">Clínica / País</th><th className="px-3 py-2.5">Estado</th><th className="px-3 py-2.5">Prioridad</th><th className="px-3 py-2.5">Responsable</th><th className="px-3 py-2.5">SLA</th><th className="px-4 py-2.5 text-right">Acción</th></tr></thead>
            <tbody className="divide-y divide-line">
              {(data?.tickets ?? []).map((ticket) => (
                <tr className="text-xs transition-colors hover:bg-accent-soft/30" key={ticket.id}>
                  <th className="px-4 py-3" scope="row"><p className="font-mono text-2xs font-extrabold text-accent">#{ticket.ticketId}</p><p className="mt-1 max-w-xs truncate font-bold text-ink">{ticket.subject}</p></th>
                  <td className="px-3 py-3"><p className="font-semibold text-ink">{ticket.clinic?.name ?? "Sin clínica"}</p><p className="mt-1 flex items-center gap-1 text-2xs text-muted"><CountryFlag countryCode={ticket.clinic?.countryCode ?? ""} />{ticket.clinic?.countryCode ?? "—"}</p></td>
                  <td className="px-3 py-3"><TicketStatusBadge status={ticket.status} /></td>
                  <td className="px-3 py-3 font-semibold text-ink">{PRIORITY_LABELS[ticket.priority]}</td>
                  <td className="px-3 py-3 text-muted">{ticket.assignedTo?.name ?? "Sin asignar"}</td>
                  <td className={`px-3 py-3 text-2xs font-semibold ${ticket.isOverdue ? "text-danger" : "text-muted"}`}>{ticket.isOverdue ? "Vencido · " : ""}{formatDate(ticket.dueAt)}</td>
                   <td className="px-4 py-3 text-right"><button className="min-h-11 rounded-lg border border-line px-3 py-1.5 text-2xs font-extrabold text-accent hover:border-accent sm:min-h-8" type="button" onClick={() => setSelectedTicket(ticket)}>Gestionar</button></td>
                </tr>
              ))}
              {!isLoading && (data?.tickets.length ?? 0) === 0 ? <tr><td className="px-4 py-10 text-center text-xs text-muted" colSpan={7}>No hay tickets para los filtros seleccionados.</td></tr> : null}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-line px-4 py-3 text-2xs text-muted">
          <span>Página {data?.meta.currentPage ?? 1} de {data?.meta.lastPage ?? 1}</span>
          <div className="flex gap-1">
            <button className="grid size-11 place-items-center rounded-lg border border-line disabled:opacity-40 sm:size-8" type="button" aria-label="Página anterior" disabled={(data?.meta.currentPage ?? 1) <= 1 || isLoading} onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) - 1 }))}><ChevronLeft className="size-3.5" aria-hidden="true" /></button>
            <button className="grid size-11 place-items-center rounded-lg border border-line disabled:opacity-40 sm:size-8" type="button" aria-label="Página siguiente" disabled={(data?.meta.currentPage ?? 1) >= (data?.meta.lastPage ?? 1) || isLoading} onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}><ChevronRight className="size-3.5" aria-hidden="true" /></button>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-3" aria-label="Análisis de soporte">
        <DonutChart title="Tickets por Prioridad" centerValue={numberFormatter.format(summary.totals.tickets)} centerLabel="Total" segments={prioritySegments} />
        <article className="rounded-xl border border-line bg-surface p-4"><h2 className="text-sm font-extrabold">Cobertura por país</h2><ul className="mt-3 divide-y divide-line">{summary.byCountry.map((country) => <li className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-2.5 text-xs" key={country.countryCode}><span className="flex items-center gap-2 font-bold"><CountryFlag countryCode={country.countryCode} />{country.countryCode}</span><span className="text-muted">{country.open} abiertos</span><span className={country.overdue > 0 ? "font-extrabold text-danger" : "font-bold text-success"}>{country.overdue} vencidos</span></li>)}{summary.byCountry.length === 0 ? <li className="py-8 text-center text-xs text-muted">Sin datos por país</li> : null}</ul></article>
        <article className="rounded-xl border border-line bg-surface p-4"><h2 className="text-sm font-extrabold">Top categorías</h2><ol className="mt-3 divide-y divide-line">{summary.byCategory.map((category, index) => <li className="flex items-center gap-3 py-2.5" key={category.key}><span className="grid size-6 place-items-center rounded-md bg-accent-soft text-2xs font-extrabold text-accent">{index + 1}</span><span className="min-w-0 flex-1 truncate text-xs font-semibold">{CATEGORY_LABELS[category.key] ?? category.key}</span><span className="font-mono text-xs font-bold">{category.count}</span></li>)}</ol></article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,0.8fr)]">
        <article className="overflow-hidden rounded-xl border border-line bg-surface"><div className="border-b border-line px-4 py-3"><h2 className="flex items-center gap-2 text-sm font-extrabold"><UsersRound className="size-4 text-accent" />Equipo Superadmin</h2></div><div className="overflow-x-auto"><table className="w-full min-w-lg text-left"><thead className="bg-surface-subtle text-2xs text-muted"><tr><th className="px-4 py-2">Responsable</th><th className="px-3 py-2">Activos</th><th className="px-3 py-2">Resueltos</th><th className="px-4 py-2">Asignados</th></tr></thead><tbody className="divide-y divide-line">{summary.agents.map((agent) => <tr className="text-xs" key={agent.id}><th className="px-4 py-3"><p className="font-bold">{agent.name}</p><p className="mt-0.5 text-2xs font-normal text-muted">{agent.email}</p></th><td className="px-3 py-3 font-mono">{agent.activeTickets}</td><td className="px-3 py-3 font-mono text-success">{agent.resolvedTickets}</td><td className="px-4 py-3 font-mono">{agent.assignedTickets}</td></tr>)}</tbody></table></div></article>
        <article className="rounded-xl border border-line bg-surface p-4"><h2 className="flex items-center gap-2 text-sm font-extrabold"><Clock3 className="size-4 text-danger" />Escalaciones por SLA</h2><ul className="mt-3 space-y-2">{summary.escalations.map((ticket) => <li key={ticket.id}><button className="w-full rounded-lg border border-danger/20 bg-danger-soft/40 p-3 text-left" type="button" onClick={() => setSelectedTicket(ticket)}><p className="font-mono text-2xs font-extrabold text-danger">#{ticket.ticketId}</p><p className="mt-1 truncate text-xs font-bold">{ticket.subject}</p><p className="mt-1 text-2xs text-muted">{ticket.clinic?.name} · venció {formatDate(ticket.dueAt)}</p></button></li>)}{summary.escalations.length === 0 ? <li className="py-8 text-center text-xs text-success">No hay tickets vencidos.</li> : null}</ul></article>
      </section>

      <SupportTicketModal key={createVersion} isOpen={createOpen} onClose={() => setCreateOpen(false)} clinics={data?.clinics ?? []} onCreate={handleCreated} />
      <SupportTicketWorkflowModal key={selectedTicket?.id ?? "none"} isOpen={selectedTicket !== null} ticket={selectedTicket} agents={summary.agents} onClose={() => setSelectedTicket(null)} onUpdated={() => refresh()} />
    </div>
  );
}

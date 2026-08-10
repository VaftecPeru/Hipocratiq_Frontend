"use client";

import { CheckCircle2, Clock3, MessageSquareText, Save, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import {
  addAdminSupportTicketComment,
  getAdminSupportTicket,
  updateAdminSupportTicket,
} from "@/features/platform/api/browser-support";
import type {
  SupportAgent,
  SupportTicket,
  SupportTicketActivity,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/features/platform/model/support.types";
import { Modal } from "@/shared/ui/modal";
import {
  ModalGrid,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalSelect,
  ModalTextarea,
} from "@/shared/ui/modal-parts";

type Props = {
  isOpen: boolean;
  ticket: SupportTicket | null;
  agents: SupportAgent[];
  onClose: () => void;
  onUpdated: (ticket: SupportTicket) => void;
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

const NEXT_STATUSES: Record<SupportTicketStatus, SupportTicketStatus[]> = {
  open: ["open", "in_progress", "closed"],
  in_progress: ["in_progress", "open", "waiting_on_customer", "resolved"],
  waiting_on_customer: ["waiting_on_customer", "in_progress", "resolved"],
  resolved: ["resolved", "in_progress", "closed"],
  closed: ["closed", "in_progress"],
};

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function activityDescription(activity: SupportTicketActivity): string {
  if (activity.type === "comment") return activity.body ?? "Comentario agregado";
  if (activity.type === "created") return "Ticket creado";
  if (activity.type === "status_changed") {
    return `Estado: ${STATUS_LABELS[activity.fromValue as SupportTicketStatus] ?? activity.fromValue} → ${STATUS_LABELS[activity.toValue as SupportTicketStatus] ?? activity.toValue}`;
  }
  if (activity.type === "priority_changed") {
    return `Prioridad: ${PRIORITY_LABELS[activity.fromValue as SupportTicketPriority] ?? activity.fromValue} → ${PRIORITY_LABELS[activity.toValue as SupportTicketPriority] ?? activity.toValue}`;
  }
  return "Responsable actualizado";
}

export function SupportTicketWorkflowModal({ isOpen, ticket, agents, onClose, onUpdated }: Props) {
  const [detail, setDetail] = useState<SupportTicket | null>(ticket);
  const [status, setStatus] = useState<SupportTicketStatus>(ticket?.status ?? "open");
  const [priority, setPriority] = useState<SupportTicketPriority>(ticket?.priority ?? "normal");
  const [assigneeId, setAssigneeId] = useState(ticket?.assignedTo ? String(ticket.assignedTo.id) : "");
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !ticket) return;
    const controller = new AbortController();

    getAdminSupportTicket(ticket.id, controller.signal)
      .then((loaded) => {
        setDetail(loaded);
        setStatus(loaded.status);
        setPriority(loaded.priority);
        setAssigneeId(loaded.assignedTo ? String(loaded.assignedTo.id) : "");
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(requestError instanceof Error ? requestError.message : "No pudimos cargar el ticket.");
      });

    return () => controller.abort();
  }, [isOpen, ticket]);

  if (!ticket) return null;

  const saveWorkflow = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateAdminSupportTicket(ticket.id, {
        status,
        priority,
        assignedToUserId: assigneeId ? Number(assigneeId) : null,
      });
      const refreshed = await getAdminSupportTicket(ticket.id);
      setDetail(refreshed);
      onUpdated(updated);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos actualizar el ticket.");
    } finally {
      setIsSaving(false);
    }
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    setIsCommenting(true);
    setError(null);
    try {
      await addAdminSupportTicketComment(ticket.id, comment.trim(), true);
      const refreshed = await getAdminSupportTicket(ticket.id);
      setDetail(refreshed);
      setComment("");
      onUpdated(refreshed);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos guardar la nota.");
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={`#${ticket.ticketId} · ${ticket.subject}`}
      description={`${ticket.clinic?.name ?? "Sin clínica"} · ${ticket.clinic?.countryCode ?? "Sin país"}`}
      footer={
        <>
          <ModalSecondaryButton onClick={onClose}>Cerrar</ModalSecondaryButton>
          <ModalPrimaryButton onClick={saveWorkflow}>
            <Save className="size-3.5" />{isSaving ? "Guardando..." : "Guardar workflow"}
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
        <div className="min-w-0 space-y-4">
          <div className="rounded-lg border border-line bg-surface-subtle p-3">
            <p className="text-xs leading-5 text-ink">{detail?.description ?? ticket.description}</p>
            <dl className="mt-3 grid gap-2 text-2xs text-muted sm:grid-cols-2">
              <div><dt className="font-bold">Contacto</dt><dd className="mt-0.5 text-ink">{ticket.contactEmail}</dd></div>
              <div><dt className="font-bold">Vencimiento SLA</dt><dd className={ticket.isOverdue ? "mt-0.5 font-bold text-danger" : "mt-0.5 text-ink"}>{formatDate(detail?.dueAt ?? ticket.dueAt)}</dd></div>
            </dl>
          </div>

          <ModalGrid cols={2}>
            <ModalSelect
              id="support-workflow-status"
              label="Estado"
              value={status}
              options={NEXT_STATUSES[detail?.status ?? ticket.status].map((value) => ({ value, label: STATUS_LABELS[value] }))}
              onChange={(value) => setStatus(value as SupportTicketStatus)}
            />
            <ModalSelect
              id="support-workflow-priority"
              label="Prioridad"
              value={priority}
              options={(Object.keys(PRIORITY_LABELS) as SupportTicketPriority[]).map((value) => ({ value, label: PRIORITY_LABELS[value] }))}
              onChange={(value) => setPriority(value as SupportTicketPriority)}
            />
          </ModalGrid>
          <ModalSelect
            id="support-workflow-agent"
            label="Responsable global"
            value={assigneeId}
            options={[{ value: "", label: "Sin asignar" }, ...agents.map((agent) => ({ value: String(agent.id), label: agent.name }))]}
            onChange={setAssigneeId}
          />

          <div className="rounded-lg border border-line p-3">
            <ModalTextarea
              id="support-internal-comment"
              label="Nota interna"
              rows={3}
              value={comment}
              placeholder="Registra diagnóstico, coordinación o siguiente paso..."
              onChange={(event) => setComment(event.target.value)}
            />
            <button
              className="mt-2 flex min-h-9 items-center gap-1.5 rounded-lg bg-ink px-3 text-xs font-bold text-white disabled:opacity-60"
              type="button"
              disabled={isCommenting || !comment.trim()}
              onClick={addComment}
            >
              <MessageSquareText className="size-3.5" />{isCommenting ? "Guardando..." : "Agregar nota"}
            </button>
          </div>
          {error ? <p className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-xs font-semibold text-danger" role="alert">{error}</p> : null}
        </div>

        <section className="min-w-0 rounded-lg border border-line p-3" aria-labelledby="ticket-history-title">
          <h3 className="flex items-center gap-2 text-xs font-extrabold" id="ticket-history-title"><Clock3 className="size-4 text-accent" />Historial</h3>
          <ol className="mt-3 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
            {(detail?.activities ?? []).map((activity) => (
              <li className="relative border-l border-line pl-4" key={activity.id}>
                <span className="absolute -left-1 top-1 size-2 rounded-full bg-accent" aria-hidden="true" />
                <p className="text-xs font-semibold text-ink">{activityDescription(activity)}</p>
                <p className="mt-1 flex items-center gap-1 text-2xs text-muted">
                  <UserRound className="size-3" />{activity.actor?.name ?? "Sistema"} · {formatDate(activity.createdAt)}
                </p>
              </li>
            ))}
            {(detail?.activities?.length ?? 0) === 0 ? <li className="py-6 text-center text-xs text-muted">Cargando historial...</li> : null}
          </ol>
          {detail?.resolvedAt ? <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-success-soft px-3 py-2 text-2xs font-bold text-success"><CheckCircle2 className="size-3.5" />Resuelto {formatDate(detail.resolvedAt)}</p> : null}
        </section>
      </div>
    </Modal>
  );
}

"use client";

import { CheckCircle2, FileText } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/shared/ui/modal";
import {
  ModalField,
  ModalGrid,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalSelect,
  ModalTextarea,
} from "@/shared/ui/modal-parts";
import type {
  CreateSupportTicketPayload,
  SupportClinicOption,
  SupportTicket,
  SupportTicketCategory,
  SupportTicketPriority,
} from "@/features/platform/model/support.types";

type SupportTicketModalProps = {
  isOpen: boolean;
  onClose: () => void;
  clinics: SupportClinicOption[];
  onCreate: (payload: CreateSupportTicketPayload) => Promise<SupportTicket>;
};

type FormState = {
  clinicId: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  subject: string;
  description: string;
  contactEmail: string;
  notifyOnCreate: boolean;
  assignToSelf: boolean;
};

const CATEGORY_OPTIONS: Array<{ value: SupportTicketCategory; label: string }> = [
  { value: "technical", label: "Técnico" },
  { value: "billing", label: "Facturación" },
  { value: "functionality", label: "Funcionalidad" },
  { value: "general", label: "Consulta general" },
];

const PRIORITY_OPTIONS: Array<{ value: SupportTicketPriority; label: string }> = [
  { value: "low", label: "Baja" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
];

function createInitialForm(clinics: SupportClinicOption[]): FormState {
  return {
    clinicId: clinics[0] ? String(clinics[0].id) : "",
    category: "technical",
    priority: "normal",
    subject: "",
    description: "",
    contactEmail: "",
    notifyOnCreate: true,
    assignToSelf: false,
  };
}

export function SupportTicketModal({ isOpen, onClose, clinics, onCreate }: SupportTicketModalProps) {
  const [form, setForm] = useState<FormState>(() => createInitialForm(clinics));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<SupportTicket | null>(null);

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCreate = async () => {
    if (!form.clinicId || !form.subject.trim() || !form.description.trim() || !form.contactEmail.trim()) {
      setError("Completa la clínica, el asunto, la descripción y el email de contacto.");
      return;
    }

    if (!form.contactEmail.includes("@")) {
      setError("Ingresa un email de contacto válido.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const ticket = await onCreate({
        clinicId: Number(form.clinicId),
        category: form.category,
        priority: form.priority,
        subject: form.subject.trim(),
        description: form.description.trim(),
        contactEmail: form.contactEmail.trim(),
        notifyOnCreate: form.notifyOnCreate,
        assignToSelf: form.assignToSelf,
      });

      setCreatedTicket(ticket);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos crear el ticket.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Nuevo Ticket de Soporte"
      description={createdTicket ? "Solicitud registrada correctamente" : "Crear un ticket para una clínica"}
      footer={
        createdTicket ? (
          <ModalPrimaryButton onClick={onClose}>
            <CheckCircle2 className="size-3.5" strokeWidth={1.9} />Cerrar
          </ModalPrimaryButton>
        ) : (
          <>
            <ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton>
            <ModalPrimaryButton onClick={handleCreate}>
              <FileText className="size-3.5" strokeWidth={1.9} />
              {isLoading ? "Creando..." : "Crear Ticket"}
            </ModalPrimaryButton>
          </>
        )
      }
    >
      {createdTicket ? (
        <div className="grid gap-4 py-2" aria-live="polite">
          <div className="grid place-items-center rounded-xl border border-success/30 bg-success-soft/60 px-5 py-6 text-center">
            <span className="grid size-11 place-items-center rounded-full bg-success text-white" aria-hidden="true">
              <CheckCircle2 className="size-6" strokeWidth={1.8} />
            </span>
            <p className="mt-3 text-sm font-extrabold text-ink">Ticket creado</p>
            <p className="mt-1 text-xs text-muted">Guarda este código para consultar y dar seguimiento a la solicitud.</p>
            <code className="mt-4 rounded-lg bg-surface px-4 py-2 font-mono text-lg font-bold tracking-[0.08em] text-accent shadow-sm">#{createdTicket.ticketId}</code>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <ModalSelect
            id="ticket-clinic"
            label="Clínica"
            options={clinics.length > 0 ? clinics.map((clinic) => ({ value: String(clinic.id), label: clinic.name })) : [{ value: "", label: "Cargando clínicas..." }]}
            value={form.clinicId}
            onChange={(value) => updateForm("clinicId", value)}
            required
          />

          <ModalGrid cols={2}>
            <ModalSelect
              id="ticket-category"
              label="Categoría"
              options={CATEGORY_OPTIONS}
              value={form.category}
              onChange={(value) => updateForm("category", value as SupportTicketCategory)}
              required
            />
            <ModalSelect
              id="ticket-priority"
              label="Prioridad"
              options={PRIORITY_OPTIONS}
              value={form.priority}
              onChange={(value) => updateForm("priority", value as SupportTicketPriority)}
              required
            />
          </ModalGrid>

          <ModalField id="ticket-subject" label="Asunto" placeholder="Resumen breve del problema" value={form.subject} onChange={(event) => updateForm("subject", event.target.value)} required />
          <ModalTextarea id="ticket-description" label="Descripción" placeholder="Describe el problema en detalle..." rows={6} value={form.description} onChange={(event) => updateForm("description", event.target.value)} required />

          <ModalField id="ticket-contact" label="Email de contacto" type="email" placeholder="contacto@clinica.com" value={form.contactEmail} onChange={(event) => updateForm("contactEmail", event.target.value)} required />

          <div className="space-y-2">
            <label className="text-2xs font-bold text-muted">Opciones</label>
            <label className="flex items-center gap-2 text-xs text-ink">
              <input className="size-4 accent-accent" checked={form.notifyOnCreate} onChange={(event) => updateForm("notifyOnCreate", event.target.checked)} type="checkbox" />
              Enviar notificación al crear el ticket
            </label>
            <label className="flex items-center gap-2 text-xs text-ink">
              <input className="size-4 accent-accent" checked={form.assignToSelf} onChange={(event) => updateForm("assignToSelf", event.target.checked)} type="checkbox" />
              Asignarme como responsable
            </label>
          </div>

          {error ? <p className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-xs font-semibold text-danger" role="alert">{error}</p> : null}
        </div>
      )}
    </Modal>
  );
}

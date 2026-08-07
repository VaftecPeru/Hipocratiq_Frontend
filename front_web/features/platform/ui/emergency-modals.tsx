"use client";

import { ClipboardList, Megaphone, Send } from "lucide-react";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Modal } from "@/shared/ui/modal";
import {
  ModalField,
  ModalGrid,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalSelect,
} from "@/shared/ui/modal-parts";

/** Botón primario que abre el modal para publicar la política global de emergencia. */
export function PublishPolicyButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="flex min-h-9 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-accent px-3.5 text-xs font-bold text-white transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus sm:w-auto"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <Send className="size-3.5" strokeWidth={2} aria-hidden="true" />
        Publicar política
      </button>
      <PublishPolicyModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

function PublishPolicyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePublish = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Publicar política de emergencia"
      description="Aplica la configuración global a todas las clínicas"
      footer={
        <>
          <ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton>
          <ModalPrimaryButton onClick={handlePublish}>
            <Send className="size-3.5" strokeWidth={1.9} />
            {isLoading ? "Publicando..." : "Publicar política"}
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <ModalSelect
          id="publish-scope"
          label="Alcance de aplicación"
          options={[
            "Todas las clínicas",
            "Solo clínicas de México",
            "Solo clínicas de Perú",
            "Clínicas sin configuración local",
          ]}
          defaultValue="Todas las clínicas"
          required
        />

        <ModalSelect
          id="publish-inheritance"
          label="Sobrescribir configuración local"
          options={[
            "Respetar personalizaciones de cada clínica",
            "Forzar política global en todas",
          ]}
          defaultValue="Respetar personalizaciones de cada clínica"
          required
        />

        <ModalField
          id="publish-note"
          label="Nota de versión"
          placeholder="Ej: Se agrega color base y flujo de auditoría"
          hint="Queda registrada en la auditoría global."
        />

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-ink">
            <input className="size-4 accent-accent" defaultChecked type="checkbox" />
            Notificar a los administradores de clínica
          </label>
          <label className="flex items-center gap-2 text-xs text-ink">
            <input className="size-4 accent-accent" defaultChecked type="checkbox" />
            Registrar el cambio en la auditoría
          </label>
        </div>

        <div className="rounded-lg border border-warning/30 bg-warning-soft/60 p-3 text-2xs leading-5 text-muted">
          <p className="font-bold text-ink">Atención:</p>
          Esta política afecta a todas las clínicas seleccionadas. Cada clínica conserva su configuración
          operativa salvo que fuerces la política global.
        </div>
      </div>
    </Modal>
  );
}

type Responsible = { role: string; channel: string; badge: string };

const defaultResponsibles: Responsible[] = [
  { role: "Administrador de clínica", channel: "Resumen de evento y auditoría", badge: "Plantilla" },
  { role: "Jefe de guardia", channel: "Push prioritario", badge: "Crítico" },
  { role: "Recepción", channel: "Alerta interna inmediata", badge: "Operativo" },
];

/** Botón secundario que abre el modal para editar la plantilla de responsables. */
export function EditTemplateButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="min-h-8 shrink-0 rounded-lg border border-line bg-surface px-3 text-2xs font-bold text-ink transition-colors hover:border-accent/60 hover:text-accent focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Editar plantilla
      </button>
      <EditTemplateModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

function EditTemplateModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Editar plantilla de responsables"
      description="Base inicial que heredan las clínicas nuevas"
      footer={
        <>
          <ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton>
          <ModalPrimaryButton onClick={handleSave}>
            {isLoading ? "Guardando..." : "Guardar plantilla"}
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-subtle p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent" aria-hidden="true">
            <Megaphone className="size-4.5" strokeWidth={1.8} />
          </span>
          <p className="text-2xs leading-5 text-muted">
            Estos responsables se aplican a las clínicas nuevas. Cada clínica puede sustituirlos sin afectar
            esta plantilla SaaS.
          </p>
        </div>

        <TemplateRows />

        <ModalGrid cols={2}>
          <ModalSelect
            id="template-default-channel"
            label="Canal predeterminado"
            options={["Push prioritario", "Alerta interna", "Correo electrónico", "SMS"]}
            defaultValue="Push prioritario"
          />
          <ModalSelect
            id="template-escalation"
            label="Escalar tras"
            options={["1 minuto", "3 minutos", "5 minutos", "10 minutos"]}
            defaultValue="3 minutos"
          />
        </ModalGrid>
      </div>
    </Modal>
  );
}

function TemplateRows() {
  return (
    <ul className="grid gap-3">
      {defaultResponsibles.map((responsible, index) => (
        <li className="rounded-lg border border-line p-3" key={responsible.role}>
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <p className="truncate text-xs font-extrabold text-ink">{responsible.role}</p>
            <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-2xs font-extrabold text-accent">
              {responsible.badge}
            </span>
          </div>
          <ModalGrid cols={2}>
            <ModalField
              id={`template-role-${index}`}
              label="Rol responsable"
              defaultValue={responsible.role}
            />
            <ModalField
              id={`template-channel-${index}`}
              label="Canal de aviso"
              defaultValue={responsible.channel}
            />
          </ModalGrid>
        </li>
      ))}
    </ul>
  );
}

/** Enlace a auditoría con estilo de botón secundario, usado en el encabezado. */
export function AuditLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      className="flex min-h-9 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 text-xs font-bold text-ink transition-colors hover:border-accent/60 hover:text-accent focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus sm:w-auto"
      href={href}
    >
      <ClipboardList className="size-3.5" strokeWidth={1.9} aria-hidden="true" />
      {children}
    </Link>
  );
}

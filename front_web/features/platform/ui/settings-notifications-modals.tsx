"use client";

import { Layers, RefreshCw, Send } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/shared/ui/modal";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { ModalSecondaryButton } from "@/shared/ui/modal-parts";

/**
 * Islas cliente para Notificaciones. Conectan el botón de actualizar, la
 * vista previa de plantillas y los enlaces de pie a sus modales.
 */

/** Botón "Actualizar" de la cabecera de Notificaciones. */
export function RefreshNotificationsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="flex min-h-9 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-accent px-3.5 text-xs font-bold text-white transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus sm:w-auto"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <RefreshCw className="size-3.5" strokeWidth={2} aria-hidden="true" />
        Actualizar
      </button>
      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Actualizar notificaciones"
        description="Se recargarán las métricas, la actividad reciente y el estado de los canales. ¿Deseas continuar?"
        confirmLabel="Actualizar"
        isLoading={isLoading}
      />
    </>
  );
}

/** Botón "Ver" de cada plantilla de mensaje. */
export function ViewTemplateButton({ title, body }: { title: string; body: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="min-h-8 shrink-0 rounded-lg border border-line bg-surface px-3 text-2xs font-bold text-ink transition-colors hover:border-accent/60 hover:text-accent focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Ver
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="md"
        title={title}
        description="Vista previa de la plantilla de notificación"
        footer={<ModalSecondaryButton onClick={() => setIsOpen(false)}>Cerrar</ModalSecondaryButton>}
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-surface-subtle p-4">
            <p className="flex items-center gap-2 text-2xs font-bold text-muted">
              <Send className="size-3.5 shrink-0 text-accent" strokeWidth={1.8} aria-hidden="true" />
              Asunto: {title}
            </p>
            <p className="mt-3 text-sm leading-6 text-ink">{body}</p>
            <p className="mt-4 border-t border-line pt-3 text-2xs text-muted">
              Enviado por MEDIQ · Este es un mensaje automático, por favor no respondas a este correo.
            </p>
          </div>
          <div className="rounded-lg bg-accent-soft/60 p-3 text-2xs leading-5 text-muted">
            <p className="font-bold text-ink">Variables disponibles:</p>
            {"{{nombre}}, {{clinica}}, {{fecha}}, {{folio}}"}
          </div>
        </div>
      </Modal>
    </>
  );
}

/** Enlace de pie que abre un modal-lista (actividades / plantillas). */
export function NotificationsFooterLink({
  label,
  title,
  description,
  items,
}: {
  label: string;
  title: string;
  description: string;
  items: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="mt-2.5 flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg text-2xs font-bold text-accent transition-colors hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        {label}<span aria-hidden="true">→</span>
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="lg"
        title={title}
        description={description}
        footer={<ModalSecondaryButton onClick={() => setIsOpen(false)}>Cerrar</ModalSecondaryButton>}
      >
        <ul className="divide-y divide-line">
          {items.map((item) => (
            <li className="flex items-center gap-2.5 py-2.5 text-xs font-bold text-ink" key={item}>
              <Layers className="size-3.5 shrink-0 text-accent" strokeWidth={1.8} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}

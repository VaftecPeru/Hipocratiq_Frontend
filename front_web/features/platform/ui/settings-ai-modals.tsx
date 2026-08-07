"use client";

import { Check, ChevronRight, Layers, Maximize2, Save } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Modal } from "@/shared/ui/modal";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { ModalDetailRow, ModalSecondaryButton } from "@/shared/ui/modal-parts";

/**
 * Islas cliente para IA Epidemiológica. Conectan los controles del mapa,
 * el motor, las fuentes de datos y las predicciones a sus modales.
 */

/** Botón "Guardar Cambios" de la cabecera de IA. */
export function SaveAiButton() {
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
        <Save className="size-3.5" strokeWidth={2} aria-hidden="true" />
        Guardar Cambios
      </button>
      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Guardar configuración de IA"
        description="Se aplicará la nueva configuración del motor de IA epidemiológica. Los modelos se recalibrarán en la próxima ejecución. ¿Deseas continuar?"
        confirmLabel="Guardar Cambios"
        isLoading={isLoading}
      />
    </>
  );
}

/** Botón "Riesgo por región" del mapa: abre el desglose por región. */
export function RiskByRegionButton() {
  const [isOpen, setIsOpen] = useState(false);

  const rows: Array<{ region: string; level: string; tone: string }> = [
    { region: "CDMX, México", level: "Alto", tone: "bg-danger-soft text-danger" },
    { region: "Guadalajara, México", level: "Medio", tone: "bg-warning-soft text-warning" },
    { region: "Lima, Perú", level: "Medio", tone: "bg-warning-soft text-warning" },
    { region: "Arequipa, Perú", level: "Medio", tone: "bg-warning-soft text-warning" },
    { region: "Trujillo, Perú", level: "Bajo", tone: "bg-success-soft text-success" },
    { region: "Monterrey, México", level: "Bajo", tone: "bg-success-soft text-success" },
  ];

  return (
    <>
      <button
        className="min-h-8 rounded-lg border border-line bg-surface px-3 text-2xs font-bold text-ink transition-colors hover:border-accent/60 hover:text-accent focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Riesgo por región
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="md"
        title="Riesgo por región"
        description="Nivel de riesgo epidemiológico estimado por región"
        footer={<ModalSecondaryButton onClick={() => setIsOpen(false)}>Cerrar</ModalSecondaryButton>}
      >
        <ul className="divide-y divide-line">
          {rows.map((row) => (
            <li className="flex items-center justify-between gap-3 py-2.5" key={row.region}>
              <span className="min-w-0 truncate text-xs font-bold text-ink">{row.region}</span>
              <span className={`shrink-0 rounded px-2 py-0.5 text-2xs font-extrabold ${row.tone}`}>{row.level}</span>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}

/** Botón "Ampliar mapa": muestra los mapas renderizados a mayor tamaño. */
export function ExpandMapButton({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="grid size-8 shrink-0 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-accent/60 hover:text-accent focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        aria-label="Ampliar mapa epidemiológico"
        onClick={() => setIsOpen(true)}
      >
        <Maximize2 className="size-3.5" strokeWidth={1.9} aria-hidden="true" />
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="xl"
        title="Mapa Epidemiológico"
        description="Vista ampliada del riesgo por país"
        footer={<ModalSecondaryButton onClick={() => setIsOpen(false)}>Cerrar</ModalSecondaryButton>}
      >
        <div className="grid gap-4 sm:grid-cols-2">{children}</div>
      </Modal>
    </>
  );
}

/** Botón de modelo del motor: alterna habilitado/deshabilitado. */
export function ModelToggleButton({ label, icon }: { label: string; icon: ReactNode }) {
  const [enabled, setEnabled] = useState(true);

  return (
    <button
      className={`flex min-h-8 items-center gap-1.5 rounded-lg border px-2.5 text-2xs font-bold transition-colors focus-visible:outline-3 focus-visible:outline-focus ${
        enabled ? "border-accent/60 bg-accent-soft/40 text-ink" : "border-line bg-surface text-muted"
      }`}
      type="button"
      aria-pressed={enabled}
      onClick={() => setEnabled((value) => !value)}
    >
      <span className={`grid shrink-0 ${enabled ? "text-accent" : "text-muted"}`} aria-hidden="true">
        {icon}
      </span>
      {label}
      {enabled ? <Check className="size-3 shrink-0 text-success" strokeWidth={2.6} aria-hidden="true" /> : null}
    </button>
  );
}

/** Fila de fuente de datos: abre el detalle de la conexión. */
export function DataSourceButton({
  label,
  icon,
  status,
}: {
  label: string;
  icon: ReactNode;
  status: "Conectado" | "Parcial";
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="flex w-full items-center gap-2.5 py-2.5 text-left transition-colors hover:bg-accent-soft/35 focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent" aria-hidden="true">
          {icon}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-bold text-ink">{label}</span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-2xs font-extrabold ${status === "Conectado" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}
        >
          {status}
        </span>
        <ChevronRight className="size-3.5 shrink-0 text-muted" strokeWidth={1.9} aria-hidden="true" />
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="md"
        title={label}
        description="Detalle de la fuente de datos"
        footer={<ModalSecondaryButton onClick={() => setIsOpen(false)}>Cerrar</ModalSecondaryButton>}
      >
        <dl className="divide-y divide-line">
          <ModalDetailRow label="Estado">
            <span className={status === "Conectado" ? "text-success" : "text-warning"}>{status}</span>
          </ModalDetailRow>
          <ModalDetailRow label="Última ingesta">Hoy 10:30 AM</ModalDetailRow>
          <ModalDetailRow label="Frecuencia">Cada 15 minutos</ModalDetailRow>
          <ModalDetailRow label="Registros hoy">12,480</ModalDetailRow>
        </dl>
        {status === "Parcial" ? (
          <div className="mt-4 rounded-lg bg-warning-soft/60 p-3 text-2xs leading-5 text-muted">
            <p className="font-bold text-ink">Atención:</p>
            Esta fuente recibe datos de forma parcial. Revisa la conexión para completar la ingesta.
          </div>
        ) : null}
      </Modal>
    </>
  );
}

/** Detalle de una predicción (botón chevron en la tabla). */
export function PredictionDetailButton({
  region,
  event,
  risk,
  date,
  state,
}: {
  region: string;
  event: string;
  risk: string;
  date: string;
  state: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-subtle hover:text-accent focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        aria-label={`Ver predicción de ${region}`}
        onClick={() => setIsOpen(true)}
      >
        <ChevronRight className="size-3.5" strokeWidth={1.9} aria-hidden="true" />
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="md"
        title={`Predicción: ${region}`}
        description={event}
        footer={<ModalSecondaryButton onClick={() => setIsOpen(false)}>Cerrar</ModalSecondaryButton>}
      >
        <dl className="divide-y divide-line">
          <ModalDetailRow label="Región">{region}</ModalDetailRow>
          <ModalDetailRow label="Evento">{event}</ModalDetailRow>
          <ModalDetailRow label="Nivel de riesgo">{risk}</ModalDetailRow>
          <ModalDetailRow label="Fecha de detección">{date}</ModalDetailRow>
          <ModalDetailRow label="Estado">{state}</ModalDetailRow>
        </dl>
        <div className="mt-4 rounded-lg bg-accent-soft/60 p-3 text-2xs leading-5 text-muted">
          <p className="font-bold text-ink">Recomendación del modelo:</p>
          Reforzar la vigilancia epidemiológica en la región y notificar a las clínicas asociadas para preparar capacidad de atención.
        </div>
      </Modal>
    </>
  );
}

/** Enlace de pie que abre un modal-lista (fuentes / predicciones). */
export function AiFooterLink({
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

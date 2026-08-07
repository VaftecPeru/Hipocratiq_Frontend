"use client";

import { Database, Download, Eye, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Modal } from "@/shared/ui/modal";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import {
  ModalDetailRow,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalSelect,
} from "@/shared/ui/modal-parts";

/**
 * Islas cliente para Respaldos. Conectan las acciones de cada registro,
 * la recuperación, el historial y el botón de actualizar.
 */

type BackupRecord = {
  id: string;
  time: string;
  date: string;
  type: string;
  scope: string;
  size: string;
  region: string;
};

/** Botón "Ver detalle" de cada fila del historial de respaldos. */
export function ViewBackupButton({ record }: { record: BackupRecord }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-accent focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        aria-label={`Ver detalle del respaldo del ${record.date}`}
        onClick={() => setIsOpen(true)}
      >
        <Eye className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="md"
        title={`Respaldo: ${record.date}`}
        description={record.type}
        footer={<ModalSecondaryButton onClick={() => setIsOpen(false)}>Cerrar</ModalSecondaryButton>}
      >
        <dl className="divide-y divide-line">
          <ModalDetailRow label="Fecha/Hora">{record.time}</ModalDetailRow>
          <ModalDetailRow label="Tipo">{record.type}</ModalDetailRow>
          <ModalDetailRow label="Alcance">{record.scope}</ModalDetailRow>
          <ModalDetailRow label="Tamaño">{record.size}</ModalDetailRow>
          <ModalDetailRow label="Estado">
            <span className="text-success">Exitoso</span>
          </ModalDetailRow>
          <ModalDetailRow label="Región">{record.region}</ModalDetailRow>
        </dl>
        <div className="mt-4 rounded-lg bg-success-soft/60 p-3 text-2xs leading-5 text-muted">
          <p className="font-bold text-ink">Detalles técnicos:</p>
          Este respaldo se completó correctamente y está disponible para descarga o restauración inmediata.
        </div>
      </Modal>
    </>
  );
}

/** Botón "Descargar" de cada fila del historial de respaldos. */
export function DownloadBackupButton({ record }: { record: BackupRecord }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-accent focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        aria-label={`Descargar respaldo del ${record.date}`}
        onClick={() => setIsOpen(true)}
      >
        <Download className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
      </button>
      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title={`Descargar respaldo: ${record.date}`}
        description={`Se descargará el respaldo completo (${record.size}). Este proceso puede tardar varios minutos. ¿Deseas continuar?`}
        confirmLabel="Descargar"
        isLoading={isLoading}
      />
    </>
  );
}

/** Botón de acción de recuperación (restaurar BD, archivos, validar). */
export function RecoveryActionButton({
  label,
  description,
  icon,
}: {
  label: string;
  description: string;
  icon: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setIsLoading(false);
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="flex w-full items-center gap-2.5 rounded-lg border border-line bg-surface p-3 text-left transition-colors hover:border-accent/60 hover:bg-accent-soft/35 focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-focus"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent" aria-hidden="true">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-2xs font-extrabold text-ink">{label}</span>
          <span className="mt-0.5 block text-2xs text-muted">{description}</span>
        </span>
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="md"
        title={label}
        description={description}
        footer={
          <>
            <ModalSecondaryButton onClick={() => setIsOpen(false)}>Cancelar</ModalSecondaryButton>
            <ModalPrimaryButton onClick={handleConfirm} tone={label.includes("Validar") ? "accent" : "danger"}>
              <span className="grid" aria-hidden="true">{icon}</span>
              {isLoading ? "Procesando..." : "Confirmar"}
            </ModalPrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <ModalSelect
            id="recovery-backup"
            label="Seleccionar respaldo"
            options={["Hoy 02:00 AM (48.7 GB)", "Ayer 02:00 AM (47.9 GB)", "17 may 02:00 AM (22.1 GB)"]}
            defaultValue="Hoy 02:00 AM (48.7 GB)"
            required
          />

          <div className="rounded-lg border border-warning/30 bg-warning-soft/60 p-3 text-2xs leading-5 text-muted">
            <p className="font-bold text-ink">Atención:</p>
            {label.includes("Restaurar")
              ? "Esta operación sobrescribirá los datos actuales con la versión del respaldo seleccionado. Asegúrate de haber creado un respaldo reciente antes de continuar."
              : "Se verificará la integridad de todos los archivos del respaldo seleccionado. El proceso puede tardar varios minutos."}
          </div>
        </div>
      </Modal>
    </>
  );
}

/** Enlace "Ver historial completo" al pie del historial de respaldos. */
export function FullBackupHistoryLink() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="mt-2.5 flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg text-2xs font-bold text-accent transition-colors hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Ver historial completo<span aria-hidden="true">→</span>
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="lg"
        title="Historial completo de respaldos"
        description="Todos los respaldos ejecutados en los últimos 90 días"
        footer={<ModalSecondaryButton onClick={() => setIsOpen(false)}>Cerrar</ModalSecondaryButton>}
      >
        <div className="rounded-lg border border-line bg-surface-subtle p-3 text-2xs leading-5 text-muted">
          <p className="font-bold text-ink">Vista previa</p>
          Aquí se listarían todos los respaldos históricos con filtros por tipo, fecha, región y estado.
        </div>
        <ul className="mt-3 divide-y divide-line text-xs">
          {[
            { date: "Hoy 02:00 AM", type: "Respaldo automático", size: "48.7 GB", ok: true },
            { date: "Ayer 02:00 AM", type: "Respaldo automático", size: "47.9 GB", ok: true },
            { date: "17 may 02:00 AM", type: "Respaldo de base de datos", size: "22.1 GB", ok: true },
            { date: "16 may 11:35 AM", type: "Respaldo manual", size: "46.2 GB", ok: true },
            { date: "16 may 02:00 AM", type: "Respaldo de archivos", size: "18.4 GB", ok: true },
            { date: "15 may 02:00 AM", type: "Respaldo de logs", size: "2.3 GB", ok: true },
          ].map((row) => (
            <li className="flex items-center justify-between gap-3 py-2.5" key={`${row.date}-${row.type}`}>
              <div className="min-w-0">
                <p className="truncate font-bold text-ink">{row.type}</p>
                <p className="mt-0.5 text-2xs text-muted">{row.date} · {row.size}</p>
              </div>
              <span className="shrink-0 rounded px-2 py-0.5 text-2xs font-extrabold bg-success-soft text-success">
                Exitoso
              </span>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}

/** Botón "Actualizar" de la cabecera de Respaldos. */
export function RefreshBackupsButton() {
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
        title="Actualizar respaldos"
        description="Se recargarán las métricas y el historial de respaldos. ¿Deseas continuar?"
        confirmLabel="Actualizar"
        isLoading={isLoading}
      />
    </>
  );
}

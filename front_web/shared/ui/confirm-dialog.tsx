"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "./modal";

type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmTone?: "danger" | "accent";
  isLoading?: boolean;
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  confirmTone = "accent",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={title}
      footer={
        <>
          <button
            className="flex min-h-9 flex-1 items-center justify-center rounded-lg border border-line bg-surface px-4 text-xs font-bold text-ink transition-colors hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60 sm:flex-initial sm:px-5"
            disabled={isLoading}
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className={`flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-4 text-xs font-bold text-white transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60 sm:flex-initial sm:px-5 ${
              confirmTone === "danger"
                ? "bg-danger hover:bg-danger/90"
                : "bg-accent hover:bg-accent-hover"
            }`}
            disabled={isLoading}
            onClick={onConfirm}
            type="button"
          >
            {isLoading ? "Procesando..." : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-lg ${
            confirmTone === "danger" ? "bg-danger-soft text-danger" : "bg-accent-soft text-accent"
          }`}
          aria-hidden="true"
        >
          <AlertTriangle className="size-5" strokeWidth={1.8} />
        </span>
        <p className="min-w-0 text-sm leading-6 text-ink">{description}</p>
      </div>
    </Modal>
  );
}

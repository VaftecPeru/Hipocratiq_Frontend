"use client";

import { Camera, ImageUp, Pencil, Save, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/shared/ui/modal";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import {
  ModalField,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalSelect,
} from "@/shared/ui/modal-parts";

/**
 * Islas cliente para la Configuración General. Permiten que la página siga
 * siendo un componente de servidor (con metadata) mientras cada control
 * accionable abre su modal correspondiente.
 */

/** Modal de subida reutilizable para logo, favicon y fotos de branding. */
function UploadModal({
  isOpen,
  onClose,
  title,
  description,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={title}
      description={description}
      footer={
        <>
          <ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton>
          <ModalPrimaryButton onClick={handleUpload}>
            <ImageUp className="size-3.5" strokeWidth={1.9} />
            {isLoading ? "Subiendo..." : "Guardar Imagen"}
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid place-items-center rounded-lg border-2 border-dashed border-line bg-surface-subtle p-8">
          <div className="text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-lg bg-accent-soft text-accent">
              <ImageUp className="size-8" strokeWidth={1.8} aria-hidden="true" />
            </div>
            <p className="mt-3 text-xs font-bold text-ink">Arrastra una imagen aquí</p>
            <p className="mt-1 text-2xs text-muted">o haz clic para seleccionar</p>
            <button
              className="mt-3 rounded-lg border border-line bg-surface px-3 py-1.5 text-2xs font-bold text-ink transition-colors hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus"
              type="button"
            >
              Seleccionar archivo
            </button>
          </div>
        </div>

        <div className="text-2xs text-muted">
          <p className="font-bold text-ink">Requisitos:</p>
          <ul className="mt-1 space-y-0.5">
            <li>• Formatos: JPG, PNG, WEBP</li>
            <li>• Tamaño máximo: 2 MB</li>
            <li>• Dimensiones recomendadas: 400×400 px</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}

/** Botón "Cambiar foto" de la cabecera de Configuración General. */
export function ChangePhotoButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="flex min-h-11 w-full shrink-0 items-center gap-2.5 rounded-xl border border-line bg-surface px-4 text-left transition-colors hover:border-accent/60 focus-visible:outline-3 focus-visible:outline-focus sm:w-auto"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <Camera className="size-4 shrink-0 text-muted" strokeWidth={1.8} aria-hidden="true" />
        <span>
          <span className="block text-xs font-extrabold text-ink">Cambiar foto</span>
          <span className="block text-2xs text-muted">JPG, PNG, WEBP</span>
        </span>
      </button>
      <UploadModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Cambiar foto"
        description="Imagen mostrada en el perfil de la plataforma"
      />
    </>
  );
}

/** Botón "Cambiar" de cada recurso de branding (logo, favicon, etc.). */
export function ChangeAssetButton({ title }: { title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="min-h-8 shrink-0 rounded-lg border border-line bg-surface px-3 text-2xs font-bold text-ink transition-colors hover:border-accent/60 hover:text-accent focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Cambiar
      </button>
      <UploadModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Cambiar ${title}`}
        description="Actualiza el recurso de branding de la plataforma"
      />
    </>
  );
}

/** Botón "Guardar Cambios" de los Parámetros del Sistema. */
export function SaveParametersButton() {
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
        title="Guardar parámetros del sistema"
        description="Se aplicarán los nuevos parámetros generales a toda la plataforma MEDIQ. ¿Deseas continuar?"
        confirmLabel="Guardar Cambios"
        isLoading={isLoading}
      />
    </>
  );
}

/** Botón lápiz "Editar" de cada fila de Seguridad Rápida. */
export function EditSecurityButton({ title, description }: { title: string; description: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-accent focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        aria-label={`Editar ${title}`}
        onClick={() => setIsOpen(true)}
      >
        <Pencil className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="md"
        title={`Editar: ${title}`}
        description={description}
        footer={
          <>
            <ModalSecondaryButton onClick={() => setIsOpen(false)}>Cancelar</ModalSecondaryButton>
            <ModalPrimaryButton onClick={handleSave}>
              <ShieldCheck className="size-3.5" strokeWidth={1.9} />
              {isLoading ? "Guardando..." : "Guardar Regla"}
            </ModalPrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-line bg-surface-subtle p-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink">Regla activa</p>
              <p className="mt-0.5 text-2xs text-muted">Aplica esta política de seguridad a toda la plataforma</p>
            </div>
            <label className="relative inline-block h-6 w-11 cursor-pointer">
              <input className="peer sr-only" defaultChecked type="checkbox" />
              <span className="absolute inset-0 rounded-full bg-line transition-colors peer-checked:bg-accent peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus" />
              <span className="absolute top-1 left-1 size-4 rounded-full bg-surface transition-all peer-checked:left-6" />
            </label>
          </div>

          <ModalSelect
            id="security-enforcement"
            label="Nivel de aplicación"
            options={["Obligatorio para todos", "Obligatorio solo administradores", "Recomendado (opcional)"]}
            defaultValue="Obligatorio para todos"
            required
          />

          <ModalField
            id="security-value"
            label="Valor / umbral"
            defaultValue=""
            placeholder="Ej: 30 minutos, 5 intentos, 3 IPs..."
            hint="Deja el valor que corresponda a esta política."
          />
        </div>
      </Modal>
    </>
  );
}

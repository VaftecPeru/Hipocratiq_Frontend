"use client";

import { Globe, Languages, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import type { CountryCode } from "@/shared/ui/country-flag";
import { Modal } from "@/shared/ui/modal";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import {
  ModalField,
  ModalGrid,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalSelect,
} from "@/shared/ui/modal-parts";

/**
 * Islas cliente para Idiomas y Región. Permiten que la página siga siendo
 * un componente de servidor mientras cada botón de idioma abre su modal.
 */

type ConfiguredLanguage = {
  code: string;
  name: string;
  countryCode: CountryCode;
  isDefault: boolean;
};

/** Botón "Agregar Idioma" en la cabecera de la sección de idioma. */
export function AddLanguageButton() {
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
        className="flex min-h-9 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border border-accent bg-surface px-3 text-xs font-bold text-accent transition-colors hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus sm:w-auto"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
        Agregar Idioma
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="md"
        title="Agregar Idioma"
        description="Configura un nuevo idioma disponible en la plataforma"
        footer={
          <>
            <ModalSecondaryButton onClick={() => setIsOpen(false)}>Cancelar</ModalSecondaryButton>
            <ModalPrimaryButton onClick={handleSave}>
              <Languages className="size-3.5" strokeWidth={1.9} />
              {isLoading ? "Guardando..." : "Agregar Idioma"}
            </ModalPrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <ModalGrid cols={2}>
            <ModalSelect
              id="language-locale"
              label="Código de Idioma"
              options={["es-MX", "es-ES", "en-US", "en-GB", "pt-BR", "fr-FR"]}
              required
            />
            <ModalField
              id="language-name"
              label="Nombre del Idioma"
              placeholder="Ej: Español (México)"
              required
            />
          </ModalGrid>

          <ModalSelect
            id="language-country"
            label="País / Región"
            options={["México", "Estados Unidos", "España", "Perú", "Brasil", "Francia"]}
            required
          />

          <div className="flex items-center justify-between rounded-lg border border-line bg-surface-subtle p-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink">Establecer como predeterminado</p>
              <p className="mt-0.5 text-2xs text-muted">Este idioma será el idioma base de la plataforma</p>
            </div>
            <label className="relative inline-block h-6 w-11 cursor-pointer">
              <input className="peer sr-only" type="checkbox" />
              <span className="absolute inset-0 rounded-full bg-line transition-colors peer-checked:bg-accent peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus" />
              <span className="absolute top-1 left-1 size-4 rounded-full bg-surface transition-all peer-checked:left-6" />
            </label>
          </div>
        </div>
      </Modal>
    </>
  );
}

/** Botón lápiz "Editar" de cada fila de idioma configurado. */
export function EditLanguageButton({ language }: { language: ConfiguredLanguage }) {
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
        className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-accent focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        aria-label={`Editar ${language.name}`}
        onClick={() => setIsOpen(true)}
      >
        <Pencil className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="md"
        title={`Editar: ${language.name}`}
        description="Actualiza la configuración del idioma"
        footer={
          <>
            <ModalSecondaryButton onClick={() => setIsOpen(false)}>Cancelar</ModalSecondaryButton>
            <ModalPrimaryButton onClick={handleSave}>
              <Languages className="size-3.5" strokeWidth={1.9} />
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </ModalPrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <ModalField
            id="edit-language-name"
            label="Nombre del Idioma"
            defaultValue={language.name}
            required
          />

          <ModalGrid cols={2}>
            <ModalField
              id="edit-language-code"
              label="Código"
              defaultValue={language.code}
              hint="Código de locale (ISO 639-1)"
            />
            <ModalSelect
              id="edit-language-country"
              label="País / Región"
              options={["México", "Estados Unidos", "España", "Perú"]}
              required
            />
          </ModalGrid>

          <div className="flex items-center justify-between rounded-lg border border-line bg-surface-subtle p-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink">Predeterminado</p>
              <p className="mt-0.5 text-2xs text-muted">Idioma base de la plataforma</p>
            </div>
            <label className="relative inline-block h-6 w-11 cursor-pointer">
              <input className="peer sr-only" defaultChecked={language.isDefault} type="checkbox" />
              <span className="absolute inset-0 rounded-full bg-line transition-colors peer-checked:bg-accent peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus" />
              <span className="absolute top-1 left-1 size-4 rounded-full bg-surface transition-all peer-checked:left-6" />
            </label>
          </div>
        </div>
      </Modal>
    </>
  );
}

/** Botón basura "Eliminar" de cada fila de idioma (excepto predeterminado). */
export function DeleteLanguageButton({ language }: { language: ConfiguredLanguage }) {
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
        className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-danger-soft hover:text-danger focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        aria-label={`Eliminar ${language.name}`}
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
      </button>
      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title={`Eliminar ${language.name}`}
        description={`Se eliminará este idioma de la plataforma. Los usuarios que lo tienen configurado volverán al idioma predeterminado. ¿Deseas continuar?`}
        confirmLabel="Eliminar Idioma"
        confirmTone="danger"
        isLoading={isLoading}
      />
    </>
  );
}

/** Botón "Guardar Cambios" al pie de la página de idiomas. */
export function SaveLanguagesButton() {
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
        title="Guardar configuración de idiomas"
        description="Los cambios en idioma y región pueden requerir que los usuarios cierren sesión para aplicarse por completo. ¿Deseas continuar?"
        confirmLabel="Guardar Cambios"
        isLoading={isLoading}
      />
    </>
  );
}

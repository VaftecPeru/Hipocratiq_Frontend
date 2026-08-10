"use client";

import { Download, Filter, Send } from "lucide-react";
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

export function ExportReportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
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
      title="Exportar Reporte"
      description="Selecciona el formato y opciones de exportación"
      footer={
        <>
          <ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton>
          <ModalPrimaryButton onClick={handleExport}>
            <Download className="size-3.5" strokeWidth={1.9} />
            {isLoading ? "Exportando..." : "Exportar"}
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <ModalSelect
          id="export-type"
          label="Tipo de Reporte"
          options={["Reporte de Ingresos", "Reporte de Usuarios", "Reporte de Actividad", "Reporte de Clínicas"]}
          required
        />

        <ModalGrid cols={2}>
          <ModalField id="export-start" label="Fecha Inicio" type="date" defaultValue="2024-01-01" required />
          <ModalField id="export-end" label="Fecha Fin" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
        </ModalGrid>

        <ModalSelect
          id="export-format"
          label="Formato"
          options={["Excel (.xlsx)", "CSV (.csv)", "PDF (.pdf)"]}
          defaultValue="Excel (.xlsx)"
          required
        />

        <ModalSelect
          id="export-scope"
          label="Alcance"
          options={["Todas las clínicas", "Solo México", "Solo Perú", "Selección personalizada"]}
          defaultValue="Todas las clínicas"
          required
        />

        <div className="space-y-2">
          <label className="text-2xs font-bold text-muted">Opciones Adicionales</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-ink">
              <input className="size-4 accent-accent" defaultChecked type="checkbox" />
              Incluir gráficas
            </label>
            <label className="flex items-center gap-2 text-xs text-ink">
              <input className="size-4 accent-accent" defaultChecked type="checkbox" />
              Incluir datos detallados
            </label>
            <label className="flex items-center gap-2 text-xs text-ink">
              <input className="size-4 accent-accent" type="checkbox" />
              Enviar por correo al completar
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function AdvancedFiltersModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Filtros Avanzados"
      description="Personaliza los criterios de búsqueda"
      footer={
        <>
          <button
            className="flex min-h-9 flex-1 items-center justify-center rounded-lg border border-line bg-surface px-4 text-xs font-medium text-muted transition-colors hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus sm:flex-initial"
            type="button"
          >
            Limpiar filtros
          </button>
          <ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton>
          <ModalPrimaryButton onClick={handleApply}>
            <Filter className="size-3.5" strokeWidth={1.9} />
            {isLoading ? "Aplicando..." : "Aplicar Filtros"}
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <ModalGrid cols={2}>
          <ModalField id="filter-start" label="Fecha Inicio" type="date" />
          <ModalField id="filter-end" label="Fecha Fin" type="date" />
        </ModalGrid>

        <ModalGrid cols={2}>
          <ModalSelect id="filter-country" label="País" options={["Todos", "México", "Perú", "USA"]} defaultValue="Todos" />
          <ModalSelect id="filter-status" label="Estado" options={["Todos", "Activo", "Inactivo", "Suspendido"]} defaultValue="Todos" />
        </ModalGrid>

        <ModalSelect
          id="filter-plan"
          label="Plan"
          options={["Todos los planes", "Básico", "Profesional", "Enterprise"]}
          defaultValue="Todos los planes"
        />

        <ModalField id="filter-min-users" label="Usuarios mínimos" type="number" placeholder="0" />
        <ModalField id="filter-search" label="Búsqueda de texto" placeholder="Nombre, email, ID..." />
      </div>
    </Modal>
  );
}

export function SendNotificationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
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
      title="Enviar Notificación Global"
      description="Difundir un mensaje a múltiples usuarios"
      footer={
        <>
          <ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton>
          <ModalPrimaryButton onClick={handleSend}>
            <Send className="size-3.5" strokeWidth={1.9} />
            {isLoading ? "Enviando..." : "Enviar Notificación"}
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <ModalSelect
          id="notif-audience"
          label="Destinatarios"
          options={[
            "Todos los usuarios",
            "Solo administradores de clínica",
            "Solo médicos",
            "Usuarios de México",
            "Usuarios de Perú",
            "Selección personalizada",
          ]}
          defaultValue="Todos los usuarios"
          required
        />

        <ModalSelect
          id="notif-priority"
          label="Prioridad"
          options={["Normal", "Alta", "Crítica"]}
          defaultValue="Normal"
          required
        />

        <ModalField id="notif-title" label="Título" placeholder="Título de la notificación" required />
        <ModalTextarea id="notif-message" label="Mensaje" placeholder="Escribe el contenido de la notificación..." rows={5} required />

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-ink">
            <input className="size-4 accent-accent" defaultChecked type="checkbox" />
            Enviar por correo electrónico
          </label>
          <label className="flex items-center gap-2 text-xs text-ink">
            <input className="size-4 accent-accent" defaultChecked type="checkbox" />
            Mostrar en la plataforma
          </label>
          <label className="flex items-center gap-2 text-xs text-ink">
            <input className="size-4 accent-accent" type="checkbox" />
            Push notification (si está habilitado)
          </label>
        </div>

        <div className="rounded-lg border border-warning/30 bg-warning-soft/60 p-3 text-2xs leading-5 text-muted">
          <p className="font-bold text-ink">Atención:</p>
          Esta notificación será enviada a múltiples usuarios. Revisa el contenido antes de enviar.
        </div>
      </div>
    </Modal>
  );
}

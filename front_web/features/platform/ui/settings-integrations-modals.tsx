"use client";

import { RefreshCw, Save, Settings } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/shared/ui/modal";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import {
  ModalDetailRow,
  ModalField,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalSelect,
} from "@/shared/ui/modal-parts";

/**
 * Islas cliente para Integraciones. Cada control accionable (configurar,
 * ver detalles, guardar, ver historial) abre su modal correspondiente.
 */

/** Enlace/botón "Ver detalles" de una integración conectada. */
export function IntegrationDetailsButton({ name }: { name: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="flex min-h-8 items-center gap-1 text-2xs font-bold text-accent transition-colors hover:text-accent-hover focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Ver detalles<span aria-hidden="true">→</span>
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="md"
        title={name}
        description="Detalle de la integración"
        footer={<ModalSecondaryButton onClick={() => setIsOpen(false)}>Cerrar</ModalSecondaryButton>}
      >
        <dl className="divide-y divide-line">
          <ModalDetailRow label="Estado">
            <span className="inline-flex items-center gap-1.5 text-success">
              <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
              Conectado
            </span>
          </ModalDetailRow>
          <ModalDetailRow label="Última sincronización">24/05/2024 10:30 AM</ModalDetailRow>
          <ModalDetailRow label="Ambiente">Producción</ModalDetailRow>
          <ModalDetailRow label="Cobertura">México y Perú</ModalDetailRow>
          <ModalDetailRow label="Cifrado">TLS 1.3 · Extremo a extremo</ModalDetailRow>
        </dl>
        <div className="mt-4 rounded-lg bg-accent-soft/60 p-3 text-2xs leading-5 text-muted">
          <p className="font-bold text-ink">Nota:</p>
          Esta integración cumple con los estándares de seguridad de MEDIQ y se sincroniza automáticamente.
        </div>
      </Modal>
    </>
  );
}

/** Botón "Configurar" de una integración. */
export function ConfigureIntegrationButton({ name }: { name: string }) {
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
        className="flex min-h-8 items-center gap-1 text-2xs font-bold text-accent transition-colors hover:text-accent-hover focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <Settings className="size-3" strokeWidth={2} aria-hidden="true" />
        Configurar
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="md"
        title={`Configurar: ${name}`}
        description="Ajusta las credenciales y parámetros de la integración"
        footer={
          <>
            <ModalSecondaryButton onClick={() => setIsOpen(false)}>Cancelar</ModalSecondaryButton>
            <ModalPrimaryButton onClick={handleSave}>
              <Save className="size-3.5" strokeWidth={1.9} />
              {isLoading ? "Guardando..." : "Guardar Configuración"}
            </ModalPrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-line bg-surface-subtle p-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink">Integración habilitada</p>
              <p className="mt-0.5 text-2xs text-muted">Activa o pausa el servicio sin borrar credenciales</p>
            </div>
            <label className="relative inline-block h-6 w-11 cursor-pointer">
              <input className="peer sr-only" defaultChecked type="checkbox" />
              <span className="absolute inset-0 rounded-full bg-line transition-colors peer-checked:bg-accent peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus" />
              <span className="absolute top-1 left-1 size-4 rounded-full bg-surface transition-all peer-checked:left-6" />
            </label>
          </div>

          <ModalSelect
            id="integration-environment"
            label="Ambiente"
            options={["Producción", "Pruebas (sandbox)"]}
            defaultValue="Producción"
            required
          />

          <ModalField
            id="integration-endpoint"
            label="Endpoint / URL base"
            placeholder="https://api.servicio.com/v1"
          />

          <ModalField
            id="integration-api-key"
            label="API Key"
            type="password"
            defaultValue="sk_live_51H8xQ2eZvKYlo2C"
            hint="La clave se almacena cifrada y nunca se muestra completa."
          />
        </div>
      </Modal>
    </>
  );
}

/** Botón "Ver detalles" de una fila del historial de sincronizaciones. */
export function SyncDetailsButton({
  integration,
  lastRun,
  result,
  region,
}: {
  integration: string;
  lastRun: string;
  result: string;
  region: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isError = result === "Error";

  return (
    <>
      <button
        className="flex min-h-8 items-center gap-1 text-2xs font-bold text-accent transition-colors hover:text-accent-hover focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Ver detalles<span aria-hidden="true">→</span>
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="md"
        title="Detalle de sincronización"
        description={integration}
        footer={<ModalSecondaryButton onClick={() => setIsOpen(false)}>Cerrar</ModalSecondaryButton>}
      >
        <dl className="divide-y divide-line">
          <ModalDetailRow label="Integración">{integration}</ModalDetailRow>
          <ModalDetailRow label="Última ejecución">{lastRun}</ModalDetailRow>
          <ModalDetailRow label="Resultado">
            <span className={isError ? "text-danger" : "text-success"}>{result}</span>
          </ModalDetailRow>
          <ModalDetailRow label="Región">{region}</ModalDetailRow>
        </dl>
        <div
          className={`mt-4 rounded-lg p-3 text-2xs leading-5 text-muted ${isError ? "bg-danger-soft/60" : "bg-success-soft/60"}`}
        >
          <p className="font-bold text-ink">{isError ? "Detalle del error:" : "Resumen:"}</p>
          {isError
            ? "Timeout de conexión con el servidor remoto. Se reintentará en la próxima ventana de sincronización."
            : "La sincronización se completó correctamente sin registros pendientes."}
        </div>
      </Modal>
    </>
  );
}

/** Enlace "Ver historial completo" al pie del historial. */
export function FullHistoryLink() {
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
        title="Historial completo de sincronizaciones"
        description="Registro de las ejecuciones de todas las integraciones"
        footer={<ModalSecondaryButton onClick={() => setIsOpen(false)}>Cerrar</ModalSecondaryButton>}
      >
        <div className="rounded-lg border border-line bg-surface-subtle p-3 text-2xs leading-5 text-muted">
          <p className="font-bold text-ink">Vista previa</p>
          Aquí se listarían todas las sincronizaciones históricas con filtros por integración, resultado, región y rango de fechas.
        </div>
        <ul className="mt-3 divide-y divide-line text-xs">
          {[
            { i: "Email / SMTP", t: "24/05/2024 10:30 AM", ok: true },
            { i: "WhatsApp Business", t: "24/05/2024 10:28 AM", ok: true },
            { i: "Laboratorio (HL7)", t: "24/05/2024 09:50 AM", ok: false },
            { i: "PACS / Imágenes", t: "24/05/2024 09:45 AM", ok: true },
            { i: "Google Calendar", t: "24/05/2024 09:30 AM", ok: true },
          ].map((row) => (
            <li className="flex items-center justify-between gap-3 py-2.5" key={`${row.i}-${row.t}`}>
              <div className="min-w-0">
                <p className="truncate font-bold text-ink">{row.i}</p>
                <p className="mt-0.5 font-mono text-2xs text-muted">{row.t}</p>
              </div>
              <span
                className={`shrink-0 rounded px-2 py-0.5 text-2xs font-extrabold ${row.ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}
              >
                {row.ok ? "Éxito" : "Error"}
              </span>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}

/** Botón "Guardar Cambios" de la cabecera de Integraciones. */
export function SaveIntegrationsButton() {
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
        title="Guardar cambios de integraciones"
        description="Se aplicarán los cambios de configuración a todas las integraciones activas. ¿Deseas continuar?"
        confirmLabel="Guardar Cambios"
        isLoading={isLoading}
      />
    </>
  );
}

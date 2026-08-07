"use client";

import { Building2, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { CountryFlag, type CountryCode } from "@/shared/ui/country-flag";
import { Modal } from "@/shared/ui/modal";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import {
  ModalField,
  ModalGrid,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalSelect,
  ModalDetailRow,
} from "@/shared/ui/modal-parts";

type ClinicFormData = {
  name: string;
  country: CountryCode;
  city: string;
  address: string;
  phone: string;
  email: string;
  plan: "basic" | "professional" | "enterprise";
  adminName: string;
  adminEmail: string;
};

type ClinicDetailData = ClinicFormData & {
  id: string;
  status: "active" | "suspended" | "inactive";
  users: number;
  patients: number;
  createdAt: string;
};

export function ClinicDetailModal({
  isOpen,
  onClose,
  clinic,
}: {
  isOpen: boolean;
  onClose: () => void;
  clinic: ClinicDetailData | null;
}) {
  if (!clinic) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title={clinic.name} description="Detalle de la clínica">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-lg bg-accent-soft text-accent">
            <Building2 className="size-6" strokeWidth={1.8} />
          </span>
          <div className="flex-1">
            <p className="flex items-center gap-2 text-sm font-extrabold text-ink">
              <CountryFlag countryCode={clinic.country} />
              {clinic.city}
            </p>
            <p className="mt-0.5 text-2xs text-muted">{clinic.address}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-2xs font-extrabold ${
              clinic.status === "active" ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
            }`}
          >
            {clinic.status === "active" ? "Activa" : "Suspendida"}
          </span>
        </div>

        <dl className="divide-y divide-line rounded-lg border border-line">
          <ModalDetailRow label="Email">{clinic.email}</ModalDetailRow>
          <ModalDetailRow label="Teléfono">{clinic.phone}</ModalDetailRow>
          <ModalDetailRow label="Plan">
            <span className="rounded px-2 py-0.5 text-2xs font-extrabold bg-plan-professional text-white">
              {clinic.plan === "basic" ? "Básico" : clinic.plan === "professional" ? "Profesional" : "Enterprise"}
            </span>
          </ModalDetailRow>
          <ModalDetailRow label="Usuarios">{clinic.users}</ModalDetailRow>
          <ModalDetailRow label="Pacientes activos">{clinic.patients}</ModalDetailRow>
          <ModalDetailRow label="Fecha de registro">{clinic.createdAt}</ModalDetailRow>
        </dl>

        <div className="flex gap-2">
          <button
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-xs font-bold text-ink transition-colors hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus"
            type="button"
          >
            <MapPin className="size-3.5" strokeWidth={1.8} />
            Ver ubicación
          </button>
          <button
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-xs font-bold text-ink transition-colors hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus"
            type="button"
          >
            <Users className="size-3.5" strokeWidth={1.8} />
            Ver usuarios
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function EditClinicModal({
  isOpen,
  onClose,
  clinic,
}: {
  isOpen: boolean;
  onClose: () => void;
  clinic: ClinicFormData | null;
}) {
  const [isLoading, setIsLoading] = useState(false);

  if (!clinic) return null;

  const handleSubmit = async () => {
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
      title="Editar Clínica"
      description={clinic.name}
      footer={
        <>
          <ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton>
          <ModalPrimaryButton onClick={handleSubmit}>{isLoading ? "Guardando..." : "Guardar Cambios"}</ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <ModalGrid cols={2}>
          <ModalField id="edit-name" label="Nombre" defaultValue={clinic.name} required />
          <ModalSelect
            id="edit-country"
            label="País"
            options={["México", "Perú", "USA"]}
            defaultValue={clinic.country === "MX" ? "México" : clinic.country === "PE" ? "Perú" : "USA"}
            required
          />
        </ModalGrid>

        <ModalGrid cols={2}>
          <ModalField id="edit-city" label="Ciudad" defaultValue={clinic.city} required />
          <ModalField id="edit-phone" label="Teléfono" defaultValue={clinic.phone} required />
        </ModalGrid>

        <ModalField id="edit-address" label="Dirección" defaultValue={clinic.address} required />
        <ModalField id="edit-email" label="Email" defaultValue={clinic.email} type="email" required />

        <ModalSelect
          id="edit-plan"
          label="Plan"
          options={["Básico", "Profesional", "Enterprise"]}
          defaultValue={clinic.plan === "basic" ? "Básico" : clinic.plan === "professional" ? "Profesional" : "Enterprise"}
          required
        />
      </div>
    </Modal>
  );
}

export function SuspendClinicDialog({
  isOpen,
  onClose,
  onConfirm,
  clinicName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clinicName: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onConfirm();
    setIsLoading(false);
  };

  return (
    <ConfirmDialog
      confirmLabel="Suspender Clínica"
      confirmTone="danger"
      description={`¿Estás seguro de suspender "${clinicName}"? Los usuarios de esta clínica no podrán acceder a la plataforma hasta que sea reactivada.`}
      isLoading={isLoading}
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Suspender Clínica"
    />
  );
}

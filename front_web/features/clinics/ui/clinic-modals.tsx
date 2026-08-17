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
import type { Clinic } from "@/features/clinics/model/clinic.types";
import { createAdminClinic, updateAdminClinic } from "@/features/clinics/api/browser-clinics";

const PLAN_LABELS: Record<Clinic["plan"], "Básico" | "Profesional" | "Enterprise"> = {
  basic: "Básico",
  professional: "Profesional",
  enterprise: "Enterprise",
};

const PLAN_BADGE_CLASSES: Record<Clinic["plan"], string> = {
  basic: "bg-plan-basic text-white",
  professional: "bg-plan-professional text-white",
  enterprise: "bg-plan-enterprise text-white",
};

const COUNTRY_CODES: CountryCode[] = ["MX", "PE", "US"];

const COUNTRY_LABELS: Record<CountryCode, string> = {
  MX: "México",
  PE: "Perú",
  US: "Estados Unidos",
};

const COUNTRY_LABELS_TO_OPTIONS = Object.values(COUNTRY_LABELS).map((label) => ({ value: label, label }));

function toCountryCode(value: Clinic["countryCode"]): CountryCode {
  return COUNTRY_CODES.includes(value) ? value : "MX";
}

export function CreateClinicModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (clinic: Clinic) => void;
}) {
  const [name, setName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [countryCode, setCountryCode] = useState<CountryCode>("MX");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [plan, setPlan] = useState<Clinic["plan"]>("basic");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (isLoading || !name.trim() || !taxId.trim() || !contactPhone.trim() || !address.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const clinic = await createAdminClinic({
        name: name.trim(),
        taxId: taxId.trim(),
        countryCode,
        contactPhone: contactPhone.trim(),
        address: address.trim(),
        plan,
        billingCycle,
      });
      onCreated(clinic);
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos crear la clínica.");
    } finally {
      setIsLoading(false);
    }
  }

  const canCreate = Boolean(name.trim() && taxId.trim() && contactPhone.trim() && address.trim()) && !isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Nueva clínica"
      description="Crea el tenant y su suscripción inicial"
      footer={<><ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton><ModalPrimaryButton disabled={!canCreate} onClick={handleCreate}>{isLoading ? "Creando..." : "Crear clínica"}</ModalPrimaryButton></>}
    >
      <div className="space-y-4">
        <ModalGrid cols={2}>
          <ModalField id="create-clinic-name" label="Nombre de la clínica" value={name} onChange={(event) => setName(event.target.value)} required />
          <ModalField id="create-clinic-tax" label="Identificación fiscal" value={taxId} onChange={(event) => setTaxId(event.target.value)} required />
        </ModalGrid>
        <ModalGrid cols={2}>
          <ModalSelect id="create-clinic-country" label="País" options={Object.entries(COUNTRY_LABELS).map(([value, label]) => ({ value, label }))} value={countryCode} onChange={(value) => setCountryCode(value as CountryCode)} required />
          <ModalField id="create-clinic-phone" label="Teléfono de contacto" placeholder={countryCode === "PE" ? "987 654 321" : "55 1234 5678"} value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} required />
        </ModalGrid>
        <ModalField id="create-clinic-address" label="Ciudad / Dirección" value={address} onChange={(event) => setAddress(event.target.value)} required />
        <ModalGrid cols={2}>
          <ModalSelect id="create-clinic-plan" label="Plan inicial" options={[{ value: "basic", label: "Básico" }, { value: "professional", label: "Profesional" }, { value: "enterprise", label: "Enterprise" }]} value={plan} onChange={(value) => setPlan(value as Clinic["plan"])} required />
          <ModalSelect id="create-clinic-cycle" label="Ciclo de facturación" options={[{ value: "monthly", label: "Mensual" }, { value: "annual", label: "Anual" }]} value={billingCycle} onChange={(value) => setBillingCycle(value as "monthly" | "annual")} required />
        </ModalGrid>
        <p className="rounded-lg border border-accent/20 bg-accent-soft p-3 text-2xs leading-5 text-accent">La clínica se creará activa y sin usuarios. Después podrás asignar su administrador desde Roles y permisos.</p>
        {error ? <p className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-xs font-semibold text-danger" role="alert">{error}</p> : null}
      </div>
    </Modal>
  );
}

export function ClinicDetailModal({
  isOpen,
  onClose,
  clinic,
}: {
  isOpen: boolean;
  onClose: () => void;
  clinic: Clinic | null;
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
              <CountryFlag countryCode={clinic.countryCode} />
              {clinic.country}
            </p>
            <p className="mt-0.5 text-2xs text-muted">{clinic.city}</p>
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
          <ModalDetailRow label="Plan">
            <span className={`rounded px-2 py-0.5 text-2xs font-extrabold ${PLAN_BADGE_CLASSES[clinic.plan]}`}>
              {PLAN_LABELS[clinic.plan]}
            </span>
          </ModalDetailRow>
          <ModalDetailRow label="Usuarios">{clinic.users}</ModalDetailRow>
          <ModalDetailRow label="Pacientes activos">{clinic.patients}</ModalDetailRow>
          <ModalDetailRow label="Facturación mensual">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(clinic.monthlyBilling)}
          </ModalDetailRow>
          <ModalDetailRow label="Último pago">{clinic.lastPayment ?? "—"}</ModalDetailRow>
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
  onUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  clinic: Clinic | null;
  onUpdated: (clinic: Clinic) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(clinic?.name ?? "");
  const [country, setCountry] = useState(clinic ? COUNTRY_LABELS[toCountryCode(clinic.countryCode)] : "México");
  const [city, setCity] = useState(clinic?.city ?? "");
  const [plan, setPlan] = useState<string>(clinic ? PLAN_LABELS[clinic.plan] : "Básico");

  // Si cambia la clínica seleccionada mientras el modal está abierto, refresca los valores del formulario.
  const [lastClinicId, setLastClinicId] = useState(clinic?.id);

  if (clinic?.id !== lastClinicId) {
    setName(clinic?.name ?? "");
    setCountry(clinic ? COUNTRY_LABELS[toCountryCode(clinic.countryCode)] : "México");
    setCity(clinic?.city ?? "");
    setPlan(clinic ? PLAN_LABELS[clinic.plan] : "Básico");
    setLastClinicId(clinic?.id);
  }

  if (!clinic) return null;

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await updateAdminClinic(clinic.id, {
        name: name.trim(),
        countryCode: Object.entries(COUNTRY_LABELS).find(([, label]) => label === country)?.[0] as CountryCode,
        address: city.trim(),
        plan: Object.entries(PLAN_LABELS).find(([, label]) => label === plan)?.[0] as Clinic["plan"],
      });
      onUpdated(updated);
      onClose();
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos actualizar la clínica.");
    } finally {
      setIsLoading(false);
    }
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
          <ModalField id="edit-name" label="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
          <ModalSelect
            id="edit-country"
            label="País"
            options={COUNTRY_LABELS_TO_OPTIONS}
            value={country}
            onChange={setCountry}
            required
          />
        </ModalGrid>

        <ModalField id="edit-city" label="Ciudad / Dirección" value={city} onChange={(e) => setCity(e.target.value)} required />
        <ModalSelect
          id="edit-plan"
          label="Plan"
          options={[
            { value: "Básico", label: "Básico" },
            { value: "Profesional", label: "Profesional" },
            { value: "Enterprise", label: "Enterprise" },
          ]}
          value={plan}
          onChange={setPlan}
          required
        />
        {error ? <p className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-xs font-semibold text-danger" role="alert">{error}</p> : null}
      </div>
    </Modal>
  );
}

export function SuspendClinicDialog({
  isOpen,
  onClose,
  onConfirm,
  clinicName,
  nextStatus,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  clinicName: string;
  nextStatus: Clinic["status"];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos cambiar el estado de la clínica.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfirmDialog
      confirmLabel={nextStatus === "suspended" ? "Suspender clínica" : "Reactivar clínica"}
      confirmTone={nextStatus === "suspended" ? "danger" : "accent"}
      description={error ?? (nextStatus === "suspended" ? `¿Estás seguro de suspender "${clinicName}"? Los usuarios no podrán acceder hasta que sea reactivada.` : `¿Deseas reactivar "${clinicName}"? El tenant volverá a estar disponible para sus usuarios con acceso vigente.`)}
      isLoading={isLoading}
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={nextStatus === "suspended" ? "Suspender clínica" : "Reactivar clínica"}
    />
  );
}

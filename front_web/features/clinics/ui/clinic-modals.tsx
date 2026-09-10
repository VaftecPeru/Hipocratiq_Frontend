"use client";

import { Building2 } from "lucide-react";
import { useState, type FormEvent } from "react";
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
import { formatBillingAmount } from "@/features/platform/lib/billing-currency";

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

type ClinicFormField = "name" | "taxId" | "contactPhone" | "address" | "city";
type ClinicFormErrors = Partial<Record<ClinicFormField, string>>;

const NAME_MAX_LENGTH = 120;
const TAX_ID_MAX_LENGTH = 50;
const PHONE_MAX_LENGTH = 30;
const ADDRESS_MAX_LENGTH = 255;
const PHONE_PATTERN = "[0-9()+\\-\\s]{7,30}";

function validateClinicFields(fields: Record<ClinicFormField, string>, includeTaxId: boolean): ClinicFormErrors {
  const errors: ClinicFormErrors = {};
  const name = fields.name.trim();
  const address = (fields.address || fields.city).trim();

  if (name.length < 2) errors.name = "Ingresa al menos 2 caracteres.";
  else if (name.length > NAME_MAX_LENGTH) errors.name = `Usa como máximo ${NAME_MAX_LENGTH} caracteres.`;

  if (includeTaxId && !fields.taxId.trim()) errors.taxId = "Ingresa la identificación fiscal.";
  else if (includeTaxId && fields.taxId.trim().length > TAX_ID_MAX_LENGTH) errors.taxId = `Usa como máximo ${TAX_ID_MAX_LENGTH} caracteres.`;

  if (includeTaxId && !fields.contactPhone.trim()) errors.contactPhone = "Ingresa un teléfono de contacto.";
  else if (includeTaxId && !new RegExp(`^${PHONE_PATTERN}$`).test(fields.contactPhone.trim())) errors.contactPhone = "Usa entre 7 y 30 caracteres numéricos válidos.";

  if (!address) errors[fields.address ? "address" : "city"] = "Ingresa una ciudad o dirección.";
  else if (address.length < 2) errors[fields.address ? "address" : "city"] = "Ingresa al menos 2 caracteres.";
  else if (address.length > ADDRESS_MAX_LENGTH) errors[fields.address ? "address" : "city"] = `Usa como máximo ${ADDRESS_MAX_LENGTH} caracteres.`;

  return errors;
}

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
  const [fieldErrors, setFieldErrors] = useState<ClinicFormErrors>({});

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    const nextFieldErrors = validateClinicFields({ name, taxId, contactPhone, address, city: "" }, true);
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setError("Revisa los campos marcados antes de crear la clínica.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFieldErrors({});

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => undefined : onClose}
      size="lg"
      title="Nueva clínica"
      description="Crea el tenant y su suscripción inicial"
      formId="create-clinic-form"
      onSubmit={handleCreate}
      footer={<><ModalSecondaryButton disabled={isLoading} onClick={onClose}>Cancelar</ModalSecondaryButton><ModalPrimaryButton form="create-clinic-form" type="submit" disabled={isLoading}>{isLoading ? "Creando..." : "Crear clínica"}</ModalPrimaryButton></>}
    >
      <div className="space-y-4">
        <ModalGrid cols={2}>
          <ModalField id="create-clinic-name" label="Nombre de la clínica" value={name} onChange={(event) => setName(event.target.value)} required autoFocus minLength={2} maxLength={NAME_MAX_LENGTH} error={fieldErrors.name} autoComplete="organization" />
          <ModalField id="create-clinic-tax" label="Identificación fiscal" value={taxId} onChange={(event) => setTaxId(event.target.value)} required maxLength={TAX_ID_MAX_LENGTH} error={fieldErrors.taxId} />
        </ModalGrid>
        <ModalGrid cols={2}>
          <ModalSelect id="create-clinic-country" label="País" options={Object.entries(COUNTRY_LABELS).map(([value, label]) => ({ value, label }))} value={countryCode} onChange={(value) => setCountryCode(value as CountryCode)} required />
          <ModalField id="create-clinic-phone" label="Teléfono de contacto" placeholder={countryCode === "PE" ? "987 654 321" : "55 1234 5678"} value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} required maxLength={PHONE_MAX_LENGTH} pattern={PHONE_PATTERN} inputMode="tel" error={fieldErrors.contactPhone} autoComplete="tel" />
        </ModalGrid>
        <ModalField id="create-clinic-address" label="Ciudad / Dirección" value={address} onChange={(event) => setAddress(event.target.value)} required minLength={2} maxLength={ADDRESS_MAX_LENGTH} error={fieldErrors.address} autoComplete="street-address" />
        <ModalGrid cols={2}>
          <ModalSelect id="create-clinic-plan" label="Plan inicial" options={[{ value: "basic", label: "Básico" }, { value: "professional", label: "Profesional" }, { value: "enterprise", label: "Enterprise" }]} value={plan} onChange={(value) => setPlan(value as Clinic["plan"])} required />
          <ModalSelect id="create-clinic-cycle" label="Ciclo de facturación" options={[{ value: "monthly", label: "Mensual" }, { value: "annual", label: "Anual" }]} value={billingCycle} onChange={(value) => setBillingCycle(value as "monthly" | "annual")} required />
        </ModalGrid>
        <p className="rounded-lg border border-accent/20 bg-accent-soft p-3 text-2xs leading-5 text-accent">La clínica se creará activa y sin usuarios. Después podrás asignar su administrador desde Roles y permisos.</p>
        {error ? <p className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-xs font-semibold text-danger" role="alert" aria-live="assertive">{error}</p> : null}
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
            {formatBillingAmount(Math.round(clinic.monthlyBilling * 100), clinic.monthlyBillingCurrency)}
          </ModalDetailRow>
          <ModalDetailRow label="Último pago">{clinic.lastPayment ?? "—"}</ModalDetailRow>
        </dl>

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
  const [fieldErrors, setFieldErrors] = useState<ClinicFormErrors>({});

  if (!clinic) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    const nextFieldErrors = validateClinicFields({ name, taxId: "", contactPhone: "", address: "", city }, false);
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setError("Revisa los campos marcados antes de guardar.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFieldErrors({});
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
      onClose={isLoading ? () => undefined : onClose}
      size="lg"
      title="Editar Clínica"
      description={clinic.name}
      formId="edit-clinic-form"
      onSubmit={handleSubmit}
      footer={
        <>
          <ModalSecondaryButton disabled={isLoading} onClick={onClose}>Cancelar</ModalSecondaryButton>
          <ModalPrimaryButton form="edit-clinic-form" type="submit" disabled={isLoading}>{isLoading ? "Guardando..." : "Guardar Cambios"}</ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <ModalGrid cols={2}>
          <ModalField id="edit-name" label="Nombre" value={name} onChange={(e) => setName(e.target.value)} required autoFocus minLength={2} maxLength={NAME_MAX_LENGTH} error={fieldErrors.name} autoComplete="organization" />
          <ModalSelect
            id="edit-country"
            label="País"
            options={COUNTRY_LABELS_TO_OPTIONS}
            value={country}
            onChange={setCountry}
            required
          />
        </ModalGrid>

        <ModalField id="edit-city" label="Ciudad / Dirección" value={city} onChange={(e) => setCity(e.target.value)} required minLength={2} maxLength={ADDRESS_MAX_LENGTH} error={fieldErrors.city} autoComplete="street-address" />
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
        {error ? <p className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-xs font-semibold text-danger" role="alert" aria-live="assertive">{error}</p> : null}
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

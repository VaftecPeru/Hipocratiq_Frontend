"use client";

import { useState } from "react";
import { CreditCard, TrendingUp } from "lucide-react";
import { Modal } from "@/shared/ui/modal";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import {
  ModalField,
  ModalGrid,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalSelect,
  type ModalSelectOption,
  ModalTextarea,
} from "@/shared/ui/modal-parts";
import type {
  CreatePlanPayload,
  CreateSubscriptionPayload,
  MembershipPlan,
  UpdatePlanPayload,
  UpgradeSubscriptionPayload,
} from "@/features/memberships/model/memberships.types";
import type { MembershipClinic } from "@/features/memberships/api/browser-memberships";
import {
  cancelMembershipSubscription,
  createMembershipPlan,
  createMembershipSubscription,
  updateMembershipPlan,
  upgradeMembershipSubscription,
} from "@/features/memberships/api/browser-memberships";

function ErrorNote({ error }: { error: string | null }) {
  if (!error) return null;

  return (
    <p className="rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-2xs leading-5 text-danger" role="alert">
      {error}
    </p>
  );
}

function parseMoney(value: string, fieldName: string): number {
  const normalized = value.trim().replace("$", "").replace(",", ".");
  const number = Number(normalized);

  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`El campo "${fieldName}" debe ser un monto válido.`);
  }

  return number;
}

function textToFeatures(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function featuresToText(features: string[]): string {
  return features.join("\n");
}

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}/mes`;
}

function planOptions(plans: MembershipPlan[]): ModalSelectOption[] {
  return plans.map((plan) => ({
    value: String(plan.id),
    label: `${plan.name} — ${formatUsd(plan.monthlyPriceUsdCents)}`,
  }));
}

function NewPlanForm({ onSubmitted, onClose }: { onSubmitted: () => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [annualPrice, setAnnualPrice] = useState("");
  const [features, setFeatures] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);

    if (!name.trim() || !key.trim()) {
      setError("Completa el nombre y el identificador del plan.");
      return;
    }

    let monthlyPriceUsd: number;
    let annualPriceUsd: number;

    try {
      monthlyPriceUsd = parseMoney(monthlyPrice, "Precio mensual");
      annualPriceUsd = parseMoney(annualPrice, "Precio anual");
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : "Revisa los montos del plan.");
      return;
    }

    const payload: CreatePlanPayload = {
      key: key.trim(),
      name: name.trim(),
      description: description.trim() || null,
      monthlyPriceUsd,
      annualPriceUsd,
      features: textToFeatures(features),
      publiclySelectable: true,
      isActive: true,
    };

    if (payload.features.length === 0) {
      setError("Agrega al menos una característica al plan.");
      return;
    }

    setIsLoading(true);

    try {
      await createMembershipPlan(payload);
      onSubmitted();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos crear el plan.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <ErrorNote error={error} />
      <ModalGrid cols={2}>
        <ModalField
          id="plan-name"
          label="Nombre del Plan"
          placeholder="Ej: Profesional"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <ModalField
          id="plan-key"
          label="Identificador"
          placeholder="profesional"
          hint="Solo minúsculas, números y guiones."
          required
          value={key}
          onChange={(event) => setKey(event.target.value.toLowerCase())}
        />
      </ModalGrid>
      <ModalTextarea
        id="plan-description"
        label="Descripción"
        placeholder="Describe las características principales de este plan..."
        rows={2}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <ModalGrid cols={2}>
        <ModalField
          id="plan-price-monthly"
          label="Precio Mensual (USD)"
          placeholder="149"
          type="number"
          min={0}
          step={0.01}
          required
          value={monthlyPrice}
          onChange={(event) => setMonthlyPrice(event.target.value)}
        />
        <ModalField
          id="plan-price-annual"
          label="Precio Anual (USD)"
          placeholder="1490"
          type="number"
          min={0}
          step={0.01}
          required
          value={annualPrice}
          onChange={(event) => setAnnualPrice(event.target.value)}
        />
      </ModalGrid>
      <ModalTextarea
        id="plan-features"
        label="Características (una por línea)"
        placeholder={"Historia clínica digital\nReportes avanzados\nSoporte prioritario"}
        rows={5}
        required
        value={features}
        onChange={(event) => setFeatures(event.target.value)}
      />
      <p className="text-2xs leading-5 text-muted">
        El plan quedará activo y disponible para asignarse a clínicas inmediatamente.
      </p>
      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton>
        <ModalPrimaryButton onClick={handleCreate}>{isLoading ? "Creando..." : "Crear Plan"}</ModalPrimaryButton>
      </div>
    </div>
  );
}

export function NewPlanModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Nuevo Plan de Membresía"
      description="Crear un plan de suscripción para las clínicas"
    >
      <NewPlanForm
        onSubmitted={() => {
          onCreated();
          onClose();
        }}
        onClose={onClose}
      />
    </Modal>
  );
}

function EditPlanForm({ plan, onSubmitted, onClose }: { plan: MembershipPlan; onSubmitted: () => void; onClose: () => void }) {
  const [name, setName] = useState(plan.name);
  const [key, setKey] = useState(plan.key);
  const [description, setDescription] = useState(plan.description ?? "");
  const [monthlyPrice, setMonthlyPrice] = useState(plan.monthlyPriceUsdCents / 100);
  const [annualPrice, setAnnualPrice] = useState(plan.annualPriceUsdCents / 100);
  const [features, setFeatures] = useState(featuresToText(plan.features));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);

    let monthlyPriceUsd: number;
    let annualPriceUsd: number;

    try {
      monthlyPriceUsd = parseMoney(String(monthlyPrice), "Precio mensual");
      annualPriceUsd = parseMoney(String(annualPrice), "Precio anual");
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : "Revisa los montos del plan.");
      return;
    }

    const payload: UpdatePlanPayload = {
      key: key.trim(),
      name: name.trim(),
      description: description.trim() || null,
      monthlyPriceUsd,
      annualPriceUsd,
      features: textToFeatures(features),
    };

    if (!payload.key || !payload.name) {
      setError("Completa el nombre y el identificador del plan.");
      return;
    }

    if ((payload.features?.length ?? 0) === 0) {
      setError("Agrega al menos una característica al plan.");
      return;
    }

    setIsLoading(true);

    try {
      await updateMembershipPlan(plan.id, payload);
      onSubmitted();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos guardar el plan.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <ErrorNote error={error} />
      <ModalGrid cols={2}>
        <ModalField id="edit-name" label="Nombre del Plan" required value={name} onChange={(event) => setName(event.target.value)} />
        <ModalField id="edit-key" label="Identificador" required value={key} onChange={(event) => setKey(event.target.value.toLowerCase())} />
      </ModalGrid>
      <ModalTextarea
        id="edit-description"
        label="Descripción"
        rows={3}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <ModalGrid cols={2}>
        <ModalField
          id="edit-price-monthly"
          label="Precio Mensual (USD)"
          type="number"
          min={0}
          step={0.01}
          required
          value={String(monthlyPrice)}
          onChange={(event) => setMonthlyPrice(Number(event.target.value))}
        />
        <ModalField
          id="edit-price-annual"
          label="Precio Anual (USD)"
          type="number"
          min={0}
          step={0.01}
          required
          value={String(annualPrice)}
          onChange={(event) => setAnnualPrice(Number(event.target.value))}
        />
      </ModalGrid>
      <ModalTextarea
        id="edit-features"
        label="Características (una por línea)"
        rows={5}
        required
        value={features}
        onChange={(event) => setFeatures(event.target.value)}
      />
      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton>
        <ModalPrimaryButton onClick={handleSave}>{isLoading ? "Guardando..." : "Guardar Cambios"}</ModalPrimaryButton>
      </div>
    </div>
  );
}

export function EditPlanModal({
  isOpen,
  onClose,
  plan,
  onUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  plan: MembershipPlan | null;
  onUpdated: () => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Editar Plan"
      description={plan?.name ?? ""}
    >
      {plan ? (
        <EditPlanForm
          plan={plan}
          onSubmitted={() => {
            onUpdated();
            onClose();
          }}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
}

function NewSubscriptionForm({
  clinics,
  plans,
  onSubmitted,
  onClose,
}: {
  clinics: MembershipClinic[];
  plans: MembershipPlan[];
  onSubmitted: () => void;
  onClose: () => void;
}) {
  const [clinicId, setClinicId] = useState("");
  const [planId, setPlanId] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [startsAt, setStartsAt] = useState(new Date().toISOString().split("T")[0]);
  const [autoRenew, setAutoRenew] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clinicOptions: ModalSelectOption[] = clinics.map((clinic) => ({
    value: String(clinic.id),
    label: `${clinic.name} (${clinic.countryCode})`,
  }));

  const handleCreate = async () => {
    setError(null);

    if (!clinicId || !planId || !startsAt) {
      setError("Completa la clínica, el plan y la fecha de inicio.");
      return;
    }

    const payload: CreateSubscriptionPayload = {
      clinicId: Number(clinicId),
      planId: Number(planId),
      billingCycle: billingCycle as CreateSubscriptionPayload["billingCycle"],
      startsAt,
      autoRenew,
    };

    setIsLoading(true);

    try {
      await createMembershipSubscription(payload);
      onSubmitted();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos crear la suscripción.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <ErrorNote error={error} />
      <ModalSelect
        id="sub-clinic"
        label="Clínica"
        options={clinicOptions}
        required
        value={clinicId}
        onChange={setClinicId}
      />
      <ModalSelect
        id="sub-plan"
        label="Plan"
        options={planOptions(plans)}
        required
        value={planId}
        onChange={setPlanId}
      />
      <ModalSelect
        id="sub-billing"
        label="Ciclo de Facturación"
        options={[
          { value: "monthly", label: "Mensual" },
          { value: "annual", label: "Anual" },
        ]}
        required
        value={billingCycle}
        onChange={setBillingCycle}
      />
      <ModalField
        id="sub-start"
        label="Fecha de Inicio"
        type="date"
        required
        value={startsAt}
        onChange={(event) => setStartsAt(event.target.value)}
      />
      <label className="flex items-center gap-2 text-xs text-ink">
        <input className="size-4 accent-accent" type="checkbox" checked={autoRenew} onChange={(event) => setAutoRenew(event.target.checked)} />
        Renovación automática al finalizar el periodo
      </label>
      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton>
        <ModalPrimaryButton onClick={handleCreate}>
          <CreditCard className="size-3.5" strokeWidth={1.9} />
          {isLoading ? "Creando..." : "Crear Suscripción"}
        </ModalPrimaryButton>
      </div>
    </div>
  );
}

export function NewSubscriptionModal({
  isOpen,
  onClose,
  clinics,
  plans,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  clinics: MembershipClinic[];
  plans: MembershipPlan[];
  onCreated: () => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Nueva Suscripción"
      description="Asignar un plan a una clínica"
    >
      <NewSubscriptionForm
        clinics={clinics}
        plans={plans}
        onSubmitted={() => {
          onCreated();
          onClose();
        }}
        onClose={onClose}
      />
    </Modal>
  );
}

function UpgradeSubscriptionForm({
  subscriptionId,
  currentPlan,
  plans,
  onSubmitted,
  onClose,
}: {
  subscriptionId: number;
  currentPlan: string;
  plans: MembershipPlan[];
  onSubmitted: () => void;
  onClose: () => void;
}) {
  const [planId, setPlanId] = useState("");
  const [upgradeAt, setUpgradeAt] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setError(null);

    if (!planId) {
      setError("Selecciona el nuevo plan.");
      return;
    }

    const payload: UpgradeSubscriptionPayload = {
      planId: Number(planId),
      upgradeAt,
    };

    setIsLoading(true);

    try {
      await upgradeMembershipSubscription(subscriptionId, payload);
      onSubmitted();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos cambiar el plan.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-line bg-surface-subtle p-3">
        <p className="text-2xs font-bold text-muted">Plan Actual</p>
        <p className="mt-1 text-sm font-extrabold text-ink">{currentPlan}</p>
      </div>
      <ErrorNote error={error} />
      <ModalSelect
        id="upgrade-plan"
        label="Nuevo Plan"
        options={planOptions(plans)}
        required
        value={planId}
        onChange={setPlanId}
      />
      <ModalField
        id="upgrade-date"
        label="Fecha de Aplicación"
        type="date"
        required
        value={upgradeAt}
        onChange={(event) => setUpgradeAt(event.target.value)}
      />
      <p className="text-2xs leading-5 text-muted">
        El cambio se aplicará en la fecha indicada. Los días restantes del plan actual se prorratearán.
      </p>
      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton>
        <ModalPrimaryButton onClick={handleUpgrade}>
          <TrendingUp className="size-3.5" strokeWidth={1.9} />
          {isLoading ? "Procesando..." : "Cambiar Plan"}
        </ModalPrimaryButton>
      </div>
    </div>
  );
}

export function UpgradeSubscriptionModal({
  isOpen,
  onClose,
  subscriptionId,
  currentPlan,
  plans,
  onUpgraded,
}: {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId: number;
  currentPlan: string;
  plans: MembershipPlan[];
  onUpgraded: () => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Cambiar Plan"
      description="Aplicar un nuevo plan a la suscripción"
    >
      <UpgradeSubscriptionForm
        subscriptionId={subscriptionId}
        currentPlan={currentPlan}
        plans={plans}
        onSubmitted={() => {
          onUpgraded();
          onClose();
        }}
        onClose={onClose}
      />
    </Modal>
  );
}

export function CancelSubscriptionDialog({
  isOpen,
  onClose,
  subscriptionId,
  clinicName,
  onCanceled,
}: {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId: number;
  clinicName: string;
  onCanceled: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await cancelMembershipSubscription(subscriptionId);
      onCanceled();
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos cancelar la suscripción.");
      setIsLoading(false);
    }
  };

  return (
    <ConfirmDialog
      confirmLabel="Cancelar Suscripción"
      confirmTone="danger"
      description={
        error ??
        `¿Estás seguro de cancelar la suscripción de "${clinicName}"? La clínica perderá acceso al finalizar el periodo actual.`
      }
      isLoading={isLoading}
      isOpen={isOpen}
      onClose={() => {
        if (isLoading) return;
        setError(null);
        onClose();
      }}
      onConfirm={handleCancel}
      title="Cancelar Suscripción"
    />
  );
}

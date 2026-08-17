"use client";

import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { updateUserAccess } from "@/features/access-control/api/browser-access-control";
import type { AccessControlData } from "@/features/access-control/model/access-control.types";
import type { AdminAssignableRole, AdminUser } from "@/features/users/model/admin-user.types";
import { CountryFlag } from "@/shared/ui/country-flag";
import { FilterSelect } from "@/shared/ui/filter-select";
import { Modal } from "@/shared/ui/modal";
import { ModalPrimaryButton, ModalSecondaryButton } from "@/shared/ui/modal-parts";

export function ManageUserAccessModal({
  access,
  isOpen,
  onClose,
  onUpdated,
  user,
}: {
  access: AccessControlData;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  user: AdminUser | null;
}) {
  const firstRole = user?.role !== "unassigned" && user?.assignableRoles.includes(user.role)
    ? user.role
    : user?.assignableRoles[0] ?? "clinic_admin";
  const activeClinics = useMemo(
    () => access.clinics.filter((clinic) => clinic.status === "active"),
    [access.clinics],
  );
  const [role, setRole] = useState<AdminAssignableRole>(firstRole);
  const [clinicId, setClinicId] = useState<number | undefined>(user?.clinic?.id ?? activeClinics[0]?.id);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;
  const activeUser = user;

  const isSelf = activeUser.id === access.actorUserId;
  const assignableRoles = new Set(activeUser.assignableRoles);
  const roleOptions = access.roles.flatMap((definition) => assignableRoles.has(definition.key) ? [{
    value: definition.key,
    label: definition.name,
    detail: definition.scope === "global" ? "Todos los países y tenants" : "Limitado a una clínica",
  }] : []);
  const clinicOptions = activeClinics.map((clinic) => ({
    value: clinic.id,
    label: clinic.name,
    detail: `${clinic.countryCode} · Clínica activa`,
  }));
  const canSave = !isSelf && !isSaving && (role === "super_admin" || clinicId !== undefined);

  async function handleSave() {
    if (!canSave) return;
    setIsSaving(true);
    setError(null);

    try {
      await updateUserAccess(activeUser.id, {
        role,
        clinicId: role === "super_admin" ? null : clinicId ?? null,
      });
      onUpdated();
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos actualizar el acceso.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Gestionar acceso"
      description={`${user.name} · ${user.email ?? "Sin correo"}`}
      footer={
        <>
          <ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton>
          <ModalPrimaryButton disabled={!canSave} onClick={handleSave}>
            <ShieldCheck className="size-3.5" strokeWidth={1.9} aria-hidden="true" />
            {isSaving ? "Aplicando..." : "Aplicar acceso"}
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-subtle p-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-extrabold text-accent" aria-hidden="true">
            {user.name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-extrabold text-ink">{user.name}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-2xs text-muted">
              <CountryFlag countryCode={user.countryCode} />
              Acceso actual: {user.role.replaceAll("_", " ")}{user.clinic ? ` · ${user.clinic.name}` : ""}
            </p>
          </div>
        </div>

        <FilterSelect
          label="Rol del usuario"
          options={roleOptions}
          value={role}
          onChange={(nextRole) => {
            setRole(nextRole);
            if (nextRole === "super_admin") setClinicId(undefined);
            else setClinicId((current) => current ?? activeClinics[0]?.id);
          }}
          density="form"
          surface="input"
          required
        />

        {role !== "super_admin" ? (
          <FilterSelect
            label="Clínica / Tenant"
            options={clinicOptions}
            value={clinicId}
            onChange={setClinicId}
            placeholder="Seleccionar clínica"
            hint="El acceso quedará limitado a esta clínica. Las demás membresías se suspenderán."
            density="form"
            surface="input"
            required
          />
        ) : (
          <div className="rounded-lg border border-accent/25 bg-accent-soft p-3 text-2xs leading-5 text-accent">
            Este rol tiene acceso global a todos los países, clínicas y módulos de supervisión.
          </div>
        )}

        {isSelf ? (
          <p className="flex gap-2 rounded-lg border border-warning/30 bg-warning-soft p-3 text-2xs font-semibold leading-5 text-warning" role="alert">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            No puedes modificar tu propio acceso durante una sesión activa. Otro Superadministrador debe realizar el cambio.
          </p>
        ) : null}
        {error ? <p className="rounded-lg border border-danger/25 bg-danger-soft p-3 text-2xs font-semibold text-danger" role="alert">{error}</p> : null}
        <p className="text-2xs leading-5 text-muted">Por seguridad, cualquier cambio real cerrará las sesiones y tokens activos del usuario y quedará registrado como evento crítico.</p>
      </div>
    </Modal>
  );
}

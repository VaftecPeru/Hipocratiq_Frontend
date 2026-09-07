"use client";

import { Send, Shield, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createAdminUser, sendAdminUserMessage, updateAdminUser } from "@/features/users/api/browser-users";
import type { AdminUser, AdminUserRoleLabel, AdminUsersDashboardData, AdminUserStatus } from "@/features/users/model/admin-user.types";
import { CountryFlag, type CountryCode } from "@/shared/ui/country-flag";
import { Modal } from "@/shared/ui/modal";
import {
  ModalDetailRow,
  ModalField,
  ModalGrid,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalSelect,
  ModalTextarea,
} from "@/shared/ui/modal-parts";

type UserFormData = {
  id: number;
  name: string;
  email: string;
  role: AdminUserRoleLabel;
  country: CountryCode;
  city: string;
  clinic: string | null;
  phone: string;
  status: AdminUserStatus;
};

type UserDetailData = UserFormData & {
  lastAccess: string;
  createdAt: string;
};

const STATUS_LABELS: Record<AdminUserStatus, string> = {
  active: "Activo",
  pending_verification: "Pendiente",
  suspended: "Suspendido",
  disabled: "Deshabilitado",
};

export function CreateUserModal({
  clinics,
  isOpen,
  onClose,
  onCreated,
}: {
  clinics: AdminUsersDashboardData["clinics"];
  isOpen: boolean;
  onClose: () => void;
  onCreated: (user: AdminUser) => void;
}) {
  const activeClinics = clinics.filter((clinic) => clinic.status === "active");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState<CountryCode>("MX");
  const [role, setRole] = useState<"super_admin" | "clinic_admin" | "receptionist">("clinic_admin");
  const [clinicId, setClinicId] = useState<number | undefined>(activeClinics[0]?.id);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate() {
    if (isLoading || !name.trim() || !phone.trim() || (role !== "super_admin" && clinicId === undefined)) return;
    setIsLoading(true);
    setError(null);

    try {
      const user = await createAdminUser({
        name: name.trim(),
        email: email.trim() || null,
        phoneNumber: phone.trim(),
        countryCode,
        role,
        clinicId: role === "super_admin" ? null : clinicId ?? null,
      });
      onCreated(user);
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos crear el usuario.");
    } finally {
      setIsLoading(false);
    }
  }

  const canCreate = Boolean(name.trim() && phone.trim()) && (role === "super_admin" || clinicId !== undefined) && !isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Nuevo usuario administrativo"
      description="Crea un acceso global o limitado a una clínica"
      footer={<><ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton><ModalPrimaryButton disabled={!canCreate} onClick={handleCreate}><UserPlus className="size-3.5" aria-hidden="true" />{isLoading ? "Creando..." : "Crear usuario"}</ModalPrimaryButton></>}
    >
      <div className="space-y-4">
        <ModalGrid cols={2}>
          <ModalField id="create-user-name" label="Nombre completo" value={name} onChange={(event) => setName(event.target.value)} required />
          <ModalField id="create-user-email" label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </ModalGrid>
        <ModalGrid cols={2}>
          <ModalSelect id="create-user-country" label="País del teléfono" options={[{ value: "MX", label: "México" }, { value: "PE", label: "Perú" }, { value: "US", label: "Estados Unidos" }]} value={countryCode} onChange={(value) => setCountryCode(value as CountryCode)} required />
          <ModalField id="create-user-phone" label="Teléfono" placeholder={countryCode === "PE" ? "987 654 321" : "55 1234 5678"} value={phone} onChange={(event) => setPhone(event.target.value)} required />
        </ModalGrid>
        <ModalSelect id="create-user-role" label="Rol inicial" options={[{ value: "clinic_admin", label: "Administrador de clínica" }, { value: "receptionist", label: "Recepcionista" }, { value: "super_admin", label: "Superadministrador" }]} value={role} onChange={(value) => setRole(value as "super_admin" | "clinic_admin" | "receptionist")} required />
        {role !== "super_admin" ? (
          <ModalSelect id="create-user-clinic" label="Clínica / Tenant" options={activeClinics.map((clinic) => ({ value: String(clinic.id), label: `${clinic.name} · ${clinic.countryCode}` }))} value={clinicId === undefined ? undefined : String(clinicId)} onChange={(value) => {
            const selectedId = Number(value);
            setClinicId(selectedId);
            const selectedClinic = activeClinics.find((clinic) => clinic.id === selectedId);
            if (selectedClinic) setCountryCode(selectedClinic.countryCode);
          }} required />
        ) : (
          <p className="rounded-lg border border-warning/25 bg-warning-soft p-3 text-2xs leading-5 text-warning">El Superadministrador tendrá acceso a todos los países y tenants. Asigna este rol sólo a personal de confianza.</p>
        )}
        <p className="rounded-lg border border-accent/20 bg-accent-soft p-3 text-2xs leading-5 text-accent">El usuario quedará activo, pero deberá establecer su propia contraseña mediante “Recuperar contraseña” usando el teléfono registrado.</p>
        {error ? <p className="rounded-lg border border-danger/25 bg-danger-soft p-3 text-xs font-semibold text-danger" role="alert">{error}</p> : null}
      </div>
    </Modal>
  );
}

export function UserDetailModal({
  isOpen,
  onClose,
  onMessage,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  onMessage: () => void;
  user: UserDetailData | null;
}) {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title={user.name} description="Información del usuario">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-accent-soft text-sm font-extrabold text-accent">
            {user.name.split(" ").slice(0, 2).map((name) => name[0]).join("").toUpperCase()}
          </span>
          <div className="flex-1">
            <p className="text-sm font-extrabold text-ink">{user.email}</p>
            <p className="mt-0.5 flex items-center gap-2 text-2xs text-muted">
              <CountryFlag countryCode={user.country} />
              {user.city}
            </p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-2xs font-extrabold ${user.status === "active" ? "bg-success-soft text-success" : user.status === "pending_verification" ? "bg-warning-soft text-warning" : "bg-danger-soft text-danger"}`}>
            {STATUS_LABELS[user.status]}
          </span>
        </div>

        <dl className="divide-y divide-line rounded-lg border border-line">
          <ModalDetailRow label="Rol"><span className="rounded bg-accent-soft px-2 py-0.5 text-2xs font-extrabold text-accent">{user.role}</span></ModalDetailRow>
          <ModalDetailRow label="Teléfono">{user.phone}</ModalDetailRow>
          {user.clinic ? <ModalDetailRow label="Clínica">{user.clinic}</ModalDetailRow> : null}
          <ModalDetailRow label="Último acceso">{user.lastAccess}</ModalDetailRow>
          <ModalDetailRow label="Fecha de registro">{user.createdAt}</ModalDetailRow>
        </dl>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-xs font-bold text-ink transition-colors hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus sm:min-h-9" type="button" onClick={onMessage}>
            <Send className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
            Enviar mensaje
          </button>
          <Link className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-xs font-bold text-ink transition-colors hover:border-accent/40 hover:bg-accent-soft hover:text-accent focus-visible:outline-3 focus-visible:outline-focus sm:min-h-9" href={`/roles-permissions?search=${encodeURIComponent(user.email === "Sin correo" ? user.name : user.email)}`}>
            <Shield className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
            Permisos
          </Link>
        </div>
      </div>
    </Modal>
  );
}

export function EditUserModal({
  isOpen,
  onClose,
  onUpdated,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (user: AdminUser) => void;
  user: UserFormData | null;
}) {
  if (!user) return null;

  return <EditUserForm key={`${user.id}-${isOpen}`} isOpen={isOpen} onClose={onClose} onUpdated={onUpdated} user={user} />;
}

function EditUserForm({
  isOpen,
  onClose,
  onUpdated,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (user: AdminUser) => void;
  user: UserFormData;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [country, setCountry] = useState<CountryCode>(user.country);
  const [status, setStatus] = useState<AdminUserStatus>(user.status);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    if (isLoading || !name.trim() || !phone.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const updatedUser = await updateAdminUser(user.id, {
        name: name.trim(),
        email: email.trim() || null,
        phoneNumber: phone.trim(),
        countryCode: country,
        status,
      });
      onUpdated(updatedUser);
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos actualizar el usuario.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Editar usuario"
      description={user.name}
      footer={<><ModalSecondaryButton onClick={onClose} disabled={isLoading}>Cancelar</ModalSecondaryButton><ModalPrimaryButton disabled={isLoading || !name.trim() || !phone.trim()} onClick={handleSubmit}>{isLoading ? "Guardando..." : "Guardar cambios"}</ModalPrimaryButton></>}
    >
      <div className="space-y-4">
        <ModalGrid cols={2}>
          <ModalField id="edit-name" label="Nombre" value={name} onChange={(event) => setName(event.target.value)} required />
          <ModalField id="edit-email" label="Email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        </ModalGrid>
        <ModalGrid cols={2}>
          <ModalField id="edit-phone" label="Teléfono" value={phone} onChange={(event) => setPhone(event.target.value)} required />
          <ModalSelect id="edit-status" label="Estado" options={[{ value: "active", label: "Activo" }, { value: "pending_verification", label: "Pendiente de verificación" }, { value: "suspended", label: "Suspendido" }, { value: "disabled", label: "Deshabilitado" }]} value={status} onChange={(value) => setStatus(value as AdminUserStatus)} required />
        </ModalGrid>
        <ModalGrid cols={2}>
          <ModalSelect id="edit-country" label="País" options={[{ value: "MX", label: "México" }, { value: "PE", label: "Perú" }, { value: "US", label: "Estados Unidos" }]} value={country} onChange={(value) => setCountry(value as CountryCode)} required />
          <div className="rounded-lg border border-line bg-surface-subtle p-3 text-xs">
            <p className="text-2xs font-bold text-muted">Rol y tenant</p>
            <p className="mt-1 font-semibold text-ink">{user.role}{user.clinic ? ` · ${user.clinic}` : ""}</p>
            <Link className="mt-2 inline-flex items-center font-bold text-accent hover:underline" href={`/roles-permissions?search=${encodeURIComponent(user.email || user.name)}`}>Gestionar rol y acceso</Link>
          </div>
        </ModalGrid>
        {error ? <p className="rounded-lg border border-danger/25 bg-danger-soft p-3 text-xs text-danger" role="alert">{error}</p> : null}
      </div>
    </Modal>
  );
}

export function SendMessageModal({
  isOpen,
  onClose,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: { id: number; name: string } | null;
}) {
  if (!user) return null;

  return <SendMessageForm key={`${user.id}-${isOpen}`} isOpen={isOpen} onClose={onClose} user={user} />;
}

function SendMessageForm({ isOpen, onClose, user }: { isOpen: boolean; onClose: () => void; user: { id: number; name: string } }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sendCopy, setSendCopy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend() {
    if (isLoading || !subject.trim() || !body.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      await sendAdminUserMessage(user.id, { subject: subject.trim(), body: body.trim(), sendCopy });
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos enviar el mensaje.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Enviar mensaje"
      description={`Enviar un mensaje a ${user.name}`}
      footer={<><ModalSecondaryButton onClick={onClose} disabled={isLoading}>Cancelar</ModalSecondaryButton><ModalPrimaryButton disabled={isLoading || !subject.trim() || !body.trim()} onClick={handleSend}><Send className="size-3.5" strokeWidth={1.9} aria-hidden="true" />{isLoading ? "Enviando..." : "Enviar mensaje"}</ModalPrimaryButton></>}
    >
      <div className="space-y-4">
        <ModalField id="message-subject" label="Asunto" placeholder="Asunto del mensaje" value={subject} onChange={(event) => setSubject(event.target.value)} required />
        <ModalTextarea id="message-body" label="Mensaje" placeholder="Escribe tu mensaje aquí..." rows={6} value={body} onChange={(event) => setBody(event.target.value)} required />
        <div className="flex items-center gap-2 text-2xs text-muted">
          <input className="size-4 accent-accent" checked={sendCopy} id="send-copy" onChange={(event) => setSendCopy(event.target.checked)} type="checkbox" />
          <label className="cursor-pointer font-medium" htmlFor="send-copy">Enviarme una copia</label>
        </div>
        {error ? <p className="rounded-lg border border-danger/25 bg-danger-soft p-3 text-xs text-danger" role="alert">{error}</p> : null}
      </div>
    </Modal>
  );
}

"use client";

import { Mail, Shield } from "lucide-react";
import { useState } from "react";
import { CountryFlag, type CountryCode } from "@/shared/ui/country-flag";
import { Modal } from "@/shared/ui/modal";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import type { AdminUserRoleLabel, AdminUserStatus } from "@/features/users/model/admin-user.types";
import {
  ModalField,
  ModalGrid,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalSelect,
  ModalTextarea,
  ModalDetailRow,
} from "@/shared/ui/modal-parts";

type UserFormData = {
  name: string;
  email: string;
  role: AdminUserRoleLabel;
  country: CountryCode;
  city: string;
  clinic: string | null;
  phone: string;
};

type UserDetailData = UserFormData & {
  id: number;
  status: AdminUserStatus;
  lastAccess: string;
  createdAt: string;
};

export function UserDetailModal({
  isOpen,
  onClose,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: UserDetailData | null;
}) {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title={user.name} description="Información del usuario">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-accent-soft text-accent text-sm font-extrabold">
            {user.name
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </span>
          <div className="flex-1">
            <p className="text-sm font-extrabold text-ink">{user.email}</p>
            <p className="mt-0.5 flex items-center gap-2 text-2xs text-muted">
              <CountryFlag countryCode={user.country} />
              {user.city}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-2xs font-extrabold ${
              user.status === "active" ? "bg-success-soft text-success" : user.status === "pending_verification" ? "bg-warning-soft text-warning" : "bg-danger-soft text-danger"
            }`}
          >
            {{ active: "Activo", pending_verification: "Pendiente", suspended: "Suspendido", disabled: "Deshabilitado" }[user.status]}
          </span>
        </div>

        <dl className="divide-y divide-line rounded-lg border border-line">
          <ModalDetailRow label="Rol">
            <span className="rounded px-2 py-0.5 text-2xs font-extrabold bg-accent-soft text-accent">{user.role}</span>
          </ModalDetailRow>
          <ModalDetailRow label="Teléfono">{user.phone}</ModalDetailRow>
          {user.clinic ? <ModalDetailRow label="Clínica">{user.clinic}</ModalDetailRow> : null}
          <ModalDetailRow label="Último acceso">{user.lastAccess}</ModalDetailRow>
          <ModalDetailRow label="Fecha de registro">{user.createdAt}</ModalDetailRow>
        </dl>

        <div className="flex gap-2">
          <button
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-xs font-bold text-ink transition-colors hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus"
            type="button"
          >
            <Mail className="size-3.5" strokeWidth={1.8} />
            Enviar mensaje
          </button>
          <button
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-xs font-bold text-ink transition-colors hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus"
            type="button"
          >
            <Shield className="size-3.5" strokeWidth={1.8} />
            Permisos
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function EditUserModal({
  isOpen,
  onClose,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: UserFormData | null;
}) {
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

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
      title="Editar Usuario"
      description={user.name}
      footer={
        <>
          <ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton>
          <ModalPrimaryButton onClick={handleSubmit}>{isLoading ? "Guardando..." : "Guardar Cambios"}</ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <ModalGrid cols={2}>
          <ModalField id="edit-name" label="Nombre" defaultValue={user.name} required />
          <ModalField id="edit-email" label="Email" defaultValue={user.email} type="email" required />
        </ModalGrid>

        <ModalGrid cols={2}>
          <ModalField id="edit-phone" label="Teléfono" defaultValue={user.phone} />
          <ModalSelect
            id="edit-role"
            label="Rol"
            options={["Superadministrador", "Administrador de Clínica", "Médico", "Paciente", "Sin rol"]}
            defaultValue={user.role}
            required
          />
        </ModalGrid>

        <ModalGrid cols={2}>
          <ModalSelect
            id="edit-country"
            label="País"
            options={["México", "Perú", "USA"]}
            defaultValue={user.country === "MX" ? "México" : user.country === "PE" ? "Perú" : "USA"}
            required
          />
          <ModalField id="edit-city" label="Ciudad" defaultValue={user.city} required />
        </ModalGrid>

        {user.clinic ? (
          <ModalSelect
            id="edit-clinic"
            label="Clínica"
            options={["Clínica San José", "Clínica del Valle", "Clínica Bienestar", "Clínica San Pablo"]}
            defaultValue={user.clinic}
          />
        ) : null}
      </div>
    </Modal>
  );
}

export function SendMessageModal({ isOpen, onClose, userName }: { isOpen: boolean; onClose: () => void; userName: string }) {
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
      title="Enviar Mensaje"
      description={`Enviar un mensaje a ${userName}`}
      footer={
        <>
          <ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton>
          <ModalPrimaryButton onClick={handleSend}>
            <Mail className="size-3.5" strokeWidth={1.9} />
            {isLoading ? "Enviando..." : "Enviar Mensaje"}
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <ModalField id="message-subject" label="Asunto" placeholder="Asunto del mensaje" required />
        <ModalTextarea
          id="message-body"
          label="Mensaje"
          placeholder="Escribe tu mensaje aquí..."
          rows={6}
          required
        />
        <div className="flex items-center gap-2 text-2xs text-muted">
          <input className="size-4 accent-accent" defaultChecked id="send-copy" type="checkbox" />
          <label className="cursor-pointer font-medium" htmlFor="send-copy">
            Enviarme una copia
          </label>
        </div>
      </div>
    </Modal>
  );
}

export function ResetPasswordDialog({
  isOpen,
  onClose,
  userName,
}: {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    onClose();
  };

  return (
    <ConfirmDialog
      confirmLabel="Restablecer Contraseña"
      description={`Se enviará un correo a ${userName} con un enlace para establecer una nueva contraseña. ¿Continuar?`}
      isLoading={isLoading}
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Restablecer Contraseña"
    />
  );
}

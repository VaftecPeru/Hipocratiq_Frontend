"use client";

import {
  CircleCheck,
  Edit,
  Mail,
  Phone,
  Plus,
  Power,
  Search,
  ShieldCheck,
  Stethoscope,
  Trash2,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createClinicReceptionist,
  getClinicMembers,
  getClinicSettings,
  removeClinicMember,
  updateClinicMember,
  updateClinicMemberStatus,
} from "@/features/clinics/api/browser-clinic-dashboard";
import type { UpdateClinicMemberPayload } from "@/features/clinics/api/browser-clinic-dashboard";
import type { ClinicTeamMember } from "@/features/clinics/model/clinic-admin.types";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { CountryFlag, type CountryCode } from "@/shared/ui/country-flag";
import { DataBadge, type BadgeTone } from "@/shared/ui/data-badge";
import { Modal } from "@/shared/ui/modal";
import { CreateClinicDoctorModal } from "@/features/clinics/ui/create-clinic-doctor-modal";
import {
  ModalField,
  ModalGrid,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalSelect,
} from "@/shared/ui/modal-parts";

const ROLE_LABELS: Record<ClinicTeamMember["role"], string> = {
  clinic_admin: "Administrador de clínica",
  receptionist: "Recepcionista",
  doctor: "Médico",
};

const ROLE_TONES: Record<ClinicTeamMember["role"], BadgeTone> = {
  clinic_admin: "accent",
  receptionist: "warning",
  doctor: "success",
};

const STATUS_LABELS: Record<ClinicTeamMember["status"], string> = {
  pending_verification: "Pendiente",
  active: "Activo",
  suspended: "Suspendido",
  disabled: "Deshabilitado",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatLastAccess(value: string | null): string {
  if (!value) return "Nunca";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function CreateReceptionistModal({
  clinicCountryCode,
  isOpen,
  onClose,
  onCreated,
}: {
  clinicCountryCode: CountryCode;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (member: ClinicTeamMember) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState<CountryCode>(clinicCountryCode);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate() {
    if (isLoading || !name.trim() || !phoneNumber.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const member = await createClinicReceptionist({
        name: name.trim(),
        email: email.trim() || null,
        phoneNumber: phoneNumber.trim(),
        countryCode,
      });
      onCreated(member);
      onClose();
      setName("");
      setEmail("");
      setPhoneNumber("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos crear la recepcionista.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Nueva recepcionista"
      description="Crea un acceso limitado a esta clínica"
      footer={
        <>
          <ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton>
          <ModalPrimaryButton disabled={!name.trim() || !phoneNumber.trim() || isLoading} onClick={handleCreate}>
            <UserPlus className="size-3.5" aria-hidden="true" />
            {isLoading ? "Creando..." : "Crear acceso"}
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <ModalGrid cols={2}>
          <ModalField id="clinic-receptionist-name" label="Nombre completo" value={name} onChange={(event) => setName(event.target.value)} required />
          <ModalField id="clinic-receptionist-email" label="Correo electrónico" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </ModalGrid>
        <ModalGrid cols={2}>
          <ModalSelect
            id="clinic-receptionist-country"
            label="País del teléfono"
            options={[{ value: "MX", label: "México" }, { value: "PE", label: "Perú" }, { value: "US", label: "Estados Unidos" }]}
            value={countryCode}
            onChange={(value) => setCountryCode(value as CountryCode)}
            required
          />
          <ModalField id="clinic-receptionist-phone" label="Teléfono" placeholder={countryCode === "PE" ? "987 654 321" : "55 1234 5678"} value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} required />
        </ModalGrid>
        <div className="flex gap-2 rounded-lg border border-accent/20 bg-accent-soft p-3 text-2xs leading-5 text-accent">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>La cuenta quedará activa para esta clínica. La persona deberá establecer su contraseña desde “Recuperar contraseña”.</p>
        </div>
        {error ? <p className="rounded-lg border border-danger/25 bg-danger-soft p-3 text-xs font-semibold text-danger" role="alert">{error}</p> : null}
      </div>
    </Modal>
  );
}

function EditMemberModal({
  member,
  isOpen,
  onClose,
  onSaved,
}: {
  member: ClinicTeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updated: ClinicTeamMember) => void;
}) {
  const [name, setName] = useState(member?.name ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(member?.phoneNumber ?? "");
  const [countryCode, setCountryCode] = useState("MX");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!member || isLoading || !name.trim() || !phoneNumber.trim()) return;
    setIsLoading(true);
    setError(null);
    const payload: UpdateClinicMemberPayload = {
      name: name.trim(),
      email: email.trim() || null,
      phoneNumber: phoneNumber.trim(),
      countryCode,
    };
    try {
      const updated = await updateClinicMember(member.id, payload);
      onSaved(updated);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No pudimos actualizar el miembro.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Editar miembro"
      description={member ? `ID: ${member.id}` : undefined}
      footer={
        <>
          <ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton>
          <ModalPrimaryButton disabled={!name.trim() || !phoneNumber.trim() || isLoading} onClick={handleSave}>
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <ModalGrid cols={2}>
          <ModalField id="edit-member-name" label="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} required />
          <ModalField id="edit-member-email" label="Correo electrónico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </ModalGrid>
        <ModalGrid cols={2}>
          <ModalSelect
            id="edit-member-country"
            label="País del teléfono"
            options={[{ value: "MX", label: "México" }, { value: "PE", label: "Perú" }, { value: "US", label: "Estados Unidos" }]}
            value={countryCode}
            onChange={setCountryCode}
            required
          />
          <ModalField id="edit-member-phone" label="Teléfono" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
        </ModalGrid>
        {error ? <p className="rounded-lg border border-danger/25 bg-danger-soft p-3 text-xs font-semibold text-danger" role="alert">{error}</p> : null}
      </div>
    </Modal>
  );
}

export function ClinicTeam() {
  const [members, setMembers] = useState<ClinicTeamMember[]>([]);
  const [clinicCountryCode, setClinicCountryCode] = useState<CountryCode>("MX");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateDoctorOpen, setIsCreateDoctorOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Edit member modal
  const [editMember, setEditMember] = useState<ClinicTeamMember | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Suspend/activate confirm dialog
  const [suspendMember, setSuspendMember] = useState<ClinicTeamMember | null>(null);
  const [suspendLoading, setSuspendLoading] = useState(false);

  const [removeMember, setRemoveMember] = useState<ClinicTeamMember | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getClinicMembers(controller.signal), getClinicSettings(controller.signal)])
      .then(([nextMembers, clinic]) => {
        setMembers(nextMembers);
        setClinicCountryCode(clinic.countryCode);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoadError(error instanceof Error ? error.message : "No pudimos cargar el equipo de la clínica.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const filteredMembers = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");
    if (!normalized) return members;
    return members.filter((member) => `${member.name} ${member.email ?? ""} ${ROLE_LABELS[member.role]}`.toLocaleLowerCase("es").includes(normalized));
  }, [members, query]);
  const receptionists = members.filter((member) => member.role === "receptionist").length;
  const doctors = members.filter((member) => member.role === "doctor").length;
  const metrics: Array<{ icon: LucideIcon; label: string; value: number; helper: string; tone: string }> = [
    { icon: Users, label: "Personal activo", value: members.length, helper: "Membresías vigentes", tone: "bg-accent-soft text-accent" },
    { icon: ShieldCheck, label: "Recepcionistas", value: receptionists, helper: "Accesos de recepción", tone: "bg-warning-soft text-warning" },
    { icon: Users, label: "Médicos", value: doctors, helper: "Perfiles clínicos", tone: "bg-success-soft text-success" },
  ];

  function handleCreated(member: ClinicTeamMember) {
    setMembers((current) => [member, ...current]);
    setNotice("Recepcionista creada y vinculada a la clínica.");
    window.setTimeout(() => setNotice(null), 3000);
  }

  function handleDoctorCreated(member: ClinicTeamMember) {
    setMembers((current) => [member, ...current]);
    setNotice("Médico agregado a la clínica.");
    window.setTimeout(() => setNotice(null), 3000);
  }

  function handleMemberSaved(updated: ClinicTeamMember) {
    setMembers((current) => current.map((m) => m.id === updated.id ? updated : m));
    setNotice("Datos del miembro actualizados.");
    window.setTimeout(() => setNotice(null), 3000);
  }

  async function handleSuspendConfirm() {
    if (!suspendMember) return;
    const newStatus = suspendMember.status === "active" ? "suspended" : "active";
    setSuspendLoading(true);
    try {
      const updated = await updateClinicMemberStatus(suspendMember.id, newStatus);
      setMembers((current) => current.map((m) => m.id === updated.id ? updated : m));
      setNotice(`Miembro ${newStatus === "active" ? "activado" : "suspendido"} correctamente.`);
      window.setTimeout(() => setNotice(null), 3000);
      setSuspendMember(null);
    } catch (err: unknown) {
      setNotice(err instanceof Error ? err.message : "Error al cambiar estado.");
      window.setTimeout(() => setNotice(null), 3000);
    } finally {
      setSuspendLoading(false);
    }
  }

  async function handleRemoveConfirm() {
    if (!removeMember || removeLoading) return;
    setRemoveLoading(true);
    try {
      await removeClinicMember(removeMember.id);
      setMembers((current) => current.filter((member) => member.id !== removeMember.id));
      setNotice("Miembro eliminado correctamente.");
      setRemoveMember(null);
    } catch (err: unknown) {
      setNotice(err instanceof Error ? err.message : "No pudimos eliminar al miembro.");
    } finally {
      setRemoveLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7">
      {notice ? <div className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-xs font-bold text-white shadow-xl" role="status"><CircleCheck className="size-4 text-success" />{notice}</div> : null}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-accent uppercase">Directorio clínico</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Equipo</h1>
          <p className="mt-1 text-xs text-muted">Administra los accesos y el personal activo de tu clínica.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-xs font-extrabold shadow-sm transition-colors hover:bg-surface-hover focus-visible:outline-3 focus-visible:outline-focus" type="button" onClick={() => setIsCreateDoctorOpen(true)}>
            <Stethoscope className="size-3.5" aria-hidden="true" />
            Agregar médico
          </button>
          <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus" type="button" onClick={() => setIsCreateOpen(true)}>
            <Plus className="size-3.5" aria-hidden="true" />
            Nueva recepcionista
          </button>
        </div>
      </header>

      <section className="mt-4 grid gap-3 sm:grid-cols-3" aria-label="Resumen del equipo">
        {metrics.map(({ icon: Icon, label, value, helper, tone }) => <article className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.3rem_1rem_rgb(16_27_51/4%)]" key={label}><span className={`grid size-9 place-items-center rounded-lg ${tone}`}><Icon className="size-4" aria-hidden="true" /></span><p className="mt-3 text-2xs font-bold text-muted">{label}</p><div className="mt-1 flex items-end justify-between"><strong className="font-mono text-xl">{value}</strong><span className="text-[0.55rem] font-semibold text-muted">{helper}</span></div></article>)}
      </section>

      <section className="mt-4 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.3rem_1rem_rgb(16_27_51/4%)]" aria-labelledby="clinic-team-title">
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-xs font-extrabold" id="clinic-team-title">Personal y accesos</h2><p className="mt-0.5 text-[0.6rem] text-muted">Los roles se muestran desde las membresías reales del backend.</p></div>
          <label className="relative w-full sm:max-w-64"><span className="sr-only">Buscar en el equipo</span><Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted" aria-hidden="true" /><input className="h-8 w-full rounded-lg border border-line bg-surface-input pl-8 pr-3 text-[0.65rem] outline-none placeholder:text-muted focus:border-accent focus:ring-3 focus:ring-focus/30" type="search" placeholder="Buscar por nombre o rol..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-210 text-left"><caption className="sr-only">Equipo activo de la clínica</caption><thead className="bg-surface-subtle text-[0.56rem] font-extrabold uppercase tracking-wide text-muted"><tr><th className="px-4 py-2.5">Usuario</th><th className="px-3 py-2.5">Rol</th><th className="px-3 py-2.5">Contacto</th><th className="px-3 py-2.5">Estado</th><th className="px-4 py-2.5">Último acceso</th><th className="px-3 py-2.5">Acciones</th></tr></thead><tbody className="divide-y divide-line">{filteredMembers.map((member, index) => <tr className="text-[0.65rem] transition-colors hover:bg-surface-hover" key={member.id}><th className="px-4 py-2.5 font-normal"><div className="flex items-center gap-2.5"><span className={`grid size-8 place-items-center rounded-full font-mono text-[0.55rem] font-bold ${index % 2 ? "bg-violet-soft text-violet" : "bg-accent-soft text-accent"}`}>{getInitials(member.name)}</span><div><p className="font-extrabold">{member.name}</p><p className="mt-0.5 text-[0.52rem] text-muted">ID: {member.id}</p></div></div></th><td className="px-3 py-2.5"><DataBadge tone={ROLE_TONES[member.role]}>{ROLE_LABELS[member.role]}</DataBadge></td><td className="px-3 py-2.5"><div className="grid gap-1 text-[0.58rem] text-muted">{member.email ? <span className="inline-flex items-center gap-1.5"><Mail className="size-3" aria-hidden="true" />{member.email}</span> : null}<span className="inline-flex items-center gap-1.5"><Phone className="size-3" aria-hidden="true" />{member.phoneNumber}</span></div></td><td className="px-3 py-2.5"><DataBadge tone={member.status === "active" ? "success" : "neutral"} dot>{STATUS_LABELS[member.status]}</DataBadge></td><td className="px-4 py-2.5 font-mono text-[0.58rem] text-muted">{formatLastAccess(member.lastLoginAt)}</td><td className="px-3 py-2.5"><div className="flex gap-1">{<button className="grid size-8 place-items-center rounded-lg text-muted hover:bg-accent-soft hover:text-accent" type="button" aria-label={`Editar ${member.name}`} onClick={() => { setEditMember(member); setEditOpen(true); }}><Edit className="size-3.5" /></button>}{member.role !== "clinic_admin" ? <><button className={`grid size-8 place-items-center rounded-lg text-muted ${member.status === "active" ? "hover:bg-danger-soft hover:text-danger" : "hover:bg-success-soft hover:text-success"}`} type="button" aria-label={member.status === "active" ? `Suspender ${member.name}` : `Activar ${member.name}`} onClick={() => setSuspendMember(member)}><Power className="size-3.5" /></button><button className="grid size-8 place-items-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger" type="button" aria-label={`Eliminar ${member.name}`} onClick={() => setRemoveMember(member)}><Trash2 className="size-3.5" aria-hidden="true" /></button></> : null}</div></td></tr>)}</tbody></table>
          {isLoading ? <div className="grid min-h-40 place-items-center text-center text-xs font-bold text-muted">Cargando equipo...</div> : null}
          {!isLoading && filteredMembers.length === 0 ? <div className="grid min-h-40 place-items-center px-4 text-center"><div><Users className="mx-auto size-7 text-muted" aria-hidden="true" /><p className="mt-2 text-xs font-extrabold">{loadError ?? "No hay miembros con esta búsqueda."}</p><button className="mt-2 text-2xs font-bold text-accent" type="button" onClick={() => setQuery("")}>Limpiar búsqueda</button></div></div> : null}
        </div>
        <div className="flex items-center justify-between border-t border-line px-4 py-3"><p className="text-[0.6rem] text-muted">Mostrando {filteredMembers.length} de {members.length} miembros</p><span className="inline-flex items-center gap-1.5 text-[0.58rem] font-bold text-muted"><CountryFlag countryCode={clinicCountryCode} />Sede principal</span></div>
      </section>

      <CreateReceptionistModal key={`receptionist-${clinicCountryCode}-${isCreateOpen ? "open" : "closed"}`} clinicCountryCode={clinicCountryCode} isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreated={handleCreated} />

      <CreateClinicDoctorModal
        key={`doctor-${clinicCountryCode}-${isCreateDoctorOpen ? "open" : "closed"}`}
        clinicCountryCode={clinicCountryCode}
        isOpen={isCreateDoctorOpen}
        onClose={() => setIsCreateDoctorOpen(false)}
        onCreated={handleDoctorCreated}
      />

      <EditMemberModal key={editMember?.id ?? "closed"} member={editMember} isOpen={editOpen} onClose={() => { setEditOpen(false); setEditMember(null); }} onSaved={handleMemberSaved} />

      <ConfirmDialog
        isOpen={suspendMember !== null}
        onClose={() => setSuspendMember(null)}
        onConfirm={handleSuspendConfirm}
        title={suspendMember?.status === "active" ? "Suspender miembro" : "Activar miembro"}
        description={
          suspendMember?.status === "active"
            ? `¿Suspender a ${suspendMember?.name ?? "este miembro"}? Perderá acceso a la plataforma.`
            : `¿Reactivar a ${suspendMember?.name ?? "este miembro"}? Recuperará acceso a la plataforma.`
        }
        confirmLabel={suspendMember?.status === "active" ? "Suspender" : "Activar"}
        confirmTone={suspendMember?.status === "active" ? "danger" : "accent"}
        isLoading={suspendLoading}
      />

      <ConfirmDialog
        isOpen={removeMember !== null}
        onClose={() => setRemoveMember(null)}
        onConfirm={handleRemoveConfirm}
        title="Eliminar miembro"
        description={`¿Eliminar a ${removeMember?.name ?? "este miembro"} del equipo? Perderá el acceso a esta clínica.`}
        confirmLabel="Eliminar"
        confirmTone="danger"
        isLoading={removeLoading}
      />
    </div>
  );
}

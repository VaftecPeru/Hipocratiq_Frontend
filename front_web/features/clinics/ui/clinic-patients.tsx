"use client";

import { Activity, ChevronLeft, ChevronRight, Download, Edit, Eye, HeartPulse, Loader2, Plus, Power, Search, UserRoundCheck, Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  downloadClinicPatientsExport,
  getClinicPatientDetail,
  getClinicPatients,
  updateClinicPatient,
  updateClinicPatientStatus,
} from "@/features/clinics/api/browser-clinic-dashboard";
import type { UpdateClinicPatientPayload } from "@/features/clinics/api/browser-clinic-dashboard";
import type { ClinicPatient, ClinicPatientDetail } from "@/features/clinics/model/clinic-admin.types";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Modal } from "@/shared/ui/modal";
import { ModalDetailRow, ModalField, ModalGrid, ModalPrimaryButton, ModalSecondaryButton, ModalSelect } from "@/shared/ui/modal-parts";
import { AdminMetric, Notice, SectionCard, useNotice } from "./clinic-admin-primitives";

type Filter = "Todos" | "Activos" | "Inactivos";

type PatientEditForm = {
  name: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  documentType: string;
  documentNumber: string;
  dateOfBirth: string;
  sex: string;
  address: string;
  emergencyContact: string;
  insurance: string;
};

type PatientEditField = keyof PatientEditForm;

const EMPTY_PATIENT_EDIT_FORM: PatientEditForm = {
  name: "",
  email: "",
  phoneNumber: "",
  countryCode: "",
  documentType: "",
  documentNumber: "",
  dateOfBirth: "",
  sex: "",
  address: "",
  emergencyContact: "",
  insurance: "",
};

const PATIENT_COUNTRY_OPTIONS = [
  { value: "MX", label: "México" },
  { value: "PE", label: "Perú" },
  { value: "US", label: "Estados Unidos" },
];

const PATIENT_SEX_OPTIONS = [
  { value: "Femenino", label: "Femenino" },
  { value: "Masculino", label: "Masculino" },
  { value: "Otro", label: "Otro" },
];

const PATIENT_EDIT_ERROR_KEYS: Record<PatientEditField, string> = {
  name: "name",
  email: "email",
  phoneNumber: "phone_number",
  countryCode: "country_code",
  documentType: "document_type",
  documentNumber: "document_number",
  dateOfBirth: "date_of_birth",
  sex: "sex",
  address: "address",
  emergencyContact: "emergency_contact",
  insurance: "insurance",
};

function normalizeDateInput(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : "";
}

function formFromPatientDetail(detail: ClinicPatientDetail): PatientEditForm {
  return {
    name: detail.patient.name ?? "",
    email: detail.patient.email ?? "",
    phoneNumber: detail.patient.phoneNumber ?? "",
    countryCode: detail.profile.countryCode ?? "",
    documentType: detail.profile.documentType ?? "",
    documentNumber: detail.profile.documentNumber ?? "",
    dateOfBirth: normalizeDateInput(detail.profile.dateOfBirth),
    sex: detail.profile.sex ?? "",
    address: detail.profile.address ?? "",
    emergencyContact: detail.profile.emergencyContact ?? "",
    insurance: detail.profile.insurance ?? "",
  };
}

function normalizeOptionalEditValue(
  value: string,
  originalValue: string | null | undefined,
  wasTouched: boolean,
): string | null | undefined {
  const normalized = value.trim();
  if (normalized !== "") return normalized;
  if (wasTouched && originalValue?.trim()) return null;
  return undefined;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function withCurrentOption(
  options: { value: string; label: string }[],
  currentValue: string,
): { value: string; label: string }[] {
  if (!currentValue || options.some((option) => option.value === currentValue)) return options;
  return [{ value: currentValue, label: currentValue }, ...options];
}

const STATUS_LABELS: Record<string, string> = {
  active: "Activo",
  suspended: "Inactivo",
  pending_verification: "Pendiente",
  disabled: "Deshabilitado",
};
const STATUS_STYLES: Record<string, string> = {
  active: "bg-success-soft text-success",
  suspended: "bg-surface-subtle text-muted",
  pending_verification: "bg-warning-soft text-warning",
  disabled: "bg-danger-soft text-danger",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function PatientDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 w-1/3 rounded bg-surface-subtle" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="space-y-2" key={i}>
            <div className="h-3 w-1/2 rounded bg-surface-subtle" />
            <div className="h-4 w-full rounded bg-surface-subtle" />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Detail Modal ---

function PatientDetailModal({
  patientId,
  isOpen,
  onClose,
  onEdit,
}: {
  patientId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}) {
  const [detail, setDetail] = useState<ClinicPatientDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loading = isOpen && patientId !== null && detail === null && error === null;

  useEffect(() => {
    if (!isOpen || patientId === null) return;
    const controller = new AbortController();
    getClinicPatientDetail(patientId, controller.signal)
      .then(setDetail)
      .catch((err: unknown) => {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setError(err instanceof Error ? err.message : "Error al cargar expediente.");
        }
      });
    return () => controller.abort();
  }, [isOpen, patientId]);

  if (!isOpen) return null;

  const p = detail?.patient;
  const prof = detail?.profile;
  const intake = detail?.intake;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={p?.name ?? "Expediente del paciente"}
      description={p?.patientCode}
      size="lg"
      footer={
        <>
          <ModalSecondaryButton onClick={onClose}>Cerrar</ModalSecondaryButton>
          <ModalPrimaryButton onClick={onEdit} disabled={loading || !!error}>Editar datos</ModalPrimaryButton>
        </>
      }
    >
      {loading ? <PatientDetailSkeleton /> : error ? (
        <p className="py-8 text-center text-sm text-danger">{error}</p>
      ) : detail ? (
        <div className="space-y-5">
          <section aria-label="Datos personales">
            <h3 className="text-2xs font-extrabold uppercase tracking-wide text-muted">Datos personales</h3>
            <dl className="mt-2 divide-y divide-line">
              <ModalDetailRow label="Nombre">{p?.name ?? "—"}</ModalDetailRow>
              <ModalDetailRow label="Edad">{p?.age != null ? `${p.age} años` : "—"}</ModalDetailRow>
              <ModalDetailRow label="Sexo">{prof?.sex ?? "—"}</ModalDetailRow>
              <ModalDetailRow label="Fecha de nacimiento">{formatDate(prof?.dateOfBirth ?? null)}</ModalDetailRow>
              <ModalDetailRow label="Documento">{[prof?.documentType, prof?.documentNumber].filter(Boolean).join(" ") || "—"}</ModalDetailRow>
            </dl>
          </section>
          <section aria-label="Contacto">
            <h3 className="text-2xs font-extrabold uppercase tracking-wide text-muted">Contacto</h3>
            <dl className="mt-2 divide-y divide-line">
              <ModalDetailRow label="Teléfono">{p?.phoneNumber ?? "—"}</ModalDetailRow>
              <ModalDetailRow label="Correo">{p?.email ?? "—"}</ModalDetailRow>
              <ModalDetailRow label="Dirección">{prof?.address ?? "—"}</ModalDetailRow>
              <ModalDetailRow label="Emergencia">{prof?.emergencyContact ?? "—"}</ModalDetailRow>
              <ModalDetailRow label="Seguro / convenio">{prof?.insurance ?? "—"}</ModalDetailRow>
              <ModalDetailRow label="Paciente recurrente">{prof?.isReturningPatient ? "Sí" : "No"}</ModalDetailRow>
              <ModalDetailRow label="Mensajes por WhatsApp">{prof?.whatsappConsent ? "Autorizados" : "No autorizados"}</ModalDetailRow>
            </dl>
          </section>
          {intake ? (
            <section aria-label="Ingreso/Triage">
              <h3 className="text-2xs font-extrabold uppercase tracking-wide text-muted">Último ingreso</h3>
              <dl className="mt-2 divide-y divide-line">
                <ModalDetailRow label="Motivo">{intake.reasonCategory ?? "—"}</ModalDetailRow>
                <ModalDetailRow label="Médico solicitado">{intake.requestedDoctor?.name ?? "—"}</ModalDetailRow>
                <ModalDetailRow label="Especialidad">{intake.specialty ?? intake.requestedDoctor?.specialty ?? "—"}</ModalDetailRow>
                {intake.triage ? (
                  <ModalDetailRow label="Prioridad">
                    <span className={`rounded-md px-2 py-0.5 text-2xs font-bold ${intake.triage.priority === "urgent" ? "bg-warning-soft text-warning" : intake.triage.priority === "emergency" ? "bg-danger-soft text-danger" : "bg-success-soft text-success"}`}>
                      {intake.triage.priority ?? "—"}
                    </span>
                  </ModalDetailRow>
                ) : null}
              </dl>
            </section>
          ) : null}
          {(detail.recentAppointments.length > 0 || detail.nextAppointment) ? (
            <section aria-label="Citas">
              <h3 className="text-2xs font-extrabold uppercase tracking-wide text-muted">Citas</h3>
              <dl className="mt-2 divide-y divide-line">
                {detail.nextAppointment ? (
                  <ModalDetailRow label="Próxima cita">
                    {formatDate(detail.nextAppointment.scheduledAt)} — {detail.nextAppointment.doctor?.name ?? "Sin médico"}
                  </ModalDetailRow>
                ) : null}
                {detail.recentAppointments.slice(0, 3).map((appt) => (
                  <ModalDetailRow label={formatDate(appt.scheduledAt)} key={appt.id}>
                    {appt.statusLabel} — {appt.doctor?.name ?? "Sin médico"}
                  </ModalDetailRow>
                ))}
              </dl>
            </section>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}

// --- Edit Modal ---

function PatientEditModal({
  patient,
  isOpen,
  onClose,
  onSaved,
}: {
  patient: ClinicPatient | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updated: ClinicPatient) => void;
}) {
  const [detail, setDetail] = useState<ClinicPatientDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [form, setForm] = useState<PatientEditForm>(EMPTY_PATIENT_EDIT_FORM);
  const [touchedFields, setTouchedFields] = useState<Partial<Record<PatientEditField, boolean>>>({});
  const [isReturningPatient, setIsReturningPatient] = useState(false);
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const patientId = patient?.id ?? null;
  const loadingDetail = isOpen && patientId !== null && detail === null && detailError === null;

  useEffect(() => {
    if (!isOpen || patientId === null) return;

    const controller = new AbortController();

    getClinicPatientDetail(patientId, controller.signal)
      .then((nextDetail) => {
        if (controller.signal.aborted) return;
        setDetail(nextDetail);
        setForm(formFromPatientDetail(nextDetail));
        setIsReturningPatient(nextDetail.profile.isReturningPatient);
        setWhatsappConsent(nextDetail.profile.whatsappConsent);
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted || isAbortError(requestError)) return;
        setDetailError(requestError instanceof Error ? requestError.message : "Error al cargar los datos del paciente.");
      });

    return () => controller.abort();
  }, [isOpen, patientId]);

  function updateField(field: PatientEditField, value: string): void {
    setForm((current) => ({ ...current, [field]: value }));
    setTouchedFields((current) => ({ ...current, [field]: true }));
    const errorKey = PATIENT_EDIT_ERROR_KEYS[field];
    setFieldErrors((current) => {
      if (!current[errorKey]) return current;
      const next = { ...current };
      delete next[errorKey];
      return next;
    });
  }

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!patient || !detail || loadingDetail || detailError || saving) return;

    const normalizedName = form.name.trim();
    const normalizedPhoneNumber = form.phoneNumber.trim();
    const normalizedCountryCode = form.countryCode.trim();
    if (!normalizedName || !normalizedPhoneNumber || !normalizedCountryCode) {
      setError("Completa los campos requeridos para guardar los datos del paciente.");
      return;
    }

    const payload: UpdateClinicPatientPayload = {
      name: normalizedName,
      email: normalizeOptionalEditValue(form.email, detail.patient.email, touchedFields.email === true),
      phoneNumber: normalizedPhoneNumber,
      countryCode: normalizedCountryCode,
      documentType: normalizeOptionalEditValue(form.documentType, detail.profile.documentType, touchedFields.documentType === true),
      documentNumber: normalizeOptionalEditValue(form.documentNumber, detail.profile.documentNumber, touchedFields.documentNumber === true),
      dateOfBirth: normalizeOptionalEditValue(form.dateOfBirth, detail.profile.dateOfBirth, touchedFields.dateOfBirth === true),
      sex: normalizeOptionalEditValue(form.sex, detail.profile.sex, touchedFields.sex === true),
      address: normalizeOptionalEditValue(form.address, detail.profile.address, touchedFields.address === true),
      emergencyContact: normalizeOptionalEditValue(form.emergencyContact, detail.profile.emergencyContact, touchedFields.emergencyContact === true),
      insurance: normalizeOptionalEditValue(form.insurance, detail.profile.insurance, touchedFields.insurance === true),
      isReturningPatient,
      whatsappConsent,
    };
    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      const updated = await updateClinicPatient(patient.id, payload);
      onSaved(updated);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errors" in err) {
        setFieldErrors((err as { errors: Record<string, string[]> }).errors ?? {});
      }
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSaving(false);
    }
  }, [detail, detailError, form, isReturningPatient, loadingDetail, patient, saving, touchedFields, whatsappConsent, onSaved]);

  if (!isOpen || !patient) return null;

  const countryOptions = withCurrentOption(PATIENT_COUNTRY_OPTIONS, form.countryCode);
  const sexOptions = withCurrentOption(PATIENT_SEX_OPTIONS, form.sex);
  const fieldError = (field: PatientEditField): string | undefined => fieldErrors[PATIENT_EDIT_ERROR_KEYS[field]]?.[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar paciente"
      description={patient.patientCode}
      size="lg"
      footer={
        <>
          <ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton>
          <ModalPrimaryButton type="submit" form="patient-edit-form" disabled={saving || loadingDetail || detail === null || detailError !== null}>
            {loadingDetail ? "Cargando..." : saving ? "Guardando..." : "Guardar cambios"}
          </ModalPrimaryButton>
        </>
      }
    >
      {loadingDetail ? (
        <div className="flex min-h-48 items-center justify-center gap-2 text-xs font-bold text-muted" role="status" aria-busy="true" aria-live="polite">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Cargando datos del expediente…
        </div>
      ) : detailError ? (
        <p className="rounded-lg bg-danger-soft px-3 py-3 text-center text-xs font-bold text-danger" role="alert">{detailError}</p>
      ) : detail ? (
        <form id="patient-edit-form" onSubmit={handleSubmit} className="space-y-4" aria-busy={saving} noValidate>
          {error ? <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs font-bold text-danger" role="alert">{error}</p> : null}
          <ModalGrid>
            <ModalField id="edit-name" label="Nombre completo" value={form.name} onChange={(event) => updateField("name", event.target.value)} error={fieldError("name")} required />
            <ModalField id="edit-email" label="Correo electrónico" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} error={fieldError("email")} />
          </ModalGrid>
          <ModalGrid>
            <ModalField id="edit-phone" label="Teléfono" value={form.phoneNumber} onChange={(event) => updateField("phoneNumber", event.target.value)} error={fieldError("phoneNumber")} required />
            <ModalSelect id="edit-country" label="País" options={countryOptions} value={form.countryCode} onChange={(value) => updateField("countryCode", value)} error={fieldError("countryCode")} required />
          </ModalGrid>
          <ModalGrid>
            <ModalField id="edit-doc-type" label="Tipo de documento" value={form.documentType} onChange={(event) => updateField("documentType", event.target.value)} error={fieldError("documentType")} />
            <ModalField id="edit-doc-number" label="Número de documento" value={form.documentNumber} onChange={(event) => updateField("documentNumber", event.target.value)} error={fieldError("documentNumber")} />
          </ModalGrid>
          <ModalGrid>
            <ModalField id="edit-date-of-birth" label="Fecha de nacimiento" type="date" value={form.dateOfBirth} onChange={(event) => updateField("dateOfBirth", event.target.value)} error={fieldError("dateOfBirth")} />
            <ModalSelect id="edit-sex" label="Sexo" options={sexOptions} value={form.sex} onChange={(value) => updateField("sex", value)} error={fieldError("sex")} />
          </ModalGrid>
          <ModalField id="edit-address" label="Dirección" value={form.address} onChange={(event) => updateField("address", event.target.value)} error={fieldError("address")} />
          <ModalField id="edit-emergency" label="Contacto de emergencia" value={form.emergencyContact} onChange={(event) => updateField("emergencyContact", event.target.value)} error={fieldError("emergencyContact")} />
          <ModalField id="edit-insurance" label="Seguro / convenio" value={form.insurance} onChange={(event) => updateField("insurance", event.target.value)} error={fieldError("insurance")} />
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-ink-secondary">
            <label className="flex items-center gap-2"><input className="size-4 accent-accent" type="checkbox" checked={isReturningPatient} onChange={(event) => setIsReturningPatient(event.target.checked)} />Paciente recurrente</label>
            <label className="flex items-center gap-2"><input className="size-4 accent-accent" type="checkbox" checked={whatsappConsent} onChange={(event) => setWhatsappConsent(event.target.checked)} />Autoriza mensajes por WhatsApp</label>
          </div>
        </form>
      ) : null}
    </Modal>
  );
}

// --- Main Component ---

export function ClinicPatients() {
  const [filter, setFilter] = useState<Filter>("Todos");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [patients, setPatients] = useState<ClinicPatient[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [now] = useState(Date.now);
  const { notice, showNotice } = useNotice();

  // Detail modal state
  const [detailPatientId, setDetailPatientId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Edit modal state
  const [editPatient, setEditPatient] = useState<ClinicPatient | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Status confirm dialog state
  const [statusPatient, setStatusPatient] = useState<ClinicPatient | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch patients
  useEffect(() => {
    const controller = new AbortController();
    getClinicPatients(debouncedQuery, currentPage, controller.signal)
      .then((page) => {
        setPatients(page.patients);
        setTotalPatients(page.pagination.total);
        setLastPage(page.pagination.lastPage);
        setActiveCount(page.patients.filter((p) => p.status === "active").length);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          showNotice(error instanceof Error ? error.message : "No pudimos cargar los pacientes.");
        }
      })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [currentPage, debouncedQuery, showNotice]);

  // Filter client-side
  const filtered = useMemo(() => patients.filter((p) => {
    if (filter === "Activos") return p.status === "active";
    if (filter === "Inactivos") return p.status === "suspended" || p.status === "disabled";
    return true;
  }), [filter, patients]);

  const newThisMonth = useMemo(() => {
    const threshold = new Date(now - 30 * 24 * 60 * 60 * 1000);
    return patients.filter((p) => p.createdAt && new Date(p.createdAt) >= threshold).length;
  }, [now, patients]);

  // Export handler
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      await downloadClinicPatientsExport();
      showNotice("Archivo CSV descargado correctamente.");
    } catch (err: unknown) {
      showNotice(err instanceof Error ? err.message : "Error al exportar.");
    } finally {
      setIsExporting(false);
    }
  }, [showNotice]);

  // Status toggle handler
  const handleStatusConfirm = useCallback(async () => {
    if (!statusPatient) return;
    const newStatus = statusPatient.status === "active" ? "suspended" : "active";
    setStatusLoading(true);
    try {
      const updated = await updateClinicPatientStatus(statusPatient.id, newStatus as "active" | "suspended");
      setPatients((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      showNotice(`Paciente ${newStatus === "active" ? "activado" : "desactivado"} correctamente.`);
      setStatusPatient(null);
    } catch (err: unknown) {
      showNotice(err instanceof Error ? err.message : "Error al cambiar estado.");
    } finally {
      setStatusLoading(false);
    }
  }, [statusPatient, showNotice]);

  // Edit save handler
  const handleEditSaved = useCallback((updated: ClinicPatient) => {
    setPatients((prev) => prev.map((p) => p.id === updated.id ? updated : p));
    setEditOpen(false);
    setEditPatient(null);
    showNotice("Datos del paciente actualizados.");
  }, [showNotice]);

  return (
    <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7">
      <Notice message={notice} />

      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-accent uppercase">Gestión asistencial</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Pacientes</h1>
          <p className="mt-1 text-xs text-muted">Directorio, expedientes y administración de pacientes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-extrabold hover:bg-surface-hover disabled:opacity-50"
            type="button"
            disabled={isExporting}
            onClick={handleExport}
          >
            {isExporting ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
            Exportar
          </button>
          <Link
            href="/clinic/registro-pacientes"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent px-4 text-xs font-extrabold text-white hover:bg-accent-hover"
          >
            <Plus className="size-3.5" />
            Nuevo paciente
          </Link>
        </div>
      </header>

      {/* Metrics */}
      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de pacientes">
        <AdminMetric icon={Users} label="Pacientes totales" value={String(totalPatients)} helper="Registrados en la clínica" tone="bg-accent-soft text-accent" />
        <AdminMetric icon={UserRoundCheck} label="Nuevos este mes" value={String(newThisMonth)} helper="Últimos 30 días" tone="bg-success-soft text-success" />
        <AdminMetric icon={Activity} label="Activos en página" value={String(activeCount)} helper="En la página actual" tone="bg-warning-soft text-warning" />
        <AdminMetric icon={HeartPulse} label="Datos clínicos" value="—" helper="Disponible al abrir expediente" tone="bg-violet-soft text-violet" />
      </section>

      {/* Table */}
      <SectionCard className="mt-4 overflow-hidden" labelledBy="patients-list-title">
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3 lg:flex-row lg:items-center">
          <h2 className="text-xs font-extrabold" id="patients-list-title">Listado de pacientes</h2>
          <label className="relative lg:ml-auto">
            <span className="sr-only">Buscar paciente</span>
            <Search className="absolute top-1/2 left-2.5 size-3 -translate-y-1/2 text-muted" />
            <input
              className="h-8 w-full rounded-lg border border-line bg-surface-input pr-3 pl-8 text-[0.62rem] outline-none focus:border-accent lg:w-56"
              placeholder="Nombre, código, documento, correo o teléfono"
              value={query}
              onChange={(e) => { setIsLoading(true); setCurrentPage(1); setQuery(e.target.value); }}
            />
          </label>
          <div className="flex gap-1 overflow-x-auto">
            {(["Todos", "Activos", "Inactivos"] as const).map((item) => (
              <button
                className={`min-h-8 shrink-0 rounded-lg px-3 text-[0.58rem] font-bold ${filter === item ? "bg-accent-soft text-accent" : "border border-line text-muted"}`}
                type="button"
                key={item}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-180 text-left">
            <caption className="sr-only">Pacientes de la clínica</caption>
            <thead className="bg-surface-subtle text-[0.53rem] font-extrabold uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2.5">Paciente</th>
                <th className="px-3 py-2.5">Edad</th>
                <th className="px-3 py-2.5">Última cita</th>
                <th className="px-3 py-2.5">Médico</th>
                <th className="px-3 py-2.5">Próxima cita</th>
                <th className="px-3 py-2.5">Estado</th>
                <th className="px-3 py-2.5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((patient, index) => {
                const initials = (patient.name ?? "?").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                return (
                  <tr className="text-[0.61rem] hover:bg-surface-hover" key={patient.id}>
                    <th className="px-3 py-2.5 font-normal">
                      <div className="flex items-center gap-2">
                        <span className={`grid size-8 shrink-0 place-items-center rounded-full font-mono text-[0.5rem] font-bold ${index % 2 ? "bg-violet-soft text-violet" : "bg-accent-soft text-accent"}`}>
                          {initials}
                        </span>
                        <div>
                          <p className="font-extrabold">{patient.name ?? "Sin nombre"}</p>
                          <p className="font-mono text-[0.49rem] text-muted">{patient.patientCode}</p>
                        </div>
                      </div>
                    </th>
                    <td className="px-3 font-mono font-bold">{patient.age ?? "—"}</td>
                    <td className="px-3 font-semibold text-ink-secondary">
                      {patient.lastAppointment ? formatDate(patient.lastAppointment.scheduledAt) : "Sin registro"}
                    </td>
                    <td className="px-3">
                      <p className="font-extrabold">{patient.lastAppointment?.doctor?.name ?? patient.nextAppointment?.doctor?.name ?? "Sin asignar"}</p>
                      <p className="text-[0.5rem] text-muted">{patient.lastAppointment?.doctor?.specialty ?? patient.nextAppointment?.doctor?.specialty ?? "—"}</p>
                    </td>
                    <td className="px-3 font-mono text-[0.56rem] font-bold">
                      {patient.nextAppointment ? formatDate(patient.nextAppointment.scheduledAt) : "No programada"}
                    </td>
                    <td className="px-3">
                      <span className={`rounded-md px-2 py-1 text-[0.52rem] font-extrabold ${STATUS_STYLES[patient.status ?? ""] ?? "bg-surface-subtle text-muted"}`}>
                        {STATUS_LABELS[patient.status ?? ""] ?? "—"}
                      </span>
                    </td>
                    <td className="px-3">
                      <div className="flex gap-1">
                        <button
                          className="grid size-8 place-items-center rounded-lg text-muted hover:bg-accent-soft hover:text-accent"
                          type="button"
                          aria-label={`Ver expediente de ${patient.name}`}
                          onClick={() => { setDetailPatientId(patient.id); setDetailOpen(true); }}
                        >
                          <Eye className="size-3.5" />
                        </button>
                        <button
                          className="grid size-8 place-items-center rounded-lg text-muted hover:bg-accent-soft hover:text-accent"
                          type="button"
                          aria-label={`Editar ${patient.name}`}
                          onClick={() => { setEditPatient(patient); setEditOpen(true); }}
                        >
                          <Edit className="size-3.5" />
                        </button>
                        <button
                          className={`grid size-8 place-items-center rounded-lg text-muted ${patient.status === "active" ? "hover:bg-danger-soft hover:text-danger" : "hover:bg-success-soft hover:text-success"}`}
                          type="button"
                          aria-label={patient.status === "active" ? `Desactivar ${patient.name}` : `Activar ${patient.name}`}
                          onClick={() => setStatusPatient(patient)}
                        >
                          <Power className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-2 p-3 md:hidden">
          {filtered.map((patient) => {
            const initials = (patient.name ?? "?").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
            return (
              <article key={patient.id} className="rounded-lg border border-line p-3">
                <div className="flex items-center gap-2">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft font-mono text-xs font-bold text-accent">{initials}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-extrabold">{patient.name ?? "Sin nombre"}</p>
                    <p className="font-mono text-[0.5rem] text-muted">{patient.patientCode}</p>
                  </div>
                  <span className={`rounded-md px-2 py-1 text-[0.52rem] font-extrabold ${STATUS_STYLES[patient.status ?? ""] ?? "bg-surface-subtle text-muted"}`}>
                    {STATUS_LABELS[patient.status ?? ""] ?? "—"}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[0.56rem]">
                  <span className="text-muted">Edad:</span><span className="font-bold">{patient.age ?? "—"}</span>
                  <span className="text-muted">Última cita:</span><span className="font-bold">{patient.lastAppointment ? formatDate(patient.lastAppointment.scheduledAt) : "—"}</span>
                  <span className="text-muted">Médico:</span><span className="font-bold">{patient.lastAppointment?.doctor?.name ?? "—"}</span>
                  <span className="text-muted">Próxima:</span><span className="font-bold">{patient.nextAppointment ? formatDate(patient.nextAppointment.scheduledAt) : "—"}</span>
                </div>
                <div className="mt-2 flex justify-end gap-1 border-t border-line pt-2">
                  <button className="grid size-8 place-items-center rounded-lg text-muted hover:bg-accent-soft hover:text-accent" type="button" aria-label={`Ver ${patient.name}`} onClick={() => { setDetailPatientId(patient.id); setDetailOpen(true); }}><Eye className="size-3.5" /></button>
                  <button className="grid size-8 place-items-center rounded-lg text-muted hover:bg-accent-soft hover:text-accent" type="button" aria-label={`Editar ${patient.name}`} onClick={() => { setEditPatient(patient); setEditOpen(true); }}><Edit className="size-3.5" /></button>
                  <button className={`grid size-8 place-items-center rounded-lg text-muted ${patient.status === "active" ? "hover:bg-danger-soft hover:text-danger" : "hover:bg-success-soft hover:text-success"}`} type="button" aria-label={patient.status === "active" ? `Desactivar ${patient.name}` : `Activar ${patient.name}`} onClick={() => setStatusPatient(patient)}><Power className="size-3.5" /></button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Loading / empty */}
        {isLoading ? (
          <div className="grid min-h-36 place-items-center text-center text-xs font-bold text-muted">
            <span className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" />Cargando pacientes…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid min-h-36 place-items-center text-center text-xs text-muted">
            {query || filter !== "Todos" ? "No se encontraron pacientes con estos filtros." : "Aún no hay pacientes registrados."}
          </div>
        ) : null}

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-line px-4 py-3">
          <p className="text-[0.58rem] text-muted">Mostrando {filtered.length} de {totalPatients}</p>
          <div className="flex gap-1">
            <button
              className="grid size-7 place-items-center rounded-md border border-line text-muted disabled:opacity-40"
              type="button"
              aria-label="Página anterior"
              disabled={currentPage === 1 || isLoading}
              onClick={() => { setIsLoading(true); setCurrentPage((p) => Math.max(1, p - 1)); }}
            >
              <ChevronLeft className="size-3" />
            </button>
            {Array.from({ length: Math.min(lastPage, 5) }, (_, i) => i + 1).map((page) => (
              <button
                className={`grid size-7 place-items-center rounded-md text-[0.58rem] font-bold ${page === currentPage ? "bg-accent text-white" : "border border-line text-muted"}`}
                type="button"
                key={page}
                disabled={isLoading}
                onClick={() => { setIsLoading(true); setCurrentPage(page); }}
              >
                {page}
              </button>
            ))}
            <button
              className="grid size-7 place-items-center rounded-md border border-line text-muted disabled:opacity-40"
              type="button"
              aria-label="Página siguiente"
              disabled={currentPage === lastPage || isLoading}
              onClick={() => { setIsLoading(true); setCurrentPage((p) => Math.min(lastPage, p + 1)); }}
            >
              <ChevronRight className="size-3" />
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Modals */}
      <PatientDetailModal
        key={detailPatientId ?? "none"}
        patientId={detailPatientId}
        isOpen={detailOpen}
        onClose={() => { setDetailOpen(false); setDetailPatientId(null); }}
        onEdit={() => {
          setDetailOpen(false);
          const p = patients.find((pt) => pt.id === detailPatientId);
          if (p) { setEditPatient(p); setEditOpen(true); }
        }}
      />

      <PatientEditModal
        key={editPatient?.id ?? "none"}
        patient={editPatient}
        isOpen={editOpen}
        onClose={() => { setEditOpen(false); setEditPatient(null); }}
        onSaved={handleEditSaved}
      />

      <ConfirmDialog
        isOpen={statusPatient !== null}
        onClose={() => setStatusPatient(null)}
        onConfirm={handleStatusConfirm}
        title={statusPatient?.status === "active" ? "Desactivar paciente" : "Reactivar paciente"}
        description={
          statusPatient?.status === "active"
            ? `¿Desactivar a ${statusPatient?.name ?? "este paciente"}? No podrá acceder a la plataforma hasta ser reactivado.`
            : `¿Reactivar a ${statusPatient?.name ?? "este paciente"}? Recuperará acceso a la plataforma.`
        }
        confirmLabel={statusPatient?.status === "active" ? "Desactivar" : "Reactivar"}
        confirmTone={statusPatient?.status === "active" ? "danger" : "accent"}
        isLoading={statusLoading}
      />
    </div>
  );
}

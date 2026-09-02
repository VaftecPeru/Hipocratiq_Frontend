"use client";

import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit,
  Loader2,
  Lock,
  Plus,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createClinicAppointment,
  getClinicAppointments,
  getClinicMembers,
  getClinicPatients,
  updateClinicAppointment,
  updateClinicAppointmentStatus,
} from "@/features/clinics/api/browser-clinic-dashboard";
import type {
  ClinicAppointment,
  ClinicAppointmentStatus,
  ClinicAppointmentSummary,
  ClinicPatient,
  ClinicTeamMember,
} from "@/features/clinics/model/clinic-admin.types";
import { Modal } from "@/shared/ui/modal";
import {
  ModalField,
  ModalGrid,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalSelect,
  ModalTextarea,
} from "@/shared/ui/modal-parts";

type ViewMode = "Día" | "Semana" | "Mes";

const hours = Array.from({ length: 10 }, (_, index) => 8 + index);

const statusStyles: Record<ClinicAppointmentStatus, string> = {
  pending: "border-danger/25 bg-danger-soft text-danger",
  confirmed: "border-success/25 bg-success-soft text-success",
  waiting: "border-warning/25 bg-warning-soft text-warning",
  in_consultation: "border-accent/25 bg-accent-soft text-accent",
  completed: "border-violet/25 bg-violet-soft text-violet",
  canceled: "border-danger/25 bg-danger-soft text-danger",
  no_show: "border-line bg-surface-subtle text-muted",
};

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const day = result.getDay();
  result.setDate(result.getDate() + (day === 0 ? -6 : 1 - day));
  return result;
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function dateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatDay(date: Date): string {
  return new Intl.DateTimeFormat("es-PE", { weekday: "short", day: "numeric", month: "short" })
    .format(date)
    .replaceAll(".", "");
}

function formatRange(from: Date, to: Date): string {
  const formatter = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "long" });
  return `${formatter.format(from)} - ${formatter.format(to)}`;
}

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function MetricCard({ icon: Icon, label, value, helper, tone }: Readonly<{ icon: LucideIcon; label: string; value: number; helper: string; tone: string }>) {
  return (
    <article className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.3rem_1rem_rgb(16_27_51/4%)]">
      <div className="flex items-center gap-3">
        <span className={`grid size-9 place-items-center rounded-lg ${tone}`}><Icon className="size-4" aria-hidden="true" /></span>
        <div><p className="text-2xs font-bold text-muted">{label}</p><p className="mt-1 font-mono text-xl font-bold tracking-tight">{value}</p></div>
      </div>
      <p className="mt-3 border-t border-line pt-2 text-[0.62rem] font-semibold text-muted">{helper}</p>
    </article>
  );
}

function AppointmentCard({ appointment, dayIndex, onClick }: Readonly<{ appointment: ClinicAppointment; dayIndex: number; onClick?: () => void }>) {
  const [hour, minute] = appointment.time.split(":").map(Number);
  const startMinutes = (hour - 8) * 60 + minute;
  const top = Math.max(0, Math.min(94, (startMinutes / 600) * 100));

  return (
    <button
      className={`absolute z-10 overflow-hidden rounded-md border p-1.5 text-left shadow-[0_0.2rem_0.6rem_rgb(16_27_51/6%)] transition-transform hover:z-20 hover:-translate-y-0.5 hover:shadow-md focus-visible:z-20 focus-visible:outline-2 focus-visible:outline-accent ${statusStyles[appointment.status]}`}
      style={{ left: `calc(${(dayIndex / 7) * 100}% + 0.2rem)`, top: `${top}%`, width: "calc(14.2857% - 0.4rem)", minHeight: "3.9rem" }}
      type="button"
      onClick={onClick}
      aria-label={`${appointment.time}, ${appointment.patient.name ?? "Paciente"}, ${appointment.doctor?.name ?? "Sin médico"}, ${appointment.statusLabel}`}
      onClick={onClick}
    >
      <span className="block font-mono text-[0.55rem] font-extrabold">{appointment.time}</span>
      <span className="mt-0.5 block truncate text-[0.58rem] font-extrabold">{appointment.patient.name ?? "Paciente sin nombre"}</span>
      <span className="block truncate text-[0.5rem] font-semibold opacity-75">{appointment.doctor?.name ?? "Sin médico"}</span>
    </button>
  );
}

function WeekCalendar({ days, appointments, onAppointmentClick }: Readonly<{ days: Date[]; appointments: ClinicAppointment[]; onAppointmentClick?: (a: ClinicAppointment) => void }>) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-190">
        <div className="grid grid-cols-[3rem_repeat(7,minmax(5.5rem,1fr))] border-b border-line bg-surface-subtle/70">
          <span />
          {days.map((day) => <div className="border-l border-line px-1 py-2 text-center text-[0.6rem] font-extrabold text-ink-secondary" key={dateKey(day)}>{formatDay(day)}</div>)}
        </div>
        <div className="grid grid-cols-[3rem_1fr]">
          <div className="grid grid-rows-10">{hours.map((hour) => <span className="border-b border-line pr-2 pt-1 text-right font-mono text-[0.56rem] font-bold text-muted" key={hour}>{String(hour).padStart(2, "0")}:00</span>)}</div>
          <div className="relative grid h-125 grid-cols-7 grid-rows-10 bg-[linear-gradient(to_bottom,var(--line)_1px,transparent_1px)] bg-[length:100%_10%]">
            {days.map((day) => <span className="border-l border-line" key={dateKey(day)} />)}
            {blocks.map((block) => {  const dayIndex = Math.round(
              (
                new Date(`${block.scheduledDate}T12:00:00`).getTime() -
                new Date(`${dateKey(days[0])}T12:00:00`).getTime()
              ) / 86400000,
          );

  return dayIndex >= 0 && dayIndex < 7 ? (
    <ScheduleBlockCard
      key={`block-${block.id}`}
      block={block}
      dayIndex={dayIndex}
    />
  ) : null;
})}
            {appointments.map((appointment) => {
              const dayIndex = Math.round((new Date(`${appointment.scheduledDate}T12:00:00`).getTime() - new Date(`${dateKey(days[0])}T12:00:00`).getTime()) / 86400000);
              return dayIndex >= 0 && dayIndex < 7 ? <AppointmentCard appointment={appointment} dayIndex={dayIndex} key={appointment.id} onClick={() => onAppointmentClick?.(appointment)} /> : null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryList({ summary }: Readonly<{ summary: ClinicAppointmentSummary }>) {
  return <ul className="grid gap-2 text-[0.6rem] font-semibold text-muted"><li className="flex items-center gap-2"><span className="size-2 rounded-full bg-success" />Confirmadas <b className="ml-auto text-ink">{summary.confirmed}</b></li><li className="flex items-center gap-2"><span className="size-2 rounded-full bg-warning" />En espera <b className="ml-auto text-ink">{summary.waiting}</b></li><li className="flex items-center gap-2"><span className="size-2 rounded-full bg-danger" />Pendientes <b className="ml-auto text-ink">{summary.pending}</b></li><li className="flex items-center gap-2"><span className="size-2 rounded-full bg-muted" />No asistieron <b className="ml-auto text-ink">{summary.noShow}</b></li></ul>;
}

// Status transition map — which actions are available from each status
const STATUS_TRANSITIONS: Record<ClinicAppointmentStatus, Array<{ label: string; next: ClinicAppointmentStatus; tone: "accent" | "danger" }>> = {
  pending: [
    { label: "Confirmar", next: "confirmed", tone: "accent" },
    { label: "Cancelar", next: "canceled", tone: "danger" },
  ],
  confirmed: [
    { label: "Registrar llegada", next: "waiting", tone: "accent" },
    { label: "Cancelar", next: "canceled", tone: "danger" },
  ],
  waiting: [
    { label: "Iniciar consulta", next: "in_consultation", tone: "accent" },
    { label: "No asistió", next: "no_show", tone: "danger" },
  ],
  in_consultation: [
    { label: "Completar", next: "completed", tone: "accent" },
  ],
  completed: [],
  canceled: [],
  no_show: [],
};

type AppointmentEditForm = {
  doctorUserId: string;
  date: string;
  time: string;
  appointmentType: string;
};

type AppointmentEditField = keyof AppointmentEditForm;
type AppointmentEditFieldErrors = Partial<Record<AppointmentEditField, string>>;

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function validationMessage(errors: unknown, key: string): string | undefined {
  if (typeof errors !== "object" || errors === null) return undefined;

  const messages = (errors as Record<string, unknown>)[key];
  if (typeof messages === "string") return messages;
  if (!Array.isArray(messages)) return undefined;

  return messages.find((message): message is string => typeof message === "string");
}

function appointmentEditFieldErrors(error: unknown): AppointmentEditFieldErrors {
  if (typeof error !== "object" || error === null || !("errors" in error)) return {};

  const errors = (error as { errors?: unknown }).errors;
  const scheduledAtError = validationMessage(errors, "scheduled_at");

  return {
    doctorUserId: validationMessage(errors, "doctor_user_id"),
    date: scheduledAtError,
    time: scheduledAtError,
    appointmentType: validationMessage(errors, "appointment_type"),
  };
}

function appointmentEditFormFromAppointment(appointment: ClinicAppointment): AppointmentEditForm {
  return {
    doctorUserId: appointment.doctor ? String(appointment.doctor.id) : "",
    date: appointment.scheduledDate,
    time: appointment.time,
    appointmentType: appointment.appointmentType,
  };
}

function isDateInRange(date: string, from: string, to: string): boolean {
  return date >= from && date <= to;
}

function AppointmentDetailModal({
  appointment,
  isOpen,
  onClose,
  onEdit,
  onStatusChanged,
}: {
  appointment: ClinicAppointment | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onStatusChanged: (updated: ClinicAppointment) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !appointment) return null;

  const transitions = STATUS_TRANSITIONS[appointment.status] ?? [];

  async function handleStatusChange(next: ClinicAppointmentStatus) {
    if (!appointment) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateClinicAppointmentStatus(appointment.id, next);
      onStatusChanged(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al actualizar estado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle de cita"
      description={`${appointment.scheduledDate} · ${appointment.time}`}
      size="md"
      footer={
        <>
          <ModalSecondaryButton onClick={onClose}>Cerrar</ModalSecondaryButton>
          <ModalPrimaryButton disabled={saving} onClick={onEdit}>
            <Edit className="size-3.5" aria-hidden="true" />
            Editar cita
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-line bg-surface-subtle p-3 text-xs">
          <p className="font-extrabold">{appointment.patient.name ?? "Paciente sin nombre"}</p>
          <p className="mt-0.5 font-mono text-[0.58rem] text-muted">{appointment.patient.patientCode}</p>
          {appointment.patient.phoneNumber ? <p className="mt-0.5 text-[0.6rem] text-ink-secondary">{appointment.patient.phoneNumber}</p> : null}
        </div>
        <div className="grid gap-1.5 text-[0.65rem]">
          <div className="flex justify-between"><span className="font-bold text-muted">Médico</span><span className="font-semibold">{appointment.doctor?.name ?? "Sin asignar"}</span></div>
          {appointment.doctor?.specialty ? <div className="flex justify-between"><span className="font-bold text-muted">Especialidad</span><span className="font-semibold">{appointment.doctor.specialty}</span></div> : null}
          <div className="flex justify-between"><span className="font-bold text-muted">Tipo</span><span className="font-semibold">{appointment.appointmentType}</span></div>
          <div className="flex justify-between items-center"><span className="font-bold text-muted">Estado</span><span className={`rounded-full border px-2 py-0.5 text-[0.52rem] font-extrabold ${statusStyles[appointment.status]}`}>{appointment.statusLabel}</span></div>
        </div>
        {error ? <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs font-bold text-danger">{error}</p> : null}
        {transitions.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-t border-line pt-3">
            {transitions.map(({ label, next, tone }) => (
              <ModalPrimaryButton key={next} tone={tone} disabled={saving} onClick={() => handleStatusChange(next)}>
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : null}
                {label}
              </ModalPrimaryButton>
            ))}
          </div>
        ) : (
          <p className="text-[0.6rem] text-muted border-t border-line pt-3">Esta cita no tiene acciones disponibles.</p>
        )}
      </div>
    </Modal>
  );
}

function EditAppointmentModal({
  appointment,
  isOpen,
  onClose,
  onSaved,
}: {
  appointment: ClinicAppointment;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updated: ClinicAppointment) => Promise<void>;
}) {
  const [form, setForm] = useState<AppointmentEditForm>(() => appointmentEditFormFromAppointment(appointment));
  const [doctors, setDoctors] = useState<ClinicTeamMember[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<AppointmentEditFieldErrors>({});

  useEffect(() => {
    const controller = new AbortController();

    getClinicMembers(controller.signal)
      .then((members) => {
        if (controller.signal.aborted) return;
        setDoctors(members.filter((member) => member.role === "doctor"));
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted || isAbortError(requestError)) return;
        setDoctorsError(requestError instanceof Error ? requestError.message : "No pudimos cargar los médicos disponibles.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setDoctorsLoading(false);
      });

    return () => controller.abort();
  }, []);

  function updateField(field: AppointmentEditField, value: string): void {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
    setFieldErrors((current) => {
      const fieldsToClear: AppointmentEditField[] = field === "date" || field === "time"
        ? ["date", "time"]
        : [field];
      const hasErrorsToClear = fieldsToClear.some((fieldName) => current[fieldName]);
      if (!hasErrorsToClear) return current;

      const next = { ...current };
      fieldsToClear.forEach((fieldName) => delete next[fieldName]);
      return next;
    });
  }

  const handleClose = useCallback(() => {
    if (saving) return;
    onClose();
  }, [onClose, saving]);

  const doctorOptions = doctors.map((doctor) => ({
    value: String(doctor.id),
    label: doctor.specialty ? `${doctor.name} — ${doctor.specialty}` : doctor.name,
  }));
  const selectedDoctorIsAvailable = doctors.some((doctor) => String(doctor.id) === form.doctorUserId);
  const currentDoctorUnavailable = Boolean(appointment.doctor) && !doctorsLoading && !doctorsError && !selectedDoctorIsAvailable;
  const doctorError = fieldErrors.doctorUserId ?? (
    currentDoctorUnavailable ? "El médico actual no está disponible. Selecciona un médico activo." : undefined
  );
  const canSubmit = !saving
    && !doctorsLoading
    && !doctorsError
    && doctors.length > 0
    && selectedDoctorIsAvailable
    && Boolean(form.date)
    && Boolean(form.time)
    && Boolean(form.appointmentType.trim());

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving || doctorsLoading || doctorsError || doctors.length === 0) return;

    const nextFieldErrors: AppointmentEditFieldErrors = {};
    if (!selectedDoctorIsAvailable) nextFieldErrors.doctorUserId = "Selecciona un médico activo.";
    if (!form.date) nextFieldErrors.date = "Selecciona una fecha.";
    if (!form.time) nextFieldErrors.time = "Selecciona una hora.";
    if (!form.appointmentType.trim()) nextFieldErrors.appointmentType = "Ingresa el tipo de cita.";

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setError("Completa los campos requeridos para guardar la cita.");
      return;
    }

    const scheduledAtDate = new Date(`${form.date}T${form.time}`);
    if (Number.isNaN(scheduledAtDate.getTime())) {
      setFieldErrors({ date: "Ingresa una fecha válida.", time: "Ingresa una hora válida." });
      setError("Revisa la fecha y la hora ingresadas.");
      return;
    }

    setSaving(true);
    setError(null);
    setFieldErrors({});

    try {
      const updated = await updateClinicAppointment(appointment.id, {
        doctorUserId: Number(form.doctorUserId),
        scheduledAt: scheduledAtDate.toISOString(),
        appointmentType: form.appointmentType.trim(),
      });
      await onSaved(updated);
    } catch (requestError: unknown) {
      setFieldErrors(appointmentEditFieldErrors(requestError));
      setError(requestError instanceof Error ? requestError.message : "No pudimos actualizar la cita.");
    } finally {
      setSaving(false);
    }
  }, [appointment.id, doctors.length, doctorsError, doctorsLoading, form, onSaved, saving, selectedDoctorIsAvailable]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar cita"
      description={`${appointment.scheduledDate} · ${appointment.time}`}
      size="md"
      footer={
        <>
          <ModalSecondaryButton onClick={handleClose} disabled={saving}>Cancelar</ModalSecondaryButton>
          <ModalPrimaryButton type="submit" form="edit-appt-form" disabled={!canSubmit}>
            {saving ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Check className="size-3.5" aria-hidden="true" />}
            {saving ? "Guardando..." : "Guardar cambios"}
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <section className="rounded-lg border border-line bg-surface-subtle p-3 text-xs" aria-label="Paciente, solo lectura">
          <p className="text-2xs font-bold text-muted">Paciente</p>
          <p className="mt-1 font-extrabold">{appointment.patient.name ?? "Paciente sin nombre"}</p>
          <p className="mt-0.5 font-mono text-[0.58rem] text-muted">{appointment.patient.patientCode}</p>
          {appointment.patient.phoneNumber ? <p className="mt-0.5 text-[0.6rem] text-ink-secondary">{appointment.patient.phoneNumber}</p> : null}
          <p className="mt-2 text-[0.58rem] text-muted">El paciente no se puede modificar desde este formulario.</p>
        </section>

        <form
          id="edit-appt-form"
          className="space-y-4"
          noValidate
          aria-busy={doctorsLoading || saving}
          onSubmit={handleSubmit}
        >
          {doctorsLoading ? <p className="rounded-lg bg-accent-soft px-3 py-2 text-xs font-semibold text-accent" role="status" aria-live="polite">Cargando médicos disponibles...</p> : null}
          {doctorsError ? <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs font-semibold text-danger" role="alert" aria-live="assertive">{doctorsError} No es posible editar el médico sin una lista autorizada.</p> : null}
          {!doctorsLoading && !doctorsError && doctors.length === 0 ? <p className="rounded-lg bg-warning-soft px-3 py-2 text-xs font-semibold text-warning" role="alert" aria-live="assertive">No hay médicos activos disponibles para asignar esta cita. No se puede guardar una edición.</p> : null}

          {!doctorsLoading && !doctorsError && doctors.length > 0 ? (
            <ModalSelect
              id="edit-appt-doctor"
              label="Médico"
              options={doctorOptions}
              value={form.doctorUserId}
              onChange={(value) => updateField("doctorUserId", value)}
              required
              error={doctorError}
            />
          ) : null}

          <ModalGrid>
            <ModalField id="edit-appt-date" label="Fecha" type="date" value={form.date} onChange={(event) => updateField("date", event.target.value)} required error={fieldErrors.date} />
            <ModalField id="edit-appt-time" label="Hora" type="time" value={form.time} onChange={(event) => updateField("time", event.target.value)} required error={fieldErrors.time} />
          </ModalGrid>

          <ModalField id="edit-appt-type" label="Tipo de cita" value={form.appointmentType} onChange={(event) => updateField("appointmentType", event.target.value)} required error={fieldErrors.appointmentType} />

          {error ? <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs font-bold text-danger" id="edit-appt-form-error" role="alert" aria-live="assertive">{error}</p> : null}
        </form>
      </div>
    </Modal>
  );
}

function CreateAppointmentModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (appointment: ClinicAppointment) => void;
}) {
  const [doctors, setDoctors] = useState<ClinicTeamMember[]>([]);
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState<ClinicPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<ClinicPatient | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [doctorUserId, setDoctorUserId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [appointmentType, setAppointmentType] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load doctors when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    getClinicMembers(controller.signal)
      .then((members) => {
        const doctorMembers = members.filter((m) => m.role === "doctor");
        setDoctors(doctorMembers);
        if (doctorMembers.length > 0) setDoctorUserId(String(doctorMembers[0].id));
      })
      .catch(() => { /* non-blocking */ });
    return () => controller.abort();
  }, [isOpen]);

  // Debounced patient search
  useEffect(() => {
    if (!patientQuery.trim() || selectedPatient) return;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      getClinicPatients(patientQuery, 1)
        .then((page) => { setPatientResults(page.patients.slice(0, 8)); setShowDropdown(true); })
        .catch(() => { /* non-blocking */ });
    }, 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [patientQuery, selectedPatient]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !doctorUserId || !date || !time || !appointmentType.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      const created = await createClinicAppointment({
        patientProfileId: selectedPatient.id,
        doctorUserId: Number(doctorUserId),
        scheduledAt,
        appointmentType: appointmentType.trim(),
        notes: notes.trim() || null,
      });
      onCreated(created);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear la cita.");
    } finally {
      setSaving(false);
    }
  }, [selectedPatient, doctorUserId, date, time, appointmentType, notes, onCreated]);

  const doctorOptions = doctors.map((d) => ({
    value: String(d.id),
    label: d.specialty ? `${d.name} — ${d.specialty}` : d.name,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva cita"
      description="Registra una cita para un paciente"
      size="md"
      footer={
        <>
          <ModalSecondaryButton onClick={onClose}>Cancelar</ModalSecondaryButton>
          <ModalPrimaryButton
            disabled={saving || !selectedPatient || !doctorUserId || !date || !time || !appointmentType.trim()}
            onClick={() => { document.getElementById("create-appt-form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true })); }}
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
            {saving ? "Guardando..." : "Crear cita"}
          </ModalPrimaryButton>
        </>
      }
    >
      <form id="create-appt-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Patient search */}
        <div className="grid min-w-0 gap-1.5">
          <label className="text-2xs font-bold text-muted" htmlFor="appt-patient-search">
            Paciente <span className="ml-0.5 text-danger">*</span>
          </label>
          {selectedPatient ? (
            <div className="flex items-center justify-between rounded-lg border border-accent bg-accent-soft px-3 py-2 text-xs">
              <div>
                <span className="font-extrabold">{selectedPatient.name}</span>
                <span className="ml-2 font-mono text-[0.58rem] text-muted">{selectedPatient.patientCode}</span>
              </div>
              <button type="button" className="text-muted hover:text-danger" aria-label="Quitar paciente seleccionado" onClick={() => { setSelectedPatient(null); setPatientQuery(""); }}>
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                id="appt-patient-search"
                className="h-10 w-full rounded-lg border border-line bg-surface-input px-3 text-xs font-medium text-ink outline-none transition-colors focus:border-accent focus:bg-surface focus:ring-3 focus:ring-focus/40"
                placeholder="Buscar por nombre o código..."
                value={patientQuery}
                onChange={(e) => {
                  setPatientQuery(e.target.value);
                  setPatientResults([]);
                  setShowDropdown(false);
                }}
                autoComplete="off"
              />
              {showDropdown && patientResults.length > 0 ? (
                <ul className="absolute z-50 mt-1 w-full rounded-lg border border-line bg-surface shadow-lg">
                  {patientResults.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-surface-hover"
                        onClick={() => { setSelectedPatient(p); setPatientQuery(p.name ?? ""); setShowDropdown(false); }}
                      >
                        <span className="font-extrabold">{p.name ?? "Sin nombre"}</span>
                        <span className="font-mono text-[0.58rem] text-muted">{p.patientCode}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </div>

        {/* Doctor */}
        {doctorOptions.length > 0 ? (
          <ModalSelect
            id="appt-doctor"
            label="Médico"
            options={doctorOptions}
            value={doctorUserId}
            onChange={setDoctorUserId}
            required
          />
        ) : (
          <ModalField id="appt-doctor-id" label="ID del médico" value={doctorUserId} onChange={(e) => setDoctorUserId(e.target.value)} required />
        )}

        <ModalGrid>
          <ModalField id="appt-date" label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <ModalField id="appt-time" label="Hora" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </ModalGrid>

        <ModalField id="appt-type" label="Tipo de cita" placeholder="Ej. Consulta general" value={appointmentType} onChange={(e) => setAppointmentType(e.target.value)} required />

        <ModalTextarea id="appt-notes" label="Notas" placeholder="Motivo u observaciones (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />

        {error ? <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs font-bold text-danger">{error}</p> : null}
      </form>
    </Modal>
  );
}

export function ClinicAgenda() {
  const [view, setView] = useState<ViewMode>("Semana");
  const [weekOffset, setWeekOffset] = useState(0);
  const [appointments, setAppointments] = useState<ClinicAppointment[]>([]);
  const [blocks, setBlocks] =  useState<ClinicScheduleBlock[]>([]);
  const [isBlockModalOpen, setIsBlockModalOpen] =  useState(false);
  const [summary, setSummary] = useState<ClinicAppointmentSummary>({ todayTotal: 0, confirmed: 0, pending: 0, waiting: 0, inConsultation: 0, noShow: 0, canceled: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // Appointment detail modal
  const [selectedAppointment, setSelectedAppointment] = useState<ClinicAppointment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // Create appointment modal
  const [createOpen, setCreateOpen] = useState(false);
  const weekStart = useMemo(() => addDays(startOfWeek(new Date()), weekOffset * 7), [weekOffset]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const from = dateKey(days[0]);
  const to = dateKey(days[6]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedAppointment, setSelectedAppointment] =
  useState<ClinicAppointment | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getClinicAppointments(from, to, controller.signal)
    
      .then((result) => { setAppointments(result.appointments); setSummary(result.summary); })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setNotice(error instanceof Error ? error.message : "No pudimos cargar la agenda.");
      })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [from, to,refreshKey]);
  
  useEffect(() => {
    const controller = new AbortController();

    getClinicScheduleBlocks(from, to, controller.signal)
      .then((result) => {
        setBlocks(result);
      })
    .catch((error: unknown) => {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      setNotice(
        error instanceof Error
          ? error.message
          : "No pudimos cargar los horarios bloqueados.",
      );
    });

    return () => controller.abort();
  }, [from, to, refreshKey]);

  function showNotice(message: string): void {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2400);
  }

  function changeWeek(offset: number): void {
    setIsLoading(true);
    setWeekOffset((currentOffset) => currentOffset + offset);
  }

  function goToCurrentWeek(): void {
    if (weekOffset === 0) return;
    setIsLoading(true);
    setWeekOffset(0);
  }

  async function handleAppointmentSaved(updated: ClinicAppointment): Promise<void> {
    setIsLoading(true);

    try {
      const result = await getClinicAppointments(from, to);
      setAppointments(result.appointments);
      setSummary(result.summary);
      showNotice("Cita actualizada correctamente.");
    } catch {
      const previousAppointment = selectedAppointment;
      setAppointments((currentAppointments) => {
        const withoutUpdated = currentAppointments.filter((current) => current.id !== updated.id);
        if (!isDateInRange(updated.scheduledDate, from, to)) return withoutUpdated;

        return [...withoutUpdated, updated].sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt));
      });

      if (previousAppointment && previousAppointment.scheduledDate !== updated.scheduledDate) {
        const today = dateKey(new Date());
        setSummary((currentSummary) => ({
          ...currentSummary,
          todayTotal: currentSummary.todayTotal
            - (previousAppointment.scheduledDate === today ? 1 : 0)
            + (updated.scheduledDate === today ? 1 : 0),
        }));
      }

      showNotice("Cita actualizada, pero no pudimos recargar la agenda visible.");
    } finally {
      setIsLoading(false);
      setEditOpen(false);
      setDetailOpen(false);
      setSelectedAppointment(null);
    }
  }

  const upcoming = appointments.slice(0, 5);
  const doctors = [...new Map(appointments.filter((appointment) => appointment.doctor).map((appointment) => [appointment.doctor?.id, appointment.doctor])).values()];
  const period = formatRange(days[0], days[6]);

  return (
    <>
    <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7">
      {notice ? <div className="fixed right-4 bottom-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl bg-ink px-4 py-3 text-xs font-bold text-white shadow-xl" role="status"><Check className="size-4 text-success" aria-hidden="true" />{notice}</div> : null}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-accent uppercase">Recepción · agenda</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Agenda de Recepción</h1><p className="mt-1 text-xs text-muted">Organiza citas, llegadas y flujo de pacientes en tiempo real.</p></div><div className="flex flex-wrap gap-2"><button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-extrabold hover:bg-surface-hover" type="button" onClick={() => showNotice("Selecciona un bloque en el calendario para bloquearlo.")}><Lock className="size-3.5" aria-hidden="true" />Bloquear horario</button><button className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent px-4 text-xs font-extrabold text-white shadow-sm hover:bg-accent-hover" type="button" onClick={() => setCreateOpen(true)}><Plus className="size-3.5" aria-hidden="true" />Nueva cita</button></div></header>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de citas"><MetricCard icon={CalendarDays} label="Citas de hoy" value={summary.todayTotal} helper={`${appointments.length} en el periodo visible`} tone="bg-accent-soft text-accent" /><MetricCard icon={CalendarCheck} label="Confirmadas" value={summary.confirmed} helper="Listas para atención" tone="bg-success-soft text-success" /><MetricCard icon={Clock3} label="En espera" value={summary.waiting} helper="Pendientes de llegada" tone="bg-warning-soft text-warning" /><MetricCard icon={X} label="Canceladas" value={summary.canceled} helper={`${summary.noShow} no asistieron`} tone="bg-danger-soft text-danger" /></section>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 space-y-4">
          <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.3rem_1rem_rgb(16_27_51/4%)]" aria-labelledby="calendar-title">
            <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-3"><div className="flex gap-1"><button className="grid size-8 place-items-center rounded-lg border border-line text-muted hover:bg-surface-hover" type="button" aria-label="Semana anterior" onClick={() => changeWeek(-1)}><ChevronLeft className="size-4" aria-hidden="true" /></button><button className="grid size-8 place-items-center rounded-lg border border-line text-muted hover:bg-surface-hover" type="button" aria-label="Semana siguiente" onClick={() => changeWeek(1)}><ChevronRight className="size-4" aria-hidden="true" /></button></div><h2 className="text-xs font-extrabold" id="calendar-title">{period}</h2><button className="ml-auto min-h-8 rounded-lg border border-line px-3 text-2xs font-bold text-accent hover:bg-accent-soft" type="button" onClick={goToCurrentWeek}>Hoy</button><div className="order-first flex rounded-lg bg-surface-subtle p-1 sm:order-none sm:ml-2">{(["Día", "Semana", "Mes"] as const).map((mode) => <button className={`min-h-7 rounded-md px-3 text-[0.62rem] font-bold ${view === mode ? "bg-surface text-accent shadow-sm" : "text-muted"}`} type="button" key={mode} onClick={() => setView(mode)}>{mode}</button>)}</div></div>
            {isLoading ? <div className="grid min-h-125 place-items-center text-xs font-bold text-muted">Cargando agenda…</div> : view === "Semana" ? <WeekCalendar days={days} appointments={appointments} onAppointmentClick={(a) => { setSelectedAppointment(a); setDetailOpen(true); }} /> : <div className="grid min-h-125 place-items-center p-8 text-center"><div><CalendarDays className="mx-auto size-10 text-accent" aria-hidden="true" /><p className="mt-3 text-sm font-extrabold">Vista de {view.toLowerCase()}</p><p className="mt-1 max-w-sm text-xs text-muted">{view === "Día" ? "Selecciona Semana para ver los horarios de toda la clínica." : "La información mensual se alimenta de las citas registradas."}</p><button className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-xs font-bold text-accent" type="button" onClick={() => setView("Semana")}>Volver a semana</button></div></div>}
          </section>

          <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.3rem_1rem_rgb(16_27_51/4%)]" aria-labelledby="appointments-list-title"><div className="flex items-center justify-between border-b border-line px-4 py-3"><div><h2 className="text-xs font-extrabold" id="appointments-list-title">Citas del periodo</h2><p className="mt-0.5 text-[0.6rem] text-muted">Datos sincronizados con la agenda clínica.</p></div><span className="rounded-full bg-surface-subtle px-2 py-1 text-[0.58rem] font-bold text-muted">{appointments.length} registradas</span></div><div className="overflow-x-auto"><table className="w-full min-w-180 text-left"><thead className="bg-surface-subtle text-[0.56rem] font-bold uppercase tracking-wide text-muted"><tr><th className="px-3 py-2" scope="col">Hora</th><th className="px-3 py-2" scope="col">Paciente</th><th className="px-3 py-2" scope="col">Médico</th><th className="px-3 py-2" scope="col">Tipo</th><th className="px-3 py-2" scope="col">Estado</th></tr></thead><tbody className="divide-y divide-line">{appointments.map((appointment) => <tr className="text-[0.62rem]" key={appointment.id}><td className="px-3 py-2.5 font-mono font-bold">{new Date(`${appointment.scheduledDate}T12:00:00`).toLocaleDateString("es-PE", { weekday: "short", day: "numeric" })} · {appointment.time}</td><th className="px-3 py-2.5 font-normal" scope="row"><span className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-full bg-accent-soft font-mono text-[0.5rem] font-bold text-accent">{initials(appointment.patient.name ?? "Paciente")}</span><span className="font-extrabold">{appointment.patient.name ?? "Paciente sin nombre"}</span></span></th><td className="px-3 py-2.5 font-semibold text-ink-secondary">{appointment.doctor?.name ?? "Sin asignar"}</td><td className="px-3 py-2.5 text-ink-secondary">{appointment.appointmentType}</td><td className="px-3 py-2.5"><span className={`rounded-full border px-2 py-1 text-[0.52rem] font-extrabold ${statusStyles[appointment.status]}`}>{appointment.statusLabel}</span></td></tr>)}</tbody></table>{!isLoading && appointments.length === 0 ? <p className="px-4 py-8 text-center text-xs font-semibold text-muted">No hay citas en este periodo.</p> : null}</div></section>
        </div>

        <aside className="grid gap-3"><section className="rounded-xl border border-line bg-surface p-4"><div className="flex items-center justify-between"><h2 className="text-xs font-extrabold">Próximas citas</h2><span className="text-[0.6rem] font-bold text-accent">{upcoming.length}</span></div><ol className="mt-3 divide-y divide-line">{upcoming.map((appointment) => <li className="grid grid-cols-[2.5rem_1fr] gap-2 py-2.5" key={`upcoming-${appointment.id}`}><time className="font-mono text-[0.65rem] font-bold">{appointment.time}</time><div><p className="truncate text-[0.62rem] font-extrabold">{appointment.patient.name ?? "Paciente"}</p><p className="mt-0.5 text-[0.55rem] text-muted">{appointment.doctor?.name ?? "Sin médico"}</p><span className={`mt-1 inline-flex items-center gap-1 text-[0.52rem] font-bold ${appointment.status === "confirmed" ? "text-success" : appointment.status === "waiting" ? "text-warning" : "text-accent"}`}><span className="size-1 rounded-full bg-current" />{appointment.statusLabel}</span></div></li>)}</ol>{upcoming.length === 0 ? <p className="mt-3 text-[0.62rem] text-muted">No hay próximas citas.</p> : null}</section><section className="rounded-xl border border-line bg-surface p-4"><div className="flex items-center justify-between"><h2 className="text-xs font-extrabold">Disponibilidad médica</h2><UserRound className="size-4 text-accent" aria-hidden="true" /></div><ul className="mt-3 grid gap-2.5">{doctors.map((doctor) => <li className="flex items-center gap-2" key={doctor?.id}><span className="grid size-7 place-items-center rounded-full bg-accent-soft font-mono text-[0.55rem] font-bold text-accent">{initials(doctor?.name ?? "")}</span><span className="min-w-0 flex-1 truncate text-[0.6rem] font-extrabold">{doctor?.name}</span><span className="size-1.5 rounded-full bg-success" title="Con citas registradas" /></li>)}</ul>{doctors.length === 0 ? <p className="mt-3 text-[0.62rem] text-muted">Sin médicos con agenda registrada.</p> : null}</section><section className="rounded-xl border border-line bg-surface p-4"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-violet-soft text-violet"><ShieldCheck className="size-4" aria-hidden="true" /></span><h2 className="text-xs font-extrabold">Resumen de estado</h2></div><div className="mt-3 rounded-lg bg-success-soft p-3"><p className="text-[0.62rem] font-extrabold text-success">Agenda sincronizada</p><p className="mt-1 text-[0.56rem] leading-relaxed text-success/80">El backend devolvió los datos del periodo seleccionado.</p></div><div className="mt-3"><SummaryList summary={summary} /></div></section></aside>
      </div>

      {detailOpen && selectedAppointment ? (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          isOpen={detailOpen}
          onClose={() => { setDetailOpen(false); setSelectedAppointment(null); }}
          onEdit={() => { setDetailOpen(false); setEditOpen(true); }}
          onStatusChanged={(updated) => {
            setAppointments((prev) => prev.map((a) => a.id === updated.id ? updated : a));
            setDetailOpen(false);
            setSelectedAppointment(null);
            showNotice("Estado de la cita actualizado.");
          }}
        />
      ) : null}

      {editOpen && selectedAppointment ? (
        <EditAppointmentModal
          appointment={selectedAppointment}
          isOpen={editOpen}
          onClose={() => { setEditOpen(false); setSelectedAppointment(null); }}
          onSaved={handleAppointmentSaved}
        />
      ) : null}

      {createOpen ? (
        <CreateAppointmentModal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={(created) => {
            setAppointments((prev) => [...prev, created]);
            setCreateOpen(false);
            showNotice("Cita creada correctamente.");
          }}
        />
      ) : null}
    </div>

    <ClinicAppointmentCreateModal
      open={isCreateModalOpen}
      onClose={() => setIsCreateModalOpen(false)}
      onCreated={() => {
        setIsCreateModalOpen(false);
        setIsLoading(true);
        setRefreshKey((current) => current + 1);
        showNotice("Cita registrada correctamente.");
      }}
    />
    <ClinicScheduleBlockCreateModal
      open={isBlockModalOpen}
      onClose={() => setIsBlockModalOpen(false)}
      onCreated={() => {
        setIsBlockModalOpen(false);
        setRefreshKey((current) => current + 1);
        showNotice(
          "Horario bloqueado correctamente.",
        );
      }}
    />
  </>
);
}
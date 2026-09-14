"use client";

import {
  CalendarCheck2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  HeartPulse,
  Pencil,
  Plus,
  Save,
  Video,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  cancelDoctorAppointment,
  createDoctorAppointment,
  getDoctorAppointments,
  getDoctorAvailability,
  getDoctorEpidemiology,
  getDoctorPatients,
  updateDoctorAppointment,
  updateDoctorAppointmentStatus,
  type DoctorAppointment,
  type DoctorAppointmentStatus,
  type DoctorAvailability,
  type DoctorAppointmentSummary,
  type DoctorEpidemiology,
  type DoctorPatient,
} from "@/features/doctors/api/doctor-clinical";
import { DoctorAvatar, DoctorCard, MetricCard, SectionHeading, StatusBadge } from "@/features/doctors/ui/doctor-primitives";
import { Spinner } from "@/shared/ui/spinner";

const timeFormatter = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" });
const WEEK_DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const EMPTY_SUMMARY: DoctorAppointmentSummary = {
  today_total: 0,
  confirmed: 0,
  pending: 0,
  waiting: 0,
  in_consultation: 0,
  completed: 0,
  no_show: 0,
  canceled: 0,
};

const FILTERS: Array<{ value: "all" | DoctorAppointmentStatus; label: string }> = [
  { value: "all", label: "Todas las consultas" },
  { value: "pending", label: "Pendientes" },
  { value: "confirmed", label: "Confirmadas" },
  { value: "in_consultation", label: "En atención" },
  { value: "completed", label: "Completadas" },
  { value: "canceled", label: "Canceladas" },
];

type AppointmentFormState = {
  patientId: string;
  date: string;
  time: string;
  type: string;
  notes: string;
};

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayAtNoon(): Date {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

function formatDateLabel(date: Date): string {
  return `${WEEK_DAYS[date.getDay()]}, ${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
}

function shiftDate(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 12);
}

function initialsOf(name: string | null | undefined): string {
  return (name ?? "Paciente").split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "PA";
}

function statusTone(status: DoctorAppointmentStatus): "blue" | "green" | "orange" | "red" | "violet" | "slate" {
  switch (status) {
    case "confirmed":
      return "green";
    case "pending":
      return "orange";
    case "waiting":
    case "in_consultation":
      return "blue";
    case "completed":
      return "violet";
    case "canceled":
    case "no_show":
      return "red";
    default:
      return "slate";
  }
}

function formatTime(appointment: DoctorAppointment): string {
  if (appointment.scheduledAt) {
    const date = new Date(appointment.scheduledAt);
    if (!Number.isNaN(date.getTime())) return timeFormatter.format(date);
  }
  return appointment.time ?? "—";
}

function formFromAppointment(appointment: DoctorAppointment): AppointmentFormState {
  const date = appointment.scheduledAt ? new Date(appointment.scheduledAt) : new Date();
  return {
    patientId: String(appointment.patient.id),
    date: dateKey(date),
    time: appointment.time ?? "09:00",
    type: appointment.appointmentType,
    notes: appointment.notes ?? "",
  };
}

function emptyForm(date: Date, patientId = ""): AppointmentFormState {
  return { patientId, date: dateKey(date), time: "09:00", type: "consultation", notes: "" };
}

function nextAppointmentStatus(status: DoctorAppointmentStatus): { value: DoctorAppointmentStatus; label: string } | null {
  switch (status) {
    case "pending": return { value: "confirmed", label: "Confirmar" };
    case "confirmed": return { value: "waiting", label: "Poner en espera" };
    case "waiting": return { value: "in_consultation", label: "Iniciar atención" };
    case "in_consultation": return { value: "completed", label: "Completar" };
    default: return null;
  }
}

export default function DoctorAgendaPage() {
  const [selectedDate, setSelectedDate] = useState(todayAtNoon);
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [summary, setSummary] = useState<DoctorAppointmentSummary>(EMPTY_SUMMARY);
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [filter, setFilter] = useState<"all" | DoctorAppointmentStatus>("all");
  const [loading, setLoading] = useState(true);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [availability, setAvailability] = useState<DoctorAvailability | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [epidemiology, setEpidemiology] = useState<DoctorEpidemiology | null>(null);
  const [epidemiologyLoading, setEpidemiologyLoading] = useState(true);
  const [epidemiologyError, setEpidemiologyError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<DoctorAppointment | null>(null);
  const [form, setForm] = useState<AppointmentFormState>(() => emptyForm(todayAtNoon()));

  const loadAppointments = useCallback(async (signal?: AbortSignal): Promise<void> => {
    try {
      const result = await getDoctorAppointments(dateKey(selectedDate), dateKey(selectedDate), signal);
      setAppointments(result.appointments);
      setSummary(result.summary);
      setError(null);
    } catch (caught: unknown) {
      if (!(caught instanceof DOMException && caught.name === "AbortError")) {
        setError(caught instanceof Error ? caught.message : "No pudimos cargar la agenda.");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    const controller = new AbortController();
    getDoctorAppointments(dateKey(selectedDate), dateKey(selectedDate), controller.signal)
      .then((result) => {
        setAppointments(result.appointments);
        setSummary(result.summary);
        setError(null);
      })
      .catch((caught: unknown) => {
        if (!(caught instanceof DOMException && caught.name === "AbortError")) {
          setError(caught instanceof Error ? caught.message : "No pudimos cargar la agenda.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [selectedDate]);

  useEffect(() => {
    const controller = new AbortController();
    getDoctorAvailability(dateKey(selectedDate), controller.signal)
      .then((result) => {
        setAvailability(result);
        setAvailabilityError(null);
      })
      .catch((caught: unknown) => {
        if (!(caught instanceof DOMException && caught.name === "AbortError")) {
          setAvailabilityError(caught instanceof Error ? caught.message : "No pudimos cargar la disponibilidad.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setAvailabilityLoading(false);
      });
    return () => controller.abort();
  }, [selectedDate]);

  useEffect(() => {
    const controller = new AbortController();
    getDoctorPatients(controller.signal)
      .then(setPatients)
      .catch((caught: unknown) => {
        if (!(caught instanceof DOMException && caught.name === "AbortError")) {
          setFormError(caught instanceof Error ? caught.message : "No pudimos cargar los pacientes.");
        }
      })
      .finally(() => setPatientsLoading(false));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getDoctorEpidemiology(controller.signal)
      .then((result) => {
        setEpidemiology(result);
        setEpidemiologyError(null);
      })
      .catch((caught: unknown) => {
        if (!(caught instanceof DOMException && caught.name === "AbortError")) {
          setEpidemiologyError(caught instanceof Error ? caught.message : "No pudimos cargar las fuentes epidemiológicas.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setEpidemiologyLoading(false);
      });
    return () => controller.abort();
  }, []);

  const visibleAppointments = useMemo(
    () => filter === "all" ? appointments : appointments.filter((appointment) => appointment.status === filter),
    [appointments, filter],
  );

  const teleconsultations = useMemo(
    () => appointments.filter((appointment) => appointment.appointmentType.toLowerCase().includes("tele")).length,
    [appointments],
  );

  const formattedSelectedDate = useMemo(() => formatDateLabel(selectedDate), [selectedDate]);
  const formattedTimes = useMemo(
    () => new Map(appointments.map((appointment) => [appointment.id, formatTime(appointment)])),
    [appointments],
  );
  const upcomingAppointments = useMemo(
    () => appointments.filter((appointment) => !["canceled", "completed", "no_show"].includes(appointment.status)).slice(0, 3),
    [appointments],
  );
  const hasUpcomingAppointments = upcomingAppointments.length > 0;

  function openCreateForm(): void {
    setEditingAppointment(null);
    setForm(emptyForm(selectedDate, patients[0] ? String(patients[0].id) : ""));
    setFormError(null);
    setFormOpen(true);
  }

  function chooseDate(date: Date): void {
    setLoading(true);
    setAvailabilityLoading(true);
    setSelectedDate(date);
  }

  function openEditForm(appointment: DoctorAppointment): void {
    setEditingAppointment(appointment);
    setForm(formFromAppointment(appointment));
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true);
    setFormError(null);

    if (!form.patientId && !editingAppointment) {
      setFormError("Selecciona un paciente.");
      setPending(false);
      return;
    }

    const scheduledAt = new Date(`${form.date}T${form.time}:00`);
    if (Number.isNaN(scheduledAt.getTime())) {
      setFormError("Selecciona una fecha y hora válidas.");
      setPending(false);
      return;
    }

    try {
      if (editingAppointment) {
        const updated = await updateDoctorAppointment(editingAppointment.id, {
          scheduled_at: scheduledAt.toISOString(),
          appointment_type: form.type.trim() || "consultation",
          notes: form.notes.trim() || null,
        });
        setAppointments((current) => current.map((appointment) => appointment.id === updated.id ? updated : appointment));
      } else {
        const created = await createDoctorAppointment({
          patient_profile_id: Number(form.patientId),
          scheduled_at: scheduledAt.toISOString(),
          appointment_type: form.type.trim() || "consultation",
          notes: form.notes.trim() || null,
        });
        if (created.scheduledDate === dateKey(selectedDate)) {
          setAppointments((current) => [...current, created].sort((left, right) => (left.scheduledAt ?? "").localeCompare(right.scheduledAt ?? "")));
        }
      }
      setFormOpen(false);
      setLoading(true);
      await loadAppointments();
    } catch (caught: unknown) {
      setFormError(caught instanceof Error ? caught.message : "No pudimos guardar la cita.");
    } finally {
      setPending(false);
    }
  }

  async function handleCancel(appointment: DoctorAppointment): Promise<void> {
    if (!window.confirm(`¿Cancelar la cita de ${appointment.patient.name ?? "este paciente"}?`)) return;
    setPending(true);
    setError(null);
    try {
      const canceled = await cancelDoctorAppointment(appointment.id);
      setAppointments((current) => current.map((item) => item.id === canceled.id ? canceled : item));
      setLoading(true);
      await loadAppointments();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "No pudimos cancelar la cita.");
    } finally {
      setPending(false);
    }
  }

  async function handleStatusChange(appointment: DoctorAppointment, status: DoctorAppointmentStatus): Promise<void> {
    setPending(true);
    setError(null);
    try {
      const updated = await updateDoctorAppointmentStatus(appointment.id, status);
      setAppointments((current) => current.map((item) => item.id === updated.id ? updated : item));
      setLoading(true);
      await loadAppointments();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "No pudimos actualizar el estado de la cita.");
    } finally {
      setPending(false);
    }
  }

  const metrics = [
    { label: "Consultas hoy", value: String(summary.today_total), icon: CalendarDays, tone: "blue" as const },
    { label: "Confirmadas", value: String(summary.confirmed), icon: CalendarCheck2, tone: "green" as const },
    { label: "Pendientes", value: String(summary.pending), icon: Clock3, tone: "orange" as const },
    { label: "Teleconsultas", value: String(teleconsultations), icon: Video, tone: "violet" as const },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.65rem]">Agenda Médica</h1>
          <p className="mt-1 text-[0.68rem] font-bold text-ink-secondary">Organiza tus consultas y gestiona tu horario de atención.</p>
        </div>
        <button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-accent px-3.5 text-[0.65rem] font-extrabold text-white shadow-[0_5px_14px_rgb(8_98_221/18%)] hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus" type="button" onClick={openCreateForm}>
          <Plus className="size-3.5" aria-hidden="true" />Nueva Consulta
        </button>
      </header>

      {error ? <div className="mb-4 rounded-lg border border-danger/30 bg-danger-soft px-4 py-3" role="alert"><p className="text-xs font-bold text-danger">{error}</p></div> : null}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Resumen de agenda">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]" aria-label="Agenda del día">
        <DoctorCard className="min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 sm:px-5">
            <button className="grid size-8 place-items-center rounded-lg border border-line text-ink-secondary hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Día anterior" onClick={() => chooseDate(shiftDate(selectedDate, -1))}><ChevronLeft className="size-4" aria-hidden="true" /></button>
            <button className="grid size-8 place-items-center rounded-lg border border-line text-ink-secondary hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Ir a hoy" onClick={() => chooseDate(todayAtNoon())}><CalendarDays className="size-3.5" aria-hidden="true" /></button>
            <strong className="mx-1 text-[0.67rem] font-extrabold capitalize sm:mx-2">{formattedSelectedDate}</strong>
            <button className="grid size-8 place-items-center rounded-lg border border-line text-ink-secondary hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Día siguiente" onClick={() => chooseDate(shiftDate(selectedDate, 1))}><ChevronRight className="size-4" aria-hidden="true" /></button>
            <button className="rounded-lg border border-accent/15 bg-accent-soft px-3 py-2 text-[0.62rem] font-extrabold text-accent focus-visible:outline-3 focus-visible:outline-focus" type="button" onClick={() => chooseDate(todayAtNoon())}>Hoy</button>
            <label className="ml-auto flex items-center gap-2 text-[0.6rem] font-extrabold text-ink-secondary">
              <Filter className="size-3.5" aria-hidden="true" />
              <span className="sr-only">Filtrar agenda</span>
              <select className="rounded-lg border border-line bg-surface px-2 py-2 text-[0.6rem] font-extrabold text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" value={filter} onChange={(event) => setFilter(event.target.value as "all" | DoctorAppointmentStatus)} aria-label="Filtrar agenda">
                {FILTERS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>
          <div className="px-4 pb-3 pt-3 sm:px-5">
            <p className="mb-2 text-[0.65rem] font-extrabold">Agenda del día</p>
            {loading ? (
              <div className="grid min-h-48 place-items-center rounded-lg border border-line"><p className="flex items-center gap-2 text-xs font-bold text-muted" aria-busy="true"><Spinner className="size-4" />Cargando agenda…</p></div>
            ) : visibleAppointments.length === 0 ? (
              <div className="grid min-h-48 place-items-center rounded-lg border border-line px-6 text-center"><p className="text-xs font-bold text-ink-secondary">No hay citas para este día y filtro.</p></div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full min-w-[780px] border-collapse text-left">
                  <caption className="sr-only">Citas programadas para {formattedSelectedDate}</caption>
                  <thead><tr className="border-b border-line bg-surface-subtle text-[0.56rem] font-extrabold text-ink-secondary"><th className="w-20 px-3 py-2.5 font-extrabold">Hora</th><th className="px-3 py-2.5 font-extrabold">Paciente</th><th className="w-32 px-3 py-2.5 font-extrabold">Tipo</th><th className="w-28 px-3 py-2.5 font-extrabold">Estado</th><th className="w-28 px-3 py-2.5 font-extrabold">Acciones</th></tr></thead>
                   <tbody>{visibleAppointments.map((appointment) => <tr className="border-b border-line last:border-0 hover:bg-surface-subtle" key={appointment.id}>
                    <td className="px-3 py-2.5 align-middle font-mono text-[0.64rem] font-extrabold">{formattedTimes.get(appointment.id) ?? "—"}</td>
                    <td className="px-3 py-2.5"><div className="flex items-center gap-2.5"><DoctorAvatar initials={initialsOf(appointment.patient.name)} tone={appointment.id % 2 === 0 ? "blue" : "orange"} size="md" /><div><p className="text-[0.63rem] font-extrabold">{appointment.patient.name ?? "Paciente"}</p><p className="mt-0.5 text-[0.55rem] font-bold text-ink-secondary">{appointment.patient.patientCode}</p></div></div></td>
                    <td className="px-3 py-2.5"><StatusBadge tone={appointment.appointmentType.toLowerCase().includes("tele") ? "blue" : "slate"}>{appointment.appointmentType}</StatusBadge></td>
                    <td className="px-3 py-2.5"><StatusBadge tone={statusTone(appointment.status)}>{appointment.statusLabel}</StatusBadge></td>
                    <td className="px-3 py-2.5"><div className="flex items-center gap-1.5"><button className="grid size-7 place-items-center rounded-md border border-line text-ink-secondary hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label={`Editar cita de ${appointment.patient.name ?? "paciente"}`} onClick={() => openEditForm(appointment)}><Pencil className="size-3" aria-hidden="true" /></button>{!(["completed", "canceled", "no_show"] as DoctorAppointmentStatus[]).includes(appointment.status) ? <button className="grid size-7 place-items-center rounded-md border border-danger/20 text-danger hover:bg-danger-soft focus-visible:outline-3 focus-visible:outline-focus disabled:opacity-60" type="button" aria-label={`Cancelar cita de ${appointment.patient.name ?? "paciente"}`} disabled={pending} onClick={() => void handleCancel(appointment)}><X className="size-3" aria-hidden="true" /></button> : null}</div></td>
                   </tr>)}</tbody>
                 </table>
                 {visibleAppointments.some((appointment) => nextAppointmentStatus(appointment.status) !== null) ? <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-accent/15 bg-accent-soft px-3 py-2"><span className="text-[0.56rem] font-extrabold text-ink-secondary">Avanzar estado:</span>{visibleAppointments.map((appointment) => { const nextStatus = nextAppointmentStatus(appointment.status); return nextStatus ? <button className="rounded-md border border-accent/20 bg-surface px-2 py-1 text-[0.54rem] font-extrabold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus disabled:opacity-60" key={appointment.id} type="button" disabled={pending} onClick={() => void handleStatusChange(appointment, nextStatus.value)}>{appointment.patient.name ?? "Paciente"}: {nextStatus.label}</button> : null; })}</div> : null}
               </div>
             )}
          </div>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-[0.59rem] font-bold text-ink-secondary sm:px-5"><span>Mostrando {visibleAppointments.length} de {appointments.length} citas</span><span>{summary.period_total ?? appointments.length} en el período</span></footer>
        </DoctorCard>

        <aside className="grid gap-4">
          <DoctorCard className="p-4"><SectionHeading title="Próximas consultas" action="Agenda del día" /><ul className="mt-3 divide-y divide-line">{upcomingAppointments.map((appointment) => <li className="flex items-center gap-2.5 py-2.5 first:pt-0 last:pb-0" key={appointment.id}><DoctorAvatar initials={initialsOf(appointment.patient.name)} tone={appointment.id % 2 === 0 ? "blue" : "orange"} size="sm" /><span className="min-w-0 flex-1"><span className="block text-[0.6rem] font-extrabold">{formattedTimes.get(appointment.id) ?? "—"}</span><span className="mt-0.5 block truncate text-[0.61rem] font-extrabold">{appointment.patient.name ?? "Paciente"}</span></span><StatusBadge tone={statusTone(appointment.status)}>{appointment.statusLabel}</StatusBadge></li>)}{!hasUpcomingAppointments ? <li className="py-3 text-xs font-bold text-ink-secondary">No hay próximas consultas.</li> : null}</ul></DoctorCard>
           <DoctorCard className="p-4"><div className="flex items-center justify-between gap-3"><div><h2 className="text-[0.82rem] font-extrabold">Disponibilidad del día</h2><p className="mt-1 text-[0.58rem] font-bold text-ink-secondary">Horario configurado y espacios libres.</p></div><CalendarDays className="size-4 text-accent" aria-hidden="true" /></div>{availabilityLoading ? <p className="mt-4 text-xs font-bold text-muted" aria-busy="true">Cargando disponibilidad…</p> : availabilityError ? <p className="mt-4 text-xs font-bold text-danger" role="alert">{availabilityError}</p> : availability?.is_working_day ? <><div className="mt-3 flex items-center justify-between gap-3 text-[0.58rem] font-extrabold"><span>{availability.working_hours?.start} – {availability.working_hours?.end}</span><span className="text-success">{availability.available_slots} libres</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-subtle"><span className="block h-full rounded-full bg-success" style={{ width: `${availability.slots.length === 0 ? 0 : (availability.available_slots / availability.slots.length) * 100}%` }} /></div><p className="mt-3 text-[0.56rem] font-bold text-ink-secondary">{availability.slots.length} bloques de {availability.duration_minutes} min · {summary.period_total ?? appointments.length} citas registradas.</p></> : <p className="mt-4 text-xs font-bold text-ink-secondary">No atiendes este día.</p>}</DoctorCard>
           <DoctorCard className="p-4"><div className="flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-[0.82rem] font-extrabold"><span className="grid size-7 place-items-center rounded-lg bg-violet-soft text-violet"><HeartPulse className="size-4" aria-hidden="true" /></span>IA Epidemiológica</h2><span className={`text-[0.61rem] font-extrabold ${epidemiology?.analysisAvailable ? "text-success" : "text-muted"}`}>{epidemiologyLoading ? "Cargando" : epidemiology?.analysisAvailable ? "Disponible" : "No disponible"}</span></div>{epidemiologyLoading ? <p className="mt-4 text-xs font-bold text-muted" aria-busy="true">Cargando fuentes clínicas…</p> : epidemiologyError ? <p className="mt-4 text-xs font-bold text-danger" role="alert">{epidemiologyError}</p> : epidemiology ? <div className="mt-3 rounded-lg border border-line bg-surface-subtle p-3"><p className="text-[0.57rem] font-bold leading-4 text-ink-secondary">{epidemiology.message}</p><p className="mt-3 text-[0.56rem] font-extrabold text-ink-secondary">Fuentes registradas · últimos {epidemiology.periodDays} días</p><dl className="mt-2 grid grid-cols-2 gap-2 text-[0.56rem]"><div><dt className="font-bold text-ink-secondary">Consultas</dt><dd className="mt-0.5 text-base font-extrabold text-ink">{epidemiology.metrics.consultations}</dd></div><div><dt className="font-bold text-ink-secondary">Laboratorio</dt><dd className="mt-0.5 text-base font-extrabold text-ink">{epidemiology.metrics.laboratoryOrders}</dd></div><div><dt className="font-bold text-ink-secondary">Teleconsultas</dt><dd className="mt-0.5 text-base font-extrabold text-ink">{epidemiology.metrics.teleconsultations}</dd></div><div><dt className="font-bold text-ink-secondary">Recetas</dt><dd className="mt-0.5 text-base font-extrabold text-ink">{epidemiology.metrics.prescriptions}</dd></div></dl></div> : <p className="mt-4 text-xs font-bold text-ink-secondary">No hay información epidemiológica disponible.</p>}</DoctorCard>
        </aside>
      </section>

      {formOpen ? <dialog open className="fixed inset-0 z-50 m-0 grid h-full w-full max-w-none place-items-center bg-ink/35 p-4" onCancel={() => setFormOpen(false)} aria-labelledby="appointment-form-title"><div className="w-full max-w-lg rounded-xl border border-line bg-surface p-5 shadow-2xl"><div className="flex items-center justify-between gap-4"><div><h2 id="appointment-form-title" className="text-base font-extrabold">{editingAppointment ? "Editar cita" : "Nueva consulta"}</h2><p className="mt-1 text-xs font-bold text-ink-secondary">Programa una cita dentro de tu práctica médica.</p></div><button className="grid size-8 place-items-center rounded-lg border border-line text-ink-secondary hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Cerrar formulario" disabled={pending} onClick={() => setFormOpen(false)}><X className="size-4" aria-hidden="true" /></button></div><form className="mt-5 grid gap-3" onSubmit={(event) => void handleSubmit(event)}><label className="grid gap-1 text-xs font-bold text-ink-secondary">Paciente<select className="h-10 rounded-lg border border-line bg-surface-input px-3 text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20 disabled:opacity-60" value={form.patientId} onChange={(event) => setForm((current) => ({ ...current, patientId: event.target.value }))} disabled={Boolean(editingAppointment) || patientsLoading} required><option value="">{patientsLoading ? "Cargando pacientes…" : "Selecciona un paciente"}</option>{patients.map((patient) => <option key={patient.id} value={String(patient.id)}>{patient.name ?? patient.patientCode}</option>)}</select></label><div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1 text-xs font-bold text-ink-secondary">Fecha<input className="h-10 rounded-lg border border-line bg-surface-input px-3 text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} required /></label><label className="grid gap-1 text-xs font-bold text-ink-secondary">Hora<input className="h-10 rounded-lg border border-line bg-surface-input px-3 text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" type="time" value={form.time} onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))} required /></label></div><label className="grid gap-1 text-xs font-bold text-ink-secondary">Tipo de consulta<input className="h-10 rounded-lg border border-line bg-surface-input px-3 text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} maxLength={80} required /></label><label className="grid gap-1 text-xs font-bold text-ink-secondary">Notas<textarea className="min-h-20 rounded-lg border border-line bg-surface-input px-3 py-2 text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} maxLength={500} /></label>{formError ? <p className="text-xs font-bold text-danger" role="alert">{formError}</p> : null}<div className="flex justify-end gap-2 pt-2"><button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-line px-4 text-xs font-extrabold hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus disabled:opacity-60" type="button" disabled={pending} onClick={() => setFormOpen(false)}>Cancelar</button><button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-xs font-extrabold text-white hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus disabled:opacity-60" type="submit" disabled={pending}>{pending ? <Spinner className="size-3.5" /> : <Save className="size-3.5" aria-hidden="true" />}{editingAppointment ? "Guardar cambios" : "Crear consulta"}</button></div></form></div></dialog> : null}
    </div>
  );
}

"use client";

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  FlaskConical,
  HeartPulse,
  Info,
  LoaderCircle,
  Save,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { AuthenticatedUser } from "@/features/auth/model/auth.types";
import {
  getPatientPortalData,
  savePatientTriage,
  updatePatientProfile,
  type PatientAppointment,
  type PatientDashboardData,
  type PatientLaboratoryResult,
  type PatientConsultation,
  type PatientPortalData,
  type PatientPortalView,
  type PatientPrescription,
  type PatientProfile,
  type PatientProfileUpdatePayload,
  type PatientTriage,
  type PatientTriagePayload,
} from "@/features/patients/api/patient-portal";
import { ApiError } from "@/shared/api/http-client";

type LoadState =
  | { status: "loading"; view: PatientPortalView }
  | { status: "error"; view: PatientPortalView; message: string }
  | { status: "success"; view: PatientPortalView; data: PatientPortalData };

function errorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "No pudimos cargar esta información. Inténtalo nuevamente.";
}

type FieldErrorKeys = Readonly<Record<string, readonly string[]>>;

function fieldErrorsFrom(error: unknown, fieldKeys: FieldErrorKeys): Record<string, string> {
  if (!(error instanceof ApiError) || !error.errors) return {};

  return Object.fromEntries(
    Object.entries(fieldKeys).flatMap(([field, keys]) => {
      const message = keys.flatMap((key) => error.errors?.[key] ?? []).join(" ");
      return message ? [[field, message]] : [];
    }),
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <span id={id} className="text-xs font-bold text-danger" role="alert">{message}</span> : null;
}

function usePatientPortalData(view: PatientPortalView): LoadState & { retry: () => void } {
  const [state, setState] = useState<LoadState>({ status: "loading", view });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getPatientPortalData(view, controller.signal)
      .then((data) => setState({ status: "success", view, data }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ status: "error", view, message: errorMessage(error) });
      });

    return () => controller.abort();
  }, [attempt, view]);

  return {
    ...state,
    retry: () => {
      setState({ status: "loading", view });
      setAttempt((current) => current + 1);
    },
  };
}

function formatDate(value: string | null, withTime = false): string {
  if (!value) return "No disponible";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-PE", withTime
    ? { dateStyle: "medium", timeStyle: "short" }
    : { dateStyle: "medium" }).format(date);
}

function formatNumber(value: number | null, suffix = ""): string {
  return value === null ? "No registrado" : `${value}${suffix}`;
}

function appointmentTypeLabel(value: string): string {
  return value.replaceAll("_", " ").replace(/^\w/, (letter) => letter.toUpperCase());
}

function statusClasses(status: string): string {
  if (["active", "confirmed", "completed", "signed", "ready", "reviewed"].includes(status)) {
    return "bg-success-soft text-success";
  }
  if (["canceled", "no_show"].includes(status)) return "bg-danger-soft text-danger";
  if (["urgent", "emergency", "renewal_due", "in_progress", "requested", "pending"].includes(status)) {
    return "bg-warning-soft text-warning";
  }
  return "bg-accent-soft text-accent";
}

function StatusBadge({ label, value }: { label: string; value: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-extrabold ${statusClasses(value)}`}>{label}</span>;
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-line bg-surface p-4 shadow-sm ${className}`}>{children}</section>;
}

function EmptyState({ message }: { message: string }) {
  return <p className="rounded-lg border border-dashed border-line-strong bg-surface-subtle p-4 text-sm text-muted">{message}</p>;
}

function UnavailableState({ title, message }: { title: string; message: string }) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-extrabold text-ink">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">{message}</p>
        </div>
      </div>
    </Card>
  );
}

function PortalLoading() {
  return (
    <div className="patient-page space-y-4" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando información del paciente.</span>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => <div className="h-32 animate-pulse rounded-xl border border-line bg-surface-subtle motion-reduce:animate-none" key={index} aria-hidden="true" />)}
      </div>
    </div>
  );
}

function PortalError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="patient-page" role="alert" aria-live="assertive">
      <Card className="border-danger/40">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-extrabold text-ink">No se pudo cargar la información</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{message}</p>
            <button
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-accent px-4 text-xs font-extrabold text-paper transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus"
              type="button"
              onClick={onRetry}
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function PageIntro({ title, description }: { title: string; description: string }) {
  return (
    <header className="mb-4">
      <h2 className="text-lg font-extrabold tracking-tight text-ink">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
    </header>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof CalendarDays }) {
  return (
    <Card className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><Icon className="size-5" aria-hidden="true" /></span>
      <span className="min-w-0"><strong className="block text-xl font-black text-ink">{value}</strong><span className="block text-xs font-bold text-muted">{label}</span></span>
    </Card>
  );
}

function AppointmentSummary({ appointment }: { appointment: PatientAppointment }) {
  return (
    <div className="rounded-lg border border-line bg-surface-subtle p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-muted">{appointmentTypeLabel(appointment.appointmentType)}</p>
          <h3 className="mt-1 text-base font-extrabold text-ink">{formatDate(appointment.scheduledAt, true)}</h3>
        </div>
        <StatusBadge label={appointment.statusLabel} value={appointment.status} />
      </div>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div><dt className="text-xs font-bold text-muted">Profesional</dt><dd className="font-bold text-ink">{appointment.doctor?.name ?? "No asignado"}</dd></div>
        <div><dt className="text-xs font-bold text-muted">Especialidad</dt><dd className="font-bold text-ink">{appointment.doctor?.specialty ?? "No registrada"}</dd></div>
        <div><dt className="text-xs font-bold text-muted">Clínica</dt><dd className="font-bold text-ink">{appointment.clinic?.name ?? "No registrada"}</dd></div>
        <div><dt className="text-xs font-bold text-muted">Notas</dt><dd className="font-bold text-ink">{appointment.notes ?? "Sin notas"}</dd></div>
      </dl>
    </div>
  );
}

function DashboardView({ data, user }: { data: PatientDashboardData; user: AuthenticatedUser }) {
  const [now] = useState(() => Date.now());
  const upcoming = useMemo(() => data.appointments
    .filter((appointment) => appointment.scheduledAt && new Date(appointment.scheduledAt).getTime() >= now && !["canceled", "no_show"].includes(appointment.status))
    .sort((a, b) => new Date(a.scheduledAt ?? 0).getTime() - new Date(b.scheduledAt ?? 0).getTime()), [data.appointments, now]);
  const activePrescriptions = data.prescriptions.filter((prescription) => prescription.status === "active");

  return (
    <div className="patient-page space-y-4">
      <PageIntro title={`Información de ${user.name || "tu cuenta"}`} description="Este resumen usa únicamente datos clínicos vinculados a tu perfil autenticado." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={CalendarDays} label="Citas registradas" value={String(data.appointments.length)} />
        <Metric icon={Stethoscope} label="Consultas con historia visible" value={String(data.history.length)} />
        <Metric icon={FlaskConical} label="Estudios registrados" value={String(data.results.length)} />
        <Metric icon={HeartPulse} label="Recetas activas" value={String(activePrescriptions.length)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-extrabold text-ink">Próxima cita</h2><CalendarDays className="size-4 text-muted" aria-hidden="true" /></div>
          <div className="mt-3">{upcoming[0] ? <AppointmentSummary appointment={upcoming[0]} /> : <EmptyState message="No hay una cita futura vinculada a tu perfil." />}</div>
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-extrabold text-ink">Último triaje registrado</h2><ClipboardCheck className="size-4 text-muted" aria-hidden="true" /></div>
          <div className="mt-3">{data.triage ? <TriageSummary triage={data.triage} /> : <EmptyState message="No hay registros de triaje asociados a tu perfil." />}</div>
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-extrabold text-ink">Resultados de laboratorio</h2><FlaskConical className="size-4 text-muted" aria-hidden="true" /></div>
          <div className="mt-3 space-y-2">{data.results.length ? data.results.slice(0, 3).map((result) => <ResultRow key={result.id} result={result} />) : <EmptyState message="No hay estudios de laboratorio vinculados a tu perfil." />}</div>
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-extrabold text-ink">Recetas</h2><FileText className="size-4 text-muted" aria-hidden="true" /></div>
          <div className="mt-3 space-y-2">{activePrescriptions.length ? activePrescriptions.slice(0, 3).map((prescription) => <PrescriptionRow key={prescription.id} prescription={prescription} />) : <EmptyState message="No hay recetas activas vinculadas a tu perfil." />}</div>
        </Card>
        <UnavailableState title="IA epidemiológica" message={data.epidemiology.message} />
        <UnavailableState title="Membresía" message={data.membership.message} />
      </div>
    </div>
  );
}

function AppointmentsView({ appointments }: { appointments: PatientAppointment[] }) {
  return (
    <div className="patient-page">
      <PageIntro title="Mis citas" description="Solo se muestran citas asociadas a tu perfil de paciente y a su clínica correspondiente." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={CalendarDays} label="Total registradas" value={String(appointments.length)} />
        <Metric icon={CheckCircle2} label="Confirmadas" value={String(appointments.filter((item) => item.status === "confirmed").length)} />
        <Metric icon={Clock3} label="Pendientes" value={String(appointments.filter((item) => item.status === "pending").length)} />
      </div>
      <Card className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-extrabold text-ink">Agenda registrada</h2><span className="text-xs font-bold text-muted">{appointments.length} {appointments.length === 1 ? "cita" : "citas"}</span></div>
        <div className="mt-4 space-y-3">{appointments.length ? appointments.map((appointment) => <AppointmentSummary key={appointment.id} appointment={appointment} />) : <EmptyState message="No hay citas vinculadas a tu perfil." />}</div>
        <p className="mt-4 text-xs text-muted">Para agendar, reprogramar o cancelar, contacta a recepción de tu clínica o a tu médico. Ellos registran la cita y su confirmación; aquí puedes consultar su estado. Al llegar, recepción registra tu ingreso y el médico continúa tu atención e historial clínico.</p>
      </Card>
    </div>
  );
}

function TriageSummary({ triage }: { triage: PatientTriage }) {
  return (
    <div className="grid gap-2 text-sm sm:grid-cols-2">
      <div><span className="text-xs font-bold text-muted">Registrado</span><strong className="block text-ink">{formatDate(triage.recordedAt, true)}</strong></div>
      <div><span className="text-xs font-bold text-muted">Prioridad informada</span><strong className="block text-ink">{triage.triagePriority ?? "No registrada"}</strong></div>
      <div><span className="text-xs font-bold text-muted">Temperatura</span><strong className="block text-ink">{formatNumber(triage.temperatureC, " °C")}</strong></div>
      <div><span className="text-xs font-bold text-muted">Saturación</span><strong className="block text-ink">{formatNumber(triage.oxygenSaturation, "%")}</strong></div>
    </div>
  );
}

type TriageForm = {
  reason: string;
  temperatureC: string;
  systolicBp: string;
  diastolicBp: string;
  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  triagePriority: "" | "routine" | "urgent" | "emergency";
  triageNotes: string;
};

const TRIAGE_FIELD_ERROR_KEYS = {
  reason: ["reason"],
  temperatureC: ["temperature_c"],
  systolicBp: ["systolic_bp"],
  diastolicBp: ["diastolic_bp"],
  heartRate: ["heart_rate"],
  respiratoryRate: ["respiratory_rate"],
  oxygenSaturation: ["oxygen_saturation"],
  triagePriority: ["triage_priority"],
  triageNotes: ["triage_notes"],
} as const;

function triageFormFromData(triage: PatientTriage | null): TriageForm {
  return {
    reason: triage?.reason ?? "",
    temperatureC: triage?.temperatureC?.toString() ?? "",
    systolicBp: triage?.systolicBp?.toString() ?? "",
    diastolicBp: triage?.diastolicBp?.toString() ?? "",
    heartRate: triage?.heartRate?.toString() ?? "",
    respiratoryRate: triage?.respiratoryRate?.toString() ?? "",
    oxygenSaturation: triage?.oxygenSaturation?.toString() ?? "",
    triagePriority: triage?.triagePriority ?? "",
    triageNotes: triage?.triageNotes ?? "",
  };
}

function nullableNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function TriageView({ initialTriage }: { initialTriage: PatientTriage | null }) {
  const [triage, setTriage] = useState(initialTriage);
  const [form, setForm] = useState<TriageForm>(() => triageFormFromData(initialTriage));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function setField(field: keyof TriageForm, value: string) {
    setMessage(null);
    setError(null);
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    setFieldErrors({});

    const payload: PatientTriagePayload = {
      reason: form.reason.trim(),
      temperature_c: nullableNumber(form.temperatureC),
      systolic_bp: nullableNumber(form.systolicBp),
      diastolic_bp: nullableNumber(form.diastolicBp),
      heart_rate: nullableNumber(form.heartRate),
      respiratory_rate: nullableNumber(form.respiratoryRate),
      oxygen_saturation: nullableNumber(form.oxygenSaturation),
      triage_priority: form.triagePriority || null,
      triage_notes: form.triageNotes.trim() || null,
    };

    try {
      const saved = await savePatientTriage(payload);
      setTriage(saved);
      setForm(triageFormFromData(saved));
      setMessage("Triaje guardado correctamente.");
    } catch (submitError) {
      setError(errorMessage(submitError));
      setFieldErrors(fieldErrorsFrom(submitError, TRIAGE_FIELD_ERROR_KEYS));
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    { id: "temperatureC", label: "Temperatura (°C)", inputMode: "decimal" as const },
    { id: "systolicBp", label: "Presión sistólica", inputMode: "numeric" as const },
    { id: "diastolicBp", label: "Presión diastólica", inputMode: "numeric" as const },
    { id: "heartRate", label: "Frecuencia cardiaca", inputMode: "numeric" as const },
    { id: "respiratoryRate", label: "Frecuencia respiratoria", inputMode: "numeric" as const },
    { id: "oxygenSaturation", label: "Saturación de oxígeno (%)", inputMode: "numeric" as const },
  ] as const;

  return (
    <div className="patient-page">
      <PageIntro title="Triaje" description="Registra información que tengas disponible. La prioridad no se calcula en el navegador ni reemplaza una evaluación profesional." />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <div className="flex items-start gap-3"><ClipboardCheck className="mt-0.5 size-5 text-accent" aria-hidden="true" /><div><h2 className="text-sm font-extrabold text-ink">Nuevo registro</h2><p className="mt-1 text-xs text-muted">Los datos se guardan asociados a tu perfil autenticado.</p></div></div>
          <form className="mt-5 space-y-4" aria-describedby={error ? "triage-form-error" : message ? "triage-form-message" : undefined} aria-busy={saving} onSubmit={(event) => void submit(event)}>
            <label className="grid gap-1.5 text-xs font-extrabold text-ink-secondary" htmlFor="triage-reason">Motivo de consulta<span className="text-danger">*</span><textarea id="triage-reason" className="min-h-24 rounded-lg border border-line bg-surface-input px-3 py-2 text-sm font-medium text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" required minLength={10} maxLength={2000} value={form.reason} onChange={(event) => setField("reason", event.target.value)} disabled={saving} aria-invalid={fieldErrors.reason ? true : undefined} aria-describedby={fieldErrors.reason ? "triage-reason-error" : undefined} /><FieldError id="triage-reason-error" message={fieldErrors.reason} /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((field) => {
                const id = `triage-${field.id}`;
                const fieldError = fieldErrors[field.id];

                return <label className="grid gap-1.5 text-xs font-extrabold text-ink-secondary" htmlFor={id} key={field.id}>{field.label}<input id={id} className="h-10 rounded-lg border border-line bg-surface-input px-3 text-sm font-medium text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" inputMode={field.inputMode} value={form[field.id]} onChange={(event) => setField(field.id, event.target.value)} disabled={saving} aria-invalid={fieldError ? true : undefined} aria-describedby={fieldError ? `${id}-error` : undefined} /><FieldError id={`${id}-error`} message={fieldError} /></label>;
              })}
            </div>
            <label className="grid gap-1.5 text-xs font-extrabold text-ink-secondary" htmlFor="triage-priority">Prioridad informada<select id="triage-priority" className="h-10 rounded-lg border border-line bg-surface-input px-3 text-sm font-medium text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" value={form.triagePriority} onChange={(event) => setField("triagePriority", event.target.value)} disabled={saving} aria-invalid={fieldErrors.triagePriority ? true : undefined} aria-describedby={fieldErrors.triagePriority ? "triage-priority-error" : undefined}><option value="">No informar</option><option value="routine">Rutina</option><option value="urgent">Urgente</option><option value="emergency">Emergencia</option></select><FieldError id="triage-priority-error" message={fieldErrors.triagePriority} /></label>
            <label className="grid gap-1.5 text-xs font-extrabold text-ink-secondary" htmlFor="triage-notes">Notas adicionales<textarea id="triage-notes" className="min-h-20 rounded-lg border border-line bg-surface-input px-3 py-2 text-sm font-medium text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" maxLength={2000} value={form.triageNotes} onChange={(event) => setField("triageNotes", event.target.value)} disabled={saving} aria-invalid={fieldErrors.triageNotes ? true : undefined} aria-describedby={fieldErrors.triageNotes ? "triage-notes-error" : undefined} /><FieldError id="triage-notes-error" message={fieldErrors.triageNotes} /></label>
            {error ? <p className="rounded-lg bg-danger-soft p-3 text-sm font-bold text-danger" id="triage-form-error" role="alert">{error}</p> : null}
            {message ? <p className="rounded-lg bg-success-soft p-3 text-sm font-bold text-success" id="triage-form-message" role="status">{message}</p> : null}
            <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-xs font-extrabold text-paper transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={saving}>{saving ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}{saving ? "Guardando…" : "Guardar triaje"}</button>
          </form>
        </Card>
        <Card>
          <h2 className="text-sm font-extrabold text-ink">Registro más reciente</h2>
          <div className="mt-3">{triage ? <TriageSummary triage={triage} /> : <EmptyState message="Todavía no tienes un registro de triaje." />}</div>
          <p className="mt-4 text-xs leading-relaxed text-muted">Este módulo almacena los valores informados. No muestra una clasificación clínica automática.</p>
        </Card>
      </div>
    </div>
  );
}

function ResultRow({ result }: { result: PatientLaboratoryResult }) {
  return <div className="flex items-start gap-3 rounded-lg border border-line bg-surface-subtle p-3"><FlaskConical className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" /><div className="min-w-0 flex-1"><strong className="block truncate text-sm text-ink">{result.studyName}</strong><span className="text-xs text-muted">{formatDate(result.orderedAt, true)} · {result.clinic?.name ?? "Clínica no registrada"}</span></div><StatusBadge label={result.statusLabel} value={result.status} /></div>;
}

function ResultsView({ results }: { results: PatientLaboratoryResult[] }) {
  return (
    <div className="patient-page">
      <PageIntro title="Resultados de laboratorio" description="Se muestran solicitudes y resultados internos vinculados a tu perfil. No se agregan interpretaciones externas." />
      <Card>
        <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-extrabold text-ink">Estudios registrados</h2><span className="text-xs font-bold text-muted">{results.length} {results.length === 1 ? "estudio" : "estudios"}</span></div>
        <div className="mt-4 space-y-3">{results.length ? results.map((result) => <div className="rounded-lg border border-line bg-surface-subtle p-3" key={result.id}><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-start gap-3"><FlaskConical className="mt-0.5 size-4 text-accent" aria-hidden="true" /><div><h3 className="text-sm font-extrabold text-ink">{result.studyName}</h3><p className="mt-1 text-xs text-muted">Solicitado: {formatDate(result.orderedAt, true)} · {result.clinic?.name ?? "Clínica no registrada"}</p></div></div><StatusBadge label={result.statusLabel} value={result.status} /></div>{result.resultAvailable ? <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed text-ink-secondary"><strong>Resultado registrado:</strong> {result.resultSummary ?? "El laboratorio no registró un resumen."}</p> : <p className="mt-3 border-t border-line pt-3 text-xs text-muted">El resultado todavía no está disponible para consulta.</p>}</div>) : <EmptyState message="No hay resultados de laboratorio vinculados a tu perfil." />}</div>
      </Card>
    </div>
  );
}

function HistoryView({ consultations }: { consultations: PatientConsultation[] }) {
  return (
    <div className="patient-page">
      <PageIntro title="Historial clínico" description="Solo se muestran consultas finalizadas o firmadas que están vinculadas a tu perfil." />
      <Card>
        <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-extrabold text-ink">Consultas visibles</h2><span className="text-xs font-bold text-muted">{consultations.length} {consultations.length === 1 ? "consulta" : "consultas"}</span></div>
        <div className="mt-4 space-y-4">{consultations.length ? consultations.map((consultation) => <article className="rounded-lg border border-line bg-surface-subtle p-4" key={consultation.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-extrabold text-ink">{consultation.chiefComplaint}</h3><p className="mt-1 text-xs text-muted">{formatDate(consultation.createdAt, true)} · {consultation.doctor?.name ?? "Profesional no registrado"} · {consultation.clinic?.name ?? "Clínica no registrada"}</p></div><StatusBadge label={consultation.statusLabel} value={consultation.status} /></div>{consultation.objective ? <p className="mt-3 text-sm leading-relaxed text-ink-secondary"><strong>Objetivo:</strong> {consultation.objective}</p> : null}{consultation.clinicalHistory?.sections && Object.keys(consultation.clinicalHistory.sections).length ? <details className="mt-3 rounded-lg border border-line bg-surface p-3"><summary className="cursor-pointer text-xs font-extrabold text-ink">Detalles registrados</summary><dl className="mt-3 grid gap-2 text-xs text-ink-secondary">{Object.entries(consultation.clinicalHistory.sections).map(([key, value]) => <div className="border-t border-line pt-2" key={key}><dt className="font-extrabold text-ink">{key}</dt><dd className="mt-1 whitespace-pre-wrap">{typeof value === "string" ? value : JSON.stringify(value)}</dd></div>)}</dl></details> : null}</article>) : <EmptyState message="No hay consultas finalizadas o firmadas vinculadas a tu perfil." />}</div>
      </Card>
    </div>
  );
}

function PrescriptionRow({ prescription }: { prescription: PatientPrescription }) {
  return <div className="rounded-lg border border-line bg-surface-subtle p-3"><div className="flex flex-wrap items-start justify-between gap-3"><div><strong className="block text-sm text-ink">{prescription.medication}</strong><span className="text-xs text-muted">{prescription.doctor?.name ?? "Profesional no registrado"} · {formatDate(prescription.issuedAt)}</span></div><StatusBadge label={prescription.statusLabel} value={prescription.status} /></div><dl className="mt-3 grid gap-2 text-xs sm:grid-cols-3"><div><dt className="font-bold text-muted">Dosis</dt><dd className="font-bold text-ink">{prescription.dosage ?? "No registrada"}</dd></div><div><dt className="font-bold text-muted">Frecuencia</dt><dd className="font-bold text-ink">{prescription.frequency ?? "No registrada"}</dd></div><div><dt className="font-bold text-muted">Duración</dt><dd className="font-bold text-ink">{prescription.durationDays === null ? "No registrada" : `${prescription.durationDays} días`}</dd></div></dl>{prescription.notes ? <p className="mt-3 text-xs leading-relaxed text-ink-secondary">{prescription.notes}</p> : null}</div>;
}

function PrescriptionsView({ prescriptions }: { prescriptions: PatientPrescription[] }) {
  return (
    <div className="patient-page">
      <PageIntro title="Recetas" description="Se muestran recetas registradas por profesionales vinculados a tu atención. No se generan recordatorios ni renovaciones automáticas." />
      <Card>
        <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-extrabold text-ink">Recetas registradas</h2><span className="text-xs font-bold text-muted">{prescriptions.length} {prescriptions.length === 1 ? "receta" : "recetas"}</span></div>
        <div className="mt-4 space-y-3">{prescriptions.length ? prescriptions.map((prescription) => <PrescriptionRow key={prescription.id} prescription={prescription} />) : <EmptyState message="No hay recetas vinculadas a tu perfil." />}</div>
      </Card>
    </div>
  );
}

type ProfileForm = {
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
  whatsappConsent: boolean;
};

const PROFILE_FIELD_ERROR_KEYS = {
  name: ["name"],
  email: ["email"],
  phoneNumber: ["phone_number"],
  countryCode: ["country_code"],
  documentType: ["document_type"],
  documentNumber: ["document_number"],
  dateOfBirth: ["date_of_birth"],
  sex: ["sex"],
  address: ["address"],
  emergencyContact: ["emergency_contact"],
  insurance: ["insurance"],
  whatsappConsent: ["whatsapp_consent"],
} as const;

function profileFormFromData(profile: PatientProfile): ProfileForm {
  return {
    name: profile.name ?? "",
    email: profile.email ?? "",
    phoneNumber: profile.phoneNumber ?? "",
    countryCode: profile.countryCode ?? "",
    documentType: profile.documentType ?? "",
    documentNumber: profile.documentNumber ?? "",
    dateOfBirth: profile.dateOfBirth ?? "",
    sex: profile.sex ?? "",
    address: profile.address ?? "",
    emergencyContact: profile.emergencyContact ?? "",
    insurance: profile.insurance ?? "",
    whatsappConsent: profile.whatsappConsent,
  };
}

function ProfileField({ id, label, value, onChange, type = "text", required = false, error }: { id: string; label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; error?: string }) {
  return <label className="grid gap-1.5 text-xs font-extrabold text-ink-secondary" htmlFor={id}>{label}{required ? <span className="text-danger">*</span> : null}<input id={id} className="h-10 rounded-lg border border-line bg-surface-input px-3 text-sm font-medium text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} /><FieldError id={`${id}-error`} message={error} /></label>;
}

function ProfileView({ initialProfile }: { initialProfile: PatientProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [form, setForm] = useState<ProfileForm>(() => profileFormFromData(initialProfile));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function setField(field: keyof ProfileForm, value: string | boolean) {
    setMessage(null);
    setError(null);
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    setFieldErrors({});
    const payload: PatientProfileUpdatePayload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone_number: form.phoneNumber.trim(),
      country_code: form.countryCode,
      document_type: form.documentType.trim() || null,
      document_number: form.documentNumber.trim() || null,
      date_of_birth: form.dateOfBirth || null,
      sex: form.sex || null,
      address: form.address.trim() || null,
      emergency_contact: form.emergencyContact.trim() || null,
      insurance: form.insurance.trim() || null,
      whatsapp_consent: form.whatsappConsent,
    };

    try {
      const updated = await updatePatientProfile(payload);
      setProfile(updated);
      setForm(profileFormFromData(updated));
      setMessage("Perfil actualizado correctamente.");
    } catch (submitError) {
      setError(errorMessage(submitError));
      setFieldErrors(fieldErrorsFrom(submitError, PROFILE_FIELD_ERROR_KEYS));
    } finally {
      setSaving(false);
    }
  }

  const initials = (profile.name ?? "PA").trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "PA";

  return (
    <div className="patient-page">
      <PageIntro title="Mi perfil" description="Edita únicamente los datos que están respaldados por el perfil de paciente persistido." />
      <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]" aria-describedby={error ? "profile-form-error" : message ? "profile-form-message" : undefined} aria-busy={saving} onSubmit={(event) => void submit(event)}>
        <Card>
          <div className="flex items-center gap-3 border-b border-line pb-4"><span className="grid size-12 place-items-center rounded-full bg-accent-soft text-sm font-black text-accent" aria-hidden="true">{initials}</span><div><h2 className="text-sm font-extrabold text-ink">Datos personales y de contacto</h2><p className="mt-1 text-xs text-muted">Los cambios se guardan en tu cuenta autenticada.</p></div></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ProfileField id="profile-name" label="Nombre completo" value={form.name} onChange={(value) => setField("name", value)} required error={fieldErrors.name} />
            <ProfileField id="profile-email" label="Correo electrónico" value={form.email} onChange={(value) => setField("email", value)} type="email" error={fieldErrors.email} />
            <ProfileField id="profile-phone" label="Teléfono" value={form.phoneNumber} onChange={(value) => setField("phoneNumber", value)} required error={fieldErrors.phoneNumber} />
            <label className="grid gap-1.5 text-xs font-extrabold text-ink-secondary" htmlFor="profile-country">Código de país<select id="profile-country" className="h-10 rounded-lg border border-line bg-surface-input px-3 text-sm font-medium text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" value={form.countryCode} onChange={(event) => setField("countryCode", event.target.value)} required aria-invalid={fieldErrors.countryCode ? true : undefined} aria-describedby={fieldErrors.countryCode ? "profile-country-error" : undefined}><option value="">Selecciona un código</option><option value="PE">PE</option><option value="MX">MX</option><option value="US">US</option></select><FieldError id="profile-country-error" message={fieldErrors.countryCode} /></label>
            <ProfileField id="profile-document-type" label="Tipo de documento" value={form.documentType} onChange={(value) => setField("documentType", value)} error={fieldErrors.documentType} />
            <ProfileField id="profile-document-number" label="Número de documento" value={form.documentNumber} onChange={(value) => setField("documentNumber", value)} error={fieldErrors.documentNumber} />
            <ProfileField id="profile-birth-date" label="Fecha de nacimiento" value={form.dateOfBirth} onChange={(value) => setField("dateOfBirth", value)} type="date" error={fieldErrors.dateOfBirth} />
            <label className="grid gap-1.5 text-xs font-extrabold text-ink-secondary" htmlFor="profile-sex">Sexo<select id="profile-sex" className="h-10 rounded-lg border border-line bg-surface-input px-3 text-sm font-medium text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" value={form.sex} onChange={(event) => setField("sex", event.target.value)} aria-invalid={fieldErrors.sex ? true : undefined} aria-describedby={fieldErrors.sex ? "profile-sex-error" : undefined}><option value="">No registrado</option><option value="Femenino">Femenino</option><option value="Masculino">Masculino</option><option value="Otro">Otro</option></select><FieldError id="profile-sex-error" message={fieldErrors.sex} /></label>
            <label className="grid gap-1.5 text-xs font-extrabold text-ink-secondary sm:col-span-2" htmlFor="profile-address">Dirección<textarea id="profile-address" className="min-h-20 rounded-lg border border-line bg-surface-input px-3 py-2 text-sm font-medium text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" value={form.address} onChange={(event) => setField("address", event.target.value)} aria-invalid={fieldErrors.address ? true : undefined} aria-describedby={fieldErrors.address ? "profile-address-error" : undefined} /><FieldError id="profile-address-error" message={fieldErrors.address} /></label>
            <ProfileField id="profile-emergency" label="Contacto de emergencia" value={form.emergencyContact} onChange={(value) => setField("emergencyContact", value)} error={fieldErrors.emergencyContact} />
            <ProfileField id="profile-insurance" label="Seguro o cobertura registrada" value={form.insurance} onChange={(value) => setField("insurance", value)} error={fieldErrors.insurance} />
          </div>
          <label className="mt-4 flex items-start gap-2 text-xs font-bold text-ink-secondary" htmlFor="profile-whatsapp"><input id="profile-whatsapp" className="mt-0.5 size-4 accent-accent" type="checkbox" checked={form.whatsappConsent} onChange={(event) => setField("whatsappConsent", event.target.checked)} disabled={saving} aria-invalid={fieldErrors.whatsappConsent ? true : undefined} aria-describedby={fieldErrors.whatsappConsent ? "profile-whatsapp-error" : undefined} />Acepto recibir comunicaciones por WhatsApp.<FieldError id="profile-whatsapp-error" message={fieldErrors.whatsappConsent} /></label>
          {error ? <p className="mt-4 rounded-lg bg-danger-soft p-3 text-sm font-bold text-danger" id="profile-form-error" role="alert">{error}</p> : null}
          {message ? <p className="mt-4 rounded-lg bg-success-soft p-3 text-sm font-bold text-success" id="profile-form-message" role="status">{message}</p> : null}
          <button className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-xs font-extrabold text-paper transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={saving}>{saving ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}{saving ? "Guardando…" : "Guardar cambios"}</button>
        </Card>
        <aside className="space-y-4">
          <Card><h2 className="text-sm font-extrabold text-ink">Identificación de cuenta</h2><dl className="mt-3 space-y-3 text-sm"><div><dt className="text-xs font-bold text-muted">Código de paciente</dt><dd className="font-extrabold text-ink">{profile.patientCode}</dd></div><div><dt className="text-xs font-bold text-muted">Estado</dt><dd><StatusBadge label={profile.status ?? "No registrado"} value={profile.status ?? "unknown"} /></dd></div><div><dt className="text-xs font-bold text-muted">Clínica vinculada</dt><dd className="font-extrabold text-ink">{profile.clinic?.name ?? "No hay clínica vinculada"}</dd></div></dl></Card>
          <Card><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-5 text-success" aria-hidden="true" /><p className="text-xs leading-relaxed text-muted">Tus datos se cargan desde el perfil asociado a la sesión actual. No puedes seleccionar otro paciente desde este portal.</p></div></Card>
        </aside>
      </form>
    </div>
  );
}

export function PatientPortalView({ user, view }: { user: AuthenticatedUser; view: PatientPortalView }) {
  const state = usePatientPortalData(view);

  if (state.status === "loading" || state.view !== view) return <PortalLoading />;
  if (state.status === "error") return <PortalError message={state.message} onRetry={state.retry} />;

  switch (state.data.view) {
    case "dashboard":
      return <DashboardView data={state.data.data} user={user} />;
    case "appointments":
      return <AppointmentsView appointments={state.data.data} />;
    case "triage":
      return <TriageView initialTriage={state.data.data} />;
    case "results":
      return <ResultsView results={state.data.data} />;
    case "history":
      return <HistoryView consultations={state.data.data} />;
    case "prescriptions":
      return <PrescriptionsView prescriptions={state.data.data} />;
    case "epidemiology":
      return <div className="patient-page"><PageIntro title="IA epidemiológica" description="Este módulo no muestra afirmaciones clínicas ni riesgo si no existe una fuente vinculada." /><UnavailableState title="Datos no disponibles" message={state.data.data.message} /></div>;
    case "membership":
      return <div className="patient-page"><PageIntro title="Membresía" description="Solo se muestran suscripciones individuales persistidas y vinculadas a tu cuenta." /><UnavailableState title="Membresía no disponible" message={state.data.data.message} /></div>;
    case "profile":
      return <ProfileView initialProfile={state.data.data} />;
  }
}

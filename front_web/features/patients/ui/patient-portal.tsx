"use client";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  FlaskConical,
  HeartPulse,
  Info,
  LoaderCircle,
  MapPin,
  Pill,
  Save,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { AuthenticatedUser } from "@/features/auth/model/auth.types";
import {
  getPatientConsents,
  getPatientPortalData,
  grantPatientConsent,
  revokePatientConsent,
  savePatientTriage,
  updatePatientProfile,
  type PatientAppointment,
  type PatientDashboardData,
  type PatientLaboratoryResult,
  type PatientConsultation,
  type PatientEpidemiologyData,
  type PatientMembershipData,
  type PatientConsent,
  type PatientConsentScope,
  type PatientPortalData,
  type PatientPortalView,
  type PatientPrescription,
  type PatientProfile,
  type PatientProfileUpdatePayload,
  type PatientTriage,
  type PatientTriageLevel,
  type PatientTriagePayload,
  type PatientTriageStatus,
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
  return <span className={"patient-status-badge " + statusClasses(value)}>{label}</span>;
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={"patient-premium-surface rounded-xl border border-line bg-surface p-4 shadow-sm " + className}>{children}</section>;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="patient-empty-state">
      <span className="patient-empty-state__icon"><Info className="size-5" aria-hidden="true" /></span>
      <div><strong>Sin información por ahora</strong><p>{message}</p></div>
    </div>
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

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof CalendarDays }) {
  return (
    <Card className="patient-metric-card">
      <span className="patient-metric-card__icon"><Icon className="size-5" aria-hidden="true" /></span>
      <span className="patient-metric-card__copy"><span>{label}</span><strong>{value}</strong><small>Información de tu expediente</small></span>
    </Card>
  );
}

function DashboardView({ data }: { data: PatientDashboardData }) {
  const [now] = useState(() => Date.now());
  const upcoming = useMemo(() => data.appointments
    .filter((appointment) => appointment.scheduledAt && new Date(appointment.scheduledAt).getTime() >= now && !["canceled", "no_show"].includes(appointment.status))
    .sort((a, b) => new Date(a.scheduledAt ?? 0).getTime() - new Date(b.scheduledAt ?? 0).getTime()), [data.appointments, now]);
  const activePrescriptions = data.prescriptions.filter((prescription) => prescription.status === "active");
  const nextAppointment = upcoming[0] ?? null;
  const nextDate = nextAppointment?.scheduledAt
    ? new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(new Date(nextAppointment.scheduledAt))
    : "Sin próxima cita";
  const nextTime = nextAppointment?.scheduledAt
    ? new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" }).format(new Date(nextAppointment.scheduledAt))
    : "—";

  return (
    <div className="patient-page">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.48fr)_minmax(340px,1fr)]">
        <article className="patient-appointment-hero">
          <div className="patient-appointment-hero__top">
            <div className="patient-appointment-hero__eyebrow">
              <span>PRÓXIMA CITA</span>
              <CalendarDays aria-hidden="true" />
            </div>
            <div className="patient-appointment-hero__time">
              <strong>{nextTime}</strong>
              <span>{nextAppointment ? appointmentTypeLabel(nextAppointment.appointmentType) : "Agenda disponible"}</span>
            </div>
          </div>
          <div className="patient-appointment-hero__date">{nextDate}</div>
          <div className="patient-appointment-hero__location">
            <span>{nextAppointment?.clinic?.name ?? "Clínica no registrada"}</span>
            <i aria-hidden="true" />
            <span>{nextAppointment?.statusLabel ?? "Consulta tu agenda"}</span>
          </div>

          <div className="patient-appointment-hero__footer">
            <span className="patient-avatar patient-avatar--small" aria-hidden="true">
              <span className="patient-avatar__face">
                {(nextAppointment?.doctor?.name ?? "M").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
              </span>
            </span>
            <div className="patient-appointment-hero__doctor">
              <small>{nextAppointment?.doctor?.specialty ?? "Profesional de salud"}</small>
              <strong>{nextAppointment?.doctor?.name ?? "Sin profesional asignado"}</strong>
              <span>{nextAppointment?.notes ?? "Sin indicaciones adicionales"}</span>
            </div>
            <div className="patient-appointment-hero__actions">
              <Link className="patient-action-button patient-action-button--primary" href="/patient/citas">
                Ver mis citas
              </Link>
            </div>
          </div>
        </article>

        <aside className="patient-health-status">
          <div className="patient-health-status__top">
            <span className="patient-health-status__badge"><HeartPulse className="size-4" aria-hidden="true" />ESTADO DE SALUD</span>
            <span className="patient-health-status__stable">{data.triage ? "Con registro" : "Sin triaje"}</span>
          </div>
          <h2>{data.triage ? "Seguimiento clínico disponible" : "Completa tu información clínica"}</h2>
          <p>
            {data.triage
              ? "Tienes información de triaje registrada. HIPOCRATIQ la conserva para que el profesional pueda revisarla durante tu atención."
              : "Aún no existe un triaje asociado a tu perfil. Puedes registrar tus datos disponibles antes de la atención."}
          </p>
          <strong>Última actualización: {data.triage ? formatDate(data.triage.recordedAt) : "No disponible"}</strong>
        </aside>
      </section>

      <section className="patient-dashboard-grid mt-5">
        <Card className="patient-epidemiology">
          <div className="patient-section-title">
            <div className="patient-section-title__group">
              <h2>IA epidemiológica</h2>
              <span className="patient-beta-badge">Beta</span>
            </div>
            <Info className="size-4 text-muted" aria-hidden="true" />
          </div>
          <div className="patient-risk-callout rounded-xl">
            <ShieldCheck className="size-5 shrink-0" aria-hidden="true" />
            <div>
              <p>Información disponible de forma controlada</p>
              <span>{data.epidemiology.message}</span>
            </div>
          </div>
          <div className="patient-epidemiology__recommendation">
            <p>Privacidad primero</p>
            <strong>Las funciones epidemiológicas deben respetar el consentimiento clínico versionado configurado en tu perfil.</strong>
          </div>
          <Link className="patient-card-footer-link" href="/patient/ia">Ver módulo de IA</Link>
        </Card>

        <Card className="patient-results-preview">
          <div className="patient-section-title">
            <h2>Resultados recientes</h2>
            <Link className="patient-text-link" href="/patient/resultados">Ver todos</Link>
          </div>
          <div className="patient-preview-list">
            {data.results.length ? data.results.slice(0, 3).map((result) => (
              <div className="patient-preview-row" key={result.id}>
                <span className="patient-icon patient-icon--violet"><FlaskConical className="size-4" aria-hidden="true" /></span>
                <div className="patient-preview-row__copy">
                  <strong>{result.studyName}</strong>
                  <span>{result.clinic?.name ?? "Clínica no registrada"} · {formatDate(result.orderedAt)}</span>
                </div>
                <StatusBadge label={result.statusLabel} value={result.status} />
              </div>
            )) : <EmptyState message="No hay estudios recientes." />}
          </div>
        </Card>

        <Card className="patient-prescriptions">
          <div className="patient-section-title">
            <h2>Recetas activas</h2>
            <Link className="patient-text-link" href="/patient/recetas">Ver todas</Link>
          </div>
          <div className="patient-prescriptions__list">
            {activePrescriptions.length ? activePrescriptions.slice(0, 3).map((prescription) => (
              <div className="patient-prescription-row" key={prescription.id}>
                <span className="patient-icon patient-icon--green"><FileText className="size-4" aria-hidden="true" /></span>
                <div className="patient-prescription-row__copy">
                  <strong>{prescription.medication}</strong>
                  <span>{prescription.dosage ?? "Dosis no registrada"} · {prescription.frequency ?? "Frecuencia no registrada"}</span>
                </div>
                <div className="patient-prescription-row__next">
                  <small>{prescription.statusLabel}</small>
                  <strong>{formatDate(prescription.expiresAt)}</strong>
                </div>
              </div>
            )) : <EmptyState message="No hay recetas activas." />}
          </div>
        </Card>

        <Card className="patient-quick-access">
          <div className="patient-section-title"><h2>Accesos rápidos</h2></div>
          <div className="patient-quick-grid">
            <Link className="patient-quick-item" href="/patient/citas">
              <span className="patient-icon patient-icon--blue"><CalendarDays className="size-4" aria-hidden="true" /></span>
              <span><strong>Mis citas</strong><small>{data.appointments.length} registradas</small></span>
            </Link>
            <Link className="patient-quick-item" href="/patient/resultados">
              <span className="patient-icon patient-icon--violet"><FlaskConical className="size-4" aria-hidden="true" /></span>
              <span><strong>Mis resultados</strong><small>{data.results.length} estudios</small></span>
            </Link>
            <Link className="patient-quick-item" href="/patient/recetas">
              <span className="patient-icon patient-icon--green"><HeartPulse className="size-4" aria-hidden="true" /></span>
              <span><strong>Mis recetas</strong><small>{activePrescriptions.length} activas</small></span>
            </Link>
            <Link className="patient-quick-item" href="/patient/historial">
              <span className="patient-icon patient-icon--amber"><Stethoscope className="size-4" aria-hidden="true" /></span>
              <span><strong>Mi historial</strong><small>{data.history.length} consultas</small></span>
            </Link>
          </div>
        </Card>

        <div className="patient-dashboard-help">
          <div className="patient-help-strip">
            <div className="patient-help-strip__copy">
              <span className="patient-help-strip__icon"><Info className="size-6" aria-hidden="true" /></span>
              <div>
                <h2>Prepara tu próxima atención</h2>
                <p>Completa tu ingreso clínico para que tu equipo tenga el contexto necesario antes de la consulta.</p>
              </div>
            </div>
            <div className="patient-help-strip__contact">
              <strong>Información previa a la consulta</strong>
              <Link className="patient-whatsapp-button" href="/patient/historia-clinica">Completar ingreso clínico</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function AppointmentsView({ appointments }: { appointments: PatientAppointment[] }) {
  const [now] = useState(() => Date.now());
  const hasUpcoming = appointments.some((item) => item.scheduledAt && new Date(item.scheduledAt).getTime() >= now && !["canceled", "no_show"].includes(item.status));
  const [tab, setTab] = useState<"upcoming" | "history" | "canceled">(() => hasUpcoming ? "upcoming" : "history");
  const [statusFilter, setStatusFilter] = useState("all");

  const upcoming = appointments.filter((item) => item.scheduledAt && new Date(item.scheduledAt).getTime() >= now && !["canceled", "no_show"].includes(item.status));
  const confirmed = appointments.filter((item) => item.status === "confirmed");
  const teleconsultations = appointments.filter((item) => /tele|video|virtual/i.test(item.appointmentType));
  const pending = appointments.filter((item) => item.status === "pending");

  const filtered = appointments.filter((item) => {
    const appointmentTime = item.scheduledAt ? new Date(item.scheduledAt).getTime() : 0;
    if (tab === "upcoming" && (appointmentTime < now || ["canceled", "no_show"].includes(item.status))) return false;
    if (tab === "history" && appointmentTime >= now) return false;
    if (tab === "canceled" && !["canceled", "no_show"].includes(item.status)) return false;
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    return true;
  });

  const next = [...upcoming].sort((a, b) => new Date(a.scheduledAt ?? 0).getTime() - new Date(b.scheduledAt ?? 0).getTime())[0] ?? null;
  const nextDate = next?.scheduledAt ? new Date(next.scheduledAt) : null;

  return (
    <div className="patient-page">
      <section className="patient-summary-grid" aria-label="Resumen de citas">
        <article className="patient-summary-stat"><span className="patient-icon patient-icon--blue"><CalendarDays className="size-4" aria-hidden="true" /></span><div><span>Próximas</span><strong>{upcoming.length}</strong><small>Citas por atender</small></div></article>
        <article className="patient-summary-stat"><span className="patient-icon patient-icon--green"><CheckCircle2 className="size-4" aria-hidden="true" /></span><div><span>Confirmadas</span><strong>{confirmed.length}</strong><small>Con asistencia confirmada</small></div></article>
        <article className="patient-summary-stat"><span className="patient-icon patient-icon--violet"><Activity className="size-4" aria-hidden="true" /></span><div><span>Teleconsultas</span><strong>{teleconsultations.length}</strong><small>Atenciones virtuales</small></div></article>
        <article className="patient-summary-stat"><span className="patient-icon patient-icon--amber"><Clock3 className="size-4" aria-hidden="true" /></span><div><span>Pendientes</span><strong>{pending.length}</strong><small>Por confirmar</small></div></article>
      </section>

      <div className="patient-appointments-layout">
        <main className="patient-appointments-main">
          <section className="patient-card patient-appointments-table">
            <div className="patient-table-toolbar">
              <div className="patient-tabs" role="tablist" aria-label="Filtrar citas">
                {([
                  ["upcoming", "Próximas"],
                  ["history", "Historial"],
                  ["canceled", "Canceladas"],
                ] as const).map(([value, label]) => (
                  <button key={value} className={tab === value ? "patient-tab patient-tab--active" : "patient-tab"} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)}>{label}</button>
                ))}
              </div>
              <div className="patient-filter-actions">
                <label className="patient-select-wrap">
                  <span className="sr-only">Filtrar por estado</span>
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    <option value="all">Todos los estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmada</option>
                    <option value="completed">Completada</option>
                    <option value="canceled">Cancelada</option>
                  </select>
                </label>
              </div>
            </div>

            {filtered.length ? (
              <div className="patient-table-scroll">
                <table className="patient-data-table">
                  <thead><tr><th>Fecha y hora</th><th>Profesional</th><th>Especialidad</th><th>Clínica</th><th>Tipo</th><th>Estado</th></tr></thead>
                  <tbody>
                    {filtered.map((appointment) => (
                      <tr key={appointment.id}>
                        <td><span className="patient-table-date"><CalendarDays className="size-4" aria-hidden="true" /><strong>{formatDate(appointment.scheduledAt, true)}</strong><small>{appointment.notes ?? "Sin indicaciones"}</small></span></td>
                        <td><strong>{appointment.doctor?.name ?? "No asignado"}</strong><small>{appointment.doctor?.medicalLicense ?? "Credencial no registrada"}</small></td>
                        <td><span className="patient-table-specialty"><Stethoscope className="size-4" aria-hidden="true" />{appointment.doctor?.specialty ?? "No registrada"}</span></td>
                        <td><span className="patient-table-location"><MapPin className="size-3.5" aria-hidden="true" /><strong>{appointment.clinic?.name ?? "No registrada"}</strong><small>Atención vinculada a tu perfil</small></span></td>
                        <td>{appointmentTypeLabel(appointment.appointmentType)}</td>
                        <td><StatusBadge label={appointment.statusLabel} value={appointment.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div className="p-4"><EmptyState message="No hay citas que coincidan con los filtros seleccionados." /></div>}
            <div className="patient-table-footer"><span>{filtered.length} {filtered.length === 1 ? "cita visible" : "citas visibles"}</span><span>Datos asociados únicamente a tu perfil</span></div>
          </section>
        </main>

        <aside className="patient-appointments-side">
          <section className="patient-card patient-appointment-highlight">
            <div className="patient-side-heading"><h2>Próxima atención</h2><span>{next ? next.statusLabel : "Sin cita"}</span></div>
            {next && nextDate ? (
              <div className="patient-blue-appointment">
                <div className="patient-blue-appointment__date"><span>{nextDate.toLocaleDateString("es-PE", { month: "short" }).toUpperCase()}</span><strong>{nextDate.getDate()}</strong><small>{nextDate.getFullYear()}</small></div>
                <div className="patient-blue-appointment__info"><div><strong>{nextDate.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}</strong><span>{appointmentTypeLabel(next.appointmentType)}</span></div><p><Stethoscope className="size-3.5" aria-hidden="true" />{next.doctor?.name ?? "Profesional por asignar"}</p><small>{next.doctor?.specialty ?? "Especialidad no registrada"}</small></div>
                <div className="patient-blue-appointment__location"><MapPin className="size-3.5" aria-hidden="true" /><strong>{next.clinic?.name ?? "Clínica no registrada"}</strong><span>{next.notes ?? "Sin indicaciones adicionales"}</span></div>
                <div className="patient-blue-appointment__actions"><Link className="patient-action-button patient-action-button--primary" href="/patient/triaje">Preparar preconsulta</Link><Link className="patient-action-button" href="/patient/perfil">Revisar datos</Link></div>
              </div>
            ) : <div className="mt-3"><EmptyState message="No tienes una próxima cita programada." /></div>}
          </section>

          <section className="patient-card patient-reminders">
            <div className="patient-section-title"><h2>Antes de tu cita</h2><ShieldCheck className="size-4 text-accent" aria-hidden="true" /></div>
            <div className="patient-reminders__grid">
              <Link className="patient-reminder" href="/patient/triaje"><span className="patient-icon patient-icon--blue"><ClipboardCheck className="size-4" aria-hidden="true" /></span><span><strong>Preconsulta</strong><small>Registra tus síntomas</small></span></Link>
              <Link className="patient-reminder" href="/patient/resultados"><span className="patient-icon patient-icon--violet"><FlaskConical className="size-4" aria-hidden="true" /></span><span><strong>Resultados</strong><small>Revisa tus estudios</small></span></Link>
              <Link className="patient-reminder" href="/patient/recetas"><span className="patient-icon patient-icon--green"><Pill className="size-4" aria-hidden="true" /></span><span><strong>Recetas</strong><small>Consulta tratamientos</small></span></Link>
              <Link className="patient-reminder" href="/patient/perfil"><span className="patient-icon patient-icon--amber"><ShieldCheck className="size-4" aria-hidden="true" /></span><span><strong>Perfil</strong><small>Verifica tus datos</small></span></Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

const TRIAGE_LEVELS: Array<{
  value: PatientTriageLevel;
  title: string;
  helper: string;
  tone: string;
}> = [
  { value: "I", title: "Atención inmediata", helper: "Síntomas que percibes como críticos o súbitos.", tone: "patient-triage-level--critical" },
  { value: "II", title: "Muy urgente", helper: "Malestar intenso o deterioro rápido.", tone: "patient-triage-level--high" },
  { value: "III", title: "Urgente", helper: "Necesitas valoración prioritaria, sin describir una emergencia.", tone: "patient-triage-level--medium" },
  { value: "IV", title: "Menor urgencia", helper: "Síntomas estables que requieren revisión.", tone: "patient-triage-level--low" },
  { value: "V", title: "No urgente", helper: "Consulta preventiva o molestia leve y estable.", tone: "patient-triage-level--minimal" },
];

function TriageSummary({ triage }: { triage: PatientTriage }) {
  const level = TRIAGE_LEVELS.find((item) => item.value === triage.triageLevel);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-muted">Estado del formulario</span>
          <strong className="mt-1 block text-sm text-ink">
            {triage.triageStatus === "submitted" ? "Enviado al equipo clínico" : "Borrador guardado"}
          </strong>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${triage.triageStatus === "submitted" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}>
          {triage.triageStatus === "submitted" ? "Enviado" : "Borrador"}
        </span>
      </div>

      {level ? (
        <div className={`patient-triage-summary-level ${level.tone}`}>
          <span>Nivel {level.value}</span>
          <div><strong>{level.title}</strong><small>{level.helper}</small></div>
        </div>
      ) : null}

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-xs font-bold text-muted">Actualizado</dt><dd className="font-bold text-ink">{formatDate(triage.submittedAt ?? triage.recordedAt, true)}</dd></div>
        <div><dt className="text-xs font-bold text-muted">Prioridad clínica</dt><dd className="font-bold text-ink">{triage.triagePriority ?? "Pendiente de valoración clínica"}</dd></div>
        <div><dt className="text-xs font-bold text-muted">Temperatura</dt><dd className="font-bold text-ink">{formatNumber(triage.temperatureC, " °C")}</dd></div>
        <div><dt className="text-xs font-bold text-muted">Saturación</dt><dd className="font-bold text-ink">{formatNumber(triage.oxygenSaturation, "%")}</dd></div>
      </dl>
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
  triageLevel: PatientTriageLevel;
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
  triageLevel: ["triage_level"],
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
    triageLevel: triage?.triageLevel ?? "III",
    triageNotes: triage?.triageNotes ?? "",
  };
}

function nullableNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

const TRIAGE_VITAL_RULES = {
  temperatureC: { label: "Temperatura", min: 30, max: 45, suffix: "°C", step: "0.1" },
  systolicBp: { label: "Presión sistólica", min: 60, max: 250, suffix: "mmHg", step: "1" },
  diastolicBp: { label: "Presión diastólica", min: 30, max: 160, suffix: "mmHg", step: "1" },
  heartRate: { label: "Frecuencia cardiaca", min: 30, max: 220, suffix: "lpm", step: "1" },
  respiratoryRate: { label: "Frecuencia respiratoria", min: 5, max: 60, suffix: "rpm", step: "1" },
  oxygenSaturation: { label: "Saturación de oxígeno", min: 70, max: 100, suffix: "%", step: "1" },
} as const;

type TriageVitalField = keyof typeof TRIAGE_VITAL_RULES;

function validateTriageVitals(form: TriageForm): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const [field, rule] of Object.entries(TRIAGE_VITAL_RULES) as [TriageVitalField, (typeof TRIAGE_VITAL_RULES)[TriageVitalField]][]) {
    const raw = form[field].trim();
    if (!raw) continue;

    const value = Number(raw);
    if (!Number.isFinite(value)) {
      errors[field] = "Ingresa un valor numérico válido.";
      continue;
    }

    if (value < rule.min || value > rule.max) {
      errors[field] = rule.label + ": verifica el dato. El rango técnico aceptado es " + rule.min + "–" + rule.max + " " + rule.suffix + ".";
    }
  }

  const systolic = nullableNumber(form.systolicBp);
  const diastolic = nullableNumber(form.diastolicBp);
  if (
    systolic !== null
    && diastolic !== null
    && !errors.systolicBp
    && !errors.diastolicBp
    && diastolic >= systolic
  ) {
    errors.diastolicBp = "La presión diastólica debe ser menor que la presión sistólica.";
  }

  return errors;
}

function TriageView({ initialTriage }: { initialTriage: PatientTriage | null }) {
  const [triage, setTriage] = useState(initialTriage);
  const [form, setForm] = useState<TriageForm>(() => triageFormFromData(initialTriage));
  const [savingAs, setSavingAs] = useState<PatientTriageStatus | null>(null);
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

  async function persist(status: PatientTriageStatus) {
    const vitalErrors = validateTriageVitals(form);
    if (Object.keys(vitalErrors).length > 0) {
      setMessage(null);
      setError("Revisa los signos vitales marcados antes de guardar o enviar la preconsulta.");
      setFieldErrors((current) => ({ ...current, ...vitalErrors }));
      return;
    }

    setSavingAs(status);
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
      triage_level: form.triageLevel,
      triage_status: status,
      triage_notes: form.triageNotes.trim() || null,
    };

    try {
      const saved = await savePatientTriage(payload);
      setTriage(saved);
      setForm(triageFormFromData(saved));
      setMessage(status === "submitted"
        ? "Preconsulta enviada correctamente. El equipo clínico ya puede consultarla."
        : "Borrador guardado. Puedes volver y completarlo antes de enviarlo.");
    } catch (submitError) {
      setError(errorMessage(submitError));
      setFieldErrors(fieldErrorsFrom(submitError, TRIAGE_FIELD_ERROR_KEYS));
    } finally {
      setSavingAs(null);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void persist("submitted");
  }

  const fields = [
    { id: "temperatureC", ...TRIAGE_VITAL_RULES.temperatureC, inputMode: "decimal" as const },
    { id: "systolicBp", ...TRIAGE_VITAL_RULES.systolicBp, inputMode: "numeric" as const },
    { id: "diastolicBp", ...TRIAGE_VITAL_RULES.diastolicBp, inputMode: "numeric" as const },
    { id: "heartRate", ...TRIAGE_VITAL_RULES.heartRate, inputMode: "numeric" as const },
    { id: "respiratoryRate", ...TRIAGE_VITAL_RULES.respiratoryRate, inputMode: "numeric" as const },
    { id: "oxygenSaturation", ...TRIAGE_VITAL_RULES.oxygenSaturation, inputMode: "numeric" as const },
  ] as const;

  const clientVitalErrors = useMemo(() => validateTriageVitals(form), [form]);
  const effectiveFieldErrors = useMemo(
    () => ({ ...fieldErrors, ...clientVitalErrors }),
    [clientVitalErrors, fieldErrors],
  );
  const hasBlockingVitalErrors = Object.keys(clientVitalErrors).length > 0;
  const isSaving = savingAs !== null;
  const selectedLevel = TRIAGE_LEVELS.find((item) => item.value === form.triageLevel) ?? TRIAGE_LEVELS[2];
  const completedVitals = fields.filter((field) => form[field.id].trim() !== "").length;
  const statusLabel = triage?.triageStatus === "submitted" ? "Enviado" : triage?.triageStatus === "draft" ? "Borrador" : "Nuevo";
  const lastUpdated = triage ? formatDate(triage.submittedAt ?? triage.recordedAt, true) : "Sin registro";
  const levelTone = (level: PatientTriageLevel) => {
    if (level === "I") return "coral";
    if (level === "II" || level === "III") return "amber";
    if (level === "V") return "green";
    return "blue";
  };

  return (
    <div className="patient-page">
      <section className="patient-triage-banner">
        <div>
          <span className="patient-banner-kicker">PRECONSULTA SEGURA</span>
          <h2>Prepara tu atención antes de la cita</h2>
          <p>
            Registra cómo te sientes y, si cuentas con ellos, tus signos vitales. Esta información orienta el flujo de atención,
            pero no reemplaza la valoración de un profesional.
          </p>
        </div>
        <div className="patient-triage-banner__status">
          <span>ESTADO DE PRECONSULTA</span>
          <strong>{statusLabel}</strong>
          <small>Nivel orientativo seleccionado: {form.triageLevel} · {selectedLevel.title}</small>
        </div>
      </section>

      <section className="patient-triage-metrics" aria-label="Resumen de preconsulta">
        <article className="patient-triage-metric">
          <span className="patient-icon patient-icon--blue"><ClipboardCheck className="size-4" aria-hidden="true" /></span>
          <div><span>Nivel orientativo</span><strong>{form.triageLevel}</strong><small>{selectedLevel.title}</small></div>
        </article>
        <article className="patient-triage-metric">
          <span className="patient-icon patient-icon--green"><HeartPulse className="size-4" aria-hidden="true" /></span>
          <div><span>Signos vitales</span><strong>{completedVitals}/6</strong><small>Campos completados</small></div>
        </article>
        <article className="patient-triage-metric">
          <span className="patient-icon patient-icon--violet"><ShieldCheck className="size-4" aria-hidden="true" /></span>
          <div><span>Estado</span><strong>{statusLabel}</strong><small>Vinculado a tu perfil</small></div>
        </article>
        <article className="patient-triage-metric">
          <span className="patient-icon patient-icon--amber"><Clock3 className="size-4" aria-hidden="true" /></span>
          <div><span>Última actualización</span><strong className="patient-triage-metric__date">{triage ? "Registrada" : "—"}</strong><small>{lastUpdated}</small></div>
        </article>
      </section>

      <div className="patient-triage-layout">
        <main className="patient-appointments-main">
          <section className="patient-card patient-triage-form">
            <div className="patient-form-heading">
              <div>
                <h2><ClipboardCheck className="size-4 text-accent" aria-hidden="true" /> Formulario de preconsulta</h2>
                <p>Completa únicamente la información que conoces. Los signos vitales son opcionales.</p>
              </div>
              <span className="patient-form-tag">Privado y seguro</span>
            </div>

            <form aria-describedby={error ? "triage-form-error" : message ? "triage-form-message" : undefined} aria-busy={isSaving} onSubmit={submit}>
              <fieldset className="patient-priority-fieldset" disabled={isSaving}>
                <legend>¿Cómo percibes tu necesidad de atención?</legend>
                <div className="patient-priority-grid">
                  {TRIAGE_LEVELS.map((level) => {
                    const selected = form.triageLevel === level.value;
                    const tone = levelTone(level.value);
                    return (
                      <button
                        key={level.value}
                        className={"patient-priority-option patient-priority-option--" + tone + (selected ? " patient-priority-option--selected" : "")}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setField("triageLevel", level.value)}
                      >
                        <span><strong>Nivel {level.value}</strong><i aria-hidden="true" /></span>
                        <small><b>{level.title}</b><br />{level.helper}</small>
                      </button>
                    );
                  })}
                </div>
                <FieldError id="triage-level-error" message={fieldErrors.triageLevel} />
              </fieldset>

              <div className="patient-form-grid">
                <label className="patient-form-field--full" htmlFor="triage-reason">
                  Motivo de consulta *
                  <textarea
                    id="triage-reason"
                    rows={4}
                    required
                    minLength={10}
                    maxLength={2000}
                    value={form.reason}
                    onChange={(event) => setField("reason", event.target.value)}
                    disabled={isSaving}
                    aria-invalid={fieldErrors.reason ? true : undefined}
                    aria-describedby={fieldErrors.reason ? "triage-reason-error" : undefined}
                    placeholder="Cuéntanos qué sientes, desde cuándo comenzó y qué cambió hoy."
                  />
                  <FieldError id="triage-reason-error" message={fieldErrors.reason} />
                </label>

                {fields.map((field) => {
                  const id = "triage-" + field.id;
                  const fieldError = effectiveFieldErrors[field.id];
                  return (
                    <label htmlFor={id} key={field.id}>
                      {field.label}
                      <span className="patient-input-suffix">
                        <input
                          id={id}
                          type="number"
                          inputMode={field.inputMode}
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          value={form[field.id]}
                          onChange={(event) => setField(field.id, event.target.value)}
                          disabled={isSaving}
                          aria-invalid={fieldError ? true : undefined}
                          aria-describedby={fieldError ? id + "-error" : undefined}
                        />
                        <small>{field.suffix}</small>
                      </span>
                      <FieldError id={id + "-error"} message={fieldError} />
                    </label>
                  );
                })}

                <label className="patient-form-field--full" htmlFor="triage-notes">
                  Notas adicionales
                  <textarea
                    id="triage-notes"
                    rows={3}
                    maxLength={2000}
                    value={form.triageNotes}
                    onChange={(event) => setField("triageNotes", event.target.value)}
                    disabled={isSaving}
                    placeholder="Medicamentos tomados, alergias conocidas u otra información que consideres útil."
                    aria-invalid={fieldErrors.triageNotes ? true : undefined}
                    aria-describedby={fieldErrors.triageNotes ? "triage-notes-error" : undefined}
                  />
                  <FieldError id="triage-notes-error" message={fieldErrors.triageNotes} />
                </label>
              </div>

              {hasBlockingVitalErrors ? (
                <div className="patient-vitals-alert" role="alert" aria-live="assertive">
                  <span className="patient-vitals-alert__icon"><AlertTriangle className="size-5" aria-hidden="true" /></span>
                  <div>
                    <strong>Verifica los signos vitales</strong>
                    <p>Detectamos uno o más valores fuera del rango técnico permitido o una combinación inconsistente.</p>
                    <ul>
                      {Object.values(clientVitalErrors).map((item) => <li key={item}>{item}</li>)}
                    </ul>
                    <small>Corrige los datos para habilitar Guardar borrador y Enviar preconsulta.</small>
                  </div>
                </div>
              ) : null}

              {error ? <p className="rounded-xl bg-danger-soft p-3 text-sm font-bold text-danger" id="triage-form-error" role="alert">{error}</p> : null}
              {message ? <p className="rounded-xl bg-success-soft p-3 text-sm font-bold text-success" id="triage-form-message" role="status">{message}</p> : null}

              <div className="patient-form-actions">
                <button className="patient-action-button" type="button" disabled={isSaving || hasBlockingVitalErrors} onClick={() => void persist("draft")}>
                  {savingAs === "draft" ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
                  {savingAs === "draft" ? "Guardando…" : "Guardar borrador"}
                </button>
                <button className="patient-action-button patient-action-button--primary" type="submit" disabled={isSaving || hasBlockingVitalErrors}>
                  {savingAs === "submitted" ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="size-4" aria-hidden="true" />}
                  {savingAs === "submitted" ? "Enviando…" : "Enviar preconsulta"}
                </button>
              </div>
            </form>
          </section>
        </main>

        <aside className="patient-triage-side">
          <section className={"patient-card patient-priority-summary patient-priority-summary--" + levelTone(form.triageLevel)}>
            <div className="patient-priority-summary__headline">
              <span>NIVEL AUTORREPORTADO</span>
              <h2>Nivel {form.triageLevel} · {selectedLevel.title}</h2>
              <p>{selectedLevel.helper}</p>
            </div>
            <div className="patient-triage-legend" aria-label="Guía de niveles de atención">
              {TRIAGE_LEVELS.map((level) => {
                const tone = levelTone(level.value);
                return (
                  <div className={"patient-legend-item" + (level.value === form.triageLevel ? " patient-legend-item--selected" : "")} key={level.value}>
                    <i className={"patient-legend-dot patient-legend-dot--" + tone}>{level.value}</i>
                    <span><strong>{level.title}</strong><small>{level.helper}</small></span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="patient-card patient-patient-summary">
            <div className="patient-section-title">
              <h2>Registro más reciente</h2>
              <Clock3 className="size-4 text-muted" aria-hidden="true" />
            </div>
            <div className="mt-3">
              {triage ? <TriageSummary triage={triage} /> : <EmptyState message="Todavía no tienes una preconsulta guardada. Puedes comenzar y conservarla como borrador." />}
            </div>
          </section>

          <section className="patient-card patient-triage-emergency">
            <span className="patient-triage-emergency__icon"><AlertTriangle className="size-5" aria-hidden="true" /></span>
            <div>
              <h3>¿Tienes síntomas graves o súbitos?</h3>
              <p>Este formulario no es un servicio de emergencias. Busca atención inmediata mediante los canales locales cuando corresponda.</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}


function ResultsView({ results }: { results: PatientLaboratoryResult[] }) {
  const available = results.filter((result) => result.resultAvailable);
  const pending = results.filter((result) => !result.resultAvailable);
  const latest = [...available].sort((a, b) => new Date(b.resultAt ?? b.orderedAt ?? 0).getTime() - new Date(a.resultAt ?? a.orderedAt ?? 0).getTime())[0] ?? null;

  return (
    <div className="patient-page">
      <section className="patient-summary-grid patient-results-summary-grid" aria-label="Resumen de resultados">
        <article className="patient-summary-stat"><span className="patient-icon patient-icon--violet"><FlaskConical className="size-4" aria-hidden="true" /></span><div><span>Estudios</span><strong>{results.length}</strong><small>Registrados</small></div></article>
        <article className="patient-summary-stat"><span className="patient-icon patient-icon--green"><CheckCircle2 className="size-4" aria-hidden="true" /></span><div><span>Disponibles</span><strong>{available.length}</strong><small>Con resultado</small></div></article>
        <article className="patient-summary-stat"><span className="patient-icon patient-icon--amber"><Clock3 className="size-4" aria-hidden="true" /></span><div><span>En proceso</span><strong>{pending.length}</strong><small>Pendientes</small></div></article>
        <article className="patient-summary-stat"><span className="patient-icon patient-icon--blue"><ShieldCheck className="size-4" aria-hidden="true" /></span><div><span>Privacidad</span><strong>100%</strong><small>Perfil autenticado</small></div></article>
      </section>

      <div className="patient-results-layout">
        <main className="patient-results-main">
          <section className="patient-card patient-results-table">
            <div className="patient-table-toolbar patient-table-toolbar--results"><div className="patient-section-title"><h2>Estudios y resultados</h2></div><span className="patient-form-tag">{results.length} {results.length === 1 ? "estudio" : "estudios"}</span></div>
            {results.length ? (
              <div className="patient-table-scroll">
                <table className="patient-data-table patient-data-table--results">
                  <thead><tr><th>Estudio</th><th>Fecha</th><th>Profesional</th><th>Clínica</th><th>Prioridad</th><th>Estado</th></tr></thead>
                  <tbody>
                    {results.map((result) => (
                      <tr key={result.id}>
                        <td><span className="patient-result-study"><span className="patient-icon patient-icon--violet"><FlaskConical className="size-4" aria-hidden="true" /></span><span><strong>{result.studyName}</strong><small>{result.resultAvailable ? result.resultSummary ?? "Resultado disponible" : "Resultado aún no disponible"}</small></span></span></td>
                        <td><strong>{formatDate(result.resultAt ?? result.orderedAt, true)}</strong><small>{result.resultAvailable ? "Publicado" : "Solicitado"}</small></td>
                        <td><strong>{result.doctor?.name ?? "No registrado"}</strong><small>{result.doctor?.specialty ?? "Especialidad no registrada"}</small></td>
                        <td>{result.clinic?.name ?? "No registrada"}</td>
                        <td className="patient-table-accent">{result.priority || "Normal"}</td>
                        <td><StatusBadge label={result.statusLabel} value={result.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div className="p-4"><EmptyState message="Cuando tu equipo clínico publique resultados aparecerán aquí, organizados por fecha y estado." /></div>}
          </section>
        </main>

        <aside className="patient-results-side">
          <section className="patient-card patient-highlighted-result">
            <div className="patient-side-heading"><h2>Resultado más reciente</h2><span>{latest ? "Disponible" : "Sin datos"}</span></div>
            {latest ? <><div className="patient-highlighted-result__item"><span className="patient-icon patient-icon--violet"><FlaskConical className="size-4" aria-hidden="true" /></span><div><strong>{latest.studyName}</strong><span>{formatDate(latest.resultAt ?? latest.orderedAt, true)}</span></div><StatusBadge label={latest.statusLabel} value={latest.status} /></div>{latest.resultSummary ? <div className="patient-highlighted-result__interpretation"><strong>Resumen registrado</strong><p>{latest.resultSummary}</p></div> : null}</> : <div className="mt-3"><EmptyState message="Aún no tienes resultados publicados." /></div>}
          </section>

          <section className="patient-card patient-pending-results">
            <div className="patient-side-heading"><h2>Seguimiento</h2><span>{pending.length} pendientes</span></div>
            {pending.length ? pending.slice(0,3).map((result) => <div className="patient-pending-item" key={result.id}><span className="patient-icon patient-icon--amber"><Clock3 className="size-4" aria-hidden="true" /></span><div><strong>{result.studyName}</strong><span>{formatDate(result.orderedAt, true)}</span></div><StatusBadge label={result.statusLabel} value={result.status} /></div>) : <div className="mt-3"><EmptyState message="No tienes estudios pendientes." /></div>}
          </section>
        </aside>
      </div>
    </div>
  );
}

function HistoryView({ consultations }: { consultations: PatientConsultation[] }) {
  const [tab, setTab] = useState<"all" | "consultations" | "diagnoses" | "procedures">("all");
  const [year, setYear] = useState<string>("all");

  const years = useMemo(
    () => Array.from(new Set(
      consultations
        .map((consultation) => consultation.createdAt ? new Date(consultation.createdAt).getFullYear() : null)
        .filter((value): value is number => value !== null && Number.isFinite(value)),
    )).sort((left, right) => right - left),
    [consultations],
  );

  const diagnosisCount = useMemo(
    () => new Set(
      consultations.flatMap((consultation) => consultation.codings)
        .filter((coding) => ["diagnosis", "problem"].includes(coding.category))
        .map((coding) => coding.system + "|" + coding.code),
    ).size,
    [consultations],
  );

  const specialtyCount = useMemo(
    () => new Set(
      consultations.map((consultation) => consultation.doctor?.specialty).filter((value): value is string => Boolean(value)),
    ).size,
    [consultations],
  );

  const codingCount = useMemo(
    () => new Set(
      consultations.flatMap((consultation) => consultation.codings)
        .map((coding) => coding.system + "|" + coding.code),
    ).size,
    [consultations],
  );

  const filtered = useMemo(() => consultations.filter((consultation) => {
    if (year !== "all") {
      if (!consultation.createdAt || String(new Date(consultation.createdAt).getFullYear()) !== year) return false;
    }
    if (tab === "diagnoses") return consultation.codings.some((coding) => ["diagnosis", "problem"].includes(coding.category));
    if (tab === "procedures") return consultation.codings.some((coding) => coding.category === "procedure");
    return true;
  }), [consultations, tab, year]);

  const latest = [...consultations].sort((a,b) => new Date(b.completedAt ?? b.createdAt ?? 0).getTime() - new Date(a.completedAt ?? a.createdAt ?? 0).getTime())[0] ?? null;

  return (
    <div className="patient-page">
      <section className="patient-summary-grid" aria-label="Resumen del historial clínico">
        <article className="patient-summary-stat"><span className="patient-icon patient-icon--blue"><CalendarDays className="size-4" aria-hidden="true" /></span><div><span>Consultas</span><strong>{consultations.length}</strong><small>Atenciones registradas</small></div></article>
        <article className="patient-summary-stat"><span className="patient-icon patient-icon--coral"><HeartPulse className="size-4" aria-hidden="true" /></span><div><span>Diagnósticos</span><strong>{diagnosisCount}</strong><small>Conceptos identificados</small></div></article>
        <article className="patient-summary-stat"><span className="patient-icon patient-icon--violet"><Stethoscope className="size-4" aria-hidden="true" /></span><div><span>Especialidades</span><strong>{specialtyCount}</strong><small>Profesionales atendidos</small></div></article>
        <article className="patient-summary-stat"><span className="patient-icon patient-icon--green"><FileText className="size-4" aria-hidden="true" /></span><div><span>Codificaciones</span><strong>{codingCount}</strong><small>Registros clínicos</small></div></article>
      </section>

      <div className="patient-history-layout">
        <main className="patient-history-main">
          <section className="patient-card patient-history-card">
            <div className="patient-history-toolbar">
              <div className="patient-tabs" role="tablist" aria-label="Filtrar historial clínico">
                {([
                  ["all", "Todo"],
                  ["consultations", "Consultas"],
                  ["diagnoses", "Diagnósticos"],
                  ["procedures", "Procedimientos"],
                ] as const).map(([value,label]) => (
                  <button key={value} className={tab === value ? "patient-tab patient-tab--active" : "patient-tab"} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)}>{label}</button>
                ))}
              </div>
              <label className="patient-select-wrap patient-filter-button">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                <span className="sr-only">Filtrar historial por año</span>
                <select value={year} onChange={(event) => setYear(event.target.value)}>
                  <option value="all">Todas las fechas</option>
                  {years.map((item) => <option key={item} value={String(item)}>{item}</option>)}
                </select>
              </label>
            </div>

            {filtered.length ? (
              <div className="patient-history-list">
                {filtered.map((consultation) => {
                  const relevantCodings = tab === "diagnoses"
                    ? consultation.codings.filter((coding) => ["diagnosis","problem"].includes(coding.category))
                    : tab === "procedures"
                      ? consultation.codings.filter((coding) => coding.category === "procedure")
                      : consultation.codings;
                  return (
                    <article className="patient-history-row" key={consultation.id}>
                      <div className="patient-history-row__date"><strong>{formatDate(consultation.createdAt, true)}</strong><small>{consultation.clinic?.name ?? "Clínica no registrada"}</small></div>
                      <span className="patient-history-marker patient-history-marker--blue"><Stethoscope className="size-3.5" aria-hidden="true" /></span>
                      <div className="patient-history-row__content">
                        <strong>{consultation.chiefComplaint}</strong>
                        <div><span>{consultation.doctor?.name ?? "Profesional no registrado"}</span><i aria-hidden="true" /><span>{consultation.doctor?.specialty ?? "Especialidad no registrada"}</span></div>
                        <p>{consultation.objective ?? (relevantCodings[0] ? relevantCodings[0].display + " · " + relevantCodings[0].code : "Sin evolución clínica visible")}</p>
                      </div>
                      <StatusBadge label={consultation.statusLabel} value={consultation.status} />
                    </article>
                  );
                })}
              </div>
            ) : <div className="p-4"><EmptyState message="No hay registros que coincidan con los filtros seleccionados." /></div>}
          </section>
        </main>

        <aside className="patient-history-side">
          <section className="patient-card patient-health-summary">
            <div className="patient-side-heading"><h2>Resumen clínico</h2><span>Actualizado</span></div>
            <div className="patient-health-summary__list">
              <div className="patient-health-summary__item"><span className="patient-icon patient-icon--blue"><CalendarDays className="size-4" aria-hidden="true" /></span><span><strong>Última consulta</strong><small>Registro más reciente</small></span><b>{latest ? formatDate(latest.completedAt ?? latest.createdAt) : "Sin datos"}</b></div>
              <div className="patient-health-summary__item"><span className="patient-icon patient-icon--coral"><HeartPulse className="size-4" aria-hidden="true" /></span><span><strong>Diagnósticos</strong><small>Codificados</small></span><b>{diagnosisCount}</b></div>
              <div className="patient-health-summary__item"><span className="patient-icon patient-icon--violet"><Stethoscope className="size-4" aria-hidden="true" /></span><span><strong>Especialidades</strong><small>Atendidas</small></span><b>{specialtyCount}</b></div>
            </div>
          </section>

          <section className="patient-card patient-next-control">
            <div className="patient-side-heading"><h2>Continuidad de atención</h2><ShieldCheck className="size-4 text-accent" aria-hidden="true" /></div>
            <div className="patient-next-control__body"><span className="patient-icon patient-icon--green"><CheckCircle2 className="size-4" aria-hidden="true" /></span><div><strong>Tu historial se alimenta con cada atención finalizada.</strong><b>Consulta tus próximas citas</b><small>La nueva información aparecerá aquí cuando sea registrada por el equipo clínico.</small></div></div>
            <Link className="patient-table-action" href="/patient/citas">Ver mis citas</Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

function PrescriptionsView({ prescriptions }: { prescriptions: PatientPrescription[] }) {
  const active = prescriptions.filter((prescription) => prescription.status === "active");
  const completed = prescriptions.filter((prescription) => ["completed", "expired"].includes(prescription.status));
  const featured = active[0] ?? prescriptions[0] ?? null;

  return (
    <div className="patient-page">
      <section className="patient-summary-grid" aria-label="Resumen de recetas">
        <article className="patient-summary-stat"><span className="patient-icon patient-icon--blue"><FileText className="size-4" aria-hidden="true" /></span><div><span>Recetas</span><strong>{prescriptions.length}</strong><small>Registradas</small></div></article>
        <article className="patient-summary-stat"><span className="patient-icon patient-icon--green"><HeartPulse className="size-4" aria-hidden="true" /></span><div><span>Activas</span><strong>{active.length}</strong><small>Tratamientos vigentes</small></div></article>
        <article className="patient-summary-stat"><span className="patient-icon patient-icon--violet"><Pill className="size-4" aria-hidden="true" /></span><div><span>Finalizadas</span><strong>{completed.length}</strong><small>Completadas o vencidas</small></div></article>
        <article className="patient-summary-stat"><span className="patient-icon patient-icon--amber"><ShieldCheck className="size-4" aria-hidden="true" /></span><div><span>Fuente</span><strong>Clínica</strong><small>Prescripción registrada</small></div></article>
      </section>

      <div className="patient-prescriptions-layout">
        <main className="patient-prescriptions-main">
          <section className="patient-card patient-prescriptions-table">
            <div className="patient-table-toolbar patient-table-toolbar--results"><div className="patient-section-title"><h2>Tratamientos indicados</h2></div><span className="patient-form-tag">{prescriptions.length} {prescriptions.length === 1 ? "receta" : "recetas"}</span></div>
            {prescriptions.length ? (
              <div className="patient-table-scroll">
                <table className="patient-data-table patient-data-table--prescriptions">
                  <thead><tr><th>Medicamento</th><th>Dosis</th><th>Frecuencia</th><th>Duración</th><th>Profesional</th><th>Emisión</th><th>Estado</th></tr></thead>
                  <tbody>
                    {prescriptions.map((prescription) => (
                      <tr key={prescription.id}>
                        <td><span className="patient-result-study"><span className="patient-icon patient-icon--green"><Pill className="size-4" aria-hidden="true" /></span><span><strong>{prescription.medication}</strong><small>{prescription.notes ?? "Sin indicaciones adicionales"}</small></span></span></td>
                        <td><strong>{prescription.dosage ?? "No registrada"}</strong></td>
                        <td><strong>{prescription.frequency ?? "No registrada"}</strong></td>
                        <td>{prescription.durationDays === null ? "No registrada" : prescription.durationDays + " días"}</td>
                        <td><strong>{prescription.doctor?.name ?? "No registrado"}</strong><small>{prescription.doctor?.specialty ?? "Especialidad no registrada"}</small></td>
                        <td><strong>{formatDate(prescription.issuedAt)}</strong>{prescription.expiresAt ? <small>Vence {formatDate(prescription.expiresAt)}</small> : null}</td>
                        <td><StatusBadge label={prescription.statusLabel} value={prescription.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div className="p-4"><EmptyState message="No hay recetas vinculadas a tu perfil." /></div>}
          </section>
        </main>

        <aside className="patient-prescriptions-side">
          <section className="patient-card patient-featured-prescription">
            <div className="patient-side-heading"><h2>Tratamiento destacado</h2><span>{featured ? featured.statusLabel : "Sin receta"}</span></div>
            {featured ? <>
              <div className="patient-featured-prescription__body"><span className="patient-icon patient-icon--green"><Pill className="size-4" aria-hidden="true" /></span><div><strong>{featured.medication}</strong><span>{featured.dosage ?? "Dosis no registrada"} · {featured.frequency ?? "Frecuencia no registrada"}</span><small>{featured.doctor?.name ?? "Profesional no registrado"}</small></div></div>
              <div className="patient-featured-prescription__indication"><strong>Indicaciones registradas</strong><p>{featured.notes ?? "Sigue la dosis, frecuencia y duración indicadas por tu profesional."}</p></div>
            </> : <div className="mt-3"><EmptyState message="Aún no tienes tratamientos registrados." /></div>}
          </section>

          <section className="patient-card patient-medication-reminders">
            <div className="patient-side-heading"><h2>Uso seguro de medicamentos</h2><ShieldCheck className="size-4 text-accent" aria-hidden="true" /></div>
            <div className="patient-medication-reminders__list">
              <div className="patient-medication-reminder"><span className="patient-icon patient-icon--blue"><Info className="size-4" aria-hidden="true" /></span><span><strong>No modifiques la dosis</strong><small>Consulta con tu médico ante cualquier cambio.</small></span></div>
              <div className="patient-medication-reminder"><span className="patient-icon patient-icon--amber"><Clock3 className="size-4" aria-hidden="true" /></span><span><strong>Revisa la vigencia</strong><small>Verifica fechas e indicaciones registradas.</small></span></div>
            </div>
            <Link className="patient-table-action mt-3" href="/patient/citas">Consultar mis citas</Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

function MembershipView({ membership }: { membership: PatientMembershipData }) {
  if (!membership.available) {
    return (
      <div className="patient-page">
        <section className="patient-membership-hero">
          <div className="patient-membership-hero__copy">
            <span className="patient-membership-kicker"><ShieldCheck className="size-3.5" aria-hidden="true" /> COBERTURA HIPOCRATIQ</span>
            <h2>Tu cobertura clínica en un solo lugar</h2>
            <p>{membership.message}</p>
            <div className="patient-membership-hero__actions"><Link className="patient-action-button patient-action-button--primary" href="/patient/perfil">Revisar mi perfil</Link><Link className="patient-action-button" href="/patient/citas">Ver mis citas</Link></div>
          </div>
          <div className="patient-membership-hero__details">
            <div><span>Estado</span><strong>No disponible</strong></div>
            <div><span>Fuente</span><strong>Clínica</strong></div>
            <div><span>Privacidad</span><strong>Institucional</strong></div>
            <div><span>Acceso</span><strong>Perfil autenticado</strong></div>
          </div>
        </section>

        <section className="patient-card patient-membership-recommendation mt-4">
          <h2><Info className="size-4" aria-hidden="true" /> ¿Qué puedes hacer?</h2>
          <strong>Verifica que tu perfil esté vinculado a la clínica correcta.</strong>
          <p>La cobertura depende de la relación registrada por la institución. No se generan membresías individuales ficticias desde el portal.</p>
          <Link className="patient-table-action" href="/patient/perfil">Revisar información</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="patient-page">
      <div className="patient-membership-layout">
        <main className="patient-membership-main">
          <section className="patient-membership-hero">
            <div className="patient-membership-hero__copy">
              <span className="patient-membership-kicker"><ShieldCheck className="size-3.5" aria-hidden="true" /> COBERTURA ACTIVA</span>
              <h2>{membership.plan.name}</h2>
              <p>{membership.plan.description ?? membership.message}</p>
              <div className="patient-membership-hero__actions"><Link className="patient-action-button patient-action-button--primary" href="/patient/citas">Ver mis citas</Link><Link className="patient-action-button" href="/patient/perfil">Datos del paciente</Link></div>
            </div>
            <div className="patient-membership-hero__details">
              <div><span>Clínica</span><strong>{membership.clinic?.name ?? "No registrada"}</strong></div>
              <div><span>Estado</span><strong>{membership.coverage.status}</strong></div>
              <div><span>Inicio</span><strong>{membership.coverage.startsAt ? formatDate(membership.coverage.startsAt) : "No registrado"}</strong></div>
              <div><span>Vigencia</span><strong>{membership.coverage.endsAt ? formatDate(membership.coverage.endsAt) : "Sin fecha de término"}</strong></div>
            </div>
          </section>

          <section className="patient-card patient-membership-benefits">
            <div className="patient-section-title"><h2>Beneficios y funciones disponibles</h2><span className="patient-form-tag">{membership.plan.features.length} funciones</span></div>
            <div className="patient-membership-benefits__grid">
              {membership.plan.features.length ? membership.plan.features.map((feature,index) => (
                <article className="patient-membership-benefit" key={feature}>
                  <span className={"patient-icon " + (index % 3 === 0 ? "patient-icon--blue" : index % 3 === 1 ? "patient-icon--green" : "patient-icon--violet")}><CheckCircle2 className="size-4" aria-hidden="true" /></span>
                  <span><strong>{feature}</strong><small>Incluido según la cobertura de tu clínica.</small></span>
                </article>
              )) : <EmptyState message="La clínica administra las funciones disponibles para este plan." />}
            </div>
          </section>

          <div className="patient-membership-bottom-grid">
            <section className="patient-card patient-monthly-usage">
              <div className="patient-side-heading"><h2>Uso del portal</h2><span>Paciente</span></div>
              <div className="patient-usage-list">
                <div className="patient-usage-row"><div><strong>Citas y seguimiento</strong><small>Acceso al calendario registrado</small></div><span><i className="patient-usage-bar patient-usage-bar--blue" style={{ width: "100%" }} /></span></div>
                <div className="patient-usage-row"><div><strong>Expediente clínico</strong><small>Consulta de historial y resultados</small></div><span><i className="patient-usage-bar patient-usage-bar--green" style={{ width: "100%" }} /></span></div>
                <div className="patient-usage-row"><div><strong>Preconsulta</strong><small>Formulario previo a la atención</small></div><span><i className="patient-usage-bar patient-usage-bar--amber" style={{ width: "100%" }} /></span></div>
              </div>
            </section>

            <section className="patient-card patient-membership-recommendation">
              <h2><ShieldCheck className="size-4" aria-hidden="true" /> Cobertura institucional</h2>
              <strong>Tu acceso está vinculado a {membership.clinic?.name ?? "tu clínica"}.</strong>
              <p>Los datos comerciales y de facturación pertenecen a la institución y no se exponen en el portal del paciente.</p>
              <Link className="patient-table-action" href="/patient/perfil">Revisar perfil</Link>
            </section>
          </div>
        </main>

        <aside className="patient-membership-side">
          <section className="patient-card patient-membership-plan-summary">
            <div className="patient-side-heading"><h2>Resumen del plan</h2><span>Activo</span></div>
            <strong className="patient-membership-price">Institucional</strong>
            <p>{membership.message}</p>
            <dl>
              <div><dt><ShieldCheck className="size-3.5" aria-hidden="true" /> Plan</dt><dd>{membership.plan.name}</dd></div>
              <div><dt><CalendarDays className="size-3.5" aria-hidden="true" /> Inicio</dt><dd>{membership.coverage.startsAt ? formatDate(membership.coverage.startsAt) : "No registrado"}</dd></div>
              <div><dt><CheckCircle2 className="size-3.5" aria-hidden="true" /> Estado</dt><dd>{membership.coverage.status}</dd></div>
            </dl>
          </section>

          <section className="patient-card patient-membership-support">
            <div className="patient-side-heading"><h2>¿Necesitas ayuda?</h2><Info className="size-4 text-accent" aria-hidden="true" /></div>
            <p>Si detectas datos de cobertura que no corresponden, revisa primero tu perfil y luego comunícate con la clínica.</p>
            <Link className="patient-whatsapp-button" href="/patient/perfil">Revisar mis datos</Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

function EpidemiologyView({ epidemiology }: { epidemiology: PatientEpidemiologyData }) {
  const maximum = Math.max(1, ...epidemiology.trend.map((point) => point.appointments + point.consultations + point.laboratoryOrders));

  return (
    <div className="patient-page">
      <div className="patient-premium-intro">
        <div><span className="patient-premium-intro__eyebrow">SALUD Y DATOS</span><h2>IA epidemiológica</h2><p>Resumen privado de tu actividad clínica y de tu participación voluntaria en análisis anonimizados.</p></div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${epidemiology.participation.consentActive ? "bg-success-soft text-success" : "bg-surface-subtle text-muted"}`}><ShieldCheck className="size-4" aria-hidden="true" />{epidemiology.participation.consentActive ? "Consentimiento activo" : "Participación desactivada"}</span>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Actividad clínica de los últimos 90 días">
        <Metric icon={CalendarDays} label="Citas" value={String(epidemiology.metrics.appointments)} />
        <Metric icon={Stethoscope} label="Consultas" value={String(epidemiology.metrics.consultations)} />
        <Metric icon={FlaskConical} label="Resultados disponibles" value={String(epidemiology.metrics.availableResults)} />
        <Metric icon={HeartPulse} label="Recetas activas" value={String(epidemiology.metrics.activePrescriptions)} />
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,.85fr)]">
        <Card className="patient-premium-card">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-sm font-extrabold text-ink">Actividad registrada</h3><p className="mt-1 text-xs text-muted">Últimos {epidemiology.period.days} días · sin inferencias clínicas individuales.</p></div><span className="text-[0.65rem] font-bold text-muted">{formatDate(epidemiology.generatedAt, true)}</span></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {epidemiology.trend.map((point) => {
              const total = point.appointments + point.consultations + point.laboratoryOrders;
              const height = Math.max(8, Math.round((total / maximum) * 100));
              return (
                <div className="patient-epidemiology-period" key={point.month}>
                  <div className="patient-epidemiology-period__chart" aria-hidden="true"><span style={{ height: `${height}%` }} /></div>
                  <strong>{point.label}</strong>
                  <span>{total} eventos</span>
                  <small>{point.appointments} citas · {point.consultations} consultas · {point.laboratoryOrders} laboratorios</small>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className={epidemiology.participation.consentActive ? "border-success/25" : "border-accent/20"}>
            <div className="flex items-start gap-3"><ShieldCheck className={`mt-0.5 size-5 shrink-0 ${epidemiology.participation.consentActive ? "text-success" : "text-accent"}`} aria-hidden="true" /><div><h3 className="text-sm font-extrabold text-ink">Control de privacidad</h3><p className="mt-1 text-xs leading-relaxed text-muted">{epidemiology.message}</p>{epidemiology.participation.policyVersion ? <p className="mt-2 text-[0.65rem] font-bold text-muted">Política {epidemiology.participation.policyVersion}</p> : null}<Link className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-accent px-4 text-xs font-extrabold text-paper hover:bg-accent-hover" href="/patient/perfil">Gestionar consentimiento</Link></div></div>
          </Card>
          <Card className="bg-surface-subtle">
            <div className="flex items-start gap-3"><Info className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden="true" /><p className="text-xs leading-relaxed text-muted">{epidemiology.disclaimer}</p></div>
          </Card>
        </div>
      </div>
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
  return <label className="patient-profile-field" htmlFor={id}>{label}{required ? <span className="text-danger">*</span> : null}<input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} /><FieldError id={`${id}-error`} message={error} /></label>;
}

const CONSENT_OPTIONS: Array<{ scope: PatientConsentScope; title: string; description: string }> = [
  { scope: "clinical_care", title: "Atención clínica", description: "Autoriza registrar y utilizar tus datos en el proceso asistencial." },
  { scope: "data_processing", title: "Tratamiento de datos", description: "Registra tu consentimiento explícito para el tratamiento de información dentro de HIPOCRATIQ." },
  { scope: "telemedicine", title: "Telemedicina", description: "Autoriza el uso de tus datos durante atenciones remotas cuando el servicio esté habilitado." },
  { scope: "ai_clinical_assistance", title: "Asistencia clínica con IA", description: "Autoriza funciones de apoyo clínico con IA; las decisiones continúan a cargo del profesional." },
  { scope: "epidemiology_anonymized", title: "Analítica epidemiológica anonimizada", description: "Autoriza el uso de datos anonimizados o agregados para análisis epidemiológico." },
];

function ConsentPreferencesCard() {
  const [consents, setConsents] = useState<PatientConsent[]>([]);
  const [policyVersion, setPolicyVersion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState<PatientConsentScope | null>(null);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [consentMessage, setConsentMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getPatientConsents(controller.signal)
      .then((settings) => {
        setConsents(settings.consents);
        setPolicyVersion(settings.policyVersion);
      })
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) setConsentError(errorMessage(caught));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  function activeConsent(scope: PatientConsentScope): PatientConsent | undefined {
    return consents.find((consent) =>
      consent.scope === scope
      && consent.policyVersion === policyVersion
      && consent.status === "granted"
    );
  }

  async function toggle(scope: PatientConsentScope): Promise<void> {
    if (changing || !policyVersion) return;
    setChanging(scope);
    setConsentError(null);
    setConsentMessage(null);
    try {
      const active = activeConsent(scope);
      const updated = active
        ? await revokePatientConsent(active.id)
        : await grantPatientConsent(scope, policyVersion);
      setConsents((current) => {
        const withoutUpdated = current.filter((consent) => consent.id !== updated.id);
        return [updated, ...withoutUpdated];
      });
      const option = CONSENT_OPTIONS.find((item) => item.scope === scope);
      setConsentMessage(
        updated.status === "granted"
          ? `${option?.title ?? "Consentimiento"} autorizado correctamente.`
          : `${option?.title ?? "Consentimiento"} revocado correctamente.`,
      );
    } catch (caught) {
      setConsentError(errorMessage(caught));
    } finally {
      setChanging(null);
    }
  }

  return (
    <Card>
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-extrabold text-ink">Consentimientos clínicos</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Política {policyVersion ?? "vigente"}. Cada autorización se registra por separado, puede revocarse
            y mantiene trazabilidad.
          </p>
        </div>
      </div>
      {loading ? (
        <p className="mt-4 flex items-center gap-2 text-xs font-bold text-muted"><LoaderCircle className="size-4 animate-spin" />Cargando consentimientos…</p>
      ) : (
        <div className="mt-4 space-y-3">
          {CONSENT_OPTIONS.map((option) => {
            const active = activeConsent(option.scope);
            return (
              <div className="rounded-lg border border-line bg-surface-subtle p-3" key={option.scope}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-extrabold text-ink">{option.title}</h3>
                    <p className="mt-1 text-[0.7rem] leading-relaxed text-muted">{option.description}</p>
                  </div>
                  <button
                    className={active
                      ? "min-h-11 rounded-lg border border-danger/25 px-3 text-[0.65rem] font-extrabold text-danger hover:bg-danger-soft focus-visible:outline-3 focus-visible:outline-focus"
                      : "min-h-11 rounded-lg border border-success/25 px-3 text-[0.65rem] font-extrabold text-success hover:bg-success-soft focus-visible:outline-3 focus-visible:outline-focus"}
                    type="button"
                    aria-pressed={Boolean(active)}
                    aria-busy={changing === option.scope}
                    disabled={changing !== null || !policyVersion}
                    onClick={() => void toggle(option.scope)}
                  >
                    {changing === option.scope ? "Procesando…" : active ? "Revocar" : "Autorizar"}
                  </button>
                </div>
                <p className="mt-2 text-[0.65rem] font-bold text-muted">{active ? "Activo" : "No autorizado en esta versión"}</p>
              </div>
            );
          })}
        </div>
      )}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {consentMessage}
      </div>
      {consentMessage ? <p className="mt-3 rounded-lg bg-success-soft p-3 text-xs font-bold text-success" role="status">{consentMessage}</p> : null}
      {consentError ? <p className="mt-3 rounded-lg bg-danger-soft p-3 text-xs font-bold text-danger" role="alert">{consentError}</p> : null}
    </Card>
  );
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
      <section className="patient-profile-hero">
        <span className="patient-profile-hero__avatar" aria-hidden="true">{initials}</span>
        <div className="patient-profile-hero__copy">
          <span>PERFIL DEL PACIENTE</span>
          <h2>{profile.name ?? "Paciente HIPOCRATIQ"}</h2>
          <p>{profile.clinic?.name ?? "Sin clínica vinculada"} · {profile.patientCode}</p>
        </div>
        <div className="patient-profile-hero__status"><ShieldCheck className="size-4" aria-hidden="true" /><span>Cuenta autenticada</span></div>
      </section>

      <form className="patient-profile-layout" aria-describedby={error ? "profile-form-error" : message ? "profile-form-message" : undefined} aria-busy={saving} onSubmit={submit}>
        <main className="patient-profile-main">
          <section className="patient-card patient-profile-personal">
            <div className="patient-profile-card-heading"><h2>Información personal</h2><span className="patient-form-tag"><ShieldCheck className="size-3.5" aria-hidden="true" /> Perfil verificado</span></div>
            <div className="patient-profile-personal__body">
              <div className="patient-profile-avatar-column">
                <span className="patient-profile-avatar" aria-hidden="true">{initials}</span>
                <strong className="text-sm font-extrabold text-ink">{profile.name ?? "Paciente"}</strong>
                <small>{profile.patientCode}</small>
              </div>
              <div className="patient-profile-form-grid">
                <ProfileField id="profile-name" label="Nombre completo" value={form.name} onChange={(value) => setField("name", value)} required error={fieldErrors.name} />
                <ProfileField id="profile-document-type" label="Tipo de documento" value={form.documentType} onChange={(value) => setField("documentType", value)} error={fieldErrors.documentType} />
                <ProfileField id="profile-document-number" label="Número de documento" value={form.documentNumber} onChange={(value) => setField("documentNumber", value)} error={fieldErrors.documentNumber} />
                <ProfileField id="profile-birth-date" label="Fecha de nacimiento" value={form.dateOfBirth} onChange={(value) => setField("dateOfBirth", value)} type="date" error={fieldErrors.dateOfBirth} />
                <label className="patient-profile-field" htmlFor="profile-sex">Sexo<select id="profile-sex" value={form.sex} onChange={(event) => setField("sex", event.target.value)} aria-invalid={fieldErrors.sex ? true : undefined} aria-describedby={fieldErrors.sex ? "profile-sex-error" : undefined}><option value="">No registrado</option><option value="Femenino">Femenino</option><option value="Masculino">Masculino</option><option value="Otro">Otro</option></select><FieldError id="profile-sex-error" message={fieldErrors.sex} /></label>
                <label className="patient-profile-field" htmlFor="profile-country">País<select id="profile-country" value={form.countryCode} onChange={(event) => setField("countryCode", event.target.value)} required aria-invalid={fieldErrors.countryCode ? true : undefined} aria-describedby={fieldErrors.countryCode ? "profile-country-error" : undefined}><option value="">Selecciona un país</option><option value="PE">Perú</option><option value="MX">México</option><option value="US">Estados Unidos</option></select><FieldError id="profile-country-error" message={fieldErrors.countryCode} /></label>
              </div>
            </div>
          </section>

          <section className="patient-card patient-profile-contact">
            <div className="patient-profile-card-heading"><h2>Contacto y ubicación</h2><span className="patient-form-tag">Editable</span></div>
            <div className="patient-profile-contact-grid">
              <ProfileField id="profile-email" label="Correo electrónico" value={form.email} onChange={(value) => setField("email", value)} type="email" error={fieldErrors.email} />
              <ProfileField id="profile-phone" label="Teléfono" value={form.phoneNumber} onChange={(value) => setField("phoneNumber", value)} required error={fieldErrors.phoneNumber} />
              <label className="patient-profile-field" htmlFor="profile-whatsapp"><span>WhatsApp</span><span className="patient-profile-consent-row"><input id="profile-whatsapp" className="size-4 accent-accent" type="checkbox" checked={form.whatsappConsent} onChange={(event) => setField("whatsappConsent", event.target.checked)} disabled={saving} /><strong>{form.whatsappConsent ? "Autorizado" : "Desactivado"}</strong></span><FieldError id="profile-whatsapp-error" message={fieldErrors.whatsappConsent} /></label>
              <label className="patient-profile-field patient-profile-field--wide" htmlFor="profile-address">Dirección<textarea id="profile-address" rows={3} value={form.address} onChange={(event) => setField("address", event.target.value)} aria-invalid={fieldErrors.address ? true : undefined} aria-describedby={fieldErrors.address ? "profile-address-error" : undefined} /><FieldError id="profile-address-error" message={fieldErrors.address} /></label>
            </div>
          </section>

          <div className="patient-profile-bottom-grid">
            <section className="patient-card patient-emergency-contact">
              <div className="patient-profile-card-heading"><h2>Contacto de emergencia</h2><HeartPulse className="size-4 text-danger" aria-hidden="true" /></div>
              <div className="mt-3"><ProfileField id="profile-emergency" label="Persona o teléfono de contacto" value={form.emergencyContact} onChange={(value) => setField("emergencyContact", value)} error={fieldErrors.emergencyContact} /></div>
              <p><Info className="size-3.5" aria-hidden="true" /> Mantén este dato actualizado para situaciones asistenciales.</p>
            </section>

            <section className="patient-card patient-insurance-card">
              <div className="patient-side-heading"><h2>Seguro o cobertura</h2><span>Paciente</span></div>
              <div className="mt-3"><ProfileField id="profile-insurance" label="Cobertura registrada" value={form.insurance} onChange={(value) => setField("insurance", value)} error={fieldErrors.insurance} /></div>
              <div className="patient-insurance-body"><span className="patient-icon patient-icon--green"><ShieldCheck className="size-4" aria-hidden="true" /></span><span><b>Información declarativa</b><small>La cobertura efectiva se valida con la clínica o institución correspondiente.</small></span></div>
            </section>
          </div>

          {error ? <p className="rounded-lg bg-danger-soft p-3 text-sm font-bold text-danger" id="profile-form-error" role="alert">{error}</p> : null}
          <div className="patient-profile-actions">
            <Link className="patient-action-button" href="/patient/dashboard">Volver al panel</Link>
            <button className="patient-action-button patient-action-button--primary" type="submit" disabled={saving}>{saving ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}{saving ? "Guardando…" : "Guardar cambios"}</button>
          </div>
        </main>

        <aside className="patient-profile-side">
          <section className="patient-card patient-profile-summary">
            <div className="patient-side-heading"><h2>Resumen de cuenta</h2><span>{profile.status ?? "Activo"}</span></div>
            <div>
              <div><FileText className="size-3.5" aria-hidden="true" /><span>Código de paciente</span><strong>{profile.patientCode}</strong></div>
              <div><ShieldCheck className="size-3.5" aria-hidden="true" /><span>Estado</span><strong>{profile.status ?? "No registrado"}</strong></div>
              <div><Stethoscope className="size-3.5" aria-hidden="true" /><span>Clínica</span><strong>{profile.clinic?.name ?? "No vinculada"}</strong></div>
              <div><CalendarDays className="size-3.5" aria-hidden="true" /><span>Registro</span><strong>{formatDate(profile.createdAt)}</strong></div>
            </div>
          </section>

          <ConsentPreferencesCard />

          <section className="patient-card patient-profile-help">
            <div className="patient-help-strip">
              <div className="patient-help-strip__copy"><span className="patient-help-strip__icon"><Info className="size-5" aria-hidden="true" /></span><div><h2>Privacidad del paciente</h2><p>Solo puedes editar y consultar información vinculada a tu propia sesión autenticada.</p></div></div>
            </div>
          </section>
        </aside>

        {message ? <p className="patient-profile-saved" id="profile-form-message" role="status">{message}</p> : null}
      </form>
    </div>
  );
}

export function PatientPortalView({ view }: { user: AuthenticatedUser; view: PatientPortalView }) {
  const state = usePatientPortalData(view);

  if (state.status === "loading" || state.view !== view) return <PortalLoading />;
  if (state.status === "error") return <PortalError message={state.message} onRetry={state.retry} />;

  switch (state.data.view) {
    case "dashboard":
      return <DashboardView data={state.data.data} />;
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
      return <EpidemiologyView epidemiology={state.data.data} />;
    case "membership":
      return <MembershipView membership={state.data.data} />;
    case "profile":
      return <ProfileView initialProfile={state.data.data} />;
  }
}

"use client";

import { CalendarDays, CheckCircle2, ClipboardList, Clock3, FilePenLine, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDoctorDashboard, type DoctorDashboard, type DoctorConsultationStatus } from "@/features/doctors/api/doctor-clinical";
import { DoctorAvatar, DoctorCard, MetricCard, SectionHeading, StatusBadge } from "@/features/doctors/ui/doctor-primitives";
import { Spinner } from "@/shared/ui/spinner";

type DashboardTone = "blue" | "green" | "orange" | "red" | "violet" | "slate";

const timeFormatter = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" });
const dateTimeFormatter = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

function initialsOf(name: string | null | undefined): string {
  return (name ?? "Paciente").split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "PA";
}

function formatTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : timeFormatter.format(date);
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : dateTimeFormatter.format(date);
}

function statusTone(status: DoctorConsultationStatus): DashboardTone {
  switch (status) {
    case "in_progress": return "orange";
    case "completed": return "green";
    case "signed": return "violet";
    case "canceled": return "red";
    default: return "slate";
  }
}

function appointmentTone(status: string): DashboardTone {
  switch (status) {
    case "confirmed": return "green";
    case "pending": return "orange";
    case "waiting":
    case "in_consultation": return "blue";
    case "completed": return "violet";
    case "canceled":
    case "no_show": return "red";
    default: return "slate";
  }
}

function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      <DoctorCard className="flex min-h-48 items-center justify-center p-6">
        <p className="flex items-center gap-2 text-xs font-bold text-muted" aria-busy="true"><Spinner className="size-4" />Cargando panel médico…</p>
      </DoctorCard>
    </div>
  );
}

export default function DoctorDashboardPage() {
  const [dashboard, setDashboard] = useState<DoctorDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getDoctorDashboard(undefined, controller.signal)
      .then(setDashboard)
      .catch((caught: unknown) => {
        if (!(caught instanceof DOMException && caught.name === "AbortError")) {
          setError(caught instanceof Error ? caught.message : "No pudimos cargar el panel médico.");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  if (loading) return <DashboardLoading />;

  if (!dashboard) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
        <DoctorCard className="p-6"><p className="text-xs font-bold text-danger" role="alert">{error ?? "No pudimos cargar el panel médico."}</p></DoctorCard>
      </div>
    );
  }

  const firstName = dashboard.doctor.name.trim().split(/\s+/)[0] || "Doctor";
  const { metrics, alerts } = dashboard;
  const metricCards = [
    { label: "Consultas del día", value: String(metrics.todayAppointments), detail: `${metrics.todayCompleted} completadas`, icon: CalendarDays, tone: "blue" as const, href: "/doctor/agenda" },
    { label: "Pacientes vinculados", value: String(metrics.patientsTotal), detail: "Ver pacientes", icon: Users, tone: "green" as const, href: "/doctor/pacientes" },
    { label: "Consultas del mes", value: String(metrics.monthConsultations), detail: `${metrics.monthSignedConsultations} firmadas`, icon: ClipboardList, tone: "violet" as const, href: "/doctor/consultas" },
    { label: "Pendientes de firma", value: String(alerts.unsignedCompletedConsultations), detail: "Revisar consultas", icon: FilePenLine, tone: "orange" as const, href: "/doctor/consultas" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      <header className="mb-5">
        <h1 className="text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.65rem]">Panel médico</h1>
        <p className="mt-1 text-[0.76rem] font-extrabold text-ink-secondary">Buenos días, Dr. {firstName}.</p>
        <p className="mt-1 text-[0.65rem] font-bold text-ink-secondary">Datos operativos del {dashboard.date} · {dashboard.doctor.practiceType === "clinic" ? dashboard.doctor.clinic?.name ?? "Clínica" : "Práctica independiente"}</p>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Resumen de actividad">
        {metricCards.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]" aria-label="Actividad médica">
        <DoctorCard className="min-w-0 overflow-hidden">
          <div className="border-b border-line px-4 py-3 sm:px-5"><SectionHeading title="Agenda del día" action="Ver agenda" actionHref="/doctor/agenda" /></div>
          {dashboard.todayAppointments.length === 0 ? (
            <div className="grid min-h-48 place-items-center px-6 py-10 text-center"><p className="text-xs font-bold text-ink-secondary">No hay citas programadas para hoy.</p></div>
          ) : (
            <ol className="divide-y divide-line px-4 sm:px-5">
              {dashboard.todayAppointments.map((appointment) => (
                <li className="flex min-h-[58px] items-center gap-3 py-2.5" key={appointment.id}>
                  <time className="w-12 shrink-0 font-mono text-[0.68rem] font-extrabold" dateTime={appointment.scheduledAt ?? undefined}>{formatTime(appointment.scheduledAt)}</time>
                  <DoctorAvatar initials={initialsOf(appointment.patient.name)} tone={appointment.id % 2 === 0 ? "blue" : "orange"} size="sm" />
                  <div className="min-w-0 flex-1"><p className="truncate text-[0.66rem] font-extrabold">{appointment.patient.name ?? "Paciente"}</p><p className="mt-0.5 truncate text-[0.58rem] font-bold text-ink-secondary">{appointment.appointmentType}</p></div>
                  <StatusBadge tone={appointmentTone(appointment.status)}>{appointment.statusLabel}</StatusBadge>
                </li>
              ))}
            </ol>
          )}
        </DoctorCard>

        <DoctorCard className="min-w-0 overflow-hidden">
          <div className="border-b border-line px-4 py-3"><SectionHeading title="Consultas recientes" action="Ver consultas" actionHref="/doctor/consultas" /></div>
          {dashboard.recentConsultations.length === 0 ? (
            <div className="grid min-h-48 place-items-center px-6 py-10 text-center"><p className="text-xs font-bold text-ink-secondary">Aún no hay consultas registradas.</p></div>
          ) : (
            <ol className="divide-y divide-line px-4">
              {dashboard.recentConsultations.map((consultation) => (
                <li className="flex items-center gap-2.5 py-3" key={consultation.id}>
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><ClipboardList className="size-4" aria-hidden="true" /></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-[0.65rem] font-extrabold">{consultation.patientName ?? "Paciente"}</p><p className="mt-0.5 truncate text-[0.57rem] font-bold text-ink-secondary">{consultation.chiefComplaint}</p><time className="mt-0.5 block text-[0.53rem] font-bold text-muted" dateTime={consultation.createdAt ?? undefined}>{formatDateTime(consultation.createdAt)}</time></div>
                  <StatusBadge tone={statusTone(consultation.status)}>{consultation.statusLabel}</StatusBadge>
                </li>
              ))}
            </ol>
          )}
        </DoctorCard>
      </section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.75fr)]" aria-label="Pacientes y alertas">
        <DoctorCard className="min-w-0 overflow-hidden">
          <div className="border-b border-line px-4 py-3 sm:px-5"><SectionHeading title="Pacientes frecuentes" action="Ver pacientes" actionHref="/doctor/pacientes" /></div>
          {dashboard.frequentPatients.length === 0 ? (
            <div className="grid min-h-32 place-items-center px-6 py-8 text-center"><p className="text-xs font-bold text-ink-secondary">No hay pacientes frecuentes todavía.</p></div>
          ) : (
            <ul className="grid gap-2 p-4 sm:grid-cols-2 sm:px-5">
              {dashboard.frequentPatients.map((patient) => <li className="flex items-center gap-2.5 rounded-lg border border-line p-2.5" key={patient.id}><DoctorAvatar initials={initialsOf(patient.name)} tone={patient.id % 2 === 0 ? "blue" : "orange"} size="md" /><span className="min-w-0 flex-1"><span className="block truncate text-[0.64rem] font-extrabold">{patient.name ?? "Paciente"}</span><span className="mt-0.5 block text-[0.56rem] font-bold text-ink-secondary">{patient.patientCode} · {patient.visits} {patient.visits === 1 ? "visita" : "visitas"}</span></span></li>)}
            </ul>
          )}
        </DoctorCard>

        <DoctorCard className="p-4">
          <SectionHeading title="Alertas y recordatorios" />
          <ul className="mt-3 grid gap-2">
            {alerts.pendingAppointments > 0 ? <li className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning-soft p-2.5"><Clock3 className="size-4 shrink-0 text-warning" aria-hidden="true" /><span className="text-[0.61rem] font-extrabold">{alerts.pendingAppointments} {alerts.pendingAppointments === 1 ? "cita pendiente" : "citas pendientes"}</span></li> : null}
            {alerts.unsignedCompletedConsultations > 0 ? <li className="flex items-center gap-2 rounded-lg border border-violet/30 bg-violet-soft p-2.5"><FilePenLine className="size-4 shrink-0 text-violet" aria-hidden="true" /><span className="text-[0.61rem] font-extrabold">{alerts.unsignedCompletedConsultations} consulta{alerts.unsignedCompletedConsultations === 1 ? " pendiente" : "s pendientes"} de firma</span></li> : null}
            {alerts.pendingAppointments === 0 && alerts.unsignedCompletedConsultations === 0 ? <li className="flex items-center gap-2 rounded-lg border border-success/30 bg-success-soft p-2.5"><CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" /><span className="text-[0.61rem] font-extrabold text-success">No tienes alertas pendientes.</span></li> : null}
          </ul>
          <Link className="mt-4 inline-flex text-[0.62rem] font-extrabold text-accent hover:text-accent-hover focus-visible:outline-3 focus-visible:outline-focus" href="/doctor/consultas">Revisar actividad clínica →</Link>
        </DoctorCard>
      </section>
    </div>
  );
}

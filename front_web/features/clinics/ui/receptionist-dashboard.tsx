"use client";

import {
  Activity,
  ArrowRight,
  BellRing,
  CalendarCheck,
  CalendarDays,
  CircleAlert,
  Clock3,
  CreditCard,
  FileWarning,
  UserCheck,
  UserPlus,
  UsersRound,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type {
  ClinicAppointment,
  ClinicDashboardData,
} from "@/features/clinics/model/clinic-admin.types";

type ReceptionistDashboardProps = Readonly<{
  dashboard: ClinicDashboardData | null;
  clinicName: string;
  userName: string;
}>;

const statusStyles: Record<ClinicAppointment["status"], string> = {
  pending: "bg-danger-soft text-danger",
  confirmed: "bg-success-soft text-success",
  waiting: "bg-warning-soft text-warning",
  in_consultation: "bg-accent-soft text-accent",
  completed: "bg-violet-soft text-violet",
  canceled: "bg-danger-soft text-danger",
  no_show: "bg-surface-subtle text-muted",
};

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function appointmentLabel(appointment: ClinicAppointment): string {
  if (appointment.status === "in_consultation") return "En atención";
  if (appointment.status === "no_show") return "No asistió";
  return appointment.statusLabel;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}: Readonly<{
  icon: typeof CalendarDays;
  label: string;
  value: number;
  helper: string;
  tone: string;
}>) {
  return (
    <article className="rounded-2xl border border-line bg-surface p-4 shadow-[0_0.5rem_1.5rem_rgb(16_27_51/4%)] sm:p-5">
      <div className="flex items-start gap-3">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`} aria-hidden="true">
          <Icon className="size-4.5" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <p className="text-[0.64rem] font-bold text-muted">{label}</p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-[-0.05em] text-ink">{value}</p>
          <p className="mt-1 text-[0.6rem] font-semibold text-ink-secondary">{helper}</p>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ appointment }: Readonly<{ appointment: ClinicAppointment }>) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.58rem] font-extrabold whitespace-nowrap ${statusStyles[appointment.status]}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {appointmentLabel(appointment)}
    </span>
  );
}

function EmptyState({ label }: Readonly<{ label: string }>) {
  return <p className="px-4 py-8 text-center text-xs font-semibold text-muted">{label}</p>;
}

export function ReceptionistDashboard({ dashboard, clinicName, userName }: ReceptionistDashboardProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const summary = dashboard?.appointmentSummary ?? {
    todayTotal: 0,
    confirmed: 0,
    pending: 0,
    waiting: 0,
    inConsultation: 0,
    noShow: 0,
    canceled: 0,
  };
  const todayAppointments = dashboard?.todayAppointments ?? [];
  const doctors = dashboard?.team.filter((member) => member.role === "doctor") ?? [];
  const clinicPatients = dashboard?.metrics.patientsTotal ?? 0;
  const occupiedAppointments = summary.confirmed + summary.waiting + summary.inConsultation;

  function showNotice(message: string): void {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2600);
  }

  return (
    <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      {notice ? (
        <div className="fixed right-4 bottom-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl bg-ink px-4 py-3 text-xs font-bold text-white shadow-xl" role="status">
          <Activity className="size-4 text-success" aria-hidden="true" />
          {notice}
        </div>
      ) : null}

      <header className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[0.62rem] font-bold tracking-[0.14em] text-accent uppercase">Recepción · {clinicName}</p>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-[-0.05em] text-ink sm:text-3xl">Inicio</h1>
          <p className="mt-1 text-xs text-muted">Resumen operativo del área de recepción para hoy.</p>
        </div>
        <div className="grid grid-cols-1 gap-2 min-[17.5rem]:grid-cols-2 sm:flex">
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-3 text-[0.68rem] font-extrabold text-ink shadow-sm transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-focus sm:px-4"
            type="button"
            onClick={() => showNotice("El registro de pacientes se abrirá en el módulo Pacientes.")}
          >
            <UserPlus className="size-3.5" aria-hidden="true" />
            Registrar paciente
          </button>
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-accent px-3 text-[0.68rem] font-extrabold text-white shadow-[0_0.55rem_1.2rem_rgb(8_98_221/18%)] transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-focus sm:px-4"
            href="/clinic/agenda"
          >
            <CalendarDays className="size-3.5" aria-hidden="true" />
            Nueva cita
          </Link>
        </div>
      </header>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Indicadores de recepción">
        <MetricCard icon={CalendarDays} label="Citas de hoy" value={summary.todayTotal} helper="Agenda del día" tone="bg-accent-soft text-accent" />
        <MetricCard icon={CalendarCheck} label="Confirmadas" value={summary.confirmed} helper={`${summary.todayTotal ? Math.round((summary.confirmed / summary.todayTotal) * 100) : 0}% del total`} tone="bg-success-soft text-success" />
        <MetricCard icon={Clock3} label="Pendientes" value={summary.pending} helper="Por confirmar" tone="bg-warning-soft text-warning" />
        <MetricCard icon={UserCheck} label="En atención" value={summary.inConsultation} helper="En consultorio" tone="bg-accent-soft text-accent" />
        <MetricCard icon={XCircle} label="No asistieron" value={summary.noShow} helper="Requieren seguimiento" tone="bg-danger-soft text-danger" />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(15rem,0.85fr)_minmax(15rem,0.8fr)]" aria-label="Actividad de recepción">
        <article className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_0.5rem_1.5rem_rgb(16_27_51/4%)]">
          <div className="flex items-center justify-between border-b border-line px-4 py-3.5 sm:px-5">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink"><CalendarDays className="size-4 text-accent" aria-hidden="true" />Agenda de hoy</h2>
              <p className="mt-1 text-[0.62rem] text-muted">Llegadas, médicos y estado de cada cita.</p>
            </div>
            <Link className="text-[0.62rem] font-extrabold text-accent hover:underline" href="/clinic/agenda">Ver agenda completa</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-170 text-left">
              <caption className="sr-only">Agenda de citas del día</caption>
              <thead className="bg-surface-subtle text-[0.54rem] font-extrabold tracking-wide text-muted uppercase">
                <tr><th className="px-4 py-2.5" scope="col">Hora</th><th className="px-4 py-2.5" scope="col">Paciente</th><th className="px-4 py-2.5" scope="col">Médico / especialidad</th><th className="px-4 py-2.5" scope="col">Estado</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {todayAppointments.slice(0, 6).map((appointment) => (
                  <tr className="text-[0.63rem] transition-colors hover:bg-surface-hover" key={appointment.id}>
                    <td className="px-4 py-3 font-mono font-extrabold text-ink">{appointment.time}</td>
                    <th className="px-4 py-3 font-normal" scope="row">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft font-mono text-[0.52rem] font-bold text-accent" aria-hidden="true">{initials(appointment.patient.name ?? "Paciente")}</span>
                        <span><strong className="block font-extrabold text-ink">{appointment.patient.name ?? "Paciente sin nombre"}</strong><span className="font-mono text-[0.5rem] text-muted">{appointment.patient.patientCode}</span></span>
                      </div>
                    </th>
                    <td className="px-4 py-3"><strong className="block font-extrabold text-ink">{appointment.doctor?.name ?? "Sin asignar"}</strong><span className="text-[0.52rem] text-muted">{appointment.doctor?.specialty ?? appointment.appointmentType}</span></td>
                    <td className="px-4 py-3"><StatusBadge appointment={appointment} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {todayAppointments.length === 0 ? <EmptyState label="No hay citas programadas para hoy." /> : null}
          </div>
          <div className="border-t border-line px-4 py-3 text-center text-[0.62rem] font-extrabold text-accent sm:px-5">
            <Link href="/clinic/agenda">Ver todas las citas del día ({Math.max(todayAppointments.length - 6, 0)} restantes)</Link>
          </div>
        </article>

        <article className="rounded-2xl border border-line bg-surface p-4 shadow-[0_0.5rem_1.5rem_rgb(16_27_51/4%)] sm:p-5">
          <div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-extrabold">Estado de citas</h2><p className="mt-1 text-[0.62rem] text-muted">Distribución de la jornada.</p></div><span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent"><Activity className="size-4" aria-hidden="true" /></span></div>
          <div className="mt-6 flex items-center gap-4">
            <div className="grid size-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(var(--accent) ${summary.todayTotal ? Math.round((occupiedAppointments / summary.todayTotal) * 100) : 0}%, var(--accent-soft) 0)` }}>
              <div className="grid size-20 place-items-center rounded-full bg-surface"><strong className="font-mono text-2xl text-ink">{summary.todayTotal}</strong><span className="-mt-1 text-[0.55rem] font-bold text-muted">Total</span></div>
            </div>
            <ul className="grid gap-2 text-[0.6rem] font-semibold text-muted">
              <li className="flex items-center gap-2"><span className="size-2 rounded-full bg-success" />Confirmadas <b className="ml-auto text-ink">{summary.confirmed}</b></li>
              <li className="flex items-center gap-2"><span className="size-2 rounded-full bg-warning" />Pendientes <b className="ml-auto text-ink">{summary.pending}</b></li>
              <li className="flex items-center gap-2"><span className="size-2 rounded-full bg-accent" />En atención <b className="ml-auto text-ink">{summary.inConsultation}</b></li>
              <li className="flex items-center gap-2"><span className="size-2 rounded-full bg-danger" />No asistieron <b className="ml-auto text-ink">{summary.noShow}</b></li>
            </ul>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2 border-t border-line pt-4 text-[0.6rem]
          "><div className="rounded-lg bg-surface-subtle p-3"><p className="text-muted">En espera</p><b className="mt-1 block font-mono text-lg text-ink">{summary.waiting}</b></div><div className="rounded-lg bg-surface-subtle p-3"><p className="text-muted">Canceladas</p><b className="mt-1 block font-mono text-lg text-ink">{summary.canceled}</b></div></div>
        </article>

        <article className="rounded-2xl border border-line bg-surface p-4 shadow-[0_0.5rem_1.5rem_rgb(16_27_51/4%)] sm:p-5">
          <div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-extrabold">Actividad reciente</h2><p className="mt-1 text-[0.62rem] text-muted">Últimos movimientos de hoy.</p></div><BellRing className="size-4 text-accent" aria-hidden="true" /></div>
          <ul className="mt-4 divide-y divide-line">
            {todayAppointments.slice(0, 5).map((appointment) => <li className="flex gap-2.5 py-3 first:pt-0" key={`activity-${appointment.id}`}><span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg ${statusStyles[appointment.status]}`}><CalendarCheck className="size-3.5" aria-hidden="true" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-[0.61rem] text-ink">{appointmentLabel(appointment)} · {appointment.patient.name ?? "Paciente"}</strong><span className="mt-0.5 block text-[0.54rem] text-muted">{appointment.time} · {appointment.doctor?.name ?? "Sin médico"}</span></span></li>)}
          </ul>
          {todayAppointments.length === 0 ? <EmptyState label="Aún no hay actividad registrada." /> : null}
          <Link className="mt-2 inline-flex items-center gap-1 text-[0.62rem] font-extrabold text-accent hover:underline" href="/clinic/agenda">Ver todas <ArrowRight className="size-3" aria-hidden="true" /></Link>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-4" aria-label="Resumen de operación">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-[0_0.5rem_1.5rem_rgb(16_27_51/4%)]"><div className="flex items-center justify-between"><h2 className="text-sm font-extrabold">Turno actual</h2><Clock3 className="size-4 text-accent" aria-hidden="true" /></div><p className="mt-4 font-mono text-xs font-bold text-accent">Turno matutino</p><p className="mt-1 text-[0.62rem] text-muted">07:00 AM · 03:00 PM</p><div className="mt-5 flex items-center gap-3 border-t border-line pt-4"><span className="grid size-9 place-items-center rounded-full bg-ink font-mono text-[0.62rem] font-bold text-white">{initials(userName)}</span><span><strong className="block text-xs text-ink">{userName}</strong><span className="text-[0.58rem] text-accent">Recepción</span></span></div></article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-[0_0.5rem_1.5rem_rgb(16_27_51/4%)]"><div className="flex items-center justify-between"><h2 className="text-sm font-extrabold">Pacientes en clínica</h2><Link className="text-[0.6rem] font-extrabold text-accent" href="/clinic/pacientes">Ver todos</Link></div><div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-xl border border-line bg-accent-soft/40 p-3"><UserCheck className="size-4 text-accent" aria-hidden="true" /><b className="mt-2 block font-mono text-xl">{summary.inConsultation}</b><span className="text-[0.56rem] text-muted">En atención</span></div><div className="rounded-xl border border-line bg-success-soft/40 p-3"><UsersRound className="size-4 text-success" aria-hidden="true" /><b className="mt-2 block font-mono text-xl">{clinicPatients}</b><span className="text-[0.56rem] text-muted">Registrados</span></div></div></article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-[0_0.5rem_1.5rem_rgb(16_27_51/4%)]"><div className="flex items-center justify-between"><h2 className="text-sm font-extrabold">Ingresos del día</h2><CreditCard className="size-4 text-success" aria-hidden="true" /></div><p className="mt-4 font-mono text-2xl font-bold tracking-[-0.04em] text-ink">—</p><p className="mt-1 text-[0.62rem] text-muted">Caja y pagos se conectarán aquí.</p><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-surface-subtle"><span className="block h-full w-2/3 rounded-full bg-success" /></div></article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-[0_0.5rem_1.5rem_rgb(16_27_51/4%)]"><div className="flex items-center justify-between"><h2 className="text-sm font-extrabold">Recordatorios</h2><CircleAlert className="size-4 text-warning" aria-hidden="true" /></div><ul className="mt-3 divide-y divide-line text-[0.62rem]"><li className="flex items-center gap-2 py-2.5"><FileWarning className="size-3.5 text-danger" aria-hidden="true" /><span className="flex-1 text-muted">Citas pendientes por confirmar</span><b className="font-mono text-ink">{summary.pending}</b></li><li className="flex items-center gap-2 py-2.5"><UsersRound className="size-3.5 text-accent" aria-hidden="true" /><span className="flex-1 text-muted">Pacientes registrados</span><b className="font-mono text-ink">{clinicPatients}</b></li><li className="flex items-center gap-2 py-2.5"><XCircle className="size-3.5 text-danger" aria-hidden="true" /><span className="flex-1 text-muted">No asistieron</span><b className="font-mono text-ink">{summary.noShow}</b></li></ul></article>
      </section>

      <section className="mt-4 rounded-2xl border border-line bg-surface p-4 shadow-[0_0.5rem_1.5rem_rgb(16_27_51/4%)] sm:p-5" aria-labelledby="doctors-availability-title">
        <div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-extrabold" id="doctors-availability-title">Disponibilidad de médicos</h2><p className="mt-1 text-[0.62rem] text-muted">Equipo activo de {clinicName}.</p></div><span className="rounded-full bg-success-soft px-2.5 py-1 text-[0.58rem] font-extrabold text-success">{doctors.length} activos</span></div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{doctors.map((doctor) => <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-subtle px-3 py-2.5" key={doctor.id}><span className="grid size-8 place-items-center rounded-full bg-accent-soft font-mono text-[0.55rem] font-bold text-accent">{initials(doctor.name)}</span><span className="min-w-0 flex-1"><strong className="block truncate text-[0.62rem] text-ink">{doctor.name}</strong><span className="block truncate text-[0.54rem] text-muted">{doctor.specialty ?? "Medicina general"}</span></span><span className="size-2 rounded-full bg-success" title="Disponible" /></div>)}</div>
        {doctors.length === 0 ? <EmptyState label="No hay médicos activos registrados." /> : null}
      </section>
    </div>
  );
}

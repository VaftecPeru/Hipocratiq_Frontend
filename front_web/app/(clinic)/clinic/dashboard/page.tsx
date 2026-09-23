import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  CalendarDays,
  CalendarPlus,
  CircleDollarSign,
  Clock3,
  Eye,
  ShieldAlert,
  Stethoscope,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { getClinicAppointmentsServer, getClinicBillingReportServer, getClinicDashboardServer } from "@/features/clinics/api/server-clinic-dashboard";
import type { ClinicBillingReport } from "@/features/clinics/model/clinic-admin.types";
import { ReceptionistDashboard } from "@/features/clinics/ui/receptionist-dashboard";
import { DashboardUnavailable } from "@/shared/ui/dashboard-unavailable";

type MetricTone = "accent" | "success" | "warning" | "violet";

type Metric = {
  label: string;
  value: string;
  helper: string;
  badge: string;
  icon: LucideIcon;
  tone: MetricTone;
};

type WeeklyDay = {
  day: string;
  fullDay: string;
  appointments: number;
  barHeight: number;
};

type DoctorStatus = "En consulta" | "Disponible" | "Descanso";

type Doctor = {
  name: string;
  initials: string;
  specialty: string;
  office: string;
  pendingAppointments: number;
  status: DoctorStatus;
};

const SHORT_WEEKDAY_FORMATTER = new Intl.DateTimeFormat("es-MX", { weekday: "short" });
const LONG_WEEKDAY_FORMATTER = new Intl.DateTimeFormat("es-MX", { weekday: "long" });

function dateKey(value: Date): string {
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const date = String(value.getDate()).padStart(2, "0");
  return `${value.getFullYear()}-${month}-${date}`;
}

const metrics = [
  {
    label: "Citas programadas",
    value: "—",
    helper: "Sin datos",
    badge: "",
    icon: CalendarDays,
    tone: "accent",
  },
  {
    label: "Médicos en turno",
    value: "—",
    helper: "Sin datos",
    badge: "",
    icon: Stethoscope,
    tone: "violet",
  },
  {
    label: "Facturación mensual",
    value: "—",
    helper: "Sin datos",
    badge: "",
    icon: CircleDollarSign,
    tone: "success",
  },
  {
    label: "Pacientes atendidos",
    value: "—",
    helper: "Sin datos",
    badge: "",
    icon: UsersRound,
    tone: "warning",
  },
] satisfies readonly Metric[];

const metricToneClasses: Record<MetricTone, { icon: string; badge: string }> = {
  accent: {
    icon: "bg-accent-soft text-accent",
    badge: "bg-accent-soft text-accent",
  },
  success: {
    icon: "bg-success-soft text-success",
    badge: "bg-success-soft text-success",
  },
  warning: {
    icon: "bg-warning-soft text-warning",
    badge: "bg-warning-soft text-warning",
  },
  violet: {
    icon: "bg-violet-soft text-violet",
    badge: "bg-violet-soft text-violet",
  },
};

const doctorStatusClasses: Record<DoctorStatus, string> = {
  "En consulta": "bg-warning-soft text-warning",
  Disponible: "bg-success-soft text-success",
  Descanso: "bg-surface-subtle text-muted",
};

function MetricCard({ metric, index }: { metric: Metric; index: number }) {
  const Icon = metric.icon;
  const tone = metricToneClasses[metric.tone];

  return (
    <article
      className="rounded-2xl border border-line bg-surface p-4 shadow-[0_0.5rem_1.5rem_rgb(16_27_51/0.035)] motion-safe:animate-[fade-up-in_400ms_ease-out_both] sm:p-5"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone.icon}`}
          aria-hidden="true"
        >
          <Icon className="size-4.5" strokeWidth={1.8} />
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[0.65rem] font-extrabold ${tone.badge}`}
        >
          {metric.badge}
        </span>
      </div>
      <p className="mt-5 text-xs font-bold text-muted">{metric.label}</p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-mono text-xl font-bold tracking-[-0.04em] text-ink sm:text-2xl">
          {metric.value}
        </span>
        <span className="text-2xs font-semibold text-ink-secondary">
          {metric.helper}
        </span>
      </p>
    </article>
  );
}

function CardHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-sm font-extrabold tracking-[-0.01em] text-ink sm:text-base">
        {title}
      </h2>
      <p className="mt-1 text-2xs leading-relaxed text-muted">{description}</p>
    </div>
  );
}

function WeeklyAgendaChart({ weeklyAgenda, available }: Readonly<{ weeklyAgenda: readonly WeeklyDay[]; available: boolean }>) {
  if (!available) {
    return <p className="mt-6 rounded-xl bg-warning-soft px-3 py-4 text-xs font-semibold text-warning" role="status">La agenda semanal no está disponible en este momento.</p>;
  }

  return (
    <figure className="mt-6" aria-labelledby="weekly-agenda-caption">
      <div
        className="grid h-48 grid-cols-7 items-end gap-2 border-b border-line px-1 sm:h-52 sm:gap-3 sm:px-3"
        aria-hidden="true"
      >
        {weeklyAgenda.map((item) => (
          <div
            className="flex h-full min-w-0 flex-col items-center justify-end gap-2"
            key={item.day}
          >
            <span className="font-mono text-[0.6rem] font-bold text-ink-secondary sm:text-2xs">
              {item.appointments}
            </span>
            <span className="flex h-[78%] w-full max-w-9 items-end overflow-hidden rounded-t-lg bg-surface-subtle">
              <span
                className="block w-full rounded-t-lg bg-accent transition-[height] duration-500"
                 style={{ height: `${item.barHeight}%` }}
              />
            </span>
            <span className="pb-2 text-[0.58rem] font-semibold text-muted sm:text-2xs">
              {item.day}
            </span>
          </div>
        ))}
      </div>
      <figcaption className="sr-only" id="weekly-agenda-caption">
         Citas registradas esta semana: {weeklyAgenda.map((item) =>
          `${item.fullDay}, ${item.appointments}`
        ).join("; ")}.
      </figcaption>
    </figure>
  );
}

function formatMoney(minor: number, currency: string): string {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency, minimumFractionDigits: 2 }).format(minor / 100);
}

function BillingSummary({ report }: Readonly<{ report: ClinicBillingReport | null }>) {
  const summary = Object.values(report?.byCurrency ?? {}).find((item) => item.currency === "MXN") ?? Object.values(report?.byCurrency ?? {})[0];
  if (!summary) return <p className="mt-5 rounded-xl bg-warning-soft px-3 py-4 text-xs font-semibold text-warning" role="status">El reporte de facturación no está disponible en este momento.</p>;

  return <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-line bg-surface-subtle p-3"><p className="text-[0.62rem] font-bold text-muted">Cobrado en el periodo</p><p className="mt-1 font-mono text-lg font-bold text-ink">{formatMoney(summary.paidMinor, summary.currency)}</p><p className="mt-1 text-[0.58rem] text-muted">{summary.paymentCount} pagos registrados</p></div><div className="rounded-xl border border-line bg-surface-subtle p-3"><p className="text-[0.62rem] font-bold text-muted">Pendiente de cobro</p><p className="mt-1 font-mono text-lg font-bold text-ink">{formatMoney(summary.outstandingMinor, summary.currency)}</p><p className="mt-1 text-[0.58rem] text-muted">{summary.invoiceCount} facturas del periodo</p></div></div>;
}

function StatusBadge({ status }: { status: DoctorStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[0.65rem] font-extrabold whitespace-nowrap ${doctorStatusClasses[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}

export default async function ClinicDashboardPage() {
  const session = await getAuthenticatedSession();
  const dashboard = await getClinicDashboardServer();
  if (!dashboard) {
    return <DashboardUnavailable description="No pudimos cargar los datos operativos desde el servidor." retryHref="/clinic/dashboard" title="No se pudo cargar el panel operativo" />;
  }

  if (session?.actor_context === "receptionist") {
    return (
      <ReceptionistDashboard
        dashboard={dashboard}
        clinicName={dashboard.clinic.name ?? session.user.clinic?.name ?? "Tu clínica"}
        userName={session.user.name}
      />
    );
  }
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  const day = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const [weeklyAppointments, billingReport] = await Promise.all([
    getClinicAppointmentsServer(dateKey(weekStart), dateKey(weekEnd)),
    getClinicBillingReportServer(dateKey(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), dateKey(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0))),
  ]);
  const weeklyCounts = Array.from({ length: 7 }, (_, index) => {
    const currentDay = new Date(weekStart);
    currentDay.setDate(weekStart.getDate() + index);
    const key = dateKey(currentDay);
    return {
      date: currentDay,
      count: weeklyAppointments?.filter((appointment) => appointment.scheduledDate === key).length ?? 0,
    };
  });
  const maxWeeklyCount = Math.max(...weeklyCounts.map((item) => item.count), 1);
  const weeklyAgenda: readonly WeeklyDay[] = weeklyCounts.map(({ date, count }) => ({
    day: SHORT_WEEKDAY_FORMATTER.format(date).replace(".", "").slice(0, 3),
    fullDay: LONG_WEEKDAY_FORMATTER.format(date),
    appointments: count,
    barHeight: count > 0 ? Math.max(8, Math.round((count / maxWeeklyCount) * 100)) : 2,
  }));
  const clinicName = dashboard.clinic.name ?? session?.user.clinic?.name ?? "Tu clínica";
  const liveMetrics: readonly Metric[] = metrics.map((metric) => {
    if (metric.label === "Citas programadas") return { ...metric, value: String(dashboard.appointmentSummary.todayTotal), helper: "agenda de hoy", badge: "Hoy" };
    if (metric.label === "Facturación mensual") {
      const summary = Object.values(billingReport?.byCurrency ?? {}).find((item) => item.currency === "MXN") ?? Object.values(billingReport?.byCurrency ?? {})[0];
      return { ...metric, value: summary ? formatMoney(summary.paidMinor, summary.currency) : "—", helper: summary ? `${summary.currency} cobrado` : "Reporte no disponible", badge: summary ? "Real" : "Sin datos" };
    }
    if (metric.label === "Médicos en turno") return { ...metric, value: String(dashboard.metrics.doctorsTotal), helper: "membresías activas" };
    if (metric.label === "Pacientes atendidos") return { ...metric, value: String(dashboard.metrics.patientsTotal), helper: "perfiles registrados" };
    return metric;
  });
  const liveDoctors: readonly Doctor[] = dashboard.team
    .filter((member) => member.role === "doctor" && member.status === "active")
    .slice(0, 4)
    .map((member) => ({
      name: member.name,
      initials: member.name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase(),
      specialty: member.specialty ?? "Medicina general",
      office: "Sin asignar",
      pendingAppointments: dashboard.todayAppointments.filter((appointment) => appointment.doctor?.id === member.id && ["pending", "confirmed", "waiting"].includes(appointment.status)).length,
      status: dashboard.todayAppointments.some((appointment) => appointment.doctor?.id === member.id && appointment.status === "in_consultation") ? "En consulta" : "Disponible",
    }));

  return (
    <div className="mx-auto w-full max-w-360 px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
      <header className="flex flex-col justify-between gap-5 border-b border-line pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[0.65rem] font-bold tracking-[0.14em] text-accent uppercase">
            Operación clínica
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-ink sm:text-3xl">
            Panel Operativo
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
            Gestión diaria de {clinicName}: agenda, equipo médico y desempeño
            financiero.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 min-[17.5rem]:grid-cols-2 sm:flex sm:shrink-0">
          <Link
            href="/clinic/agenda"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-3.5 text-xs font-extrabold text-ink shadow-sm transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:px-4"
          >
            <CalendarPlus className="size-4" strokeWidth={1.8} aria-hidden="true" />
            Agendar Cita
          </Link>
          <Link
            href="/clinic/registro-pacientes"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-accent px-3.5 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:px-4"
          >
            <UserPlus className="size-4" strokeWidth={1.8} aria-hidden="true" />
            Nuevo Paciente
          </Link>
        </div>
      </header>

      <section
        className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Indicadores clave de la clínica"
      >
        {liveMetrics.map((metric, index) => (
          <MetricCard metric={metric} index={index} key={metric.label} />
        ))}
      </section>

      <section
        className="mt-5 grid gap-4 xl:grid-cols-12"
        aria-label="Resumen operativo"
      >
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-[0_0.5rem_1.5rem_rgb(16_27_51/0.035)] sm:p-5 xl:col-span-5">
          <div className="flex items-start justify-between gap-4">
            <CardHeading
              title="Agenda Semanal"
              description="Citas registradas por día en la semana actual"
            />
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[0.65rem] font-extrabold text-accent">
              <Activity className="size-3" strokeWidth={2} aria-hidden="true" />
               {weeklyAppointments?.length ?? "—"} citas
            </span>
          </div>
           <WeeklyAgendaChart weeklyAgenda={weeklyAgenda} available={weeklyAppointments !== null} />
        </article>

        <article className="rounded-2xl border border-line bg-surface p-4 shadow-[0_0.5rem_1.5rem_rgb(16_27_51/0.035)] sm:p-5 xl:col-span-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardHeading
              title="Facturación y Gastos"
              description="Cobros y saldo pendiente del mes actual"
            />
          </div>

           <BillingSummary report={billingReport} />
        </article>

        <article className="flex flex-col rounded-2xl border border-line bg-surface p-4 shadow-[0_0.5rem_1.5rem_rgb(16_27_51/0.035)] sm:p-5 xl:col-span-3">
          <div className="flex items-start justify-between gap-3">
            <CardHeading
              title="IA Epidemiológica"
              description="Vigilancia clínica basada en patrones recientes"
            />
            <span
              className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-soft text-violet"
              aria-hidden="true"
            >
              <BrainCircuit className="size-4" strokeWidth={1.8} />
            </span>
          </div>

           <div className="mt-5 rounded-xl border border-line bg-surface-subtle p-3 text-xs text-muted" role="status">
             <div className="flex items-center gap-2 text-warning"><ShieldAlert className="size-3.5" strokeWidth={1.8} aria-hidden="true" /><p className="font-bold">Datos epidemiológicos no disponibles</p></div>
             <p className="mt-2 leading-relaxed">Este panel se habilitará cuando exista una fuente clínica de epidemiología para la clínica.</p>
           </div>

          <div className="mt-auto pt-4">
            <p className="flex items-center gap-2 text-[0.62rem] font-semibold text-muted">
              <Clock3 className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
               Fuente: datos operativos de la clínica
            </p>
            <Link
              href="/clinic/reportes"
              className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-extrabold text-accent transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Ver análisis completo
              <ArrowUpRight className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
            </Link>
          </div>
        </article>
      </section>

      <section
        className="mt-5 overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_0.5rem_1.5rem_rgb(16_27_51/0.035)]"
        aria-labelledby="doctors-on-duty-title"
      >
        <div className="flex flex-col justify-between gap-3 border-b border-line px-4 py-4 sm:flex-row sm:items-center sm:px-5">
          <div>
            <div className="flex items-center gap-2">
              <Stethoscope
                className="size-4 text-accent"
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <h2
                className="text-sm font-extrabold tracking-[-0.01em] text-ink sm:text-base"
                id="doctors-on-duty-title"
              >
                Médicos en Turno
              </h2>
            </div>
            <p className="mt-1 text-2xs text-muted">
              Disponibilidad y carga pendiente del equipo clínico
            </p>
          </div>
          <Link
            href="/clinic/medicos"
            className="inline-flex min-h-9 w-fit items-center gap-2 rounded-xl px-3 text-xs font-extrabold text-accent transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Ver directorio
            <ArrowRight className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-205 border-collapse text-left">
            <caption className="sr-only">
              Médicos actualmente en turno, su especialidad, consultorio, citas
              pendientes, estado y acción disponible.
            </caption>
            <thead>
              <tr className="bg-surface-subtle text-[0.62rem] font-extrabold tracking-[0.08em] text-muted uppercase">
                <th className="px-5 py-3" scope="col">Médico</th>
                <th className="px-5 py-3" scope="col">Especialidad</th>
                <th className="px-5 py-3" scope="col">Consultorio</th>
                <th className="px-5 py-3 text-center" scope="col">
                  Citas pendientes
                </th>
                <th className="px-5 py-3" scope="col">Estado</th>
                <th className="px-5 py-3 text-right" scope="col">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {liveDoctors.map((doctor, index) => (
                <tr
                  className="transition-colors hover:bg-surface-hover"
                  key={doctor.name}
                >
                  <th className="px-5 py-3.5 font-normal" scope="row">
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-full font-mono text-[0.65rem] font-bold ${
                          index % 2 === 0
                            ? "bg-accent-soft text-accent"
                            : "bg-violet-soft text-violet"
                        }`}
                        aria-hidden="true"
                      >
                        {doctor.initials}
                      </span>
                      <span className="text-xs font-extrabold text-ink">
                        {doctor.name}
                      </span>
                    </div>
                  </th>
                  <td className="px-5 py-3.5 text-xs font-semibold text-ink-secondary">
                    {doctor.specialty}
                  </td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-ink-secondary">
                    {doctor.office}
                  </td>
                  <td className="px-5 py-3.5 text-center font-mono text-xs font-bold text-ink">
                    {doctor.pendingAppointments}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={doctor.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href="/clinic/agenda"
                      className="inline-flex min-h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-extrabold text-accent transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                      aria-label={`Ver agenda de ${doctor.name}`}
                    >
                      <Eye className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
                      Ver agenda
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 text-[0.62rem] font-semibold text-muted sm:px-5">
          <span>{liveDoctors.length} médicos visibles en este bloque</span>
          <Link
            className="inline-flex items-center gap-1.5 rounded-md text-accent transition-colors hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            href="/clinic/agenda"
          >
            <CalendarDays className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
            Ver agenda clínica
          </Link>
        </div>
      </section>
    </div>
  );
}

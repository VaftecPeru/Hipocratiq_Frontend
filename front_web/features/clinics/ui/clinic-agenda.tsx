"use client";

import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Lock,
  Plus,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getClinicAppointments,getClinicScheduleBlocks } from "@/features/clinics/api/browser-clinic-dashboard";
import { ClinicAppointmentCreateModal } from "./clinic-appointment-create-modal";
import { ClinicScheduleBlockCreateModal } from "./clinic-schedule-block-create-modal";
import type {
  ClinicAppointment,
  ClinicAppointmentStatus,
  ClinicAppointmentSummary,
  ClinicScheduleBlock
} from "@/features/clinics/model/clinic-admin.types";
import { ClinicAppointmentDetailModal } from "./clinic-appointment-detail-modal";

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

function AppointmentCard({appointment, dayIndex, onClick,}: Readonly<{appointment: ClinicAppointment;dayIndex: number;onClick: () => void;}>) {
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
    >
      <span className="block font-mono text-[0.55rem] font-extrabold">{appointment.time}</span>
      <span className="mt-0.5 block truncate text-[0.58rem] font-extrabold">{appointment.patient.name ?? "Paciente sin nombre"}</span>
      <span className="block truncate text-[0.5rem] font-semibold opacity-75">{appointment.doctor?.name ?? "Sin médico"}</span>
    </button>
  );
}

function ScheduleBlockCard({  block,  dayIndex,
}: Readonly<{
  block: ClinicScheduleBlock;
  dayIndex: number;
}>) {
  const [startHour, startMinute] = block.startTime.split(":").map(Number);
  const [endHour, endMinute] = block.endTime.split(":").map(Number);

  const startMinutes = (startHour - 8) * 60 + startMinute;
  const endMinutes = (endHour - 8) * 60 + endMinute;

  const top = Math.max(
    0,
    Math.min(100, (startMinutes / 600) * 100),
  );

  const durationMinutes = Math.max(
    30,
    endMinutes - startMinutes,
  );

  const height = Math.max(
    5,
    (durationMinutes / 600) * 100,
  );

  return (
    <div
      className="absolute z-[5] overflow-hidden rounded-md border border-violet/30 bg-violet-soft/90 p-1.5 text-violet shadow-sm"
      style={{
        left: `calc(${(dayIndex / 7) * 100}% + 0.2rem)`,
        top: `${top}%`,
        width: "calc(14.2857% - 0.4rem)",
        height: `${height}%`,
        minHeight: "2.8rem",
      }}
      title={block.reason ?? "Horario bloqueado"}
    >
      <div className="flex items-center gap-1">
        <Lock className="size-3 shrink-0" aria-hidden="true" />

        <span className="truncate font-mono text-[0.52rem] font-extrabold">
          {block.startTime} - {block.endTime}
        </span>
      </div>

      <p className="mt-0.5 truncate text-[0.55rem] font-extrabold">
        {block.scope === "clinic"
          ? "Toda la clínica"
          : block.doctor?.name ?? "Médico"}
      </p>

      {block.reason ? (
        <p className="truncate text-[0.48rem] font-semibold opacity-80">
          {block.reason}
        </p>
      ) : null}
    </div>
  );
}

function WeekCalendar({ days,  appointments, blocks,  onAppointmentClick,}: Readonly<{  days: Date[];  appointments: ClinicAppointment[]; blocks: ClinicScheduleBlock[]; onAppointmentClick: (appointment: ClinicAppointment) => void;}>) {
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
              return dayIndex >= 0 && dayIndex < 7 ? <AppointmentCard appointment={appointment} dayIndex={dayIndex} key={appointment.id} onClick={() => onAppointmentClick(appointment)} /> : null;
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

export function ClinicAgenda() {
  const [view, setView] = useState<ViewMode>("Semana");
  const [weekOffset, setWeekOffset] = useState(0);
  const [appointments, setAppointments] = useState<ClinicAppointment[]>([]);
  const [blocks, setBlocks] =  useState<ClinicScheduleBlock[]>([]);
  const [isBlockModalOpen, setIsBlockModalOpen] =  useState(false);
  const [summary, setSummary] = useState<ClinicAppointmentSummary>({ todayTotal: 0, confirmed: 0, pending: 0, waiting: 0, inConsultation: 0, noShow: 0, canceled: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
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

  const upcoming = appointments.slice(0, 5);
  const doctors = [...new Map(appointments.filter((appointment) => appointment.doctor).map((appointment) => [appointment.doctor?.id, appointment.doctor])).values()];
  const period = formatRange(days[0], days[6]);

  return (
    <>
    <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7">
      {notice ? <div className="fixed right-4 bottom-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl bg-ink px-4 py-3 text-xs font-bold text-white shadow-xl" role="status"><Check className="size-4 text-success" aria-hidden="true" />{notice}</div> : null}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-accent uppercase">Recepción · agenda</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Agenda de Recepción</h1><p className="mt-1 text-xs text-muted">Organiza citas, llegadas y flujo de pacientes en tiempo real.</p></div><div className="flex flex-wrap gap-2"><button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-extrabold hover:bg-surface-hover" type="button" onClick={() => setIsBlockModalOpen(true)}><Lock className="size-3.5" aria-hidden="true" />Bloquear horario</button><button className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent px-4 text-xs font-extrabold text-white shadow-sm hover:bg-accent-hover" type="button" onClick={() => setIsCreateModalOpen(true)}><Plus className="size-3.5" aria-hidden="true" />Nueva cita</button></div></header>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de citas"><MetricCard icon={CalendarDays} label="Citas de hoy" value={summary.todayTotal} helper={`${appointments.length} en el periodo visible`} tone="bg-accent-soft text-accent" /><MetricCard icon={CalendarCheck} label="Confirmadas" value={summary.confirmed} helper="Listas para atención" tone="bg-success-soft text-success" /><MetricCard icon={Clock3} label="En espera" value={summary.waiting} helper="Pendientes de llegada" tone="bg-warning-soft text-warning" /><MetricCard icon={X} label="Canceladas" value={summary.canceled} helper={`${summary.noShow} no asistieron`} tone="bg-danger-soft text-danger" /></section>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 space-y-4">
          <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.3rem_1rem_rgb(16_27_51/4%)]" aria-labelledby="calendar-title">
            <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-3"><div className="flex gap-1"><button className="grid size-8 place-items-center rounded-lg border border-line text-muted hover:bg-surface-hover" type="button" aria-label="Semana anterior" onClick={() => changeWeek(-1)}><ChevronLeft className="size-4" aria-hidden="true" /></button><button className="grid size-8 place-items-center rounded-lg border border-line text-muted hover:bg-surface-hover" type="button" aria-label="Semana siguiente" onClick={() => changeWeek(1)}><ChevronRight className="size-4" aria-hidden="true" /></button></div><h2 className="text-xs font-extrabold" id="calendar-title">{period}</h2><button className="ml-auto min-h-8 rounded-lg border border-line px-3 text-2xs font-bold text-accent hover:bg-accent-soft" type="button" onClick={goToCurrentWeek}>Hoy</button><div className="order-first flex rounded-lg bg-surface-subtle p-1 sm:order-none sm:ml-2">{(["Día", "Semana", "Mes"] as const).map((mode) => <button className={`min-h-7 rounded-md px-3 text-[0.62rem] font-bold ${view === mode ? "bg-surface text-accent shadow-sm" : "text-muted"}`} type="button" key={mode} onClick={() => setView(mode)}>{mode}</button>)}</div></div>
            {isLoading ? <div className="grid min-h-125 place-items-center text-xs font-bold text-muted">Cargando agenda…</div> : view === "Semana" ? 
            <WeekCalendar days={days} appointments={appointments}  blocks={blocks} onAppointmentClick={setSelectedAppointment} /> : <div className="grid min-h-125 place-items-center p-8 text-center"><div><CalendarDays className="mx-auto size-10 text-accent" aria-hidden="true" /><p className="mt-3 text-sm font-extrabold">Vista de {view.toLowerCase()}</p><p className="mt-1 max-w-sm text-xs text-muted">{view === "Día" ? "Selecciona Semana para ver los horarios de toda la clínica." : "La información mensual se alimenta de las citas registradas."}</p><button className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-xs font-bold text-accent" type="button" onClick={() => setView("Semana")}>Volver a semana</button></div></div>}
            <ClinicAppointmentDetailModal  appointment={selectedAppointment}  onClose={() => setSelectedAppointment(null)}/>
          </section>

          <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.3rem_1rem_rgb(16_27_51/4%)]" aria-labelledby="appointments-list-title"><div className="flex items-center justify-between border-b border-line px-4 py-3"><div><h2 className="text-xs font-extrabold" id="appointments-list-title">Citas del periodo</h2><p className="mt-0.5 text-[0.6rem] text-muted">Datos sincronizados con la agenda clínica.</p></div><span className="rounded-full bg-surface-subtle px-2 py-1 text-[0.58rem] font-bold text-muted">{appointments.length} registradas</span></div><div className="overflow-x-auto"><table className="w-full min-w-180 text-left"><thead className="bg-surface-subtle text-[0.56rem] font-bold uppercase tracking-wide text-muted"><tr><th className="px-3 py-2" scope="col">Hora</th><th className="px-3 py-2" scope="col">Paciente</th><th className="px-3 py-2" scope="col">Médico</th><th className="px-3 py-2" scope="col">Tipo</th><th className="px-3 py-2" scope="col">Estado</th></tr></thead><tbody className="divide-y divide-line">{appointments.map((appointment) => <tr className="text-[0.62rem]" key={appointment.id}><td className="px-3 py-2.5 font-mono font-bold">{new Date(`${appointment.scheduledDate}T12:00:00`).toLocaleDateString("es-PE", { weekday: "short", day: "numeric" })} · {appointment.time}</td><th className="px-3 py-2.5 font-normal" scope="row"><span className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-full bg-accent-soft font-mono text-[0.5rem] font-bold text-accent">{initials(appointment.patient.name ?? "Paciente")}</span><span className="font-extrabold">{appointment.patient.name ?? "Paciente sin nombre"}</span></span></th><td className="px-3 py-2.5 font-semibold text-ink-secondary">{appointment.doctor?.name ?? "Sin asignar"}</td><td className="px-3 py-2.5 text-ink-secondary">{appointment.appointmentType}</td><td className="px-3 py-2.5"><span className={`rounded-full border px-2 py-1 text-[0.52rem] font-extrabold ${statusStyles[appointment.status]}`}>{appointment.statusLabel}</span></td></tr>)}</tbody></table>{!isLoading && appointments.length === 0 ? <p className="px-4 py-8 text-center text-xs font-semibold text-muted">No hay citas en este periodo.</p> : null}</div></section>
        </div>

        <aside className="grid gap-3"><section className="rounded-xl border border-line bg-surface p-4"><div className="flex items-center justify-between"><h2 className="text-xs font-extrabold">Próximas citas</h2><span className="text-[0.6rem] font-bold text-accent">{upcoming.length}</span></div><ol className="mt-3 divide-y divide-line">{upcoming.map((appointment) => <li className="grid grid-cols-[2.5rem_1fr] gap-2 py-2.5" key={`upcoming-${appointment.id}`}><time className="font-mono text-[0.65rem] font-bold">{appointment.time}</time><div><p className="truncate text-[0.62rem] font-extrabold">{appointment.patient.name ?? "Paciente"}</p><p className="mt-0.5 text-[0.55rem] text-muted">{appointment.doctor?.name ?? "Sin médico"}</p><span className={`mt-1 inline-flex items-center gap-1 text-[0.52rem] font-bold ${appointment.status === "confirmed" ? "text-success" : appointment.status === "waiting" ? "text-warning" : "text-accent"}`}><span className="size-1 rounded-full bg-current" />{appointment.statusLabel}</span></div></li>)}</ol>{upcoming.length === 0 ? <p className="mt-3 text-[0.62rem] text-muted">No hay próximas citas.</p> : null}</section><section className="rounded-xl border border-line bg-surface p-4"><div className="flex items-center justify-between"><h2 className="text-xs font-extrabold">Disponibilidad médica</h2><UserRound className="size-4 text-accent" aria-hidden="true" /></div><ul className="mt-3 grid gap-2.5">{doctors.map((doctor) => <li className="flex items-center gap-2" key={doctor?.id}><span className="grid size-7 place-items-center rounded-full bg-accent-soft font-mono text-[0.55rem] font-bold text-accent">{initials(doctor?.name ?? "")}</span><span className="min-w-0 flex-1 truncate text-[0.6rem] font-extrabold">{doctor?.name}</span><span className="size-1.5 rounded-full bg-success" title="Con citas registradas" /></li>)}</ul>{doctors.length === 0 ? <p className="mt-3 text-[0.62rem] text-muted">Sin médicos con agenda registrada.</p> : null}</section><section className="rounded-xl border border-line bg-surface p-4"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-violet-soft text-violet"><ShieldCheck className="size-4" aria-hidden="true" /></span><h2 className="text-xs font-extrabold">Resumen de estado</h2></div><div className="mt-3 rounded-lg bg-success-soft p-3"><p className="text-[0.62rem] font-extrabold text-success">Agenda sincronizada</p><p className="mt-1 text-[0.56rem] leading-relaxed text-success/80">El backend devolvió los datos del periodo seleccionado.</p></div><div className="mt-3"><SummaryList summary={summary} /></div></section></aside>
      </div>
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
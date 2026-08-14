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
  X,
} from "lucide-react";
import { useState } from "react";

type ViewMode = "Día" | "Semana" | "Mes";
type AppointmentStatus = "Confirmada" | "En espera" | "Reprogramada";
type Appointment = { day: number; start: number; span: number; time: string; patient: string; doctor: string; status: AppointmentStatus };

const days = ["Lunes · 2 Jun", "Martes · 3 Jun", "Miércoles · 4 Jun", "Jueves · 5 Jun", "Viernes · 6 Jun", "Sábado · 7 Jun", "Domingo · 8 Jun"] as const;
const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"] as const;
const appointments: readonly Appointment[] = [
  { day: 1, start: 1, span: 2, time: "09:00", patient: "Ana López", doctor: "Dr. Ricardo", status: "Confirmada" },
  { day: 1, start: 4, span: 2, time: "12:00", patient: "Carlos Ruiz", doctor: "Dra. Marta", status: "Confirmada" },
  { day: 1, start: 8, span: 2, time: "16:00", patient: "Sofía Herrera", doctor: "Dr. Sergio", status: "Confirmada" },
  { day: 2, start: 2, span: 2, time: "10:00", patient: "Luis Martínez", doctor: "Dr. Ricardo", status: "Confirmada" },
  { day: 2, start: 6, span: 2, time: "14:00", patient: "María Vargas", doctor: "Dra. Sofía", status: "Confirmada" },
  { day: 3, start: 0, span: 2, time: "08:00", patient: "Andrea León", doctor: "Dra. Marta", status: "Reprogramada" },
  { day: 3, start: 3, span: 2, time: "11:00", patient: "Jorge Ramírez", doctor: "Dr. Ricardo", status: "Confirmada" },
  { day: 3, start: 7, span: 2, time: "15:00", patient: "Paola Díaz", doctor: "Dra. Sofía", status: "Confirmada" },
  { day: 4, start: 2, span: 2, time: "10:00", patient: "Diego Morales", doctor: "Dr. Sergio", status: "Reprogramada" },
  { day: 4, start: 6, span: 2, time: "14:00", patient: "Valeria Castro", doctor: "Dra. Marta", status: "Confirmada" },
  { day: 5, start: 1, span: 2, time: "09:00", patient: "Fernando Ortiz", doctor: "Dra. Sofía", status: "Confirmada" },
  { day: 5, start: 5, span: 2, time: "13:00", patient: "Renata Flores", doctor: "Dr. Ricardo", status: "Confirmada" },
  { day: 5, start: 8, span: 2, time: "16:00", patient: "Gabriel Núñez", doctor: "Dra. Marta", status: "Confirmada" },
  { day: 6, start: 2, span: 2, time: "10:00", patient: "Claudia Peña", doctor: "Dra. Sofía", status: "Confirmada" },
  { day: 6, start: 5, span: 2, time: "13:00", patient: "—", doctor: "En espera", status: "En espera" },
  { day: 6, start: 8, span: 2, time: "16:00", patient: "En espera", doctor: "—", status: "En espera" },
];

const requests = [
  ["Fernando Ortiz", "Dra. Sofía Luna", "7 Jun, 2026", "WhatsApp", "Conflicto de horario"],
  ["Valeria Castro", "Dra. María Jiménez", "5 Jun, 2026", "Portal Paciente", "Asunto personal"],
  ["Pedro Torres", "Dr. Sergio Valdés", "3 Jun, 2026", "Teléfono", "Viaje de trabajo"],
  ["Renata Flores", "Dr. Sergio Valdés", "6 Jun, 2026", "WhatsApp", "Cambio de ciudad"],
] as const;

const statusStyles: Record<AppointmentStatus, string> = {
  Confirmada: "border-accent/25 bg-accent-soft text-accent",
  "En espera": "border-warning/25 bg-warning-soft text-warning",
  Reprogramada: "border-violet/25 bg-violet-soft text-violet",
};

function MetricCard({ icon: Icon, label, value, helper, tone }: { icon: LucideIcon; label: string; value: string; helper: string; tone: string }) {
  return <article className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.3rem_1rem_rgb(16_27_51/4%)]"><div className="flex items-center gap-3"><span className={`grid size-9 place-items-center rounded-lg ${tone}`}><Icon className="size-4" aria-hidden="true" /></span><div><p className="text-2xs font-bold text-muted">{label}</p><p className="mt-1 font-mono text-xl font-bold tracking-tight">{value}</p></div></div><p className="mt-3 border-t border-line pt-2 text-[0.62rem] font-semibold text-muted">{helper}</p></article>;
}

function WeekCalendar() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-190">
        <div className="grid grid-cols-[3rem_repeat(7,minmax(5.5rem,1fr))] border-b border-line bg-surface-subtle/70">
          <span /><>{days.map((day) => <div className="border-l border-line px-1 py-2 text-center text-[0.6rem] font-extrabold text-ink-secondary" key={day}>{day}</div>)}</>
        </div>
        <div className="grid grid-cols-[3rem_1fr]">
          <div className="grid grid-rows-10">{hours.map((hour) => <span className="border-b border-line pr-2 pt-1 text-right font-mono text-[0.56rem] font-bold text-muted" key={hour}>{hour}</span>)}</div>
          <div className="relative grid h-125 grid-cols-7 grid-rows-10 bg-[linear-gradient(to_bottom,var(--line)_1px,transparent_1px)] bg-[length:100%_10%]">
            {days.map((day) => <span className="border-l border-line" key={day} />)}
            {appointments.map((item, index) => (
              <button
                className={`absolute z-10 overflow-hidden rounded-md border p-1.5 text-left shadow-[0_0.2rem_0.6rem_rgb(16_27_51/6%)] transition-transform hover:z-20 hover:-translate-y-0.5 hover:shadow-md focus-visible:z-20 focus-visible:outline-2 focus-visible:outline-accent ${statusStyles[item.status]}`}
                key={`${item.day}-${item.time}-${index}`}
                style={{ left: `calc(${((item.day - 1) / 7) * 100}% + 0.2rem)`, top: `calc(${item.start * 10}% + 0.2rem)`, width: "calc(14.2857% - 0.4rem)", height: `calc(${item.span * 10}% - 0.4rem)` }}
                type="button"
                aria-label={`${item.time}, ${item.patient}, ${item.doctor}, ${item.status}`}
              >
                <span className="block font-mono text-[0.55rem] font-extrabold">{item.time}</span><span className="mt-0.5 block truncate text-[0.58rem] font-extrabold">{item.patient}</span><span className="block truncate text-[0.5rem] font-semibold opacity-75">{item.doctor}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClinicAgenda() {
  const [view, setView] = useState<ViewMode>("Semana");
  const [weekOffset, setWeekOffset] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const period = weekOffset === 0 ? "2 – 8 de junio, 2026" : weekOffset < 0 ? "26 de mayo – 1 de junio, 2026" : "9 – 15 de junio, 2026";
  const showNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(null), 2400); };

  return (
    <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7">
      {notice ? <div className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-xs font-bold text-white shadow-xl" role="status"><Check className="size-4 text-success" />{notice}</div> : null}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-accent uppercase">Agenda administrativa</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Agenda Médica</h1><p className="mt-1 text-xs text-muted">Programación de citas y disponibilidad de la clínica.</p></div><div className="flex flex-wrap gap-2"><button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-extrabold hover:bg-surface-hover" type="button" onClick={() => showNotice("Selecciona un horario en el calendario")}><Lock className="size-3.5" />Bloquear horario</button><button className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent px-4 text-xs font-extrabold text-white shadow-sm hover:bg-accent-hover" type="button" onClick={() => showNotice("Formulario de cita listo para conectar")}><Plus className="size-3.5" />Agendar cita</button></div></header>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de citas"><MetricCard icon={CalendarDays} label="Citas hoy" value="42" helper="6 reprogramadas" tone="bg-accent-soft text-accent" /><MetricCard icon={CalendarCheck} label="Confirmadas" value="31" helper="73.8% del total" tone="bg-success-soft text-success" /><MetricCard icon={Clock3} label="En espera" value="7" helper="16.7% del total" tone="bg-warning-soft text-warning" /><MetricCard icon={X} label="Canceladas" value="4" helper="9.5% del total" tone="bg-danger-soft text-danger" /></section>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 space-y-4">
          <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.3rem_1rem_rgb(16_27_51/4%)]" aria-labelledby="calendar-title">
            <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-3"><div className="flex gap-1"><button className="grid size-8 place-items-center rounded-lg border border-line text-muted hover:bg-surface-hover" type="button" aria-label="Semana anterior" onClick={() => setWeekOffset(-1)}><ChevronLeft className="size-4" /></button><button className="grid size-8 place-items-center rounded-lg border border-line text-muted hover:bg-surface-hover" type="button" aria-label="Semana siguiente" onClick={() => setWeekOffset(1)}><ChevronRight className="size-4" /></button></div><h2 className="text-xs font-extrabold" id="calendar-title">{period}</h2><button className="ml-auto min-h-8 rounded-lg border border-line px-3 text-2xs font-bold text-accent hover:bg-accent-soft" type="button" onClick={() => setWeekOffset(0)}>Hoy</button><div className="order-first flex rounded-lg bg-surface-subtle p-1 sm:order-none sm:ml-2">{(["Día", "Semana", "Mes"] as const).map((mode) => <button className={`min-h-7 rounded-md px-3 text-[0.62rem] font-bold ${view === mode ? "bg-surface text-accent shadow-sm" : "text-muted"}`} type="button" key={mode} onClick={() => setView(mode)}>{mode}</button>)}</div></div>
            {view === "Semana" ? <WeekCalendar /> : <div className="grid min-h-125 place-items-center p-8 text-center"><div><CalendarDays className="mx-auto size-10 text-accent" /><p className="mt-3 text-sm font-extrabold">Vista de {view.toLowerCase()}</p><p className="mt-1 text-xs text-muted">La vista semanal concentra la operación mostrada en el diseño.</p><button className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-xs font-bold text-accent" type="button" onClick={() => setView("Semana")}>Volver a semana</button></div></div>}
          </section>

          <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.3rem_1rem_rgb(16_27_51/4%)]"><div className="flex items-center justify-between border-b border-line px-4 py-3"><div><h2 className="text-xs font-extrabold">Solicitudes de reprogramación</h2><p className="mt-0.5 text-[0.6rem] text-muted">Revisa y gestiona cambios solicitados por pacientes.</p></div><span className="rounded-full bg-surface-subtle px-2 py-1 text-[0.58rem] font-bold text-muted">4 pendientes</span></div><div className="overflow-x-auto"><table className="w-full min-w-180 text-left"><thead className="bg-surface-subtle text-[0.56rem] font-bold uppercase tracking-wide text-muted"><tr>{["Paciente", "Médico", "Fecha solicitada", "Canal", "Motivo", "Acción"].map((heading) => <th className="px-3 py-2" key={heading}>{heading}</th>)}</tr></thead><tbody className="divide-y divide-line">{requests.map((request) => <tr className="text-[0.62rem]" key={request[0]}>{request.map((value) => <td className="px-3 py-2.5 font-semibold text-ink-secondary" key={value}>{value}</td>)}<td className="px-3 py-2"><div className="flex gap-1"><button className="rounded-md bg-accent-soft px-2 py-1 font-bold text-accent" type="button" onClick={() => showNotice(`Solicitud de ${request[0]} aceptada`)}>Aceptar</button><button className="rounded-md border border-line px-2 py-1 font-bold text-muted" type="button" onClick={() => showNotice(`Solicitud de ${request[0]} rechazada`)}>Rechazar</button></div></td></tr>)}</tbody></table></div></section>
        </div>

        <aside className="grid gap-3">
          <section className="rounded-xl border border-line bg-surface p-4"><div className="flex items-center justify-between"><h2 className="text-xs font-extrabold">Próximas citas</h2><button className="text-[0.6rem] font-bold text-accent" type="button">Ver todas</button></div><ol className="mt-3 divide-y divide-line">{appointments.slice(0, 5).map((item, index) => <li className="grid grid-cols-[2.5rem_1fr] gap-2 py-2.5" key={`${item.patient}-${index}`}><time className="font-mono text-[0.65rem] font-bold">{item.time}</time><div><p className="truncate text-[0.62rem] font-extrabold">{item.patient}</p><p className="mt-0.5 text-[0.55rem] text-muted">{item.doctor}</p><span className={`mt-1 inline-flex items-center gap-1 text-[0.52rem] font-bold ${item.status === "Confirmada" ? "text-success" : item.status === "En espera" ? "text-warning" : "text-violet"}`}><span className="size-1 rounded-full bg-current" />{item.status}</span></div></li>)}</ol></section>
          <section className="rounded-xl border border-line bg-surface p-4"><div className="flex items-center justify-between"><h2 className="text-xs font-extrabold">Disponibilidad médica</h2><button className="text-[0.6rem] font-bold text-accent" type="button">Ver todos</button></div><ul className="mt-3 grid gap-2.5">{[["RG", "Dr. Ricardo Gómez", "Disponible"], ["MJ", "Dra. Marta Jiménez", "Disponible"], ["SV", "Dr. Sergio Valdés", "En consulta"], ["SL", "Dra. Sofía Luna", "Disponible"]].map(([initials, name, status]) => <li className="flex items-center gap-2" key={name}><span className="grid size-7 place-items-center rounded-full bg-accent-soft font-mono text-[0.55rem] font-bold text-accent">{initials}</span><span className="min-w-0 flex-1 truncate text-[0.6rem] font-extrabold">{name}</span><span className={`size-1.5 rounded-full ${status === "Disponible" ? "bg-success" : "bg-warning"}`} title={status} /></li>)}</ul></section>
          <section className="rounded-xl border border-line bg-surface p-4"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-violet-soft text-violet"><ShieldCheck className="size-4" /></span><h2 className="text-xs font-extrabold">IA Epidemiológica</h2></div><div className="mt-3 rounded-lg bg-success-soft p-3"><p className="text-[0.62rem] font-extrabold text-success">Sin alertas críticas hoy</p><p className="mt-1 text-[0.56rem] leading-relaxed text-success/80">La actividad se mantiene dentro de parámetros normales.</p></div></section>
        </aside>
      </div>
    </div>
  );
}

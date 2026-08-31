"use client";

import {
  CalendarDays,
  Clock3,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";

import type {
  ClinicAppointment,
  ClinicAppointmentStatus,
} from "@/features/clinics/model/clinic-admin.types";

type Props = {
  appointment: ClinicAppointment | null;
  onClose: () => void;
};

const statusStyles: Record<ClinicAppointmentStatus, string> = {
  pending: "border-danger/25 bg-danger-soft text-danger",
  confirmed: "border-success/25 bg-success-soft text-success",
  waiting: "border-warning/25 bg-warning-soft text-warning",
  in_consultation: "border-accent/25 bg-accent-soft text-accent",
  completed: "border-violet/25 bg-violet-soft text-violet",
  canceled: "border-danger/25 bg-danger-soft text-danger",
  no_show: "border-line bg-surface-subtle text-muted",
};

export function ClinicAppointmentDetailModal({
  appointment,
  onClose,
}: Readonly<Props>) {
  if (!appointment) {
    return null;
  }

  const formattedDate = new Date(
    `${appointment.scheduledDate}T12:00:00`,
  ).toLocaleDateString("es-PE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4"
      role="presentation"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-detail-title"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="text-[0.6rem] font-bold uppercase tracking-wider text-accent">
              Agenda clínica
            </p>

            <h2
              id="appointment-detail-title"
              className="mt-1 text-base font-extrabold"
            >
              Detalle de cita
            </h2>
          </div>

          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-hover"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="grid gap-4 p-5">
          <section className="rounded-xl border border-line bg-surface-subtle/50 p-4">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                <UserRound className="size-5" />
              </span>

              <div className="min-w-0">
                <p className="text-sm font-extrabold">
                  {appointment.patient.name ?? "Paciente sin nombre"}
                </p>

                <p className="mt-1 font-mono text-[0.65rem] text-muted">
                  {appointment.patient.patientCode}
                </p>

                {appointment.patient.phoneNumber ? (
                  <p className="mt-1 text-xs text-muted">
                    {appointment.patient.phoneNumber}
                  </p>
                ) : null}
              </div>

              <span
                className={`ml-auto rounded-full border px-2.5 py-1 text-[0.6rem] font-extrabold ${
                  statusStyles[appointment.status]
                }`}
              >
                {appointment.statusLabel}
              </span>
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line p-3">
              <div className="flex items-center gap-2 text-muted">
                <CalendarDays className="size-4" />
                <span className="text-[0.62rem] font-bold">
                  Fecha
                </span>
              </div>

              <p className="mt-2 text-xs font-extrabold capitalize">
                {formattedDate}
              </p>
            </div>

            <div className="rounded-xl border border-line p-3">
              <div className="flex items-center gap-2 text-muted">
                <Clock3 className="size-4" />
                <span className="text-[0.62rem] font-bold">
                  Hora
                </span>
              </div>

              <p className="mt-2 font-mono text-xs font-extrabold">
                {appointment.time}
              </p>
            </div>
          </div>

          <section className="rounded-xl border border-line p-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="size-4 text-accent" />

              <p className="text-xs font-extrabold">
                Médico
              </p>
            </div>

            <p className="mt-2 text-xs font-semibold">
              {appointment.doctor?.name ?? "Sin médico asignado"}
            </p>

            {appointment.doctor?.specialty ? (
              <p className="mt-1 text-[0.65rem] text-muted">
                {appointment.doctor.specialty}
              </p>
            ) : null}
          </section>

          <div>
            <p className="text-xs font-bold">
              Tipo de cita
            </p>

            <p className="mt-1 text-xs text-ink-secondary">
              {appointment.appointmentType}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold">
              Observaciones
            </p>

            <div className="mt-2 min-h-20 rounded-xl border border-line bg-surface-subtle/40 p-3">
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-ink-secondary">
                {appointment.notes?.trim()
                  ? appointment.notes
                  : "Sin observaciones registradas."}
              </p>
            </div>
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-line bg-surface-subtle/50 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 rounded-xl border border-line bg-surface px-4 text-xs font-extrabold hover:bg-surface-hover"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
}
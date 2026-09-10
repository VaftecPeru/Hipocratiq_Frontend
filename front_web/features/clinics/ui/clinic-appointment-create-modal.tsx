"use client";

import { CalendarDays, Loader2, Search, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import {
  createClinicAppointment,
  getClinicMembers,
  getClinicPatients,
} from "@/features/clinics/api/browser-clinic-dashboard";

import type {
  ClinicAppointment,
  ClinicPatient,
  ClinicTeamMember,
} from "@/features/clinics/model/clinic-admin.types";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (appointment: ClinicAppointment) => void;
};

type AppointmentTypeValue = "consultation" | "control";

export function ClinicAppointmentCreateModal({
  open,
  onClose,
  onCreated,
}: Readonly<Props>) {
  const [patients, setPatients] = useState<ClinicPatient[]>([]);
  const [doctors, setDoctors] = useState<ClinicTeamMember[]>([]);

  const [patientSearch, setPatientSearch] = useState("");
  const [patientProfileId, setPatientProfileId] = useState("");
  const [doctorUserId, setDoctorUserId] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [appointmentType, setAppointmentType] =
    useState<AppointmentTypeValue>("consultation");

  const [notes, setNotes] = useState("");

  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const controller = new AbortController();

    setIsLoadingOptions(true);
    setError(null);

    Promise.all([
      getClinicPatients("", 1, controller.signal),
      getClinicMembers(controller.signal),
    ])
      .then(([patientPage, members]) => {
        setPatients(patientPage.patients);

        setDoctors(
          members.filter(
            (member) => member.role === "doctor",
          ),
        );
      })
      .catch((loadError: unknown) => {
        if (
          loadError instanceof DOMException &&
          loadError.name === "AbortError"
        ) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "No pudimos cargar los datos del formulario.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingOptions(false);
        }
      });

    return () => controller.abort();
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(() => {
      getClinicPatients(patientSearch, 1, controller.signal)
        .then((result) => {
          setPatients(result.patients);
        })
        .catch((searchError: unknown) => {
          if (
            searchError instanceof DOMException &&
            searchError.name === "AbortError"
          ) {
            return;
          }

          setError(
            searchError instanceof Error
              ? searchError.message
              : "No pudimos buscar pacientes.",
          );
        });
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, patientSearch]);

  function resetForm(): void {
    setPatientSearch("");
    setPatientProfileId("");
    setDoctorUserId("");
    setDate("");
    setTime("");
    setAppointmentType("consultation");
    setNotes("");
    setError(null);
  }

  function closeModal(): void {
    if (isSaving) {
      return;
    }

    resetForm();
    onClose();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setError(null);

    if (!patientProfileId) {
      setError("Selecciona un paciente.");
      return;
    }

    if (!date || !time) {
      setError("Selecciona la fecha y hora de la cita.");
      return;
    }

    setIsSaving(true);

    try {
      const appointment = await createClinicAppointment({
        patientProfileId: Number(patientProfileId),

        doctorUserId: doctorUserId
          ? Number(doctorUserId)
          : null,

        scheduledAt: `${date} ${time}:00`,

        appointmentType,

        notes: notes.trim() || null,
      });

      resetForm();
      onCreated(appointment);
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No pudimos registrar la cita.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4"
      role="presentation"
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-appointment-title"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
              <CalendarDays
                className="size-5"
                aria-hidden="true"
              />
            </span>

            <div>
              <h2
                id="new-appointment-title"
                className="text-sm font-extrabold"
              >
                Nueva cita
              </h2>

              <p className="mt-0.5 text-[0.65rem] text-muted">
                Programa una cita para un paciente de la clínica.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-hover"
            onClick={closeModal}
            disabled={isSaving}
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 p-5">

            {error ? (
              <div
                className="rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-xs font-semibold text-danger"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            <div>
              <label
                htmlFor="patient-search"
                className="mb-1.5 block text-xs font-bold"
              >
                Buscar paciente
              </label>

              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />

                <input
                  id="patient-search"
                  type="search"
                  value={patientSearch}
                  onChange={(event) =>
                    setPatientSearch(event.target.value)
                  }
                  placeholder="Nombre, correo o teléfono..."
                  className="min-h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-xs outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="appointment-patient"
                className="mb-1.5 block text-xs font-bold"
              >
                Paciente *
              </label>

              <select
                id="appointment-patient"
                value={patientProfileId}
                onChange={(event) =>
                  setPatientProfileId(event.target.value)
                }
                disabled={isLoadingOptions}
                className="min-h-10 w-full rounded-xl border border-line bg-surface px-3 text-xs outline-none focus:border-accent"
                required
              >
                <option value="">
                  Seleccionar paciente
                </option>

                {patients.map((patient) => (
                  <option
                    value={patient.id}
                    key={patient.id}
                  >
                    {patient.name ?? "Paciente sin nombre"} ·{" "}
                    {patient.patientCode}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="appointment-doctor"
                className="mb-1.5 block text-xs font-bold"
              >
                Médico
              </label>

              <select
                id="appointment-doctor"
                value={doctorUserId}
                onChange={(event) =>
                  setDoctorUserId(event.target.value)
                }
                disabled={isLoadingOptions}
                className="min-h-10 w-full rounded-xl border border-line bg-surface px-3 text-xs outline-none focus:border-accent"
              >
                <option value="">
                  Sin asignar
                </option>

                {doctors.map((doctor) => (
                  <option
                    value={doctor.id}
                    key={doctor.id}
                  >
                    {doctor.name}
                    {doctor.specialty
                      ? ` · ${doctor.specialty}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="appointment-date"
                  className="mb-1.5 block text-xs font-bold"
                >
                  Fecha *
                </label>

                <input
                  id="appointment-date"
                  type="date"
                  value={date}
                  onChange={(event) =>
                    setDate(event.target.value)
                  }
                  className="min-h-10 w-full rounded-xl border border-line bg-surface px-3 text-xs outline-none focus:border-accent"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="appointment-time"
                  className="mb-1.5 block text-xs font-bold"
                >
                  Hora *
                </label>

                <input
                  id="appointment-time"
                  type="time"
                  value={time}
                  onChange={(event) =>
                    setTime(event.target.value)
                  }
                  className="min-h-10 w-full rounded-xl border border-line bg-surface px-3 text-xs outline-none focus:border-accent"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="appointment-type"
                className="mb-1.5 block text-xs font-bold"
              >
                Tipo de cita *
              </label>

              <select
                id="appointment-type"
                value={appointmentType}
                onChange={(event) =>
                  setAppointmentType(
                    event.target.value as AppointmentTypeValue,
                  )
                }
                className="min-h-10 w-full rounded-xl border border-line bg-surface px-3 text-xs outline-none focus:border-accent"
              >
                <option value="consultation">
                  Consulta
                </option>

                <option value="control">
                  Control
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="appointment-notes"
                className="mb-1.5 block text-xs font-bold"
              >
                Observaciones
              </label>

              <textarea
                id="appointment-notes"
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                rows={4}
                maxLength={2000}
                placeholder="Información adicional de la cita..."
                className="w-full resize-none rounded-xl border border-line bg-surface px-3 py-2.5 text-xs outline-none focus:border-accent"
              />
            </div>
          </div>

          <footer className="flex justify-end gap-2 border-t border-line bg-surface-subtle/50 px-5 py-4">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSaving}
              className="min-h-10 rounded-xl border border-line bg-surface px-4 text-xs font-extrabold hover:bg-surface-hover disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving || isLoadingOptions}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent px-4 text-xs font-extrabold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                  Registrando...
                </>
              ) : (
                "Crear cita"
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

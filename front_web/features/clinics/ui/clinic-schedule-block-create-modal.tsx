"use client";

import { Lock, Loader2, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import {
  createClinicScheduleBlock,
  getClinicMembers,
} from "@/features/clinics/api/browser-clinic-dashboard";

import type {
  ClinicScheduleBlock,
  ClinicTeamMember,
} from "@/features/clinics/model/clinic-admin.types";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (block: ClinicScheduleBlock) => void;
};

export function ClinicScheduleBlockCreateModal(props: Readonly<Props>) {
  if (!props.open) return null;
  return <ClinicScheduleBlockCreateModalContent {...props} />;
}

function ClinicScheduleBlockCreateModalContent({
  open,
  onClose,
  onCreated,
}: Readonly<Props>) {
  const [doctors, setDoctors] = useState<ClinicTeamMember[]>([]);

  const [doctorUserId, setDoctorUserId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();

    getClinicMembers(controller.signal)
      .then((members) => {
        if (controller.signal.aborted) return;
        setDoctors(
          members.filter((member) => member.role === "doctor" && member.status === "active"),
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
            : "No pudimos cargar los médicos.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [open]);

  function reset(): void {
    setDoctorUserId("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setReason("");
    setError(null);
  }

  function closeModal(): void {
    if (isSaving) return;

    reset();
    onClose();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setError(null);

    if (!date || !startTime || !endTime) {
      setError("Completa la fecha y el horario.");
      return;
    }

    if (endTime <= startTime) {
      setError(
        "La hora final debe ser posterior a la hora inicial.",
      );
      return;
    }

    setIsSaving(true);

    try {
      const block = await createClinicScheduleBlock({
        doctorUserId: doctorUserId
          ? Number(doctorUserId)
          : null,

        startsAt: `${date} ${startTime}:00`,
        endsAt: `${date} ${endTime}:00`,
        reason: reason.trim() || null,
      });

      reset();
      onCreated(block);
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No pudimos bloquear el horario.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4">
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="block-schedule-title"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-violet-soft text-violet">
              <Lock className="size-5" />
            </span>

            <div>
              <h2
                id="block-schedule-title"
                className="text-sm font-extrabold"
              >
                Bloquear horario
              </h2>

              <p className="mt-0.5 text-[0.65rem] text-muted">
                Registra un periodo no disponible en la agenda.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={isSaving}
            className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-hover"
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 p-5">

            {error ? (
              <div className="rounded-xl border border-danger/20 bg-danger-soft p-3 text-xs font-semibold text-danger">
                {error}
              </div>
            ) : null}

            <div>
              <label
                htmlFor="block-doctor"
                className="mb-1.5 block text-xs font-bold"
              >
                Aplicar bloqueo a
              </label>

              <select
                id="block-doctor"
                value={doctorUserId}
                onChange={(event) =>
                  setDoctorUserId(event.target.value)
                }
                disabled={isLoading}
                className="min-h-10 w-full rounded-xl border border-line bg-surface px-3 text-xs outline-none focus:border-accent"
              >
                <option value="">
                  Toda la clínica
                </option>

                {doctors.map((doctor) => (
                  <option
                    key={doctor.id}
                    value={doctor.id}
                  >
                    {doctor.name}
                    {doctor.specialty
                      ? ` · ${doctor.specialty}`
                      : ""}
                  </option>
                ))}
              </select>

              <p className="mt-1 text-[0.6rem] text-muted">
                Si seleccionas toda la clínica, ningún médico
                estará disponible durante ese periodo.
              </p>
            </div>

            <div>
              <label
                htmlFor="block-date"
                className="mb-1.5 block text-xs font-bold"
              >
                Fecha *
              </label>

              <input
                id="block-date"
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                required
                className="min-h-10 w-full rounded-xl border border-line bg-surface px-3 text-xs outline-none focus:border-accent"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="block-start"
                  className="mb-1.5 block text-xs font-bold"
                >
                  Desde *
                </label>

                <input
                  id="block-start"
                  type="time"
                  value={startTime}
                  onChange={(event) =>
                    setStartTime(event.target.value)
                  }
                  required
                  className="min-h-10 w-full rounded-xl border border-line bg-surface px-3 text-xs outline-none focus:border-accent"
                />
              </div>

              <div>
                <label
                  htmlFor="block-end"
                  className="mb-1.5 block text-xs font-bold"
                >
                  Hasta *
                </label>

                <input
                  id="block-end"
                  type="time"
                  value={endTime}
                  onChange={(event) =>
                    setEndTime(event.target.value)
                  }
                  required
                  className="min-h-10 w-full rounded-xl border border-line bg-surface px-3 text-xs outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="block-reason"
                className="mb-1.5 block text-xs font-bold"
              >
                Motivo
              </label>

              <textarea
                id="block-reason"
                rows={4}
                maxLength={500}
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value)
                }
                placeholder="Ej. reunión, mantenimiento, capacitación..."
                className="w-full resize-none rounded-xl border border-line bg-surface px-3 py-2.5 text-xs outline-none focus:border-accent"
              />
            </div>
          </div>

          <footer className="flex justify-end gap-2 border-t border-line bg-surface-subtle/50 px-5 py-4">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSaving}
              className="min-h-10 rounded-xl border border-line bg-surface px-4 text-xs font-extrabold hover:bg-surface-hover"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving || isLoading}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent px-4 text-xs font-extrabold text-white hover:bg-accent-hover disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Bloqueando...
                </>
              ) : (
                <>
                  <Lock className="size-3.5" />
                  Bloquear horario
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

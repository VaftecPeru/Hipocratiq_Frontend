"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ClipboardList, FilePenLine, History, Play, Plus, UserRound } from "lucide-react";
import { DoctorAvatar, DoctorCard, MetricCard, SectionHeading, StatusBadge } from "@/features/doctors/ui/doctor-primitives";
import { ConsultationForm, type ConsultationFormValues } from "@/features/doctors/ui/consultation-form";
import { emptyClinicalValues } from "@/features/doctors/ui/clinical-sections";
import {
  createConsultation,
  getDoctorConsultations,
  getDoctorPatients,
  updateConsultation,
  consultationToPayload,
  type Consultation,
  type DoctorPatient,
} from "@/features/doctors/api/doctor-clinical";
import { Spinner } from "@/shared/ui/spinner";
import { getClientLocale } from "@/shared/i18n/runtime-locale";

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(getClientLocale(), {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function ageFromBirthDate(value: string | null | undefined): string {
  if (!value) return "Edad no registrada";
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return "Edad no registrada";

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) age -= 1;

  return age >= 0 ? `${age} años` : "Edad no registrada";
}

function isToday(value: string | null): boolean {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
}

function initialsOf(name: string | null | undefined): string {
  return (name ?? "Paciente").split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "PA";
}

function statusTone(status: string): "blue" | "green" | "orange" | "red" | "violet" | "slate" {
  switch (status) {
    case "in_progress":
      return "orange";
    case "completed":
      return "green";
    case "signed":
      return "violet";
    case "canceled":
      return "red";
    default:
      return "slate";
  }
}

export default function DoctorConsultationsPage() {
  const searchParams = useSearchParams();
  const requestedPatientId = searchParams.get("patient_id");
  const requestedAppointmentId = searchParams.get("appointment_id");
  const requestContext = JSON.stringify([requestedPatientId, requestedAppointmentId]);
  const [loadedContext, setLoadedContext] = useState<string | null>(null);
  const [appointmentId, setAppointmentId] = useState<string | null>(requestedAppointmentId);
  const [revision, setRevision] = useState(0);
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [initialValues, setInitialValues] = useState<Partial<ConsultationFormValues>>({});
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getDoctorPatients(controller.signal), getDoctorConsultations(controller.signal)])
      .then(([patientList, consultationList]) => {
        if (controller.signal.aborted) return;
        setMode("create");
        setEditingId(null);
        setInitialValues({});
        setRevision((value) => value + 1);
        setError(null);
        setSuccess(null);
        setSelectedPatientId("");
        setPatients(patientList);
        setConsultations(consultationList);
        if (patientList.length > 0) {
          const requested = requestedPatientId
            ? (patientList.some((patient) => String(patient.id) === requestedPatientId) ? requestedPatientId : "")
            : String(patientList[0].id);
          setSelectedPatientId(requested);
          if (!requested) setError("El paciente solicitado no está disponible. Vuelve a la agenda.");
        }
        setAppointmentId(requestedAppointmentId);
        const existing = consultationList.find((item) => String(item.appointmentId) === requestedAppointmentId);
        if (existing) {
          setMode("edit");
          setEditingId(existing.id);
          setSelectedPatientId(String(existing.patient?.id ?? ""));
          const payload = consultationToPayload(existing);
          setInitialValues({ chiefComplaint: payload.chief_complaint, objective: payload.objective ?? "",
            status: existing.status,
            sections: { ...emptyClinicalValues(), ...(payload.sections ?? {}) },
            codings: payload.codings ?? [],
          });
        }
      })
      .catch((caught: unknown) => {
        if (!controller.signal.aborted && !(caught instanceof DOMException && caught.name === "AbortError")) {
          setPatients([]);
          setConsultations([]);
          setSelectedPatientId("");
          setEditingId(null);
          setMode("create");
          setInitialValues({});
          setError(caught instanceof Error ? caught.message : "No pudimos cargar las consultas.");
        }
      })
      .finally(() => { if (!controller.signal.aborted) { setLoading(false); setLoadedContext(requestContext); } });
    return () => controller.abort();
  }, [requestedPatientId, requestedAppointmentId, requestContext]);

  const metrics = useMemo(() => {
    const today = consultations.filter((consultation) => isToday(consultation.createdAt)).length;
    const inProgress = consultations.filter((consultation) => consultation.status === "in_progress").length;
    const finalized = consultations.filter((consultation) => ["completed", "signed"].includes(consultation.status)).length;
    const pendingCount = consultations.filter((consultation) => consultation.status === "draft").length;
    return { today, inProgress, finalized, pending: pendingCount };
  }, [consultations]);

  const selectedPatient = useMemo(
    () => patients.find((patient) => String(patient.id) === selectedPatientId) ?? null,
    [patients, selectedPatientId],
  );

  const selectedPatientLatestConsultation = useMemo(
    () => consultations
      .filter((consultation) => String(consultation.patient?.id ?? "") === selectedPatientId)
      .sort((left, right) => new Date(right.updatedAt ?? right.createdAt ?? 0).getTime() - new Date(left.updatedAt ?? left.createdAt ?? 0).getTime())[0] ?? null,
    [consultations, selectedPatientId],
  );

  const patientLabel = mode === "edit"
    ? consultations.find((consultation) => consultation.id === editingId)?.patient?.name ?? "Paciente"
    : selectedPatient?.name ?? "Selecciona un paciente";

  function resetForm(): void {
    setInitialValues({});
    setEditingId(null);
    setMode("create");
    setAppointmentId(null);
    setRevision((value) => value + 1);
  }

  function startCreate(): void {
    if (pending) return;
    resetForm();
    setError(null);
    setSuccess(null);
  }

  function startEdit(consultation: Consultation): void {
    setMode("edit");
    setEditingId(consultation.id);
    setRevision((value) => value + 1);
    setSelectedPatientId(String(consultation.patient?.id ?? ""));
    const payload = consultationToPayload(consultation);
    setInitialValues({
      chiefComplaint: payload.chief_complaint,
      objective: payload.objective ?? "",
      status: payload.status ?? "in_progress",
      sections: { ...emptyClinicalValues(), ...(payload.sections ?? {}) },
      codings: payload.codings ?? [],
    });
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(values: ConsultationFormValues): Promise<void> {
    if (pending) return;
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        appointment_id: mode === "create" && appointmentId ? Number(appointmentId) : undefined,
        chief_complaint: values.chiefComplaint,
        objective: values.objective,
        status: values.status,
        sections: values.sections,
        codings: values.codings,
      };

      if (mode === "edit" && editingId !== null) {
        const updated = await updateConsultation(editingId, payload);
        setConsultations((current) => current.map((consultation) => (consultation.id === updated.id ? updated : consultation)));
        startEdit(updated);
        setSuccess(updated.status === "signed" ? "Consulta firmada. El registro queda en modo lectura." : "Consulta actualizada correctamente.");
      } else {
        if (!selectedPatientId) {
          setError("Selecciona un paciente para iniciar la consulta.");
          return;
        }
        const created = await createConsultation(Number(selectedPatientId), payload);
        setConsultations((current) => [created, ...current]);
        startEdit(created);
        setSuccess("Consulta creada. Puedes continuar el registro, completarlo y después firmarlo.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos guardar la consulta.");
    } finally {
      setPending(false);
    }
  }

  if (loading || loadedContext !== requestContext) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
        <DoctorCard className="flex min-h-48 items-center justify-center p-6">
          <p className="flex items-center gap-2 text-xs font-bold text-muted" aria-busy="true">
            <Spinner className="size-4" /> Cargando consultas…
          </p>
        </DoctorCard>
      </div>
    );
  }

  if (error && consultations.length === 0 && patients.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
        <DoctorCard className="p-6">
          <p className="text-xs font-bold text-danger" role="alert">{error}</p>
        </DoctorCard>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.65rem]">Consultas</h1>
          <p className="mt-1 text-[0.68rem] font-bold text-ink-secondary">Gestiona tus atenciones médicas, evolución y seguimiento clínico.</p>
        </div>
        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[0.65rem] font-extrabold text-white shadow-[0_5px_14px_rgb(8_98_221/18%)] hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus"
            type="button"
            onClick={startCreate}
            disabled={pending}
          >
            <Plus className="size-3.5" aria-hidden="true" />Nueva Consulta
          </button>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-4 text-[0.65rem] font-extrabold text-ink-secondary hover:border-accent/40 hover:bg-accent-soft hover:text-accent focus-visible:outline-3 focus-visible:outline-focus"
            type="button"
            onClick={() => document.getElementById("doctor-consultation-history")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            <History className="size-3.5" aria-hidden="true" />Ver historial
          </button>
        </div>
      </header>

      {success ? (
        <div className="mb-4 rounded-lg border border-success/30 bg-success-soft px-4 py-3" role="status" aria-live="polite">
          <p className="flex items-center gap-2 text-xs font-extrabold text-success"><CheckCircle2 className="size-4" aria-hidden="true" />{success}</p>
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Resumen de consultas">
        <MetricCard label="Consultas hoy" value={String(metrics.today)} icon={ClipboardList} tone="blue" />
        <MetricCard label="En curso" value={String(metrics.inProgress)} icon={Play} tone="orange" />
        <MetricCard label="Finalizadas" value={String(metrics.finalized)} icon={CheckCircle2} tone="green" />
        <MetricCard label="Pendientes" value={String(metrics.pending)} icon={FilePenLine} tone="violet" />
      </section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.38fr)_minmax(390px,1fr)]" aria-label="Gestión de consultas">
        <DoctorCard className="min-w-0 overflow-hidden" id="doctor-consultation-history">
          <div className="border-b border-line px-4 py-3 sm:px-5"><SectionHeading title="Consultas registradas" /></div>
          <div className="overflow-x-auto">
            {consultations.length === 0 ? (
              <div className="grid place-items-center px-6 py-12 text-center">
                <p className="text-xs font-bold text-ink-secondary">Aún no tienes consultas. Crea la primera con «Nueva Consulta».</p>
              </div>
            ) : (
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-surface-subtle text-[0.55rem] font-extrabold text-ink-secondary">
                    <th className="px-3 py-2.5 font-extrabold sm:px-4">Paciente</th>
                    <th className="px-3 py-2.5 font-extrabold">Motivo</th>
                    <th className="px-3 py-2.5 font-extrabold">Estado</th>
                    <th className="px-3 py-2.5 font-extrabold">Fecha</th>
                    <th className="px-3 py-2.5 font-extrabold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {consultations.map((consultation) => (
                    <tr className="border-b border-line last:border-0 hover:bg-surface-subtle" key={consultation.id}>
                      <td className="px-3 py-2.5 sm:px-4">
                        <div className="flex items-center gap-2.5">
                          <DoctorAvatar initials={initialsOf(consultation.patient?.name)} tone={String(consultation.id % 2) === "0" ? "blue" : "orange"} size="sm" />
                          <span className="whitespace-nowrap text-[0.61rem] font-extrabold">{consultation.patient?.name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-[0.59rem] font-extrabold">{consultation.chiefComplaint}</td>
                      <td className="px-3 py-2.5"><StatusBadge tone={statusTone(consultation.status)}>{consultation.statusLabel}</StatusBadge></td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-[0.58rem] font-extrabold">{formatDateTime(consultation.createdAt)}</td>
                      <td className="px-3 py-2.5">
                        <button
                          className="inline-flex min-h-7 items-center gap-1.5 rounded-md border border-accent/20 px-2.5 text-[0.58rem] font-extrabold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus"
                          type="button"
                          onClick={() => startEdit(consultation)}
                          disabled={pending}
                        >
                          <FilePenLine className="size-3" aria-hidden="true" />{consultation.status === "signed" || consultation.status === "canceled" ? "Ver registro" : "Continuar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DoctorCard>

        <div className="grid gap-4">
          <DoctorCard className="overflow-hidden">
            <div className="border-b border-line px-4 py-3">
              <SectionHeading title="Paciente actual" />
            </div>
            <div className="p-4">
              <label className="grid gap-1 text-[0.58rem] font-bold text-ink-secondary">
                <span className="flex items-center gap-2"><UserRound className="size-3.5 text-accent" aria-hidden="true" />Seleccionar paciente</span>
                <select
                  className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20 disabled:opacity-60"
                  value={selectedPatientId}
                  onChange={(event) => { setSelectedPatientId(event.target.value); if (mode === "edit") resetForm(); }}
                  disabled={mode === "edit" || pending || Boolean(appointmentId)}
                  aria-label="Seleccionar paciente"
                >
                  <option value="">Selecciona un paciente</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={String(patient.id)}>{patient.name}</option>
                  ))}
                </select>
              </label>

              {selectedPatient ? (
                <div className="mt-4 grid gap-4 rounded-xl border border-line bg-surface-subtle p-4 sm:grid-cols-[auto_1fr]">
                  <DoctorAvatar initials={initialsOf(selectedPatient.name)} tone="blue" size="lg" />
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-extrabold text-ink">{selectedPatient.name ?? "Paciente"}</h3>
                    <p className="mt-1 text-[0.62rem] font-bold text-muted">
                      {ageFromBirthDate(selectedPatient.dateOfBirth)} · {selectedPatient.sex ?? "Sexo no registrado"} · {selectedPatient.patientCode}
                    </p>
                    <p className="mt-2 text-[0.58rem] font-bold text-ink-secondary">
                      {selectedPatient.clinic?.name ?? "Sin clínica asociada"}
                    </p>
                  </div>
                  <div className="sm:col-span-2 rounded-lg border border-line bg-surface px-3 py-2.5">
                    <span className="text-[0.55rem] font-extrabold uppercase tracking-wide text-muted">Última evolución disponible</span>
                    <p className="mt-1 line-clamp-3 text-[0.62rem] font-bold leading-5 text-ink-secondary">
                      {selectedPatientLatestConsultation?.objective
                        ?? selectedPatientLatestConsultation?.chiefComplaint
                        ?? "No hay una evolución previa registrada para este paciente."}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </DoctorCard>

          <ConsultationForm
            key={`${mode}-${editingId}-${selectedPatientId}-${revision}`}
            mode={mode}
            patientLabel={`Paciente: ${patientLabel}`}
            pending={pending}
            serverError={error}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={startCreate}
          />
        </div>
      </section>
    </div>
  );
}

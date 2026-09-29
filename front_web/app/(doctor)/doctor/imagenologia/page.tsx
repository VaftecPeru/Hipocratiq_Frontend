"use client";

import {
  CheckCircle2,
  Clock3,
  Database,
  History,
  ImageIcon,
  Plus,
  ScanLine,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  createDoctorImagingStudy,
  getDoctorImaging,
  getDoctorPatients,
  updateDoctorImagingStatus,
  type DoctorPatient,
  type ImagingStudy,
  type ImagingStudyMeta,
  type ImagingStudyStatus,
} from "@/features/doctors/api/doctor-clinical";
import {
  DoctorAvatar,
  DoctorCard,
  MetricCard,
  StatusBadge,
} from "@/features/doctors/ui/doctor-primitives";
import {
  DoctorModuleAlert,
  DoctorModuleEmpty,
  DoctorModuleError,
  DoctorModuleLoading,
} from "@/features/doctors/ui/doctor-module-state";

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const MODALITIES = ["CR", "CT", "DX", "MG", "MR", "NM", "OT", "PT", "RF", "US", "XA"] as const;

const EMPTY_META: ImagingStudyMeta = {
  total: 0,
  ordered: 0,
  scheduled: 0,
  available: 0,
  reviewed: 0,
  connection: {
    status: "not_configured",
    provider: "unavailable",
    dicomweb: false,
    viewer: false,
  },
};

type CountedStatus = "ordered" | "scheduled" | "available" | "reviewed";

function isCountedStatus(status: ImagingStudyStatus): status is CountedStatus {
  return status !== "canceled";
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : dateFormatter.format(parsed);
}

function initialsOf(name: string | null): string {
  return (name ?? "Paciente")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "PA";
}

function statusTone(status: ImagingStudyStatus): "blue" | "green" | "orange" | "red" | "slate" {
  if (status === "available" || status === "reviewed") return "green";
  if (status === "scheduled") return "orange";
  if (status === "canceled") return "red";
  return "blue";
}

function nextStatus(status: ImagingStudyStatus): { value: ImagingStudyStatus; label: string } | null {
  if (status === "ordered") return { value: "scheduled", label: "Programar" };
  if (status === "scheduled") return { value: "available", label: "Marcar disponible" };
  if (status === "available") return { value: "reviewed", label: "Marcar revisado" };
  return null;
}

export default function DoctorImagingPage() {
  const [studies, setStudies] = useState<ImagingStudy[]>([]);
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [meta, setMeta] = useState<ImagingStudyMeta>(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [pendingStudyId, setPendingStudyId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    patientId: "",
    modality: "CT",
    description: "",
    notes: "",
  });

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      getDoctorImaging(controller.signal),
      getDoctorPatients(controller.signal),
    ])
      .then(([studyResult, patientList]) => {
        setStudies(studyResult.items);
        setMeta(studyResult.meta);
        setPatients(patientList);
        if (patientList[0]) {
          setForm((current) => ({ ...current, patientId: String(patientList[0].id) }));
        }
        setError(null);
      })
      .catch((caught: unknown) => {
        if (!(caught instanceof DOMException && caught.name === "AbortError")) {
          setError(caught instanceof Error ? caught.message : "No pudimos cargar imagenología.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const created = await createDoctorImagingStudy({
        patient_profile_id: Number(form.patientId),
        modality: form.modality,
        study_description: form.description.trim(),
        notes: form.notes.trim() || null,
      });

      setStudies((current) => [created, ...current]);
      setMeta((current) => ({
        ...current,
        total: current.total + 1,
        ordered: current.ordered + 1,
      }));
      setForm((current) => ({ ...current, description: "", notes: "" }));
      setSuccess("Solicitud de imagen registrada correctamente.");
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "No pudimos registrar la solicitud de imagen.");
    } finally {
      setCreating(false);
    }
  }

  async function handleStatus(study: ImagingStudy): Promise<void> {
    const next = nextStatus(study.status);
    if (!next) return;

    setPendingStudyId(study.id);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateDoctorImagingStatus(study.id, next.value);
      setStudies((current) => current.map((item) => item.id === updated.id ? updated : item));
      setMeta((current) => {
        const nextMeta = { ...current };
        if (isCountedStatus(study.status)) {
          nextMeta[study.status] = Math.max(0, nextMeta[study.status] - 1);
        }
        if (isCountedStatus(next.value)) {
          nextMeta[next.value] += 1;
        }
        return nextMeta;
      });
      setSuccess("Estado del estudio de imagen actualizado.");
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "No pudimos actualizar el estudio de imagen.");
    } finally {
      setPendingStudyId(null);
    }
  }

  const metrics = [
    { label: "Solicitados", value: String(meta.ordered), icon: ImageIcon, tone: "blue" as const },
    { label: "Programados", value: String(meta.scheduled), icon: Clock3, tone: "orange" as const },
    { label: "Disponibles", value: String(meta.available), icon: ScanLine, tone: "violet" as const },
    { label: "Revisados", value: String(meta.reviewed), icon: CheckCircle2, tone: "green" as const },
  ];

  const connectionConfigured = meta.connection.status === "configured";

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.65rem]">
            Imagenología
          </h1>
          <p className="mt-1 text-[0.68rem] font-bold text-ink-secondary">
            Revisa estudios de imagen, hallazgos y seguimiento diagnóstico.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-accent px-3 text-[0.62rem] font-extrabold text-white transition hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus"
            href="#imaging-request"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Solicitar imagen
          </a>
          <a
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 text-[0.62rem] font-extrabold text-ink transition hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus"
            href="#imaging-history"
          >
            <History className="size-3.5" aria-hidden="true" />
            Ver historial
          </a>
        </div>
      </header>

      {error && studies.length > 0 ? <DoctorModuleAlert>{error}</DoctorModuleAlert> : null}
      {success ? <DoctorModuleAlert tone="success">{success}</DoctorModuleAlert> : null}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Resumen de imagenología">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.85fr)]" aria-label="Gestión de imagenología">
        <DoctorCard className="min-w-0 overflow-hidden" id="imaging-history">
          <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="text-[0.86rem] font-extrabold">Estudios de imagen</h2>
              <p className="mt-1 text-[0.56rem] font-bold text-muted">
                Seguimiento de la orden clínica; las imágenes diagnósticas permanecen en PACS/VNA cuando existe integración.
              </p>
            </div>
            <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-2.5 py-1 text-[0.55rem] font-extrabold ${
              connectionConfigured
                ? "border-success/25 bg-success-soft text-success"
                : "border-warning/30 bg-warning-soft text-warning"
            }`}>
              <Database className="size-3.5" aria-hidden="true" />
              {connectionConfigured ? "PACS configurado" : "PACS no configurado"}
            </span>
          </div>

          {loading ? (
            <DoctorModuleLoading label="Cargando estudios de imagen…" />
          ) : error && studies.length === 0 ? (
            <DoctorModuleError message={error} />
          ) : studies.length === 0 ? (
            <DoctorModuleEmpty message="Aún no hay estudios de imagen registrados para tus pacientes." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <caption className="sr-only">Estudios de imagen registrados</caption>
                <thead>
                  <tr className="border-b border-line bg-surface-subtle text-[0.55rem] font-extrabold text-ink-secondary">
                    <th className="px-3 py-2.5 font-extrabold sm:px-4">Paciente</th>
                    <th className="px-3 py-2.5 font-extrabold">Estudio</th>
                    <th className="px-3 py-2.5 font-extrabold">Acceso</th>
                    <th className="px-3 py-2.5 font-extrabold">Fecha</th>
                    <th className="px-3 py-2.5 font-extrabold">Estado</th>
                    <th className="px-3 py-2.5 font-extrabold">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {studies.map((study) => {
                    const next = nextStatus(study.status);
                    const isPending = pendingStudyId === study.id;

                    return (
                      <tr className="border-b border-line last:border-0 hover:bg-surface-subtle" key={study.id}>
                        <td className="px-3 py-2.5 sm:px-4">
                          <div className="flex items-center gap-2">
                            <DoctorAvatar
                              initials={initialsOf(study.patient.name)}
                              tone={study.id % 2 === 0 ? "blue" : "violet"}
                              size="sm"
                            />
                            <div>
                              <p className="whitespace-nowrap text-[0.61rem] font-extrabold">
                                {study.patient.name ?? study.patient.patientCode}
                              </p>
                              <p className="mt-0.5 text-[0.53rem] font-bold text-muted">{study.patient.patientCode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="text-[0.6rem] font-extrabold">{study.modality} · {study.studyDescription}</p>
                          <p className="mt-0.5 max-w-[300px] text-[0.54rem] font-bold leading-4 text-ink-secondary">
                            {study.reportSummary || study.notes || "Sin hallazgos/reportes registrados todavía."}
                          </p>
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="font-mono text-[0.54rem] font-bold text-ink-secondary">{study.accessionNumber}</p>
                          <p className="mt-0.5 text-[0.52rem] font-bold text-muted">
                            {study.pacs.linked ? `PACS: ${study.pacs.provider || "vinculado"}` : "Sin enlace PACS"}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-[0.56rem] font-bold text-ink-secondary">
                          {formatDate(study.studyAt ?? study.orderedAt)}
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusBadge tone={statusTone(study.status)}>{study.statusLabel}</StatusBadge>
                        </td>
                        <td className="px-3 py-2.5">
                          {next ? (
                            <button
                              className="rounded-md border border-accent/20 px-2 py-1.5 text-[0.56rem] font-extrabold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60"
                              type="button"
                              disabled={pendingStudyId !== null}
                              onClick={() => void handleStatus(study)}
                            >
                              {isPending ? "Actualizando…" : next.label}
                            </button>
                          ) : (
                            <span className="text-[0.56rem] font-bold text-muted">Sin acciones</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </DoctorCard>

        <div className="grid gap-4">
          <DoctorCard className="p-4" id="imaging-request">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[0.86rem] font-extrabold">Solicitar imagen</h2>
                <p className="mt-1 text-[0.58rem] font-bold text-ink-secondary">
                  La orden se vincula al expediente del paciente. No se cargan imágenes diagnósticas como archivos sueltos.
                </p>
              </div>
              <ImageIcon className="size-4 text-accent" aria-hidden="true" />
            </div>

            <form className="mt-4 grid gap-3" onSubmit={(event) => void handleCreate(event)}>
              <label className="grid gap-1 text-[0.6rem] font-bold text-ink-secondary">
                Paciente
                <select
                  className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20 disabled:opacity-60"
                  required
                  value={form.patientId}
                  onChange={(event) => setForm((current) => ({ ...current, patientId: event.target.value }))}
                  disabled={creating || patients.length === 0}
                >
                  <option value="">Selecciona un paciente</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={String(patient.id)}>
                      {patient.name ?? patient.patientCode}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-[0.6rem] font-bold text-ink-secondary">
                Modalidad
                <select
                  className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20"
                  value={form.modality}
                  onChange={(event) => setForm((current) => ({ ...current, modality: event.target.value }))}
                  disabled={creating}
                >
                  {MODALITIES.map((modality) => <option key={modality} value={modality}>{modality}</option>)}
                </select>
              </label>

              <label className="grid gap-1 text-[0.6rem] font-bold text-ink-secondary">
                Descripción del estudio
                <input
                  className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20"
                  required
                  minLength={2}
                  maxLength={180}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  disabled={creating}
                  placeholder="Ej. TAC de tórax sin contraste"
                />
              </label>

              <label className="grid gap-1 text-[0.6rem] font-bold text-ink-secondary">
                Notas
                <textarea
                  className="min-h-20 rounded-lg border border-line bg-surface-input px-2 py-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20"
                  maxLength={2000}
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  disabled={creating}
                  placeholder="Indicación clínica o contexto relevante"
                />
              </label>

              <button
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[0.62rem] font-extrabold text-white hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={creating || patients.length === 0 || form.description.trim().length < 2}
              >
                {creating ? "Guardando…" : "Solicitar imagen"}
              </button>

              {patients.length === 0 && !loading ? (
                <p className="text-[0.58rem] font-bold text-ink-secondary">
                  Primero registra o vincula un paciente con el médico.
                </p>
              ) : null}
            </form>
          </DoctorCard>

          <DoctorCard className="p-4">
            <div className="flex items-center gap-2">
              <Database className="size-4 text-violet" aria-hidden="true" />
              <h2 className="text-[0.82rem] font-extrabold">Integración DICOM/PACS</h2>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-[0.56rem]">
              <div className="rounded-lg border border-line bg-surface-subtle p-3">
                <dt className="font-extrabold text-muted">DICOMweb</dt>
                <dd className="mt-1 font-extrabold">{meta.connection.dicomweb ? "Configurado" : "Pendiente"}</dd>
              </div>
              <div className="rounded-lg border border-line bg-surface-subtle p-3">
                <dt className="font-extrabold text-muted">Visor</dt>
                <dd className="mt-1 font-extrabold">{meta.connection.viewer ? "Configurado" : "Pendiente"}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[0.56rem] font-bold leading-5 text-ink-secondary">
              HIPOCRATIQ mantiene en el expediente la referencia clínica. El estudio diagnóstico debe residir en un PACS/VNA compatible; el sistema no simula un visor si el proveedor no está conectado.
            </p>
          </DoctorCard>
        </div>
      </section>
    </div>
  );
}

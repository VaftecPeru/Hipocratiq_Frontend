"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, ChevronRight, FileText, HeartPulse, RefreshCw, Users } from "lucide-react";
import { DoctorAvatar, DoctorCard, MetricCard, SectionHeading } from "@/features/doctors/ui/doctor-primitives";
import { Spinner } from "@/shared/ui/spinner";
import {
  getDoctorClinicalHistory,
  getDoctorPatients,
  type ClinicalHistoryRecord,
  type DoctorPatient,
} from "@/features/doctors/api/doctor-clinical";

const dateFormatter = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" });

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function initialsOf(name: string | null | undefined): string {
  return (name ?? "Paciente").split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "PA";
}

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [history, setHistory] = useState<ClinicalHistoryRecord[]>([]);
  const [historyPatient, setHistoryPatient] = useState<number | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getDoctorPatients(controller.signal)
      .then((list) => {
        setPatients(list);
        if (list.length > 0) setSelectedPatientId(list[0].id);
      })
      .catch((caught: unknown) => {
        if (!(caught instanceof DOMException && caught.name === "AbortError")) {
          setError(caught instanceof Error ? caught.message : "No pudimos cargar los pacientes.");
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (selectedPatientId === null) return;
    const controller = new AbortController();
    getDoctorClinicalHistory(selectedPatientId, controller.signal)
      .then((records) => {
        setHistory(records);
        setHistoryPatient(selectedPatientId);
        setHistoryError(null);
      })
      .catch((caught: unknown) => {
        if (!(caught instanceof DOMException && caught.name === "AbortError")) {
          setHistoryError(caught instanceof Error ? caught.message : "No pudimos cargar el historial clínico.");
        }
        setHistoryPatient(selectedPatientId);
      });
    return () => controller.abort();
  }, [selectedPatientId]);

  const historyLoading = selectedPatientId !== null && historyPatient !== selectedPatientId;

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) ?? null,
    [patients, selectedPatientId],
  );

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
        <DoctorCard className="flex min-h-48 items-center justify-center p-6">
          <p className="flex items-center gap-2 text-xs font-bold text-muted" aria-busy="true">
            <Spinner className="size-4" /> Cargando pacientes…
          </p>
        </DoctorCard>
      </div>
    );
  }

  if (error && patients.length === 0) {
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
          <h1 className="text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.65rem]">Pacientes</h1>
          <p className="mt-1 text-[0.68rem] font-bold text-ink-secondary">Pacientes vinculados a tus consultas e ingresos en la clínica.</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Resumen de pacientes">
        <MetricCard label="Pacientes vinculados" value={String(patients.length)} icon={Users} tone="green" />
        <MetricCard label="Con historial clínico" value={String(history.length)} icon={FileText} tone="blue" />
        <MetricCard label="Consulta por registrar" value="—" icon={CalendarPlus} tone="violet" />
        <MetricCard label="Activos" value={String(patients.length)} icon={HeartPulse} tone="orange" />
      </section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_420px]" aria-label="Gestión de pacientes">
        <DoctorCard className="min-w-0 overflow-hidden">
          <div className="border-b border-line px-4 py-3 sm:px-5"><SectionHeading title="Listado de pacientes" /></div>
          <div className="overflow-x-auto">
            {patients.length === 0 ? (
              <div className="grid place-items-center px-6 py-12 text-center">
                <p className="text-xs font-bold text-ink-secondary">Aún no tienes pacientes vinculados a tus consultas.</p>
              </div>
            ) : (
              <table className="w-full min-w-[680px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-surface-subtle text-[0.55rem] font-extrabold text-ink-secondary">
                    <th className="px-3 py-2.5 font-extrabold sm:px-4">Paciente</th>
                    <th className="px-3 py-2.5 font-extrabold">Documento</th>
                    <th className="px-3 py-2.5 font-extrabold">Sexo</th>
                    <th className="px-3 py-2.5 font-extrabold">Nacimiento</th>
                    <th className="px-3 py-2.5 font-extrabold">Historial</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr
                      className={`cursor-pointer border-b border-line last:border-0 hover:bg-surface-subtle ${selectedPatientId === patient.id ? "bg-accent-soft/50" : ""}`}
                      key={patient.id}
                      onClick={() => setSelectedPatientId(patient.id)}
                    >
                      <td className="px-3 py-2.5 sm:px-4">
                        <div className="flex items-center gap-2.5">
                          <DoctorAvatar initials={initialsOf(patient.name)} tone={patient.id % 2 === 0 ? "blue" : "orange"} size="md" />
                          <div>
                            <p className="whitespace-nowrap text-[0.62rem] font-extrabold">{patient.name}</p>
                            <p className="mt-0.5 text-[0.55rem] font-bold text-ink-secondary">{patient.clinic?.name ?? "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-[0.6rem] font-extrabold">{patient.documentType ?? "—"} {patient.documentNumber ?? ""}</td>
                      <td className="px-3 py-2.5 text-[0.6rem] font-extrabold">{patient.sex ?? "—"}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-[0.6rem] font-extrabold">{formatDate(patient.dateOfBirth)}</td>
                      <td className="px-3 py-2.5">
                        <button
                          className="inline-flex min-h-7 items-center gap-1.5 rounded-md border border-accent/20 px-2.5 text-[0.58rem] font-extrabold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus"
                          type="button"
                          onClick={(event) => { event.stopPropagation(); setSelectedPatientId(patient.id); }}
                        >
                          Ver historial <ChevronRight className="size-3" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DoctorCard>

        <DoctorCard className="min-w-0 overflow-hidden">
          <div className="border-b border-line px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <DoctorAvatar initials={initialsOf(selectedPatient?.name)} tone="blue" size="sm" />
                <div>
                  <h2 className="text-[0.82rem] font-extrabold">{selectedPatient?.name ?? "Paciente"}</h2>
                  <p className="text-[0.56rem] font-bold text-ink-secondary">{selectedPatient?.documentType ? `${selectedPatient.documentType} ${selectedPatient.documentNumber}` : "Sin documento"}</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-success-soft px-2 py-1 text-[0.56rem] font-extrabold text-success">
                <RefreshCw className="size-3" aria-hidden="true" />Activo
              </span>
            </div>
          </div>

          <div className="max-h-[520px] overflow-y-auto p-4">
            {historyLoading ? (
              <p className="flex items-center gap-2 py-8 text-xs font-bold text-muted" aria-busy="true">
                <Spinner className="size-4" /> Cargando historial…
              </p>
            ) : historyError ? (
              <p className="py-8 text-center text-xs font-bold text-danger" role="alert">{historyError}</p>
            ) : history.length === 0 ? (
              <p className="py-10 text-center text-xs font-bold text-ink-secondary">Sin registros de historia clínica para este paciente.</p>
            ) : (
              <ul className="grid gap-2">
                {history.map((record) => (
                  <li className="rounded-lg border border-line p-3" key={record.id}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[0.6rem] font-extrabold text-ink">Historia clínica #{record.id}</p>
                      <span className="text-[0.55rem] font-bold text-ink-secondary">{formatDate(record.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-[0.56rem] font-bold text-ink-secondary">Objetivo: {record.objective ?? "—"}</p>
                    <p className="mt-1 text-[0.56rem] font-bold text-ink-secondary">{record.sections.length} de 15 apartados guardados</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DoctorCard>
      </section>
    </div>
  );
}

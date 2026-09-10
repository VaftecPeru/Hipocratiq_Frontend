"use client";

import { CircleCheck, Search, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getClinicMembers, getClinicSettings } from "@/features/clinics/api/browser-clinic-dashboard";
import type { ClinicTeamMember } from "@/features/clinics/model/clinic-admin.types";
import { CreateClinicDoctorModal } from "@/features/clinics/ui/create-clinic-doctor-modal";
import { type CountryCode } from "@/shared/ui/country-flag";
import { DataBadge, type BadgeTone } from "@/shared/ui/data-badge";

const STATUS_LABELS: Record<ClinicTeamMember["status"], string> = {
  pending_verification: "Pendiente",
  active: "Activo",
  suspended: "Suspendido",
  disabled: "Deshabilitado",
};

const STATUS_TONES: Record<ClinicTeamMember["status"], BadgeTone> = {
  pending_verification: "warning",
  active: "success",
  suspended: "danger",
  disabled: "neutral",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function DoctorMetric({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <article className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.3rem_1rem_rgb(16_27_51/4%)]">
      <span className="grid size-9 place-items-center rounded-lg bg-accent-soft text-accent">
        <Stethoscope className="size-4" aria-hidden="true" />
      </span>
      <p className="mt-3 text-2xs font-bold text-muted">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <strong className="font-mono text-xl">{value}</strong>
        <span className="text-right text-[0.55rem] font-semibold text-muted">{helper}</span>
      </div>
    </article>
  );
}

export function ClinicDoctors({ canManageMembers }: { canManageMembers: boolean }) {
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<ClinicTeamMember[]>([]);
  const [clinicCountryCode, setClinicCountryCode] = useState<CountryCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreateDoctorOpen, setIsCreateDoctorOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getClinicMembers(controller.signal), getClinicSettings(controller.signal)])
      .then(([members, clinic]) => {
        setDoctors(members.filter((member) => member.role === "doctor"));
        setClinicCountryCode(clinic.countryCode);
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setLoadError(error instanceof Error ? error.message : "No pudimos cargar el equipo médico.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const filteredDoctors = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");
    if (!normalized) return doctors;
    return doctors.filter((doctor) =>
      `${doctor.name} ${doctor.specialty ?? ""} ${doctor.medicalLicense ?? ""}`
        .toLocaleLowerCase("es")
        .includes(normalized),
    );
  }, [doctors, query]);

  const specialtyCount = new Set(doctors.flatMap((doctor) => doctor.specialty ? [doctor.specialty] : [])).size;
  const licensedDoctorCount = doctors.filter((doctor) => doctor.medicalLicense).length;
  const canCreateDoctor = canManageMembers && clinicCountryCode !== null && !isLoading;
  const countryStatusMessage = isLoading
    ? "Cargando el país de la clínica antes de habilitar nuevas cuentas."
    : loadError
      ? "No se pudo confirmar el país de la clínica. Reintenta la carga antes de agregar un médico."
      : "El país de la clínica aún no está disponible. No se puede agregar un médico todavía.";

  function showNotice(message: string): void {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2400);
  }

  function handleDoctorCreated(member: ClinicTeamMember): void {
    setDoctors((current) => [member, ...current]);
    showNotice("Médico agregado a la clínica.");
  }

  return (
    <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7">
      {notice ? (
        <div className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-xs font-bold text-white shadow-xl" role="status">
          <CircleCheck className="size-4 text-success" aria-hidden="true" />
          {notice}
        </div>
      ) : null}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-accent uppercase">Directorio clínico</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Médicos</h1>
          <p className="mt-1 text-xs text-muted">Consulta los perfiles médicos activos de la clínica.</p>
        </div>
        {canManageMembers ? (
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={!canCreateDoctor}
              aria-describedby={!canCreateDoctor ? "clinic-doctors-country-status" : undefined}
              onClick={() => setIsCreateDoctorOpen(true)}
            >
              <Stethoscope className="size-3.5" aria-hidden="true" />
              Agregar médico
            </button>
            {!canCreateDoctor ? <p className="max-w-72 text-right text-2xs text-muted" id="clinic-doctors-country-status" role={loadError ? "alert" : "status"} aria-live="polite">{countryStatusMessage}</p> : null}
          </div>
        ) : null}
      </header>

      <section className="mt-4 grid gap-3 sm:grid-cols-3" aria-label="Resumen del equipo médico">
        <DoctorMetric label="Médicos activos" value={doctors.length} helper="Membresías activas" />
        <DoctorMetric label="Especialidades" value={specialtyCount} helper="Desde perfiles registrados" />
        <DoctorMetric label="Cédulas registradas" value={licensedDoctorCount} helper="Datos profesionales" />
      </section>

      <section className="mt-4 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.3rem_1rem_rgb(16_27_51/4%)]" aria-labelledby="clinic-doctors-title">
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xs font-extrabold" id="clinic-doctors-title">Personal médico</h2>
            <p className="mt-0.5 text-[0.6rem] text-muted">La información se muestra desde las membresías y perfiles reales.</p>
          </div>
          <label className="relative w-full sm:max-w-64">
            <span className="sr-only">Buscar médico</span>
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              className="h-8 w-full rounded-lg border border-line bg-surface-input pl-8 pr-3 text-[0.65rem] outline-none placeholder:text-muted focus:border-accent focus:ring-3 focus:ring-focus/30"
              type="search"
              placeholder="Buscar por nombre, especialidad o cédula..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        {isLoading ? <div className="grid min-h-40 place-items-center text-center text-xs font-bold text-muted" role="status">Cargando médicos...</div> : null}
        {!isLoading && loadError ? <div className="grid min-h-40 place-items-center px-4 text-center text-xs font-bold text-danger" role="alert">{loadError}</div> : null}
        {!isLoading && !loadError && filteredDoctors.length === 0 ? (
          <div className="grid min-h-40 place-items-center px-4 text-center">
            <div>
              <Users className="mx-auto size-7 text-muted" aria-hidden="true" />
              <p className="mt-2 text-xs font-extrabold">{query ? "No hay médicos que coincidan con la búsqueda." : "No hay médicos registrados."}</p>
              {query ? <button className="mt-2 text-2xs font-bold text-accent focus-visible:outline-2 focus-visible:outline-focus" type="button" onClick={() => setQuery("")}>Limpiar búsqueda</button> : null}
            </div>
          </div>
        ) : null}
        {!isLoading && !loadError && filteredDoctors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left">
              <caption className="sr-only">Directorio del personal médico activo</caption>
              <thead className="bg-surface-subtle text-[0.56rem] font-extrabold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-2.5" scope="col">Médico</th>
                  <th className="px-3 py-2.5" scope="col">Especialidad</th>
                  <th className="px-3 py-2.5" scope="col">Cédula profesional</th>
                  <th className="px-3 py-2.5" scope="col">Contacto</th>
                  <th className="px-4 py-2.5" scope="col">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredDoctors.map((doctor, index) => (
                  <tr className="text-[0.65rem] transition-colors hover:bg-surface-hover" key={doctor.id}>
                    <th className="px-4 py-2.5 font-normal" scope="row">
                      <div className="flex items-center gap-2.5">
                        <span className={`grid size-8 place-items-center rounded-full font-mono text-[0.55rem] font-bold ${index % 2 ? "bg-violet-soft text-violet" : "bg-accent-soft text-accent"}`}>
                          {getInitials(doctor.name)}
                        </span>
                        <div>
                          <p className="font-extrabold">{doctor.name}</p>
                          <p className="mt-0.5 font-mono text-[0.52rem] text-muted">ID: {doctor.id}</p>
                        </div>
                      </div>
                    </th>
                    <td className="px-3 py-2.5 font-semibold text-ink-secondary">{doctor.specialty ?? "No registrada"}</td>
                    <td className="px-3 py-2.5 font-mono font-semibold text-ink-secondary">{doctor.medicalLicense ?? "No registrada"}</td>
                    <td className="px-3 py-2.5 text-[0.58rem] text-muted">
                      <span className="block">{doctor.email ?? "Sin correo"}</span>
                      <span className="mt-1 block">{doctor.phoneNumber}</span>
                    </td>
                    <td className="px-4 py-2.5"><DataBadge tone={STATUS_TONES[doctor.status]} dot>{STATUS_LABELS[doctor.status]}</DataBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-line px-4 py-3">
          <p className="text-[0.6rem] text-muted">Mostrando {filteredDoctors.length} de {doctors.length} médicos</p>
          <span className="inline-flex items-center gap-1.5 text-[0.58rem] font-bold text-muted"><ShieldCheck className="size-3.5" aria-hidden="true" />Datos verificados por la clínica</span>
        </div>
      </section>

      {canCreateDoctor && clinicCountryCode ? (
        <CreateClinicDoctorModal
          key={`${clinicCountryCode}-${isCreateDoctorOpen ? "open" : "closed"}`}
          clinicCountryCode={clinicCountryCode}
          isOpen={isCreateDoctorOpen}
          onClose={() => setIsCreateDoctorOpen(false)}
          onCreated={handleDoctorCreated}
        />
      ) : null}
    </div>
  );
}

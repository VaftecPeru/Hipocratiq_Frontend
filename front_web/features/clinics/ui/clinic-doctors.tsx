"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowUpRight,
  BriefcaseMedical,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock3,
  Eye,
  FileCheck2,
  Plus,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useEffect } from "react";
import { getClinicMembers } from "@/features/clinics/api/browser-clinic-dashboard";
import type { ClinicTeamMember } from "@/features/clinics/model/clinic-admin.types";

type DoctorStatus = "Disponible" | "En consulta" | "Descanso" | "Próximo turno";
type Doctor = { initials: string; name: string; id: string; specialty: string; office: string; schedule: string; patients: number; status: DoctorStatus };

const specialtyStyles: Record<string, string> = {
  Cardiología: "bg-accent-soft text-accent",
  Pediatría: "bg-violet-soft text-violet",
  Traumatología: "bg-danger-soft text-danger",
  Dermatología: "bg-success-soft text-success",
  "Medicina General": "bg-surface-subtle text-ink-secondary",
  Ginecología: "bg-[rgb(252_238_248)] text-[rgb(174_48_131)]",
};
const statusStyles: Record<DoctorStatus, string> = { Disponible: "text-success", "En consulta": "text-warning", Descanso: "text-muted", "Próximo turno": "text-accent" };

function MetricCard({ icon: Icon, label, value, helper, tone }: { icon: LucideIcon; label: string; value: string; helper: string; tone: string }) {
  return <article className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.3rem_1rem_rgb(16_27_51/4%)]"><div className="flex items-start justify-between"><span className={`grid size-9 place-items-center rounded-lg ${tone}`}><Icon className="size-4" /></span><span className="rounded-full bg-success-soft px-2 py-1 text-[0.56rem] font-extrabold text-success">+8.4%</span></div><p className="mt-3 text-2xs font-bold text-muted">{label}</p><div className="mt-1 flex items-end justify-between"><strong className="font-mono text-xl">{value}</strong><span className="text-[0.55rem] font-semibold text-muted">{helper}</span></div></article>;
}

function Status({ value }: { value: DoctorStatus }) {
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-[0.62rem] font-extrabold ${statusStyles[value]}`}><span className="size-1.5 rounded-full bg-current" />{value}</span>;
}

function mapDoctor(member: ClinicTeamMember): Doctor {
  return {
    initials: member.name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase(),
    name: member.name,
    id: member.medicalLicense ?? `MED-${member.id}`,
    specialty: member.specialty ?? "Medicina general",
    office: "Sin asignar",
    schedule: "Horario no configurado",
    patients: 0,
    status: "Disponible",
  };
}

export function ClinicDoctors() {
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getClinicMembers(controller.signal)
      .then((members) => setDoctors(members.filter((member) => member.role === "doctor").map(mapDoctor)))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
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
    return doctors.filter((doctor) => `${doctor.name} ${doctor.specialty} ${doctor.office}`.toLocaleLowerCase("es").includes(normalized));
  }, [doctors, query]);
  const specialties = new Set(doctors.map((doctor) => doctor.specialty)).size;
  const showNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(null), 2400); };

  return (
    <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7">
      {notice ? <div className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-xs font-bold text-white shadow-xl" role="status"><CircleCheck className="size-4 text-success" />{notice}</div> : null}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-accent uppercase">Directorio clínico</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Médicos</h1><p className="mt-1 text-xs text-muted">Gestión del personal médico y cobertura de la clínica.</p></div><div className="flex flex-wrap gap-2"><button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-extrabold hover:bg-surface-hover" type="button" onClick={() => showNotice("Selector de turnos listo para conectar")}><CalendarCheck className="size-3.5" />Asignar turno</button><button className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent px-4 text-xs font-extrabold text-white shadow-sm hover:bg-accent-hover" type="button" onClick={() => showNotice("Formulario de médico listo para conectar")}><Plus className="size-3.5" />Nuevo médico</button></div></header>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen del equipo médico"><MetricCard icon={Users} label="Médicos activos" value={String(doctors.length)} helper="Membresías activas" tone="bg-violet-soft text-violet" /><MetricCard icon={Stethoscope} label="En consulta" value="—" helper="Agenda aún no configurada" tone="bg-warning-soft text-warning" /><MetricCard icon={BriefcaseMedical} label="Especialidades" value={String(specialties)} helper="Desde perfiles médicos" tone="bg-accent-soft text-accent" /><MetricCard icon={ShieldCheck} label="Cobertura del día" value="—" helper="Agenda aún no configurada" tone="bg-success-soft text-success" /></section>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-4">
          <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.3rem_1rem_rgb(16_27_51/4%)]" aria-labelledby="staff-title">
            <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xs font-extrabold" id="staff-title">Staff Médico</h2><p className="mt-0.5 text-[0.6rem] text-muted">Personal activo y programación del día.</p></div><label className="relative w-full sm:max-w-60"><span className="sr-only">Buscar médico</span><Search className="absolute top-1/2 left-2.5 size-3 -translate-y-1/2 text-muted" /><input className="h-8 w-full rounded-lg border border-line bg-surface-input pl-8 pr-3 text-[0.65rem] outline-none placeholder:text-muted focus:border-accent" type="search" placeholder="Buscar en el staff..." value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
            <div className="overflow-x-auto"><table className="w-full min-w-215 text-left"><caption className="sr-only">Directorio del personal médico activo</caption><thead className="bg-surface-subtle text-[0.56rem] font-extrabold uppercase tracking-wide text-muted"><tr><th className="px-4 py-2.5">Médico</th><th className="px-3 py-2.5">Especialidad</th><th className="px-3 py-2.5">Consultorio</th><th className="px-3 py-2.5">Horario</th><th className="px-3 py-2.5">Pacientes hoy</th><th className="px-3 py-2.5">Estado</th><th className="px-4 py-2.5 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-line">{filteredDoctors.map((doctor, index) => <tr className="text-[0.65rem] transition-colors hover:bg-surface-hover" key={doctor.id}><th className="px-4 py-2.5 font-normal"><div className="flex items-center gap-2.5"><span className={`grid size-8 place-items-center rounded-full font-mono text-[0.55rem] font-bold ${index % 2 ? "bg-violet-soft text-violet" : "bg-accent-soft text-accent"}`}>{doctor.initials}</span><div><p className="font-extrabold">{doctor.name}</p><p className="mt-0.5 font-mono text-[0.52rem] text-muted">ID: {doctor.id}</p></div></div></th><td className="px-3 py-2.5"><span className={`rounded-md px-2 py-1 text-[0.56rem] font-bold ${specialtyStyles[doctor.specialty] ?? "bg-surface-subtle text-ink-secondary"}`}>{doctor.specialty}</span></td><td className="px-3 py-2.5 font-mono font-bold text-ink-secondary">{doctor.office}</td><td className="px-3 py-2.5 font-mono font-semibold text-ink-secondary">{doctor.schedule}</td><td className="px-3 py-2.5 font-mono font-bold">{doctor.patients}</td><td className="px-3 py-2.5"><Status value={doctor.status} /></td><td className="px-4 py-2.5"><div className="flex justify-end gap-1"><button className="grid size-8 place-items-center rounded-lg text-muted hover:bg-accent-soft hover:text-accent" type="button" aria-label={`Ver perfil de ${doctor.name}`} onClick={() => showNotice(`Abriendo perfil de ${doctor.name}`)}><Eye className="size-3.5" /></button><button className="grid size-8 place-items-center rounded-lg text-muted hover:bg-accent-soft hover:text-accent" type="button" aria-label={`Ver agenda de ${doctor.name}`} onClick={() => showNotice(`Abriendo agenda de ${doctor.name}`)}><CalendarCheck className="size-3.5" /></button></div></td></tr>)}</tbody></table>{isLoading ? <div className="grid min-h-40 place-items-center text-center text-xs font-bold text-muted">Cargando equipo médico…</div> : filteredDoctors.length === 0 ? <div className="grid min-h-40 place-items-center text-center"><div><Search className="mx-auto size-7 text-muted" /><p className="mt-2 text-xs font-extrabold">{loadError ?? "No hay médicos con una membresía activa."}</p><button className="mt-2 text-2xs font-bold text-accent" type="button" onClick={() => setQuery("")}>Limpiar búsqueda</button></div></div> : null}</div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3"><p className="text-[0.6rem] text-muted">Mostrando {filteredDoctors.length} de {doctors.length} médicos</p><div className="flex gap-1"><button className="grid size-7 place-items-center rounded-md border border-line text-muted" type="button" aria-label="Página anterior"><ChevronLeft className="size-3" /></button>{[1,2,3].map((page) => <button className={`grid size-7 place-items-center rounded-md text-[0.6rem] font-bold ${page === 1 ? "bg-accent text-white" : "border border-line text-muted"}`} type="button" key={page}>{page}</button>)}<button className="grid size-7 place-items-center rounded-md border border-line text-muted" type="button" aria-label="Página siguiente"><ChevronRight className="size-3" /></button></div></div>
          </section>

          <section className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.3rem_1rem_rgb(16_27_51/4%)]"><h2 className="text-xs font-extrabold">Pendientes Administrativos</h2><p className="mt-0.5 text-[0.6rem] text-muted">Tareas que requieren seguimiento del equipo administrativo.</p><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{[[Clock3,"Renovación de cédulas","3 médicos","bg-warning-soft text-warning"],[CalendarCheck,"Aprobación de horarios","7 solicitudes","bg-accent-soft text-accent"],[FileCheck2,"Contratos por firmar","1 contrato","bg-success-soft text-success"],[AlertTriangle,"Documentos por subir","4 documentos","bg-violet-soft text-violet"]].map(([Icon, title, count, tone]) => { const CardIcon = Icon as LucideIcon; return <button className="flex items-center gap-3 rounded-lg border border-line p-3 text-left hover:border-accent/40 hover:bg-surface-hover" type="button" key={String(title)} onClick={() => showNotice(String(title))}><span className={`grid size-8 place-items-center rounded-lg ${tone}`}><CardIcon className="size-3.5" /></span><span><span className="block text-[0.6rem] font-extrabold">{String(title)}</span><span className="mt-1 block text-[0.55rem] font-bold text-accent">{String(count)}</span></span></button>;})}</div></section>
        </div>

        <aside className="grid gap-3">
          <section className="rounded-xl border border-line bg-surface p-4"><div className="flex items-center justify-between"><h2 className="text-xs font-extrabold">Disponibilidad Médica</h2><button className="text-[0.58rem] font-bold text-accent" type="button">Ver todos</button></div><ul className="mt-3 grid gap-2.5">{doctors.slice(0, 5).map((doctor) => <li className="flex items-center gap-2" key={doctor.id}><span className="grid size-7 place-items-center rounded-full bg-surface-subtle font-mono text-[0.52rem] font-bold">{doctor.initials}</span><div className="min-w-0 flex-1"><p className="truncate text-[0.6rem] font-extrabold">{doctor.name}</p><p className="text-[0.52rem] text-muted">{doctor.specialty}</p></div><Status value={doctor.status} /></li>)}</ul><button className="mt-3 inline-flex items-center gap-1 text-[0.6rem] font-bold text-accent" type="button">Ver calendario completo <ArrowUpRight className="size-3" /></button></section>
          <section className="rounded-xl border border-line bg-surface p-4"><div className="flex items-center justify-between"><h2 className="text-xs font-extrabold">Especialidades</h2><button className="text-[0.58rem] font-bold text-accent" type="button">Ver todas</button></div><div className="mt-4 grid grid-cols-[4.5rem_1fr] items-center gap-3"><div className="grid size-17 place-items-center rounded-full border-6 border-accent-soft"><div className="text-center"><strong className="font-mono text-base">18</strong><span className="block text-[0.5rem] text-muted">Total</span></div></div><ul className="grid gap-1">{[["Cardiología",4],["Pediatría",3],["Medicina General",3],["Traumatología",2],["Dermatología",2],["Ginecología",2]].map(([name, count]) => <li className="flex items-center gap-1.5 text-[0.54rem]" key={String(name)}><span className="size-1.5 rounded-full bg-accent" /><span className="flex-1 text-muted">{name}</span><strong className="font-mono">{count}</strong></li>)}</ul></div></section>
          <section className="rounded-xl border border-line bg-surface p-4"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-violet-soft text-violet"><UserRoundCheck className="size-4" /></span><h2 className="text-xs font-extrabold">IA Epidemiológica</h2></div><div className="mt-3 grid gap-2"><p className="flex items-center gap-2 rounded-lg bg-surface-subtle p-2.5 text-[0.58rem] font-bold"><span className="size-1.5 rounded-full bg-violet" />2 alertas activas</p><p className="flex items-center gap-2 rounded-lg bg-warning-soft p-2.5 text-[0.58rem] font-bold text-warning"><span className="size-1.5 rounded-full bg-warning" />Riesgo actual: Moderado</p></div></section>
        </aside>
      </div>
    </div>
  );
}

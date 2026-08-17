"use client";

import { Activity, ArrowUpRight, BrainCircuit, ChevronLeft, ChevronRight, Download, Eye, HeartPulse, Plus, Search, UserRoundCheck, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getClinicPatients } from "@/features/clinics/api/browser-clinic-dashboard";
import type { ClinicPatient } from "@/features/clinics/model/clinic-admin.types";
import { AdminMetric, Notice, SectionCard, useNotice } from "./clinic-admin-primitives";

type PatientStatus = "Activo" | "Seguimiento" | "Alto riesgo" | "Inactivo";
type Filter = "Todos" | "Activos" | "Nuevos" | "Seguimiento";
type Patient = { id: string; initials: string; name: string; age: number | null; lastVisit: string; doctor: string; specialty: string; nextVisit: string; status: PatientStatus; isNew?: boolean };

function mapPatient(patient: ClinicPatient): Patient {
  const name = patient.name ?? "Paciente sin nombre";
  const createdAt = patient.createdAt ? new Date(patient.createdAt) : null;
  const isNew = createdAt !== null && !Number.isNaN(createdAt.getTime()) && createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  return {
    id: patient.patientCode,
    initials: name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase(),
    name,
    age: null,
    lastVisit: "Sin registro",
    doctor: "Sin asignar",
    specialty: "—",
    nextVisit: "No programada",
    status: patient.status === "active" ? "Activo" : "Inactivo",
    isNew,
  };
}

const statusStyles: Record<PatientStatus, string> = { Activo: "bg-success-soft text-success", Seguimiento: "bg-accent-soft text-accent", "Alto riesgo": "bg-danger-soft text-danger", Inactivo: "bg-surface-subtle text-muted" };

function MiniTrend() {
  const bars = [78, 92, 105, 110, 128, 86];
  return <figure className="mt-4" aria-label="Admisiones y pacientes en seguimiento de enero a junio"><div className="flex h-36 items-end gap-3 border-b border-line px-2 sm:gap-5">{bars.map((value) => <div className="flex h-full flex-1 flex-col justify-end gap-1" key={value}><span className="text-center font-mono text-[0.5rem] text-muted">{value}</span><span className="w-full rounded-t bg-accent" style={{ height: `${value / 1.4}px` }} /></div>)}</div><div className="mt-2 grid grid-cols-6 text-center text-[0.52rem] text-muted">{["Ene","Feb","Mar","Abr","May","Jun"].map((month) => <span key={month}>{month}</span>)}</div></figure>;
}

export function ClinicPatients() {
  const [filter, setFilter] = useState<Filter>("Todos");
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { notice, showNotice } = useNotice();
  useEffect(() => {
    const controller = new AbortController();
    getClinicPatients(query, currentPage, controller.signal)
      .then((page) => {
        setPatients(page.patients.map(mapPatient));
        setTotalPatients(page.pagination.total);
        setLastPage(page.pagination.lastPage);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          showNotice(error instanceof Error ? error.message : "No pudimos cargar los pacientes.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [currentPage, query, showNotice]);
  const filtered = useMemo(() => patients.filter((patient) => {
    const matchesQuery = `${patient.name} ${patient.id} ${patient.doctor}`.toLocaleLowerCase("es").includes(query.trim().toLocaleLowerCase("es"));
    const matchesFilter = filter === "Todos" || filter === "Activos" && patient.status === "Activo" || filter === "Nuevos" && patient.isNew || filter === "Seguimiento" && patient.status === "Seguimiento";
    return matchesQuery && matchesFilter;
  }), [filter, patients, query]);
  const activePatients = patients.filter((patient) => patient.status === "Activo").length;
  const newPatients = patients.filter((patient) => patient.isNew).length;

  return <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7">
    <Notice message={notice} />
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-accent uppercase">Gestión asistencial</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Pacientes</h1><p className="mt-1 text-xs text-muted">Gestión de expedientes, seguimiento y atención de pacientes.</p></div><div className="flex gap-2"><button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-extrabold hover:bg-surface-hover" type="button" onClick={() => showNotice("Listado preparado para exportar")}><Download className="size-3.5" />Exportar</button><button className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent px-4 text-xs font-extrabold text-white hover:bg-accent-hover" type="button" onClick={() => showNotice("Formulario de paciente listo para conectar")}><Plus className="size-3.5" />Nuevo paciente</button></div></header>
    <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de pacientes"><AdminMetric icon={Users} label="Pacientes totales" value={String(totalPatients)} helper="Desde perfiles registrados" tone="bg-accent-soft text-accent" /><AdminMetric icon={UserRoundCheck} label="Nuevos este mes" value={String(newPatients)} helper="En la página cargada" tone="bg-success-soft text-success" /><AdminMetric icon={Activity} label="Activos visibles" value={String(activePatients)} helper="En la página cargada" tone="bg-warning-soft text-warning" /><AdminMetric icon={HeartPulse} label="Datos clínicos" value="—" helper="Disponible al abrir expediente" tone="bg-violet-soft text-violet" /></section>
    <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0 space-y-4">
        <SectionCard className="overflow-hidden" labelledBy="patients-list-title"><div className="flex flex-col gap-3 border-b border-line px-4 py-3 lg:flex-row lg:items-center"><h2 className="text-xs font-extrabold" id="patients-list-title">Listado de pacientes</h2><label className="relative lg:ml-auto"><span className="sr-only">Buscar paciente</span><Search className="absolute top-1/2 left-2.5 size-3 -translate-y-1/2 text-muted" /><input className="h-8 w-full rounded-lg border border-line bg-surface-input pr-3 pl-8 text-[0.62rem] outline-none focus:border-accent lg:w-48" placeholder="Nombre o expediente" value={query} onChange={(event) => { setIsLoading(true); setCurrentPage(1); setQuery(event.target.value); }} /></label><div className="flex gap-1 overflow-x-auto">{(["Todos","Activos","Nuevos","Seguimiento"] as const).map((item) => <button className={`min-h-8 shrink-0 rounded-lg px-3 text-[0.58rem] font-bold ${filter === item ? "bg-accent-soft text-accent" : "border border-line text-muted"}`} type="button" key={item} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
          <div className="overflow-x-auto"><table className="w-full min-w-220 text-left"><caption className="sr-only">Pacientes de la clínica</caption><thead className="bg-surface-subtle text-[0.53rem] font-extrabold uppercase tracking-wide text-muted"><tr>{["Paciente","Edad","Última cita","Médico asignado","Próxima cita","Estado","Acciones"].map((heading) => <th className="px-3 py-2.5" key={heading}>{heading}</th>)}</tr></thead><tbody className="divide-y divide-line">{filtered.map((patient, index) => <tr className="text-[0.61rem] hover:bg-surface-hover" key={patient.id}><th className="px-3 py-2.5 font-normal"><div className="flex items-center gap-2"><span className={`grid size-8 shrink-0 place-items-center rounded-full font-mono text-[0.5rem] font-bold ${index % 2 ? "bg-violet-soft text-violet" : "bg-accent-soft text-accent"}`}>{patient.initials}</span><div><p className="font-extrabold">{patient.name}</p><p className="font-mono text-[0.49rem] text-muted">ID: {patient.id}</p></div></div></th><td className="px-3 font-mono font-bold">{patient.age ?? "—"}</td><td className="px-3 font-semibold text-ink-secondary">{patient.lastVisit}</td><td className="px-3"><p className="font-extrabold">{patient.doctor}</p><p className="text-[0.5rem] text-muted">{patient.specialty}</p></td><td className="px-3 font-mono text-[0.56rem] font-bold">{patient.nextVisit}</td><td className="px-3"><span className={`rounded-md px-2 py-1 text-[0.52rem] font-extrabold ${statusStyles[patient.status]}`}>{patient.status}</span></td><td className="px-3"><button className="grid size-8 place-items-center rounded-lg text-muted hover:bg-accent-soft hover:text-accent" type="button" aria-label={`Ver expediente de ${patient.name}`} onClick={() => showNotice(`Abriendo expediente de ${patient.name}`)}><Eye className="size-3.5" /></button></td></tr>)}</tbody></table>{isLoading ? <div className="grid min-h-36 place-items-center text-center text-xs font-bold text-muted">Cargando pacientes…</div> : filtered.length === 0 ? <div className="grid min-h-36 place-items-center text-center"><p className="text-xs font-bold text-muted">No hay pacientes que coincidan.</p></div> : null}</div>
          <div className="flex items-center justify-between border-t border-line px-4 py-3"><p className="text-[0.58rem] text-muted">Mostrando {filtered.length} de {totalPatients}</p><div className="flex gap-1"><button className="grid size-7 place-items-center rounded-md border border-line text-muted disabled:opacity-40" type="button" aria-label="Página anterior" disabled={currentPage === 1 || isLoading} onClick={() => { setIsLoading(true); setCurrentPage((page) => Math.max(1, page - 1)); }}><ChevronLeft className="size-3" /></button>{Array.from({ length: Math.min(lastPage, 5) }, (_, index) => index + 1).map((page) => <button className={`grid size-7 place-items-center rounded-md text-[0.58rem] font-bold ${page === currentPage ? "bg-accent text-white" : "border border-line text-muted"}`} type="button" key={page} disabled={isLoading} onClick={() => { setIsLoading(true); setCurrentPage(page); }}>{page}</button>)}<button className="grid size-7 place-items-center rounded-md border border-line text-muted disabled:opacity-40" type="button" aria-label="Página siguiente" disabled={currentPage === lastPage || isLoading} onClick={() => { setIsLoading(true); setCurrentPage((page) => Math.min(lastPage, page + 1)); }}><ChevronRight className="size-3" /></button></div></div>
        </SectionCard>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"><SectionCard className="p-4"><div className="flex items-start justify-between"><div><h2 className="text-xs font-extrabold">Admisiones y seguimiento</h2><p className="mt-1 text-[0.56rem] text-muted">Comparativa mensual de pacientes.</p></div><span className="text-[0.52rem] font-bold text-accent">Nuevos pacientes</span></div><MiniTrend /></SectionCard><SectionCard className="p-4"><h2 className="text-xs font-extrabold">Próximos seguimientos</h2><ul className="mt-3 divide-y divide-line">{patients.slice(0,4).map((patient) => <li className="flex items-center gap-2 py-2" key={patient.id}><span className="grid size-7 place-items-center rounded-full bg-accent-soft font-mono text-[0.48rem] font-bold text-accent">{patient.initials}</span><span className="min-w-0 flex-1"><span className="block truncate text-[0.57rem] font-extrabold">{patient.name}</span><span className="text-[0.5rem] text-muted">{patient.id}</span></span><span className="text-right font-mono text-[0.5rem] font-bold">{patient.nextVisit}</span></li>)}</ul></SectionCard></div>
      </div>
      <aside className="grid gap-3"><SectionCard className="p-4"><h2 className="text-xs font-extrabold">Resumen de pacientes</h2><dl className="mt-3 divide-y divide-line">{[["Pacientes activos",String(activePatients),"text-success"],["Nuevos en página",String(newPatients),"text-accent"],["Inactivos visibles",String(Math.max(patients.length - activePatients, 0)),"text-violet"],["Sin cita próxima","—","text-warning"]].map(([label,value,tone]) => <div className="flex items-center gap-2 py-2.5" key={label}><span className={`size-2 rounded-full bg-current ${tone}`} /><dt className="flex-1 text-[0.58rem] font-semibold text-muted">{label}</dt><dd className="font-mono text-[0.62rem] font-extrabold">{value}</dd></div>)}</dl></SectionCard><SectionCard className="p-4"><h2 className="text-xs font-extrabold">Segmentación</h2><div className="mt-4 flex items-center gap-4"><div className="grid size-20 place-items-center rounded-full border-7 border-accent-soft"><div className="text-center"><strong className="font-mono text-base">{totalPatients}</strong><span className="block text-[0.5rem] text-muted">Total</span></div></div><ul className="flex-1 space-y-2 text-[0.54rem]">{[["Activos",String(activePatients),"bg-success"],["Nuevos",String(newPatients),"bg-accent"],["Edad", "—", "bg-violet"]].map(([label,value,color]) => <li className="flex gap-1.5" key={label}><span className={`mt-1 size-1.5 rounded-full ${color}`} /><span className="flex-1 text-muted">{label}</span><b>{value}</b></li>)}</ul></div></SectionCard><SectionCard className="p-4"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-violet-soft text-violet"><BrainCircuit className="size-4" /></span><h2 className="text-xs font-extrabold">IA Epidemiológica</h2></div><div className="mt-3 rounded-lg border border-line p-3 text-[0.56rem]"><p className="font-extrabold">Módulo preparado</p><p className="mt-1 text-muted">Requiere datos clínicos para generar alertas.</p><p className="mt-3 font-bold text-success">Estado: Disponible</p></div><button className="mt-2 inline-flex min-h-8 w-full items-center justify-center gap-1 text-[0.58rem] font-bold text-accent" type="button" onClick={() => showNotice("Abriendo IA Epidemiológica")}>Ver IA Epidemiológica <ArrowUpRight className="size-3" /></button></SectionCard></aside>
    </div>
  </div>;
}

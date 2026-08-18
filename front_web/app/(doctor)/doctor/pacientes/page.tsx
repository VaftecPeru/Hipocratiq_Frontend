import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  HeartPulse,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  DoctorAvatar,
  DoctorCard,
  MetricCard,
  SectionHeading,
  StatusBadge,
} from "@/features/doctors/ui/doctor-primitives";

const metrics = [
  { label: "Pacientes activos", value: "324", trend: "↑ +12%", icon: Users, tone: "green" as const },
  { label: "En seguimiento", value: "128", trend: "↑ +15%", icon: RefreshCw, tone: "blue" as const },
  { label: "Altas recientes", value: "18", trend: "↑ +10%", icon: Plus, tone: "violet" as const },
  { label: "Crónicos", value: "142", trend: "↑ +8%", icon: HeartPulse, tone: "orange" as const },
] as const;

const patients = [
  { initials: "ML", name: "María López Fernández", code: "EXP-0008521", age: "56 años", diagnosis: "Hipertensión esencial", lastVisit: "Hoy, 09:15 AM", nextVisit: "23 May 2024", nextTime: "09:30 AM", status: "En seguimiento", tone: "green" as const, avatarTone: "orange" as const },
  { initials: "JP", name: "Juan Pérez Gómez", code: "EXP-0007432", age: "64 años", diagnosis: "Insuficiencia cardiaca", lastVisit: "Ayer, 10:45 AM", nextVisit: "21 May 2024", nextTime: "11:00 AM", status: "En seguimiento", tone: "green" as const, avatarTone: "blue" as const },
  { initials: "AT", name: "Ana Torres Ramírez", code: "EXP-0006621", age: "45 años", diagnosis: "Control prenatal + HTA", lastVisit: "Ayer, 04:30 PM", nextVisit: "24 May 2024", nextTime: "10:00 AM", status: "En seguimiento", tone: "green" as const, avatarTone: "slate" as const },
  { initials: "PG", name: "Pedro García Méndez", code: "EXP-0005123", age: "71 años", diagnosis: "Post operatorio de CABG", lastVisit: "14 May 2024", nextVisit: "28 May 2024", nextTime: "09:00 AM", status: "Estable", tone: "blue" as const, avatarTone: "slate" as const },
  { initials: "LM", name: "Laura Martínez Soto", code: "EXP-0004210", age: "38 años", diagnosis: "Palpitaciones", lastVisit: "13 May 2024", nextVisit: "Sin cita", nextTime: "", status: "Alta reciente", tone: "violet" as const, avatarTone: "orange" as const },
] as const;

const frequentPatients = [
  { initials: "ML", name: "María López Fernández", detail: "Hipertensión esencial", visits: "5 visitas", tone: "orange" as const },
  { initials: "JP", name: "Juan Pérez Gómez", detail: "Insuficiencia cardiaca", visits: "4 visitas", tone: "blue" as const },
  { initials: "PG", name: "Pedro García Méndez", detail: "Post operatorio de CABG", visits: "3 visitas", tone: "slate" as const },
  { initials: "AT", name: "Ana Torres Ramírez", detail: "Control prenatal + HTA", visits: "3 visitas", tone: "orange" as const },
] as const;

const followUps = [
  { name: "María López Fernández", date: "23 May 2024, 09:30 AM", label: "En 7 días", tone: "green" as const, avatarTone: "orange" as const },
  { name: "Juan Pérez Gómez", date: "21 May 2024, 11:00 AM", label: "En 5 días", tone: "orange" as const, avatarTone: "blue" as const },
  { name: "Ana Torres Ramírez", date: "24 May 2024, 10:00 AM", label: "En 8 días", tone: "green" as const, avatarTone: "slate" as const },
] as const;

export default function DoctorPatientsPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.65rem]">Pacientes</h1><p className="mt-1 text-[0.68rem] font-bold text-ink-secondary">Gestión de pacientes, seguimiento y administración clínica.</p></div><button className="inline-flex min-h-9 items-center justify-center gap-2 self-start rounded-lg bg-accent px-4 text-[0.65rem] font-extrabold text-white shadow-[0_5px_14px_rgb(8_98_221/18%)] hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus sm:self-auto" type="button"><Plus className="size-3.5" aria-hidden="true" />Nuevo Paciente</button></header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Resumen de pacientes">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_314px]" aria-label="Gestión de pacientes">
        <DoctorCard className="min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5"><h2 className="text-[0.82rem] font-extrabold">Listado de pacientes</h2></div>
          <div className="flex flex-wrap gap-2 border-b border-line px-4 py-3 sm:px-5"><label className="flex h-8 min-w-[190px] flex-1 items-center gap-2 rounded-lg border border-line bg-surface-input px-2.5 text-muted sm:max-w-[245px]"><Search className="size-3.5" aria-hidden="true" /><span className="sr-only">Buscar pacientes</span><input className="min-w-0 flex-1 bg-transparent text-[0.6rem] outline-none placeholder:text-placeholder" placeholder="Buscar por nombre o expediente..." /></label><button className="inline-flex h-8 items-center gap-2 rounded-lg border border-line px-3 text-[0.6rem] font-extrabold hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button"><Filter className="size-3.5" aria-hidden="true" />Filtros</button><button className="inline-flex h-8 items-center gap-2 rounded-lg border border-line px-3 text-[0.6rem] font-extrabold hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button">Todos los estados<ChevronDown className="size-3" aria-hidden="true" /></button></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[860px] border-collapse text-left"><thead><tr className="border-b border-line bg-surface-subtle text-[0.55rem] font-extrabold text-ink-secondary"><th className="px-3 py-2.5 font-extrabold sm:px-4">Paciente</th><th className="px-3 py-2.5 font-extrabold">Edad</th><th className="px-3 py-2.5 font-extrabold">Diagnóstico / Motivo</th><th className="px-3 py-2.5 font-extrabold">Última visita</th><th className="px-3 py-2.5 font-extrabold">Próxima cita</th><th className="px-3 py-2.5 font-extrabold">Estado</th><th className="px-3 py-2.5 font-extrabold">Acciones</th></tr></thead><tbody>{patients.map((patient) => <tr className="border-b border-line last:border-0 hover:bg-surface-subtle" key={patient.code}><td className="px-3 py-2.5 sm:px-4"><div className="flex items-center gap-2.5"><DoctorAvatar initials={patient.initials} tone={patient.avatarTone} size="md" /><div><p className="whitespace-nowrap text-[0.62rem] font-extrabold">{patient.name}</p><p className="mt-0.5 text-[0.55rem] font-bold text-ink-secondary">{patient.code}</p></div></div></td><td className="px-3 py-2.5 text-[0.6rem] font-extrabold">{patient.age}</td><td className="px-3 py-2.5 text-[0.6rem] font-extrabold">{patient.diagnosis}</td><td className="px-3 py-2.5 whitespace-nowrap text-[0.58rem] font-extrabold">{patient.lastVisit}</td><td className="px-3 py-2.5 whitespace-nowrap"><p className="text-[0.58rem] font-extrabold">{patient.nextVisit}</p><p className="mt-0.5 text-[0.55rem] font-bold text-ink-secondary">{patient.nextTime}</p></td><td className="px-3 py-2.5"><StatusBadge tone={patient.tone}>{patient.status}</StatusBadge></td><td className="px-3 py-2.5"><button className="inline-flex min-h-7 items-center gap-2 rounded-md border border-accent/20 px-2.5 text-[0.58rem] font-extrabold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus" type="button">Ver expediente <ChevronRight className="size-3" aria-hidden="true" /></button></td></tr>)}</tbody></table></div>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-[0.58rem] font-bold text-ink-secondary sm:px-5"><span>Mostrando 1 a 5 de 324 pacientes</span><nav className="flex items-center gap-1" aria-label="Paginación de pacientes"><button className="grid size-7 place-items-center rounded-md border border-line text-muted focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Página anterior"><ChevronLeft className="size-3" /></button><button className="grid size-7 place-items-center rounded-md bg-accent text-[0.58rem] font-extrabold text-white" type="button" aria-current="page">1</button>{[2, 3, 4, 5].map((page) => <button className="grid size-7 place-items-center rounded-md border border-line text-[0.58rem] font-extrabold hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" key={page}>{page}</button>)}<span className="px-1">...</span><button className="grid size-7 place-items-center rounded-md border border-line text-[0.58rem] font-extrabold focus-visible:outline-3 focus-visible:outline-focus" type="button">65</button><button className="grid size-7 place-items-center rounded-md border border-line text-muted focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Página siguiente"><ChevronRight className="size-3" /></button></nav></footer>
        </DoctorCard>

        <aside className="grid gap-4">
          <DoctorCard className="p-4"><SectionHeading title="Pacientes frecuentes" action="Ver todos" /><ul className="mt-3 divide-y divide-line">{frequentPatients.map((patient) => <li className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0" key={patient.name}><DoctorAvatar initials={patient.initials} tone={patient.tone} size="sm" /><span className="min-w-0 flex-1"><span className="block truncate text-[0.6rem] font-extrabold">{patient.name}</span><span className="mt-0.5 block truncate text-[0.55rem] font-bold text-ink-secondary">{patient.detail}</span></span><span className="shrink-0 rounded-md border border-accent/15 px-2 py-1 text-[0.55rem] font-extrabold text-accent">{patient.visits}</span></li>)}</ul></DoctorCard>

          <DoctorCard className="p-4"><SectionHeading title="Seguimientos próximos" action="Ver agenda" /><ul className="mt-3 divide-y divide-line">{followUps.map((patient) => <li className="flex items-center gap-2.5 py-2.5 first:pt-0 last:pb-0" key={patient.name}><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><CalendarDays className="size-3.5" aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block truncate text-[0.59rem] font-extrabold">{patient.name}</span><span className="mt-0.5 block truncate text-[0.53rem] font-bold text-ink-secondary">{patient.date}</span></span><StatusBadge tone={patient.tone}>{patient.label}</StatusBadge></li>)}</ul></DoctorCard>

          <DoctorCard className="p-4"><div className="flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-[0.82rem] font-extrabold"><span className="grid size-7 place-items-center rounded-lg bg-success-soft text-success"><HeartPulse className="size-4" aria-hidden="true" /></span>IA Epidemiológica</h2><button className="text-[0.61rem] font-extrabold text-accent focus-visible:outline-3 focus-visible:outline-focus" type="button">Ver informe ›</button></div><div className="mt-3 rounded-lg border border-line bg-surface-subtle p-3"><div className="flex items-start gap-3"><span className="grid size-8 place-items-center rounded-lg bg-success-soft text-success"><ShieldCheck className="size-4" aria-hidden="true" /></span><div><p className="text-[0.57rem] font-bold text-ink-secondary">Riesgo cardiovascular en tu panel</p><strong className="mt-0.5 block text-lg font-extrabold text-success">Bajo</strong><p className="mt-0.5 text-[0.55rem] font-bold text-ink-secondary">Tendencia estable en pacientes con HTA e IC.</p></div></div><p className="mt-2 border-t border-line pt-2 text-[0.56rem] font-bold text-ink-secondary">Continúa con el seguimiento y control actual.</p></div><p className="mt-3 flex items-center justify-between text-[0.55rem] font-bold text-ink-secondary">Última actualización: Hoy, 08:00 AM <RefreshCw className="size-3 text-accent" aria-hidden="true" /></p></DoctorCard>
        </aside>
      </section>

      <DoctorCard className="mt-4 flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:px-7"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent"><Users className="size-7" strokeWidth={1.5} aria-hidden="true" /></span><div className="min-w-0 flex-1"><h2 className="text-[0.8rem] font-extrabold text-accent">Atención centrada en el paciente</h2><p className="mt-1 max-w-2xl text-[0.6rem] font-bold leading-5 text-ink-secondary">Revisa el historial clínico completo, resultados, recetas y notas de evolución desde el expediente clínico de cada paciente.</p></div><button className="inline-flex min-h-8 items-center gap-2 rounded-lg bg-accent-soft px-4 text-[0.6rem] font-extrabold text-accent hover:bg-accent-soft-hover focus-visible:outline-3 focus-visible:outline-focus" type="button">Conocer más <span aria-hidden="true">ⓘ</span></button></DoctorCard>
    </div>
  );
}

"use client";

import { AlertTriangle, BrainCircuit, CheckCircle2, FlaskConical, ShieldCheck, TrendingUp, Users, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { getDoctorEpidemiology, type DoctorEpidemiology } from "@/features/doctors/api/doctor-clinical";
import { DoctorCard, MetricCard, StatusBadge } from "@/features/doctors/ui/doctor-primitives";
import { DoctorModuleAlert, DoctorModuleError, DoctorModuleLoading } from "@/features/doctors/ui/doctor-module-state";

export default function DoctorEpidemiologyPage() {
  const [analysis, setAnalysis] = useState<DoctorEpidemiology | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getDoctorEpidemiology(controller.signal)
      .then(setAnalysis)
      .catch((caught: unknown) => { if (!(caught instanceof DOMException && caught.name === "AbortError")) setError(caught instanceof Error ? caught.message : "No pudimos cargar el análisis epidemiológico."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  if (loading) return <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6"><DoctorModuleLoading label="Cargando fuentes epidemiológicas…" /></div>;
  if (!analysis) return <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6"><DoctorModuleError message={error ?? "No pudimos cargar el análisis epidemiológico."} /></div>;

  const { metrics } = analysis;
  const metricCards = [
    { label: "Pacientes en vigilancia", value: String(metrics.monitoredPatients), icon: Users, tone: "blue" as const },
    { label: "Alertas activas", value: String(metrics.activeAlerts), icon: AlertTriangle, tone: "orange" as const },
    { label: "Casos de riesgo alto", value: String(metrics.highRiskCases), icon: ShieldCheck, tone: "red" as const },
    { label: "Tendencia", value: metrics.trend === "stable" ? "Estable" : "No configurada", icon: TrendingUp, tone: metrics.trend === "stable" ? "green" as const : "slate" as const },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      <header className="mb-5 flex items-start gap-3"><span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-violet-soft text-violet"><BrainCircuit className="size-5" aria-hidden="true" /></span><div><h1 className="text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.65rem]">IA Epidemiológica</h1><p className="mt-1 text-[0.68rem] font-bold text-ink-secondary">Estado transparente de las fuentes clínicas y del motor de análisis.</p></div></header>
      {error ? <DoctorModuleAlert>{error}</DoctorModuleAlert> : null}
      {!analysis.analysisAvailable ? <div className="mb-4 rounded-lg border border-warning/30 bg-warning-soft px-4 py-3" role="status"><p className="text-xs font-bold text-warning">{analysis.message}</p></div> : null}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Resumen epidemiológico">{metricCards.map((metric) => <MetricCard key={metric.label} {...metric} />)}</section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]" aria-label="Fuentes epidemiológicas">
        <DoctorCard className="p-4"><div className="flex items-center justify-between gap-3"><div><h2 className="text-[0.86rem] font-extrabold">Cobertura de datos</h2><p className="mt-1 text-[0.58rem] font-bold text-ink-secondary">Últimos {analysis.periodDays} días</p></div><BrainCircuit className="size-5 text-violet" aria-hidden="true" /></div><dl className="mt-4 grid gap-2 sm:grid-cols-2"><div className="rounded-lg border border-line bg-surface-subtle p-3"><dt className="text-[0.57rem] font-extrabold text-ink-secondary">Consultas</dt><dd className="mt-1 text-lg font-extrabold">{metrics.consultations}</dd></div><div className="rounded-lg border border-line bg-surface-subtle p-3"><dt className="text-[0.57rem] font-extrabold text-ink-secondary">Laboratorio</dt><dd className="mt-1 text-lg font-extrabold">{metrics.laboratoryOrders}</dd></div><div className="rounded-lg border border-line bg-surface-subtle p-3"><dt className="text-[0.57rem] font-extrabold text-ink-secondary">Teleconsultas</dt><dd className="mt-1 text-lg font-extrabold">{metrics.teleconsultations}</dd></div><div className="rounded-lg border border-line bg-surface-subtle p-3"><dt className="text-[0.57rem] font-extrabold text-ink-secondary">Recetas</dt><dd className="mt-1 text-lg font-extrabold">{metrics.prescriptions}</dd></div></dl></DoctorCard>
        <DoctorCard className="p-4"><h2 className="text-[0.86rem] font-extrabold">Fuentes clínicas</h2><ul className="mt-4 grid gap-2">{Object.entries(analysis.sources).map(([source, value]) => <li className="flex items-center gap-2 rounded-lg border border-line px-3 py-2.5" key={source}><span className={`grid size-7 place-items-center rounded-lg ${value.status === "available" ? "bg-success-soft text-success" : value.status === "no_data" ? "bg-surface-subtle text-muted" : "bg-warning-soft text-warning"}`}>{source === "laboratory" ? <FlaskConical className="size-3.5" aria-hidden="true" /> : source === "telemedicine" ? <Video className="size-3.5" aria-hidden="true" /> : <CheckCircle2 className="size-3.5" aria-hidden="true" />}</span><span className="flex-1 text-[0.59rem] font-extrabold">{value.label}</span><StatusBadge tone={value.status === "available" ? "green" : value.status === "no_data" ? "slate" : "orange"}>{value.status === "available" ? "Disponible" : value.status === "no_data" ? "Sin datos" : "No configurado"}</StatusBadge></li>)}</ul></DoctorCard>
      </section>
      <DoctorCard className="mt-4 p-4"><h2 className="text-[0.82rem] font-extrabold">Alertas y cohortes</h2>{analysis.alerts.length === 0 && analysis.cohorts.length === 0 ? <p className="mt-3 text-xs font-bold text-ink-secondary">No se muestran alertas ni cohortes hasta configurar reglas epidemiológicas verificables.</p> : <p className="mt-3 text-xs font-bold text-ink-secondary">Hay datos epidemiológicos disponibles para revisión.</p>}</DoctorCard>
    </div>
  );
}

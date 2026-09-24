"use client";

import { Activity, AlertTriangle, Database, FlaskConical, MapPin, Stethoscope, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getClinicEpidemiology } from "@/features/clinics/api/browser-clinic-dashboard";
import type { ClinicEpidemiologyData } from "@/features/clinics/model/clinic-admin.types";
import { ClinicModuleLoading } from "@/shared/ui/clinic-module-loading";
import { SectionCard } from "./clinic-admin-primitives";

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function TrendChart({ trend }: Readonly<{ trend: ClinicEpidemiologyData["trend"] }>) {
  const maximum = Math.max(1, ...trend.flatMap((item) => [item.appointments, item.consultations, item.laboratoryOrders]));
  const hasActivity = trend.some((item) => item.appointments + item.consultations + item.laboratoryOrders > 0);

  if (!hasActivity) {
    return <p className="mt-5 rounded-lg border border-dashed border-line-strong p-5 text-center text-[0.58rem] font-semibold text-muted">No hay eventos clínicos internos en los últimos 90 días.</p>;
  }

  return (
    <figure className="mt-4" aria-labelledby="clinic-epidemiology-trend-title">
      <div className="flex h-40 items-end gap-2 border-b border-l border-line px-2 pb-0" role="img" aria-label="Actividad clínica interna por mes">
        {trend.map((item) => (
          <div className="flex min-w-0 flex-1 items-end justify-center gap-0.5 self-stretch" key={item.month}>
            <span className="w-full rounded-t bg-accent" style={{ height: `${(item.appointments / maximum) * 100}%` }} title={`${item.label}: ${item.appointments} citas`} />
            <span className="w-full rounded-t bg-violet" style={{ height: `${(item.consultations / maximum) * 100}%` }} title={`${item.label}: ${item.consultations} consultas`} />
            <span className="w-full rounded-t bg-success" style={{ height: `${(item.laboratoryOrders / maximum) * 100}%` }} title={`${item.label}: ${item.laboratoryOrders} órdenes de laboratorio`} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between gap-2 text-[0.48rem] font-bold text-muted">{trend.map((item) => <span key={item.month}>{item.label}</span>)}</div>
      <figcaption className="mt-3 flex flex-wrap gap-4 text-[0.52rem] font-bold text-muted" id="clinic-epidemiology-trend-title">
        <span className="flex items-center gap-1"><i className="size-1.5 rounded-full bg-accent" aria-hidden="true" />Citas</span>
        <span className="flex items-center gap-1"><i className="size-1.5 rounded-full bg-violet" aria-hidden="true" />Consultas</span>
        <span className="flex items-center gap-1"><i className="size-1.5 rounded-full bg-success" aria-hidden="true" />Laboratorio</span>
      </figcaption>
    </figure>
  );
}

function SourceList({ sources }: Readonly<{ sources: ClinicEpidemiologyData["sources"] }>) {
  return (
    <ul className="mt-3 grid gap-2">
      {Object.entries(sources).map(([key, source]) => (
        <li className="flex items-center gap-2 text-[0.55rem]" key={key}>
          <Database className="size-3 text-ink-secondary" aria-hidden="true" />
          <span className="flex-1 font-semibold">{source.label}</span>
          <span className={`rounded-md px-2 py-1 font-bold ${source.status === "available" ? "bg-success-soft text-success" : "bg-surface-subtle text-muted"}`}>
            {source.status === "available" ? `${source.count} eventos` : "Sin datos"}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ClinicEpidemiology() {
  const [data, setData] = useState<ClinicEpidemiologyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getClinicEpidemiology(controller.signal)
      .then((next) => {
        setData(next);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (!isAbortError(reason)) setError(reason instanceof Error ? reason.message : "No pudimos cargar la vigilancia clínica.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  if (isLoading && data === null) return <ClinicModuleLoading title="vigilancia clínica" description="Consultando eventos clínicos internos." variant="report" />;

  if (error !== null && data === null) {
    return <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7"><div role="alert"><SectionCard className="p-6"><h1 className="text-xl font-extrabold">No pudimos cargar vigilancia clínica</h1><p className="mt-2 text-sm text-muted">{error}</p><button className="mt-4 min-h-10 rounded-lg bg-accent px-4 text-xs font-extrabold text-white hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-focus" type="button" onClick={() => { setError(null); setIsLoading(true); setReloadKey((current) => current + 1); }}>Reintentar</button></SectionCard></div></div>;
  }

  if (data === null) return null;

  const metricCards = [
    { icon: AlertTriangle, label: "Alertas calculadas", value: String(data.metrics.activeAlerts), helper: data.analysisAvailable ? "Motor conectado" : "No calculadas sin motor predictivo", tone: "bg-danger-soft text-danger" },
    { icon: Users, label: "Pacientes con actividad", value: String(data.metrics.monitoredPatients), helper: "Eventos internos · 90 días", tone: "bg-violet-soft text-violet" },
    { icon: Stethoscope, label: "Casos de prioridad alta", value: String(data.metrics.highRiskCases), helper: "Según triaje registrado", tone: "bg-warning-soft text-warning" },
    { icon: Activity, label: "Eventos clínicos", value: String(data.metrics.appointments + data.metrics.consultations + data.metrics.laboratoryOrders), helper: `${data.metrics.teleconsultations} teleconsultas · ${data.metrics.prescriptions} recetas`, tone: "bg-accent-soft text-accent" },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0"><p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-violet uppercase">Vigilancia clínica</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Epidemiología</h1><p className="mt-1 text-xs text-muted">Actividad clínica interna y disponibilidad de fuentes para esta clínica.</p></div>
        <span className={`inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-[0.6rem] font-extrabold ${data.analysisAvailable ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}><span className="size-1.5 rounded-full bg-current" aria-hidden="true" />{data.analysisAvailable ? "Motor predictivo conectado" : "Motor predictivo no configurado"}</span>
      </header>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen epidemiológico">
        {metricCards.map(({ icon: Icon, label, value, helper, tone }) => <SectionCard className="p-4" key={label}><div className="flex gap-3"><span className={`grid size-10 place-items-center rounded-full ${tone}`}><Icon className="size-4" aria-hidden="true" /></span><div><p className="text-[0.58rem] font-bold text-muted">{label}</p><strong className="mt-1 block font-mono text-lg">{value}</strong><p className="mt-1 text-[0.52rem] font-bold text-muted">{helper}</p></div></div></SectionCard>)}
      </section>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-4">
          <SectionCard className="p-4"><div className="flex items-start justify-between"><div><h2 className="text-xs font-extrabold">Actividad clínica interna</h2><p className="mt-1 text-[0.54rem] text-muted">Citas, consultas y órdenes registradas entre {data.period.from} y {data.period.to}.</p></div><Activity className="size-4 text-accent" aria-hidden="true" /></div><TrendChart trend={data.trend} /></SectionCard>
          <SectionCard className="p-4"><div className="flex items-start gap-3"><span className={`grid size-9 shrink-0 place-items-center rounded-lg ${data.analysisAvailable ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}>{data.analysisAvailable ? <Activity className="size-4" aria-hidden="true" /> : <AlertTriangle className="size-4" aria-hidden="true" />}</span><div><h2 className="text-xs font-extrabold">{data.analysisAvailable ? "Análisis epidemiológico disponible" : "Análisis predictivo no disponible"}</h2><p className="mt-1 text-[0.58rem] leading-5 text-muted">{data.message}</p><p className="mt-2 text-[0.52rem] font-semibold text-muted">Actualizado: {formatDate(data.generatedAt)}</p></div></div></SectionCard>
          <SectionCard className="overflow-hidden"><div className="border-b border-line p-4"><h2 className="text-xs font-extrabold">Predicciones y alertas</h2></div><div className="space-y-2 p-4 text-[0.58rem] font-semibold text-muted">{data.alerts.map((alert, index) => <div className="rounded-lg border border-warning/25 bg-warning-soft p-3" key={`alert-${index}`}><strong className="text-ink">{String((alert as { title?: unknown }).title ?? "Alerta")}</strong><p className="mt-1">{String((alert as { detail?: unknown }).detail ?? "")}</p></div>)}{data.forecasts.map((forecast, index) => <div className="rounded-lg border border-line bg-surface-subtle p-3" key={`forecast-${index}`}><strong className="text-ink">{String((forecast as { title?: unknown }).title ?? "Proyección")}</strong><p className="mt-1">{String((forecast as { detail?: unknown }).detail ?? "")}</p></div>)}{data.forecasts.length === 0 && data.alerts.length === 0 ? "No hay predicciones ni alertas calculadas para esta clínica." : null}</div></SectionCard>
        </div>

        <aside className="grid gap-3">
          <SectionCard className="p-4"><h2 className="flex items-center gap-2 text-xs font-extrabold"><MapPin className="size-3.5 text-accent" aria-hidden="true" />Mapa territorial</h2><p className="mt-3 rounded-lg border border-dashed border-line-strong p-3 text-[0.56rem] leading-5 text-muted">{data.map.message}</p></SectionCard>
          <SectionCard className="p-4"><h2 className="flex items-center gap-2 text-xs font-extrabold"><FlaskConical className="size-3.5 text-violet" aria-hidden="true" />Fuentes clínicas</h2><SourceList sources={data.sources} /></SectionCard>
          <SectionCard className="p-4"><h2 className="text-xs font-extrabold">Recomendaciones</h2><p className="mt-3 text-[0.56rem] leading-5 text-muted">{data.recommendations.length > 0 ? data.recommendations.join(" ") : "No hay recomendaciones automáticas porque el motor predictivo no está configurado."}</p></SectionCard>
        </aside>
      </div>
    </div>
  );
}

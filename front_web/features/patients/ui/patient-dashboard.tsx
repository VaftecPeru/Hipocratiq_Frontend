"use client";

import {
  Activity,
  BellRing,
  BrainCircuit,
  CalendarDays,
  CalendarPlus,
  ChevronRight,
  CircleCheck,
  Clock3,
  FileText,
  HeartPulse,
  MapPin,
  MessageCircle,
  Navigation,
  Pill,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TestTube2,
  X,
} from "lucide-react";
import type { AuthenticatedUser } from "@/features/auth/model/auth.types";

const healthMetrics = [
  { label: "Presión arterial", value: "118/76", detail: "mmHg", icon: Activity },
  { label: "Frecuencia cardiaca", value: "72", detail: "lpm", icon: HeartPulse },
] as const;

const dashboardCards = [
  {
    title: "IA Epidemiológica",
    eyebrow: "Análisis preventivo",
    description: "Tu perfil no presenta alertas epidemiológicas relevantes esta semana.",
    action: "Ver análisis",
    icon: BrainCircuit,
    tone: "bg-violet-soft text-violet",
    content: (
      <div className="flex items-center gap-2 rounded-lg bg-success-soft px-3 py-2 text-2xs font-bold text-success">
        <CircleCheck className="size-3.5 shrink-0" aria-hidden="true" />
        Riesgo actual: bajo
      </div>
    ),
  },
  {
    title: "Resultados recientes",
    eyebrow: "Laboratorio",
    description: "Hemograma completo · 24 de mayo",
    action: "Ver resultados",
    icon: TestTube2,
    tone: "bg-accent-soft text-accent",
    content: (
      <div className="flex items-center justify-between rounded-lg border border-line bg-surface-input px-3 py-2">
        <span className="text-2xs font-bold text-ink-secondary">12 indicadores</span>
        <span className="text-2xs font-extrabold text-success">Sin alertas</span>
      </div>
    ),
  },
  {
    title: "Mis recetas activas",
    eyebrow: "Tratamiento",
    description: "Losartán 50 mg · 1 tableta cada 24 h",
    action: "Ver recetas",
    icon: Pill,
    tone: "bg-warning-soft text-warning",
    content: (
      <div className="flex items-center justify-between rounded-lg border border-line bg-surface-input px-3 py-2">
        <span className="text-2xs font-bold text-ink-secondary">1 receta activa</span>
        <span className="text-2xs font-extrabold text-warning">18 días restantes</span>
      </div>
    ),
  },
] as const;

const quickActions = [
  { label: "Agendar cita", icon: CalendarPlus },
  { label: "Historia clínica", icon: FileText },
  { label: "Mis especialistas", icon: Stethoscope },
  { label: "Soporte", icon: MessageCircle },
] as const;

export function PatientDashboard({ user }: { user: AuthenticatedUser }) {
  const firstName = user.name.trim().split(/\s+/)[0] || "Paciente";
  const clinicName = user.patient?.clinic?.name ?? "tu clínica";

  return (
    <div className="px-4 py-5 text-ink sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto w-full max-w-300">
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-xl font-extrabold tracking-[-0.025em]">
            Bienvenida de nuevo, {firstName}
          </h1>
          <p className="mt-1 text-xs text-muted">
            Aquí puedes revisar tus citas, resultados y recetas en un solo lugar.
          </p>
        </div>

        {/* Hero grid */}
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(17rem,0.75fr)]" aria-label="Resumen de salud">
          <article className="relative overflow-hidden rounded-2xl bg-accent p-5 text-white shadow-[0_1rem_2.5rem_rgb(8_98_221/18%)] sm:p-6">
            <div className="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full border-[2.5rem] border-white/5" aria-hidden="true" />
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-2xs font-extrabold tracking-[0.1em] text-white/75 uppercase">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  Tu próxima cita
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-1 text-2xs font-bold ring-1 ring-white/20">
                  <CircleCheck className="size-3.5" aria-hidden="true" /> Confirmada
                </span>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <div>
                  <p className="font-display text-2xl leading-none italic tracking-[-0.035em] text-white/90 sm:text-3xl">
                    Viernes 30 de mayo
                  </p>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-white/80">
                    <span className="flex items-center gap-1.5">
                      <Clock3 className="size-4" aria-hidden="true" /> 09:30
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-4" aria-hidden="true" /> Sede San Isidro
                    </span>
                  </div>
                  <div className="mt-5 flex items-center gap-3 border-t border-white/20 pt-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20">
                      <Stethoscope className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-extrabold">Dr. Ricardo Gómez</p>
                      <p className="mt-0.5 text-2xs text-white/65">Medicina interna · {clinicName}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:max-w-68 sm:justify-end">
                  <button className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-2xs font-extrabold text-accent transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" type="button">
                    <RefreshCw className="size-3.5" aria-hidden="true" /> Reprogramar
                  </button>
                  <button className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-2xs font-bold text-white ring-1 ring-white/25 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" type="button">
                    <X className="size-3.5" aria-hidden="true" /> Cancelar
                  </button>
                  <button className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-2xs font-bold text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" type="button">
                    <Navigation className="size-3.5" aria-hidden="true" /> Cómo llegar
                  </button>
                </div>
              </div>
            </div>
          </article>

          <article className="overflow-hidden rounded-2xl border border-success/15 bg-success-soft p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-2xs font-extrabold tracking-[0.1em] text-success uppercase">Estado de salud</p>
                <h2 className="mt-2 text-xl font-extrabold tracking-[-0.03em] text-success">Todo en orden</h2>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/70 text-success">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-ink-secondary">Tus últimos controles se encuentran dentro de los rangos esperados.</p>
            <dl className="mt-5 grid grid-cols-2 gap-2">
              {healthMetrics.map(({ label, value, detail, icon: Icon }) => (
                <div className="rounded-xl bg-white/70 p-3" key={label}>
                  <Icon className="size-4 text-success" aria-hidden="true" />
                  <dt className="mt-3 text-[0.625rem] font-bold leading-4 text-muted">{label}</dt>
                  <dd className="mt-1 font-mono text-sm font-bold text-ink">
                    {value} <span className="text-[0.5625rem] font-medium text-muted">{detail}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 flex items-center gap-1.5 text-2xs font-bold text-success">
              <Sparkles className="size-3.5" aria-hidden="true" /> Actualizado el 24 de mayo
            </p>
          </article>
        </section>

        {/* Info cards */}
        <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Información médica destacada">
          {dashboardCards.map(({ title, eyebrow, description, action, icon: Icon, tone, content }, index) => (
            <article
              className="flex min-h-58 flex-col rounded-2xl border border-line bg-surface p-5 shadow-[0_0.35rem_1.5rem_rgb(16_27_51/4%)] motion-safe:animate-[fade-up-in_400ms_ease-out_both]"
              key={title}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.625rem] font-bold tracking-[0.08em] text-muted uppercase">{eyebrow}</p>
                  <h2 className="mt-1.5 text-sm font-extrabold">{title}</h2>
                </div>
                <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${tone}`}>
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 min-h-10 text-xs leading-5 text-ink-secondary">{description}</p>
              <div className="mt-4">{content}</div>
              <button className="mt-auto flex min-h-9 items-end justify-between gap-3 pt-4 text-left text-xs font-extrabold text-accent focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" type="button">
                {action} <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </article>
          ))}
        </section>

        {/* Reminders + Quick actions */}
        <section className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <article className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[0.625rem] font-bold tracking-[0.08em] text-muted uppercase">Próximos días</p>
                <h2 className="mt-1 text-sm font-extrabold">Recordatorios</h2>
              </div>
              <span className="grid size-9 place-items-center rounded-lg bg-accent-soft text-accent">
                <BellRing className="size-4" aria-hidden="true" />
              </span>
            </div>
            <ul className="mt-4 divide-y divide-line">
              <li className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 py-3 first:pt-0">
                <time className="grid size-11 place-items-center rounded-lg bg-surface-subtle text-center font-mono text-[0.625rem] font-bold leading-3 text-accent" dateTime="2025-05-29">
                  29<br />MAY
                </time>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold">Ayuno para análisis de sangre</p>
                  <p className="mt-1 text-2xs leading-4 text-muted">Inicia a las 22:00 · Solo puedes tomar agua.</p>
                </div>
              </li>
              <li className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 py-3 last:pb-0">
                <time className="grid size-11 place-items-center rounded-lg bg-surface-subtle text-center font-mono text-[0.625rem] font-bold leading-3 text-accent" dateTime="2025-06-02">
                  02<br />JUN
                </time>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold">Renovar receta de Losartán</p>
                  <p className="mt-1 text-2xs leading-4 text-muted">Solicita la renovación antes de que termine tu tratamiento.</p>
                </div>
              </li>
            </ul>
          </article>

          <article className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <p className="text-[0.625rem] font-bold tracking-[0.08em] text-muted uppercase">Gestiones frecuentes</p>
            <h2 className="mt-1 text-sm font-extrabold">Accesos rápidos</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {quickActions.map(({ label, icon: Icon }) => (
                <button className="group flex min-h-20 flex-col items-start justify-between rounded-xl border border-line bg-surface-input p-3 text-left text-2xs font-extrabold transition-colors hover:border-line-strong hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" type="button" key={label}>
                  <Icon className="size-4 text-accent" aria-hidden="true" />
                  <span className="flex w-full items-end justify-between gap-2">
                    {label} <ChevronRight className="size-3.5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </button>
              ))}
            </div>
          </article>
        </section>

        {/* Help CTA */}
        <aside className="mt-4 flex flex-col gap-4 overflow-hidden rounded-2xl bg-ink px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6" aria-labelledby="help-title">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-white">
              <MessageCircle className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-extrabold" id="help-title">¿Necesitas ayuda con tu atención?</h2>
              <p className="mt-1 text-2xs leading-5 text-white/65">El equipo de {clinicName} puede orientarte por WhatsApp.</p>
            </div>
          </div>
          <button className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-success px-4 text-xs font-extrabold text-white transition-colors hover:bg-success/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" type="button">
            <MessageCircle className="size-4" aria-hidden="true" /> Hablar por WhatsApp
          </button>
        </aside>
      </div>
    </div>
  );
}

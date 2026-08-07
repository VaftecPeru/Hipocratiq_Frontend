import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  Building2,
  ClipboardList,
  Eye,
  GitBranch,
  Megaphone,
  Palette,
  Radio,
  ShieldAlert,
  Siren,
  TriangleAlert,
  Workflow,
  Zap,
} from "lucide-react";
import {
  SettingsCard,
  SettingsNote,
  SettingsPageHeader,
  SettingsSelect,
  SettingsToggle,
} from "@/features/platform/ui/settings-primitives";
import {
  AuditLink,
  EditTemplateButton,
  PublishPolicyButton,
} from "@/features/platform/ui/emergency-modals";

export const metadata: Metadata = {
  title: "Botón de Emergencia",
};

type StatTone = "success" | "danger" | "accent";

type EmergencyStat = {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone: StatTone;
};

const stats: EmergencyStat[] = [
  { label: "Clínicas con botón activo", value: "24", hint: "de 31 clínicas", icon: Building2, tone: "success" },
  { label: "Alertas hoy", value: "18", hint: "4 críticas", icon: TriangleAlert, tone: "danger" },
  { label: "Flujos personalizados", value: "07", hint: "por clínica", icon: Workflow, tone: "accent" },
];

const STAT_BAR: Record<StatTone, string> = {
  success: "bg-success",
  danger: "bg-danger",
  accent: "bg-accent",
};

const STAT_ICON: Record<StatTone, string> = {
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  accent: "bg-accent-soft text-accent",
};

type PolicyField = {
  id: string;
  label: string;
  value: string;
  options: string[];
  icon: LucideIcon;
  swatch?: string;
};

const policyFields: PolicyField[] = [
  {
    id: "emergency-visibility",
    label: "Visibilidad base",
    value: "Recepción, médicos y administradores clínicos",
    options: [
      "Recepción, médicos y administradores clínicos",
      "Solo médicos y administradores clínicos",
      "Solo administradores clínicos",
    ],
    icon: Eye,
  },
  {
    id: "emergency-color",
    label: "Color sugerido",
    value: "#EF2F3F - Rojo emergencia",
    options: ["#EF2F3F - Rojo emergencia", "#F97316 - Naranja alerta", "#7C3AED - Violeta crítico"],
    icon: Palette,
    swatch: "#EF2F3F",
  },
  {
    id: "emergency-inheritance",
    label: "Regla de herencia",
    value: "La clínica puede personalizar responsables y flujo",
    options: [
      "La clínica puede personalizar responsables y flujo",
      "La clínica solo personaliza responsables",
      "La política SaaS no se puede modificar",
    ],
    icon: GitBranch,
  },
];

type ResponsibleTone = "violet" | "danger" | "accent";

type Responsible = {
  name: string;
  role: string;
  detail: string;
  badge: string;
  tone: ResponsibleTone;
};

const responsibles: Responsible[] = [
  { name: "AD", role: "Administrador de clínica", detail: "Resumen de evento y auditoría", badge: "Plantilla", tone: "violet" },
  { name: "JG", role: "Jefe de guardia", detail: "Push prioritario", badge: "Crítico", tone: "danger" },
  { name: "RC", role: "Recepción", detail: "Alerta interna inmediata", badge: "Operativo", tone: "accent" },
];

const RESPONSIBLE_TONE: Record<ResponsibleTone, string> = {
  violet: "bg-violet-soft text-violet",
  danger: "bg-danger-soft text-danger",
  accent: "bg-accent-soft text-accent",
};

type FlowStep = {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
  highlighted?: boolean;
};

const flowSteps: FlowStep[] = [
  { step: "1", title: "Activación global", description: "Feature habilitada por plan y clínica.", icon: Zap, highlighted: true },
  { step: "2", title: "Botón visible", description: "Se muestra según rol y configuración local.", icon: Siren },
  { step: "3", title: "Caso creado", description: "Registro inicial en módulo de emergencias.", icon: ClipboardList },
  { step: "4", title: "Notificación", description: "Responsables configurados reciben alerta.", icon: BellRing },
  { step: "5", title: "Auditoría", description: "Evento queda trazado para monitoreo SaaS.", icon: ShieldAlert },
];

function EmergencyStatCard({ stat, index }: { stat: EmergencyStat; index: number }) {
  const Icon = stat.icon;

  return (
    <article
      className="relative min-w-0 overflow-hidden rounded-xl border border-line bg-surface p-3 pl-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)] motion-safe:animate-[fade-up-in_400ms_ease-out_both] sm:p-3.5 sm:pl-4.5"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${STAT_BAR[stat.tone]}`} aria-hidden="true" />
      <div className="flex items-center gap-2.5">
        <span className={`grid size-8 shrink-0 place-items-center rounded-lg sm:size-9 ${STAT_ICON[stat.tone]}`} aria-hidden="true">
          <Icon className="size-3.5 sm:size-4" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-2xs font-bold text-muted">{stat.label}</p>
          <p className="mt-0.5 truncate font-mono text-base font-bold leading-none tracking-[-0.04em] text-ink sm:text-lg">{stat.value}</p>
          <p className="mt-1 truncate text-2xs text-muted">{stat.hint}</p>
        </div>
      </div>
    </article>
  );
}

function GlobalPolicyCard() {
  return (
    <SettingsCard
      title="Política global"
      description="Reglas SaaS para todas las clínicas"
      icon={Radio}
      titleId="global-policy-title"
      action={
        <span className="shrink-0 rounded-full bg-success-soft px-2.5 py-1 text-2xs font-extrabold text-success">Habilitada</span>
      }
    >
      <div className="mt-3 flex items-start gap-3 rounded-lg border border-line bg-surface-subtle p-3">
        <div className="min-w-0 flex-1">
          <p className="text-2xs font-extrabold text-ink sm:text-xs">Permitir botón de emergencia</p>
          <p className="mt-0.5 text-2xs leading-4 text-muted">
            Los administradores de clínica pueden activarlo o desactivarlo.
          </p>
        </div>
        <SettingsToggle label="Permitir botón de emergencia" checked />
      </div>

      <div className="mt-3 grid gap-3">
        {policyFields.map((field) => {
          const Icon = field.icon;

          return (
            <SettingsSelect
              id={field.id}
              key={field.id}
              label={field.label}
              options={field.options}
              value={field.value}
            >
              <span className="pointer-events-none absolute top-1/2 left-3 z-1 flex -translate-y-1/2 items-center" aria-hidden="true">
                {field.swatch ? (
                  <span className="size-4 rounded-full border border-line" style={{ backgroundColor: field.swatch }} />
                ) : (
                  <Icon className="size-4 text-muted" strokeWidth={1.8} />
                )}
              </span>
            </SettingsSelect>
          );
        })}
      </div>

      <SettingsNote>
        Esta vista es para SuperAdministrador SaaS: define la política global. La clínica mantiene su propia configuración operativa.
      </SettingsNote>
    </SettingsCard>
  );
}

function ResponsiblesCard() {
  return (
    <SettingsCard
      title="Responsables predeterminados"
      description="Plantilla inicial para clínicas nuevas"
      icon={Megaphone}
      titleId="responsibles-title"
      action={<EditTemplateButton />}
    >
      <ul className="mt-3 grid gap-2.5">
        {responsibles.map((responsible) => (
          <li
            className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-subtle p-2.5 sm:p-3"
            key={responsible.name}
          >
            <span
              className={`grid size-8 shrink-0 place-items-center rounded-full text-2xs font-extrabold sm:size-9 ${RESPONSIBLE_TONE[responsible.tone]}`}
              aria-hidden="true"
            >
              {responsible.name}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-2xs font-extrabold text-ink sm:text-xs">{responsible.role}</p>
              <p className="mt-0.5 truncate text-2xs text-muted">{responsible.detail}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-2xs font-extrabold ${RESPONSIBLE_TONE[responsible.tone]}`}>
              {responsible.badge}
            </span>
          </li>
        ))}
      </ul>

      <SettingsNote>
        Cada clínica puede sustituir estos responsables sin afectar la plantilla SaaS.
      </SettingsNote>
    </SettingsCard>
  );
}

function RecommendedFlowCard() {
  return (
    <SettingsCard
      title="Flujo SaaS recomendado"
      description="Base que puede adaptarse por clínica"
      icon={Workflow}
      titleId="recommended-flow-title"
    >
      <ol className="mt-3 grid gap-2.5 min-[26rem]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {flowSteps.map((step) => {
          const Icon = step.icon;

          return (
            <li
              className={`min-w-0 rounded-lg border p-3 ${step.highlighted ? "border-danger/30 bg-danger-soft/60" : "border-line bg-surface-subtle"}`}
              key={step.step}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full text-2xs font-extrabold ${step.highlighted ? "bg-danger text-white" : "bg-surface text-muted"}`}
                  aria-hidden="true"
                >
                  {step.step}
                </span>
                <Icon
                  className={`size-3.5 shrink-0 ${step.highlighted ? "text-danger" : "text-muted"}`}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-2xs font-extrabold text-ink sm:text-xs">{step.title}</p>
              <p className="mt-1 text-2xs leading-4 text-muted">{step.description}</p>
            </li>
          );
        })}
      </ol>
    </SettingsCard>
  );
}

export default function EmergencyPage() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <p className="text-2xs font-extrabold tracking-[0.14em] text-danger uppercase">Configuración SaaS</p>

      <div className="mt-1">
        <SettingsPageHeader
          title="Botón de Emergencia"
          description="Configuración global para habilitar la funcionalidad por clínica, definir color base, visibilidad permitida y flujo estándar de atención."
          action={
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <AuditLink href="/audit">Ver auditoría</AuditLink>
              <PublishPolicyButton />
            </div>
          }
        />
      </div>

      <section className="mt-4 grid grid-cols-1 gap-2.5 min-[26rem]:grid-cols-2 sm:gap-3 xl:grid-cols-3" aria-label="Indicadores del botón de emergencia">
        {stats.map((stat, index) => (
          <EmergencyStatCard index={index} key={stat.label} stat={stat} />
        ))}
      </section>

      <div className="mt-3 grid items-start gap-3 sm:mt-4 sm:gap-4 xl:grid-cols-2">
        <GlobalPolicyCard />
        <ResponsiblesCard />
      </div>

      <div className="mt-3 sm:mt-4">
        <RecommendedFlowCard />
      </div>
    </div>
  );
}

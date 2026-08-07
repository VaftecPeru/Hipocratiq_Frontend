import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  Braces,
  Calendar,
  Clock,
  CreditCard,
  FlaskConical,
  Globe,
  Images,
  Info,
  Key,
  Link2,
  Mail,
  MessageCircle,
  MessageSquare,
  RefreshCw,
  Server,
  TriangleAlert,
  Webhook,
} from "lucide-react";
import { CountryFlag, type CountryCode } from "@/shared/ui/country-flag";
import {
  SettingsCard,
  SettingsCardList,
  SettingsPageHeader,
  type SettingsStat,
  SettingsStatCard,
  SettingsStatGrid,
  SettingsTableHead,
  SettingsTableWrap,
} from "@/features/platform/ui/settings-primitives";
import {
  ConfigureIntegrationButton,
  FullHistoryLink,
  IntegrationDetailsButton,
  SaveIntegrationsButton,
  SyncDetailsButton,
} from "@/features/platform/ui/settings-integrations-modals";

export const metadata: Metadata = {
  title: "Integraciones",
};

const stats: SettingsStat[] = [
  { label: "Integraciones activas", value: "8", icon: Link2, tone: "accent" },
  { label: "Pendientes", value: "2", icon: Clock, tone: "warning" },
  { label: "Con errores", value: "1", icon: TriangleAlert, tone: "danger" },
  { label: "Última sincronización", value: "10:30 AM", icon: RefreshCw, tone: "accent" },
];

type IntegrationStatus = "Conectado" | "Activa" | "Pendiente";

type Integration = {
  name: string;
  description: string;
  icon: LucideIcon;
  status: IntegrationStatus;
  action: "configure" | "details";
};

const STATUS_CLASSES: Record<IntegrationStatus, string> = {
  Conectado: "text-success",
  Activa: "text-success",
  Pendiente: "text-warning",
};

const STATUS_DOT: Record<IntegrationStatus, string> = {
  Conectado: "bg-success",
  Activa: "bg-success",
  Pendiente: "bg-warning",
};

const integrations: Integration[] = [
  { name: "Email / SMTP", description: "Envío seguro de correos transaccionales y notificaciones.", icon: Mail, status: "Conectado", action: "configure" },
  { name: "WhatsApp Business", description: "Mensajería oficial para citas, recordatorios y campañas.", icon: MessageCircle, status: "Conectado", action: "configure" },
  { name: "SMS / OTP", description: "Envío de SMS y códigos OTP para verificación.", icon: MessageSquare, status: "Conectado", action: "configure" },
  { name: "Google Calendar", description: "Sincroniza citas y disponibilidad con calendarios.", icon: Calendar, status: "Conectado", action: "details" },
  { name: "Pasarela de Pago", description: "Procesamiento de pagos en línea de forma segura.", icon: CreditCard, status: "Conectado", action: "configure" },
  { name: "API REST", description: "Acceso programático a datos y servicios de MEDIQ.", icon: Braces, status: "Activa", action: "details" },
  { name: "Laboratorio (HL7)", description: "Intercambio de resultados de laboratorio vía estándar HL7.", icon: FlaskConical, status: "Pendiente", action: "configure" },
  { name: "PACS / Imágenes", description: "Interoperabilidad con sistemas PACS para estudios médicos.", icon: Images, status: "Conectado", action: "details" },
];

type SyncRecord = {
  id: string;
  integration: string;
  icon: LucideIcon;
  lastRun: string;
  result: "Éxito" | "Error";
  countryCode: CountryCode;
  region: string;
};

const syncHistory: SyncRecord[] = [
  { id: "sh-1", integration: "Email / SMTP", icon: Mail, lastRun: "24/05/2024 10:30 AM", result: "Éxito", countryCode: "MX", region: "México" },
  { id: "sh-2", integration: "WhatsApp Business", icon: MessageCircle, lastRun: "24/05/2024 10:28 AM", result: "Éxito", countryCode: "PE", region: "Perú" },
  { id: "sh-3", integration: "SMS / OTP", icon: MessageSquare, lastRun: "24/05/2024 10:25 AM", result: "Éxito", countryCode: "MX", region: "México" },
  { id: "sh-4", integration: "Google Calendar", icon: Calendar, lastRun: "24/05/2024 10:15 AM", result: "Éxito", countryCode: "MX", region: "México" },
  { id: "sh-5", integration: "Laboratorio (HL7)", icon: FlaskConical, lastRun: "24/05/2024 09:50 AM", result: "Error", countryCode: "PE", region: "Perú" },
  { id: "sh-6", integration: "PACS / Imágenes", icon: Images, lastRun: "24/05/2024 09:45 AM", result: "Éxito", countryCode: "MX", region: "México" },
];

function ResultBadge({ result }: { result: SyncRecord["result"] }) {
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-2xs font-extrabold ${result === "Éxito" ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>
      {result}
    </span>
  );
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const Icon = integration.icon;

  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-line bg-surface p-3 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)] transition-colors hover:border-accent/50 sm:p-3.5">
      <div className="flex items-start gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent sm:size-9" aria-hidden="true">
          <Icon className="size-3.5 sm:size-4" strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-extrabold text-ink">{integration.name}</h3>
          <p className="mt-1 text-2xs leading-4 text-muted">{integration.description}</p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <span className={`flex items-center gap-1.5 text-2xs font-extrabold ${STATUS_CLASSES[integration.status]}`}>
          <span className={`size-1.5 rounded-full ${STATUS_DOT[integration.status]}`} aria-hidden="true" />
          {integration.status}
        </span>
        {integration.action === "configure" ? (
          <ConfigureIntegrationButton name={integration.name} />
        ) : (
          <IntegrationDetailsButton name={integration.name} />
        )}
      </div>
    </article>
  );
}

function SyncHistoryCard() {
  return (
    <SettingsCard title="Historial de Sincronizaciones" icon={RefreshCw} titleId="history-title">
      <SettingsTableWrap>
        <table className="w-full min-w-2xl border-collapse text-left">
          <caption className="sr-only">Historial de sincronizaciones recientes por integración</caption>
          <SettingsTableHead
            columns={[{ label: "Integración" }, { label: "Última ejecución" }, { label: "Resultado" }, { label: "Región" }, { label: "Acción" }]}
          />
          <tbody className="divide-y divide-line">
            {syncHistory.map((record) => {
              const Icon = record.icon;

              return (
                <tr className="text-xs transition-colors hover:bg-accent-soft/35" key={record.id}>
                  <th className="px-3 py-2.5 font-bold text-ink" scope="row">
                    <span className="flex items-center gap-2">
                      <Icon className="size-3.5 shrink-0 text-accent" strokeWidth={1.8} aria-hidden="true" />
                      {record.integration}
                    </span>
                  </th>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-muted">{record.lastRun}</td>
                  <td className="px-3 py-2.5"><ResultBadge result={record.result} /></td>
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <CountryFlag countryCode={record.countryCode} />
                      <span className="text-muted">{record.region}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <SyncDetailsButton
                      integration={record.integration}
                      lastRun={record.lastRun}
                      result={record.result}
                      region={record.region}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SettingsTableWrap>

      <SettingsCardList>
        {syncHistory.map((record) => {
          const Icon = record.icon;

          return (
            <li className="rounded-lg border border-line bg-surface-subtle p-3" key={record.id}>
              <div className="flex items-start justify-between gap-2">
                <p className="flex min-w-0 items-center gap-2 text-xs font-extrabold text-ink">
                  <Icon className="size-3.5 shrink-0 text-accent" strokeWidth={1.8} aria-hidden="true" />
                  <span className="truncate">{record.integration}</span>
                </p>
                <ResultBadge result={record.result} />
              </div>
              <dl className="mt-2.5 grid grid-cols-2 gap-2.5 border-t border-line pt-2.5 text-2xs">
                <div className="min-w-0">
                  <dt className="text-muted">Última ejecución</dt>
                  <dd className="mt-0.5 font-mono font-bold text-ink">{record.lastRun}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-muted">Región</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 font-bold text-ink"><CountryFlag countryCode={record.countryCode} />{record.region}</dd>
                </div>
              </dl>
              <div className="mt-2 flex justify-end border-t border-line pt-2">
                <SyncDetailsButton
                  integration={record.integration}
                  lastRun={record.lastRun}
                  result={record.result}
                  region={record.region}
                />
              </div>
            </li>
          );
        })}
      </SettingsCardList>

      <FullHistoryLink />
    </SettingsCard>
  );
}

function ConnectionSummaryCard() {
  return (
    <SettingsCard title="Resumen de Conexiones" titleId="connections-title">
      <dl className="mt-3 divide-y divide-line">
        <div className="flex items-start justify-between gap-3 py-2.5">
          <dt className="flex items-center gap-2 text-2xs font-bold text-muted">
            <Webhook className="size-3.5 shrink-0 text-accent" strokeWidth={1.8} aria-hidden="true" />Webhooks
          </dt>
          <dd className="text-right text-2xs font-bold text-ink">6 endpoints configurados y activos</dd>
        </div>
        <div className="flex items-start justify-between gap-3 py-2.5">
          <dt className="flex items-center gap-2 text-2xs font-bold text-muted">
            <Server className="size-3.5 shrink-0 text-accent" strokeWidth={1.8} aria-hidden="true" />Ambiente
          </dt>
          <dd className="text-right text-2xs font-bold text-ink">Producción</dd>
        </div>
        <div className="flex items-start justify-between gap-3 py-2.5">
          <dt className="flex items-center gap-2 text-2xs font-bold text-muted">
            <Key className="size-3.5 shrink-0 text-accent" strokeWidth={1.8} aria-hidden="true" />API Keys activas
          </dt>
          <dd className="text-right text-2xs font-bold text-ink">12 claves activas</dd>
        </div>
        <div className="flex items-start justify-between gap-3 py-2.5">
          <dt className="flex items-center gap-2 text-2xs font-bold text-muted">
            <TriangleAlert className="size-3.5 shrink-0 text-danger" strokeWidth={1.8} aria-hidden="true" />Último error
          </dt>
          <dd className="max-w-48 text-right text-2xs font-bold text-ink">
            Laboratorio (HL7) · 24/05/2024 09:50 AM
            <span className="mt-0.5 block font-medium text-muted">Timeout de conexión con servidor remoto.</span>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 py-2.5">
          <dt className="flex items-center gap-2 text-2xs font-bold text-muted">
            <Globe className="size-3.5 shrink-0 text-accent" strokeWidth={1.8} aria-hidden="true" />Cobertura regional
          </dt>
          <dd className="flex items-center gap-1.5 text-2xs font-bold text-ink">
            México y Perú
            <CountryFlag countryCode="MX" />
            <CountryFlag countryCode="PE" />
          </dd>
        </div>
      </dl>
      <p className="mt-3 flex items-start gap-2 rounded-lg bg-accent-soft/60 p-2.5 text-2xs leading-4 text-muted">
        <Info className="mt-px size-3.5 shrink-0 text-accent" strokeWidth={1.9} aria-hidden="true" />
        Todas las integraciones están cifradas y cumplen con los estándares de seguridad de MEDIQ.
      </p>
    </SettingsCard>
  );
}

export default function IntegrationsPage() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <SettingsPageHeader
        title="Integraciones"
        description="Conecta MEDIQ con servicios externos y sistemas clínicos de México y Perú."
        action={<SaveIntegrationsButton />}
      />

      <SettingsStatGrid label="Resumen de integraciones">
        {stats.map((stat, index) => <SettingsStatCard index={index} key={stat.label} stat={stat} />)}
      </SettingsStatGrid>

      <section className="mt-4 grid gap-2.5 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4" aria-label="Servicios integrados">
        {integrations.map((integration) => <IntegrationCard key={integration.name} integration={integration} />)}
      </section>

      <section className="mt-4 grid gap-3 sm:gap-4 xl:grid-cols-[1fr_22rem]" aria-label="Historial y resumen de conexiones">
        <SyncHistoryCard />
        <ConnectionSummaryCard />
      </section>
    </div>
  );
}

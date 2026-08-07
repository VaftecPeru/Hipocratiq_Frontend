import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpFromLine,
  Bell,
  Building2,
  CheckCircle2,
  CircleCheck,
  Clock,
  Database,
  FileText,
  Mail,
  MessageCircle,
  MessageSquare,
  Send,
  Smartphone,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import {
  SettingsCard,
  SettingsCardList,
  SettingsNote,
  SettingsPageHeader,
  SettingsSelect,
  type SettingsStat,
  SettingsStatCard,
  SettingsStatGrid,
  SettingsTableHead,
  SettingsTableWrap,
  SettingsToggle,
} from "@/features/platform/ui/settings-primitives";
import {
  NotificationsFooterLink,
  RefreshNotificationsButton,
  ViewTemplateButton,
} from "@/features/platform/ui/settings-notifications-modals";

export const metadata: Metadata = {
  title: "Notificaciones",
};

const stats: SettingsStat[] = [
  { label: "Canales activos", value: "4", hint: "De 5 canales disponibles", hintTone: "muted", icon: Mail, tone: "accent" },
  { label: "Envíos hoy", value: "1,248", hint: "+18% vs. ayer (1,056)", hintTone: "success", icon: Send, tone: "success" },
  { label: "Tasa de entrega", value: "98.4%", hint: "Últimas 24 horas", hintTone: "muted", icon: CircleCheck, tone: "violet" },
  { label: "Errores", value: "12", hint: "Últimas 24 horas", hintTone: "muted", icon: TriangleAlert, tone: "warning" },
];

type Channel = { key: string; label: string; description: string; icon: LucideIcon; enabled: boolean };

const channels: Channel[] = [
  { key: "email", label: "Email", description: "Envío por correo electrónico", icon: Mail, enabled: true },
  { key: "whatsapp", label: "WhatsApp", description: "Mensajería vía WhatsApp", icon: MessageCircle, enabled: true },
  { key: "sms", label: "SMS", description: "Mensajes de texto", icon: MessageSquare, enabled: false },
  { key: "push", label: "Push móvil", description: "Notificaciones push en app", icon: Bell, enabled: true },
  { key: "inapp", label: "Notificación in app", description: "Centro de notificaciones", icon: Smartphone, enabled: true },
];

const MATRIX_CHANNELS = [
  { key: "email", label: "Email" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "sms", label: "SMS" },
  { key: "push", label: "Push" },
] as const;

type MatrixChannel = (typeof MATRIX_CHANNELS)[number]["key"];

type EventRow = { label: string; icon: LucideIcon } & Record<MatrixChannel, boolean>;

const eventRows: EventRow[] = [
  { label: "Facturación", icon: FileText, email: true, whatsapp: true, sms: false, push: true },
  { label: "Soporte", icon: MessageSquare, email: true, whatsapp: true, sms: true, push: true },
  { label: "Alertas epidemiológicas", icon: TriangleAlert, email: true, whatsapp: true, sms: false, push: true },
  { label: "Respaldos", icon: Database, email: true, whatsapp: false, sms: false, push: true },
  { label: "Mantenimiento", icon: Wrench, email: true, whatsapp: false, sms: false, push: true },
  { label: "Nuevas clínicas", icon: Building2, email: true, whatsapp: true, sms: false, push: true },
];

type ActivityStatus = "Entregado" | "Pendiente" | "Error";

const ACTIVITY_STATUS: Record<ActivityStatus, { classes: string; icon: LucideIcon }> = {
  Entregado: { classes: "bg-success-soft text-success", icon: CheckCircle2 },
  Pendiente: { classes: "bg-warning-soft text-warning", icon: Clock },
  Error: { classes: "bg-danger-soft text-danger", icon: TriangleAlert },
};

type Activity = {
  id: string;
  date: string;
  event: string;
  channel: string;
  channelIcon: LucideIcon;
  recipient: string;
  status: ActivityStatus;
};

const activity: Activity[] = [
  { id: "ac-1", date: "24/05/2024 09:15 AM", event: "Factura generada", channel: "Email", channelIcon: Mail, recipient: "finanzas@clinicasalud.mx", status: "Entregado" },
  { id: "ac-2", date: "24/05/2024 09:12 AM", event: "Alerta epidemiológica", channel: "WhatsApp", channelIcon: MessageCircle, recipient: "+52 55 1234 5678", status: "Entregado" },
  { id: "ac-3", date: "24/05/2024 08:47 AM", event: "Backup completado", channel: "Push móvil", channelIcon: Bell, recipient: "Admin General", status: "Entregado" },
  { id: "ac-4", date: "24/05/2024 08:45 AM", event: "Nuevo ticket de soporte", channel: "Email", channelIcon: Mail, recipient: "soporte@clinicasalud.mx", status: "Pendiente" },
  { id: "ac-5", date: "24/05/2024 08:20 AM", event: "Mantenimiento programado", channel: "SMS", channelIcon: MessageSquare, recipient: "+52 55 9876 5432", status: "Error" },
];

type Template = { title: string; body: string; icon: LucideIcon; tone: "danger" | "success" | "accent" };

const TEMPLATE_TONE: Record<Template["tone"], string> = {
  danger: "bg-danger-soft text-danger",
  success: "bg-success-soft text-success",
  accent: "bg-accent-soft text-accent",
};

const templates: Template[] = [
  { title: "Alerta epidemiológica", body: "Nueva alerta epidemiológica detectada en su zona.", icon: Bell, tone: "danger" },
  { title: "Factura generada", body: "Su factura #FAC-2024-0058 ha sido generada correctamente.", icon: FileText, tone: "success" },
  { title: "Backup completado", body: "El respaldo programado del sistema se completó con éxito.", icon: ArrowUpFromLine, tone: "accent" },
];

function StatusBadge({ status }: { status: ActivityStatus }) {
  const { classes, icon: Icon } = ACTIVITY_STATUS[status];

  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded px-2 py-0.5 text-2xs font-extrabold ${classes}`}>
      <Icon className="size-3" strokeWidth={2.2} aria-hidden="true" />
      {status}
    </span>
  );
}

function ChannelsCard() {
  return (
    <SettingsCard title="Canales Habilitados" titleId="channels-title">
      <ul className="mt-3 grid gap-2">
        {channels.map((channel) => {
          const Icon = channel.icon;

          return (
            <li className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-subtle p-2.5" key={channel.key}>
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent" aria-hidden="true">
                <Icon className="size-3.5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-2xs font-extrabold text-ink">{channel.label}</p>
                <p className="truncate text-2xs text-muted">{channel.description}</p>
              </div>
              <SettingsToggle label={`Activar canal ${channel.label}`} checked={channel.enabled} />
            </li>
          );
        })}
      </ul>
      <SettingsNote>Los canales deshabilitados no enviarán notificaciones.</SettingsNote>
    </SettingsCard>
  );
}

function EventMatrixCard() {
  return (
    <SettingsCard
      title="Matriz de Eventos"
      description="Define qué eventos activarán notificaciones por cada canal."
      titleId="matrix-title"
    >
      <div className="mt-3 hidden overflow-x-auto sm:block">
        <table className="w-full min-w-md border-collapse text-left">
          <caption className="sr-only">Matriz de eventos por canal de notificación</caption>
          <SettingsTableHead columns={[{ label: "Evento" }, ...MATRIX_CHANNELS.map((channel) => ({ label: channel.label }))]} />
          <tbody className="divide-y divide-line">
            {eventRows.map((row) => {
              const Icon = row.icon;

              return (
                <tr className="text-xs transition-colors hover:bg-accent-soft/35" key={row.label}>
                  <th className="px-3 py-2.5 font-bold text-ink" scope="row">
                    <span className="flex items-center gap-2">
                      <Icon className="size-3.5 shrink-0 text-muted" strokeWidth={1.8} aria-hidden="true" />
                      {row.label}
                    </span>
                  </th>
                  {MATRIX_CHANNELS.map((channel) => (
                    <td className="px-3 py-2.5" key={channel.key}>
                      <input
                        className="size-4 accent-accent"
                        type="checkbox"
                        defaultChecked={row[channel.key]}
                        aria-label={`${row.label} por ${channel.label}`}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="mt-3 grid gap-2.5 sm:hidden">
        {eventRows.map((row) => {
          const Icon = row.icon;

          return (
            <li className="rounded-lg border border-line bg-surface-subtle p-3" key={row.label}>
              <p className="flex items-center gap-2 text-2xs font-extrabold text-ink">
                <Icon className="size-3.5 shrink-0 text-muted" strokeWidth={1.8} aria-hidden="true" />
                {row.label}
              </p>
              <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-line pt-2.5">
                {MATRIX_CHANNELS.map((channel) => (
                  <label className="flex items-center gap-2 text-2xs font-bold text-muted" key={channel.key}>
                    <input className="size-4 shrink-0 accent-accent" type="checkbox" defaultChecked={row[channel.key]} />
                    {channel.label}
                  </label>
                ))}
              </div>
            </li>
          );
        })}
      </ul>

      <SettingsNote>Los cambios en la matriz se aplican a todos los administradores y clínicas activas.</SettingsNote>
    </SettingsCard>
  );
}

function PreferencesCard() {
  return (
    <SettingsCard title="Preferencias Generales" titleId="preferences-title">
      <div className="mt-3 grid gap-3">
        <SettingsSelect id="pref-schedule" label="Horario de envío" value="24 horas (siempre)" options={["24 horas (siempre)", "Horario laboral"]} />
        <SettingsSelect id="pref-digest" label="Frecuencia de resúmenes" value="Diaria" options={["Diaria", "Semanal"]} />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-2xs font-extrabold text-ink">Notificaciones críticas</p>
            <p className="mt-0.5 text-2xs leading-4 text-muted">Enviar siempre, sin importar horario</p>
          </div>
          <SettingsToggle label="Activar notificaciones críticas" checked />
        </div>

        <SettingsSelect id="pref-language" label="Idioma de plantillas" value="Español (México)" options={["Español (México)", "English (US)"]} />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-2xs font-extrabold text-ink">Resúmenes por destinatario</p>
            <p className="mt-0.5 text-2xs leading-4 text-muted">Agrupar eventos similares</p>
          </div>
          <SettingsToggle label="Agrupar resúmenes por destinatario" checked />
        </div>
      </div>

      <SettingsNote>Los cambios de preferencias se aplican de inmediato.</SettingsNote>
    </SettingsCard>
  );
}

function ActivityCard() {
  return (
    <SettingsCard title="Actividad Reciente" description="Últimos eventos de notificación procesados." titleId="activity-title">
      <SettingsTableWrap>
        <table className="w-full min-w-2xl border-collapse text-left">
          <caption className="sr-only">Actividad reciente de notificaciones</caption>
          <SettingsTableHead
            columns={[{ label: "Fecha y Hora" }, { label: "Evento" }, { label: "Canal" }, { label: "Destinatario" }, { label: "Estado" }]}
          />
          <tbody className="divide-y divide-line">
            {activity.map((item) => {
              const ChannelIcon = item.channelIcon;

              return (
                <tr className="text-xs transition-colors hover:bg-accent-soft/35" key={item.id}>
                  <th className="whitespace-nowrap px-3 py-2.5 font-mono font-medium text-muted" scope="row">{item.date}</th>
                  <td className="px-3 py-2.5 font-bold text-ink">{item.event}</td>
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-1.5 text-muted">
                      <ChannelIcon className="size-3.5 shrink-0 text-accent" strokeWidth={1.8} aria-hidden="true" />
                      {item.channel}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-muted">{item.recipient}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={item.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SettingsTableWrap>

      <SettingsCardList>
        {activity.map((item) => {
          const ChannelIcon = item.channelIcon;

          return (
            <li className="rounded-lg border border-line bg-surface-subtle p-3" key={item.id}>
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 truncate text-xs font-extrabold text-ink">{item.event}</p>
                <StatusBadge status={item.status} />
              </div>
              <dl className="mt-2.5 grid gap-2 border-t border-line pt-2.5 text-2xs">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted">Canal</dt>
                  <dd className="flex items-center gap-1.5 font-bold text-ink">
                    <ChannelIcon className="size-3.5 shrink-0 text-accent" strokeWidth={1.8} aria-hidden="true" />
                    {item.channel}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="shrink-0 text-muted">Destinatario</dt>
                  <dd className="min-w-0 truncate font-bold text-ink">{item.recipient}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted">Fecha</dt>
                  <dd className="font-mono font-bold text-ink">{item.date}</dd>
                </div>
              </dl>
            </li>
          );
        })}
      </SettingsCardList>

      <NotificationsFooterLink
        label="Ver todas las actividades"
        title="Todas las actividades"
        description="Historial completo de notificaciones procesadas"
        items={activity.map((item) => `${item.event} · ${item.channel} · ${item.status}`)}
      />
    </SettingsCard>
  );
}

function TemplatesCard() {
  return (
    <SettingsCard title="Vista previa de mensajes" description="Ejemplos de plantillas de notificación." titleId="templates-title">
      <ul className="mt-3 grid gap-2.5">
        {templates.map((template) => {
          const Icon = template.icon;

          return (
            <li className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-subtle p-3" key={template.title}>
              <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${TEMPLATE_TONE[template.tone]}`} aria-hidden="true">
                <Icon className="size-4" strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-2xs font-extrabold text-ink">{template.title}</p>
                <p className="mt-0.5 text-2xs leading-4 text-muted">{template.body}</p>
              </div>
              <ViewTemplateButton title={template.title} body={template.body} />
            </li>
          );
        })}
      </ul>

      <NotificationsFooterLink
        label="Gestionar plantillas"
        title="Gestionar plantillas"
        description="Todas las plantillas de notificación disponibles"
        items={templates.map((template) => `${template.title} · ${template.body.substring(0, 40)}...`)}
      />
    </SettingsCard>
  );
}

export default function NotificationsPage() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <SettingsPageHeader
        title="Notificaciones"
        description="Configura canales, eventos y reglas de notificación para administradores y clínicas."
        action={<RefreshNotificationsButton />}
      />

      <SettingsStatGrid label="Resumen de notificaciones">
        {stats.map((stat, index) => <SettingsStatCard index={index} key={stat.label} stat={stat} />)}
      </SettingsStatGrid>

      <section className="mt-4 grid gap-3 sm:gap-4 xl:grid-cols-[0.85fr_1.2fr_0.95fr]" aria-label="Canales, eventos y preferencias">
        <ChannelsCard />
        <EventMatrixCard />
        <PreferencesCard />
      </section>

      <section className="mt-4 grid gap-3 sm:gap-4 xl:grid-cols-[1.35fr_1fr]" aria-label="Actividad y plantillas">
        <ActivityCard />
        <TemplatesCard />
      </section>
    </div>
  );
}

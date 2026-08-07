import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  CalendarClock,
  CircleCheck,
  Clock,
  Cloud,
  Database,
  FileText,
  Folder,
  Globe,
  History,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { CountryFlag, type CountryCode } from "@/shared/ui/country-flag";
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
  DownloadBackupButton,
  FullBackupHistoryLink,
  RecoveryActionButton,
  RefreshBackupsButton,
  ViewBackupButton,
} from "@/features/platform/ui/settings-backups-modals";

export const metadata: Metadata = {
  title: "Respaldos",
};

const stats: SettingsStat[] = [
  { label: "Último respaldo", value: "Hoy 02:00 AM", hint: "Automático", icon: History, tone: "accent" },
  { label: "Frecuencia", value: "Diaria", hint: "Cada 24 horas", icon: Calendar, tone: "accent" },
  { label: "Éxito", value: "99.8%", hint: "Últimos 30 días", icon: ShieldCheck, tone: "success" },
  { label: "Restauraciones", value: "2", hint: "Últimos 30 días", icon: Database, tone: "violet" },
];

type PolicyField = { id: string; label: string; value: string; options: string[]; valueClassName?: string };

const policyFields: PolicyField[] = [
  { id: "policy-frequency", label: "Frecuencia", value: "Diaria", options: ["Diaria", "Semanal", "Cada 12 horas"] },
  { id: "policy-retention", label: "Retención", value: "30 días", options: ["30 días", "60 días", "90 días"] },
  { id: "policy-compression", label: "Compresión", value: "Activada", options: ["Activada", "Desactivada"], valueClassName: "text-success" },
  { id: "policy-encryption", label: "Encriptación", value: "AES-256", options: ["AES-256", "AES-128"], valueClassName: "text-accent" },
  { id: "policy-region", label: "Región de almacenamiento", value: "Automática (MX y PE)", options: ["Automática (MX y PE)", "Solo México", "Solo Perú"] },
];

type BackupType = "Respaldo automático" | "Respaldo de base de datos" | "Respaldo manual" | "Respaldo de archivos" | "Respaldo de logs";

const BACKUP_ICON: Record<BackupType, LucideIcon> = {
  "Respaldo automático": Clock,
  "Respaldo de base de datos": Database,
  "Respaldo manual": Folder,
  "Respaldo de archivos": Folder,
  "Respaldo de logs": FileText,
};

type BackupRecord = {
  id: string;
  time: string;
  date: string;
  type: BackupType;
  scope: string;
  size: string;
  countryCode: CountryCode;
  region: string;
};

const backupHistory: BackupRecord[] = [
  { id: "bk-1", time: "Hoy 02:00 AM", date: "19 may 2024", type: "Respaldo automático", scope: "Completo", size: "48.7 GB", countryCode: "MX", region: "México" },
  { id: "bk-2", time: "Ayer 02:00 AM", date: "18 may 2024", type: "Respaldo automático", scope: "Completo", size: "47.9 GB", countryCode: "PE", region: "Perú" },
  { id: "bk-3", time: "17 may 02:00 AM", date: "17 may 2024", type: "Respaldo de base de datos", scope: "BD Principal", size: "22.1 GB", countryCode: "MX", region: "México" },
  { id: "bk-4", time: "16 may 11:35 AM", date: "16 may 2024", type: "Respaldo manual", scope: "Completo", size: "46.2 GB", countryCode: "MX", region: "México" },
  { id: "bk-5", time: "16 may 02:00 AM", date: "16 may 2024", type: "Respaldo de archivos", scope: "Archivos clínicos", size: "18.4 GB", countryCode: "PE", region: "Perú" },
  { id: "bk-6", time: "15 may 02:00 AM", date: "15 may 2024", type: "Respaldo de logs", scope: "Logs del sistema", size: "2.3 GB", countryCode: "MX", region: "México" },
];

type RecoveryAction = { label: string; description: string; icon: LucideIcon };

const recoveryActions: RecoveryAction[] = [
  { label: "Restaurar base de datos", description: "Restaura la base de datos principal", icon: Database },
  { label: "Restaurar archivos", description: "Restaura archivos y documentos", icon: Folder },
  { label: "Validar integridad", description: "Verifica la integridad de los respaldos", icon: ShieldCheck },
];

type StorageBucket = { label: string; used: string; total: string; percent: number };

const storageBuckets: StorageBucket[] = [
  { label: "Base de datos", used: "220 GB", total: "500 GB", percent: 44 },
  { label: "Archivos clínicos", used: "310 GB", total: "1 TB", percent: 31 },
  { label: "Imágenes", used: "180 GB", total: "500 GB", percent: 36 },
  { label: "Logs", used: "25 GB", total: "100 GB", percent: 25 },
];

function SuccessBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 text-2xs font-extrabold text-success">
      <CircleCheck className="size-3.5" strokeWidth={2} aria-hidden="true" />Exitoso
    </span>
  );
}

function RecordActions({ record }: { record: BackupRecord }) {
  return (
    <span className="flex items-center gap-1">
      <ViewBackupButton record={record} />
      <DownloadBackupButton record={record} />
    </span>
  );
}

function PolicyCard() {
  return (
    <SettingsCard title="Política de Respaldo" titleId="policy-title">
      <div className="mt-3 grid items-end gap-3 min-[26rem]:grid-cols-2 xl:grid-cols-6">
        {policyFields.map((field) => (
          <SettingsSelect
            id={field.id}
            key={field.id}
            label={field.label}
            options={field.options}
            value={field.value}
            valueClassName={field.valueClassName}
          />
        ))}

        <div className="grid gap-1.5">
          <span className="text-2xs font-bold leading-4 text-muted">Respaldos automáticos</span>
          <div className="flex h-9 items-center">
            <SettingsToggle label="Activar respaldos automáticos" checked />
          </div>
        </div>
      </div>

      <SettingsNote>Las copias de seguridad se ejecutan diariamente a las 02:00 AM (GMT-06:00/CDMX).</SettingsNote>
    </SettingsCard>
  );
}

function HistoryCard() {
  return (
    <SettingsCard title="Historial de Respaldos" titleId="history-title">
      <SettingsTableWrap>
        <table className="w-full min-w-3xl border-collapse text-left">
          <caption className="sr-only">Historial de respaldos ejecutados</caption>
          <SettingsTableHead
            columns={[{ label: "Fecha/Hora" }, { label: "Tipo" }, { label: "Tamaño" }, { label: "Estado" }, { label: "Región" }, { label: "Acciones" }]}
          />
          <tbody className="divide-y divide-line">
            {backupHistory.map((record) => {
              const Icon = BACKUP_ICON[record.type];

              return (
                <tr className="text-xs transition-colors hover:bg-accent-soft/35" key={record.id}>
                  <th className="px-3 py-2.5 font-bold text-ink" scope="row">
                    {record.time}
                    <span className="mt-0.5 block text-2xs font-medium text-muted">{record.date}</span>
                  </th>
                  <td className="px-3 py-2.5">
                    <span className="flex items-start gap-2">
                      <Icon className="mt-0.5 size-3.5 shrink-0 text-accent" strokeWidth={1.8} aria-hidden="true" />
                      <span>
                        <span className="block font-bold text-ink">{record.type}</span>
                        <span className="mt-0.5 block text-2xs text-muted">{record.scope}</span>
                      </span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-muted">{record.size}</td>
                  <td className="px-3 py-2.5"><SuccessBadge /></td>
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <CountryFlag countryCode={record.countryCode} />
                      <span className="text-muted">{record.region}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5"><RecordActions record={record} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SettingsTableWrap>

      <SettingsCardList>
        {backupHistory.map((record) => {
          const Icon = BACKUP_ICON[record.type];

          return (
            <li className="rounded-lg border border-line bg-surface-subtle p-3" key={record.id}>
              <div className="flex items-start justify-between gap-2">
                <p className="flex min-w-0 items-start gap-2 text-xs font-extrabold text-ink">
                  <Icon className="mt-0.5 size-3.5 shrink-0 text-accent" strokeWidth={1.8} aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate">{record.type}</span>
                    <span className="mt-0.5 block text-2xs font-medium text-muted">{record.scope}</span>
                  </span>
                </p>
                <SuccessBadge />
              </div>
              <dl className="mt-2.5 grid grid-cols-2 gap-2.5 border-t border-line pt-2.5 text-2xs">
                <div className="min-w-0">
                  <dt className="text-muted">Fecha/Hora</dt>
                  <dd className="mt-0.5 font-bold text-ink">{record.time}<span className="mt-0.5 block font-medium text-muted">{record.date}</span></dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-muted">Tamaño</dt>
                  <dd className="mt-0.5 font-mono font-bold text-ink">{record.size}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-muted">Región</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 font-bold text-ink"><CountryFlag countryCode={record.countryCode} />{record.region}</dd>
                </div>
              </dl>
              <div className="mt-2 flex justify-end border-t border-line pt-2"><RecordActions record={record} /></div>
            </li>
          );
        })}
      </SettingsCardList>

      <FullBackupHistoryLink />
    </SettingsCard>
  );
}

function RecoveryCard() {
  return (
    <SettingsCard title="Recuperación" description="Restaura datos de respaldos disponibles." titleId="recovery-title">
      <ul className="mt-3 grid gap-2">
        {recoveryActions.map((action) => {
          const Icon = action.icon;

          return (
            <li key={action.label}>
              <RecoveryActionButton label={action.label} description={action.description} icon={<Icon className="size-4" strokeWidth={1.8} />} />
            </li>
          );
        })}
      </ul>

      <SettingsNote>Algunas operaciones pueden requerir aprobación antes de ejecutarse.</SettingsNote>
    </SettingsCard>
  );
}

function StorageCard() {
  return (
    <SettingsCard title="Uso de Almacenamiento" titleId="storage-title">
      <dl className="mt-3 grid gap-2.5">
        {storageBuckets.map((bucket) => (
          <div className="grid gap-1.5" key={bucket.label}>
            <div className="flex items-center justify-between gap-3">
              <dt className="min-w-0 truncate text-2xs font-bold text-muted">{bucket.label}</dt>
              <dd className="shrink-0 font-mono text-2xs font-bold text-ink">{bucket.used} <span className="font-medium text-muted">/ {bucket.total}</span></dd>
            </div>
            <span className="block h-1.5 w-full overflow-hidden rounded-full bg-line" aria-hidden="true">
              <span className="block h-full rounded-full bg-accent" style={{ width: `${bucket.percent}%` }} />
            </span>
          </div>
        ))}
      </dl>
    </SettingsCard>
  );
}

function StorageSummaryCard() {
  return (
    <article className="min-w-0 rounded-xl border border-line bg-surface p-3 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)] sm:p-4" aria-label="Resumen de almacenamiento y validación">
      <dl className="divide-y divide-line">
        <div className="flex items-center justify-between gap-3 pb-2.5">
          <dt className="flex items-center gap-2 text-2xs font-bold text-muted">
            <CalendarClock className="size-3.5 shrink-0 text-accent" strokeWidth={1.8} aria-hidden="true" />Próximo backup
          </dt>
          <dd className="text-right text-2xs font-extrabold text-ink">Mañana 02:00 AM (GMT-06:00)</dd>
        </div>
        <div className="flex items-center justify-between gap-3 py-2.5">
          <dt className="flex items-center gap-2 text-2xs font-bold text-muted">
            <Cloud className="size-3.5 shrink-0 text-accent" strokeWidth={1.8} aria-hidden="true" />Proveedor
          </dt>
          <dd className="flex items-center gap-1.5 text-2xs font-extrabold text-ink">
            aws<span className="rounded bg-warning-soft px-1.5 py-0.5 font-mono text-2xs font-extrabold text-warning">S3</span>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 py-2.5">
          <dt className="flex items-center gap-2 text-2xs font-bold text-muted">
            <Globe className="size-3.5 shrink-0 text-accent" strokeWidth={1.8} aria-hidden="true" />Cobertura
          </dt>
          <dd className="flex items-center gap-1.5 text-2xs font-extrabold text-ink">
            México y Perú
            <CountryFlag countryCode="MX" />
            <CountryFlag countryCode="PE" />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 pt-2.5">
          <dt className="flex items-center gap-2 text-2xs font-bold text-muted">
            <Shield className="size-3.5 shrink-0 text-accent" strokeWidth={1.8} aria-hidden="true" />Última validación
          </dt>
          <dd className="flex items-center gap-2 text-2xs font-extrabold text-ink">
            Hoy 01:45 AM
            <span className="rounded-full bg-success-soft px-2 py-0.5 text-2xs font-extrabold text-success">Válida</span>
          </dd>
        </div>
      </dl>
    </article>
  );
}

export default function BackupsPage() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <SettingsPageHeader
        title="Respaldos"
        description="Gestiona políticas, copias de seguridad y recuperación de datos para MEDIQ."
        action={<RefreshBackupsButton />}
      />

      <SettingsStatGrid label="Resumen de respaldos">
        {stats.map((stat, index) => <SettingsStatCard index={index} key={stat.label} stat={stat} />)}
      </SettingsStatGrid>

      <section className="mt-4 grid gap-3 sm:gap-4 xl:grid-cols-[1fr_22rem]" aria-label="Política, historial y recuperación">
        <div className="grid min-w-0 content-start gap-3 sm:gap-4">
          <PolicyCard />
          <HistoryCard />
        </div>
        <div className="grid min-w-0 content-start gap-3 sm:gap-4">
          <RecoveryCard />
          <StorageCard />
          <StorageSummaryCard />
        </div>
      </section>
    </div>
  );
}

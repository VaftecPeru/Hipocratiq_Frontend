import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bell,
  Calendar,
  Clock,
  Code2,
  Database,
  Globe,
  HardDrive,
  Headphones,
  Languages,
  LayoutTemplate,
  Lock,
  LogIn,
  Plug,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { CountryFlag, type CountryCode } from "@/shared/ui/country-flag";
import { BrandLogo } from "@/shared/ui/brand-logo";
import {
  SettingsCard,
  SettingsInput,
  SettingsPageHeader,
  SettingsSelect,
  SettingsToggle,
} from "@/features/platform/ui/settings-primitives";
import {
  ChangeAssetButton,
  ChangePhotoButton,
  EditSecurityButton,
  SaveParametersButton,
} from "@/features/platform/ui/settings-general-modals";

export const metadata: Metadata = {
  title: "Configuración General",
};

type BrandingAsset = {
  title: string;
  description: string;
  preview: "logo" | "favicon" | "wordmark";
};

const brandingAssets: BrandingAsset[] = [
  { title: "Logo de MEDIQ", description: "Logo principal mostrado en la plataforma.", preview: "logo" },
  { title: "Favicon", description: "Ícono del navegador (32x32px).", preview: "favicon" },
  { title: "Logo de inicio de sesión", description: "Logo mostrado en la pantalla de autenticación.", preview: "wordmark" },
];

type SystemField = { id: string; label: string; value: string; type: "text" | "select"; options?: string[] };

const systemFields: SystemField[] = [
  { id: "system-name", label: "Nombre de la Plataforma", value: "MEDIQ", type: "text" },
  { id: "system-domain", label: "Dominio Principal", value: "app.mediq.com", type: "text" },
  { id: "system-support-url", label: "URL de Soporte", value: "soporte.mediq.com", type: "text" },
  { id: "system-support-email", label: "Email de Soporte", value: "soporte@mediq.com", type: "text" },
  { id: "system-currency", label: "Moneda Predeterminada", value: "USD - Dólar Americano", type: "select", options: ["USD - Dólar Americano", "MXN - Peso Mexicano", "PEN - Sol Peruano"] },
  { id: "system-timezone", label: "Zona Horaria Predeterminada", value: "(GMT-06:00) Ciudad de México", type: "select", options: ["(GMT-06:00) Ciudad de México", "(GMT-05:00) Lima"] },
  { id: "system-date", label: "Formato de Fecha", value: "DD/MM/YYYY", type: "select", options: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] },
  { id: "system-time", label: "Formato de Hora", value: "24 horas (13:00)", type: "select", options: ["24 horas (13:00)", "12 horas (1:00 PM)"] },
];

type AvailableCountry = { countryCode: CountryCode; name: string };

const availableCountries: AvailableCountry[] = [
  { countryCode: "MX", name: "México" },
  { countryCode: "US", name: "USA" },
];

type SecurityRow = {
  title: string;
  description: string;
  icon: LucideIcon;
  badge: string;
  tone: "success" | "accent";
};

const securityRows: SecurityRow[] = [
  { title: "Política de Contraseñas", description: "Requiere contraseñas fuertes", icon: Lock, badge: "Activa", tone: "success" },
  { title: "Autenticación de Dos Factores (2FA)", description: "Obligatoria para administradores", icon: ShieldCheck, badge: "Activa", tone: "success" },
  { title: "Sesión de Inactividad", description: "Cierre automático tras 30 minutos", icon: Clock, badge: "30 min", tone: "accent" },
  { title: "Intentos de inicio de sesión", description: "Bloqueo tras 5 intentos fallidos", icon: LogIn, badge: "5 intentos", tone: "accent" },
  { title: "IPs Permitidas para Acceso Admin", description: "Restricción por lista blanca", icon: Globe, badge: "3 IPs", tone: "accent" },
];

type QuickModule = { label: string; description: string; icon: LucideIcon; href: string; available: boolean };

const quickModules: QuickModule[] = [
  { label: "Idiomas y Región", description: "Gestiona idiomas y formatos regionales", icon: Languages, href: "/settings/languages", available: true },
  { label: "Integraciones", description: "Conecta servicios y sistemas externos", icon: Plug, href: "/settings/integrations", available: true },
  { label: "IA Epidemiológica", description: "Configura modelos y analítica predictiva", icon: Sparkles, href: "/settings/ai", available: true },
  { label: "Notificaciones", description: "Configura canales y alertas automáticas", icon: Bell, href: "/settings/notifications", available: true },
  { label: "Respaldos", description: "Gestiona copias de seguridad y retención", icon: Database, href: "/settings/backups", available: true },
  { label: "Soporte", description: "Opciones y canales de soporte técnico", icon: Headphones, href: "/support", available: true },
];

type SystemInfo = { label: string; value: string; icon: LucideIcon; unit?: string; usage?: number };

const systemInfo: SystemInfo[] = [
  { label: "Versión Actual", value: "v3.2.1", icon: Code2 },
  { label: "Ambiente", value: "Producción", icon: LayoutTemplate },
  { label: "Uptime", value: "99.98%", icon: Activity },
  { label: "Almacenamiento Usado", value: "2.48 TB", unit: "/ 10 TB", usage: 24.8, icon: HardDrive },
  { label: "Próximo Backup", value: "Hoy 02:00 AM", icon: Calendar },
];

function AssetPreview({ preview }: { preview: BrandingAsset["preview"] }) {
  if (preview === "wordmark") {
    return <span className="text-sm font-extrabold tracking-[-0.02em] text-accent">MEDIQ</span>;
  }

  return <BrandLogo className={preview === "favicon" ? "h-6 w-7" : "h-8 w-9"} />;
}

function BrandingCard() {
  return (
    <SettingsCard title="Branding de la Plataforma" titleId="branding-title">
      <ul className="mt-3 grid gap-2.5">
        {brandingAssets.map((asset) => (
          <li className="flex items-center gap-3 rounded-lg border border-line bg-surface-subtle p-2.5" key={asset.title}>
            <span className="grid size-12 shrink-0 place-items-center rounded-lg border border-line bg-surface" aria-hidden="true">
              <AssetPreview preview={asset.preview} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-2xs font-extrabold text-ink sm:text-xs">{asset.title}</p>
              <p className="mt-0.5 text-2xs leading-4 text-muted">{asset.description}</p>
            </div>
            <ChangeAssetButton title={asset.title} />
          </li>
        ))}
      </ul>
    </SettingsCard>
  );
}

function SystemParametersCard() {
  return (
    <SettingsCard title="Parámetros del Sistema" titleId="parameters-title">
      <div className="mt-3 grid gap-3">
        {systemFields.map((field) =>
          field.type === "text" ? (
            <SettingsInput id={field.id} key={field.id} label={field.label} value={field.value} />
          ) : (
            <SettingsSelect id={field.id} key={field.id} label={field.label} options={field.options ?? [field.value]} value={field.value} />
          ),
        )}
      </div>
      <div className="mt-3.5">
        <SaveParametersButton />
      </div>
    </SettingsCard>
  );
}

function CountriesCard() {
  return (
    <SettingsCard
      title="Países y Región Predeterminada"
      description="Selecciona los países disponibles en la plataforma."
      titleId="countries-title"
    >
      <fieldset className="mt-3 grid gap-2.5">
        <legend className="sr-only">Países disponibles</legend>
        {availableCountries.map((country) => (
          <label className="flex cursor-pointer items-center gap-2.5 text-xs font-bold text-ink" key={country.countryCode}>
            <input className="size-4 shrink-0 accent-accent" defaultChecked type="checkbox" />
            <CountryFlag countryCode={country.countryCode} />
            {country.name}
          </label>
        ))}
      </fieldset>

      <div className="mt-4 grid gap-3">
        <SettingsSelect id="default-country" label="País Predeterminado" value="México" options={["México", "USA", "Perú"]} />
        <SettingsSelect id="default-region" label="Región Predeterminada" value="América" options={["América", "Europa", "Asia"]} />
      </div>
    </SettingsCard>
  );
}

function SecurityCard() {
  return (
    <SettingsCard title="Seguridad Rápida" titleId="security-title">
      <ul className="mt-3 grid gap-2">
        {securityRows.map((row) => {
          const Icon = row.icon;

          return (
            <li className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-subtle p-2.5" key={row.title}>
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent" aria-hidden="true">
                <Icon className="size-3.5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-2xs font-extrabold text-ink">{row.title}</p>
                <p className="mt-0.5 text-2xs leading-4 text-muted">{row.description}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-2xs font-extrabold ${row.tone === "success" ? "bg-success-soft text-success" : "bg-accent-soft text-accent"}`}>
                {row.badge}
              </span>
              <EditSecurityButton title={row.title} description={row.description} />
            </li>
          );
        })}
      </ul>
    </SettingsCard>
  );
}

function QuickModulesCard() {
  return (
    <SettingsCard title="Accesos Rápidos a Módulos de Configuración" titleId="modules-title">
      <ul className="mt-3 grid gap-2.5 min-[26rem]:grid-cols-2 xl:grid-cols-3">
        {quickModules.map((module) => {
          const Icon = module.icon;
          const body = (
            <>
              <span className="flex items-center gap-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent" aria-hidden="true">
                  <Icon className="size-3.5" strokeWidth={1.8} />
                </span>
                <span className="min-w-0 truncate text-2xs font-extrabold text-ink">{module.label}</span>
              </span>
              <span className="mt-2 block text-2xs leading-4 text-muted">{module.description}</span>
              <span className="mt-2 block text-2xs font-bold text-accent" aria-hidden="true">→</span>
            </>
          );

          return (
            <li key={module.href}>
              {module.available ? (
                <Link
                  className="block h-full rounded-lg border border-line bg-surface p-3 transition-colors hover:border-accent/60 hover:bg-accent-soft/35 focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-focus"
                  href={module.href}
                >
                  {body}
                </Link>
              ) : (
                <span className="block h-full cursor-not-allowed rounded-lg border border-line bg-surface p-3 opacity-60" aria-disabled="true" title="Disponible próximamente">
                  {body}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </SettingsCard>
  );
}

function MaintenanceCard() {
  return (
    <SettingsCard
      title="Modo Mantenimiento"
      description="Activa el modo mantenimiento para que solo los administradores puedan acceder a la plataforma."
      titleId="maintenance-title"
      action={<SettingsToggle label="Activar modo mantenimiento" checked={false} />}
    >
      <div className="mt-3 grid gap-3 min-[26rem]:grid-cols-[8rem_1fr]">
        <div className="grid place-items-center gap-2 rounded-lg border border-line bg-surface-subtle p-3">
          <span className="font-display text-2xl font-bold text-accent" aria-hidden="true">A</span>
          <span className="text-center text-2xs font-extrabold text-ink">En Mantenimiento</span>
          <span className="h-1.5 w-16 rounded-full bg-line" aria-hidden="true" />
        </div>
        <div className="grid min-w-0 gap-1.5">
          <label className="text-2xs font-bold text-muted" htmlFor="maintenance-message">Mensaje mostrado a los usuarios</label>
          <textarea
            className="min-h-24 w-full resize-none rounded-lg border border-line bg-surface-input p-2.5 text-2xs leading-4 text-ink outline-none transition-colors focus:border-accent focus:bg-surface focus:ring-3 focus:ring-focus/40"
            id="maintenance-message"
            maxLength={250}
            defaultValue="MEDIQ se encuentra en mantenimiento programado. Gracias por tu comprensión."
          />
          <p className="text-right text-2xs text-muted">Caracteres: 77 / 250</p>
        </div>
      </div>
    </SettingsCard>
  );
}

function SystemInfoCard() {
  return (
    <SettingsCard title="Información del Sistema" titleId="system-info-title">
      <dl className="mt-3 grid gap-2.5 min-[26rem]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {systemInfo.map((info) => {
          const Icon = info.icon;

          return (
            <div className="min-w-0 rounded-lg border border-line bg-surface-subtle p-3" key={info.label}>
              <dt className="flex items-center gap-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent" aria-hidden="true">
                  <Icon className="size-3.5" strokeWidth={1.8} />
                </span>
                <span className="truncate text-2xs font-bold text-muted">{info.label}</span>
              </dt>
              <dd className="mt-2">
                <span className="font-mono text-sm font-bold tracking-[-0.03em] text-ink sm:text-base">{info.value}</span>
                {info.unit ? <span className="ml-1 text-2xs font-bold text-muted">{info.unit}</span> : null}
                {info.usage !== undefined ? (
                  <span className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-line" aria-hidden="true">
                    <span className="block h-full rounded-full bg-accent" style={{ width: `${info.usage}%` }} />
                  </span>
                ) : null}
              </dd>
            </div>
          );
        })}
      </dl>
    </SettingsCard>
  );
}

export default function GeneralSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <SettingsPageHeader
        title="Configuración General"
        description="Administra los parámetros generales de la plataforma MEDIQ."
        action={<ChangePhotoButton />}
      />

      <div className="mt-4 grid gap-3 sm:gap-4 xl:grid-cols-3">
        <BrandingCard />
        <SystemParametersCard />
        <CountriesCard />
        <SecurityCard />
        <QuickModulesCard />
        <MaintenanceCard />
      </div>

      <div className="mt-3 sm:mt-4">
        <SystemInfoCard />
      </div>
    </div>
  );
}

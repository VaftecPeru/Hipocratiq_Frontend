import type { Metadata } from "next";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Clock4,
  Globe,
  GripVertical,
  Languages,
  Map,
  SquarePen,
} from "lucide-react";
import { CountryFlag, type CountryCode } from "@/shared/ui/country-flag";
import {
  SettingsCard,
  SettingsCardList,
  SettingsNote,
  SettingsPageHeader,
  SettingsSelect,
  SettingsTableHead,
  SettingsTableWrap,
} from "@/features/platform/ui/settings-primitives";
import {
  AddLanguageButton,
  DeleteLanguageButton,
  EditLanguageButton,
  SaveLanguagesButton,
} from "@/features/platform/ui/settings-languages-modals";

export const metadata: Metadata = {
  title: "Idiomas y Región",
};

type ConfiguredLanguage = {
  code: string;
  name: string;
  countryCode: CountryCode;
  isDefault: boolean;
};

const configuredLanguages: ConfiguredLanguage[] = [
  { code: "es-MX", name: "Español (México)", countryCode: "MX", isDefault: true },
  { code: "en-US", name: "English (US)", countryCode: "US", isDefault: false },
];

type SummaryRow = { label: string; value: string; icon: typeof Globe };

const summaryRows: SummaryRow[] = [
  { label: "Idioma Predeterminado", value: "Español (México)", icon: Globe },
  { label: "País / Región", value: "México / América", icon: Map },
  { label: "Zona Horaria", value: "(GMT-06:00) Ciudad de México", icon: Clock },
  { label: "Formato de Fecha", value: "DD/MM/YYYY", icon: Calendar },
  { label: "Formato de Hora", value: "24 horas (13:00)", icon: Clock4 },
];

function DefaultMarker({ isDefault }: { isDefault: boolean }) {
  return isDefault ? (
    <span className="inline-flex items-center rounded-full bg-success-soft px-2 py-0.5 text-2xs font-extrabold text-success">Predeterminado</span>
  ) : (
    <span className="inline-block size-3.5 rounded-full border-2 border-line align-middle" aria-hidden="true" />
  );
}

function RowActions({ language }: { language: ConfiguredLanguage }) {
  return (
    <span className="flex items-center justify-end gap-1">
      <EditLanguageButton language={language} />
      {language.isDefault ? null : <DeleteLanguageButton language={language} />}
    </span>
  );
}

function LanguagesTable() {
  return (
    <>
      <SettingsTableWrap>
        <table className="w-full min-w-md border-collapse text-left">
          <caption className="sr-only">Idiomas configurados en la plataforma</caption>
          <SettingsTableHead
            columns={[{ label: "Idioma" }, { label: "Código" }, { label: "Predeterminado" }, { label: "Acciones", srOnly: true, align: "right" }]}
          />
          <tbody className="divide-y divide-line">
            {configuredLanguages.map((language) => (
              <tr className="text-xs transition-colors hover:bg-accent-soft/35" key={language.code}>
                <th className="px-3 py-2.5 font-bold text-ink" scope="row">
                  <span className="flex items-center gap-2">
                    <GripVertical className="size-3.5 shrink-0 cursor-grab text-muted" strokeWidth={1.8} aria-hidden="true" />
                    <CountryFlag countryCode={language.countryCode} />
                    {language.name}
                  </span>
                </th>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-muted">{language.code}</td>
                <td className="px-3 py-2.5"><DefaultMarker isDefault={language.isDefault} /></td>
                <td className="px-3 py-2.5"><RowActions language={language} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </SettingsTableWrap>

      <SettingsCardList>
        {configuredLanguages.map((language) => (
          <li className="rounded-lg border border-line bg-surface-subtle p-3" key={language.code}>
            <div className="flex items-start justify-between gap-2">
              <p className="flex min-w-0 items-center gap-2 text-xs font-extrabold text-ink">
                <CountryFlag countryCode={language.countryCode} />
                <span className="truncate">{language.name}</span>
              </p>
              <DefaultMarker isDefault={language.isDefault} />
            </div>
            <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line pt-2.5">
              <span className="text-2xs text-muted">Código <span className="font-mono font-bold text-ink">{language.code}</span></span>
              <RowActions language={language} />
            </div>
          </li>
        ))}
      </SettingsCardList>
    </>
  );
}

function LanguageSection() {
  return (
    <SettingsCard
      title="Idioma"
      description="Gestiona los idiomas disponibles en la plataforma y el predeterminado para los usuarios."
      icon={Languages}
      titleId="language-title"
      action={<AddLanguageButton />}
    >
      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_18rem] lg:gap-4">
        <div className="min-w-0 rounded-lg border border-line p-3">
          <h3 className="text-2xs font-extrabold text-ink">Idiomas Configurados</h3>
          <LanguagesTable />
          <SettingsNote>El idioma predeterminado se aplicará a todos los usuarios nuevos y reemplazará el idioma del sistema.</SettingsNote>
        </div>

        <div className="min-w-0 rounded-lg border border-line p-3">
          <h3 className="text-2xs font-extrabold text-ink">Idioma Predeterminado</h3>
          <div className="mt-2.5">
            <SettingsSelect id="current-language" label="Idioma actual" value="Español (México)" options={["Español (México)", "English (US)"]} />
          </div>
          <p className="mt-2.5 text-2xs leading-4 text-muted">
            Este idioma se aplicará a todos los usuarios, a menos que cada uno configure el suyo.
          </p>
        </div>
      </div>
    </SettingsCard>
  );
}

function RegionSection() {
  return (
    <SettingsCard title="Región" description="Configura la región predeterminada para la plataforma." icon={Globe} titleId="region-title">
      <div className="mt-3 grid gap-3">
        <SettingsSelect id="region-country" label="País Predeterminado" value="México" options={["México", "Perú", "USA"]}>
          <CountryFlag countryCode="MX" className="pointer-events-none absolute top-1/2 left-3 z-1 h-3.5 w-5 -translate-y-1/2 rounded-xs" />
        </SettingsSelect>
        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsSelect id="region-default" label="Región Predeterminada" value="América" options={["América", "Europa", "Asia"]} />
          <SettingsSelect id="region-timezone" label="Zona Horaria Predeterminada" value="(GMT-06:00) Ciudad de México" options={["(GMT-06:00) Ciudad de México", "(GMT-05:00) Lima"]} />
        </div>
      </div>
      <SettingsNote>Esta configuración afectará la moneda, numeración, zona horaria y normativas aplicables.</SettingsNote>
    </SettingsCard>
  );
}

function SummarySection() {
  return (
    <SettingsCard
      title="Resumen de Configuración"
      description="Vista previa de la configuración actual aplicada en la plataforma."
      icon={SquarePen}
      titleId="summary-title"
    >
      <dl className="mt-3 divide-y divide-line">
        {summaryRows.map((row) => {
          const Icon = row.icon;

          return (
            <div className="flex items-center justify-between gap-3 py-2.5" key={row.label}>
              <dt className="flex min-w-0 items-center gap-2 text-2xs font-bold text-muted">
                <Icon className="size-3.5 shrink-0 text-accent" strokeWidth={1.8} aria-hidden="true" />
                <span className="truncate">{row.label}</span>
              </dt>
              <dd className="shrink-0 text-right text-2xs font-extrabold text-ink">{row.value}</dd>
            </div>
          );
        })}
      </dl>
    </SettingsCard>
  );
}

export default function LanguagesPage() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <SettingsPageHeader title="Idiomas y Región" description="Configura el idioma y la región predeterminados para la plataforma." />

      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Secciones de idioma y región">
        <button
          className="min-h-9 shrink-0 border-b-2 border-accent px-3 text-xs font-extrabold whitespace-nowrap text-accent focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-focus"
          type="button"
          role="tab"
          aria-selected="true"
        >
          Idioma y Región
        </button>
        <button
          className="min-h-9 shrink-0 border-b-2 border-transparent px-3 text-xs font-bold whitespace-nowrap text-muted transition-colors hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-focus"
          type="button"
          role="tab"
          aria-selected="false"
        >
          Formato de Fechas y Horas
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:gap-4">
        <LanguageSection />
        <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
          <RegionSection />
          <SummarySection />
        </div>
      </div>

      <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-xl border border-line bg-surface p-3 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)] sm:flex-row sm:items-center sm:p-3.5">
        <p className="flex items-start gap-2 text-2xs leading-4 text-muted sm:items-center">
          <CheckCircle2 className="mt-px size-4 shrink-0 text-success sm:mt-0" strokeWidth={1.9} aria-hidden="true" />
          Los cambios en idioma y región pueden requerir que los usuarios cierren sesión para aplicarse por completo.
        </p>
        <SaveLanguagesButton />
      </div>
    </div>
  );
}

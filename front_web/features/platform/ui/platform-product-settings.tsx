"use client";

import { AlertTriangle, BrainCircuit, CheckCircle2, Save, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getAdminPlatformSettings, updateAdminPlatformSettings } from "@/features/platform/api/browser-platform-settings";
import type { AiModel, LocaleCode, PlatformSettings } from "@/features/platform/model/platform-settings.types";
import { PLATFORM_SETTINGS_UPDATED_EVENT } from "@/features/platform/model/platform-settings.types";
import { appLocaleFromBackendLocale, isEnglishLocale } from "@/i18n/config";
import { BrandLogo } from "@/shared/ui/brand-logo";
import { PlatformModuleLoading } from "@/shared/ui/platform-module-loading";
import { SettingsCard, SettingsInput, SettingsSelect, SettingsToggle } from "@/features/platform/ui/settings-primitives";

const SUPPORTED_AI_MODELS: readonly AiModel[] = ["respiratory", "dengue", "gastrointestinal", "hospital_occupancy"];
const SUPPORTED_FREQUENCIES = ["every_12_hours", "daily", "weekly"] as const;
const SUPPORTED_WINDOWS = [14, 30, 60] as const;
const SUPPORTED_SENSITIVITIES = ["low", "medium", "high"] as const;

type BrandingAsset = {
  titleKey: "assetLogo" | "assetFavicon" | "assetLogin";
  descriptionKey: "assetLogoDescription" | "assetFaviconDescription" | "assetLoginDescription";
  preview: "logo" | "favicon" | "wordmark";
};

const BRANDING_ASSETS: readonly BrandingAsset[] = [
  { titleKey: "assetLogo", descriptionKey: "assetLogoDescription", preview: "logo" },
  { titleKey: "assetFavicon", descriptionKey: "assetFaviconDescription", preview: "favicon" },
  { titleKey: "assetLogin", descriptionKey: "assetLoginDescription", preview: "wordmark" },
];

function AssetPreview({ preview }: { preview: BrandingAsset["preview"] }) {
  if (preview === "wordmark") {
    return <span className="text-sm font-extrabold tracking-[-0.02em] text-accent">HIPOCRATIQ</span>;
  }

  return <BrandLogo className={preview === "favicon" ? "h-6 w-7" : "h-8 w-9"} />;
}

function SaveButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  const t = useTranslations("settings.common");

  return (
    <button
      aria-busy={loading}
      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 text-xs font-bold text-white transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-55"
      disabled={loading}
      onClick={onClick}
      type="button"
    >
      <Save className="size-3.5" aria-hidden="true" />
      {loading ? t("saving") : t("saveChanges")}
    </button>
  );
}

function Status({ value }: { value: string }) {
  const hasError = value.startsWith("Error") || value.startsWith("No se pudo") || value.startsWith("Error:");

  return (
    <p className="flex items-center gap-2 text-2xs text-muted" role="status" aria-live="polite">
      {hasError ? <AlertTriangle className="size-3.5 text-danger" aria-hidden="true" /> : <CheckCircle2 className="size-3.5 text-success" aria-hidden="true" />}
      <span>{value}</span>
    </p>
  );
}

function useSettings() {
  const t = useTranslations("settings.common");
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [status, setStatus] = useState(() => t("loadingConfiguration"));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getAdminPlatformSettings(controller.signal)
      .then((data) => {
        setSettings(data);
        setStatus(t("configurationLoaded"));
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setStatus(t("loadError"));
        setError(requestError instanceof Error ? requestError.message : t("loadError"));
      });

    return () => controller.abort();
  }, [t]);

  return { settings, setSettings, status, setStatus, error };
}

export function BrandingSettingsForm() {
  const t = useTranslations("settings.general");
  const { settings, setSettings, status, setStatus, error } = useSettings();
  const [loading, setLoading] = useState(false);

  if (!settings) {
    return error
      ? <p className="rounded-lg border border-danger/25 bg-danger-soft p-3 text-xs text-danger" role="alert">{error}</p>
      : <PlatformModuleLoading label={t("brandingTitle")} variant="settings" />;
  }

  const save = async () => {
    setLoading(true);
    setStatus(t("identitySaving"));

    try {
      const updated = await updateAdminPlatformSettings({ branding: settings.branding });
      setSettings(updated);
      setStatus(t("identitySaved"));
      window.dispatchEvent(new Event(PLATFORM_SETTINGS_UPDATED_EVENT));
    } catch {
      setStatus(t("identityError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <SettingsCard title={t("brandingTitle")} description={t("brandingDescription")} titleId="branding-form">
        <form
          className="mt-4"
          aria-busy={loading}
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <div className="grid gap-3">
            <SettingsInput id="platform-name" label={t("platformName")} value={settings.branding.platformName} onChange={(platformName) => setSettings({ ...settings, branding: { ...settings.branding, platformName } })} />
            <SettingsInput id="support-email" label={t("supportEmail")} type="email" value={settings.branding.supportEmail} onChange={(supportEmail) => setSettings({ ...settings, branding: { ...settings.branding, supportEmail } })} />
            <SettingsInput id="support-url" label={t("supportUrl")} type="url" value={settings.branding.supportUrl} onChange={(supportUrl) => setSettings({ ...settings, branding: { ...settings.branding, supportUrl } })} />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Status value={status} />
            <SaveButton loading={loading} onClick={save} />
          </div>
        </form>
      </SettingsCard>

      <SettingsCard title={t("assetsTitle")} description={t("assetsDescription")} titleId="branding-assets">
        <ul className="mt-4 grid gap-2.5">
          {BRANDING_ASSETS.map((asset) => {
            const title = t(asset.titleKey);

            return (
              <li className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-subtle p-2.5" key={asset.titleKey}>
                <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-surface" aria-hidden="true">
                  <AssetPreview preview={asset.preview} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-2xs font-extrabold text-ink">{title}</span>
                  <span className="mt-0.5 block text-2xs leading-4 text-muted">{t(asset.descriptionKey)}</span>
                </span>
                <button
                  aria-label={t("assetUploadAria", { title })}
                  className="min-h-8 shrink-0 rounded-lg border border-line bg-surface px-2.5 text-2xs font-bold text-muted disabled:cursor-not-allowed disabled:opacity-65"
                  disabled
                  title={t("assetUploadTitle")}
                  type="button"
                >
                  {t("assetUploadSoon")}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 rounded-lg border border-warning/25 bg-warning-soft/50 p-3 text-2xs leading-5 text-muted" role="status">
          <strong className="text-ink">{t("assetUploadLabel")}</strong>{" "}
          {settings.branding.assetUploadsAvailable ? t("assetApiAvailable") : t("assetApiUnavailable")}
        </p>
      </SettingsCard>
    </div>
  );
}

export function LocalizationSettingsForm() {
  const t = useTranslations("settings.languages");
  const currentLocale = useLocale();
  const { settings, setSettings, status, setStatus, error } = useSettings();
  const [loading, setLoading] = useState(false);

  if (!settings) {
    return error
      ? <p className="rounded-lg border border-danger/25 bg-danger-soft p-3 text-xs text-danger" role="alert">{error}</p>
      : <PlatformModuleLoading label={t("cardTitle")} variant="settings" />;
  }

  const labelForLocale = (locale: LocaleCode) => t(`localeLabels.${locale}`);
  const enabledLocaleSet = new Set(settings.localization.enabledLocales);
  const interfaceLocale = appLocaleFromBackendLocale(currentLocale);
  const interfaceLanguage = isEnglishLocale(interfaceLocale) ? t("localeLabels.en-US") : t("localeLabels.es-MX");

  const toggleLocale = (locale: LocaleCode) => {
    const enabled = enabledLocaleSet.has(locale);
    const nextEnabledLocales = enabled
      ? settings.localization.enabledLocales.filter((item) => item !== locale)
      : [...settings.localization.enabledLocales, locale];

    if (!nextEnabledLocales.length || (locale === settings.localization.defaultLocale && enabled)) return;
    setSettings({ ...settings, localization: { ...settings.localization, enabledLocales: nextEnabledLocales } });
  };

  const save = async () => {
    setLoading(true);
    setStatus(t("statusSaving"));

    try {
      const updated = await updateAdminPlatformSettings({ localization: settings.localization });
      setSettings(updated);
      setStatus(t("statusSaved"));
    } catch {
      setStatus(t("statusError"));
    } finally {
      setLoading(false);
    }
  };

  const enabledLocaleOptions = settings.localization.enabledLocales.map(labelForLocale);

  return (
    <SettingsCard title={t("cardTitle")} description={t("cardDescription")} titleId="localization-form">
      <div className="mt-4 grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
        <fieldset className="grid gap-2" disabled={loading}>
          <legend className="mb-1 text-2xs font-bold text-muted">{t("enabledLocales")}</legend>
          {settings.localization.supportedLocales.map((locale) => (
            <label className="flex min-h-11 items-center gap-2 rounded-lg border border-line bg-surface-subtle p-3 text-xs font-bold" key={locale}>
              <input checked={enabledLocaleSet.has(locale)} className="size-4 accent-accent" onChange={() => toggleLocale(locale)} type="checkbox" />
              {labelForLocale(locale)}
              <span className="ml-auto font-mono text-2xs text-muted">{locale}</span>
            </label>
          ))}
        </fieldset>

        <div className="grid min-w-0 content-start gap-3">
          <SettingsSelect
            id="default-locale"
            label={t("defaultLocale")}
            value={labelForLocale(settings.localization.defaultLocale)}
            options={enabledLocaleOptions}
            disabled={loading}
            onChange={(label) => {
              const locale = settings.localization.enabledLocales.find((item) => labelForLocale(item) === label);
              if (locale) setSettings({ ...settings, localization: { ...settings.localization, defaultLocale: locale } });
            }}
          />
          <p className="rounded-lg bg-accent-soft/60 p-3 text-2xs leading-5 text-muted">
            <strong className="font-bold text-ink">{t("interfaceLabel")}:</strong>{" "}
            {t("interfaceValue", { language: interfaceLanguage })}
          </p>
          <p className="rounded-lg border border-line bg-surface-subtle p-3 text-2xs leading-5 text-muted">{t("interfaceSupport")}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Status value={status} />
        <SaveButton loading={loading} onClick={save} />
      </div>
      <p className="mt-3 text-2xs leading-5 text-muted">{t("note")}</p>
    </SettingsCard>
  );
}

export function AiSettingsForm() {
  const t = useTranslations("settings.ai");
  const { settings, setSettings, status, setStatus, error } = useSettings();
  const [loading, setLoading] = useState(false);

  if (!settings) {
    return error
      ? <p className="rounded-lg border border-danger/25 bg-danger-soft p-3 text-xs text-danger" role="alert">{error}</p>
      : <PlatformModuleLoading label={t("pageTitle")} variant="settings" />;
  }

  const enabledModels = new Set(settings.ai.enabledModels);
  const frequencyOptions = SUPPORTED_FREQUENCIES.map((frequency) => ({ value: frequency, label: t(`frequencyOptions.${frequency}`) }));
  const windowOptions = SUPPORTED_WINDOWS.map((days) => ({ value: days, label: t("days", { count: days }) }));
  const sensitivityOptions = SUPPORTED_SENSITIVITIES.map((sensitivity) => ({ value: sensitivity, label: t(`sensitivityOptions.${sensitivity}`) }));

  const toggleModel = (model: AiModel) => {
    const nextModels = enabledModels.has(model)
      ? settings.ai.enabledModels.filter((item) => item !== model)
      : [...settings.ai.enabledModels, model];
    setSettings({ ...settings, ai: { ...settings.ai, enabledModels: nextModels } });
  };

  const save = async () => {
    setLoading(true);
    setStatus(t("statusSaving"));

    try {
      const updated = await updateAdminPlatformSettings({ ai: settings.ai });
      setSettings(updated);
      setStatus(t("statusSaved"));
    } catch {
      setStatus(t("statusError"));
    } finally {
      setLoading(false);
    }
  };

  const sources = settings.aiCapabilities.dataSources.filter((source) => source.trim().length > 0);
  const capabilityConfigured = settings.aiCapabilities.status === "configured";

  return (
    <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
      <SettingsCard icon={BrainCircuit} title={t("formTitle")} description={t("formDescription")} titleId="ai-form">
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <SettingsSelect
            id="ai-frequency"
            label={t("frequency")}
            value={t(`frequencyOptions.${settings.ai.frequency}`)}
            options={frequencyOptions.map((option) => option.label)}
            disabled={loading}
            onChange={(label) => {
              const frequency = frequencyOptions.find((option) => option.label === label)?.value;
              if (frequency) setSettings({ ...settings, ai: { ...settings.ai, frequency } });
            }}
          />
          <SettingsSelect
            id="ai-window"
            label={t("window")}
            value={t("days", { count: settings.ai.windowDays })}
            options={windowOptions.map((option) => option.label)}
            disabled={loading}
            onChange={(label) => {
              const windowDays = windowOptions.find((option) => option.label === label)?.value;
              if (windowDays) setSettings({ ...settings, ai: { ...settings.ai, windowDays } });
            }}
          />
          <SettingsSelect
            id="ai-sensitivity"
            label={t("sensitivity")}
            value={t(`sensitivityOptions.${settings.ai.sensitivity}`)}
            options={sensitivityOptions.map((option) => option.label)}
            disabled={loading}
            onChange={(label) => {
              const sensitivity = sensitivityOptions.find((option) => option.label === label)?.value;
              if (sensitivity) setSettings({ ...settings, ai: { ...settings.ai, sensitivity } });
            }}
          />
          <div className="grid gap-1.5">
            <span className="text-2xs font-bold text-muted">{t("automaticAlerts")}</span>
            <div className="flex h-9 items-center gap-2">
              <SettingsToggle checked={settings.ai.automaticAlerts} disabled={loading} label={t("automaticAlerts")} onChange={(automaticAlerts) => setSettings({ ...settings, ai: { ...settings.ai, automaticAlerts } })} />
              <span className="text-2xs text-muted">{settings.ai.automaticAlerts ? t("enabled") : t("disabled")}</span>
            </div>
          </div>
        </div>

        <fieldset className="mt-4" disabled={loading}>
          <legend className="text-2xs font-bold text-muted">{t("models")}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {SUPPORTED_AI_MODELS.map((model) => (
              <label className={`min-h-9 cursor-pointer rounded-lg border px-3 py-2 text-2xs font-bold transition-colors focus-within:outline-3 focus-within:outline-offset-1 focus-within:outline-focus ${enabledModels.has(model) ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:border-accent/60"}`} key={model}>
                <input checked={enabledModels.has(model)} className="sr-only" onChange={() => toggleModel(model)} type="checkbox" />
                {t(`modelLabels.${model}`)}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Status value={status} />
          <SaveButton loading={loading} onClick={save} />
        </div>
      </SettingsCard>

      <SettingsCard icon={ShieldCheck} title={t("capabilityTitle")} description={t("capabilityDescription")} titleId="ai-capability">
        <div className={`mt-4 rounded-lg border p-3 ${capabilityConfigured ? "border-success/25 bg-success-soft/50" : "border-warning/25 bg-warning-soft/50"}`} role="status">
          <p className="text-xs font-extrabold">{capabilityConfigured ? t("configured") : t("notConfigured")}</p>
          <p className="mt-1 text-2xs leading-5 text-muted">
            {t("provider", { provider: settings.aiCapabilities.provider ?? t("noProvider") })}{" "}
            {t("predictions", { status: settings.aiCapabilities.predictionsAvailable ? t("available") : t("notAvailable") })}
          </p>
        </div>
        {sources.length > 0 ? (
           <ul className="mt-3 grid gap-2" aria-label={t("dataSources", { sources: "" })}>
             {sources.map((source) => <li className="break-words rounded-lg border border-line bg-surface-subtle px-3 py-2 text-2xs text-muted" key={source}>{source}</li>)}
          </ul>
        ) : (
          <p className="mt-3 rounded-lg border border-dashed border-line p-4 text-center text-2xs leading-5 text-muted">{t("noSources")}</p>
        )}
        {sources.length > 0 ? <p className="mt-3 break-words text-2xs leading-5 text-muted">{t("dataSources", { sources: sources.join(", ") })}</p> : <p className="mt-3 text-2xs text-muted">{t("noSourcesConfigured")}</p>}
      </SettingsCard>
    </div>
  );
}

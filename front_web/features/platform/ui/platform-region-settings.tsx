"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getAdminPlatformSettings, updateAdminPlatformSettings } from "@/features/platform/api/browser-platform-settings";
import { PLATFORM_SETTINGS_UPDATED_EVENT } from "@/features/platform/model/platform-settings.types";
import { SettingsSelect } from "@/features/platform/ui/settings-primitives";
import { CountryFlag, type CountryCode } from "@/shared/ui/country-flag";

const COUNTRY_CODES: readonly CountryCode[] = ["MX", "PE", "US"];

type RegionDraft = {
  defaultCountryCode: CountryCode;
  enabledCountryCodes: CountryCode[];
  headerCountryCodes: CountryCode[];
};

export function PlatformRegionCountrySetting() {
  const t = useTranslations("settings.region");
  const [draft, setDraft] = useState<RegionDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(() => t("globalLoading"));

  useEffect(() => {
    const controller = new AbortController();

    getAdminPlatformSettings(controller.signal)
      .then((settings) => {
        setDraft({
          defaultCountryCode: settings.defaultCountryCode,
          enabledCountryCodes: settings.enabledCountryCodes,
          headerCountryCodes: settings.headerCountryCodes,
        });
        setStatus(t("globalLoaded"));
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setStatus(t("loadError"));
        setError(requestError instanceof Error ? requestError.message : t("loadError"));
      });

    return () => controller.abort();
  }, [t]);

  if (!draft) {
    if (error) {
      return <p className="rounded-lg border border-danger/25 bg-danger-soft p-3 text-xs text-danger" role="alert">{error}</p>;
    }

    return (
      <div className="motion-safe:animate-pulse" role="status" aria-live="polite" aria-busy="true">
        <span className="sr-only">{t("loading")}</span>
        <div className="grid gap-3">
          <div className="h-2.5 w-36 rounded bg-line/50" />
          <div className="h-9 rounded-lg border border-line bg-surface-input" />
          <div className="h-2.5 w-44 rounded bg-line/40" />
        </div>
      </div>
    );
  }

  const countryOptions = COUNTRY_CODES.map((code) => ({
    code,
    label: t(`countries.${code}.label`),
    description: t(`countries.${code}.description`),
  }));
  const enabledCountrySet = new Set(draft.enabledCountryCodes);
  const enabledCountryOptions = countryOptions.filter((country) => enabledCountrySet.has(country.code));
  const selectedCountry = countryOptions.find((country) => country.code === draft.defaultCountryCode) ?? countryOptions[0];

  const toggleCountry = (countryCode: CountryCode, enabled: boolean) => {
    if (countryCode === "MX") return;

    setError(null);
    setStatus(t("unsaved"));
    setDraft((current) => {
      if (!current) return current;

      const enabledCountryCodes = enabled
        ? Array.from(new Set([...current.enabledCountryCodes, countryCode]))
        : current.enabledCountryCodes.filter((code) => code !== countryCode);
      const defaultCountryCode = enabledCountryCodes.includes(current.defaultCountryCode) ? current.defaultCountryCode : "MX";

      return { ...current, defaultCountryCode, enabledCountryCodes };
    });
  };

  const handleCountryChange = (value: string) => {
    const nextCountry = countryOptions.find((country) => country.label === value);

    if (!nextCountry || nextCountry.code === draft.defaultCountryCode) return;

    setError(null);
    setStatus(t("unsaved"));
    setDraft((current) => current ? { ...current, defaultCountryCode: nextCountry.code } : current);
  };

  const save = async () => {
    const previousDraft = draft;
    setSaving(true);
    setError(null);
    setStatus(t("saving"));

    try {
      const settings = await updateAdminPlatformSettings({
        defaultCountryCode: draft.defaultCountryCode,
        enabledCountryCodes: draft.enabledCountryCodes,
      });
      setDraft({
        defaultCountryCode: settings.defaultCountryCode,
        enabledCountryCodes: settings.enabledCountryCodes,
        headerCountryCodes: settings.headerCountryCodes,
      });
      setStatus(t("saved"));
      window.dispatchEvent(new Event(PLATFORM_SETTINGS_UPDATED_EVENT));
    } catch (requestError: unknown) {
      setDraft(previousDraft);
      setStatus(t("saveError"));
      setError(requestError instanceof Error ? requestError.message : t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="grid gap-4"
      aria-busy={saving}
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <fieldset className="grid gap-2" disabled={saving}>
        <legend className="text-2xs font-bold text-muted">{t("countriesLegend")}</legend>
        {countryOptions.map((country) => {
          const isBaseCountry = country.code === "MX";
          const isEnabled = enabledCountrySet.has(country.code);

          return (
            <label className="flex min-h-11 items-center gap-2.5 rounded-lg border border-line bg-surface-subtle p-2.5" key={country.code}>
              <input checked={isEnabled} className="size-4 shrink-0 accent-accent" disabled={isBaseCountry} onChange={(event) => toggleCountry(country.code, event.target.checked)} type="checkbox" />
              <CountryFlag countryCode={country.code} className="h-3.5 w-5 shrink-0 rounded-xs" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-ink">{country.label}</span>
                <span className="block text-2xs leading-4 text-muted">{country.description}</span>
              </span>
              {isBaseCountry ? <span className="shrink-0 text-2xs font-bold text-muted">{t("base")}</span> : null}
            </label>
          );
        })}
      </fieldset>

      <SettingsSelect
        id="region-country"
        label={t("defaultCountry")}
        value={selectedCountry.label}
        options={enabledCountryOptions.map((country) => country.label)}
        disabled={saving}
        onChange={handleCountryChange}
      >
        <CountryFlag countryCode={draft.defaultCountryCode} className="pointer-events-none absolute top-1/2 left-3 z-1 h-3.5 w-5 -translate-y-1/2 rounded-xs" />
      </SettingsSelect>

      <p className="break-words text-2xs leading-4 text-muted">{t("coverageSummary", { countries: enabledCountryOptions.map((country) => country.label).join(", ") })}</p>
      {error ? <p className="rounded-lg border border-danger/25 bg-danger-soft p-2.5 text-2xs leading-4 text-danger" role="alert">{error}</p> : null}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <p className="text-2xs text-muted" role="status" aria-live="polite">{status}</p>
        <button className="inline-flex min-h-9 items-center justify-center rounded-lg bg-accent px-3.5 text-xs font-bold text-white transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-55" aria-busy={saving} disabled={saving} type="submit">
          {saving ? t("saving") : t("save")}
        </button>
      </div>
    </form>
  );
}

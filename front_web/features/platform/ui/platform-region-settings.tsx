"use client";

import { useEffect, useState } from "react";
import { getAdminPlatformSettings, updateAdminPlatformSettings } from "@/features/platform/api/browser-platform-settings";
import { PLATFORM_SETTINGS_UPDATED_EVENT } from "@/features/platform/model/platform-settings.types";
import { SettingsSelect } from "@/features/platform/ui/settings-primitives";
import { CountryFlag, type CountryCode } from "@/shared/ui/country-flag";

const COUNTRY_OPTIONS: Array<{ code: CountryCode; label: string }> = [
  { code: "MX", label: "México" },
  { code: "PE", label: "Perú" },
  { code: "US", label: "USA" },
];

const COUNTRY_LABELS = COUNTRY_OPTIONS.map((country) => country.label);

export function PlatformRegionCountrySetting() {
  const [countryCode, setCountryCode] = useState<CountryCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Cargando configuración regional...");

  useEffect(() => {
    const controller = new AbortController();

    getAdminPlatformSettings(controller.signal)
      .then((settings) => {
        setCountryCode(settings.defaultCountryCode);
        setStatus("La configuración regional se carga desde el backend.");
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setStatus("No se pudo cargar la configuración regional.");
        setError(requestError instanceof Error ? requestError.message : "No se pudo cargar la configuración regional.");
      });

    return () => controller.abort();
  }, []);

  if (!countryCode) {
    if (error) {
      return <p className="rounded-lg border border-danger/25 bg-danger-soft p-3 text-xs text-danger" role="alert">{error}</p>;
    }

    return <div className="motion-safe:animate-pulse" role="status" aria-live="polite" aria-busy="true"><span className="sr-only">Cargando configuración regional</span><div className="h-9 rounded-lg border border-line bg-surface-input" /></div>;
  }

  const selectedCountry = COUNTRY_OPTIONS.find((country) => country.code === countryCode) ?? COUNTRY_OPTIONS[0];

  const handleCountryChange = async (value: string) => {
    const nextCountry = COUNTRY_OPTIONS.find((country) => country.label === value);

    if (!nextCountry || nextCountry.code === countryCode) return;

    const previousCountryCode = countryCode;
    setCountryCode(nextCountry.code);
    setStatus("Guardando configuración regional...");

    try {
      const settings = await updateAdminPlatformSettings({
        defaultCountryCode: nextCountry.code,
        enabledCountryCodes: nextCountry.code === "MX" ? ["MX"] : ["MX", nextCountry.code],
      });
      setCountryCode(settings.defaultCountryCode);
      setStatus("Configuración regional guardada.");
      window.dispatchEvent(new Event(PLATFORM_SETTINGS_UPDATED_EVENT));
    } catch {
      setCountryCode(previousCountryCode);
      setStatus("No se pudo guardar la configuración regional.");
    }
  };

  return (
    <>
      <SettingsSelect
        id="region-country"
        label="País Predeterminado"
        value={selectedCountry.label}
        options={COUNTRY_LABELS}
        onChange={handleCountryChange}
      >
        <CountryFlag countryCode={countryCode} className="pointer-events-none absolute top-1/2 left-3 z-1 h-3.5 w-5 -translate-y-1/2 rounded-xs" />
      </SettingsSelect>
      <p className="text-2xs leading-4 text-muted" role="status" aria-live="polite">{status}</p>
    </>
  );
}

export const LOCALE_COOKIE_NAME = "hipocratiq-locale";
export const DEFAULT_LOCALE = "es" as const;

export const APP_LOCALES = ["es", "en"] as const;
export type AppLocale = (typeof APP_LOCALES)[number];

export function isAppLocale(value: string | undefined): value is AppLocale {
  return value === "es" || value === "en";
}

export function localeFromValue(value: string | undefined): AppLocale | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();

  if (normalized === "es" || normalized.startsWith("es-")) return "es";
  if (normalized === "en" || normalized.startsWith("en-")) return "en";

  return undefined;
}

export function appLocaleFromBackendLocale(locale: string): AppLocale {
  return localeFromValue(locale) ?? DEFAULT_LOCALE;
}

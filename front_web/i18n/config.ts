export const LOCALE_COOKIE_NAME = "hipocratiq-locale";
export const LOCALE_STORAGE_KEY = "hipocratiq-locale";
export const DEFAULT_LOCALE = "es-MX" as const;

export const APP_LOCALES = ["es-MX", "es-PE", "en-US"] as const;
export type AppLocale = (typeof APP_LOCALES)[number];

export type PublicLocalePolicy = {
  defaultLocale: AppLocale;
  enabledLocales: AppLocale[];
};

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && APP_LOCALES.includes(value as AppLocale);
}

export function localeFromValue(value: string | undefined): AppLocale | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase().replaceAll("_", "-");

  if (normalized === "es-mx") return "es-MX";
  if (normalized === "es-pe") return "es-PE";
  if (normalized === "en-us") return "en-US";
  if (normalized === "es") return "es-MX";
  if (normalized === "en") return "en-US";

  return undefined;
}

export function canonicalizeLocale(
  value: string | undefined,
  enabledLocales: readonly AppLocale[] = APP_LOCALES,
  fallbackLocale: AppLocale = DEFAULT_LOCALE,
): AppLocale {
  const parsed = localeFromValue(value);
  if (parsed && enabledLocales.includes(parsed)) return parsed;

  const fallback = enabledLocales.includes(fallbackLocale) ? fallbackLocale : enabledLocales[0];

  return fallback ?? DEFAULT_LOCALE;
}

export function appLocaleFromBackendLocale(locale: string): AppLocale {
  return canonicalizeLocale(locale);
}

export function isEnglishLocale(locale: string): boolean {
  return locale.toLowerCase().startsWith("en");
}

export function messageLocale(locale: AppLocale): "es" | "en" {
  return isEnglishLocale(locale) ? "en" : "es";
}

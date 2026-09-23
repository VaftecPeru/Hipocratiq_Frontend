import "server-only";

import { canonicalizeLocale, DEFAULT_LOCALE, isAppLocale, type PublicLocalePolicy } from "@/i18n/config";
import { serverEnv } from "@/shared/config/server-env";

type PublicSettingsResponse = {
  data?: {
    localization?: {
      default_locale?: unknown;
      enabled_locales?: unknown;
    };
  };
};

const FALLBACK_POLICY: PublicLocalePolicy = {
  defaultLocale: DEFAULT_LOCALE,
  enabledLocales: ["es-MX", "es-PE", "en-US"],
};

export async function getServerLocalePolicy(acceptLanguage?: string | null): Promise<PublicLocalePolicy> {
  try {
    const response = await fetch(`${serverEnv.backendUrl}/api/v1/auth/platform-settings`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(acceptLanguage ? { "Accept-Language": acceptLanguage } : {}),
      },
      signal: AbortSignal.timeout(1_500),
    });

    if (!response.ok) return FALLBACK_POLICY;

    const payload = (await response.json()) as PublicSettingsResponse;
    const configuredDefault = isAppLocale(payload.data?.localization?.default_locale)
      ? payload.data.localization.default_locale
      : DEFAULT_LOCALE;
    const configuredEnabled = Array.isArray(payload.data?.localization?.enabled_locales)
      ? payload.data.localization.enabled_locales.filter(isAppLocale)
      : [];
    const enabledLocales = Array.from(new Set([configuredDefault, ...configuredEnabled]));

    return {
      defaultLocale: canonicalizeLocale(configuredDefault, enabledLocales, DEFAULT_LOCALE),
      enabledLocales,
    };
  } catch {
    return FALLBACK_POLICY;
  }
}

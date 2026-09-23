import { ApiError, getFromApi, patchToApi } from "@/shared/api/http-client";
import { parseApiList } from "@/shared/api/parse-api-list";
import { APP_LOCALES, DEFAULT_LOCALE, isAppLocale } from "@/i18n/config";
import type {
  AiModel,
  LocaleCode,
  PlatformSettings,
  PublicPlatformSettings,
  UpdatePlatformSettingsPayload,
} from "@/features/platform/model/platform-settings.types";
import type { CountryCode } from "@/shared/ui/country-flag";

type ApiPlatformSettings = {
  default_country_code: unknown;
  enabled_country_codes: unknown;
  header_country_codes: unknown;
  branding?: { platform_name?: unknown; support_email?: unknown; support_url?: unknown; asset_uploads_available?: unknown };
  localization?: { default_locale?: unknown; enabled_locales?: unknown; supported_locales?: unknown; catalog_status?: unknown };
  ai?: { frequency?: unknown; window_days?: unknown; sensitivity?: unknown; automatic_alerts?: unknown; enabled_models?: unknown };
  ai_capabilities?: { status?: unknown; provider?: unknown; predictions_available?: unknown; data_sources?: unknown };
};

type ApiPlatformSettingsResponse = {
  data?: ApiPlatformSettings;
};

type ApiPublicPlatformSettingsResponse = {
  data?: {
    default_country_code?: unknown;
    localization?: { default_locale?: unknown; enabled_locales?: unknown };
  };
};

const COUNTRY_CODES = ["MX", "PE", "US"] as const satisfies readonly CountryCode[];
const LOCALES = APP_LOCALES satisfies readonly LocaleCode[];
const AI_MODELS = ["respiratory", "dengue", "gastrointestinal", "hospital_occupancy"] as const satisfies readonly AiModel[];

function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === "string" && COUNTRY_CODES.includes(value as CountryCode);
}

function normalizeCountryCodes(value: unknown, field: string): CountryCode[] {
  const countryCodes = parseApiList<unknown>(value, field);
  if (!countryCodes.every(isCountryCode)) {
    throw new ApiError(`El servidor devolvió una lista inválida para ${field}.`, 502);
  }
  const uniqueCountryCodes = Array.from(new Set(countryCodes));

  return ["MX", ...uniqueCountryCodes.filter((countryCode) => countryCode !== "MX")];
}

function isLocale(value: unknown): value is LocaleCode { return typeof value === "string" && LOCALES.includes(value as LocaleCode); }
function isAiModel(value: unknown): value is AiModel { return typeof value === "string" && AI_MODELS.includes(value as AiModel); }

function parseValidatedList<T>(value: unknown, field: string, isValid: (item: unknown) => item is T): T[] {
  const items = parseApiList<unknown>(value, field);
  if (!items.every(isValid)) {
    throw new ApiError(`El servidor devolvió una lista inválida para ${field}.`, 502);
  }

  return items;
}

function nullableText(value: string | null | undefined): string | null | undefined {
  if (value === undefined || value === null) return value;

  const normalized = value.trim();

  return normalized === "" ? null : normalized;
}

function mapSettings(payload: ApiPlatformSettingsResponse): PlatformSettings {
  const settings = payload.data;

  if (!settings || !isCountryCode(settings.default_country_code)) {
    throw new ApiError("El servidor devolvió una configuración regional incompleta.", 502);
  }

  const enabledCountryCodes = normalizeCountryCodes(settings.enabled_country_codes, "settings.enabled_country_codes");
  const headerCountryCodes = normalizeCountryCodes(settings.header_country_codes, "settings.header_country_codes");

  return {
    defaultCountryCode: settings.default_country_code,
    enabledCountryCodes,
    headerCountryCodes,
    branding: {
      platformName: typeof settings.branding?.platform_name === "string" ? settings.branding.platform_name : "MEDIQ",
      supportEmail: typeof settings.branding?.support_email === "string" ? settings.branding.support_email : "",
      supportUrl: typeof settings.branding?.support_url === "string" ? settings.branding.support_url : "",
      assetUploadsAvailable: settings.branding?.asset_uploads_available === true,
    },
    localization: {
      defaultLocale: isLocale(settings.localization?.default_locale) ? settings.localization.default_locale : "es-MX",
      enabledLocales: parseValidatedList(settings.localization?.enabled_locales, "settings.localization.enabled_locales", isLocale),
      supportedLocales: parseValidatedList(settings.localization?.supported_locales, "settings.localization.supported_locales", isLocale),
      catalogStatus: typeof settings.localization?.catalog_status === "string" ? settings.localization.catalog_status : "source_only",
    },
    ai: {
      frequency: (["every_12_hours", "daily", "weekly"] as const).includes(settings.ai?.frequency as "daily") ? settings.ai?.frequency as "every_12_hours" | "daily" | "weekly" : "daily",
      windowDays: ([14, 30, 60] as const).includes(settings.ai?.window_days as 30) ? settings.ai?.window_days as 14 | 30 | 60 : 30,
      sensitivity: (["low", "medium", "high"] as const).includes(settings.ai?.sensitivity as "medium") ? settings.ai?.sensitivity as "low" | "medium" | "high" : "medium",
      automaticAlerts: settings.ai?.automatic_alerts === true,
      enabledModels: parseValidatedList(settings.ai?.enabled_models, "settings.ai.enabled_models", isAiModel),
    },
    aiCapabilities: {
      status: settings.ai_capabilities?.status === "configured" ? "configured" : "not_configured",
      provider: typeof settings.ai_capabilities?.provider === "string" ? settings.ai_capabilities.provider : null,
      predictionsAvailable: settings.ai_capabilities?.predictions_available === true,
      dataSources: parseValidatedList(settings.ai_capabilities?.data_sources, "settings.ai_capabilities.data_sources", (item): item is string => typeof item === "string"),
    },
  };
}

function mapPublicSettings(payload: ApiPublicPlatformSettingsResponse): PublicPlatformSettings {
  const defaultCountryCode = payload.data?.default_country_code;

  if (!isCountryCode(defaultCountryCode)) {
    throw new ApiError("El servidor devolvió una configuración regional incompleta.", 502);
  }

  const defaultLocale = isLocale(payload.data?.localization?.default_locale)
    ? payload.data.localization.default_locale
    : DEFAULT_LOCALE;
  const configuredEnabledLocales = payload.data?.localization?.enabled_locales;
  const enabledLocales = Array.isArray(configuredEnabledLocales)
    ? configuredEnabledLocales.filter(isAppLocale)
    : [];

  return {
    defaultCountryCode,
    localization: {
      defaultLocale,
      enabledLocales: Array.from(new Set([defaultLocale, ...enabledLocales])),
    },
  };
}

export async function getPublicPlatformSettings(signal?: AbortSignal): Promise<PublicPlatformSettings> {
  return mapPublicSettings(
    await getFromApi<ApiPublicPlatformSettingsResponse>("/api/v1/auth/platform-settings", { signal }),
  );
}

export async function getAdminPlatformSettings(signal?: AbortSignal): Promise<PlatformSettings> {
  return mapSettings(
    await getFromApi<ApiPlatformSettingsResponse>("/api/v1/auth/admin/platform-settings", { signal }),
  );
}

export async function updateAdminPlatformSettings(
  payload: UpdatePlatformSettingsPayload,
): Promise<PlatformSettings> {
  return mapSettings(
    await patchToApi<ApiPlatformSettingsResponse>("/api/v1/auth/admin/platform-settings", {
      ...(payload.defaultCountryCode ? { default_country_code: payload.defaultCountryCode } : {}),
      ...(payload.enabledCountryCodes ? { enabled_country_codes: payload.enabledCountryCodes } : {}),
      ...(payload.branding ? { branding: { ...(payload.branding.platformName !== undefined ? { platform_name: payload.branding.platformName } : {}), ...(payload.branding.supportEmail !== undefined ? { support_email: nullableText(payload.branding.supportEmail) } : {}), ...(payload.branding.supportUrl !== undefined ? { support_url: nullableText(payload.branding.supportUrl) } : {}) } } : {}),
      ...(payload.localization ? { localization: { ...(payload.localization.defaultLocale ? { default_locale: payload.localization.defaultLocale } : {}), ...(payload.localization.enabledLocales ? { enabled_locales: payload.localization.enabledLocales } : {}) } } : {}),
      ...(payload.ai ? { ai: { ...(payload.ai.frequency ? { frequency: payload.ai.frequency } : {}), ...(payload.ai.windowDays ? { window_days: payload.ai.windowDays } : {}), ...(payload.ai.sensitivity ? { sensitivity: payload.ai.sensitivity } : {}), ...(payload.ai.automaticAlerts !== undefined ? { automatic_alerts: payload.ai.automaticAlerts } : {}), ...(payload.ai.enabledModels ? { enabled_models: payload.ai.enabledModels } : {}) } } : {}),
    }),
  );
}

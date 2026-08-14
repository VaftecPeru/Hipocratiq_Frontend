import { ApiError, getFromApi, patchToApi } from "@/shared/api/http-client";
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
  data?: { default_country_code?: unknown };
};

const COUNTRY_CODES = ["MX", "PE", "US"] as const satisfies readonly CountryCode[];
const LOCALES = ["es-MX", "es-PE", "en-US"] as const satisfies readonly LocaleCode[];
const AI_MODELS = ["respiratory", "dengue", "gastrointestinal", "hospital_occupancy"] as const satisfies readonly AiModel[];

function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === "string" && COUNTRY_CODES.includes(value as CountryCode);
}

function normalizeCountryCodes(value: unknown): CountryCode[] {
  const countryCodes = Array.isArray(value) ? value.filter(isCountryCode) : [];
  const uniqueCountryCodes = Array.from(new Set(countryCodes));

  return ["MX", ...uniqueCountryCodes.filter((countryCode) => countryCode !== "MX")];
}

function isLocale(value: unknown): value is LocaleCode { return typeof value === "string" && LOCALES.includes(value as LocaleCode); }
function isAiModel(value: unknown): value is AiModel { return typeof value === "string" && AI_MODELS.includes(value as AiModel); }

function mapSettings(payload: ApiPlatformSettingsResponse): PlatformSettings {
  const settings = payload.data;

  if (!settings || !isCountryCode(settings.default_country_code)) {
    throw new ApiError("El servidor devolvió una configuración regional incompleta.", 502);
  }

  const enabledCountryCodes = normalizeCountryCodes(settings.enabled_country_codes);
  const headerCountryCodes = normalizeCountryCodes(settings.header_country_codes);

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
      enabledLocales: Array.isArray(settings.localization?.enabled_locales) ? settings.localization.enabled_locales.filter(isLocale) : ["es-MX"],
      supportedLocales: Array.isArray(settings.localization?.supported_locales) ? settings.localization.supported_locales.filter(isLocale) : [...LOCALES],
      catalogStatus: typeof settings.localization?.catalog_status === "string" ? settings.localization.catalog_status : "source_only",
    },
    ai: {
      frequency: (["every_12_hours", "daily", "weekly"] as const).includes(settings.ai?.frequency as "daily") ? settings.ai?.frequency as "every_12_hours" | "daily" | "weekly" : "daily",
      windowDays: ([14, 30, 60] as const).includes(settings.ai?.window_days as 30) ? settings.ai?.window_days as 14 | 30 | 60 : 30,
      sensitivity: (["low", "medium", "high"] as const).includes(settings.ai?.sensitivity as "medium") ? settings.ai?.sensitivity as "low" | "medium" | "high" : "medium",
      automaticAlerts: settings.ai?.automatic_alerts === true,
      enabledModels: Array.isArray(settings.ai?.enabled_models) ? settings.ai.enabled_models.filter(isAiModel) : [],
    },
    aiCapabilities: {
      status: settings.ai_capabilities?.status === "configured" ? "configured" : "not_configured",
      provider: typeof settings.ai_capabilities?.provider === "string" ? settings.ai_capabilities.provider : null,
      predictionsAvailable: settings.ai_capabilities?.predictions_available === true,
      dataSources: Array.isArray(settings.ai_capabilities?.data_sources) ? settings.ai_capabilities.data_sources.filter((item): item is string => typeof item === "string") : [],
    },
  };
}

function mapPublicSettings(payload: ApiPublicPlatformSettingsResponse): PublicPlatformSettings {
  const defaultCountryCode = payload.data?.default_country_code;

  if (!isCountryCode(defaultCountryCode)) {
    throw new ApiError("El servidor devolvió una configuración regional incompleta.", 502);
  }

  return { defaultCountryCode };
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
      ...(payload.branding ? { branding: { ...(payload.branding.platformName !== undefined ? { platform_name: payload.branding.platformName } : {}), ...(payload.branding.supportEmail !== undefined ? { support_email: payload.branding.supportEmail } : {}), ...(payload.branding.supportUrl !== undefined ? { support_url: payload.branding.supportUrl } : {}) } } : {}),
      ...(payload.localization ? { localization: { ...(payload.localization.defaultLocale ? { default_locale: payload.localization.defaultLocale } : {}), ...(payload.localization.enabledLocales ? { enabled_locales: payload.localization.enabledLocales } : {}) } } : {}),
      ...(payload.ai ? { ai: { ...(payload.ai.frequency ? { frequency: payload.ai.frequency } : {}), ...(payload.ai.windowDays ? { window_days: payload.ai.windowDays } : {}), ...(payload.ai.sensitivity ? { sensitivity: payload.ai.sensitivity } : {}), ...(payload.ai.automaticAlerts !== undefined ? { automatic_alerts: payload.ai.automaticAlerts } : {}), ...(payload.ai.enabledModels ? { enabled_models: payload.ai.enabledModels } : {}) } } : {}),
    }),
  );
}

import type { CountryCode } from "@/shared/ui/country-flag";

export const PLATFORM_SETTINGS_UPDATED_EVENT = "platform-settings-updated";

export type PlatformSettings = {
  defaultCountryCode: CountryCode;
  enabledCountryCodes: CountryCode[];
  headerCountryCodes: CountryCode[];
  branding: { platformName: string; supportEmail: string; supportUrl: string; assetUploadsAvailable: boolean };
  localization: { defaultLocale: LocaleCode; enabledLocales: LocaleCode[]; supportedLocales: LocaleCode[]; catalogStatus: string };
  ai: AiConfiguration;
  aiCapabilities: { status: "configured" | "not_configured"; provider: string | null; predictionsAvailable: boolean; dataSources: string[] };
};

export type PublicPlatformSettings = {
  defaultCountryCode: CountryCode;
};

export type LocaleCode = "es-MX" | "es-PE" | "en-US";
export type AiModel = "respiratory" | "dengue" | "gastrointestinal" | "hospital_occupancy";
export type AiConfiguration = {
  frequency: "every_12_hours" | "daily" | "weekly";
  windowDays: 14 | 30 | 60;
  sensitivity: "low" | "medium" | "high";
  automaticAlerts: boolean;
  enabledModels: AiModel[];
};

export type UpdatePlatformSettingsPayload = {
  defaultCountryCode?: CountryCode;
  enabledCountryCodes?: CountryCode[];
  branding?: Partial<{ platformName: string; supportEmail: string | null; supportUrl: string | null }>;
  localization?: Partial<{ defaultLocale: LocaleCode; enabledLocales: LocaleCode[] }>;
  ai?: Partial<AiConfiguration>;
};

"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getPublicPlatformSettings } from "@/features/platform/api/browser-platform-settings";
import type { PublicPlatformSettings } from "@/features/platform/model/platform-settings.types";
import { PLATFORM_SETTINGS_UPDATED_EVENT } from "@/features/platform/model/platform-settings.types";

const FALLBACK_SETTINGS: PublicPlatformSettings = {
  defaultCountryCode: "MX",
  localization: {
    defaultLocale: "es-MX",
    enabledLocales: ["es-MX", "en-US"],
  },
};

const AuthPlatformSettingsContext = createContext<PublicPlatformSettings | null>(null);

export function AuthPlatformSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PublicPlatformSettings>(FALLBACK_SETTINGS);

  useEffect(() => {
    const controller = new AbortController();

    const refreshSettings = () => {
      void getPublicPlatformSettings(controller.signal)
        .then(setSettings)
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
        });
    };

    refreshSettings();
    window.addEventListener(PLATFORM_SETTINGS_UPDATED_EVENT, refreshSettings);

    return () => {
      controller.abort();
      window.removeEventListener(PLATFORM_SETTINGS_UPDATED_EVENT, refreshSettings);
    };
  }, []);

  return <AuthPlatformSettingsContext.Provider value={settings}>{children}</AuthPlatformSettingsContext.Provider>;
}

export function useAuthPlatformSettings(): PublicPlatformSettings {
  const settings = useContext(AuthPlatformSettingsContext);

  if (!settings) {
    throw new Error("useAuthPlatformSettings must be used inside AuthPlatformSettingsProvider.");
  }

  return settings;
}

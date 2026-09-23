"use client";

import { NextIntlClientProvider } from "next-intl";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import enMessages from "@/messages/en.json";
import esMessages from "@/messages/es.json";
import {
  APP_LOCALES,
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
  type AppLocale,
} from "@/i18n/config";

type MessageCatalog = Record<string, unknown>;

const messageCatalogs: Record<AppLocale, MessageCatalog> = {
  "es-MX": esMessages,
  "es-PE": esMessages,
  "en-US": enMessages,
};

type LocalePreferenceContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
};

const LocalePreferenceContext = createContext<LocalePreferenceContextValue | null>(null);

function persistLocale(locale: AppLocale): void {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;

  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Cookie persistence remains available when local storage is blocked.
  }
}

export function LocalePreferenceProvider({
  children,
  initialLocale,
  initialMessages,
}: {
  children: ReactNode;
  initialLocale: AppLocale;
  initialMessages: MessageCatalog;
}) {
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: AppLocale) => {
    if (!APP_LOCALES.includes(nextLocale)) return;
    persistLocale(nextLocale);
    setLocaleState(nextLocale);
  }, []);

  const contextValue = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return (
    <LocalePreferenceContext.Provider value={contextValue}>
      <NextIntlClientProvider locale={locale} messages={messageCatalogs[locale] ?? initialMessages}>
        {children}
      </NextIntlClientProvider>
    </LocalePreferenceContext.Provider>
  );
}

export function useLocalePreference(): LocalePreferenceContextValue {
  const context = useContext(LocalePreferenceContext);
  if (!context) throw new Error("useLocalePreference must be used inside LocalePreferenceProvider.");
  return context;
}

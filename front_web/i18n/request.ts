import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, localeFromValue, LOCALE_COOKIE_NAME, type AppLocale } from "@/i18n/config";

const messageLoaders: Record<AppLocale, () => Promise<{ default: Record<string, unknown> }>> = {
  es: () => import("@/messages/es.json"),
  en: () => import("@/messages/en.json"),
};

function localeFromAcceptLanguage(value: string | null): AppLocale | undefined {
  if (!value) return undefined;

  for (const candidate of value.split(",")) {
    const locale = localeFromValue(candidate.split(";", 1)[0]?.trim());
    if (locale) return locale;
  }

  return undefined;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const requestHeaders = await headers();
  const cookieLocale = localeFromValue(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
  const locale = cookieLocale ?? localeFromAcceptLanguage(requestHeaders.get("accept-language")) ?? DEFAULT_LOCALE;

  return {
    locale,
    messages: (await messageLoaders[locale]()).default,
  };
});

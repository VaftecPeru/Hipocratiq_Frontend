import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { canonicalizeLocale, localeFromValue, LOCALE_COOKIE_NAME, messageLocale, type AppLocale } from "@/i18n/config";
import { getServerLocalePolicy } from "@/i18n/server-policy";

const messageLoaders: Record<"es" | "en", () => Promise<{ default: Record<string, unknown> }>> = {
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
  const policy = await getServerLocalePolicy(requestHeaders.get("accept-language"));
  const cookieLocale = localeFromValue(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
  const requestedLocale = cookieLocale ?? localeFromAcceptLanguage(requestHeaders.get("accept-language"));
  const locale = canonicalizeLocale(requestedLocale, policy.enabledLocales, policy.defaultLocale);

  return {
    locale,
    messages: (await messageLoaders[messageLocale(locale)]()).default,
  };
});

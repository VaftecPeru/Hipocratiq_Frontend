import { canonicalizeLocale, DEFAULT_LOCALE } from "@/i18n/config";

export function getClientLocale(fallback = DEFAULT_LOCALE): string {
  if (typeof document === "undefined") return fallback;

  const cookie = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith("hipocratiq-locale="));
  const requestedLocale = cookie ? decodeURIComponent(cookie.slice("hipocratiq-locale=".length)) : undefined;

  return canonicalizeLocale(requestedLocale, undefined, fallback);
}

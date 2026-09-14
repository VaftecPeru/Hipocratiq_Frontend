import type { Metadata, Viewport } from "next";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import Script from "next/script";
import "@fontsource-variable/roboto-mono";
import "./globals.css";
import type { AppLocale } from "@/i18n/config";
import { AuthPlatformSettingsProvider } from "@/features/auth/ui/auth-platform-settings";
import { LocalePreferenceProvider } from "@/shared/ui/locale-provider";
import { ThemeProvider } from "@/shared/ui/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "Hipocratiq Admin",
    template: "%s | Hipocratiq",
  },
  description: "Administración segura de la plataforma Hipocratiq.",
};

export const viewport: Viewport = {
  themeColor: "#f7f9fc",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, messages, t] = await Promise.all([
    getLocale(),
    getMessages(),
    getTranslations("accessibility"),
  ]);

  return (
    <html lang={locale} className="h-full antialiased" suppressHydrationWarning>
      <body
        className="min-h-full"
      >
        <a className="skip-link" href="#main-content">
          {t("skipToContent")}
        </a>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
            try {
              const stored = window.localStorage.getItem("hipocratiq-theme");
              const preferred = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
              const resolved = preferred === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : preferred === "system" ? "light" : preferred;
              document.documentElement.classList.remove("light", "dark");
              document.documentElement.classList.add(resolved);
            } catch {}
          })();`}
        </Script>
        <LocalePreferenceProvider initialLocale={locale as AppLocale} initialMessages={messages}>
          <AuthPlatformSettingsProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </AuthPlatformSettingsProvider>
        </LocalePreferenceProvider>
      </body>
    </html>
  );
}

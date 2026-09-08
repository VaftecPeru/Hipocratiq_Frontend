import type { Metadata, Viewport } from "next";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import Script from "next/script";
import "@fontsource-variable/roboto-mono";
import "./globals.css";
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
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

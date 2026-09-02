import type { Metadata, Viewport } from "next";
import "@fontsource-variable/roboto-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Hipocratiq Admin",
    template: "%s | Hipocratiq",
  },
  description: "Administración segura de la plataforma Hipocratiq.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body
        className="min-h-full"
      >
        {children}
      </body>
    </html>
  );
}

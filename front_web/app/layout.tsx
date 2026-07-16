import type { Metadata, Viewport } from "next";
import { Manrope, Newsreader } from "next/font/google";
import "@fontsource-variable/roboto-mono";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

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
        className={`${manrope.variable} ${newsreader.variable} min-h-full`}
      >
        {children}
      </body>
    </html>
  );
}

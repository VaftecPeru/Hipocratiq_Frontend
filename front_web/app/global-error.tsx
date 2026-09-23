"use client";

import { useEffect } from "react";
import { useState } from "react";

function readEnglishPreference(): boolean {
  if (typeof document === "undefined") return false;

  const localeCookie = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith("hipocratiq-locale="));

  return localeCookie?.slice("hipocratiq-locale=".length).toLowerCase().startsWith("en") ?? false;
}

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const [isEnglish] = useState(readEnglishPreference);

  useEffect(() => {
    console.error("Global error boundary caught:", error);
  }, [error]);

  const copy = isEnglish
    ? {
        eyebrow: "Something went wrong",
        title: "We could not load the application",
        description: "A problem occurred while loading the application. Please try again.",
        retry: "Try again",
        home: "Go to sign in",
      }
    : {
        eyebrow: "Algo salió mal",
        title: "No pudimos cargar la aplicación",
        description: "Ocurrió un problema mientras se cargaba la aplicación. Inténtalo de nuevo.",
        retry: "Reintentar",
        home: "Ir al inicio de sesión",
      };

  return (
    <html lang={isEnglish ? "en-US" : "es-MX"}>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--paper, #f7f9fc)",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          color: "var(--ink, #101b33)",
        }}
      >
        <div style={{ maxWidth: 420, padding: "0 24px", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--muted, #6e7f9d)", margin: 0 }}>{copy.eyebrow}</p>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: "8px 0 0" }}>
            {copy.title}
          </h1>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "var(--ink-secondary, #496584)",
              margin: "12px 0 24px",
            }}
          >
            {copy.description}
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              border: "none",
              borderRadius: 8,
              background: "var(--ink, #101b33)",
              color: "var(--surface, #ffffff)",
              fontSize: 14,
              fontWeight: 500,
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            {copy.retry}
          </button>
          <button
            type="button"
            onClick={() => window.location.assign("/")}
            style={{
              marginLeft: 12,
              border: "none",
              background: "transparent",
              color: "var(--ink, #101b33)",
              fontSize: 14,
              fontWeight: 500,
              padding: "8px 0",
              cursor: "pointer",
            }}
          >
            {copy.home}
          </button>
        </div>
      </body>
    </html>
  );
}

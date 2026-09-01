"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          color: "#0f172a",
        }}
      >
        <div style={{ maxWidth: 420, padding: "0 24px", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>
            Algo salió mal
          </p>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: "8px 0 0" }}>
            No pudimos cargar la aplicación
          </h1>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "#64748b",
              margin: "12px 0 24px",
            }}
          >
            Ocurrió un problema mientras se cargaba la aplicación. Inténtalo de
            nuevo.
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              border: "none",
              borderRadius: 8,
              background: "#0f172a",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 500,
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
          <button
            type="button"
            onClick={() => window.location.assign("/")}
            style={{
              marginLeft: 12,
              border: "none",
              background: "transparent",
              color: "#0f172a",
              fontSize: 14,
              fontWeight: 500,
              padding: "8px 0",
              cursor: "pointer",
            }}
          >
            Ir al inicio de sesión
          </button>
        </div>
      </body>
    </html>
  );
}

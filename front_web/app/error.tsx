"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("App segment error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6" role="alert">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-medium text-slate-400">Algo salió mal</p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          No pudimos cargar este contenido
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          Ocurrió un problema mientras se cargaba la información. Inténtalo de
          nuevo.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

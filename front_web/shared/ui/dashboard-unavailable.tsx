import Link from "next/link";
import { AlertTriangle, LogIn, RefreshCw } from "lucide-react";

type DashboardUnavailableProps = Readonly<{
  description: string;
  retryHref?: string;
  title: string;
}>;

export function DashboardUnavailable({ description, retryHref, title }: DashboardUnavailableProps) {
  return (
    <main className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center px-5">
      <section className="w-full rounded-2xl border border-danger/25 bg-surface p-7 text-center shadow-[0_0.5rem_1.5rem_rgb(16_27_51/4%)]" role="alert">
        <AlertTriangle className="mx-auto size-7 text-danger" aria-hidden="true" />
        <p className="mt-3 text-xs font-bold text-danger">Panel no disponible</p>
        <h1 className="mt-2 text-xl font-extrabold">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          {retryHref ? (
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-xs font-extrabold text-white transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus"
              href={retryHref}
            >
              <RefreshCw className="size-4" strokeWidth={1.8} aria-hidden="true" />
              Reintentar
            </Link>
          ) : null}
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-4 text-xs font-extrabold text-ink transition-colors hover:bg-surface-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus"
            href="/"
          >
            <LogIn className="size-4" strokeWidth={1.8} aria-hidden="true" />
            Ir al inicio de sesión
          </Link>
        </div>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const t = useTranslations("errorBoundary");

  useEffect(() => {
    console.error("App segment error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 text-ink" role="alert">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-medium text-muted">{t("eyebrow")}</p>
        <h1 className="mt-2 text-xl font-semibold text-ink">{t("segmentTitle")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{t("description")}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-surface transition hover:bg-accent-hover"
          >
            {t("retry")}
          </button>
          <Link
            href="/"
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface-hover"
          >
            {t("home")}
          </Link>
        </div>
      </div>
    </div>
  );
}

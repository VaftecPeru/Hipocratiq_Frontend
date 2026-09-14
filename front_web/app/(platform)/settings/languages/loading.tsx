import { SettingsHeaderSkeleton } from "@/features/platform/ui/settings-primitives";
import { getTranslations } from "next-intl/server";

export default async function LanguagesLoading() {
  const t = await getTranslations("settings.languagesPage");

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-3 py-4 sm:px-5 sm:py-5 lg:px-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{t("loading")}</span>
      <SettingsHeaderSkeleton showAction={false} titleWidth="12rem" />

      <div className="mt-4 animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
        <div className="h-3.5 w-40 rounded bg-line/60" />
        <div className="mt-2 h-2.5 w-72 max-w-full rounded bg-line/40" />
        <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
          <div className="grid gap-2.5">
            {Array.from({ length: 3 }, (_, index) => <div className="h-11 rounded-lg border border-line bg-surface-subtle" key={index} />)}
          </div>
          <div className="grid content-start gap-3"><div className="h-9 rounded-lg border border-line bg-surface-input" /><div className="h-16 rounded-lg bg-accent-soft/60" /><div className="h-16 rounded-lg border border-line bg-surface-subtle" /></div>
        </div>
        <div className="mt-4 h-9 rounded-lg bg-accent-soft sm:w-36" />
      </div>

      <div className="mt-4 animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
        <div className="h-3.5 w-36 rounded bg-line/60" />
        <div className="mt-2 h-2.5 w-64 max-w-full rounded bg-line/40" />
        <div className="mt-4 grid gap-2.5"><div className="h-11 rounded-lg border border-line bg-surface-subtle" /><div className="h-11 rounded-lg border border-line bg-surface-subtle" /><div className="h-9 rounded-lg border border-line bg-surface-input" /></div>
      </div>

      <div className="mt-4 animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4"><div className="h-3.5 w-32 rounded bg-line/60" /><div className="mt-3 h-16 rounded-lg bg-accent-soft/60" /></div>
    </div>
  );
}

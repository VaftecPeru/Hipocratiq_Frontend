import { SettingsHeaderSkeleton } from "@/features/platform/ui/settings-primitives";
import { getTranslations } from "next-intl/server";

export default async function GeneralSettingsLoading() {
  const t = await getTranslations("settings.general");

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-3 py-4 sm:px-5 sm:py-5 lg:px-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{t("loading")}</span>
      <SettingsHeaderSkeleton showAction={false} titleWidth="14rem" />

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-accent/20 border-l-4 bg-accent-soft/55 p-3.5 sm:p-4">
        <div className="size-8 shrink-0 rounded-lg bg-surface" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-2.5 w-28 rounded bg-accent/40" />
          <div className="h-3.5 w-72 max-w-full rounded bg-line/60" />
          <div className="h-2.5 w-full max-w-3xl rounded bg-line/40" />
        </div>
      </div>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        {Array.from({ length: 2 }, (_, index) => (
          <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4" key={index}>
            <div className="h-3.5 w-40 rounded bg-line/60" />
            <div className="mt-2 h-2.5 w-64 max-w-full rounded bg-line/40" />
            <div className="mt-4 grid gap-3">
              {Array.from({ length: index === 0 ? 3 : 2 }, (_, field) => <div className="space-y-1.5" key={field}><div className="h-2.5 w-28 rounded bg-line/50" /><div className="h-9 rounded-lg border border-line bg-surface-input" /></div>)}
            </div>
            <div className="mt-4 h-9 w-full rounded-lg bg-accent-soft sm:w-36" />
          </div>
        ))}
      </div>

      <div className="mt-4 animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
        <div className="h-3.5 w-56 rounded bg-line/60" />
        <div className="mt-2 h-2.5 w-96 max-w-full rounded bg-line/40" />
        <div className="mt-4 grid gap-2.5 min-[26rem]:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <div className="rounded-lg border border-line bg-surface-subtle p-3" key={index}><div className="flex items-center gap-2"><div className="size-7 rounded-lg bg-accent-soft" /><div className="h-2.5 w-24 rounded bg-line/60" /></div><div className="mt-2 h-2.5 w-full rounded bg-line/40" /></div>)}
        </div>
      </div>
    </div>
  );
}

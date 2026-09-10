import { SettingsHeaderSkeleton } from "@/features/platform/ui/settings-primitives";
import { getTranslations } from "next-intl/server";

export default async function EpidemiologicalAiLoading() {
  const t = await getTranslations("settings.ai");

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-3 py-4 sm:px-5 sm:py-5 lg:px-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{t("loading")}</span>
      <SettingsHeaderSkeleton showAction={false} titleWidth="12rem" />
      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
          <div className="h-3.5 w-48 rounded bg-line/60" />
          <div className="mt-2 h-2.5 w-72 max-w-full rounded bg-line/40" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div className="space-y-1.5" key={index}><div className="h-2.5 w-28 rounded bg-line/50" /><div className="h-9 rounded-lg border border-line bg-surface-input" /></div>)}</div>
          <div className="mt-4 h-9 rounded-lg bg-accent-soft sm:w-36" />
        </div>
        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4"><div className="h-3.5 w-40 rounded bg-line/60" /><div className="mt-2 h-2.5 w-56 max-w-full rounded bg-line/40" /><div className="mt-4 h-20 rounded-lg bg-warning-soft/70" /><div className="mt-3 h-16 rounded-lg border border-dashed border-line" /></div>
      </div>
    </div>
  );
}

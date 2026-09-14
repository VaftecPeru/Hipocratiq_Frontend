import { SettingsHeaderSkeleton } from "@/features/platform/ui/settings-primitives";
import { getTranslations } from "next-intl/server";

export default async function IntegrationsLoading() {
  const t = await getTranslations("settings.integrations");

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-3 py-4 sm:px-5 sm:py-5 lg:px-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{t("loading")}</span>
      <SettingsHeaderSkeleton showAction={false} titleWidth="10rem" />
      <div className="mt-4 grid gap-2.5 sm:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div className="animate-pulse rounded-xl border border-line bg-surface p-3.5" key={index}><div className="flex items-center gap-3"><div className="size-9 rounded-lg bg-accent-soft" /><div className="space-y-1.5"><div className="h-2.5 w-28 rounded bg-line/50" /><div className="h-4 w-8 rounded bg-line/70" /></div></div></div>)}</div>
      <div className="mt-4 animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
        <div className="h-3.5 w-44 rounded bg-line/60" />
        <div className="mt-2 h-2.5 w-72 max-w-full rounded bg-line/40" />
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div className="rounded-xl border border-line bg-surface-subtle p-3" key={index}><div className="flex items-start justify-between gap-3"><div className="size-9 rounded-lg bg-surface" /><div className="h-4 w-20 rounded-full bg-line/50" /></div><div className="mt-3 h-3 w-32 rounded bg-line/60" /><div className="mt-2 h-2.5 w-full rounded bg-line/40" /><div className="mt-3 h-2.5 w-24 rounded bg-line/40" /></div>)}</div>
      </div>
    </div>
  );
}

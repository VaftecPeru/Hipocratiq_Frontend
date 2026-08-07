import { SettingsHeaderSkeleton, SettingsStatGridSkeleton } from "@/features/platform/ui/settings-primitives";

export default function BackupsLoading() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando respaldos</span>

      <SettingsHeaderSkeleton titleWidth="8rem" actionWidth="7rem" />

      <SettingsStatGridSkeleton />

      <div className="mt-4 grid gap-3 sm:gap-4 xl:grid-cols-[1fr_22rem]">
        <div className="grid min-w-0 content-start gap-3 sm:gap-4">
          <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
            <div className="h-3.5 w-40 rounded bg-line/60" />
            <div className="mt-3 grid gap-3 min-[26rem]:grid-cols-2 xl:grid-cols-6">
              {Array.from({ length: 6 }, (_, index) => (
                <div className="space-y-1.5" key={index}>
                  <div className="h-2.5 w-20 rounded bg-line/50" />
                  <div className={index === 5 ? "h-9 w-9 rounded-full bg-line/50" : "h-9 rounded-lg border border-line bg-surface-input"} />
                </div>
              ))}
            </div>
            <div className="mt-3 h-10 rounded-lg bg-accent-soft/50" />
          </div>

          <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
            <div className="h-3.5 w-44 rounded bg-line/60" />

            <div className="mt-3 hidden space-y-3 lg:block">
              <div className="flex gap-3 border-b border-line pb-2">
                {["5rem", "4rem", "4rem", "4rem", "4rem", "4rem"].map((width, index) => <div className="h-2.5 rounded bg-line/40" key={index} style={{ width }} />)}
              </div>
              {Array.from({ length: 6 }, (_, index) => (
                <div className="flex items-center gap-3" key={index}>
                  <div className="space-y-1"><div className="h-3 w-24 rounded bg-line/60" /><div className="h-2.5 w-16 rounded bg-line/40" /></div>
                  <div className="space-y-1"><div className="h-3 w-28 rounded bg-line/60" /><div className="h-2.5 w-20 rounded bg-line/40" /></div>
                  <div className="h-3 w-14 rounded bg-line/40" />
                  <div className="h-3 w-16 rounded bg-success/30" />
                  <div className="h-3 w-16 rounded bg-line/40" />
                  <div className="ml-auto flex gap-1"><div className="size-8 rounded-lg bg-surface-subtle" /><div className="size-8 rounded-lg bg-surface-subtle" /></div>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-2.5 lg:hidden">
              {Array.from({ length: 4 }, (_, index) => (
                <div className="rounded-lg border border-line bg-surface-subtle p-3" key={index}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1"><div className="h-3 w-32 rounded bg-line/60" /><div className="h-2.5 w-20 rounded bg-line/40" /></div>
                    <div className="h-4 w-16 rounded bg-success-soft" />
                  </div>
                  <div className="mt-2.5 grid grid-cols-2 gap-2.5 border-t border-line pt-2.5">
                    {Array.from({ length: 3 }, (_, cell) => (
                      <div className="space-y-1" key={cell}><div className="h-2.5 w-16 rounded bg-line/40" /><div className="h-2.5 w-20 rounded bg-line/60" /></div>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-end gap-1 border-t border-line pt-2"><div className="size-8 rounded-lg bg-surface" /><div className="size-8 rounded-lg bg-surface" /></div>
                </div>
              ))}
            </div>

            <div className="mt-2.5 h-9 w-full rounded-lg bg-surface-subtle" />
          </div>
        </div>

        <div className="grid min-w-0 content-start gap-3 sm:gap-4">
          <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
            <div className="h-3.5 w-32 rounded bg-line/60" />
            <div className="mt-2 h-2.5 w-48 rounded bg-line/40" />
            <div className="mt-3 grid gap-2">
              {Array.from({ length: 3 }, (_, index) => (
                <div className="flex items-center gap-2.5 rounded-lg border border-line p-3" key={index}>
                  <div className="size-8 shrink-0 rounded-lg bg-accent-soft" />
                  <div className="min-w-0 flex-1 space-y-1.5"><div className="h-2.5 w-32 rounded bg-line/60" /><div className="h-2.5 w-40 rounded bg-line/40" /></div>
                  <div className="size-3.5 shrink-0 rounded bg-line/40" />
                </div>
              ))}
            </div>
            <div className="mt-3 h-12 rounded-lg bg-accent-soft/50" />
          </div>

          <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
            <div className="h-3.5 w-44 rounded bg-line/60" />
            <div className="mt-3 grid gap-2.5">
              {Array.from({ length: 4 }, (_, index) => (
                <div className="space-y-1.5" key={index}>
                  <div className="flex justify-between"><div className="h-2.5 w-24 rounded bg-line/50" /><div className="h-2.5 w-24 rounded bg-line/50" /></div>
                  <div className="h-1.5 w-full rounded-full bg-line/60" />
                </div>
              ))}
            </div>
          </div>

          <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
            <div className="divide-y divide-line">
              {Array.from({ length: 4 }, (_, index) => (
                <div className="flex items-center justify-between gap-3 py-2.5" key={index}>
                  <div className="flex items-center gap-2"><div className="size-3.5 rounded bg-accent/40" /><div className="h-2.5 w-24 rounded bg-line/50" /></div>
                  <div className="h-2.5 w-32 rounded bg-line/60" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

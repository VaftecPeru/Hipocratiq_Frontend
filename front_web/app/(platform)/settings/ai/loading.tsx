import { SettingsHeaderSkeleton, SettingsStatGridSkeleton } from "@/features/platform/ui/settings-primitives";

export default function EpidemiologicalAiLoading() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando IA epidemiológica</span>

      <SettingsHeaderSkeleton titleWidth="12rem" />

      <SettingsStatGridSkeleton />

      <div className="mt-4 grid gap-3 sm:gap-4 xl:grid-cols-[1.15fr_1fr_0.85fr]">
        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="h-3.5 w-40 rounded bg-line/60" />
            <div className="flex gap-2"><div className="h-8 w-28 rounded-lg bg-surface-subtle" /><div className="size-8 rounded-lg bg-surface-subtle" /></div>
          </div>
          <div className="mt-3 grid gap-3 min-[26rem]:grid-cols-2">
            {Array.from({ length: 2 }, (_, index) => (
              <div key={index}>
                <div className="flex items-center gap-1.5"><div className="h-3.5 w-5 rounded-xs bg-line/60" /><div className="h-2.5 w-16 rounded bg-line/60" /></div>
                <div className="mt-2 h-28 rounded-lg border border-line bg-surface-subtle" />
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-3">
            {Array.from({ length: 3 }, (_, index) => <div className="h-2.5 w-20 rounded bg-line/40" key={index} />)}
          </div>
        </div>

        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
          <div className="h-3.5 w-44 rounded bg-line/60" />
          <div className="mt-3 grid gap-3 min-[26rem]:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="space-y-1.5" key={index}><div className="h-2.5 w-28 rounded bg-line/50" /><div className="h-9 rounded-lg border border-line bg-surface-input" /></div>
            ))}
          </div>
          <div className="mt-4">
            <div className="h-2.5 w-32 rounded bg-line/50" />
            <div className="mt-2 flex flex-wrap gap-2">
              {["7rem", "5.5rem", "8rem", "10rem"].map((width, index) => <div className="h-8 rounded-lg border border-line bg-surface-subtle" key={`${width}-${index}`} style={{ width }} />)}
            </div>
          </div>
        </div>

        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
          <div className="h-3.5 w-32 rounded bg-line/60" />
          <div className="mt-3 divide-y divide-line">
            {Array.from({ length: 5 }, (_, index) => (
              <div className="flex items-center gap-2.5 py-2.5" key={index}>
                <div className="size-7 shrink-0 rounded-lg bg-accent-soft" />
                <div className="h-3 flex-1 rounded bg-line/50" />
                <div className="h-4 w-18 shrink-0 rounded-full bg-success-soft" />
                <div className="size-3.5 shrink-0 rounded bg-line/40" />
              </div>
            ))}
          </div>
          <div className="mt-2.5 h-9 rounded-lg bg-accent-soft/50" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:gap-4 xl:grid-cols-[1fr_22rem]">
        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
          <div className="h-3.5 w-44 rounded bg-line/60" />

          <div className="mt-3 hidden space-y-3 lg:block">
            <div className="flex gap-3 border-b border-line pb-2">
              {["4rem", "6rem", "3.5rem", "5rem", "4rem"].map((width, index) => <div className="h-2.5 rounded bg-line/40" key={`${width}-${index}`} style={{ width }} />)}
            </div>
            {Array.from({ length: 5 }, (_, index) => (
              <div className="flex items-center gap-3" key={index}>
                <div className="h-3 w-24 rounded bg-line/60" />
                <div className="h-3 w-36 rounded bg-line/50" />
                <div className="h-4 w-12 rounded bg-line/40" />
                <div className="h-3 w-32 rounded bg-line/40" />
                <div className="ml-auto h-4 w-16 rounded bg-line/40" />
              </div>
            ))}
          </div>

          <div className="mt-3 grid gap-2.5 lg:hidden">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="rounded-lg border border-line bg-surface-subtle p-3" key={index}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2"><div className="h-3.5 w-5 rounded-xs bg-line/60" /><div className="h-3 w-24 rounded bg-line/60" /></div>
                  <div className="h-4 w-12 rounded bg-line/40" />
                </div>
                <div className="mt-2 h-3 w-40 rounded bg-line/50" />
                <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2.5">
                  <div className="h-2.5 w-32 rounded bg-line/40" />
                  <div className="h-4 w-16 rounded bg-success-soft" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2.5 h-9 w-full rounded-lg bg-surface-subtle" />
        </div>

        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
          <div className="h-3.5 w-44 rounded bg-line/60" />
          <div className="mt-3 grid gap-2.5">
            {Array.from({ length: 2 }, (_, index) => (
              <div className="rounded-lg border border-line bg-surface-subtle p-3" key={index}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><div className="h-4 w-6 rounded-xs bg-line/60" /><div className="h-3 w-16 rounded bg-line/60" /></div>
                  <div className="h-4 w-20 rounded-full bg-success-soft" />
                </div>
                <div className="mt-2 h-2.5 w-40 rounded bg-line/40" />
                <div className="mt-1 h-2.5 w-48 rounded bg-line/40" />
              </div>
            ))}
          </div>
          <div className="mt-3 h-2.5 w-56 rounded bg-line/40" />
        </div>
      </div>
    </div>
  );
}

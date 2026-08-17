import { SettingsHeaderSkeleton } from "@/features/platform/ui/settings-primitives";

export default function GeneralSettingsLoading() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando configuración general</span>

      <SettingsHeaderSkeleton titleWidth="14rem" actionWidth="9rem" />

      <div className="mt-4 grid gap-3 sm:gap-4 xl:grid-cols-3">
        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
          <div className="h-3.5 w-44 rounded bg-line/60" />
          <div className="mt-3 grid gap-2.5">
            {Array.from({ length: 3 }, (_, index) => (
              <div className="flex items-center gap-3 rounded-lg border border-line bg-surface-subtle p-2.5" key={index}>
                <div className="size-12 shrink-0 rounded-lg border border-line bg-surface" />
                <div className="min-w-0 flex-1 space-y-1.5"><div className="h-3 w-28 rounded bg-line/60" /><div className="h-2.5 w-40 max-w-full rounded bg-line/40" /></div>
                <div className="h-8 w-18 shrink-0 rounded-lg bg-surface" />
              </div>
            ))}
          </div>
        </div>

        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
          <div className="h-3.5 w-40 rounded bg-line/60" />
          <div className="mt-3 grid gap-3">
            {Array.from({ length: 8 }, (_, index) => (
              <div className="space-y-1.5" key={index}>
                <div className="h-2.5 w-28 rounded bg-line/50" />
                <div className="h-9 rounded-lg border border-line bg-surface-input" />
              </div>
            ))}
          </div>
          <div className="mt-3.5 h-9 w-full rounded-lg bg-accent-soft sm:w-36" />
        </div>

        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
          <div className="h-3.5 w-52 rounded bg-line/60" />
          <div className="mt-2 h-2.5 w-56 max-w-full rounded bg-line/40" />
          <div className="mt-3 grid gap-2.5">
            {Array.from({ length: 2 }, (_, index) => (
              <div className="flex items-center gap-2.5" key={index}><div className="size-4 rounded bg-line/50" /><div className="h-3.5 w-5 rounded-xs bg-line/60" /><div className="h-3 w-16 rounded bg-line/60" /></div>
            ))}
          </div>
          <div className="mt-4 grid gap-3">
            {Array.from({ length: 2 }, (_, index) => (
              <div className="space-y-1.5" key={index}>
                <div className="h-2.5 w-28 rounded bg-line/50" />
                <div className="h-9 rounded-lg border border-line bg-surface-input" />
              </div>
            ))}
          </div>
        </div>

        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
          <div className="h-3.5 w-36 rounded bg-line/60" />
          <div className="mt-3 grid gap-2">
            {Array.from({ length: 5 }, (_, index) => (
              <div className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-subtle p-2.5" key={index}>
                <div className="size-7 shrink-0 rounded-lg bg-accent-soft" />
                <div className="min-w-0 flex-1 space-y-1.5"><div className="h-2.5 w-32 max-w-full rounded bg-line/60" /><div className="h-2.5 w-24 rounded bg-line/40" /></div>
                <div className="h-4 w-14 shrink-0 rounded-full bg-line/50" />
                <div className="size-8 shrink-0 rounded-lg bg-surface" />
              </div>
            ))}
          </div>
        </div>

        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
          <div className="h-3.5 w-64 max-w-full rounded bg-line/60" />
          <div className="mt-3 grid gap-2.5 min-[26rem]:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div className="rounded-lg border border-line p-3" key={index}>
                <div className="flex items-center gap-2"><div className="size-7 shrink-0 rounded-lg bg-accent-soft" /><div className="h-2.5 w-20 rounded bg-line/60" /></div>
                <div className="mt-2 h-2.5 w-full rounded bg-line/40" />
                <div className="mt-2 h-2.5 w-4 rounded bg-accent/40" />
              </div>
            ))}
          </div>
        </div>

        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-1.5"><div className="h-3.5 w-40 rounded bg-line/60" /><div className="h-2.5 w-full max-w-64 rounded bg-line/40" /></div>
            <div className="h-5 w-9 shrink-0 rounded-full bg-line/60" />
          </div>
          <div className="mt-3 grid gap-3 min-[26rem]:grid-cols-[8rem_1fr]">
            <div className="h-28 rounded-lg border border-line bg-surface-subtle" />
            <div className="min-w-0 space-y-1.5"><div className="h-2.5 w-40 max-w-full rounded bg-line/50" /><div className="h-24 rounded-lg border border-line bg-surface-input" /></div>
          </div>
        </div>
      </div>

      <div className="mt-3 animate-pulse rounded-xl border border-line bg-surface p-3 sm:mt-4 sm:p-4">
        <div className="h-3.5 w-44 rounded bg-line/60" />
        <div className="mt-3 grid gap-2.5 min-[26rem]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div className="rounded-lg border border-line bg-surface-subtle p-3" key={index}>
              <div className="flex items-center gap-2"><div className="size-7 shrink-0 rounded-lg bg-accent-soft" /><div className="h-2.5 w-20 rounded bg-line/50" /></div>
              <div className="mt-2 h-4 w-20 rounded bg-line/70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

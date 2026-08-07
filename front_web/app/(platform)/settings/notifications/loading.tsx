import { SettingsHeaderSkeleton, SettingsStatGridSkeleton } from "@/features/platform/ui/settings-primitives";

export default function NotificationsLoading() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando notificaciones</span>

      <SettingsHeaderSkeleton titleWidth="11rem" actionWidth="7rem" />

      <SettingsStatGridSkeleton />

      <div className="mt-4 grid gap-3 sm:gap-4 xl:grid-cols-[0.85fr_1.2fr_0.95fr]">
        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
          <div className="h-3.5 w-40 rounded bg-line/60" />
          <div className="mt-3 grid gap-2">
            {Array.from({ length: 5 }, (_, index) => (
              <div className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-subtle p-2.5" key={index}>
                <div className="size-7 shrink-0 rounded-lg bg-accent-soft" />
                <div className="min-w-0 flex-1 space-y-1.5"><div className="h-2.5 w-20 rounded bg-line/60" /><div className="h-2.5 w-32 rounded bg-line/40" /></div>
                <div className="h-5 w-9 shrink-0 rounded-full bg-line/60" />
              </div>
            ))}
          </div>
          <div className="mt-3 h-10 rounded-lg bg-accent-soft/50" />
        </div>

        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
          <div className="h-3.5 w-36 rounded bg-line/60" />
          <div className="mt-2 h-2.5 w-72 max-w-full rounded bg-line/40" />

          <div className="mt-3 hidden space-y-3 sm:block">
            <div className="flex gap-4 border-b border-line pb-2">
              {["4rem", "3rem", "4.5rem", "2.5rem", "2.5rem"].map((width) => <div className="h-2.5 rounded bg-line/40" key={width} style={{ width }} />)}
            </div>
            {Array.from({ length: 6 }, (_, index) => (
              <div className="flex items-center gap-4" key={index}>
                <div className="h-3 w-32 rounded bg-line/60" />
                {Array.from({ length: 4 }, (_, cell) => <div className="size-4 rounded bg-line/40" key={cell} />)}
              </div>
            ))}
          </div>

          <div className="mt-3 grid gap-2.5 sm:hidden">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="rounded-lg border border-line bg-surface-subtle p-3" key={index}>
                <div className="h-3 w-32 rounded bg-line/60" />
                <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-line pt-2.5">
                  {Array.from({ length: 4 }, (_, cell) => (
                    <div className="flex items-center gap-2" key={cell}><div className="size-4 shrink-0 rounded bg-line/40" /><div className="h-2.5 w-14 rounded bg-line/50" /></div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 h-10 rounded-lg bg-accent-soft/50" />
        </div>

        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
          <div className="h-3.5 w-44 rounded bg-line/60" />
          <div className="mt-3 grid gap-3">
            {Array.from({ length: 5 }, (_, index) => (
              <div className="flex items-center justify-between gap-3" key={index}>
                <div className="min-w-0 space-y-1.5"><div className="h-2.5 w-28 rounded bg-line/50" /><div className="h-2.5 w-20 rounded bg-line/40" /></div>
                <div className={index % 2 === 0 ? "h-9 w-32 shrink-0 rounded-lg border border-line bg-surface-input" : "h-5 w-9 shrink-0 rounded-full bg-line/60"} />
              </div>
            ))}
          </div>
          <div className="mt-3 h-10 rounded-lg bg-accent-soft/50" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:gap-4 xl:grid-cols-[1.35fr_1fr]">
        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
          <div className="h-3.5 w-40 rounded bg-line/60" />
          <div className="mt-2 h-2.5 w-64 max-w-full rounded bg-line/40" />

          <div className="mt-3 hidden space-y-3 lg:block">
            <div className="flex gap-3 border-b border-line pb-2">
              {["6rem", "5rem", "4rem", "6rem", "4rem"].map((width) => <div className="h-2.5 rounded bg-line/40" key={width} style={{ width }} />)}
            </div>
            {Array.from({ length: 5 }, (_, index) => (
              <div className="flex items-center gap-3" key={index}>
                <div className="h-3 w-32 rounded bg-line/50" />
                <div className="h-3 w-28 rounded bg-line/60" />
                <div className="h-3 w-20 rounded bg-line/40" />
                <div className="h-3 w-36 rounded bg-line/40" />
                <div className="ml-auto h-4 w-20 rounded bg-success-soft" />
              </div>
            ))}
          </div>

          <div className="mt-3 grid gap-2.5 lg:hidden">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="rounded-lg border border-line bg-surface-subtle p-3" key={index}>
                <div className="flex items-start justify-between gap-2">
                  <div className="h-3 w-36 rounded bg-line/60" />
                  <div className="h-4 w-20 rounded bg-success-soft" />
                </div>
                <div className="mt-2.5 grid gap-2 border-t border-line pt-2.5">
                  {Array.from({ length: 3 }, (_, row) => (
                    <div className="flex items-center justify-between gap-2" key={row}><div className="h-2.5 w-16 rounded bg-line/40" /><div className="h-2.5 w-28 rounded bg-line/60" /></div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2.5 h-9 w-full rounded-lg bg-surface-subtle" />
        </div>

        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
          <div className="h-3.5 w-44 rounded bg-line/60" />
          <div className="mt-2 h-2.5 w-56 rounded bg-line/40" />
          <div className="mt-3 grid gap-2.5">
            {Array.from({ length: 3 }, (_, index) => (
              <div className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-subtle p-3" key={index}>
                <div className="size-8 shrink-0 rounded-lg bg-accent-soft" />
                <div className="min-w-0 flex-1 space-y-1.5"><div className="h-2.5 w-32 rounded bg-line/60" /><div className="h-2.5 w-full rounded bg-line/40" /></div>
                <div className="h-8 w-12 shrink-0 rounded-lg bg-surface" />
              </div>
            ))}
          </div>
          <div className="mt-2.5 h-9 rounded-lg bg-accent-soft/50" />
        </div>
      </div>
    </div>
  );
}

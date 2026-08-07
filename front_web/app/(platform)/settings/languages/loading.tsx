export default function LanguagesLoading() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando configuración de idiomas y región</span>

      <div className="min-w-0">
        <div className="h-6 w-44 rounded-lg bg-line/70 sm:h-7" />
        <div className="mt-2 h-3 w-80 max-w-full rounded bg-line/50" />
      </div>

      <div className="mt-4 flex gap-4 border-b border-line pb-2.5">
        <div className="h-3.5 w-28 rounded bg-accent/40" />
        <div className="h-3.5 w-36 rounded bg-line/40" />
      </div>

      <div className="mt-4 grid gap-3 sm:gap-4">
        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex min-w-0 gap-2.5">
              <div className="size-8 shrink-0 rounded-lg bg-accent-soft" />
              <div className="min-w-0 space-y-1.5"><div className="h-3.5 w-20 rounded bg-line/60" /><div className="h-2.5 w-72 max-w-full rounded bg-line/40" /></div>
            </div>
            <div className="h-9 w-full shrink-0 rounded-lg bg-accent-soft sm:w-32" />
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_18rem] lg:gap-4">
            <div className="min-w-0 rounded-lg border border-line p-3">
              <div className="h-2.5 w-32 rounded bg-line/60" />

              <div className="mt-3 hidden space-y-3 lg:block">
                <div className="flex gap-3 border-b border-line pb-2">
                  {["6rem", "4rem", "6rem"].map((width) => <div className="h-2.5 rounded bg-line/40" key={width} style={{ width }} />)}
                </div>
                {Array.from({ length: 2 }, (_, index) => (
                  <div className="flex items-center gap-3" key={index}>
                    <div className="h-3.5 w-5 rounded-xs bg-line/60" />
                    <div className="h-3 w-28 rounded bg-line/60" />
                    <div className="h-3 w-12 rounded bg-line/40" />
                    <div className="ml-auto h-4 w-20 rounded-full bg-line/40" />
                    <div className="size-8 rounded-lg bg-surface-subtle" />
                  </div>
                ))}
              </div>

              <div className="mt-3 grid gap-2.5 lg:hidden">
                {Array.from({ length: 2 }, (_, index) => (
                  <div className="rounded-lg border border-line bg-surface-subtle p-3" key={index}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2"><div className="h-3.5 w-5 rounded-xs bg-line/60" /><div className="h-3 w-28 rounded bg-line/60" /></div>
                      <div className="h-4 w-20 rounded-full bg-line/40" />
                    </div>
                    <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2.5">
                      <div className="h-2.5 w-20 rounded bg-line/40" />
                      <div className="flex gap-1"><div className="size-8 rounded-lg bg-surface" /><div className="size-8 rounded-lg bg-surface" /></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 h-10 rounded-lg bg-accent-soft/60" />
            </div>

            <div className="min-w-0 rounded-lg border border-line p-3">
              <div className="h-2.5 w-36 rounded bg-line/60" />
              <div className="mt-3 space-y-1.5"><div className="h-2.5 w-20 rounded bg-line/50" /><div className="h-9 rounded-lg border border-line bg-surface-input" /></div>
              <div className="mt-3 h-2.5 w-full rounded bg-line/40" />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
          <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
            <div className="flex gap-2.5">
              <div className="size-8 shrink-0 rounded-lg bg-accent-soft" />
              <div className="min-w-0 space-y-1.5"><div className="h-3.5 w-20 rounded bg-line/60" /><div className="h-2.5 w-56 max-w-full rounded bg-line/40" /></div>
            </div>
            <div className="mt-3 space-y-3">
              <div className="space-y-1.5"><div className="h-2.5 w-32 rounded bg-line/50" /><div className="h-9 rounded-lg border border-line bg-surface-input" /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 2 }, (_, index) => (
                  <div className="space-y-1.5" key={index}><div className="h-2.5 w-32 rounded bg-line/50" /><div className="h-9 rounded-lg border border-line bg-surface-input" /></div>
                ))}
              </div>
            </div>
            <div className="mt-3 h-10 rounded-lg bg-accent-soft/60" />
          </div>

          <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
            <div className="flex gap-2.5">
              <div className="size-8 shrink-0 rounded-lg bg-accent-soft" />
              <div className="min-w-0 space-y-1.5"><div className="h-3.5 w-44 rounded bg-line/60" /><div className="h-2.5 w-64 max-w-full rounded bg-line/40" /></div>
            </div>
            <div className="mt-3 divide-y divide-line">
              {Array.from({ length: 5 }, (_, index) => (
                <div className="flex items-center justify-between gap-3 py-2.5" key={index}>
                  <div className="flex items-center gap-2"><div className="size-3.5 shrink-0 rounded bg-accent/40" /><div className="h-2.5 w-32 rounded bg-line/50" /></div>
                  <div className="h-2.5 w-36 rounded bg-line/60" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex animate-pulse flex-col items-start justify-between gap-3 rounded-xl border border-line bg-surface p-3 sm:flex-row sm:items-center sm:p-3.5">
        <div className="flex items-center gap-2"><div className="size-4 shrink-0 rounded-full bg-success/40" /><div className="h-2.5 w-96 max-w-full rounded bg-line/40" /></div>
        <div className="h-9 w-full shrink-0 rounded-lg bg-accent-soft sm:w-36" />
      </div>
    </div>
  );
}

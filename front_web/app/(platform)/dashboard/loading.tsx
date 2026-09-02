const skeletonCards = Array.from({ length: 5 });
const usageCards = Array.from({ length: 4 });

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Preparando el panel de control global</span>

      <div className="motion-safe:animate-pulse">
        <header className="flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="h-2.5 w-32 rounded bg-accent-soft" />
            <div className="mt-3 h-8 w-72 max-w-full rounded-lg bg-line/60 sm:w-96" />
            <div className="mt-3 h-3 w-136 max-w-full rounded bg-line/40" />
          </div>
          <div className="h-3 w-40 rounded bg-line/40" />
        </header>

        <section className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-5" aria-hidden="true">
          {skeletonCards.map((_, index) => (
            <div className={index === skeletonCards.length - 1 ? "col-span-2 xl:col-span-1" : ""} key={index}>
              <div className="rounded-xl border border-line bg-surface p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="h-3 w-24 rounded bg-line/50" />
                  <div className="size-7 rounded-lg bg-accent-soft" />
                </div>
                <div className="mt-4 h-6 w-24 rounded bg-line/60" />
                <div className="mt-2 h-2.5 w-20 rounded bg-line/40" />
              </div>
            </div>
          ))}
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]" aria-hidden="true">
          <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <div className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div><div className="h-2.5 w-36 rounded bg-accent-soft" /><div className="mt-2 h-4 w-52 rounded bg-line/60" /></div>
              <div className="h-8 w-36 rounded bg-line/50" />
            </div>
            <div className="mt-5 h-60 rounded-xl bg-[linear-gradient(to_bottom,var(--surface-subtle),transparent)]">
              <div className="h-full w-full bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_3.65rem,var(--line)_3.65rem,var(--line)_3.7rem)] opacity-70" />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="h-2.5 w-28 rounded bg-line/40" />
            <div className="mt-2 h-4 w-40 rounded bg-line/60" />
            <div className="mx-auto mt-6 grid size-40 place-items-center rounded-full bg-line/50">
              <div className="size-28 rounded-full bg-surface" />
            </div>
            <div className="mt-6 space-y-3">
              <div className="h-4 rounded bg-line/40" />
              <div className="h-4 rounded bg-line/40" />
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 3 }, (_, index) => (
            <div className={`min-h-72 rounded-2xl border border-line bg-surface p-5 ${index === 2 ? "md:col-span-2 xl:col-span-1" : ""}`} key={index}>
              <div className="flex items-start justify-between">
                <div><div className="h-2.5 w-24 rounded bg-line/40" /><div className="mt-2 h-4 w-32 rounded bg-line/60" /></div>
                <div className="size-8 rounded-lg bg-accent-soft" />
              </div>
              <div className="mt-6 space-y-4">
                <div className="h-12 rounded-lg bg-line/35" />
                <div className="h-12 rounded-lg bg-line/30" />
                <div className="h-12 rounded-lg bg-line/25" />
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8" aria-hidden="true">
          <div className="h-2.5 w-24 rounded bg-accent-soft" />
          <div className="mt-2 h-5 w-36 rounded bg-line/60" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {usageCards.map((_, index) => (
              <div className="rounded-xl border border-line bg-surface p-4" key={index}>
                <div className="flex items-center gap-2"><div className="size-7 rounded-lg bg-accent-soft" /><div className="h-3 w-20 rounded bg-line/50" /></div>
                <div className="mt-4 h-6 w-24 rounded bg-line/60" />
                <div className="mt-2 h-2.5 w-28 rounded bg-line/40" />
                <div className="mt-4 h-10 rounded bg-line/25" />
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-8 flex justify-between border-t border-line py-5" aria-hidden="true">
          <div className="h-2.5 w-48 rounded bg-line/40" />
          <div className="hidden h-2.5 w-36 rounded bg-line/40 sm:block" />
        </footer>
      </div>
    </div>
  );
}

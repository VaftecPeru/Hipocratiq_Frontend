export default function DashboardLoading() {
  return (
    <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-5 py-8 sm:px-8 xl:grid-cols-[1fr_18rem] lg:px-12 lg:py-10" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Preparando tu dashboard</span>

      <section className="animate-pulse">
        <div className="h-3 w-24 rounded bg-line/60" />
        <div className="mt-3 h-9 w-64 rounded-lg bg-line/50" />

        <div className="mt-8 grid gap-px rounded-xl border border-line bg-line sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="grid min-h-44 content-between gap-3 bg-surface p-5" key={index}>
              <div className="h-3 w-6 rounded bg-accent-soft" />
              <div className="self-end">
                <div className="h-4 w-36 rounded bg-line/60" />
                <div className="mt-2 h-3 w-48 max-w-full rounded bg-line/40" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="h-fit animate-pulse rounded-xl border border-line bg-surface p-5 xl:mt-6">
        <div className="h-3 w-20 rounded bg-line/60" />
        <div className="mt-5 space-y-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index}>
              <div className="h-2.5 w-16 rounded bg-line/40" />
              <div className="mt-1.5 h-3.5 w-32 rounded bg-line/60" />
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-2 border-t border-line pt-4">
          <div className="size-2 rounded-full bg-line/50" />
          <div className="h-3 w-20 rounded bg-line/50" />
        </div>
      </aside>
    </div>
  );
}

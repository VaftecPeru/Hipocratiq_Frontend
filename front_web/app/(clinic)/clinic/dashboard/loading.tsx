export default function ClinicDashboardLoading() {
  return (
    <main
      className="mx-auto w-full max-w-360 px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Cargando panel operativo de la clínica</span>

      <header className="flex animate-pulse flex-col justify-between gap-5 border-b border-line pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="h-2.5 w-28 rounded bg-accent-soft" />
          <div className="mt-3 h-8 w-52 rounded-lg bg-line/60" />
          <div className="mt-2 h-3.5 w-80 max-w-full rounded bg-line/40" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-10 w-32 rounded-xl bg-line/40" />
          <div className="h-10 w-32 rounded-xl bg-accent-soft" />
        </div>
      </header>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="animate-pulse rounded-2xl border border-line bg-surface p-5" key={index}>
            <div className="flex justify-between">
              <div className="size-10 rounded-xl bg-surface-subtle" />
              <div className="h-6 w-20 rounded-full bg-line/40" />
            </div>
            <div className="mt-5 h-3 w-28 rounded bg-line/40" />
            <div className="mt-2 h-6 w-36 rounded bg-line/60" />
          </div>
        ))}
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-12" aria-hidden="true">
        {[
          ["agenda", "xl:col-span-5"],
          ["billing", "xl:col-span-4"],
          ["epidemiology", "xl:col-span-3"],
        ].map(([key, span]) => (
          <div
            className={`min-h-80 animate-pulse rounded-2xl border border-line bg-surface p-5 ${span}`}
            key={key}
          >
            <div className="h-4 w-36 rounded bg-line/60" />
            <div className="mt-2 h-3 w-52 rounded bg-line/40" />
            <div className="mt-8 h-52 rounded-xl bg-surface-subtle" />
          </div>
        ))}
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-line bg-surface" aria-hidden="true">
        <div className="animate-pulse border-b border-line p-5">
          <div className="h-4 w-40 rounded bg-line/60" />
          <div className="mt-2 h-3 w-64 rounded bg-line/40" />
        </div>
        <div className="divide-y divide-line">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="grid animate-pulse grid-cols-[2rem_1fr] items-center gap-3 px-5 py-4" key={index}>
              <div className="size-8 rounded-full bg-surface-subtle" />
              <div>
                <div className="h-3 w-40 rounded bg-line/50" />
                <div className="mt-2 h-2.5 w-28 rounded bg-line/30" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

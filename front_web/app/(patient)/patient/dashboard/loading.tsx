export default function PatientDashboardLoading() {
  return (
    <main className="min-h-dvh bg-paper px-4 py-5 sm:px-6 sm:py-7 lg:px-8" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando portal del paciente</span>
      <div className="mx-auto w-full max-w-300 animate-pulse">
        <header className="flex items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <div className="h-2.5 w-28 rounded bg-accent-soft" />
            <div className="mt-2 h-6 w-36 rounded-md bg-line/60" />
          </div>
          <div className="h-10 w-28 rounded-lg bg-surface-subtle" />
        </header>

        <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(17rem,0.75fr)]">
          <div className="min-h-75 rounded-2xl bg-accent/80 p-5 sm:min-h-68 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="h-3 w-28 rounded bg-white/25" />
              <div className="h-6 w-21 rounded-md bg-white/20" />
            </div>
            <div className="mt-8 h-8 w-56 max-w-full rounded-lg bg-white/25" />
            <div className="mt-4 h-3.5 w-52 max-w-full rounded bg-white/20" />
            <div className="mt-6 flex items-center gap-3 border-t border-white/15 pt-4">
              <div className="size-10 rounded-xl bg-white/20" />
              <div>
                <div className="h-3.5 w-36 rounded bg-white/25" />
                <div className="mt-2 h-2.5 w-44 max-w-full rounded bg-white/15" />
              </div>
            </div>
          </div>

          <div className="min-h-68 rounded-2xl border border-success/10 bg-success-soft p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="h-2.5 w-24 rounded bg-success/15" />
                <div className="mt-3 h-6 w-36 rounded bg-success/20" />
              </div>
              <div className="size-10 rounded-xl bg-white/70" />
            </div>
            <div className="mt-3 h-3 w-full rounded bg-success/10" />
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="h-24 rounded-xl bg-white/70" />
              <div className="h-24 rounded-xl bg-white/70" />
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="min-h-58 rounded-2xl border border-line bg-surface p-5" key={index}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="h-2.5 w-24 rounded bg-line/40" />
                  <div className="mt-2 h-4 w-36 rounded bg-line/60" />
                </div>
                <div className="size-9 rounded-lg bg-surface-subtle" />
              </div>
              <div className="mt-5 h-3 w-full rounded bg-line/40" />
              <div className="mt-2 h-3 w-4/5 rounded bg-line/30" />
              <div className="mt-5 h-9 rounded-lg bg-surface-subtle" />
              <div className="mt-5 h-3 w-24 rounded bg-accent-soft" />
            </div>
          ))}
        </section>

        <section className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-2.5 w-20 rounded bg-line/40" />
                <div className="mt-2 h-4 w-28 rounded bg-line/60" />
              </div>
              <div className="size-9 rounded-lg bg-accent-soft" />
            </div>
            <div className="mt-5 space-y-4">
              {Array.from({ length: 2 }, (_, index) => (
                <div className="flex items-center gap-3" key={index}>
                  <div className="size-11 shrink-0 rounded-lg bg-surface-subtle" />
                  <div className="flex-1">
                    <div className="h-3 w-2/3 rounded bg-line/50" />
                    <div className="mt-2 h-2.5 w-full rounded bg-line/30" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <div className="h-2.5 w-24 rounded bg-line/40" />
            <div className="mt-2 h-4 w-28 rounded bg-line/60" />
            <div className="mt-5 grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }, (_, index) => (
                <div className="h-20 rounded-xl bg-surface-subtle" key={index} />
              ))}
            </div>
          </div>
        </section>

        <div className="mt-4 flex min-h-21 items-center justify-between gap-4 rounded-2xl bg-ink p-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="size-10 shrink-0 rounded-xl bg-white/10" />
            <div>
              <div className="h-3.5 w-56 max-w-full rounded bg-white/20" />
              <div className="mt-2 h-2.5 w-64 max-w-full rounded bg-white/10" />
            </div>
          </div>
          <div className="hidden h-10 w-40 rounded-lg bg-success/70 sm:block" />
        </div>
      </div>
    </main>
  );
}

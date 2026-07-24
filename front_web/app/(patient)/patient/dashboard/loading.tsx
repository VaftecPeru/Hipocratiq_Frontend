export default function PatientDashboardLoading() {
  return (
    <main className="min-h-dvh bg-paper px-5 py-8 sm:px-8" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando portal del paciente</span>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="flex animate-pulse items-center justify-between gap-4">
          <div>
            <div className="h-3 w-28 rounded bg-line/50" />
            <div className="mt-3 h-7 w-44 rounded-lg bg-line/60" />
          </div>
          <div className="h-10 w-32 rounded-lg bg-surface-subtle" />
        </header>

        {/* Cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }, (_, index) => (
            <div
              className="animate-pulse rounded-2xl border border-line bg-white p-6"
              key={index}
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="size-10 rounded-xl bg-surface-subtle" />
              <div className="mt-5 h-4 w-36 rounded bg-line/60" />
              <div className="mt-2 h-3 w-52 rounded bg-line/40" />
            </div>
          ))}
        </div>

        {/* Plan section */}
        <div className="mt-4 animate-pulse rounded-2xl border border-line bg-white p-6" style={{ animationDelay: "240ms" }}>
          <div className="flex items-start gap-4">
            <div className="mt-0.5 size-5 shrink-0 rounded bg-accent-soft" />
            <div className="flex-1">
              <div className="h-4 w-28 rounded bg-line/60" />
              <div className="mt-2 h-3 w-full max-w-md rounded bg-line/40" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

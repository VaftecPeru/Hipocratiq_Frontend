export default function DoctorDashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-300 px-4 py-6 sm:px-6 lg:px-8" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando panel del doctor</span>

      {/* Header */}
      <div className="flex animate-pulse flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="h-3 w-28 rounded bg-accent-soft" />
          <div className="mt-3 h-8 w-52 rounded-lg bg-line/60" />
          <div className="mt-2 h-3.5 w-64 max-w-full rounded bg-line/40" />
        </div>
        <div className="h-8 w-36 rounded-full bg-success-soft" />
      </div>

      {/* Metric cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            className="animate-pulse rounded-xl border border-line bg-white p-4"
            key={index}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="size-9 rounded-lg bg-accent-soft" />
            <div className="mt-4 h-3 w-20 rounded bg-line/50" />
            <div className="mt-2 h-4 w-32 rounded bg-line/60" />
          </div>
        ))}
      </div>

      {/* Agenda + Profile */}
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="animate-pulse rounded-xl border border-line bg-white p-5">
          <div className="h-4 w-24 rounded bg-line/60" />
          <div className="mt-8 grid place-items-center py-10">
            <div className="size-12 rounded-full bg-surface-subtle" />
            <div className="mt-4 h-3.5 w-48 rounded bg-line/50" />
            <div className="mt-2 h-3 w-56 rounded bg-line/30" />
          </div>
        </div>
        <div className="animate-pulse rounded-xl border border-line bg-white p-5">
          <div className="h-4 w-32 rounded bg-line/60" />
          <div className="mt-5 space-y-5">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index}>
                <div className="h-3 w-20 rounded bg-line/40" />
                <div className="mt-1.5 h-3.5 w-36 rounded bg-line/60" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

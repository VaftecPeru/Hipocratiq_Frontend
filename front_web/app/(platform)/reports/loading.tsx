export default function ReportsLoading() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando reportes</span>

      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
        <div>
          <div className="h-7 w-36 rounded-lg bg-line/70" />
          <div className="mt-2 h-3.5 w-96 max-w-full rounded bg-line/50" />
        </div>
        <div className="flex gap-2"><div className="h-9 w-56 rounded-lg bg-surface-subtle" /><div className="h-9 w-44 rounded-lg bg-accent-soft" /></div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div className={`animate-pulse rounded-xl border border-line bg-surface p-3.5 ${index === 4 ? "col-span-2 md:col-span-1" : ""}`} key={index} style={{ animationDelay: `${index * 90}ms` }}>
            <div className="flex items-start justify-between gap-3"><div className="h-3 w-20 rounded bg-line/60" /><div className="size-8 rounded-lg bg-accent-soft" /></div>
            <div className="mt-4 h-5 w-24 rounded bg-line/70" />
            <div className="mt-2 h-2.5 w-24 rounded bg-line/40" />
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2 min-[1600px]:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="animate-pulse rounded-xl border border-line bg-surface p-4" key={index}>
            <div className="flex items-start justify-between"><div className="h-3.5 w-40 rounded bg-line/60" /><div className="h-3 w-16 rounded bg-line/40" /></div>
            <div className="mt-4 h-40 w-full rounded-lg bg-surface-subtle" />
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="animate-pulse rounded-xl border border-line bg-surface p-4">
          <div className="h-3.5 w-56 rounded bg-line/60" />
          <div className="mt-4 h-52 w-full rounded-lg bg-surface-subtle" />
        </div>
        <div className="animate-pulse rounded-xl border border-line bg-surface p-4">
          <div className="h-3.5 w-56 rounded bg-line/60" />
          <div className="mt-3 space-y-3">
            {Array.from({ length: 5 }, (_, index) => (
              <div className="flex items-center gap-3" key={index}><div className="size-7 rounded-md bg-surface-subtle" /><div className="flex-1"><div className="h-2.5 w-24 rounded bg-line/40" /><div className="mt-1 h-3 w-16 rounded bg-line/50" /></div><div className="h-3 w-10 rounded bg-line/40" /><div className="h-6 w-20 rounded bg-surface-subtle" /></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

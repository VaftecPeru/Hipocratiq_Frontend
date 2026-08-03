export default function MonitoringLoading() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando monitoreo del sistema</span>

      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
        <div>
          <div className="h-7 w-56 rounded-lg bg-line/70" />
          <div className="mt-2 h-3.5 w-80 max-w-full rounded bg-line/50" />
        </div>
        <div className="flex gap-2"><div className="h-9 w-48 rounded-lg bg-surface-subtle" /><div className="h-9 w-16 rounded-lg bg-success-soft" /><div className="h-9 w-28 rounded-lg bg-accent-soft" /></div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 min-[1600px]:grid-cols-8">
        {Array.from({ length: 8 }, (_, index) => (
          <div className="animate-pulse rounded-xl border border-line bg-surface p-3" key={index} style={{ animationDelay: `${index * 70}ms` }}>
            <div className="flex items-center gap-2"><div className="size-7 rounded-lg bg-accent-soft" /><div className="h-2.5 w-16 rounded bg-line/50" /></div>
            <div className="mt-2 h-5 w-14 rounded bg-line/70" />
            <div className="mt-2 h-7 w-full rounded bg-surface-subtle" />
            <div className="mt-1.5 h-2.5 w-12 rounded bg-line/40" />
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="animate-pulse rounded-xl border border-line bg-surface p-4">
          <div className="h-3.5 w-44 rounded bg-line/60" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 2 }, (_, index) => (
              <div className="rounded-xl border border-line p-4" key={index}>
                <div className="flex items-center justify-between"><div className="h-3.5 w-16 rounded bg-line/60" /><div className="h-4 w-16 rounded-full bg-success-soft" /></div>
                <div className="mt-3 grid grid-cols-[6rem_1fr] gap-3"><div className="h-20 rounded-lg bg-surface-subtle" /><div className="space-y-1.5">{Array.from({ length: 5 }, (_, row) => <div className="h-2.5 rounded bg-line/40" key={row} />)}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="animate-pulse rounded-xl border border-line bg-surface p-4">
          <div className="h-3.5 w-48 rounded bg-line/60" />
          <div className="mt-4 space-y-2.5">
            {Array.from({ length: 8 }, (_, index) => (
              <div className="flex items-center gap-3" key={index}><div className="h-3 w-32 rounded bg-line/50" /><div className="h-3 w-16 rounded bg-line/30" /><div className="ml-auto h-3 w-12 rounded bg-line/30" /><div className="h-3 w-12 rounded bg-line/30" /></div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, card) => (
          <div className="animate-pulse rounded-xl border border-line bg-surface p-4" key={card}>
            <div className="h-3.5 w-40 rounded bg-line/60" />
            <div className="mt-3 space-y-3">
              {Array.from({ length: 4 }, (_, index) => (
                <div className="flex items-center gap-3" key={index}><div className="size-7 rounded-md bg-surface-subtle" /><div className="flex-1"><div className="h-3 w-3/4 rounded bg-line/50" /><div className="mt-1 h-2.5 w-1/2 rounded bg-line/30" /></div><div className="h-4 w-14 rounded-full bg-line/40" /></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Skeleton = ({ className }: { className: string }) => <div className={`animate-pulse rounded bg-line/45 ${className}`} />;

const cardClass = "rounded-xl border border-line bg-surface shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]";

export default function DoctorDashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-360 px-4 py-5 sm:px-6 lg:px-7 lg:py-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando Panel Médico</span>

      <header className={`${cardClass} relative overflow-hidden px-5 py-5 sm:px-6`}>
        <span className="absolute inset-y-0 left-0 w-1 bg-accent-soft" aria-hidden="true" />
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-3"><Skeleton className="h-2.5 w-28" /><Skeleton className="h-5 w-16 rounded-full" /></div>
            <Skeleton className="mt-3 h-9 w-52" />
            <Skeleton className="mt-3 h-4 w-36" />
            <Skeleton className="mt-2 h-3 w-full max-w-md" />
          </div>
          <div className="grid shrink-0 gap-2 sm:grid-cols-2 md:w-96">
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg sm:col-span-2" />
          </div>
        </div>
      </header>

      <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <div className={`${cardClass} min-w-0 p-3.5`} key={index}>
            <div className="flex items-start justify-between gap-2"><Skeleton className="size-8 rounded-lg" /><Skeleton className="h-6 w-8" /></div>
            <Skeleton className="mt-3 h-3 w-24 max-w-full" />
            <Skeleton className="mt-2 h-2.5 w-16" />
          </div>
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_0.95fr_0.8fr]" aria-hidden="true">
        <div className={`${cardClass} min-w-0 p-4 sm:p-5`}>
          <div className="flex justify-between gap-3"><div><Skeleton className="h-4 w-28" /><Skeleton className="mt-2 h-2.5 w-40" /></div><Skeleton className="h-6 w-24 rounded-md" /></div>
          <div className="mt-4 divide-y divide-line">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="flex min-h-14 items-center gap-3 px-2" key={index}><Skeleton className="h-3 w-9" /><div className="min-w-0 flex-1"><Skeleton className="h-3 w-28" /><Skeleton className="mt-2 h-2.5 w-36 max-w-full" /></div><Skeleton className="h-2.5 w-14" /></div>
            ))}
          </div>
        </div>

        <div className={`${cardClass} min-w-0 p-4 sm:p-5`}>
          <div className="flex justify-between"><div><Skeleton className="h-4 w-28" /><Skeleton className="mt-2 h-2.5 w-44" /></div><Skeleton className="size-4" /></div>
          <div className="mt-4 grid gap-1">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="flex items-center gap-3 px-2 py-2.5" key={index}><Skeleton className="size-8 rounded-lg" /><div className="min-w-0 flex-1"><Skeleton className="h-3 w-36 max-w-full" /><Skeleton className="mt-2 h-2.5 w-28" /></div><Skeleton className="h-2.5 w-10" /></div>
            ))}
          </div>
        </div>

        <div className={`${cardClass} min-w-0 p-4 sm:p-5`}>
          <Skeleton className="h-4 w-32" /><Skeleton className="mt-2 h-2.5 w-36" />
          <div className="mt-4 grid gap-2">
            {Array.from({ length: 3 }, (_, index) => (
              <div className="flex min-h-14 items-center gap-3 px-2" key={index}><Skeleton className="size-9 rounded-full" /><div className="min-w-0 flex-1"><Skeleton className="h-3 w-24" /><Skeleton className="mt-2 h-2.5 w-20" /></div><Skeleton className="h-2.5 w-12" /></div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-12" aria-hidden="true">
        <div className={`${cardClass} min-w-0 p-4 sm:p-5 xl:col-span-5`}>
          <div className="flex justify-between"><div><Skeleton className="h-4 w-32" /><Skeleton className="mt-2 h-2.5 w-36" /></div><Skeleton className="h-3 w-12" /></div>
          <div className="mt-5 flex gap-4"><Skeleton className="h-2.5 w-16" /><Skeleton className="h-2.5 w-16" /><Skeleton className="h-2.5 w-14" /></div>
          <div className="mt-5 grid h-40 content-between">
            {Array.from({ length: 5 }, (_, index) => <Skeleton className="h-px w-full rounded-none" key={index} />)}
          </div>
        </div>

        <div className={`${cardClass} min-w-0 p-4 sm:p-5 xl:col-span-3`}>
          <Skeleton className="h-4 w-40 max-w-full" /><Skeleton className="mt-2 h-2.5 w-28" />
          <Skeleton className="mx-auto mt-5 size-40 rounded-full" />
          <div className="mt-5 grid gap-3"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-full" /></div>
        </div>

        <div className={`${cardClass} min-w-0 p-4 sm:p-5 xl:col-span-2`}>
          <Skeleton className="h-4 w-36 max-w-full" /><Skeleton className="mt-2 h-2.5 w-28" />
          <Skeleton className="mt-4 h-30 w-full rounded-lg" /><Skeleton className="mt-3 h-26 w-full rounded-lg" />
        </div>

        <div className={`${cardClass} min-w-0 p-4 sm:p-5 xl:col-span-2`}>
          <Skeleton className="h-2.5 w-24" /><Skeleton className="mt-3 h-4 w-32" /><Skeleton className="mt-2 h-2.5 w-full" />
          <Skeleton className="mt-5 h-36 w-full rounded-lg" /><Skeleton className="mt-4 h-9 w-full rounded-lg" /><Skeleton className="mx-auto mt-3 h-2.5 w-24" />
        </div>
      </section>
    </div>
  );
}

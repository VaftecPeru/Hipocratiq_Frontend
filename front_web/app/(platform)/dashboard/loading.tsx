const skeletonCards = Array.from({ length: 5 });

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8" aria-hidden="true">

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
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-[0_0.5rem_2rem_rgb(16_27_51/4%)] sm:p-5">
            <div className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div><div className="h-2.5 w-36 rounded bg-accent-soft" /><div className="mt-2 h-4 w-52 rounded bg-line/60" /></div>
              <div className="h-8 w-36 rounded bg-line/50" />
            </div>
            <div className="mt-4 grid h-56 grid-cols-12 items-end gap-1.5 border-b border-line px-1">
              {Array.from({ length: 12 }, (_, index) => <div className="flex h-full flex-col justify-end gap-2" key={index}><div className={`rounded-t bg-accent-soft ${index % 4 === 0 ? "h-16" : index % 3 === 0 ? "h-28" : "h-9"}`} /><div className="h-2 w-full rounded bg-line/40" /></div>)}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-line bg-paper px-3 py-2.5 sm:grid-cols-4"><div className="h-7 rounded bg-line/35" /><div className="h-7 rounded bg-line/35" /><div className="h-7 rounded bg-line/35" /><div className="h-7 rounded bg-line/35" /></div>
            <div className="mt-2 h-3 w-32 rounded bg-accent-soft" />
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="h-2.5 w-28 rounded bg-line/40" />
            <div className="mt-2 h-4 w-40 rounded bg-line/60" />
            <div className="mt-5 h-10 w-28 rounded bg-line/60" />
            <div className="mt-5 space-y-4">{Array.from({ length: 3 }, (_, index) => <div key={index}><div className="flex items-center justify-between gap-3"><div className="h-3 w-24 rounded bg-line/50" /><div className="h-3 w-12 rounded bg-line/40" /></div><div className="mt-2 h-1.5 rounded-full bg-line/35" /></div>)}</div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 3 }, (_, index) => (
            <div className={`min-h-72 rounded-2xl border border-line bg-surface p-5 ${index === 2 ? "md:col-span-2 xl:col-span-1" : ""}`} key={index}>
              <div className="flex items-start justify-between gap-4"><div><div className="h-2.5 w-24 rounded bg-line/40" /><div className="mt-2 h-4 w-32 rounded bg-line/60" /></div><div className="size-8 rounded-lg bg-accent-soft" /></div>
              {index === 2 ? <><div className="mt-5 h-10 rounded-lg bg-success-soft" /><div className="mt-3 space-y-3">{Array.from({ length: 3 }, (_, row) => <div className="flex items-center justify-between gap-3" key={row}><div><div className="h-3 w-24 rounded bg-line/50" /><div className="mt-1 h-2.5 w-32 rounded bg-line/35" /></div><div className="h-5 w-16 rounded-full bg-success-soft" /></div>)}</div></> : <div className="mt-5 space-y-1">{Array.from({ length: 4 }, (_, row) => <div className="flex items-center gap-3 border-b border-line py-2.5" key={row}><div className="size-8 rounded-lg bg-accent-soft" /><div className="flex-1"><div className="h-3 w-28 rounded bg-line/50" /><div className="mt-1 h-2.5 w-36 rounded bg-line/35" /></div><div className="h-3 w-12 rounded bg-line/35" /></div>)}</div>}
            </div>
          ))}
        </section>

        <footer className="mt-8 flex justify-between border-t border-line py-5" aria-hidden="true">
          <div className="h-2.5 w-48 rounded bg-line/40" />
          <div className="hidden h-2.5 w-36 rounded bg-line/40 sm:block" />
        </footer>
      </div>
    </div>
  );
}

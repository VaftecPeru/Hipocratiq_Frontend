export default function ReportsLoading() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6" aria-hidden="true">

      <div className="motion-safe:animate-pulse">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="h-7 w-36 rounded-lg bg-line/70" />
          <div className="mt-2 h-3.5 w-96 max-w-full rounded bg-line/50" />
        </div>
        <div className="h-9 w-44 rounded-lg bg-accent-soft" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <div className={`rounded-xl border border-line bg-surface p-3.5 ${index === 4 ? "col-span-2 xl:col-span-1" : ""}`} key={index}>
            <div className="flex items-start justify-between gap-3"><div className="h-3 w-20 rounded bg-line/60" /><div className="size-8 rounded-lg bg-accent-soft" /></div>
            <div className="mt-4 h-5 w-24 rounded bg-line/70" />
            <div className="mt-2 h-2.5 w-24 rounded bg-line/40" />
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.65fr)]">
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-[0_0.5rem_2rem_rgb(16_27_51/4%)] sm:p-5">
          <div className="flex items-end justify-between gap-4 border-b border-line pb-4"><div><div className="h-2.5 w-24 rounded bg-accent-soft" /><div className="mt-2 h-4 w-56 rounded bg-line/60" /></div><div className="h-7 w-28 rounded bg-line/50" /></div>
          <div className="mt-4 grid h-56 grid-cols-12 items-end gap-1.5 border-b border-line px-1">{Array.from({ length: 12 }, (_, index) => <div className="flex h-full flex-col justify-end gap-2" key={index}><div className={`rounded-t bg-accent-soft ${index % 4 === 0 ? "h-16" : index % 3 === 0 ? "h-28" : "h-9"}`} /><div className="h-2 w-full rounded bg-line/40" /></div>)}</div>
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-line bg-paper px-3 py-2.5 sm:grid-cols-4"><div className="h-7 rounded bg-line/35" /><div className="h-7 rounded bg-line/35" /><div className="h-7 rounded bg-line/35" /><div className="h-7 rounded bg-line/35" /></div>
          <div className="mt-2 h-3 w-32 rounded bg-accent-soft" />
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-[0_0.5rem_2rem_rgb(16_27_51/4%)] sm:p-5">
          <div className="h-2.5 w-24 rounded bg-violet-soft" />
          <div className="mt-2 h-4 w-40 rounded bg-line/60" />
          <div className="mt-5 space-y-5">
            {Array.from({ length: 3 }, (_, index) => <div key={index}><div className="flex items-center justify-between gap-3"><div className="h-3 w-24 rounded bg-line/50" /><div className="h-3 w-20 rounded bg-line/40" /></div><div className="mt-2 h-2 rounded-full bg-line/35" /><div className="mt-1.5 h-2.5 w-28 rounded bg-line/35" /></div>)}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-surface p-4 shadow-[0_0.5rem_2rem_rgb(16_27_51/4%)] sm:p-5">
        <div className="flex items-center justify-between gap-3"><div><div className="h-2.5 w-24 rounded bg-accent-soft" /><div className="mt-2 h-4 w-64 rounded bg-line/60" /></div><div className="h-3 w-20 rounded bg-accent-soft" /></div>
        <div className="mt-4 divide-y divide-line">{Array.from({ length: 4 }, (_, index) => <div className="flex items-center gap-3 py-3" key={index}><div className="size-8 rounded-lg bg-accent-soft" /><div className="min-w-0 flex-1"><div className="h-3 w-36 rounded bg-line/50" /><div className="mt-1 h-2.5 w-44 rounded bg-line/35" /></div><div className="hidden h-2.5 w-28 rounded bg-line/35 sm:block" /></div>)}</div>
      </div>

      <footer className="mt-4 border-t border-line py-4"><div className="h-2.5 w-96 max-w-full rounded bg-line/40" /></footer>
      </div>
    </div>
  );
}

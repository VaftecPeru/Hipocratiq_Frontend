export default function BillingLoading() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6" aria-hidden="true">
      <div className="motion-safe:animate-pulse">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="h-7 w-44 rounded-lg bg-line/70" />
            <div className="mt-2 h-3.5 w-80 max-w-full rounded bg-line/50" />
          </div>
          <div className="flex gap-2"><div className="h-9 w-32 rounded-lg bg-surface-subtle" /><div className="h-9 w-36 rounded-lg bg-accent-soft" /></div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="rounded-xl border border-line bg-surface p-3.5" key={index}>
              <div className="flex items-start justify-between gap-3"><div className="h-3 w-24 rounded bg-line/60" /><div className="size-8 rounded-lg bg-accent-soft" /></div>
              <div className="mt-4 h-5 w-20 rounded bg-line/70" />
              <div className="mt-2 h-2.5 w-28 rounded bg-line/40" />
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-line bg-surface p-3.5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.6fr_repeat(4,1fr)_auto]">
            {Array.from({ length: 5 }, (_, index) => <div key={index}><div className="mb-1 h-2.5 w-14 rounded bg-line/50" /><div className="h-9 w-full rounded-lg bg-surface-subtle" /></div>)}
            <div className="mt-auto h-9 w-full rounded-lg bg-accent-soft" />
          </div>
        </div>

        <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(17rem,0.7fr)]">
          <div className="min-w-0 rounded-2xl border border-line bg-surface p-4 shadow-[0_0.5rem_2rem_rgb(16_27_51/4%)] sm:p-5">
            <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="h-4 w-40 rounded bg-line/60" /><div className="mt-1.5 h-2.5 w-48 rounded bg-line/40" /></div><div className="h-7 w-28 rounded bg-line/50" /></div>
            <div className="mt-4 grid h-48 grid-cols-12 items-end gap-1.5 border-b border-line px-1">{Array.from({ length: 12 }, (_, index) => <div className="flex h-full min-w-0 flex-col justify-end gap-2" key={index}><div className={`rounded-t bg-accent-soft ${index % 4 === 0 ? "h-5" : index % 3 === 0 ? "h-28" : "h-10"}`} /><div className="h-2 w-full rounded bg-line/40" /></div>)}</div>
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-line bg-paper px-3 py-2.5 sm:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div className="h-7 rounded bg-line/35" key={index} />)}</div>
            <div className="mt-2 h-3 w-32 rounded bg-accent-soft" />
          </div>

          <div className="rounded-xl border border-line bg-surface p-4"><div className="h-3.5 w-40 rounded bg-line/60" /><div className="mt-4 grid gap-4">{Array.from({ length: 3 }, (_, index) => <div key={index}><div className="flex items-center justify-between gap-3"><div className="h-3 w-24 rounded bg-line/50" /><div className="h-3 w-16 rounded bg-line/40" /></div><div className="mt-1.5 h-2 rounded-full bg-line/35" /><div className="mt-1 h-2.5 w-32 rounded bg-line/35" /></div>)}</div></div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-4 py-3"><div className="h-3 w-32 rounded bg-line/60" /><div className="h-2.5 w-20 rounded bg-line/40" /></div>
          <div className="overflow-x-auto"><div className="min-w-[60rem]"><div className="grid grid-cols-8 gap-3 bg-surface-subtle px-4 py-2.5">{Array.from({ length: 8 }, (_, index) => <div className="h-2.5 rounded bg-line/40" key={index} />)}</div>{Array.from({ length: 6 }, (_, row) => <div className="grid grid-cols-8 items-center gap-3 border-t border-line px-4 py-3" key={row}>{Array.from({ length: 8 }, (_, column) => <div className={`${column === 1 ? "w-28" : column === 7 ? "ml-auto w-14" : "w-16"} h-3 rounded bg-line/35`} key={column} />)}</div>)}</div></div>
          <div className="flex items-center justify-between border-t border-line px-4 py-3"><div className="h-3 w-40 rounded bg-line/40" /><div className="flex gap-1">{Array.from({ length: 3 }, (_, index) => <div className="size-7 rounded-md bg-surface-subtle" key={index} />)}</div></div>
        </div>
      </div>
    </div>
  );
}

type PlatformModuleLoadingProps = Readonly<{
  label: string;
  variant?: "directory" | "access" | "memberships" | "settings" | "users";
}>;

const skeletonRows = Array.from({ length: 7 });
const skeletonCards = Array.from({ length: 4 });

function SkeletonStatGrid({ count = 4 }: { count?: number }) {
  return (
    <section className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div className="rounded-xl border border-line bg-surface p-3.5" key={index}>
          <div className="flex items-start justify-between gap-3">
            <span className="h-3 w-24 rounded bg-line/60" />
            <span className="size-8 rounded-lg bg-accent-soft" />
          </div>
          <span className="mt-4 block h-6 w-20 rounded bg-line/70" />
          <span className="mt-2 block h-3 w-28 rounded bg-line/40" />
        </div>
      ))}
    </section>
  );
}

function SkeletonTable() {
  return (
    <section className="mt-4 overflow-hidden rounded-xl border border-line bg-surface" aria-hidden="true">
      <div className="flex min-h-11 items-center justify-between border-b border-line px-4">
        <span className="h-3.5 w-40 rounded bg-line/60" />
        <span className="h-3 w-20 rounded bg-line/40" />
      </div>
      <div className="hidden overflow-hidden lg:block">
        <div className="grid grid-cols-6 gap-3 border-b border-line bg-surface-subtle/60 px-4 py-3">
          {Array.from({ length: 6 }, (_, index) => <span className="h-2.5 rounded bg-line/45" key={index} />)}
        </div>
        {skeletonRows.map((_, index) => (
          <div className="grid grid-cols-[1.6fr_repeat(4,1fr)_0.55fr] items-center gap-3 border-b border-line px-4 py-3" key={index}>
            <span className="h-3 w-32 rounded bg-line/55" />
            <span className="h-3 rounded bg-line/35" />
            <span className="h-3 w-16 rounded bg-line/40" />
            <span className="h-3 rounded bg-line/35" />
            <span className="h-3 w-20 rounded bg-line/40" />
            <span className="h-7 rounded-lg bg-surface-subtle" />
          </div>
        ))}
      </div>
      <div className="flex min-h-13 items-center justify-between px-4">
        <span className="h-3 w-36 rounded bg-line/40" />
        <span className="h-7 w-28 rounded-lg bg-surface-subtle" />
      </div>
    </section>
  );
}

function UsersSkeleton() {
  return (
    <>
      <section className="mt-4 rounded-xl border border-line bg-surface p-3.5" aria-hidden="true">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(8rem,1fr))_minmax(15rem,1.6fr)_auto]">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index}>
              <span className="mb-1 block h-2.5 w-12 rounded bg-line/50" />
              <span className="block h-8 rounded-lg bg-surface-subtle" />
            </div>
          ))}
          <div>
            <span className="mb-1 block h-2.5 w-16 rounded bg-line/50" />
            <span className="block h-8 rounded-lg bg-surface-subtle" />
          </div>
          <span className="mt-auto block h-8 rounded-lg bg-surface-subtle" />
        </div>
      </section>

      <div className="mt-4 grid items-start gap-4 min-[1440px]:grid-cols-[minmax(0,1fr)_17.5rem]">
        <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface" aria-hidden="true">
          <div className="flex min-h-10 items-center border-b border-line px-3">
            <span className="h-3 w-40 rounded bg-line/60" />
          </div>
          <div className="grid gap-3 p-3 xl:hidden">
            {Array.from({ length: 4 }, (_, card) => (
              <div className="rounded-xl border border-line p-4" key={card}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="size-9 shrink-0 rounded-full bg-surface-subtle" />
                    <div className="min-w-0"><span className="block h-3 w-32 rounded bg-line/50" /><span className="mt-1 block h-2.5 w-40 max-w-full rounded bg-line/30" /></div>
                  </div>
                  <span className="h-4 w-16 rounded-full bg-line/40" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-y border-line py-3">
                  {Array.from({ length: 4 }, (_, index) => <div key={index}><span className="block h-2.5 w-14 rounded bg-line/35" /><span className="mt-1 block h-3 w-20 max-w-full rounded bg-line/45" /></div>)}
                </div>
                <div className="mt-2 flex justify-end gap-1"><span className="size-8 rounded-md bg-surface-subtle" /><span className="size-8 rounded-md bg-surface-subtle" /><span className="size-8 rounded-md bg-surface-subtle" /></div>
              </div>
            ))}
          </div>
          <div className="hidden overflow-hidden xl:block">
            <div className="flex border-b border-line bg-surface-subtle/50 px-3 py-2.5">
              {Array.from({ length: 7 }, (_, index) => <span className="mx-1 h-2.5 flex-1 rounded bg-line/40" key={index} />)}
            </div>
            {Array.from({ length: 8 }, (_, index) => (
              <div className="flex items-center gap-3 border-b border-line px-3 py-3" key={index}>
                <span className="h-3 w-5 rounded bg-line/30" />
                <span className="size-7 rounded-full bg-surface-subtle" />
                <div className="flex-1"><span className="block h-3 w-32 rounded bg-line/50" /><span className="mt-1 block h-2.5 w-40 rounded bg-line/30" /></div>
                <span className="h-4 w-20 rounded-full bg-line/40" />
                <span className="h-3 w-16 rounded bg-line/30" />
                <span className="h-4 w-14 rounded-full bg-line/40" />
                <span className="h-7 w-20 rounded-lg bg-surface-subtle" />
              </div>
            ))}
          </div>
          <div className="flex min-h-14 flex-col items-center justify-between gap-2 border-t border-line px-4 py-2.5 sm:flex-row">
            <span className="h-3 w-40 rounded bg-line/40" />
            <div className="flex gap-1">{Array.from({ length: 5 }, (_, index) => <span className="size-7 rounded-md bg-surface-subtle" key={index} />)}</div>
          </div>
        </section>

        <aside className="grid content-start gap-3" aria-hidden="true">
          {Array.from({ length: 2 }, (_, card) => (
            <div className="rounded-xl border border-line bg-surface p-4" key={card}>
              <span className="block h-3.5 w-28 rounded bg-line/60" />
              <div className="mt-3 grid gap-3">
                {Array.from({ length: card === 0 ? 6 : 5 }, (_, index) => <div className="flex items-center gap-2" key={index}><span className="size-7 rounded-md bg-surface-subtle" /><span className="h-3 flex-1 rounded bg-line/40" /><span className="h-3 w-12 rounded bg-line/50" /></div>)}
              </div>
            </div>
          ))}
        </aside>
      </div>

      <section className="mt-4 grid gap-4 lg:grid-cols-2" aria-hidden="true">
        {Array.from({ length: 2 }, (_, index) => (
          <div className="rounded-xl border border-line bg-surface p-4" key={index}>
            <span className="block h-3.5 w-32 rounded bg-line/60" />
            <div className="mt-4 flex items-center gap-5"><span className="size-28 shrink-0 rounded-full bg-line/40" /><div className="flex-1 space-y-2">{Array.from({ length: 4 }, (_, row) => <span className="block h-3 rounded bg-line/35" key={row} />)}</div></div>
          </div>
        ))}
      </section>
    </>
  );
}

function AccessSkeleton() {
  return (
    <>
      <section className="mt-4" aria-hidden="true">
        <div className="mb-2"><span className="block h-3.5 w-44 rounded bg-line/60" /><span className="mt-1 block h-2.5 w-80 max-w-full rounded bg-line/40" /></div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {skeletonCards.map((_, index) => (
            <article className="flex min-h-64 flex-col rounded-xl border border-line bg-surface p-4" key={index}>
              <div className="flex items-start justify-between gap-3"><span className="size-9 rounded-lg bg-accent-soft" /><span className="h-5 w-16 rounded-full bg-line/40" /></div>
              <span className="mt-3 block h-4 w-28 rounded bg-line/60" />
              <span className="mt-1 block h-10 rounded bg-line/25" />
              <span className="mt-3 block h-8 border-y border-line bg-line/20" />
              <div className="mt-3 grid gap-1.5">{Array.from({ length: 4 }, (_, permission) => <span className="h-2.5 w-36 max-w-full rounded bg-line/35" key={permission} />)}</div>
              <span className="mt-auto block h-8 rounded-lg bg-surface-subtle" />
            </article>
          ))}
        </div>
      </section>

      <div className="mt-4 grid items-start gap-4 min-[1380px]:grid-cols-[minmax(0,1fr)_19rem]">
        <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface" aria-hidden="true">
          <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-end">
            <div className="mr-auto"><span className="block h-3.5 w-40 rounded bg-line/60" /><span className="mt-1 block h-2.5 w-32 rounded bg-line/35" /></div>
            <span className="h-8 w-full rounded-lg bg-surface-subtle sm:w-48" />
            <span className="h-8 w-full rounded-lg bg-surface-subtle sm:w-64" />
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[48rem]">
              <div className="grid grid-cols-5 gap-3 border-b border-line bg-surface-subtle/60 px-3 py-2.5">{Array.from({ length: 5 }, (_, index) => <span className="h-2.5 rounded bg-line/40" key={index} />)}</div>
              {Array.from({ length: 7 }, (_, index) => <div className="grid grid-cols-5 items-center gap-3 border-b border-line px-3 py-3" key={index}><div className="flex items-center gap-2"><span className="size-8 rounded-full bg-surface-subtle" /><div><span className="block h-3 w-32 rounded bg-line/50" /><span className="mt-1 block h-2.5 w-40 rounded bg-line/30" /></div></div><span className="h-4 w-24 rounded-full bg-line/40" /><span className="h-3 w-10 rounded bg-line/30" /><span className="h-3 w-32 rounded bg-line/35" /><span className="ml-auto h-8 w-24 rounded-lg bg-surface-subtle" /></div>)}
            </div>
          </div>
          <div className="flex min-h-13 items-center justify-between gap-3 border-t border-line px-3 py-2"><span className="h-3 w-24 rounded bg-line/40" /><div className="flex gap-1"><span className="h-8 w-20 rounded-lg bg-surface-subtle" /><span className="h-8 w-20 rounded-lg bg-surface-subtle" /></div></div>
        </section>

        <aside className="rounded-xl border border-line bg-surface p-4" aria-hidden="true">
          <div className="flex items-center gap-2"><span className="size-8 rounded-lg bg-surface-subtle" /><div><span className="block h-3.5 w-32 rounded bg-line/60" /><span className="mt-1 block h-2.5 w-36 rounded bg-line/35" /></div></div>
          <div className="mt-4 grid gap-3">{Array.from({ length: 5 }, (_, index) => <div className="border-l-2 border-accent/20 pl-3" key={index}><span className="block h-3 w-32 rounded bg-line/45" /><span className="mt-1 block h-2.5 w-40 rounded bg-line/30" /><span className="mt-1 block h-2.5 w-28 rounded bg-line/25" /></div>)}</div>
        </aside>
      </div>
    </>
  );
}

function SettingsSkeleton() {
  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]" aria-hidden="true">
      <div className="rounded-xl border border-line bg-surface p-4">
        <span className="h-4 w-44 rounded bg-line/60" />
        <span className="mt-2 block h-3 w-80 max-w-full rounded bg-line/40" />
        <div className="mt-5 grid gap-3">
          {Array.from({ length: 3 }, (_, index) => <div className="h-9 rounded-lg border border-line bg-surface-input" key={index} />)}
        </div>
        <span className="mt-5 block h-9 w-36 rounded-lg bg-accent-soft" />
      </div>
      <div className="rounded-xl border border-line bg-surface p-4">
        <span className="h-4 w-36 rounded bg-line/60" />
        <span className="mt-3 block h-28 rounded-lg bg-surface-subtle" />
      </div>
    </div>
  );
}

export function PlatformModuleLoading({ label, variant = "directory" }: PlatformModuleLoadingProps) {
  if (variant === "settings") {
    return (
      <div className="motion-safe:animate-pulse" role="status" aria-live="polite" aria-busy="true">
        <span className="sr-only">{label}</span>
        <SettingsSkeleton />
      </div>
    );
  }

  const statCount = variant === "memberships" || variant === "access" || variant === "users" ? 4 : 5;

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 motion-safe:animate-pulse sm:px-5 lg:px-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between" aria-hidden="true">
        <div><span className="block h-7 w-48 rounded-lg bg-line/70" /><span className="mt-2 block h-3.5 w-80 max-w-full rounded bg-line/50" /></div>
        <span className="h-9 w-32 rounded-lg bg-accent-soft" />
      </header>
      <SkeletonStatGrid count={statCount} />
      {variant === "memberships" ? (
        <>
          <div className="mt-4 h-10 rounded-lg border-b border-line bg-surface" aria-hidden="true" />
          <div className="mt-4 grid gap-4 lg:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 3 }, (_, index) => <div className="min-h-72 rounded-xl border border-line bg-surface p-5" key={index}><span className="h-4 w-28 rounded bg-line/60" /><span className="mt-5 block h-8 w-24 rounded bg-line/70" /><span className="mt-5 block h-24 rounded bg-surface-subtle" /></div>)}
          </div>
        </>
      ) : null}
      {variant === "users" ? <UsersSkeleton /> : null}
      {variant === "access" ? <AccessSkeleton /> : null}
      {variant !== "memberships" && variant !== "users" && variant !== "access" ? <SkeletonTable /> : null}
    </div>
  );
}

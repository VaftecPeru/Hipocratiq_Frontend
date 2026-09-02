type PlatformModuleLoadingProps = Readonly<{
  label: string;
  variant?: "directory" | "access" | "memberships" | "settings";
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

  const statCount = variant === "memberships" ? 4 : variant === "access" ? 4 : 5;

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
      {variant === "access" ? <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-hidden="true">{skeletonCards.map((_, index) => <div className="min-h-64 rounded-xl border border-line bg-surface p-4" key={index}><span className="h-8 w-8 rounded-lg bg-accent-soft" /><span className="mt-4 block h-4 w-24 rounded bg-line/60" /><span className="mt-3 block h-20 rounded bg-surface-subtle" /></div>)}</div> : null}
      <SkeletonTable />
    </div>
  );
}

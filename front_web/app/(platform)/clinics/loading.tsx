import { Skeleton } from "boneyard-js/react";

export default function ClinicsLoading() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando clínicas</span>

      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="h-3 w-32 rounded bg-accent-soft" />
          <div className="mt-2 h-7 w-48 rounded-lg bg-line/70" />
          <div className="mt-2 h-3.5 w-72 max-w-full rounded bg-line/50" />
        </div>
        <div className="h-8 w-32 rounded-lg bg-accent-soft" />
      </div>

      {/* Metric cards skeleton — matching real layout */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(3,minmax(11rem,0.8fr))_minmax(19rem,1.45fr)]">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            className="flex min-h-22 animate-pulse items-center gap-3 rounded-xl border border-line border-t-2 border-t-line bg-surface p-3.5"
            key={index}
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <div className="size-9 shrink-0 rounded-lg bg-surface-subtle" />
            <div className="min-w-0 flex-1">
              <div className="h-3 w-20 rounded bg-line/60" />
              <div className="mt-2 h-5 w-14 rounded bg-line/70" />
              <div className="mt-1.5 h-2.5 w-16 rounded bg-line/40" />
            </div>
          </div>
        ))}
        <div className="grid min-h-22 animate-pulse grid-cols-[3.25rem_1fr] items-center gap-3 rounded-xl border border-line bg-surface p-3.5" style={{ animationDelay: "360ms" }}>
          <div className="size-13 rounded-full bg-line/50" />
          <div>
            <div className="h-3.5 w-28 rounded bg-line/60" />
            <div className="mt-2 space-y-1.5">
              <div className="h-2.5 w-full rounded bg-line/40" />
              <div className="h-2.5 w-full rounded bg-line/40" />
              <div className="h-2.5 w-3/4 rounded bg-line/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="mt-4 animate-pulse rounded-xl border border-line bg-surface p-3.5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index}>
              <div className="mb-1 h-2.5 w-12 rounded bg-line/50" />
              <div className="h-8 w-full rounded-lg bg-surface-subtle" />
            </div>
          ))}
          <div className="mt-auto h-8 w-full rounded-lg bg-surface-subtle" />
        </div>
      </div>

      {/* Table + Summary skeleton */}
      <div className="mt-4 grid items-start gap-4 min-[1440px]:grid-cols-[minmax(0,1fr)_17.5rem]">
        <div className="animate-pulse overflow-hidden rounded-xl border border-line bg-surface">
          <div className="flex min-h-10 items-center border-b border-line px-3">
            <div className="h-3 w-36 rounded bg-line/60" />
          </div>
          <div className="hidden lg:block">
            <div className="flex border-b border-line bg-surface-subtle/50 px-3 py-2.5">
              {Array.from({ length: 8 }, (_, index) => (
                <div className="h-2.5 flex-1 rounded bg-line/40 mx-1" key={index} />
              ))}
            </div>
            {Array.from({ length: 6 }, (_, index) => (
              <div className="flex items-center border-b border-line px-3 py-3" key={index}>
                <div className="h-3 w-6 rounded bg-line/30" />
                <div className="ml-3 flex items-center gap-2 flex-1">
                  <div className="size-7 rounded-md bg-surface-subtle" />
                  <div className="h-3.5 w-28 rounded bg-line/50" />
                </div>
                <div className="h-3 w-16 rounded bg-line/30 mx-2" />
                <div className="h-4 w-16 rounded bg-line/40 mx-2" />
                <div className="h-3 w-10 rounded bg-line/30 mx-2" />
                <div className="h-3 w-10 rounded bg-line/30 mx-2" />
                <div className="h-4 w-14 rounded-full bg-line/40 mx-2" />
                <div className="h-3 w-14 rounded bg-line/30 mx-2" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-line px-4 py-3">
            <div className="h-3 w-40 rounded bg-line/40" />
            <div className="flex gap-1">
              {Array.from({ length: 3 }, (_, index) => (
                <div className="size-7 rounded-md bg-surface-subtle" key={index} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid content-start gap-3">
          <div className="animate-pulse rounded-xl border border-line bg-surface p-4">
            <div className="h-3.5 w-28 rounded bg-line/60" />
            <div className="mt-3 space-y-3">
              {Array.from({ length: 5 }, (_, index) => (
                <div className="flex items-center gap-2" key={index}>
                  <div className="size-7 rounded-md bg-surface-subtle" />
                  <div className="h-3 flex-1 rounded bg-line/40" />
                  <div className="h-3 w-14 rounded bg-line/50" />
                </div>
              ))}
            </div>
          </div>
          <div className="animate-pulse rounded-xl border border-line bg-surface p-4">
            <div className="h-3.5 w-28 rounded bg-line/60" />
            <div className="mt-3 space-y-3">
              {Array.from({ length: 4 }, (_, index) => (
                <div className="flex items-start gap-2" key={index}>
                  <div className="size-7 shrink-0 rounded-md bg-surface-subtle" />
                  <div className="flex-1">
                    <div className="h-3 w-3/4 rounded bg-line/50" />
                    <div className="mt-1 h-2.5 w-full rounded bg-line/30" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

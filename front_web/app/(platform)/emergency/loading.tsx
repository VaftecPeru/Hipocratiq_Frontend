import { SettingsHeaderSkeleton } from "@/features/platform/ui/settings-primitives";

export default function EmergencyLoading() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando configuración del botón de emergencia</span>

      <div className="h-2.5 w-32 rounded bg-danger-soft" />

      <div className="mt-2">
        <SettingsHeaderSkeleton titleWidth="13rem" actionWidth="10rem" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2.5 min-[26rem]:grid-cols-2 sm:gap-3 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            className="relative animate-pulse overflow-hidden rounded-xl border border-line bg-surface p-3 pl-4 sm:p-3.5 sm:pl-4.5"
            key={index}
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <span className="absolute inset-y-0 left-0 w-1 bg-line" />
            <div className="flex items-center gap-2.5">
              <div className="size-8 shrink-0 rounded-lg bg-accent-soft sm:size-9" />
              <div className="min-w-0 space-y-1.5">
                <div className="h-2.5 w-28 rounded bg-line/50" />
                <div className="h-4 w-12 rounded bg-line/70" />
                <div className="h-2.5 w-20 rounded bg-line/40" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid items-start gap-3 sm:mt-4 sm:gap-4 xl:grid-cols-2">
        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div className="size-8 shrink-0 rounded-lg bg-accent-soft" />
              <div className="space-y-1.5">
                <div className="h-3 w-28 rounded bg-line/70" />
                <div className="h-2.5 w-40 rounded bg-line/40" />
              </div>
            </div>
            <div className="h-5 w-20 rounded-full bg-success-soft" />
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-line bg-surface-subtle p-3">
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-44 max-w-full rounded bg-line/60" />
              <div className="h-2.5 w-56 max-w-full rounded bg-line/40" />
            </div>
            <div className="h-5 w-9 shrink-0 rounded-full bg-accent-soft" />
          </div>
          <div className="mt-3 grid gap-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index}>
                <div className="mb-1.5 h-2.5 w-24 rounded bg-line/50" />
                <div className="h-9 w-full rounded-lg bg-surface-subtle" />
              </div>
            ))}
          </div>
          <div className="mt-3 h-12 w-full rounded-lg bg-accent-soft/60" />
        </div>

        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div className="size-8 shrink-0 rounded-lg bg-accent-soft" />
              <div className="space-y-1.5">
                <div className="h-3 w-40 rounded bg-line/70" />
                <div className="h-2.5 w-44 max-w-full rounded bg-line/40" />
              </div>
            </div>
            <div className="h-8 w-24 rounded-lg bg-surface-subtle" />
          </div>
          <div className="mt-3 grid gap-2.5">
            {Array.from({ length: 3 }, (_, index) => (
              <div className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-subtle p-2.5 sm:p-3" key={index}>
                <div className="size-8 shrink-0 rounded-full bg-accent-soft sm:size-9" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="h-3 w-40 max-w-full rounded bg-line/60" />
                  <div className="h-2.5 w-28 max-w-full rounded bg-line/40" />
                </div>
                <div className="h-5 w-16 shrink-0 rounded-full bg-line/40" />
              </div>
            ))}
          </div>
          <div className="mt-3 h-12 w-full rounded-lg bg-accent-soft/60" />
        </div>
      </div>

      <div className="mt-3 animate-pulse rounded-xl border border-line bg-surface p-3 sm:mt-4 sm:p-4">
        <div className="flex items-start gap-2.5">
          <div className="size-8 shrink-0 rounded-lg bg-accent-soft" />
          <div className="space-y-1.5">
            <div className="h-3 w-40 rounded bg-line/70" />
            <div className="h-2.5 w-48 max-w-full rounded bg-line/40" />
          </div>
        </div>
        <div className="mt-3 grid gap-2.5 min-[26rem]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div className="rounded-lg border border-line bg-surface-subtle p-3" key={index}>
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-line/50" />
                <div className="size-3.5 rounded bg-line/40" />
              </div>
              <div className="mt-2 h-3 w-24 max-w-full rounded bg-line/60" />
              <div className="mt-1.5 h-2.5 w-full rounded bg-line/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

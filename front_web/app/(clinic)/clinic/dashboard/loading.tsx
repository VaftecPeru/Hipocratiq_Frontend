type ClinicDashboardLoadingProps = Readonly<{
  actorContext?: "clinic_admin" | "receptionist" | null;
}>;

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-line bg-surface p-5">
      <div className="flex justify-between">
        <div className="size-10 rounded-xl bg-surface-subtle" />
        <div className="h-6 w-20 rounded-full bg-line/40" />
      </div>
      <div className="mt-5 h-3 w-28 rounded bg-line/40" />
      <div className="mt-2 h-6 w-36 rounded bg-line/60" />
    </div>
  );
}

function ClinicAdminDashboardLoading() {
  return (
    <>
      <header className="flex animate-pulse flex-col justify-between gap-5 border-b border-line pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="h-2.5 w-28 rounded bg-accent-soft" />
          <div className="mt-3 h-8 w-52 rounded-lg bg-line/60" />
          <div className="mt-2 h-3.5 w-80 max-w-full rounded bg-line/40" />
        </div>
        <div className="grid w-full grid-cols-1 gap-2 min-[17.5rem]:grid-cols-2 sm:w-auto sm:shrink-0">
          <div className="h-10 w-full rounded-xl bg-line/40 sm:w-32" />
          <div className="h-10 w-full rounded-xl bg-accent-soft sm:w-32" />
        </div>
      </header>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => <LoadingCard key={index} />)}
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-12" aria-hidden="true">
        {[
          ["agenda", "xl:col-span-5"],
          ["billing", "xl:col-span-4"],
          ["epidemiology", "xl:col-span-3"],
        ].map(([key, span]) => (
          <div className={`min-h-80 animate-pulse rounded-2xl border border-line bg-surface p-5 ${span}`} key={key}>
            <div className="h-4 w-36 rounded bg-line/60" />
            <div className="mt-2 h-3 w-52 rounded bg-line/40" />
            <div className="mt-8 h-52 rounded-xl bg-surface-subtle" />
          </div>
        ))}
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-line bg-surface" aria-hidden="true">
        <div className="animate-pulse border-b border-line p-5">
          <div className="h-4 w-40 rounded bg-line/60" />
          <div className="mt-2 h-3 w-64 rounded bg-line/40" />
        </div>
        <div className="divide-y divide-line">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="grid animate-pulse grid-cols-[2rem_1fr] items-center gap-3 px-5 py-4" key={index}>
              <div className="size-8 rounded-full bg-surface-subtle" />
              <div>
                <div className="h-3 w-40 rounded bg-line/50" />
                <div className="mt-2 h-2.5 w-28 rounded bg-line/30" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function ReceptionistDashboardLoading() {
  return (
    <>
      <header className="flex animate-pulse flex-col justify-between gap-5 border-b border-line pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="h-2.5 w-28 rounded bg-accent-soft" />
          <div className="mt-3 h-8 w-52 rounded-lg bg-line/60" />
          <div className="mt-2 h-3.5 w-80 max-w-full rounded bg-line/40" />
        </div>
        <div className="grid w-full grid-cols-1 gap-2 min-[17.5rem]:grid-cols-2 sm:w-auto sm:shrink-0">
          <div className="h-10 w-full rounded-xl bg-line/40 sm:w-32" />
          <div className="h-10 w-full rounded-xl bg-accent-soft sm:w-32" />
        </div>
      </header>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => <LoadingCard key={index} />)}
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]" aria-hidden="true">
        <div className="min-h-80 animate-pulse rounded-2xl border border-line bg-surface p-5">
          <div className="h-4 w-36 rounded bg-line/60" />
          <div className="mt-2 h-3 w-52 rounded bg-line/40" />
          <div className="mt-8 h-52 rounded-xl bg-surface-subtle" />
        </div>
        <div className="min-h-80 animate-pulse rounded-2xl border border-line bg-surface p-5">
          <div className="h-4 w-32 rounded bg-line/60" />
          <div className="mt-2 h-3 w-44 rounded bg-line/40" />
          <div className="mt-8 h-52 rounded-xl bg-surface-subtle" />
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => <LoadingCard key={index} />)}
      </section>
    </>
  );
}

function NeutralDashboardLoading() {
  return (
    <>
      <header className="flex animate-pulse flex-col justify-between gap-5 border-b border-line pb-6 sm:flex-row sm:items-end" aria-hidden="true">
        <div>
          <div className="h-2.5 w-28 rounded bg-accent-soft" />
          <div className="mt-3 h-8 w-52 rounded-lg bg-line/60" />
          <div className="mt-2 h-3.5 w-80 max-w-full rounded bg-line/40" />
        </div>
        <div className="flex w-full flex-col gap-2 min-[17.5rem]:flex-row sm:w-auto sm:shrink-0">
          <div className="h-10 w-full rounded-xl bg-line/40 sm:w-28" />
          <div className="h-10 w-full rounded-xl bg-accent-soft sm:w-28" />
        </div>
      </header>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => <LoadingCard key={index} />)}
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-12" aria-hidden="true">
        <div className="min-h-64 animate-pulse rounded-2xl border border-line bg-surface p-5 xl:col-span-8">
          <div className="h-4 w-36 rounded bg-line/60" />
          <div className="mt-2 h-3 w-52 rounded bg-line/40" />
          <div className="mt-8 h-40 rounded-xl bg-surface-subtle" />
        </div>
        <div className="min-h-64 animate-pulse rounded-2xl border border-line bg-surface p-5 xl:col-span-4">
          <div className="h-4 w-32 rounded bg-line/60" />
          <div className="mt-2 h-3 w-44 rounded bg-line/40" />
          <div className="mt-8 h-40 rounded-xl bg-surface-subtle" />
        </div>
      </section>

      <section className="mt-5 animate-pulse rounded-2xl border border-line bg-surface p-5" aria-hidden="true">
        <div className="h-4 w-40 rounded bg-line/60" />
        <div className="mt-2 h-3 w-64 max-w-full rounded bg-line/40" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => <div className="h-12 rounded-xl bg-surface-subtle" key={index} />)}
        </div>
      </section>
    </>
  );
}

export default function ClinicDashboardLoading({ actorContext }: ClinicDashboardLoadingProps) {
  return (
    <div
      className="mx-auto w-full max-w-360 px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">
        {actorContext === "receptionist" ? "Cargando panel de recepción" : actorContext === "clinic_admin" ? "Cargando panel operativo de la clínica" : "Cargando panel clínico"}
      </span>
      {actorContext === "receptionist"
        ? <ReceptionistDashboardLoading />
        : actorContext === "clinic_admin"
          ? <ClinicAdminDashboardLoading />
          : <NeutralDashboardLoading />}
    </div>
  );
}

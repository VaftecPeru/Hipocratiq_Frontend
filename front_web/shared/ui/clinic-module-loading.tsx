type ClinicModuleLoadingProps = Readonly<{
  title: string;
  description: string;
  variant?: "cards" | "table" | "report";
}>;

function SkeletonMetric() {
  return <div className="animate-pulse rounded-xl border border-line bg-surface p-4"><div className="size-9 rounded-lg bg-surface-subtle" /><div className="mt-4 h-3 w-28 rounded bg-line/40" /><div className="mt-2 h-6 w-20 rounded bg-line/60" /></div>;
}

export function ClinicModuleLoading({ title, description, variant = "cards" }: ClinicModuleLoadingProps) {
  return <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7" role="status" aria-live="polite" aria-busy="true"><span className="sr-only">Cargando {title.toLowerCase()}. {description}</span><header className="animate-pulse border-b border-line pb-5"><div className="h-2.5 w-28 rounded bg-accent-soft" /><div className="mt-3 h-8 w-52 rounded-lg bg-line/60" /><div className="mt-2 h-3.5 w-80 max-w-full rounded bg-line/40" /></header><section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <SkeletonMetric key={index} />)}</section><section className={`mt-4 grid animate-pulse gap-4 ${variant === "report" ? "lg:grid-cols-[minmax(0,1fr)_18rem]" : "lg:grid-cols-[minmax(0,1fr)_20rem]"}`} aria-hidden="true"><div className="min-h-80 rounded-xl border border-line bg-surface p-4"><div className="h-4 w-40 rounded bg-line/60" /><div className="mt-2 h-3 w-64 rounded bg-line/40" /><div className="mt-7 h-56 rounded-xl bg-surface-subtle" /></div><div className="min-h-80 rounded-xl border border-line bg-surface p-4"><div className="h-4 w-32 rounded bg-line/60" /><div className="mt-2 h-3 w-48 rounded bg-line/40" /><div className="mt-7 h-40 rounded-xl bg-surface-subtle" /></div></section>{variant !== "cards" ? <section className="mt-4 min-h-48 animate-pulse rounded-xl border border-line bg-surface p-4" aria-hidden="true"><div className="h-4 w-44 rounded bg-line/60" /><div className="mt-5 grid gap-3">{Array.from({ length: 4 }, (_, index) => <div className="h-10 rounded-lg bg-surface-subtle" key={index} />)}</div></section> : null}</div>;
}

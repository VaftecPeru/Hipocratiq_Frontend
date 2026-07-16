export default function ClinicsLoading() {
  return (
    <div className="mx-auto w-full max-w-[1720px] animate-pulse px-4 py-6 sm:px-6 lg:px-8" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando clínicas</span>
      <div className="h-8 w-56 rounded-lg bg-line/70" />
      <div className="mt-2 h-4 w-80 max-w-full rounded bg-line/60" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div className="h-32 rounded-2xl border border-line bg-surface" key={index} />)}
      </div>
      <div className="mt-5 h-28 rounded-2xl border border-line bg-surface" />
      <div className="mt-5 grid gap-5 2xl:grid-cols-[1fr_19rem]"><div className="h-[36rem] rounded-2xl border border-line bg-surface" /><div className="h-96 rounded-2xl border border-line bg-surface" /></div>
    </div>
  );
}

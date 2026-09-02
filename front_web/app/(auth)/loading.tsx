import { BrandLogo } from "@/shared/ui/brand-logo";

export default function AuthLoading() {
  return (
    <main className="fixed inset-0 grid overflow-hidden bg-white min-[900px]:grid-cols-2" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando acceso a Hipocratiq</span>

      <section className="grid h-dvh min-h-0 grid-rows-[1fr_auto] overflow-hidden bg-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]" aria-label="Carga de inicio de sesión">
        <div className="grid min-h-0 place-items-center overflow-hidden px-[clamp(1.25rem,5vw,4.5rem)] py-[clamp(1.5rem,4vh,3rem)]">
          <div className="w-full max-w-[38rem] motion-safe:animate-pulse" aria-hidden="true">
            <div className="mb-6 flex items-center gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-accent-soft">
                <BrandLogo className="h-9 w-10 opacity-40" />
              </span>
              <span className="h-7 w-48 max-w-full rounded-lg bg-line/60" />
            </div>
            <span className="block h-8 w-72 max-w-full rounded-lg bg-line/60" />
            <span className="mt-3 block h-4 w-56 max-w-full rounded bg-line/40" />

            <div className="login-role-grid-container mt-6">
              <div className="login-role-grid">
                {Array.from({ length: 4 }, (_, index) => (
                  <div className="flex min-h-[8.5rem] flex-col items-center rounded-xl border border-line bg-surface p-2.5" key={index}>
                    <span className="size-10 rounded-full bg-surface-subtle" />
                    <span className="mt-2 h-3 w-20 max-w-full rounded bg-line/50" />
                    <span className="mt-1 h-8 w-full rounded bg-line/30" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7 h-4 w-full rounded bg-line/30" />
            <div className="mt-4 h-9 w-full rounded-lg bg-surface-subtle" />
            <div className="mt-5 h-10 w-full rounded-lg bg-line/40" />
          </div>
        </div>

        <footer className="flex min-h-12 items-center justify-between gap-3 px-[clamp(1.25rem,4vw,3rem)] py-1" aria-hidden="true">
          <span className="h-2.5 w-28 rounded bg-line/40" />
          <span className="h-2.5 w-32 rounded bg-line/30" />
        </footer>
      </section>

      <aside className="relative hidden h-dvh min-h-0 overflow-hidden bg-accent-soft min-[900px]:block" aria-hidden="true">
        <div className="absolute top-[clamp(5rem,16%,8.5rem)] right-[clamp(1.5rem,8%,5rem)] left-[clamp(1.5rem,8%,5rem)] h-[clamp(14rem,42%,25rem)] rounded-xl bg-white/45" />
        <div className="absolute bottom-[clamp(2rem,6vh,4rem)] left-[clamp(1.5rem,7%,4rem)] h-32 w-[min(20rem,calc(100%_-_3rem))] rounded-xl bg-white/45" />
      </aside>
    </main>
  );
}

import { BrandLogo } from "@/shared/ui/brand-logo";

type DashboardRouteLoadingProps = Readonly<{
  children: React.ReactNode;
}>;

export function DashboardRouteLoading({ children }: DashboardRouteLoadingProps) {
  return (
    <div className="min-h-svh bg-paper text-ink" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando módulo administrativo</span>
      <aside className="fixed inset-y-0 left-0 hidden w-52 border-r border-line bg-surface lg:flex lg:flex-col" aria-hidden="true">
        <div className="flex h-14 items-center gap-2.5 px-4">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent"><BrandLogo className="h-6 w-6 brightness-0 invert" priority /></span>
          <span className="text-sm font-extrabold tracking-[0.07em]">HIPOCRATIQ</span>
        </div>
        <div className="min-h-0 flex-1 space-y-0.5 overflow-hidden px-2 py-2 motion-safe:animate-pulse">
          {Array.from({ length: 11 }, (_, index) => <div className={`h-7 rounded-lg ${index === 0 ? "bg-accent-soft" : "bg-surface-subtle"}`} key={index} />)}
        </div>
        <div className="m-2 h-7 rounded-lg bg-surface-subtle motion-safe:animate-pulse" />
      </aside>

      <div className="min-w-0 lg:ml-52">
        <header className="sticky top-0 z-20 flex h-13 items-center gap-2.5 border-b border-line bg-surface/95 px-4 backdrop-blur-md lg:px-5" aria-hidden="true">
          <span className="grid size-10 rounded-lg bg-surface-subtle lg:hidden" />
          <span className="hidden h-8 w-full max-w-xl rounded-lg bg-surface-subtle md:block" />
          <span className="ml-auto size-7 rounded-full bg-accent-soft" />
        </header>
        {children}
      </div>
    </div>
  );
}

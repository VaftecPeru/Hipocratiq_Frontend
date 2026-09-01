import { BrandLogo } from "@/shared/ui/brand-logo";

export default function AppLoading() {
  return (
    <main className="grid min-h-svh place-items-center bg-white px-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando Hipocratiq</span>
      <div className="flex flex-col items-center gap-4 motion-safe:animate-pulse" aria-hidden="true">
        <span className="grid size-14 place-items-center rounded-xl bg-accent shadow-[0_0.5rem_1rem_rgb(8_98_221/18%)]">
          <BrandLogo className="h-9 w-10 brightness-0 invert" priority />
        </span>
        <span className="h-2.5 w-32 rounded-full bg-line/50" />
      </div>
    </main>
  );
}

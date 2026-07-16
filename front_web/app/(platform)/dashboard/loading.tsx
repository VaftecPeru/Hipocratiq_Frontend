import { Spinner } from "@/shared/ui/spinner";
import { BrandLogo } from "@/shared/ui/brand-logo";

export default function DashboardLoading() {
  return (
    <div className="grid min-h-[calc(100svh-4rem)] place-items-center bg-paper px-5 text-ink">
      <div className="grid justify-items-center gap-5 text-center" role="status" aria-live="polite" aria-busy="true">
        <BrandLogo className="h-12 w-auto" priority />
        <Spinner className="size-6 text-accent" />
        <p className="font-mono text-[0.65rem] font-semibold tracking-[0.14em] text-muted uppercase">
          Preparando tu dashboard
        </p>
      </div>
    </div>
  );
}

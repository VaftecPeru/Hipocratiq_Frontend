import { Spinner } from "@/shared/ui/spinner";

export default function DashboardLoading() {
  return (
    <main className="grid min-h-svh place-items-center bg-paper px-5 text-ink">
      <div className="grid justify-items-center gap-5 text-center" role="status" aria-live="polite" aria-busy="true">
        <span className="grid size-12 place-items-center rounded-full border border-ink font-display text-xl font-semibold italic" aria-hidden="true">
          H
        </span>
        <Spinner className="size-6 text-accent" />
        <p className="font-mono text-[0.65rem] font-semibold tracking-[0.14em] text-muted uppercase">
          Preparando tu dashboard
        </p>
      </div>
    </main>
  );
}

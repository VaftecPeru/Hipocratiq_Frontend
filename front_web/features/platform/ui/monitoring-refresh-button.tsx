"use client";

import { RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function MonitoringRefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button className="flex min-h-9 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-xs font-bold text-white transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-60" type="button" disabled={isPending} onClick={() => startTransition(() => router.refresh())}>
      <RotateCw className={`size-3.5 ${isPending ? "animate-spin" : ""}`} strokeWidth={2} aria-hidden="true" />
      {isPending ? "Actualizando..." : "Actualizar"}
    </button>
  );
}

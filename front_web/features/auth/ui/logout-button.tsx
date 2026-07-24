"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout as endSession } from "@/features/auth/api/browser-auth";
import { ApiError } from "@/shared/api/http-client";

export function LogoutButton({ appearance = "default" }: { appearance?: "default" | "navigation" }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleLogout() {
    setIsPending(true);
    setError(null);

    startTransition(async () => {
      try {
        await endSession();
        router.replace("/");
        router.refresh();
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "No pudimos cerrar la sesión.",
        );
      } finally {
        setIsPending(false);
      }
    });
  }

  return (
    <div className="flex items-center gap-4">
      {error ? (
        <span className="text-xs text-danger" role="alert">
          {error}
        </span>
      ) : null}
      <button className={appearance === "navigation" ? "flex min-h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-bold text-danger transition-colors hover:bg-danger-soft focus-visible:outline-3 focus-visible:outline-focus lg:min-h-7" : "min-h-10 border border-line bg-transparent px-4 text-xs font-bold text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white focus-visible:outline-[3px] focus-visible:outline-offset-3 focus-visible:outline-focus"} type="button" onClick={handleLogout} disabled={isPending}>
        {appearance === "navigation" ? <LogOut className="size-4" strokeWidth={1.8} aria-hidden="true" /> : null}
        {isPending ? "Cerrando..." : "Cerrar sesión"}
      </button>
    </div>
  );
}

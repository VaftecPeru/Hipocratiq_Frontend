"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completeGoogleAuth } from "@/features/auth/api/browser-auth";
import { dashboardPathForActorContext } from "@/features/auth/lib/dashboard-path";
import { Spinner } from "@/shared/ui/spinner";

type Props = {
  handoff: string | null;
  errorCode: string | null;
};

export function GoogleAuthCallback({ handoff, errorCode }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(
    errorCode ? "No pudimos completar el acceso con Google." : null,
  );

  useEffect(() => {
    if (errorCode || !handoff) {
      if (!errorCode && !handoff) {
        setError("La respuesta de Google no contiene una sesión válida.");
      }
      return;
    }

    let active = true;

    completeGoogleAuth(handoff)
      .then((response) => {
        if (!active) return;
        if (response.data.status === "authenticated") {
          router.replace(dashboardPathForActorContext(response.data.actor_context));
          return;
        }

        const query = new URLSearchParams({
          google_registration_token: response.data.registration_token,
          registration_type: response.data.registration_type,
        });
        router.replace(`/register?${query.toString()}`);
      })
      .catch((caught: unknown) => {
        if (!active) return;
        setError(caught instanceof Error ? caught.message : "No pudimos completar el acceso con Google.");
      });

    return () => {
      active = false;
    };
  }, [errorCode, handoff, router]);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-md rounded-xl border border-danger/20 bg-surface p-6 text-center shadow-sm">
        <h1 className="text-lg font-extrabold text-ink">No pudimos iniciar con Google</h1>
        <p className="mt-2 text-sm leading-6 text-muted">{error}</p>
        <Link className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-4 text-xs font-extrabold text-white" href="/">
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-72 w-full max-w-md flex-col items-center justify-center rounded-xl border border-line bg-surface p-6 text-center shadow-sm" role="status">
      <Spinner />
      <h1 className="mt-4 text-lg font-extrabold text-ink">Validando tu cuenta de Google</h1>
      <p className="mt-2 text-sm text-muted">HIPOCRATIQ está verificando tu identidad y permisos.</p>
    </div>
  );
}

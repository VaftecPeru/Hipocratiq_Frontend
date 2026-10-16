import type { Metadata } from "next";
import { GoogleAuthCallback } from "@/features/auth/ui/google-auth-callback";

export const metadata: Metadata = {
  title: "Acceso con Google",
};

type Props = {
  searchParams: Promise<{
    handoff?: string | string[];
    error?: string | string[];
  }>;
};

export default async function GoogleCallbackPage({ searchParams }: Props) {
  const params = await searchParams;
  const handoff = Array.isArray(params.handoff) ? params.handoff[0] : params.handoff;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <main className="grid min-h-dvh place-items-center bg-surface-subtle px-5 py-10">
      <GoogleAuthCallback handoff={handoff ?? null} errorCode={error ?? null} />
    </main>
  );
}

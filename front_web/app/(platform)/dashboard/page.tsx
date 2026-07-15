import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/features/auth/ui/logout-button";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";

export const metadata: Metadata = {
  title: "Panel administrativo",
};

export default async function DashboardPage() {
  const session = await getAuthenticatedSession();

  if (!session) {
    redirect("/");
  }

  const firstName = session.user.name.split(" ")[0];

  return (
    <main className="min-h-svh bg-paper text-ink">
      <header className="flex min-h-20 items-center justify-between gap-6 border-b border-line px-5 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full border border-ink font-display text-lg font-semibold italic" aria-hidden="true">
            H
          </span>
          <div>
            <p className="text-sm font-bold tracking-[0.18em] uppercase">Hipocratiq</p>
            <p className="font-mono text-[0.62rem] tracking-[0.15em] text-muted uppercase">
              Administración global
            </p>
          </div>
        </div>
        <LogoutButton />
      </header>

      <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_20rem] lg:px-12 lg:py-20">
        <section>
          <p className="font-mono text-[0.65rem] font-semibold tracking-[0.16em] text-muted uppercase">Panel de control / 01</p>
          <h1 className="mt-5 max-w-4xl font-display text-[clamp(3.75rem,8vw,7.5rem)] leading-[0.82] tracking-[-0.06em]">
            Buenos días,
            <span className="block italic text-accent">{firstName}.</span>
          </h1>

          <div className="mt-16 grid border-y border-line sm:grid-cols-3">
            <article className="grid min-h-60 content-between gap-4 py-6 sm:p-7">
              <span className="font-mono text-[0.65rem] text-accent">01</span>
              <h2 className="self-end font-display text-2xl leading-none">Identidad validada</h2>
              <p className="max-w-60 text-[0.8rem] leading-5 text-muted">Contraseña y segundo factor confirmados.</p>
            </article>
            <article className="grid min-h-60 content-between gap-4 py-6 sm:border-x sm:border-line sm:p-7">
              <span className="font-mono text-[0.65rem] text-accent">02</span>
              <h2 className="self-end font-display text-2xl leading-none">Alcance global</h2>
              <p className="max-w-60 text-[0.8rem] leading-5 text-muted">Autorización de Super Administrador activa.</p>
            </article>
            <article className="grid min-h-60 content-between gap-4 py-6 sm:p-7">
              <span className="font-mono text-[0.65rem] text-accent">03</span>
              <h2 className="self-end font-display text-2xl leading-none">Sesión protegida</h2>
              <p className="max-w-60 text-[0.8rem] leading-5 text-muted">Canal Web asegurado mediante cookie HttpOnly.</p>
            </article>
          </div>
        </section>

        <aside className="h-fit border-t-4 border-ink bg-white p-6 lg:mt-8" aria-label="Sesión actual">
          <p className="font-mono text-[0.65rem] font-semibold tracking-[0.16em] text-muted uppercase">Sesión actual</p>
          <dl className="mt-8 grid gap-5">
            <div>
              <dt className="mb-1 font-mono text-[0.65rem] font-semibold tracking-[0.16em] text-muted uppercase">Usuario</dt>
              <dd className="text-sm font-semibold">{session.user.name}</dd>
            </div>
            <div>
              <dt className="mb-1 font-mono text-[0.65rem] font-semibold tracking-[0.16em] text-muted uppercase">Correo</dt>
              <dd className="break-all text-sm font-semibold">{session.user.email}</dd>
            </div>
            <div>
              <dt className="mb-1 font-mono text-[0.65rem] font-semibold tracking-[0.16em] text-muted uppercase">Rol</dt>
              <dd className="text-sm font-semibold">Super Admin</dd>
            </div>
            <div>
              <dt className="mb-1 font-mono text-[0.65rem] font-semibold tracking-[0.16em] text-muted uppercase">Contexto</dt>
              <dd className="text-sm font-semibold">{session.actor_context} / {session.client_type}</dd>
            </div>
          </dl>
          <div className="mt-8 flex items-center gap-2 border-t border-line pt-5 text-xs font-semibold text-accent">
            <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
            Cuenta activa
          </div>
        </aside>
      </div>
    </main>
  );
}

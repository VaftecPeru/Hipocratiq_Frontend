import type { Metadata } from "next";
import { redirect } from "next/navigation";
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
    <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-5 py-8 sm:px-8 xl:grid-cols-[1fr_18rem] lg:px-12 lg:py-10">
        <section>
          <p className="font-mono text-[0.62rem] font-semibold tracking-[0.14em] text-muted uppercase">Panel de control</p>
          <h1 className="mt-2 text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold leading-[1.1] tracking-[-0.04em]">
            Buenos días, <span className="text-accent">{firstName}.</span>
          </h1>

          <div className="mt-8 grid gap-px rounded-xl border border-line bg-line sm:grid-cols-3">
            <article className="grid min-h-44 content-between gap-3 bg-surface p-5 first:rounded-t-xl sm:first:rounded-tl-xl sm:first:rounded-tr-none sm:last:rounded-tr-xl">
              <span className="font-mono text-[0.6rem] text-accent">01</span>
              <h2 className="self-end text-sm font-extrabold leading-tight">Identidad validada</h2>
              <p className="max-w-56 text-[0.72rem] leading-[1.5] text-muted">Contraseña y segundo factor confirmados.</p>
            </article>
            <article className="grid min-h-44 content-between gap-3 bg-surface p-5">
              <span className="font-mono text-[0.6rem] text-accent">02</span>
              <h2 className="self-end text-sm font-extrabold leading-tight">Alcance global</h2>
              <p className="max-w-56 text-[0.72rem] leading-[1.5] text-muted">Autorización de Super Administrador activa.</p>
            </article>
            <article className="grid min-h-44 content-between gap-3 bg-surface p-5 last:rounded-b-xl sm:last:rounded-br-xl sm:last:rounded-bl-none sm:first:rounded-bl-xl">
              <span className="font-mono text-[0.6rem] text-accent">03</span>
              <h2 className="self-end text-sm font-extrabold leading-tight">Sesión protegida</h2>
              <p className="max-w-56 text-[0.72rem] leading-[1.5] text-muted">Canal Web asegurado mediante cookie HttpOnly.</p>
            </article>
          </div>
        </section>

        <aside className="h-fit rounded-xl border border-line bg-surface p-5 xl:mt-6" aria-label="Sesión actual">
          <p className="font-mono text-[0.6rem] font-semibold tracking-[0.14em] text-muted uppercase">Sesión actual</p>
          <dl className="mt-5 grid gap-4">
            <div>
              <dt className="mb-0.5 font-mono text-[0.58rem] font-semibold tracking-[0.14em] text-muted uppercase">Usuario</dt>
              <dd className="text-xs font-bold">{session.user.name}</dd>
            </div>
            <div>
              <dt className="mb-0.5 font-mono text-[0.58rem] font-semibold tracking-[0.14em] text-muted uppercase">Correo</dt>
              <dd className="break-all text-xs font-bold">{session.user.email}</dd>
            </div>
            <div>
              <dt className="mb-0.5 font-mono text-[0.58rem] font-semibold tracking-[0.14em] text-muted uppercase">Rol</dt>
              <dd className="text-xs font-bold">Super Admin</dd>
            </div>
            <div>
              <dt className="mb-0.5 font-mono text-[0.58rem] font-semibold tracking-[0.14em] text-muted uppercase">Contexto</dt>
              <dd className="text-xs font-bold">{session.actor_context} / {session.client_type}</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-[0.65rem] font-bold text-accent">
            <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
            Cuenta activa
          </div>
        </aside>
    </div>
  );
}

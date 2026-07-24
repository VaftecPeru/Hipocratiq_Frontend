"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, LogOut, ShieldCheck } from "lucide-react";
import { logout } from "@/features/auth/api/browser-auth";
import type { AuthenticatedUser } from "@/features/auth/model/auth.types";

export function PatientDashboard({ user }: { user: AuthenticatedUser }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try { await logout(); router.replace("/"); router.refresh(); } finally { setPending(false); }
  }

  return (
    <main className="min-h-dvh bg-[#f6f8fc] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between gap-4">
          <div><p className="font-mono text-[0.62rem] font-semibold tracking-[0.14em] text-muted uppercase">Portal del paciente</p><h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">Hola, {user.name.split(" ")[0]}</h1></div>
          <button className="flex min-h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-xs font-bold text-muted hover:text-accent" type="button" disabled={pending} onClick={handleLogout}><LogOut className="size-4" aria-hidden="true" />Cerrar sesión</button>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-line bg-white p-6"><span className="grid size-10 place-items-center rounded-xl bg-success-soft text-success"><CheckCircle2 className="size-5" aria-hidden="true" /></span><h2 className="mt-5 text-sm font-extrabold">Registro verificado</h2><p className="mt-2 text-xs leading-5 text-muted">Tu número de teléfono fue validado mediante OTP.</p></article>
          <article className="rounded-2xl border border-line bg-white p-6"><span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent"><Building2 className="size-5" aria-hidden="true" /></span><h2 className="mt-5 text-sm font-extrabold">Clínica asociada</h2><p className="mt-2 text-xs leading-5 text-muted">{user.patient?.clinic?.name ?? "Tu clínica seleccionada"}</p></article>
        </section>

        <section className="mt-4 rounded-2xl border border-line bg-white p-6"><div className="flex items-start gap-4"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" /><div><h2 className="text-sm font-extrabold">Plan pendiente</h2><p className="mt-2 text-xs leading-5 text-muted">La selección del plan no forma parte del registro. Estará disponible en este portal en una etapa posterior.</p></div></div></section>
      </div>
    </main>
  );
}

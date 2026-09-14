import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, House, ShieldX } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { BrandLogo } from "@/shared/ui/brand-logo";

type StatusPageProps = {
  code: "403" | "404";
  status: "notFound" | "unauthorized";
  icon: LucideIcon;
  primaryHref: string;
  secondaryHref?: string;
};

export function StatusPage({
  code,
  status,
  icon: Icon,
  primaryHref,
  secondaryHref,
}: StatusPageProps) {
  const t = useTranslations(`status.${status}`);
  const statusT = useTranslations("status");

  return (
    <main className="relative isolate grid min-h-dvh overflow-hidden bg-paper text-ink lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.78fr)]">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -top-32 -left-32 size-96 rounded-full border-[5rem] border-accent-soft/70" />
        <div className="absolute right-[12%] bottom-[-12rem] size-96 rounded-full border border-line" />
        <div className="absolute top-0 bottom-0 left-[58%] hidden w-px bg-line lg:block" />
      </div>

      <section className="flex min-h-[62dvh] flex-col px-5 py-6 sm:px-10 sm:py-9 lg:min-h-dvh lg:px-[clamp(3rem,7vw,7.5rem)] lg:py-12">
        <header>
          <Link
            className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus"
            href="/"
            aria-label={t("homeAria")}
          >
            <BrandLogo className="h-9 w-10" priority />
            <span className="text-xs font-extrabold tracking-[0.12em]">HIPOCRATIQ</span>
          </Link>
        </header>

        <div className="my-auto max-w-2xl py-16 motion-safe:animate-[fade-up-in_400ms_ease-out_both]">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent" aria-hidden="true">
              <Icon className="size-4.5" strokeWidth={1.8} />
            </span>
            <p className="font-mono text-2xs font-bold tracking-[0.16em] text-accent uppercase">{t("eyebrow")}</p>
          </div>

          <h1 className="mt-8 max-w-xl text-balance text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.93] font-extrabold tracking-[-0.065em]">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-lg text-pretty text-sm leading-6 text-ink-secondary sm:text-base sm:leading-7">
            {t("description")}
          </p>
          <p className="mt-3 max-w-lg text-xs leading-5 text-muted">{t("detail")}</p>

          <nav className="mt-9 flex flex-col gap-2 sm:flex-row" aria-label={statusT("recoveryActions")}>
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-xs font-extrabold text-white shadow-[0_0.75rem_1.75rem_rgb(8_98_221/18%)] transition-[background-color,transform,box-shadow] hover:-translate-y-px hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus"
              href={primaryHref}
            >
              <House className="size-4" strokeWidth={1.8} aria-hidden="true" />
              {t("primary")}
            </Link>
            {secondaryHref ? (
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-5 text-xs font-extrabold text-ink transition-colors hover:bg-surface-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus"
                href={secondaryHref}
              >
                {t("secondary")}
                <ArrowUpRight className="size-4" strokeWidth={1.8} aria-hidden="true" />
              </Link>
            ) : null}
          </nav>
        </div>

        <footer className="flex items-center gap-2 border-t border-line pt-5 text-2xs text-muted">
          <ShieldX className="size-3.5" strokeWidth={1.7} aria-hidden="true" />
          {statusT("statusCode", { code })}
        </footer>
      </section>

      <aside className="relative hidden min-h-dvh overflow-hidden bg-accent lg:grid lg:place-items-center" aria-hidden="true">
        <div className="absolute inset-x-10 top-10 flex items-center justify-between font-mono text-[0.6rem] font-bold tracking-[0.18em] text-white/55 uppercase">
           <span>{t("systemState")}</span>
          <span>HIP-{code}</span>
        </div>
        <div className="relative">
          <span className="block font-mono text-[clamp(13rem,28vw,29rem)] leading-none font-bold tracking-[-0.13em] text-white/10">
            {code}
          </span>
          <div className="absolute top-1/2 left-1/2 grid size-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/25">
            <div className="grid size-20 place-items-center rounded-full border border-white/45">
              <Icon className="size-7 text-white" strokeWidth={1.4} />
            </div>
          </div>
        </div>
        <p className="absolute right-10 bottom-10 left-10 border-t border-white/20 pt-5 text-right font-mono text-[0.6rem] font-semibold tracking-[0.12em] text-white/60 uppercase">
           {t("systemMessage")}
        </p>
      </aside>
    </main>
  );
}

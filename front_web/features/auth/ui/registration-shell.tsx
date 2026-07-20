import type { ReactNode } from "react";
import { AuthVisualPanel } from "@/features/auth/ui/auth-visual-panel";
import { BrandLogo } from "@/shared/ui/brand-logo";

export function RegistrationShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid h-dvh overflow-hidden bg-white min-[900px]:grid-cols-[minmax(36rem,40%)_1fr]">
      <section
        className="grid h-dvh min-h-0 grid-rows-[auto_1fr_auto] overflow-hidden bg-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
        aria-label="Registro de clínica"
      >
        <header className="px-[clamp(1.25rem,5vw,3.25rem)] pt-5 pb-2 sm:pt-7">
          <span className="grid size-10 place-items-center rounded-[0.7rem] bg-accent shadow-[0_0.45rem_1rem_rgb(8_98_221/20%)]">
            <BrandLogo className="h-7 w-auto brightness-0 invert" priority />
          </span>
        </header>

        <div
          id="registration-scroll-region"
          className="min-h-0 overflow-y-auto overscroll-contain px-[clamp(1.25rem,4vw,3rem)] py-5 [scrollbar-width:none] sm:py-7 [&::-webkit-scrollbar]:hidden"
        >
          <div className="mx-auto grid min-h-full w-full place-items-center">{children}</div>
        </div>

        <footer className="flex min-h-12 items-center justify-between gap-4 px-[clamp(1.25rem,5vw,3.25rem)] text-[0.6rem] text-[#91a0b8]">
          <span>© 2026 Hipocratiq</span>
          <div className="flex gap-5"><span>Soporte</span><span>Seguridad</span></div>
        </footer>
      </section>

      <AuthVisualPanel />
    </main>
  );
}

import { BrandLogo } from "@/shared/ui/brand-logo";
import { getTranslations } from "next-intl/server";

export default async function AppLoading() {
  const t = await getTranslations("system");

  return (
    <main
      className="grid min-h-svh place-items-center bg-[#0B64DD] px-6 text-white"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{t("loading")}</span>
      <div className="flex flex-col items-center gap-4 motion-safe:animate-pulse" aria-hidden="true">
        <span className="grid size-20 place-items-center rounded-2xl bg-white/10 shadow-[0_1rem_2.5rem_rgb(0_36_94/28%)] ring-1 ring-white/20">
          <BrandLogo className="h-12 w-14 brightness-0 invert" priority />
        </span>
        <span className="text-sm font-black tracking-[0.24em]">HIPOCRATIQ</span>
        <span className="h-1.5 w-36 overflow-hidden rounded-full bg-white/25">
          <span className="block h-full w-2/3 rounded-full bg-white" />
        </span>
      </div>
    </main>
  );
}

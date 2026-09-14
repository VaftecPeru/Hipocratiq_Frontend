"use client";

import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/shared/ui/locale-switcher";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

type PreferenceControlsProps = {
  className?: string;
  idPrefix?: string;
  menuAlign?: "left" | "right";
};

export function PreferenceControls({ className = "", idPrefix = "platform", menuAlign = "right" }: PreferenceControlsProps) {
  const t = useTranslations("preferences");

  return (
    <div
      className={`inline-flex min-w-0 items-center gap-1 rounded-xl border border-line bg-surface px-1 py-1 shadow-[0_0.35rem_1rem_rgb(16_27_51/7%)] ${className}`}
      role="group"
      aria-label={t("clusterLabel")}
    >
      <LocaleSwitcher idPrefix={idPrefix} menuAlign={menuAlign} />
      <span className="h-5 w-px shrink-0 bg-line" aria-hidden="true" />
      <ThemeToggle idPrefix={idPrefix} menuAlign={menuAlign} />
    </div>
  );
}

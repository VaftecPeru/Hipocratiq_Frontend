"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useTheme, type Theme } from "@/shared/ui/theme-provider";

const THEME_OPTIONS: readonly { value: Theme; labelKey: "light" | "dark" | "system"; icon: typeof Sun }[] = [
  { value: "light", labelKey: "light", icon: Sun },
  { value: "dark", labelKey: "dark", icon: Moon },
  { value: "system", labelKey: "system", icon: Monitor },
];

export function ThemeToggle() {
  const t = useTranslations("theme");
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentOption = THEME_OPTIONS.find((option) => option.value === theme) ?? THEME_OPTIONS[2];
  const CurrentIcon = currentOption.icon;
  const menuId = "platform-theme-menu";

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsidePointer = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={t("current", { theme: t(currentOption.labelKey) })}
        className="grid min-h-9 min-w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-focus"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <CurrentIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />
      </button>
      {isOpen ? (
        <div
          aria-label={t("label")}
          className="absolute top-[calc(100%+0.5rem)] right-0 z-50 min-w-36 rounded-xl border border-line bg-surface p-1 shadow-[0_1rem_3rem_rgb(16_27_51/16%)]"
          id={menuId}
          role="menu"
        >
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const label = t(option.labelKey);

            return (
              <button
                aria-checked={theme === option.value}
                className={`flex min-h-10 w-full items-center gap-2 rounded-lg px-2.5 text-left text-xs font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-[-2px] focus-visible:outline-focus ${theme === option.value ? "bg-accent-soft text-accent" : "text-ink hover:bg-surface-subtle"}`}
                key={option.value}
                role="menuitemradio"
                type="button"
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                }}
              >
                <Icon className="size-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

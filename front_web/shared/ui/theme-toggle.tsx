"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useTheme, type Theme } from "@/shared/ui/theme-provider";

const THEME_OPTIONS: readonly { value: Theme; labelKey: "light" | "dark" | "system"; icon: typeof Sun }[] = [
  { value: "light", labelKey: "light", icon: Sun },
  { value: "dark", labelKey: "dark", icon: Moon },
  { value: "system", labelKey: "system", icon: Monitor },
];

type ThemeToggleProps = {
  idPrefix?: string;
  menuAlign?: "left" | "right";
};

export function ThemeToggle({ idPrefix = "platform", menuAlign = "right" }: ThemeToggleProps) {
  const t = useTranslations("theme");
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const currentOption = THEME_OPTIONS.find((option) => option.value === theme) ?? THEME_OPTIONS[2];
  const CurrentIcon = currentOption.icon;
  const menuId = `${idPrefix}-theme-menu`;
  const currentOptionIndex = THEME_OPTIONS.findIndex((option) => option.value === currentOption.value);
  const menuAlignmentClass = menuAlign === "left" ? "left-0 right-auto" : "right-0 left-auto";

  const closeMenu = useCallback((restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) {
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, []);

  const openMenu = useCallback((focusIndex: number) => {
    setIsOpen(true);
    requestAnimationFrame(() => optionRefs.current[focusIndex]?.focus());
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsidePointer = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) closeMenu();
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") closeMenu(true);
    };

    document.addEventListener("mousedown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [closeMenu, isOpen]);

  function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const items = optionRefs.current.filter((item): item is HTMLButtonElement => item !== null);
    if (items.length === 0) return;

    const activeIndex = items.indexOf(document.activeElement as HTMLButtonElement);
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        items[(activeIndex < 0 ? 0 : activeIndex + 1) % items.length]?.focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        items[(activeIndex < 0 ? items.length - 1 : activeIndex - 1 + items.length) % items.length]?.focus();
        break;
      case "Home":
        event.preventDefault();
        items[0]?.focus();
        break;
      case "End":
        event.preventDefault();
        items[items.length - 1]?.focus();
        break;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        closeMenu(true);
        break;
    }
  }

  function selectTheme(nextTheme: Theme) {
    const option = THEME_OPTIONS.find((candidate) => candidate.value === nextTheme) ?? THEME_OPTIONS[2];
    setTheme(nextTheme);
    setAnnouncement(t("changed", { theme: t(option.labelKey) }));
    closeMenu(true);
  }

  return (
    <div className="relative" ref={containerRef}>
      <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={t("current", { theme: t(currentOption.labelKey) })}
        className="grid min-h-9 min-w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-focus"
        type="button"
        ref={triggerRef}
        onClick={() => (isOpen ? closeMenu(true) : openMenu(currentOptionIndex))}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            openMenu(currentOptionIndex);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            openMenu(THEME_OPTIONS.length - 1);
          }
        }}
      >
        <CurrentIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />
      </button>
      {isOpen ? (
        <div
          aria-label={t("label")}
          className={`absolute top-[calc(100%+0.5rem)] z-50 min-w-36 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-surface p-1 shadow-[0_1rem_3rem_rgb(16_27_51/16%)] ${menuAlignmentClass}`}
          id={menuId}
          role="menu"
          aria-orientation="vertical"
          onKeyDown={handleMenuKeyDown}
        >
          {THEME_OPTIONS.map((option, index) => {
            const Icon = option.icon;
            const label = t(option.labelKey);

            return (
              <button
                aria-checked={theme === option.value}
                className={`flex min-h-10 w-full items-center gap-2 rounded-lg px-2.5 text-left text-xs font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-[-2px] focus-visible:outline-focus ${theme === option.value ? "bg-accent-soft text-accent" : "text-ink hover:bg-surface-subtle"}`}
                key={option.value}
                role="menuitemradio"
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                tabIndex={theme === option.value ? 0 : -1}
                type="button"
                onClick={() => selectTheme(option.value)}
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

"use client";

import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthPlatformSettings } from "@/features/auth/ui/auth-platform-settings";
import { useLocalePreference } from "@/shared/ui/locale-provider";
import type { AppLocale } from "@/i18n/config";

type LocaleOption = {
  value: "es" | "en";
  labelKey: "optionEsMx" | "optionEnUs";
  code: "ES" | "EN";
};

const LOCALE_OPTIONS: readonly LocaleOption[] = [
  { value: "es", labelKey: "optionEsMx", code: "ES" },
  { value: "en", labelKey: "optionEnUs", code: "EN" },
];

function localeLanguage(locale: AppLocale): LocaleOption["value"] {
  return locale.startsWith("en") ? "en" : "es";
}

function runtimeLocaleForOption(
  option: LocaleOption,
  currentLocale: AppLocale,
  enabledLocales: readonly AppLocale[],
): AppLocale | undefined {
  if (localeLanguage(currentLocale) === option.value && enabledLocales.includes(currentLocale)) {
    return currentLocale;
  }

  return enabledLocales.find((enabledLocale) => localeLanguage(enabledLocale) === option.value);
}

type LocaleSwitcherProps = {
  idPrefix?: string;
  menuAlign?: "left" | "right";
};

export function LocaleSwitcher({ idPrefix = "platform", menuAlign = "right" }: LocaleSwitcherProps) {
  const t = useTranslations("localeSwitcher");
  const { locale, setLocale } = useLocalePreference();
  const { localization } = useAuthPlatformSettings();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [announcement, setAnnouncement] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = `${idPrefix}-locale-menu`;
  const availableOptions = useMemo(
    () => LOCALE_OPTIONS.filter((option) => localization.enabledLocales.some((enabledLocale) => localeLanguage(enabledLocale) === option.value)),
    [localization.enabledLocales],
  );
  const currentOption = LOCALE_OPTIONS.find((option) => option.value === localeLanguage(locale));
  const currentLabel = currentOption ? t(currentOption.labelKey) : locale;
  const currentCode = currentOption?.code ?? (locale.startsWith("en") ? "EN" : "ES");
  const currentOptionIndex = Math.max(0, availableOptions.findIndex((option) => option.value === currentOption?.value));
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

  function selectLocale(option: LocaleOption) {
    const nextLocale = runtimeLocaleForOption(option, locale, localization.enabledLocales);
    if (!nextLocale) {
      closeMenu(true);
      return;
    }

    if (nextLocale === locale) {
      closeMenu(true);
      return;
    }

    closeMenu(true);
    setAnnouncement(t("changed", { language: t(option.labelKey) }));
    setLocale(nextLocale);
    startTransition(() => router.refresh());
  }

  return (
    <div className="relative" ref={containerRef}>
      <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={t("current", { language: currentLabel })}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-2xs font-extrabold text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-focus disabled:opacity-60"
        disabled={isPending}
        type="button"
        ref={triggerRef}
        onClick={() => (isOpen ? closeMenu(true) : openMenu(currentOptionIndex))}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            openMenu(currentOptionIndex);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            openMenu(Math.max(0, availableOptions.length - 1));
          }
        }}
      >
        <Languages className="size-4" strokeWidth={1.8} aria-hidden="true" />
        <span>{currentCode}</span>
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
          {availableOptions.map((option, index) => {
            const label = t(option.labelKey);

            return (
              <button
                aria-checked={currentOption?.value === option.value}
                className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-lg px-2.5 text-left text-xs font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-[-2px] focus-visible:outline-focus ${currentOption?.value === option.value ? "bg-accent-soft text-accent" : "text-ink hover:bg-surface-subtle"}`}
                key={option.value}
                role="menuitemradio"
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                tabIndex={currentOption?.value === option.value ? 0 : -1}
                type="button"
                onClick={() => selectLocale(option)}
              >
                <span>{label}</span>
                <span className="font-mono text-2xs text-muted">{option.code}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

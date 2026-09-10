"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE_NAME, isAppLocale, type AppLocale } from "@/i18n/config";

const LOCALE_OPTIONS: readonly { value: AppLocale; labelKey: "optionEs" | "optionEn" }[] = [
  { value: "es", labelKey: "optionEs" },
  { value: "en", labelKey: "optionEn" },
];

export function LocaleSwitcher() {
  const t = useTranslations("localeSwitcher");
  const currentLocale = useLocale();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [localeToPersist, setLocaleToPersist] = useState<AppLocale | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const locale: AppLocale = isAppLocale(currentLocale) ? currentLocale : "es";
  const menuId = "platform-locale-menu";

  useEffect(() => {
    if (!localeToPersist) return;

    document.cookie = `${LOCALE_COOKIE_NAME}=${localeToPersist}; Path=/; Max-Age=31536000; SameSite=Lax`;
    startTransition(() => router.refresh());
  }, [localeToPersist, router, startTransition]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsidePointer = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  function selectLocale(nextLocale: AppLocale) {
    if (nextLocale === locale) {
      setIsOpen(false);
      return;
    }

    setIsOpen(false);
    setAnnouncement(t("changed", { language: t(nextLocale === "es" ? "optionEs" : "optionEn") }));
    setLocaleToPersist(nextLocale);
  }

  const currentLabel = t(locale === "es" ? "optionEs" : "optionEn");

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
        onClick={() => setIsOpen((current) => !current)}
      >
        <Languages className="size-4" strokeWidth={1.8} aria-hidden="true" />
        <span>{locale.toUpperCase()}</span>
      </button>
      {isOpen ? (
        <div
          aria-label={t("label")}
          className="absolute top-[calc(100%+0.5rem)] right-0 z-50 min-w-36 rounded-xl border border-line bg-surface p-1 shadow-[0_1rem_3rem_rgb(16_27_51/16%)]"
          id={menuId}
          role="menu"
        >
          {LOCALE_OPTIONS.map((option) => {
            const label = t(option.labelKey);

            return (
              <button
                aria-checked={locale === option.value}
                className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-lg px-2.5 text-left text-xs font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-[-2px] focus-visible:outline-focus ${locale === option.value ? "bg-accent-soft text-accent" : "text-ink hover:bg-surface-subtle"}`}
                key={option.value}
                role="menuitemradio"
                type="button"
                onClick={() => selectLocale(option.value)}
              >
                <span>{label}</span>
                <span className="font-mono text-2xs text-muted">{option.value.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

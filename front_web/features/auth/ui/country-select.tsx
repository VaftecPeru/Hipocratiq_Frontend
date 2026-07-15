"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import PeruFlag from "country-flag-icons/react/3x2/PE";
import MexicoFlag from "country-flag-icons/react/3x2/MX";
import UnitedStatesFlag from "country-flag-icons/react/3x2/US";
import { COUNTRY_OPTIONS } from "@/features/auth/lib/phone-number";
import type { CountryCode } from "@/features/auth/model/auth.types";

type CountrySelectProps = {
  value: CountryCode;
  onChange: (country: CountryCode) => void;
  hasError?: boolean;
};

const FLAGS = {
  PE: PeruFlag,
  MX: MexicoFlag,
  US: UnitedStatesFlag,
} satisfies Record<CountryCode, typeof PeruFlag>;

const COUNTRY_CODES = Object.keys(COUNTRY_OPTIONS) as CountryCode[];

export function CountrySelect({ value, onChange, hasError }: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const Flag = FLAGS[value];
  const selectedCountry = COUNTRY_OPTIONS[value];

  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const items = listRef.current?.querySelectorAll("[role=option]");
      (items?.[focusedIndex] as HTMLElement)?.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, focusedIndex]);

  function toggle() {
    if (isOpen) {
      close();
    } else {
      setIsOpen(true);
      setFocusedIndex(COUNTRY_CODES.indexOf(value));
    }
  }

  function select(code: CountryCode) {
    onChange(code);
    close();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          select(COUNTRY_CODES[focusedIndex]);
        } else {
          toggle();
        }
        break;
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(COUNTRY_CODES.indexOf(value));
        } else {
          setFocusedIndex((prev) => Math.min(prev + 1, COUNTRY_CODES.length - 1));
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
        }
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        close();
        break;
    }
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        className={`flex h-12 items-center gap-2 rounded-l-[0.65rem] border bg-[#f7f9fd] px-3 transition-colors duration-150 hover:bg-[#edf3ff] focus-visible:outline-[3px] focus-visible:outline-offset-[-2px] focus-visible:outline-[#98c1fb] ${hasError ? "border-danger" : "border-line"}`}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`País: ${selectedCountry.name} (+${selectedCountry.dialCode})`}
      >
        <Flag className="h-[1.15rem] w-[1.7rem] shrink-0 overflow-hidden rounded-[0.2rem] shadow-[0_0_0_1px_rgb(16_27_51/10%),0_1px_2px_rgb(16_27_51/6%)]" />
        <span className="text-[0.75rem] font-bold text-ink">+{selectedCountry.dialCode}</span>
        <ChevronDown className={`size-3 text-muted/60 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} strokeWidth={2.2} aria-hidden="true" />
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={0}
          aria-activedescendant={focusedIndex >= 0 ? `country-option-${COUNTRY_CODES[focusedIndex]}` : undefined}
          className="absolute top-[calc(100%+0.4rem)] left-0 z-50 w-56 overflow-hidden rounded-xl border border-line bg-white py-1.5 shadow-[0_10px_32px_rgb(16_27_51/14%),0_2px_8px_rgb(16_27_51/8%)] motion-safe:animate-[field-error-enter_150ms_cubic-bezier(0.22,1,0.36,1)]"
        >
          {COUNTRY_CODES.map((code, index) => {
            const ItemFlag = FLAGS[code];
            const option = COUNTRY_OPTIONS[code];
            const isSelected = code === value;
            const isFocused = index === focusedIndex;

            return (
              <li
                key={code}
                id={`country-option-${code}`}
                role="option"
                aria-selected={isSelected}
                className={`flex cursor-pointer items-center gap-3 px-3.5 py-2.5 text-[0.78rem] transition-colors duration-75 ${isFocused ? "bg-[#edf3ff]" : "hover:bg-[#f5f8fc]"} ${isSelected ? "font-bold text-accent" : "text-ink"}`}
                onClick={() => select(code)}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                <ItemFlag className="h-[1.15rem] w-[1.7rem] shrink-0 overflow-hidden rounded-[0.2rem] shadow-[0_0_0_1px_rgb(16_27_51/10%),0_1px_2px_rgb(16_27_51/6%)]" />
                <span className="flex-1">{option.name}</span>
                <span className={`font-mono text-[0.68rem] ${isSelected ? "text-accent" : "text-muted"}`}>+{option.dialCode}</span>
                {isSelected && <Check className="size-3.5 text-accent" strokeWidth={2.5} aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

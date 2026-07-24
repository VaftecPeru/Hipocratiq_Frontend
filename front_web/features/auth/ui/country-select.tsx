"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import PeruFlag from "country-flag-icons/react/3x2/PE";
import MexicoFlag from "country-flag-icons/react/3x2/MX";
import UnitedStatesFlag from "country-flag-icons/react/3x2/US";
import { COUNTRY_OPTIONS } from "@/features/auth/lib/phone-number";
import type { CountryCode } from "@/features/auth/model/auth.types";

type CountrySelectProps = {
  id?: string;
  name?: string;
  value: CountryCode;
  onChange: (country: CountryCode) => void;
  hasError?: boolean;
  ariaDescribedBy?: string;
  mode?: "dial-code" | "country";
};

const FLAGS = {
  PE: PeruFlag,
  MX: MexicoFlag,
  US: UnitedStatesFlag,
} satisfies Record<CountryCode, typeof PeruFlag>;

const COUNTRY_CODES = Object.keys(COUNTRY_OPTIONS) as CountryCode[];

export function CountrySelect({ id, name, value, onChange, hasError, ariaDescribedBy, mode = "dial-code" }: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const Flag = FLAGS[value];
  const selectedCountry = COUNTRY_OPTIONS[value];
  const listboxId = `${id ?? "phone-country"}-options`;
  const isCountryField = mode === "country";

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
        id={id}
        name={name}
        type="button"
        className={`flex items-center gap-2.5 border bg-surface-input px-3.5 text-left transition-[border-color,background-color,box-shadow] duration-150 hover:bg-surface-hover focus-visible:z-10 focus-visible:border-accent focus-visible:bg-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus/30 ${isCountryField ? "min-h-10 w-full justify-between rounded-lg" : "h-10 rounded-l-lg"} ${hasError ? "border-danger" : "border-line"}`}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={`País: ${selectedCountry.name} (+${selectedCountry.dialCode})`}
        aria-describedby={ariaDescribedBy}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <Flag className="h-[1.15rem] w-[1.7rem] shrink-0 overflow-hidden rounded-[0.2rem] shadow-[0_0_0_1px_rgb(16_27_51/10%),0_1px_2px_rgb(16_27_51/6%)]" />
          <span className="truncate text-2xs font-semibold text-ink">{isCountryField ? selectedCountry.name : `+${selectedCountry.dialCode}`}</span>
          {isCountryField ? <span className="text-2xs text-muted">+{selectedCountry.dialCode}</span> : null}
        </span>
        <ChevronDown className={`size-3.5 shrink-0 text-muted/70 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} strokeWidth={2.2} aria-hidden="true" />
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          ref={listRef}
          role="listbox"
          className={`absolute top-[calc(100%+0.4rem)] left-0 z-50 max-h-64 overflow-y-auto rounded-xl border border-line bg-white py-1.5 shadow-[0_10px_32px_rgb(16_27_51/14%),0_2px_8px_rgb(16_27_51/8%)] motion-safe:animate-[field-error-enter_150ms_cubic-bezier(0.22,1,0.36,1)] ${isCountryField ? "w-full min-w-60" : "w-60"}`}
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
                className={`flex min-h-9 cursor-pointer items-center gap-3 px-3 py-2 text-2xs transition-colors duration-75 ${isFocused ? "bg-surface-focused" : "hover:bg-surface-subtle"} ${isSelected ? "font-bold text-accent" : "text-ink"}`}
                onClick={() => select(code)}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                <ItemFlag className="h-[1.15rem] w-[1.7rem] shrink-0 overflow-hidden rounded-[0.2rem] shadow-[0_0_0_1px_rgb(16_27_51/10%),0_1px_2px_rgb(16_27_51/6%)]" />
                <span className="flex-1">{option.name}</span>
                <span className={`font-mono text-2xs ${isSelected ? "text-accent" : "text-muted"}`}>+{option.dialCode}</span>
                {isSelected && <Check className="size-3.5 text-accent" strokeWidth={2.5} aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

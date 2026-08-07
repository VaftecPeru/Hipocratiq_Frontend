"use client";

import { Check, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

export function FilterSelect<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const labelId = useId();
  const listboxId = `${labelId}-options`;
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedLabel = options[selectedIndex]?.label ?? "";

  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) close();
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const items = listRef.current?.querySelectorAll("[role=option]");
      (items?.[focusedIndex] as HTMLElement | undefined)?.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, focusedIndex]);

  function open() {
    setIsOpen(true);
    setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }

  function select(index: number) {
    const option = options[index];
    if (option) onChange(option.value);
    close();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        if (isOpen && focusedIndex >= 0) select(focusedIndex);
        else if (isOpen) close();
        else open();
        break;
      case "ArrowDown":
        event.preventDefault();
        if (isOpen) setFocusedIndex((current) => Math.min(current + 1, options.length - 1));
        else open();
        break;
      case "ArrowUp":
        event.preventDefault();
        if (isOpen) setFocusedIndex((current) => Math.max(current - 1, 0));
        break;
      case "Home":
        if (isOpen) {
          event.preventDefault();
          setFocusedIndex(0);
        }
        break;
      case "End":
        if (isOpen) {
          event.preventDefault();
          setFocusedIndex(options.length - 1);
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
    <div className="grid gap-1 text-2xs font-bold text-muted" ref={containerRef}>
      <span id={labelId}>{label}</span>
      <div className="relative">
        <button
          type="button"
          className="flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-line bg-surface px-2.5 text-xs font-medium text-ink outline-none transition-colors hover:border-accent/60 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-focus/40 md:h-8"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-labelledby={labelId}
          onClick={() => (isOpen ? close() : open())}
          onKeyDown={handleKeyDown}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown className={`size-3.5 shrink-0 text-muted transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} strokeWidth={1.9} aria-hidden="true" />
        </button>
        {isOpen ? (
          <ul
            id={listboxId}
            ref={listRef}
            role="listbox"
            aria-labelledby={labelId}
            className="absolute top-[calc(100%+0.25rem)] left-0 z-30 max-h-64 w-full overflow-auto rounded-lg border border-line bg-surface p-1 shadow-[0_0.5rem_1.5rem_rgb(16_27_51/12%)]"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isFocused = index === focusedIndex;

              return (
                <li
                  role="option"
                  aria-selected={isSelected}
                  key={option.value}
                  className={`flex min-h-8 cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors duration-75 ${isFocused ? "bg-surface-subtle" : ""} ${isSelected ? "font-bold text-accent" : "font-medium text-ink"}`}
                  onClick={() => select(index)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected ? <Check className="size-3.5 shrink-0 text-accent" strokeWidth={2.5} aria-hidden="true" /> : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

export type SelectOption<T extends string | number = string> = {
  value: T;
  label: string;
  detail?: string;
  disabled?: boolean;
};

type FilterSelectProps<T extends string | number> = {
  label: string;
  options: ReadonlyArray<SelectOption<T>>;
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  hint?: string;
  error?: string;
  leading?: ReactNode;
  density?: "compact" | "form";
  surface?: "surface" | "input";
  className?: string;
  buttonClassName?: string;
};

/**
 * Select visual global de la plataforma. Replica el listbox de filtros de
 * Clinicas para que el menu, sus opciones y la navegacion por teclado sean
 * consistentes en filtros, formularios y modales.
 */
export function FilterSelect<T extends string | number>({
  label,
  options,
  value,
  defaultValue,
  onChange,
  id,
  name,
  required = false,
  disabled = false,
  placeholder = "Seleccionar",
  hint,
  error,
  leading,
  density = "compact",
  surface = "surface",
  className = "",
  buttonClassName = "",
}: FilterSelectProps<T>) {
  const generatedId = useId();
  const controlId = id ?? `${generatedId}-select`;
  const labelId = `${controlId}-label`;
  const listboxId = `${controlId}-options`;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const currentValue = value !== undefined ? value : internalValue;
  const selectedIndex = options.findIndex((option) => option.value === currentValue);
  const selectedOption = options[selectedIndex];
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  const firstEnabledIndex = useCallback(() => options.findIndex((option) => !option.disabled), [options]);

  const lastEnabledIndex = useCallback(() => {
    for (let index = options.length - 1; index >= 0; index -= 1) {
      if (!options[index]?.disabled) return index;
    }
    return -1;
  }, [options]);

  const nextEnabledIndex = useCallback((from: number, direction: 1 | -1) => {
    let index = from + direction;
    while (index >= 0 && index < options.length) {
      if (!options[index]?.disabled) return index;
      index += direction;
    }
    return from;
  }, [options]);

  function open() {
    if (disabled || options.length === 0) return;
    setIsOpen(true);
    setFocusedIndex(selectedIndex >= 0 && !options[selectedIndex]?.disabled ? selectedIndex : firstEnabledIndex());
  }

  function select(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    if (value === undefined) setInternalValue(option.value);
    onChange?.(option.value);
    close();
  }

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) close();
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen || focusedIndex < 0) return;
    const items = listRef.current?.querySelectorAll("[role=option]");
    (items?.[focusedIndex] as HTMLElement | undefined)?.scrollIntoView({ block: "nearest" });
  }, [isOpen, focusedIndex]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        if (isOpen && focusedIndex >= 0) select(focusedIndex);
        else open();
        break;
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) open();
        else setFocusedIndex((current) => nextEnabledIndex(current, 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!isOpen) open();
        else setFocusedIndex((current) => nextEnabledIndex(current, -1));
        break;
      case "Home":
        if (isOpen) {
          event.preventDefault();
          setFocusedIndex(firstEnabledIndex());
        }
        break;
      case "End":
        if (isOpen) {
          event.preventDefault();
          setFocusedIndex(lastEnabledIndex());
        }
        break;
      case "Escape":
        if (isOpen) {
          event.preventDefault();
          close();
        }
        break;
      case "Tab":
        close();
        break;
    }
  }

  const heightClass = density === "form" ? "h-10" : "h-9 md:h-8";
  const surfaceClass = surface === "input" ? "bg-surface-input focus-visible:bg-surface" : "bg-surface";

  return (
    <div className={`grid min-w-0 gap-1.5 text-2xs font-bold text-muted ${className}`} ref={containerRef}>
      <span id={labelId}>
        {label}
        {required ? <span className="ml-0.5 text-danger">*</span> : null}
      </span>
      <div className="relative">
        {leading ? <span className="pointer-events-none absolute top-1/2 left-3 z-1 -translate-y-1/2">{leading}</span> : null}
        <button
          id={controlId}
          type="button"
          role="combobox"
          className={`flex ${heightClass} w-full items-center justify-between gap-2 rounded-lg border px-2.5 text-left text-xs font-medium outline-none transition-colors ${surfaceClass} ${leading ? "pl-10" : ""} ${error ? "border-danger" : "border-line hover:border-accent/60"} ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-focus/40 ${buttonClassName}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen && !disabled}
          aria-controls={listboxId}
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-activedescendant={isOpen && focusedIndex >= 0 ? `${listboxId}-${focusedIndex}` : undefined}
          disabled={disabled}
          onClick={() => (isOpen ? close() : open())}
          onKeyDown={handleKeyDown}
        >
          <span className={`truncate ${selectedOption ? "text-ink" : "text-muted/75"}`}>
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronDown
            className={`size-3.5 shrink-0 text-muted transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </button>
        {name ? <input type="hidden" name={name} value={currentValue ?? ""} /> : null}
        {isOpen && !disabled ? (
          <ul
            id={listboxId}
            ref={listRef}
            role="listbox"
            aria-labelledby={labelId}
            className="absolute top-[calc(100%+0.25rem)] left-0 z-50 max-h-64 w-full overflow-auto rounded-lg border border-line bg-surface p-1 shadow-[0_0.5rem_1.5rem_rgb(16_27_51/12%)] motion-safe:animate-[field-error-enter_150ms_cubic-bezier(0.22,1,0.36,1)]"
          >
            {options.map((option, index) => {
              const isSelected = option.value === currentValue;
              const isFocused = index === focusedIndex;

              return (
                <li
                  id={`${listboxId}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  key={option.value}
                  className={`flex min-h-8 items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-xs transition-colors duration-75 ${option.disabled ? "cursor-not-allowed text-muted opacity-55" : "cursor-pointer"} ${isFocused && !option.disabled ? "bg-surface-subtle" : ""} ${isSelected ? "font-bold text-accent" : option.disabled ? "" : "font-medium text-ink"}`}
                  onClick={() => select(index)}
                  onMouseEnter={() => {
                    if (!option.disabled) setFocusedIndex(index);
                  }}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{option.label}</span>
                    {option.detail ? <span className="mt-0.5 block truncate text-2xs font-normal text-muted">{option.detail}</span> : null}
                  </span>
                  {isSelected ? <Check className="size-3.5 shrink-0 text-accent" strokeWidth={2.5} aria-hidden="true" /> : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      {hint ? <p className="text-2xs font-normal leading-4 text-muted" id={hintId}>{hint}</p> : null}
      {error ? <p className="text-2xs font-semibold leading-4 text-danger" id={errorId} role="alert">{error}</p> : null}
    </div>
  );
}

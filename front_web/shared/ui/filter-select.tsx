"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

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
  autoFocus?: boolean;
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
  autoFocus = false,
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties | null>(null);
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
      const target = event.target as Node;
      if (!containerRef.current?.contains(target) && !listRef.current?.contains(target)) close();
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, close]);

  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) {
      setMenuStyle(null);
      return;
    }

    const updatePosition = () => {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const viewportPadding = 8;
      const gap = 4;
      const availableBelow = Math.max(0, window.innerHeight - rect.bottom - viewportPadding - gap);
      const availableAbove = Math.max(0, rect.top - viewportPadding - gap);
      const shouldOpenAbove = availableBelow < 160 && availableAbove > availableBelow;
      const availableHeight = Math.min(256, shouldOpenAbove ? availableAbove : availableBelow);
      const availableWidth = Math.max(0, window.innerWidth - viewportPadding * 2);
      const menuWidth = Math.min(rect.width, availableWidth);
      const maxLeft = Math.max(viewportPadding, window.innerWidth - menuWidth - viewportPadding);

      setMenuStyle({
        left: Math.min(Math.max(viewportPadding, rect.left), maxLeft),
        top: shouldOpenAbove ? Math.max(viewportPadding, rect.top - availableHeight - gap) : rect.bottom + gap,
        width: menuWidth,
        maxHeight: availableHeight,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || focusedIndex < 0) return;

    const list = listRef.current;
    const item = list?.querySelectorAll<HTMLElement>("[role=option]")[focusedIndex];
    if (!list || !item) return;

    const itemTop = item.offsetTop;
    const itemBottom = itemTop + item.offsetHeight;
    if (itemTop < list.scrollTop) {
      list.scrollTop = itemTop;
    } else if (itemBottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = itemBottom - list.clientHeight;
    }
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
          event.stopPropagation();
          close();
        }
        break;
      case "Tab":
        close();
        break;
    }
  }

  const heightClass = density === "form" ? "h-11 md:h-10" : "h-11 md:h-8";
  const surfaceClass = surface === "input" ? "bg-surface-input focus-visible:bg-surface" : "bg-surface";

  return (
    <div className={`grid min-w-0 gap-1.5 text-2xs font-bold text-muted ${className}`} ref={containerRef}>
      <label className="block" htmlFor={controlId} id={labelId}>
        {label}
        {required ? <span className="ml-0.5 text-danger">*</span> : null}
      </label>
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
          data-modal-initial-focus={autoFocus || undefined}
          disabled={disabled}
          ref={buttonRef}
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
        {isOpen && !disabled && menuStyle && typeof document !== "undefined"
          ? createPortal(
            <ul
              id={listboxId}
              ref={listRef}
              role="listbox"
              aria-labelledby={labelId}
              style={menuStyle}
              className="fixed z-[70] overflow-y-auto overscroll-contain rounded-lg border border-line bg-surface p-1 shadow-[0_0.5rem_1.5rem_rgb(16_27_51/12%)] motion-safe:animate-[field-error-enter_150ms_cubic-bezier(0.22,1,0.36,1)]"
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
                    className={`flex min-h-11 items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-xs transition-colors duration-75 md:min-h-8 ${option.disabled ? "cursor-not-allowed text-muted opacity-55" : "cursor-pointer"} ${isFocused && !option.disabled ? "bg-surface-subtle" : ""} ${isSelected ? "font-bold text-accent" : option.disabled ? "" : "font-medium text-ink"}`}
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
            </ul>,
            document.body,
          )
          : null}
      </div>
      {hint ? <p className="text-2xs font-normal leading-4 text-muted" id={hintId}>{hint}</p> : null}
      {error ? <p className="text-2xs font-semibold leading-4 text-danger" id={errorId} role="alert">{error}</p> : null}
    </div>
  );
}

"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type FormEventHandler, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: ReactNode;
  formId?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
};

const SIZE_CLASSES = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

let openModalCount = 0;
let previousBodyOverflow = "";

function lockBodyScroll() {
  if (openModalCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  openModalCount += 1;
}

function unlockBodyScroll() {
  openModalCount = Math.max(0, openModalCount - 1);
  if (openModalCount === 0) {
    document.body.style.overflow = previousBodyOverflow;
    previousBodyOverflow = "";
  }
}

export function Modal({ isOpen, onClose, title, description, children, size = "md", footer, formId, onSubmit }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();
  const portalTarget = typeof document === "undefined" ? null : document.body;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lockBodyScroll();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) onCloseRef.current();
    };

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusableElements = contentRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusableElements?.length) {
        e.preventDefault();
        contentRef.current?.focus();
        return;
      }
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("keydown", handleTab);
    const initialFocus = contentRef.current?.querySelector<HTMLElement>("[data-modal-initial-focus]")
      ?? contentRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
    (initialFocus ?? contentRef.current)?.focus();

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleTab);
      unlockBodyScroll();
      if (openerRef.current && document.contains(openerRef.current)) {
        openerRef.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen || !portalTarget) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <button
        className="fixed inset-0 cursor-default bg-ink/40 backdrop-blur-sm motion-safe:animate-[fade-in_200ms_ease-out]"
        type="button"
        aria-label="Cerrar ventana"
        onClick={onClose}
      />
      <div
        className={`relative flex max-h-[min(90dvh,calc(100dvh-1rem))] w-full flex-col ${SIZE_CLASSES[size]} overflow-hidden rounded-xl border border-line bg-surface shadow-[0_1.25rem_3rem_rgb(16_27_51/20%)] motion-safe:animate-[modal-in_300ms_ease-out]`}
        ref={contentRef}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold text-ink sm:text-base" id={titleId}>
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 text-2xs text-muted sm:text-xs" id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>
          <button
            className="grid size-11 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-3 focus-visible:outline-focus md:size-8"
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
          >
            <X className="size-4" strokeWidth={1.8} />
          </button>
        </div>
        {formId || onSubmit ? (
          <form className="flex min-h-0 flex-1 flex-col" id={formId} onSubmit={onSubmit}>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">{children}</div>
            {footer ? <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-line px-4 py-3 sm:flex-row sm:justify-end sm:px-5">{footer}</div> : null}
          </form>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">{children}</div>
            {footer ? <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-line px-4 py-3 sm:flex-row sm:justify-end sm:px-5">{footer}</div> : null}
          </>
        )}
      </div>
    </div>,
    portalTarget
  );
}

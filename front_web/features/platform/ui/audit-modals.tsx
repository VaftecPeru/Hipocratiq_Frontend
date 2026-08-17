"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { AdvancedFiltersModal } from "@/shared/ui/common-modals";

/**
 * Isla cliente para el botón "Filtros" de la auditoría global.
 * Permite mantener la página como componente de servidor (con metadata)
 * mientras el control abre el modal de filtros avanzados compartido.
 */
export function AuditFiltersButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 text-xs font-bold text-white transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <SlidersHorizontal className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
        Filtros
      </button>
      <AdvancedFiltersModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

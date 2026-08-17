import { ChevronDown } from "lucide-react";

/**
 * Campo de filtro presentacional (solo visual). Reproduce el desplegable de los
 * mockups sin lógica: label arriba, valor seleccionado y chevron. La interacción
 * real se añadirá al conectar el backend.
 */
export function FilterField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <span className="text-2xs font-bold text-muted">{label}</span>
      <button
        type="button"
        className="flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-line bg-surface pr-2.5 pl-2.5 text-xs font-medium text-ink transition-colors hover:border-accent/60 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-focus/40 focus-visible:outline-none md:h-8"
        aria-label={`Filtro ${label}: ${value}`}
      >
        <span className="truncate">{value}</span>
        <ChevronDown className="size-3.5 shrink-0 text-muted" strokeWidth={1.9} aria-hidden="true" />
      </button>
    </div>
  );
}

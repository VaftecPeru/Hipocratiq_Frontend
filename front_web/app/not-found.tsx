import { SearchX } from "lucide-react";
import { StatusPage } from "@/shared/ui/status-page";

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      eyebrow="Ruta no encontrada"
      title="Esta página no está en el expediente."
      description="La dirección que intentaste abrir no existe, cambió de ubicación o ya no está disponible."
      detail="Revisa la URL o vuelve al inicio para continuar desde una ruta conocida."
      icon={SearchX}
      primaryLabel="Volver al inicio"
      primaryHref="/"
      secondaryLabel="Ir al panel"
      secondaryHref="/dashboard"
    />
  );
}

import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
import { StatusPage } from "@/shared/ui/status-page";

export const metadata: Metadata = {
  title: "Acceso no autorizado",
  description: "No tienes autorización para acceder a esta sección de Hipocratiq.",
};

export default function UnauthorizedPage() {
  return (
    <StatusPage
      code="403"
      eyebrow="Acceso restringido"
      title="Tu sesión no tiene acceso a esta área."
      description="La cuenta está activa, pero el rol actual no incluye permisos para consultar esta sección."
      detail="Vuelve a tu panel o inicia sesión con una cuenta que tenga la autorización necesaria."
      icon={LockKeyhole}
      primaryLabel="Volver al inicio"
      primaryHref="/"
      secondaryLabel="Ir a mi panel"
      secondaryHref="/dashboard"
    />
  );
}

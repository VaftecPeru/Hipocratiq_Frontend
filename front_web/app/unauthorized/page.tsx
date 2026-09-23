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
      status="unauthorized"
      icon={LockKeyhole}
      primaryHref="/"
      secondaryHref="/dashboard"
    />
  );
}

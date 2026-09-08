import type { Metadata } from "next";
import { SpecialtiesPage } from "@/features/specialties/ui/specialties-page";

export const metadata: Metadata = {
  title: "Especialidades",
  description: "Administración global del catálogo de especialidades clínicas.",
};

export default function Page() {
  return <SpecialtiesPage />;
}

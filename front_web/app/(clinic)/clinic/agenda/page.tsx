import type { Metadata } from "next";
import { ClinicAgenda } from "@/features/clinics/ui/clinic-agenda";

export const metadata: Metadata = { title: "Agenda médica" };

export default function ClinicAgendaPage() {
  return <ClinicAgenda />;
}

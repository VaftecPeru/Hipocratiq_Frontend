import type { Metadata } from "next";
import { ClinicPatients } from "@/features/clinics/ui/clinic-patients";

export const metadata: Metadata = { title: "Pacientes" };
export default function ClinicPatientsPage() { return <ClinicPatients />; }

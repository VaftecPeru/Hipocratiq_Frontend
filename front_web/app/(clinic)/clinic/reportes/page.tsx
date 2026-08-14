import type { Metadata } from "next";
import { ClinicReports } from "@/features/clinics/ui/clinic-reports";

export const metadata: Metadata = { title: "Reportes de Clínica" };
export default function ClinicReportsPage() { return <ClinicReports />; }

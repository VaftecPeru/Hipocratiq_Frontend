import type { Metadata } from "next";
import { ClinicSettings } from "@/features/clinics/ui/clinic-settings";

export const metadata: Metadata = { title: "Configuración de Clínica" };
export default function ClinicSettingsPage() { return <ClinicSettings />; }

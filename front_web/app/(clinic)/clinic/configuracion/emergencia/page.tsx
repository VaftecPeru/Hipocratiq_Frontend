import type { Metadata } from "next";
import { ClinicEmergencySettings } from "@/features/clinics/ui/clinic-emergency-settings";

export const metadata: Metadata = { title: "Botón de Emergencia" };
export default function ClinicEmergencyPage() { return <ClinicEmergencySettings />; }

import type { Metadata } from "next";
import { ClinicEpidemiology } from "@/features/clinics/ui/clinic-epidemiology";

export const metadata: Metadata = { title: "IA Epidemiológica" };
export default function ClinicEpidemiologyPage() { return <ClinicEpidemiology />; }

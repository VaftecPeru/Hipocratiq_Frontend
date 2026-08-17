import type { Metadata } from "next";
import { ClinicDoctors } from "@/features/clinics/ui/clinic-doctors";

export const metadata: Metadata = { title: "Médicos" };

export default function ClinicDoctorsPage() {
  return <ClinicDoctors />;
}

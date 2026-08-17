import type { Metadata } from "next";
import { ReceptionistPatientRegistration } from "@/features/clinics/ui/receptionist-patient-registration";

export const metadata: Metadata = { title: "Registro de Pacientes" };

export default function PatientRegistrationPage() {
  return <ReceptionistPatientRegistration />;
}

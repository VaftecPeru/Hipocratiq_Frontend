import type { Metadata } from "next";
import { requireClinicRoles } from "@/features/auth/api/server-session";
import { ReceptionistPatientRegistration } from "@/features/clinics/ui/receptionist-patient-registration";

export const metadata: Metadata = { title: "Registro de Pacientes" };

export default async function PatientRegistrationPage() {
  await requireClinicRoles(["clinic_admin", "receptionist"]);
  return <ReceptionistPatientRegistration />;
}

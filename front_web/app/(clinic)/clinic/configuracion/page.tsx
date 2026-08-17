import type { Metadata } from "next";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { ClinicSettings } from "@/features/clinics/ui/clinic-settings";
import { ReceptionistSettings } from "@/features/clinics/ui/receptionist-settings";

export const metadata: Metadata = { title: "Configuración de Clínica" };
export default async function ClinicSettingsPage() {
  const session = await getAuthenticatedSession();
  if (session?.actor_context === "receptionist") {
    return (
      <ReceptionistSettings
        userName={session.user.name}
        email={session.user.email}
        phoneNumber={session.user.phone_number}
        clinicName={session.user.clinic?.name ?? "Clínica"}
      />
    );
  }

  return <ClinicSettings />;
}

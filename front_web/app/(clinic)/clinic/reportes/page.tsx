import type { Metadata } from "next";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { ClinicReports } from "@/features/clinics/ui/clinic-reports";
import { ReceptionistReports } from "@/features/clinics/ui/receptionist-reports";

export const metadata: Metadata = { title: "Reportes de Clínica" };
export default async function ClinicReportsPage() {
  const session = await getAuthenticatedSession();
  return session?.actor_context === "receptionist" ? <ReceptionistReports /> : <ClinicReports />;
}

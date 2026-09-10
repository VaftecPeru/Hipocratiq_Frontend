import type { Metadata } from "next";
import { requireClinicRole } from "@/features/auth/api/server-session";
import { ClinicBilling } from "@/features/clinics/ui/clinic-billing";

export const metadata: Metadata = { title: "Caja y Pagos" };

export default async function ReceptionistPaymentsPage() {
  await requireClinicRole("receptionist");
  return <ClinicBilling receptionist />;
}

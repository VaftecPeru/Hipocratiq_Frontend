import type { Metadata } from "next";
import { ClinicBilling } from "@/features/clinics/ui/clinic-billing";

export const metadata: Metadata = { title: "Caja y Pagos" };

export default function ReceptionistPaymentsPage() {
  return <ClinicBilling receptionist />;
}

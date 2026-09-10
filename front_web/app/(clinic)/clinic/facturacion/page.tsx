import type { Metadata } from "next";
import { requireClinicRole } from "@/features/auth/api/server-session";
import { ClinicBilling } from "@/features/clinics/ui/clinic-billing";

export const metadata: Metadata = { title: "Facturación" };

export default async function ClinicBillingPage() {
  await requireClinicRole("clinic_admin");
  return <ClinicBilling />;
}

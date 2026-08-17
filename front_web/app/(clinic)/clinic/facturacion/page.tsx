import type { Metadata } from "next";
import { ClinicBilling } from "@/features/clinics/ui/clinic-billing";

export const metadata: Metadata = { title: "Facturación" };

export default function ClinicBillingPage() {
  return <ClinicBilling />;
}

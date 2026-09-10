import type { Metadata } from "next";
import { requireClinicRole } from "@/features/auth/api/server-session";
import { ReceptionistMessages } from "@/features/clinics/ui/receptionist-messages";

export const metadata: Metadata = { title: "Mensajes" };

export default async function ReceptionistMessagesPage() {
  await requireClinicRole("receptionist");
  return <ReceptionistMessages />;
}

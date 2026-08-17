import type { Metadata } from "next";
import { ReceptionistMessages } from "@/features/clinics/ui/receptionist-messages";

export const metadata: Metadata = { title: "Mensajes" };

export default function ReceptionistMessagesPage() {
  return <ReceptionistMessages />;
}

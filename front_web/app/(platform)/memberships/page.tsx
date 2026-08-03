import type { Metadata } from "next";
import { MembershipsView } from "@/features/memberships/ui/memberships-view";

export const metadata: Metadata = {
  title: "Membresías",
};

export default function MembershipsPage() {
  return <MembershipsView />;
}

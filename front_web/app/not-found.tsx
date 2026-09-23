import { SearchX } from "lucide-react";
import { StatusPage } from "@/shared/ui/status-page";

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      status="notFound"
      icon={SearchX}
      primaryHref="/"
      secondaryHref="/dashboard"
    />
  );
}

import { redirect } from "next/navigation";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { DashboardUnavailable } from "@/shared/ui/dashboard-unavailable";

export default async function PatientDashboardPage() {
  const session = await getAuthenticatedSession();
  if (!session || session.actor_context !== "patient") redirect("/");
  return (
    <DashboardUnavailable
      description="Este panel aún no está conectado a un servicio de datos. No se muestran citas, resultados, diagnósticos, recetas ni métricas hasta que la integración esté disponible."
      title="Datos del panel del paciente pendientes de conexión"
    />
  );
}

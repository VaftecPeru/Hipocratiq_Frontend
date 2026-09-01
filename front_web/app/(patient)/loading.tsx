import PatientDashboardLoading from "./patient/dashboard/loading";
import { DashboardRouteLoading } from "@/shared/ui/dashboard-route-loading";

export default function PatientLoading() {
  return <DashboardRouteLoading><PatientDashboardLoading /></DashboardRouteLoading>;
}

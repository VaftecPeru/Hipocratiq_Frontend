import DoctorDashboardLoading from "./doctor/dashboard/loading";
import { DashboardRouteLoading } from "@/shared/ui/dashboard-route-loading";

export default function DoctorLoading() {
  return <DashboardRouteLoading><DoctorDashboardLoading /></DashboardRouteLoading>;
}

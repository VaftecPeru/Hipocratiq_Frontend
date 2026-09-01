import ClinicDashboardLoading from "./clinic/dashboard/loading";
import { DashboardRouteLoading } from "@/shared/ui/dashboard-route-loading";

export default function ClinicLoading() {
  return <DashboardRouteLoading><ClinicDashboardLoading /></DashboardRouteLoading>;
}

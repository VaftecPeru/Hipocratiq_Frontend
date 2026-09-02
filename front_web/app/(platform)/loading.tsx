import DashboardLoading from "./dashboard/loading";
import { DashboardRouteLoading } from "@/shared/ui/dashboard-route-loading";

export default function PlatformLoading() {
  return <DashboardRouteLoading><DashboardLoading /></DashboardRouteLoading>;
}

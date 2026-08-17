import { AccessControlView } from "@/features/access-control/ui/access-control-view";

export default async function RolesPermissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;

  return <AccessControlView initialSearch={params.search?.slice(0, 120) ?? ""} />;
}

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Roles y permisos",
};

export default function RolesPermissionsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}

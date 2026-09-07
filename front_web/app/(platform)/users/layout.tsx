import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Usuarios",
};

export default function UsersLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}

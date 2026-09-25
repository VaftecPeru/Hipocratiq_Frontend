import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClinicRegistrationFlow } from "@/features/auth/ui/clinic-registration-flow";
import { RegistrationShell } from "@/features/auth/ui/registration-shell";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import type { GoogleRegistrationType } from "@/features/auth/model/auth.types";

export const metadata: Metadata = {
  title: "Registro de cuenta",
};

type Props = {
  searchParams: Promise<{
    google_registration_token?: string | string[];
    registration_type?: string | string[];
  }>;
};

export default async function RegisterPage({ searchParams }: Props) {
  const session = await getAuthenticatedSession();
  if (session) redirect(session.actor_context === "clinic_admin" ? "/clinic/dashboard" : session.actor_context === "doctor" ? "/doctor/dashboard" : session.actor_context === "patient" ? "/patient/dashboard" : "/dashboard");

  const params = await searchParams;
  const token = Array.isArray(params.google_registration_token) ? params.google_registration_token[0] : params.google_registration_token;
  const typeValue = Array.isArray(params.registration_type) ? params.registration_type[0] : params.registration_type;
  const registrationType = typeValue === "clinic" || typeValue === "doctor" || typeValue === "patient"
    ? typeValue satisfies GoogleRegistrationType
    : undefined;

  return (
    <RegistrationShell>
      <ClinicRegistrationFlow
        googleRegistrationToken={token}
        googleRegistrationType={registrationType}
      />
    </RegistrationShell>
  );
}

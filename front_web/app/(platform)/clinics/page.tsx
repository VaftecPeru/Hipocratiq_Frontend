import type { Metadata } from "next";
import Link from "next/link";
import { getClinicsDashboardData } from "@/features/clinics/api/server-clinics";
import type {
  ClinicCountryCode,
  ClinicPlan,
  ClinicsFilters,
  ClinicStatus,
} from "@/features/clinics/model/clinic.types";
import { ClinicsDashboard } from "@/features/clinics/ui/clinics-dashboard";

export const metadata: Metadata = {
  title: "Clínicas",
  description: "Administración global de clínicas y tenants.",
};

type SearchParam = string | string[] | undefined;

type ClinicsPageSearchParams = {
  q?: SearchParam;
  country?: SearchParam;
  plan?: SearchParam;
  status?: SearchParam;
  page?: SearchParam;
  per_page?: SearchParam;
};

function firstValue(value: SearchParam): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function oneOf<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export default async function ClinicsPage({
  searchParams,
}: {
  searchParams: Promise<ClinicsPageSearchParams>;
}) {
  const params = await searchParams;
  const rawPage = Number.parseInt(firstValue(params.page), 10);
  const rawPerPage = Number.parseInt(firstValue(params.per_page), 10);
  const filters: ClinicsFilters = {
    search: firstValue(params.q).slice(0, 100),
    country: oneOf<ClinicCountryCode | "all">(
      firstValue(params.country),
      ["all", "MX", "PE", "US"],
      "all",
    ),
    plan: oneOf<ClinicPlan | "all">(
      firstValue(params.plan),
      ["all", "basic", "professional", "enterprise"],
      "all",
    ),
    status: oneOf<ClinicStatus | "all">(
      firstValue(params.status),
      ["all", "active", "suspended"],
      "all",
    ),
    page: Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1,
    perPage: Number.isSafeInteger(rawPerPage) && rawPerPage >= 1 && rawPerPage <= 100 ? rawPerPage : 10,
  };
  const result = await getClinicsDashboardData(filters);

  if (!result.ok) {
    return (
      <main className="mx-auto grid min-h-[60vh] w-full max-w-2xl place-items-center px-5 py-12">
        <section
          className="w-full rounded-2xl border border-danger/25 bg-surface p-7 text-center shadow-[0_0.5rem_2rem_rgb(16_27_51/6%)]"
          role="alert"
        >
          <p className="text-xs font-bold tracking-[0.13em] text-danger uppercase">
            Clínicas no disponibles
          </p>
          <h1 className="mt-2 font-display text-2xl italic">No se pudieron cargar los datos</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted">{result.message}</p>
          <Link
            className="mt-6 inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-bold text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
            href="/clinics"
          >
            Volver a intentar
          </Link>
        </section>
      </main>
    );
  }

  // `search` se excluye a propósito: la búsqueda no debe remontar el dashboard
  // (perdería el foco del input mientras se escribe); se sincroniza vía props.
  const dashboardKey = [
    filters.country,
    filters.plan,
    filters.status,
    filters.page,
    filters.perPage,
  ].join("|");

  return (
    <ClinicsDashboard
      key={dashboardKey}
      initialData={result.data}
      initialFilters={filters}
    />
  );
}

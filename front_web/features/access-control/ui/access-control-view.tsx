"use client";

import {
  ArrowRight,
  Building2,
  Clock3,
  KeyRound,
  Search,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getAccessControl } from "@/features/access-control/api/browser-access-control";
import type { AccessControlData } from "@/features/access-control/model/access-control.types";
import { notifySuperadminNavigationMutation } from "@/features/platform/model/superadmin-navigation-invalidation";
import { ManageUserAccessModal } from "@/features/access-control/ui/manage-user-access-modal";
import { getAdminUsers } from "@/features/users/api/browser-users";
import type {
  AdminUser,
  AdminUserRole,
  AdminUsersDashboardData,
  AdminUsersFilters,
} from "@/features/users/model/admin-user.types";
import { CountryFlag } from "@/shared/ui/country-flag";
import { DataBadge, type BadgeTone } from "@/shared/ui/data-badge";
import { FilterSelect } from "@/shared/ui/filter-select";
import { StatCard } from "@/shared/ui/stat-card";
import { PlatformModuleLoading } from "@/shared/ui/platform-module-loading";

const ROLE_LABELS: Record<AdminUserRole, string> = {
  super_admin: "Superadministrador",
  clinic_admin: "Administrador de clínica",
  receptionist: "Recepcionista",
  doctor: "Médico",
  patient: "Paciente",
  unassigned: "Sin rol",
};

const ROLE_TONES: Record<AdminUserRole, BadgeTone> = {
  super_admin: "dark",
  clinic_admin: "accent",
  receptionist: "warning",
  doctor: "success",
  patient: "violet",
  unassigned: "neutral",
};

const INITIAL_FILTERS: AdminUsersFilters = {
  search: "",
  country: "all",
  clinic: "all",
  role: "all",
  status: "all",
  page: 1,
};

const numberFormatter = new Intl.NumberFormat("es-MX");

function UserAvatar({ name }: { name: string }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-2xs font-extrabold text-accent" aria-hidden="true">
      {name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
    </span>
  );
}

export function AccessControlView({ initialSearch = "" }: { initialSearch?: string }) {
  const [access, setAccess] = useState<AccessControlData | null>(null);
  const [usersData, setUsersData] = useState<AdminUsersDashboardData | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [filters, setFilters] = useState<AdminUsersFilters>({ ...INITIAL_FILTERS, search: initialSearch });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFilters((current) => current.search === search ? current : { ...current, search, page: 1 });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      getAccessControl(controller.signal),
      getAdminUsers(filters, controller.signal),
    ])
      .then(([nextAccess, nextUsers]) => {
        setAccess(nextAccess);
        setUsersData(nextUsers);
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(requestError instanceof Error ? requestError.message : "No pudimos cargar los controles de acceso.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [filters, refreshVersion]);

  const permissionLabels = useMemo(
    () => new Map(access?.permissions.map((permission) => [permission.key, permission.label]) ?? []),
    [access?.permissions],
  );
  const roleOptions: Array<{ value: AdminUserRole | "all"; label: string }> = [
    { value: "all", label: "Todos los roles" },
    ...Object.entries(ROLE_LABELS).map(([value, label]) => ({ value: value as AdminUserRole, label })),
  ];
  const currentPage = usersData?.pagination.currentPage ?? filters.page;
  const lastPage = usersData?.pagination.lastPage ?? 1;
  const stats = [
    { label: "Identidades supervisadas", value: numberFormatter.format(access?.summary.totalUsers ?? 0), change: "Directorio global", direction: "up" as const, icon: Users, tone: "accent" as const },
    { label: "Clínicas habilitadas", value: numberFormatter.format(access?.summary.activeClinics ?? 0), change: "Tenants asignables", direction: "up" as const, icon: Building2, tone: "success" as const },
    { label: "Usuarios sin rol", value: numberFormatter.format(access?.summary.unassignedUsers ?? 0), change: "Requieren revisión", direction: "down" as const, icon: UserCog, tone: "warning" as const },
    { label: "Roles del sistema", value: numberFormatter.format(access?.roles.length ?? 0), change: "Matriz protegida", direction: "up" as const, icon: ShieldCheck, tone: "violet" as const },
  ];

  if (!access || !usersData) {
    if (error) {
      return <main className="mx-auto grid min-h-[48vh] max-w-2xl place-items-center px-4"><p className="rounded-xl border border-danger/25 bg-danger-soft p-5 text-center text-xs text-danger" role="alert">{error}</p></main>;
    }

    return <PlatformModuleLoading label="Cargando roles y permisos" variant="access" />;
  }

  function updateFilters(patch: Partial<AdminUsersFilters>) {
    setIsLoading(true);
    setError(null);
    setFilters((current) => ({ ...current, ...patch, page: patch.page ?? 1 }));
  }

  function openAccess(user: AdminUser) {
    setSelectedUser(user);
    setIsAccessModalOpen(true);
  }

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-2xs font-extrabold tracking-[0.14em] text-accent uppercase">Seguridad de plataforma</p>
          <h1 className="mt-1 text-[clamp(1.3rem,1.8vw,1.6rem)] font-extrabold tracking-[-0.03em]">Roles y permisos</h1>
          <p className="mt-0.5 max-w-2xl text-xs text-muted">Controla el alcance global o por clínica de cada usuario. Los permisos son definidos por el backend y no pueden alterarse desde el navegador.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-success/20 bg-success-soft px-3 py-1.5 text-2xs font-bold text-success">
          <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
          Enforcement activo por contexto
        </span>
      </header>

      <section className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Resumen de control de acceso">
        {stats.map((stat, index) => <StatCard {...stat} index={index} key={stat.label} />)}
      </section>

      <section className="mt-4" aria-labelledby="role-matrix-title">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-extrabold" id="role-matrix-title">Matriz efectiva de roles</h2>
            <p className="mt-0.5 text-2xs text-muted">Catálogo de solo lectura alineado con los contextos de autenticación.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {(access?.roles ?? []).map((role) => (
            <article className="flex min-h-64 flex-col rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" key={role.key}>
              <div className="flex items-start justify-between gap-3">
                <span className={`grid size-9 place-items-center rounded-lg ${role.scope === "global" ? "bg-plan-enterprise text-white" : "bg-accent-soft text-accent"}`} aria-hidden="true">
                  {role.scope === "global" ? <KeyRound className="size-4" strokeWidth={1.8} /> : <ShieldCheck className="size-4" strokeWidth={1.8} />}
                </span>
                <DataBadge tone={role.scope === "global" ? "dark" : "neutral"}>{role.scope === "global" ? "Global" : "Por clínica"}</DataBadge>
              </div>
              <h3 className="mt-3 text-sm font-extrabold">{role.name}</h3>
              <p className="mt-1 min-h-10 text-2xs leading-5 text-muted">{role.description}</p>
              <div className="mt-3 flex items-baseline gap-1.5 border-y border-line py-2.5">
                <strong className="font-mono text-xl">{numberFormatter.format(role.userCount)}</strong>
                <span className="text-2xs text-muted">usuarios efectivos</span>
              </div>
              <ul className="mt-3 grid gap-1.5">
                {role.permissions.slice(0, 4).map((permission) => (
                  <li className="flex items-start gap-1.5 text-2xs text-muted" key={permission}>
                    <span className="mt-1 size-1 shrink-0 rounded-full bg-success" aria-hidden="true" />
                    {permissionLabels.get(permission) ?? permission}
                  </li>
                ))}
              </ul>
              <button className="mt-auto flex min-h-8 items-center justify-center gap-1 rounded-lg text-2xs font-bold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus" type="button" onClick={() => updateFilters({ role: role.key })}>
                Ver asignaciones <ArrowRight className="size-3" aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-4 grid items-start gap-4 min-[1380px]:grid-cols-[minmax(0,1fr)_19rem]">
        <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="assignments-title" aria-busy={isLoading}>
          <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-end">
            <div className="mr-auto">
              <h2 className="text-xs font-extrabold" id="assignments-title">Asignaciones de acceso</h2>
              <p className="mt-0.5 text-2xs text-muted">{numberFormatter.format(usersData?.pagination.total ?? 0)} usuarios encontrados</p>
            </div>
            {isLoading ? <span className="text-2xs font-bold text-accent" role="status">Actualizando...</span> : null}
            <FilterSelect className="w-full sm:w-48" label="Rol" options={roleOptions} value={filters.role} onChange={(role) => updateFilters({ role })} />
            <label className="grid w-full gap-1.5 text-2xs font-bold text-muted sm:w-64">Buscar usuario
              <span className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input className="h-9 w-full rounded-lg border border-line bg-surface pr-2.5 pl-8 text-xs font-medium outline-none placeholder:text-muted/75 focus:border-accent focus:ring-3 focus:ring-focus/40 md:h-8" type="search" value={search} placeholder="Nombre, correo o clínica..." onChange={(event) => { setSearch(event.target.value); setIsLoading(true); setError(null); }} />
              </span>
            </label>
          </div>

          {error ? <p className="m-3 rounded-lg border border-danger/25 bg-danger-soft p-4 text-xs text-danger" role="alert">{error}</p> : null}
          {usersData.users.length === 0 ? <p className="p-8 text-center text-xs text-muted">No encontramos usuarios con estos filtros.</p> : null}
          {usersData.users.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[48rem] border-collapse text-left text-xs">
                <caption className="sr-only">Asignaciones de rol y clínica</caption>
                <thead className="border-b border-line bg-surface-subtle/60 text-2xs text-muted">
                  <tr><th className="px-3 py-2.5">Usuario</th><th className="px-3 py-2.5">Rol efectivo</th><th className="px-3 py-2.5">País</th><th className="px-3 py-2.5">Clínica / tenant</th><th className="px-3 py-2.5 text-right">Control</th></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {usersData.users.map((user) => (
                    <tr className="hover:bg-accent-soft/30" key={user.id}>
                      <th className="px-3 py-2" scope="row"><div className="flex min-w-0 items-center gap-2"><UserAvatar name={user.name} /><div className="min-w-0"><span className="block truncate font-extrabold">{user.name}</span><span className="block truncate text-2xs font-medium text-muted">{user.email ?? "Sin correo"}</span></div></div></th>
                      <td className="px-3 py-2"><DataBadge tone={ROLE_TONES[user.role]}>{ROLE_LABELS[user.role]}</DataBadge></td>
                      <td className="px-3 py-2"><span className="flex items-center gap-1.5 text-muted"><CountryFlag countryCode={user.countryCode} />{user.countryCode}</span></td>
                      <td className="max-w-52 truncate px-3 py-2 text-muted">{user.clinic?.name ?? (user.role === "super_admin" ? "Alcance global" : "Sin asignar")}</td>
                       <td className="px-3 py-2 text-right"><button className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-line px-2.5 text-2xs font-bold text-ink transition-colors hover:border-accent/40 hover:bg-accent-soft hover:text-accent focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-8" type="button" disabled={user.id === access?.actorUserId} title={user.id === access?.actorUserId ? "Otro Superadministrador debe modificar tu acceso" : undefined} onClick={() => openAccess(user)}><UserCog className="size-3" aria-hidden="true" />Gestionar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="flex min-h-13 items-center justify-between gap-3 border-t border-line px-3 py-2">
            <p className="text-2xs text-muted">Página {currentPage} de {lastPage}</p>
            <div className="flex gap-1"><button className="min-h-11 rounded-lg border border-line px-3 text-2xs font-bold disabled:opacity-40 sm:min-h-8" type="button" disabled={currentPage <= 1 || isLoading} onClick={() => updateFilters({ page: currentPage - 1 })}>Anterior</button><button className="min-h-11 rounded-lg border border-line px-3 text-2xs font-bold disabled:opacity-40 sm:min-h-8" type="button" disabled={currentPage >= lastPage || isLoading} onClick={() => updateFilters({ page: currentPage + 1 })}>Siguiente</button></div>
          </div>
        </section>

        <aside className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="recent-access-title">
          <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-surface-subtle text-muted"><Clock3 className="size-3.5" aria-hidden="true" /></span><div><h2 className="text-xs font-extrabold" id="recent-access-title">Cambios recientes</h2><p className="text-2xs text-muted">Trazabilidad de privilegios</p></div></div>
          <ol className="mt-4 grid gap-3">
            {(access?.recentChanges ?? []).map((change) => (
              <li className="border-l-2 border-accent/30 pl-3" key={change.id}>
                <p className="truncate text-xs font-extrabold">{change.resourceLabel ?? `Usuario #${change.resourceId}`}</p>
                <p className="mt-0.5 text-2xs text-muted"><span className="font-semibold text-ink">{ROLE_LABELS[change.beforeRole as AdminUserRole] ?? change.beforeRole ?? "sin rol"}</span> → <span className="font-semibold text-accent">{ROLE_LABELS[change.afterRole as AdminUserRole] ?? change.afterRole ?? "sin rol"}</span></p>
                <p className="mt-1 text-2xs text-muted">{change.actorName} · {change.occurredAt}</p>
              </li>
            ))}
          </ol>
          {access?.recentChanges.length === 0 ? <p className="mt-4 rounded-lg bg-surface-subtle p-3 text-2xs leading-5 text-muted">Aún no hay cambios de acceso registrados.</p> : null}
        </aside>
      </div>

      {access ? (
        <ManageUserAccessModal
          key={`${selectedUser?.id ?? "no-user"}-${isAccessModalOpen ? "open" : "closed"}`}
          access={access}
          isOpen={isAccessModalOpen}
          onClose={() => setIsAccessModalOpen(false)}
          onUpdated={() => { notifySuperadminNavigationMutation(["users", "access-control"]); setIsLoading(true); setError(null); setRefreshVersion((current) => current + 1); }}
          user={selectedUser}
        />
      ) : null}
    </div>
  );
}

"use client";

import type { LucideIcon } from "lucide-react";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Stethoscope,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CountryFlag, type CountryCode } from "@/shared/ui/country-flag";
import { DataBadge, type BadgeTone } from "@/shared/ui/data-badge";
import { DonutChart } from "@/shared/ui/donut-chart";
import { FilterSelect } from "@/shared/ui/filter-select";
import { StatCard, type StatCardProps } from "@/shared/ui/stat-card";
import { getAdminUsers } from "@/features/users/api/browser-users";
import type {
  AdminUser,
  AdminUserRole,
  AdminUserRoleLabel,
  AdminUsersDashboardData,
  AdminUsersFilters,
  AdminUserStatus,
} from "@/features/users/model/admin-user.types";
import {
  CreateUserModal,
  UserDetailModal,
  EditUserModal,
  SendMessageModal,
} from "@/features/users/ui/user-modals";

type PlatformUser = AdminUser;

const ROLE_LABELS: Record<AdminUserRole, AdminUserRoleLabel> = {
  super_admin: "Superadministrador",
  clinic_admin: "Administrador de Clínica",
  doctor: "Médico",
  patient: "Paciente",
  unassigned: "Sin rol",
};

const ROLE_TONE: Record<AdminUserRole, BadgeTone> = {
  super_admin: "dark",
  clinic_admin: "accent",
  doctor: "success",
  patient: "violet",
  unassigned: "neutral",
};

const STATUS_LABELS: Record<AdminUserStatus, string> = {
  pending_verification: "Pendiente",
  active: "Activo",
  suspended: "Suspendido",
  disabled: "Deshabilitado",
};

const STATUS_TONES: Record<AdminUserStatus, BadgeTone> = {
  pending_verification: "warning",
  active: "success",
  suspended: "danger",
  disabled: "neutral",
};

const COUNTRY_LABELS: Record<CountryCode, string> = {
  MX: "México",
  PE: "Perú",
  US: "Estados Unidos",
};

const ROLE_OPTIONS: Array<{ value: AdminUserRole | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  ...Object.entries(ROLE_LABELS).map(([value, label]) => ({ value: value as AdminUserRole, label })),
];

const COUNTRY_OPTIONS: Array<{ value: CountryCode | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  ...Object.entries(COUNTRY_LABELS).map(([value, label]) => ({ value: value as CountryCode, label })),
];

const STATUS_OPTIONS: Array<{ value: AdminUserStatus | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value: value as AdminUserStatus, label })),
];

const INITIAL_FILTERS: AdminUsersFilters = {
  search: "",
  country: "all",
  clinic: "all",
  role: "all",
  status: "all",
  page: 1,
};

const numberFormatter = new Intl.NumberFormat("es-MX");

function getInitials(name: string) {
  return name
    .replace(/^(Dr\.|Dra\.)\s+/i, "")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function RoleBadge({ role }: { role: AdminUserRole }) {
  return <DataBadge tone={ROLE_TONE[role]}>{ROLE_LABELS[role]}</DataBadge>;
}

function UserStatusBadge({ status }: { status: AdminUserStatus }) {
  return (
    <DataBadge tone={STATUS_TONES[status]} dot>
      {STATUS_LABELS[status]}
    </DataBadge>
  );
}

function UserActions({
  userName,
  onViewDetail,
  onEdit,
  onMore,
}: {
  userName: string;
  onViewDetail: () => void;
  onEdit: () => void;
  onMore: () => void;
}) {
  return (
    <div className="flex justify-end gap-0.5">
      <button
        className="grid size-6.5 place-items-center rounded-md text-muted transition-colors hover:bg-accent-soft hover:text-accent focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        aria-label={`Ver ${userName}`}
        onClick={onViewDetail}
      >
        <Eye className="size-3.5" strokeWidth={1.7} aria-hidden="true" />
      </button>
      <button
        className="grid size-6.5 place-items-center rounded-md text-muted transition-colors hover:bg-accent-soft hover:text-accent focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        aria-label={`Editar ${userName}`}
        onClick={onEdit}
      >
        <Pencil className="size-3.5" strokeWidth={1.7} aria-hidden="true" />
      </button>
      <button
        className="grid size-6.5 place-items-center rounded-md text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        aria-label={`Más acciones para ${userName}`}
        onClick={onMore}
      >
        <MoreHorizontal className="size-3.5" strokeWidth={1.7} aria-hidden="true" />
      </button>
    </div>
  );
}

function UserAvatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-accent-soft font-extrabold text-accent ${size === "md" ? "size-9 text-xs" : "size-7 text-2xs"}`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}

function UsersTable({
  users,
  onViewDetail,
  onEdit,
  onMore,
}: {
  users: PlatformUser[];
  onViewDetail: (user: PlatformUser) => void;
  onEdit: (user: PlatformUser) => void;
  onMore: (user: PlatformUser) => void;
}) {
  return (
    <>
      <div className="hidden xl:block">
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">Usuarios de la plataforma</caption>
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[17%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[13%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-line bg-surface-subtle/50 text-2xs font-bold text-muted">
              <th className="px-2 py-2.5 font-bold" scope="col">Usuario</th>
              <th className="px-2 py-2.5 font-bold" scope="col">Rol</th>
              <th className="px-2 py-2.5 font-bold" scope="col">Ubicación</th>
              <th className="px-2 py-2.5 font-bold" scope="col">Clínica</th>
              <th className="px-2 py-2.5 font-bold" scope="col">Último acceso</th>
              <th className="px-2 py-2.5 font-bold" scope="col">Estado</th>
              <th className="px-2 py-2.5 text-right font-bold" scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((user) => (
              <tr className="text-xs transition-colors hover:bg-accent-soft/35" key={user.id}>
                <th className="overflow-hidden px-2 py-2" scope="row">
                  <div className="flex min-w-0 items-center gap-2">
                    <UserAvatar name={user.name} />
                    <div className="min-w-0">
                      <span className="block truncate font-bold text-ink">{user.name}</span>
                      <span className="block truncate text-2xs font-medium text-muted">{user.email ?? "Sin correo"}</span>
                    </div>
                  </div>
                </th>
                <td className="overflow-hidden px-2 py-2"><RoleBadge role={user.role} /></td>
                <td className="overflow-hidden px-2 py-2">
                  <div className="flex min-w-0 items-center gap-1.5"><CountryFlag countryCode={user.countryCode} /><span className="min-w-0 truncate text-muted">{COUNTRY_LABELS[user.countryCode]}</span></div>
                </td>
                <td className="truncate px-2 py-2 text-muted" title={user.clinic?.name}>{user.clinic?.name ?? "—"}</td>
                <td className="truncate px-2 py-2 text-muted" title={user.lastAccess}>{user.lastAccess}</td>
                <td className="overflow-hidden px-2 py-2"><UserStatusBadge status={user.status} /></td>
                <td className="px-2 py-1.5">
                  <UserActions
                    userName={user.name}
                    onViewDetail={() => onViewDetail(user)}
                    onEdit={() => onEdit(user)}
                    onMore={() => onMore(user)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 xl:hidden">
        {users.map((user) => (
          <article className="rounded-xl border border-line p-4" key={user.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar name={user.name} size="md" />
                <div className="min-w-0"><h3 className="truncate text-xs font-extrabold">{user.name}</h3><p className="mt-0.5 truncate text-2xs text-muted">{user.email ?? "Sin correo"}</p></div>
              </div>
              <UserStatusBadge status={user.status} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-line py-3 text-xs">
              <div><dt className="text-muted">Rol</dt><dd className="mt-1"><RoleBadge role={user.role} /></dd></div>
              <div><dt className="text-muted">Clínica</dt><dd className="mt-1 truncate font-semibold">{user.clinic?.name ?? "—"}</dd></div>
              <div><dt className="text-muted">Ubicación</dt><dd className="mt-1 flex items-center gap-1.5"><CountryFlag countryCode={user.countryCode} />{COUNTRY_LABELS[user.countryCode]}</dd></div>
              <div><dt className="text-muted">Último acceso</dt><dd className="mt-1 font-medium">{user.lastAccess}</dd></div>
            </dl>
            <div className="mt-2 flex justify-end"><UserActions userName={user.name} onViewDetail={() => onViewDetail(user)} onEdit={() => onEdit(user)} onMore={() => onMore(user)} /></div>
          </article>
        ))}
      </div>
    </>
  );
}

export default function UsersPage() {
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [detailUserOpen, setDetailUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [messageUserOpen, setMessageUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [filters, setFilters] = useState<AdminUsersFilters>(INITIAL_FILTERS);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<AdminUsersDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFilters((current) => {
        if (current.search === search) return current;

        return { ...current, search, page: 1 };
      });
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    getAdminUsers(filters, controller.signal)
      .then(setData)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(requestError instanceof Error ? requestError.message : "No pudimos cargar los usuarios.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [filters, refreshVersion]);

  const totals = data?.totals ?? { users: 0, activeUsers: 0, administrators: 0, doctors: 0, patients: 0 };
  const stats: Array<StatCardProps> = [
    { label: "Total de Usuarios", value: numberFormatter.format(totals.users), change: "Datos consolidados", direction: "up", icon: Users, tone: "accent" },
    { label: "Usuarios Activos", value: numberFormatter.format(totals.activeUsers), change: "Acceso habilitado", direction: "up", icon: UserCheck, tone: "violet" },
    { label: "Administradores", value: numberFormatter.format(totals.administrators), change: "Globales y de clínica", direction: "up", icon: ShieldCheck, tone: "success" },
    { label: "Médicos", value: numberFormatter.format(totals.doctors), change: "Registrados", direction: "up", icon: Stethoscope, tone: "warning" },
  ];
  const summaryRows: Array<{ label: string; value: string; icon: LucideIcon }> = [
    { label: "Total de Usuarios", value: numberFormatter.format(totals.users), icon: Users },
    { label: "Usuarios Activos", value: numberFormatter.format(totals.activeUsers), icon: UserCheck },
    { label: "Administradores", value: numberFormatter.format(totals.administrators), icon: ShieldCheck },
    { label: "Pacientes", value: numberFormatter.format(totals.patients), icon: UserPlus },
  ];
  const countrySummary = (data?.countryDistribution ?? []).map((item) => ({
    code: item.key as CountryCode,
    label: COUNTRY_LABELS[item.key as CountryCode] ?? item.key,
    value: numberFormatter.format(item.count),
  }));
  const roleColors: Record<AdminUserRole, string> = {
    super_admin: "var(--plan-enterprise)",
    clinic_admin: "var(--accent)",
    doctor: "var(--success)",
    patient: "var(--violet)",
    unassigned: "var(--muted)",
  };
  const roleDistribution = (data?.roleDistribution ?? []).map((item) => ({
    label: ROLE_LABELS[item.key as AdminUserRole] ?? item.key,
    value: numberFormatter.format(item.count),
    percentage: item.percentage,
    color: roleColors[item.key as AdminUserRole] ?? "var(--muted)",
  }));
  const countryColors: Record<string, string> = { MX: "var(--accent)", PE: "var(--focus)", US: "var(--warning)" };
  const countryDistribution = (data?.countryDistribution ?? []).map((item) => ({
    label: COUNTRY_LABELS[item.key as CountryCode] ?? item.key,
    value: numberFormatter.format(item.count),
    percentage: item.percentage,
    color: countryColors[item.key] ?? "var(--muted)",
  }));
  const clinicOptions: Array<{ value: number | "all"; label: string }> = [
    { value: "all", label: "Todas" },
    ...(data?.clinics ?? []).map((clinic) => ({ value: clinic.id, label: clinic.name })),
  ];
  const hasActiveFilters = search.trim() !== "" || filters.country !== "all" || filters.clinic !== "all" || filters.role !== "all" || filters.status !== "all";
  const currentPage = data?.pagination.currentPage ?? filters.page;
  const totalPages = data?.pagination.lastPage ?? 1;
  const firstVisiblePage = Math.max(1, Math.min(currentPage - 2, Math.max(1, totalPages - 4)));
  const visiblePages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => firstVisiblePage + index,
  );

  function updateFilters(patch: Partial<AdminUsersFilters>) {
    setIsLoading(true);
    setError(null);
    setFilters((current) => ({ ...current, ...patch, page: patch.page ?? 1 }));
  }

  function clearFilters() {
    setIsLoading(true);
    setError(null);
    setSearch("");
    setFilters(INITIAL_FILTERS);
  }

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[clamp(1.3rem,1.8vw,1.6rem)] font-extrabold tracking-[-0.03em]">Usuarios</h1>
          <p className="mt-0.5 text-xs text-muted">Gestiona los usuarios registrados en la plataforma.</p>
        </div>
        <button className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 text-xs font-bold text-white transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus" type="button" onClick={() => setCreateUserOpen(true)}><UserPlus className="size-3.5" strokeWidth={2} aria-hidden="true" />Nuevo usuario</button>
      </div>

      <section className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Indicadores de usuarios">
        {stats.map((item, index) => (
          <StatCard key={item.label} {...item} index={index} />
        ))}
      </section>

      <section className="mt-4 rounded-xl border border-line bg-surface p-3.5 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-label="Filtros de usuarios">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(8rem,1fr))_minmax(15rem,1.6fr)_auto]">
          <FilterSelect label="Rol" value={filters.role} options={ROLE_OPTIONS} onChange={(role) => updateFilters({ role })} />
          <FilterSelect label="País" value={filters.country} options={COUNTRY_OPTIONS} onChange={(country) => updateFilters({ country })} />
          <FilterSelect label="Clínica / Tenant" value={filters.clinic} options={clinicOptions} onChange={(clinic) => updateFilters({ clinic })} />
          <FilterSelect label="Estado" value={filters.status} options={STATUS_OPTIONS} onChange={(status) => updateFilters({ status })} />
          <label className="grid gap-1 text-2xs font-bold text-muted">Buscar usuario<span className="relative"><Search className="pointer-events-none absolute top-1/2 left-2.5 size-3 -translate-y-1/2 text-muted" strokeWidth={1.7} aria-hidden="true" /><input className="h-9 w-full rounded-lg border border-line bg-surface pr-2.5 pl-8 text-xs font-medium text-ink outline-none placeholder:text-muted/75 focus:border-accent focus:ring-3 focus:ring-focus/40 md:h-8" type="search" value={search} placeholder="Nombre, correo, teléfono o clínica..." onChange={(event) => { setSearch(event.target.value); setIsLoading(true); setError(null); }} /></span></label>
          <button className={`mt-auto flex min-h-9 items-center justify-center gap-1 rounded-lg border px-2.5 text-xs font-bold transition-colors focus-visible:outline-3 focus-visible:outline-focus md:min-h-8 ${hasActiveFilters ? "border-accent bg-accent-soft text-accent hover:bg-accent-soft-hover" : "border-line text-muted"}`} type="button" onClick={clearFilters} disabled={!hasActiveFilters}><SlidersHorizontal className="size-3" strokeWidth={1.7} aria-hidden="true" />{hasActiveFilters ? "Limpiar" : "Filtros"}</button>
        </div>
      </section>

      <div className="mt-4 grid items-start gap-4 min-[1440px]:grid-cols-[minmax(0,1fr)_17.5rem]">
        <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="users-results-title" aria-busy={isLoading}>
          <div className="flex min-h-10 items-center justify-between gap-3 border-b border-line px-3"><h2 className="text-2xs font-extrabold" id="users-results-title">{numberFormatter.format(data?.pagination.total ?? 0)} usuarios encontrados</h2>{isLoading ? <span className="text-2xs font-bold text-accent" role="status">Actualizando...</span> : <span className="hidden text-2xs text-muted sm:block">Datos del servidor</span>}</div>
          {error ? <div className="m-3 rounded-lg border border-danger/25 bg-danger-soft p-4 text-xs text-danger" role="alert">{error}</div> : null}
          {!error && data?.users.length === 0 ? <div className="p-8 text-center text-xs text-muted">No encontramos usuarios con estos filtros.</div> : null}
          {!error && data?.users.length ? <UsersTable
            users={data.users}
            onViewDetail={(user) => {
              setSelectedUser(user);
              setDetailUserOpen(true);
            }}
            onEdit={(user) => {
              setSelectedUser(user);
              setEditUserOpen(true);
            }}
            onMore={(user) => {
              setSelectedUser(user);
              setMessageUserOpen(true);
            }}
          /> : null}
          <div className="flex min-h-14 flex-col items-center justify-between gap-2 border-t border-line px-4 py-2.5 sm:flex-row">
            <p className="text-2xs text-muted">Mostrando {data?.pagination.from ?? 0} a {data?.pagination.to ?? 0} de {data?.pagination.total ?? 0} usuarios</p>
            <div className="flex items-center gap-1" aria-label="Paginación">
              <button className="grid size-7 place-items-center rounded-md border border-line text-muted disabled:opacity-40" type="button" aria-label="Página anterior" disabled={currentPage <= 1 || isLoading} onClick={() => updateFilters({ page: currentPage - 1 })}>‹</button>
              {visiblePages.map((page) => (
                <button className={`grid size-7 place-items-center rounded-md text-xs font-bold ${page === currentPage ? "bg-accent text-white" : "border border-line text-muted hover:bg-surface-subtle"}`} type="button" key={page} aria-current={page === currentPage ? "page" : undefined} disabled={isLoading} onClick={() => updateFilters({ page })}>{page}</button>
              ))}
              <button className="grid size-7 place-items-center rounded-md border border-line text-muted disabled:opacity-40" type="button" aria-label="Página siguiente" disabled={currentPage >= totalPages || isLoading} onClick={() => updateFilters({ page: currentPage + 1 })}>›</button>
            </div>
          </div>
        </section>

        <aside className="grid content-start gap-3" aria-label="Resumen y actividad">
          <section className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]">
            <h2 className="text-xs font-extrabold">Resumen General</h2>
            <dl className="mt-3 grid gap-2.5">
              {summaryRows.map((item) => {
                const Icon = item.icon;
                return <div className="grid grid-cols-[1.75rem_1fr_auto] items-center gap-2" key={item.label}><span className="grid size-7 place-items-center rounded-md bg-surface-subtle text-muted" aria-hidden="true"><Icon className="size-3.5" strokeWidth={1.7} /></span><dt className="text-xs text-muted">{item.label}</dt><dd className="font-mono text-xs font-bold">{item.value}</dd></div>;
              })}
              {countrySummary.map((item) => (
                <div className="grid grid-cols-[1.75rem_1fr_auto] items-center gap-2" key={item.code}><span className="grid size-7 place-items-center" aria-hidden="true"><CountryFlag countryCode={item.code} /></span><dt className="text-xs text-muted">{item.label}</dt><dd className="font-mono text-xs font-bold">{item.value}</dd></div>
              ))}
            </dl>
          </section>

          <section className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]">
            <h2 className="text-xs font-extrabold">Actividad Reciente</h2>
            <ol className="mt-3 grid gap-3">
              {(data?.recentActivity ?? []).map((activity) => {
                const Icon = UserPlus;
                const tone = ROLE_TONE[activity.role];
                return (
                  <li className="grid grid-cols-[1.75rem_1fr_auto] items-start gap-2" key={activity.id}>
                    <span className={`grid size-7 place-items-center rounded-md ${TONE_ICON[tone]}`} aria-hidden="true"><Icon className="size-3.5" strokeWidth={1.7} /></span>
                    <div><p className="text-xs font-extrabold">{activity.title}</p><p className="mt-0.5 text-2xs text-muted">{activity.detail}</p></div>
                    <time className="whitespace-nowrap text-2xs text-muted">{activity.occurredAt}</time>
                  </li>
                );
              })}
            </ol>
            <button className="mt-3 flex min-h-8 w-full items-center justify-center gap-1 rounded-lg text-2xs font-bold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled title="Disponible al conectar la actividad global">Ver toda la actividad</button>
          </section>
        </aside>
      </div>

      <section className="mt-4 grid gap-4 lg:grid-cols-2" aria-label="Distribución de usuarios">
        <DonutChart title="Usuarios por Rol" centerValue={numberFormatter.format(totals.users)} centerLabel="Total" segments={roleDistribution} />
        <DonutChart title="Usuarios por País" centerValue={numberFormatter.format(totals.users)} centerLabel="Total" segments={countryDistribution} />
      </section>

      <CreateUserModal
        key={createUserOpen ? "create-open" : "create-closed"}
        clinics={data?.clinics ?? []}
        isOpen={createUserOpen}
        onClose={() => setCreateUserOpen(false)}
        onCreated={(user) => {
          setSelectedUser(user);
          setRefreshVersion((current) => current + 1);
        }}
      />
      <UserDetailModal
        isOpen={detailUserOpen}
        onClose={() => setDetailUserOpen(false)}
        onMessage={() => {
          setDetailUserOpen(false);
          setMessageUserOpen(true);
        }}
        user={
          selectedUser
            ? {
                id: selectedUser.id,
                name: selectedUser.name,
                email: selectedUser.email ?? "Sin correo",
                role: ROLE_LABELS[selectedUser.role],
                country: selectedUser.countryCode,
                city: selectedUser.clinic?.address ?? COUNTRY_LABELS[selectedUser.countryCode],
                clinic: selectedUser.clinic?.name ?? null,
                phone: selectedUser.phoneNumber,
                status: selectedUser.status,
                lastAccess: selectedUser.lastAccess,
                createdAt: selectedUser.createdAt,
              }
            : null
        }
      />
      <EditUserModal
        isOpen={editUserOpen}
        onClose={() => setEditUserOpen(false)}
        onUpdated={(updatedUser) => {
          setSelectedUser(updatedUser);
          setRefreshVersion((current) => current + 1);
        }}
        user={
          selectedUser
            ? {
                id: selectedUser.id,
                name: selectedUser.name,
                email: selectedUser.email ?? "",
                role: ROLE_LABELS[selectedUser.role],
                country: selectedUser.countryCode,
                city: selectedUser.clinic?.address ?? COUNTRY_LABELS[selectedUser.countryCode],
                clinic: selectedUser.clinic?.name ?? null,
                phone: selectedUser.phoneNumber,
                status: selectedUser.status,
              }
            : null
        }
      />
      <SendMessageModal
        isOpen={messageUserOpen}
        onClose={() => setMessageUserOpen(false)}
        user={selectedUser ? { id: selectedUser.id, name: selectedUser.name } : null}
      />
    </div>
  );
}

const TONE_ICON: Record<BadgeTone, string> = {
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  violet: "bg-violet-soft text-violet",
  neutral: "bg-surface-subtle text-muted",
  dark: "bg-plan-enterprise text-white",
};

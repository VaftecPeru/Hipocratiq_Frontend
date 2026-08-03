import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  Eye,
  Headphones,
  Lock,
  MoreHorizontal,
  Pencil,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { CountryFlag, type CountryCode } from "@/shared/ui/country-flag";
import { DataBadge, type BadgeTone } from "@/shared/ui/data-badge";
import { DonutChart } from "@/shared/ui/donut-chart";
import { FilterField } from "@/shared/ui/filter-field";
import { StatCard, type StatCardProps } from "@/shared/ui/stat-card";

export const metadata: Metadata = {
  title: "Usuarios",
};

type UserRole =
  | "Superadministrador"
  | "Administrador de Clínica"
  | "Médico"
  | "Soporte"
  | "Staff";

type UserStatus = "active" | "inactive";

type PlatformUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  countryCode: CountryCode;
  city: string;
  clinic: string | null;
  lastAccess: string;
  status: UserStatus;
};

const ROLE_TONE: Record<UserRole, BadgeTone> = {
  Superadministrador: "dark",
  "Administrador de Clínica": "accent",
  Médico: "success",
  Soporte: "warning",
  Staff: "violet",
};

const numberFormatter = new Intl.NumberFormat("es-MX");

const stats: Array<StatCardProps> = [
  { label: "Total de Usuarios", value: "2,486", change: "+12% vs. mes anterior", direction: "up", icon: Users, tone: "accent" },
  { label: "Usuarios Activos", value: "1,892", change: "+10.2% vs. mes anterior", direction: "up", icon: UserCheck, tone: "violet" },
  { label: "Administradores", value: "186", change: "+8.5% vs. mes anterior", direction: "up", icon: ShieldCheck, tone: "success" },
  { label: "Soporte", value: "28", change: "+7.1% vs. mes anterior", direction: "up", icon: Headphones, tone: "warning" },
];

const users: PlatformUser[] = [
  { id: "u-01", name: "Carlos Mendoza", email: "carlos.mendoza@mediq.com", role: "Superadministrador", countryCode: "MX", city: "Ciudad de México", clinic: null, lastAccess: "Hoy, 09:32 AM", status: "active" },
  { id: "u-02", name: "María Fernanda Ruiz", email: "maria.ruiz@saludtotal.mx", role: "Administrador de Clínica", countryCode: "MX", city: "Monterrey, NL", clinic: "Clínica Salud Total", lastAccess: "Hoy, 08:15 AM", status: "active" },
  { id: "u-03", name: "Dr. José Antonio Vargas", email: "jose.vargas@saludtotal.mx", role: "Médico", countryCode: "MX", city: "Monterrey, NL", clinic: "Clínica Salud Total", lastAccess: "Hoy, 07:41 AM", status: "active" },
  { id: "u-04", name: "Ana Lucía Gómez", email: "ana.gomez@mediq.com", role: "Soporte", countryCode: "MX", city: "Ciudad de México", clinic: null, lastAccess: "Ayer, 06:22 PM", status: "active" },
  { id: "u-05", name: "Luis Alberto Castillo", email: "luis.castillo@bienestar.mx", role: "Administrador de Clínica", countryCode: "MX", city: "Guadalajara, Jal.", clinic: "Clínica Bienestar", lastAccess: "Ayer, 05:18 PM", status: "active" },
  { id: "u-06", name: "Dra. Paulina Hernández", email: "paulina.hernandez@bienestar.mx", role: "Médico", countryCode: "MX", city: "Guadalajara, Jal.", clinic: "Clínica Bienestar", lastAccess: "Ayer, 04:09 PM", status: "active" },
  { id: "u-07", name: "Jorge Ramírez", email: "jorge.ramirez@mediq.com", role: "Soporte", countryCode: "PE", city: "Lima", clinic: null, lastAccess: "Ayer, 03:47 PM", status: "active" },
  { id: "u-08", name: "Claudia Medina", email: "claudia.medina@clinicapent.pe", role: "Administrador de Clínica", countryCode: "PE", city: "Lima", clinic: "Clínica San Pablo", lastAccess: "Ayer, 02:31 PM", status: "active" },
  { id: "u-09", name: "Dr. Ricardo Montalvo", email: "ricardo.montalvo@clinicapent.pe", role: "Médico", countryCode: "PE", city: "Lima", clinic: "Clínica San Pablo", lastAccess: "Ayer, 11:55 AM", status: "active" },
  { id: "u-10", name: "Verónica Salazar", email: "veronica.salazar@saludplus.pe", role: "Staff", countryCode: "PE", city: "Arequipa", clinic: "Clínica Salud Plus", lastAccess: "Ayer, 10:12 AM", status: "inactive" },
];

const roleDistribution = [
  { label: "Médico", value: "1,156", percentage: 46.5, color: "var(--success)" },
  { label: "Staff", value: "842", percentage: 33.9, color: "var(--violet)" },
  { label: "Administrador de Clínica", value: "342", percentage: 13.8, color: "var(--accent)" },
  { label: "Soporte", value: "28", percentage: 1.1, color: "var(--warning)" },
  { label: "Superadministrador", value: "6", percentage: 0.2, color: "var(--plan-enterprise)" },
];

const countryDistribution = [
  { label: "México", value: "1,738", percentage: 69.9, color: "var(--accent)" },
  { label: "Perú", value: "748", percentage: 30.1, color: "var(--focus)" },
];

const summaryRows: Array<{ label: string; value: string; icon: LucideIcon }> = [
  { label: "Total de Usuarios", value: "2,486", icon: Users },
  { label: "Usuarios Activos", value: "1,892", icon: UserCheck },
  { label: "Administradores", value: "186", icon: ShieldCheck },
  { label: "Soporte", value: "28", icon: Headphones },
];

const countrySummary: Array<{ code: CountryCode; label: string; value: string }> = [
  { code: "MX", label: "México", value: "1,738" },
  { code: "PE", label: "Perú", value: "748" },
];

type ActivityItem = { id: string; title: string; detail: string; time: string; icon: LucideIcon; tone: BadgeTone };

const recentActivity: ActivityItem[] = [
  { id: "a-1", title: "Nuevo usuario", detail: "Carlos Rojas", time: "Hace 18 min", icon: UserPlus, tone: "success" },
  { id: "a-2", title: "Rol actualizado", detail: "María Fernanda Ruiz", time: "Hace 1 hora", icon: ShieldCheck, tone: "accent" },
  { id: "a-3", title: "Usuario bloqueado", detail: "Verónica Salazar", time: "Hace 2 horas", icon: Lock, tone: "danger" },
  { id: "a-4", title: "Invitación enviada", detail: "Dra. Alejandra Poma", time: "Hace 3 horas", icon: Send, tone: "violet" },
  { id: "a-5", title: "Nuevo administrador", detail: "Clínica Bienestar", time: "Hace 5 horas", icon: UserPlus, tone: "warning" },
];

function getInitials(name: string) {
  return name
    .replace(/^(Dr\.|Dra\.)\s+/i, "")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function RoleBadge({ role }: { role: UserRole }) {
  return <DataBadge tone={ROLE_TONE[role]}>{role}</DataBadge>;
}

function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <DataBadge tone={status === "active" ? "success" : "danger"} dot>
      {status === "active" ? "Activo" : "Inactivo"}
    </DataBadge>
  );
}

function UserActions({ userName }: { userName: string }) {
  return (
    <div className="flex justify-end gap-1">
      <button className="grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-accent-soft hover:text-accent focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" aria-label={`Ver ${userName}`} disabled title="Disponible al conectar el detalle de usuarios">
        <Eye className="size-3.5" strokeWidth={1.7} aria-hidden="true" />
      </button>
      <button className="grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-accent-soft hover:text-accent focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" aria-label={`Editar ${userName}`} disabled title="Disponible al conectar la edición de usuarios">
        <Pencil className="size-3.5" strokeWidth={1.7} aria-hidden="true" />
      </button>
      <button className="grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" aria-label={`Más acciones para ${userName}`} disabled title="Disponible al conectar acciones de usuarios">
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

function UsersTable() {
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <caption className="sr-only">Usuarios de la plataforma</caption>
          <thead>
            <tr className="border-b border-line bg-surface-subtle/50 text-2xs font-bold text-muted">
              <th className="w-10 px-3 py-2.5 font-bold" scope="col">#</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Usuario</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Rol</th>
              <th className="px-3 py-2.5 font-bold" scope="col">País / Ciudad</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Clínica</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Último acceso</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Estado</th>
              <th className="px-3 py-2.5 text-right font-bold" scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((user, index) => (
              <tr className="text-xs transition-colors hover:bg-accent-soft/35" key={user.id}>
                <td className="px-3 py-2 font-mono text-muted">{index + 1}.</td>
                <th className="px-3 py-2" scope="row">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar name={user.name} />
                    <div className="min-w-0">
                      <span className="block whitespace-nowrap font-bold text-ink">{user.name}</span>
                      <span className="block truncate text-2xs font-medium text-muted">{user.email}</span>
                    </div>
                  </div>
                </th>
                <td className="px-3 py-2"><RoleBadge role={user.role} /></td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2"><CountryFlag countryCode={user.countryCode} /><span className="leading-3.5 text-muted">{user.countryCode === "MX" ? "México" : "Perú"}<br />{user.city}</span></div>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-muted">{user.clinic ?? "—"}</td>
                <td className="whitespace-nowrap px-3 py-2 text-muted">{user.lastAccess}</td>
                <td className="px-3 py-2"><UserStatusBadge status={user.status} /></td>
                <td className="px-2 py-1.5"><UserActions userName={user.name} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 lg:hidden">
        {users.map((user) => (
          <article className="rounded-xl border border-line p-4" key={user.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar name={user.name} size="md" />
                <div className="min-w-0"><h3 className="truncate text-xs font-extrabold">{user.name}</h3><p className="mt-0.5 truncate text-2xs text-muted">{user.email}</p></div>
              </div>
              <UserStatusBadge status={user.status} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-line py-3 text-xs">
              <div><dt className="text-muted">Rol</dt><dd className="mt-1"><RoleBadge role={user.role} /></dd></div>
              <div><dt className="text-muted">Clínica</dt><dd className="mt-1 truncate font-semibold">{user.clinic ?? "—"}</dd></div>
              <div><dt className="text-muted">Ubicación</dt><dd className="mt-1 flex items-center gap-1.5"><CountryFlag countryCode={user.countryCode} />{user.city}</dd></div>
              <div><dt className="text-muted">Último acceso</dt><dd className="mt-1 font-medium">{user.lastAccess}</dd></div>
            </dl>
            <div className="mt-2 flex justify-end"><UserActions userName={user.name} /></div>
          </article>
        ))}
      </div>
    </>
  );
}

export default function UsersPage() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-[clamp(1.3rem,1.8vw,1.6rem)] font-extrabold tracking-[-0.03em]">Usuarios</h1>
          <p className="mt-0.5 text-xs text-muted">Gestiona todos los usuarios de la plataforma en México y Perú.</p>
        </div>
        <button className="flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-3.5 text-xs font-bold text-white transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus" type="button" disabled title="Disponible al conectar la gestión de usuarios">
          <UserPlus className="size-3.5" strokeWidth={2} aria-hidden="true" />Invitar Usuario
        </button>
      </div>

      <section className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Indicadores de usuarios">
        {stats.map((item, index) => (
          <StatCard key={item.label} {...item} index={index} />
        ))}
      </section>

      <section className="mt-4 rounded-xl border border-line bg-surface p-3.5 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-label="Filtros de usuarios">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(8rem,1fr))_minmax(15rem,1.6fr)_auto]">
          <FilterField label="Rol" value="Todos" />
          <FilterField label="País" value="Todos" />
          <FilterField label="Clínica / Tenant" value="Todos" />
          <FilterField label="Estado" value="Todos" />
          <label className="grid gap-1 text-2xs font-bold text-muted">Buscar usuario<span className="relative"><Search className="pointer-events-none absolute top-1/2 left-2.5 size-3 -translate-y-1/2 text-muted" strokeWidth={1.7} aria-hidden="true" /><input className="h-9 w-full rounded-lg border border-line bg-surface pr-2.5 pl-8 text-xs font-medium text-ink outline-none placeholder:text-muted/75 focus:border-accent focus:ring-3 focus:ring-focus/40 md:h-8" type="search" placeholder="Buscar por nombre, correo o clínica..." /></span></label>
          <button className="mt-auto flex min-h-9 items-center justify-center gap-1 rounded-lg border border-line px-2.5 text-xs font-bold text-muted transition-colors hover:border-accent/60 focus-visible:outline-3 focus-visible:outline-focus md:min-h-8" type="button"><SlidersHorizontal className="size-3" strokeWidth={1.7} aria-hidden="true" />Filtros</button>
        </div>
      </section>

      <div className="mt-4 grid items-start gap-4 min-[1440px]:grid-cols-[minmax(0,1fr)_17.5rem]">
        <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="users-results-title">
          <div className="flex min-h-10 items-center justify-between gap-3 border-b border-line px-3"><h2 className="text-2xs font-extrabold" id="users-results-title">2,486 usuarios encontrados</h2><span className="hidden text-2xs text-muted sm:block">Datos de referencia</span></div>
          <UsersTable />
          <div className="flex min-h-14 flex-col items-center justify-between gap-2 border-t border-line px-4 py-2.5 sm:flex-row">
            <p className="text-2xs text-muted">Mostrando 1 a 10 de 2,486 usuarios</p>
            <div className="flex items-center gap-1" aria-label="Paginación">
              <button className="grid size-7 place-items-center rounded-md border border-line text-muted disabled:opacity-40" type="button" aria-label="Página anterior" disabled>‹</button>
              {[1, 2, 3, 4, 5].map((page) => (
                <button className={`grid size-7 place-items-center rounded-md text-xs font-bold ${page === 1 ? "bg-accent text-white" : "border border-line text-muted hover:bg-surface-subtle"}`} type="button" key={page} aria-current={page === 1 ? "page" : undefined}>{page}</button>
              ))}
              <span className="grid size-7 place-items-center text-xs text-muted" aria-hidden="true">…</span>
              <button className="grid size-7 place-items-center rounded-md border border-line text-xs font-bold text-muted hover:bg-surface-subtle" type="button">249</button>
              <button className="grid size-7 place-items-center rounded-md border border-line text-muted hover:bg-surface-subtle" type="button" aria-label="Página siguiente">›</button>
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
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <li className="grid grid-cols-[1.75rem_1fr_auto] items-start gap-2" key={activity.id}>
                    <span className={`grid size-7 place-items-center rounded-md ${TONE_ICON[activity.tone]}`} aria-hidden="true"><Icon className="size-3.5" strokeWidth={1.7} /></span>
                    <div><p className="text-xs font-extrabold">{activity.title}</p><p className="mt-0.5 text-2xs text-muted">{activity.detail}</p></div>
                    <time className="whitespace-nowrap text-2xs text-muted">{activity.time}</time>
                  </li>
                );
              })}
            </ol>
            <button className="mt-3 flex min-h-8 w-full items-center justify-center gap-1 rounded-lg text-2xs font-bold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled title="Disponible al conectar la actividad global">Ver toda la actividad</button>
          </section>
        </aside>
      </div>

      <section className="mt-4 grid gap-4 lg:grid-cols-2" aria-label="Distribución de usuarios">
        <DonutChart title="Usuarios por Rol" centerValue={numberFormatter.format(2486)} centerLabel="Total" segments={roleDistribution} />
        <DonutChart title="Usuarios por País" centerValue={numberFormatter.format(2486)} centerLabel="Total" segments={countryDistribution} />
      </section>
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

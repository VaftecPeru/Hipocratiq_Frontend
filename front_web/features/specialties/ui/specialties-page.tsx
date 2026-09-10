"use client";

import { CircleCheck, CircleOff, Edit3, Plus, RefreshCw, Stethoscope } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createAdminSpecialty, getAdminSpecialties, updateAdminSpecialty } from "@/features/specialties/api/browser-specialties";
import type { AdminSpecialty, AdminSpecialtyPayload } from "@/features/specialties/model/admin-specialty.types";
import { notifySuperadminNavigationMutation } from "@/features/platform/model/superadmin-navigation-invalidation";
import { ApiError } from "@/shared/api/http-client";
import { Modal } from "@/shared/ui/modal";
import { StatCard } from "@/shared/ui/stat-card";
import { PlatformModuleLoading } from "@/shared/ui/platform-module-loading";

type FormState = AdminSpecialtyPayload;
type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  code: "",
  name: "",
  parentId: null,
  isActive: true,
};

function formFromSpecialty(specialty: AdminSpecialty): FormState {
  return {
    code: specialty.code,
    name: specialty.name,
    parentId: specialty.parentId,
    isActive: specialty.isActive,
  };
}

function sortSpecialties(specialties: AdminSpecialty[]): AdminSpecialty[] {
  return [...specialties].sort((left, right) => {
    if (left.parentId === null && right.parentId !== null) return -1;
    if (left.parentId !== null && right.parentId === null) return 1;
    return left.name.localeCompare(right.name, "es");
  });
}

function getRequestError(error: unknown): { message: string; fields: FormErrors } {
  if (error instanceof ApiError) {
    const fields = Object.fromEntries(
      Object.entries(error.errors ?? {}).map(([key, messages]) => [
        key === "parent_id" ? "parentId" : key === "is_active" ? "isActive" : key,
        messages[0],
      ]),
    ) as FormErrors;

    return { message: error.message, fields };
  }

  return { message: "No pudimos guardar la especialidad. Inténtalo nuevamente.", fields: {} };
}

export function SpecialtiesPage() {
  const [specialties, setSpecialties] = useState<AdminSpecialty[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<AdminSpecialty | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function load(signal?: AbortSignal) {
    try {
      const loadedSpecialties = await getAdminSpecialties(signal);
      if (signal?.aborted) return;
      setSpecialties(sortSpecialties(loadedSpecialties));
      setError(null);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setError(requestError instanceof Error ? requestError.message : "No pudimos cargar las especialidades.");
    } finally {
      if (!signal?.aborted) setIsRefreshing(false);
    }
  }

  function refresh() {
    setIsRefreshing(true);
    void load();
  }

  useEffect(() => {
    const controller = new AbortController();
    void getAdminSpecialties(controller.signal)
      .then((loadedSpecialties) => {
        if (controller.signal.aborted) return;
        setSpecialties(sortSpecialties(loadedSpecialties));
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(requestError instanceof Error ? requestError.message : "No pudimos cargar las especialidades.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsRefreshing(false);
      });
    return () => controller.abort();
  }, []);

  const roots = useMemo(() => (specialties ?? []).filter((specialty) => specialty.parentId === null), [specialties]);
  const activeCount = specialties?.filter((specialty) => specialty.isActive).length ?? 0;
  const rootCount = roots.length;
  const childCount = Math.max(0, (specialties?.length ?? 0) - rootCount);

  function openCreate() {
    setEditingSpecialty(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEdit(specialty: AdminSpecialty) {
    setEditingSpecialty(specialty);
    setForm(formFromSpecialty(specialty));
    setFormErrors({});
    setFormError(null);
    setIsFormOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setFormErrors({});
    setFormError(null);

    try {
      const saved = editingSpecialty
        ? await updateAdminSpecialty(editingSpecialty.id, form)
        : await createAdminSpecialty(form);

      setSpecialties((current) => sortSpecialties(
        editingSpecialty
          ? (current ?? []).map((item) => item.id === saved.id ? saved : item)
          : [...(current ?? []), saved],
      ));
      setIsFormOpen(false);
      notifySuperadminNavigationMutation(["specialties"]);
    } catch (requestError) {
      const parsed = getRequestError(requestError);
      setFormError(parsed.message);
      setFormErrors(parsed.fields);
    } finally {
      setIsSaving(false);
    }
  }

  if (!specialties) {
    if (error) {
      return <main className="mx-auto grid min-h-[48vh] max-w-2xl place-items-center px-4"><p className="rounded-xl border border-danger/25 bg-danger-soft p-5 text-center text-xs text-danger" role="alert">{error}</p></main>;
    }

    return <PlatformModuleLoading label="Cargando especialidades" />;
  }

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-2xs font-extrabold tracking-[0.14em] text-accent uppercase">Catálogo clínico</p>
          <h1 className="mt-1 text-[clamp(1.3rem,1.8vw,1.6rem)] font-extrabold tracking-[-0.03em]">Especialidades</h1>
          <p className="mt-0.5 max-w-2xl text-xs text-muted">Administra las especialidades y subespecialidades que se ofrecen en el registro profesional y la operación clínica.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-line px-3 text-xs font-bold text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus sm:min-h-9" type="button" onClick={refresh} disabled={isRefreshing}>
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />Actualizar
          </button>
          <button className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 text-xs font-bold text-white transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus sm:min-h-9" type="button" onClick={openCreate}>
            <Plus className="size-3.5" aria-hidden="true" />Nueva especialidad
          </button>
        </div>
      </header>

      <section className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Resumen del catálogo">
        <StatCard label="Total" value={String(specialties.length)} change="Registros configurados" direction="up" icon={Stethoscope} tone="accent" index={0} />
        <StatCard label="Activas" value={String(activeCount)} change="Disponibles para selección" direction="up" icon={CircleCheck} tone="success" index={1} />
        <StatCard label="Especialidades raíz" value={String(rootCount)} change="Categorías principales" direction="up" icon={Stethoscope} tone="violet" index={2} />
        <StatCard label="Subespecialidades" value={String(childCount)} change="Relaciones parentales" direction="up" icon={CircleOff} tone="warning" index={3} />
      </section>

      {error ? <p className="mt-4 rounded-lg border border-danger/25 bg-danger-soft p-4 text-xs text-danger" role="alert">{error}</p> : null}

      <section className="mt-4 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="specialties-results-title" aria-busy={isRefreshing}>
        <div className="flex min-h-11 items-center justify-between gap-3 border-b border-line px-4">
          <div><h2 className="text-xs font-extrabold" id="specialties-results-title">Catálogo administrado</h2><p className="mt-0.5 text-2xs text-muted">{specialties.length} registros · las referencias existentes nunca se eliminan automáticamente</p></div>
          {isRefreshing ? <span className="text-2xs font-bold text-accent" role="status">Actualizando...</span> : null}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left">
            <caption className="sr-only">Especialidades y subespecialidades configuradas</caption>
            <thead><tr className="border-b border-line bg-surface-subtle/50 text-2xs font-bold text-muted"><th className="px-4 py-2.5" scope="col">Nombre</th><th className="px-4 py-2.5" scope="col">Código</th><th className="px-4 py-2.5" scope="col">Padre</th><th className="px-4 py-2.5 text-right" scope="col">Uso clínico</th><th className="px-4 py-2.5" scope="col">Estado</th><th className="px-4 py-2.5 text-right" scope="col">Acciones</th></tr></thead>
            <tbody className="divide-y divide-line">
              {specialties.map((specialty) => (
                <tr className="text-xs transition-colors hover:bg-accent-soft/30" key={specialty.id}>
                  <th className="px-4 py-3 font-bold" scope="row"><span className={specialty.parentId === null ? "" : "pl-4 text-ink-secondary"}>{specialty.parentId === null ? specialty.name : `↳ ${specialty.name}`}</span></th>
                  <td className="px-4 py-3 font-mono text-2xs text-muted">{specialty.code}</td>
                  <td className="px-4 py-3 text-muted">{specialty.parent?.name ?? "Raíz"}</td>
                  <td className="px-4 py-3 text-right font-mono text-2xs">{specialty.usage.doctors} médicos · {specialty.usage.patientIntakes} ingresos</td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-extrabold ${specialty.isActive ? "bg-success-soft text-success" : "bg-surface-subtle text-muted"}`}><span className="size-1.5 rounded-full bg-current" aria-hidden="true" />{specialty.isActive ? "Activa" : "Inactiva"}</span></td>
                  <td className="px-4 py-2 text-right"><button className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-2.5 text-2xs font-bold text-muted hover:bg-surface-subtle hover:text-ink focus-visible:outline-3 focus-visible:outline-focus" type="button" onClick={() => openEdit(specialty)}><Edit3 className="size-3" aria-hidden="true" />Editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingSpecialty ? "Editar especialidad" : "Nueva especialidad"} description="Los cambios afectan el catálogo de selección profesional." size="md" formId="specialty-form" onSubmit={submit} footer={<><button className="inline-flex min-h-10 items-center justify-center rounded-lg border border-line px-4 text-xs font-bold text-muted hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button" onClick={() => setIsFormOpen(false)}>Cancelar</button><button className="inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-4 text-xs font-bold text-white hover:bg-accent-hover disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus" type="submit" form="specialty-form" disabled={isSaving}>{isSaving ? "Guardando..." : "Guardar cambios"}</button></>}>
        <div className="grid gap-4">
          {formError ? <p className="rounded-lg border border-danger/25 bg-danger-soft p-3 text-xs text-danger" role="alert" aria-live="polite">{formError}</p> : null}
          <label className="grid gap-1 text-xs font-bold text-ink" htmlFor="specialty-name">Nombre<span className="text-danger" aria-hidden="true"> *</span><input id="specialty-name" className="h-10 rounded-lg border border-line bg-surface px-3 text-sm font-medium outline-none placeholder:text-muted/70 focus:border-accent focus:ring-3 focus:ring-focus/40" value={form.name} maxLength={160} required aria-invalid={formErrors.name ? true : undefined} aria-describedby={formErrors.name ? "specialty-name-error" : undefined} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label>
          {formErrors.name ? <p className="-mt-3 text-2xs text-danger" id="specialty-name-error">{formErrors.name}</p> : null}
          <label className="grid gap-1 text-xs font-bold text-ink" htmlFor="specialty-code">Código<span className="text-danger" aria-hidden="true"> *</span><input id="specialty-code" className="h-10 rounded-lg border border-line bg-surface px-3 font-mono text-xs font-medium outline-none placeholder:text-muted/70 focus:border-accent focus:ring-3 focus:ring-focus/40" value={form.code} maxLength={80} pattern="[a-z0-9][a-z0-9_-]*" required aria-invalid={formErrors.code ? true : undefined} aria-describedby={formErrors.code ? "specialty-code-error" : "specialty-code-hint"} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toLowerCase() }))} /></label>
          <p className="-mt-3 text-2xs text-muted" id={formErrors.code ? "specialty-code-error" : "specialty-code-hint"}>{formErrors.code ?? "Usa minúsculas, números, guiones o guiones bajos."}</p>
          <label className="grid gap-1 text-xs font-bold text-ink" htmlFor="specialty-parent">Especialidad raíz<select id="specialty-parent" className="h-10 rounded-lg border border-line bg-surface px-3 text-sm font-medium outline-none focus:border-accent focus:ring-3 focus:ring-focus/40" value={form.parentId ?? ""} aria-invalid={formErrors.parentId ? true : undefined} aria-describedby={formErrors.parentId ? "specialty-parent-error" : undefined} onChange={(event) => setForm((current) => ({ ...current, parentId: event.target.value ? Number(event.target.value) : null }))}><option value="">Sin padre (especialidad raíz)</option>{roots.filter((root) => root.id !== editingSpecialty?.id).map((root) => <option value={root.id} key={root.id}>{root.name}</option>)}</select></label>
          {formErrors.parentId ? <p className="-mt-3 text-2xs text-danger" id="specialty-parent-error">{formErrors.parentId}</p> : null}
          <label className="flex items-start gap-2.5 rounded-lg border border-line bg-surface-subtle/50 p-3 text-xs font-bold text-ink"><input className="mt-0.5 size-4 accent-accent" type="checkbox" checked={form.isActive} aria-invalid={formErrors.isActive ? true : undefined} aria-describedby={formErrors.isActive ? "specialty-active-error" : undefined} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />Disponible para nuevos registros</label>
          {formErrors.isActive ? <p className="-mt-3 text-2xs text-danger" id="specialty-active-error">{formErrors.isActive}</p> : null}
          {editingSpecialty && (editingSpecialty.usage.doctors > 0 || editingSpecialty.usage.patientIntakes > 0) ? <p className="rounded-lg border border-warning/25 bg-warning-soft p-3 text-2xs leading-5 text-warning">Esta especialidad tiene referencias existentes. Desactivarla las conserva y evita nuevas selecciones; no se borran datos clínicos.</p> : null}
        </div>
      </Modal>
    </div>
  );
}

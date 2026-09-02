"use client";

import { Bell, CalendarDays, CheckCircle2, Clock3, Save, Video } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getDoctorPreferences,
  updateDoctorPreferences,
  type DoctorPreferences,
  type DoctorWeekday,
} from "@/features/doctors/api/doctor-clinical";
import { DoctorCard, Toggle } from "@/features/doctors/ui/doctor-primitives";
import { Spinner } from "@/shared/ui/spinner";

const WEEKDAYS: Array<{ key: DoctorWeekday; label: string }> = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

function fieldClassName(): string {
  return "h-9 rounded-lg border border-line bg-surface-input px-2 text-xs font-bold text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20 disabled:opacity-60";
}

function PreferenceSwitch({
  label,
  checked,
  onChange,
  disabled,
}: Readonly<{ label: string; checked: boolean; onChange: (value: boolean) => void; disabled: boolean }>) {
  return <div className="flex items-center justify-between gap-3 rounded-lg border border-line p-2.5"><span className="text-[0.6rem] font-extrabold">{label}</span><Toggle label={label} checked={checked} onChange={onChange} disabled={disabled} /></div>;
}

export function DoctorPreferencesSettings() {
  const [preferences, setPreferences] = useState<DoctorPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getDoctorPreferences(controller.signal)
      .then(setPreferences)
      .catch((caught: unknown) => {
        if (!(caught instanceof DOMException && caught.name === "AbortError")) {
          setError(caught instanceof Error ? caught.message : "No pudimos cargar tus preferencias.");
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  function updateDay(day: DoctorWeekday, field: "enabled" | "start" | "end", value: boolean | string): void {
    setPreferences((current) => current ? {
      ...current,
      working_hours: {
        ...current.working_hours,
        [day]: { ...current.working_hours[day], [field]: value },
      },
    } : current);
  }

  function updateNotification(field: keyof DoctorPreferences["notifications"], value: boolean): void {
    setPreferences((current) => current ? { ...current, notifications: { ...current.notifications, [field]: value } } : current);
  }

  function updateClinical(field: keyof DoctorPreferences["clinical"], value: boolean): void {
    setPreferences((current) => current ? { ...current, clinical: { ...current.clinical, [field]: value } } : current);
  }

  function validate(): string | null {
    if (!preferences) return "No hay preferencias para guardar.";
    const invalidDay = WEEKDAYS.find(({ key }) => {
      const day = preferences.working_hours[key];
      return day.enabled && day.start >= day.end;
    });
    return invalidDay ? `${invalidDay.label}: la hora de inicio debe ser anterior al cierre.` : null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setSuccess(null);
      return;
    }

    if (!preferences) return;
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      const saved = await updateDoctorPreferences(preferences);
      setPreferences(saved);
      setSuccess("Preferencias guardadas correctamente.");
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "No pudimos guardar tus preferencias.");
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return <DoctorCard className="p-4"><p className="flex items-center gap-2 text-xs font-bold text-muted" aria-busy="true"><Spinner className="size-4" />Cargando preferencias…</p></DoctorCard>;
  }

  if (!preferences) {
    return <DoctorCard className="p-4"><p className="text-xs font-bold text-danger" role="alert">{error ?? "No pudimos cargar tus preferencias."}</p></DoctorCard>;
  }

  return (
    <DoctorCard className="p-4 lg:col-span-2 xl:col-span-3">
      <div className="flex items-center gap-2 border-b border-line pb-3">
        <span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent"><CalendarDays className="size-4" aria-hidden="true" /></span>
        <div><h2 className="text-[0.82rem] font-extrabold">Disponibilidad y agenda</h2><p className="mt-0.5 text-[0.56rem] font-bold text-ink-secondary">Estos valores controlan los espacios que la agenda ofrece a tus pacientes.</p></div>
      </div>

      <form className="mt-4 grid gap-4" onSubmit={(event) => void handleSubmit(event)} aria-busy={pending}>
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.65fr)]">
          <fieldset className="min-w-0">
            <legend className="text-[0.68rem] font-extrabold text-ink">Horario de atención</legend>
            <div className="mt-2 overflow-x-auto rounded-lg border border-line">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <caption className="sr-only">Horario semanal de atención</caption>
                <thead><tr className="border-b border-line bg-surface-subtle text-[0.55rem] font-extrabold text-ink-secondary"><th className="px-3 py-2 font-extrabold">Día</th><th className="px-3 py-2 font-extrabold">Activo</th><th className="px-3 py-2 font-extrabold">Desde</th><th className="px-3 py-2 font-extrabold">Hasta</th></tr></thead>
                <tbody>
                  {WEEKDAYS.map(({ key, label }) => {
                    const day = preferences.working_hours[key];
                    return <tr className="border-b border-line last:border-0" key={key}><th className="px-3 py-2 text-[0.6rem] font-extrabold">{label}</th><td className="px-3 py-2"><Toggle label={`${label} activo`} checked={day.enabled} onChange={(value) => updateDay(key, "enabled", value)} disabled={pending} /></td><td className="px-3 py-2"><label className="sr-only" htmlFor={`start-${key}`}>{label}, hora de inicio</label><input id={`start-${key}`} className={fieldClassName()} type="time" value={day.start} onChange={(event) => updateDay(key, "start", event.target.value)} disabled={!day.enabled || pending} /></td><td className="px-3 py-2"><label className="sr-only" htmlFor={`end-${key}`}>{label}, hora de cierre</label><input id={`end-${key}`} className={fieldClassName()} type="time" value={day.end} onChange={(event) => updateDay(key, "end", event.target.value)} disabled={!day.enabled || pending} /></td></tr>;
                  })}
                </tbody>
              </table>
            </div>
          </fieldset>

          <fieldset className="grid gap-3">
            <legend className="text-[0.68rem] font-extrabold text-ink">Reglas de agenda</legend>
            <label className="grid gap-1 text-[0.58rem] font-bold text-ink-secondary">Duración por consulta<select className={fieldClassName()} value={preferences.appointment_duration_minutes} onChange={(event) => setPreferences({ ...preferences, appointment_duration_minutes: Number(event.target.value) as DoctorPreferences["appointment_duration_minutes"] })} disabled={pending}>{[15, 30, 45, 60, 90].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutos</option>)}</select></label>
            <label className="grid gap-1 text-[0.58rem] font-bold text-ink-secondary">Descanso entre citas (minutos)<input className={fieldClassName()} type="number" min={0} max={60} step={5} value={preferences.buffer_minutes} onChange={(event) => setPreferences({ ...preferences, buffer_minutes: Math.max(0, Math.min(60, Number(event.target.value) || 0)) })} disabled={pending} /></label>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-line p-2.5"><span className="flex items-center gap-2 text-[0.6rem] font-extrabold"><CheckCircle2 className="size-3.5 text-success" aria-hidden="true" />Confirmar citas automáticamente</span><Toggle label="Confirmar citas automáticamente" checked={preferences.auto_confirm_appointments} onChange={(value) => setPreferences({ ...preferences, auto_confirm_appointments: value })} disabled={pending} /></div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-line p-2.5"><span className="flex items-center gap-2 text-[0.6rem] font-extrabold"><Video className="size-3.5 text-accent" aria-hidden="true" />Permitir teleconsultas</span><Toggle label="Permitir teleconsultas" checked={preferences.teleconsultations_enabled} onChange={(value) => setPreferences({ ...preferences, teleconsultations_enabled: value })} disabled={pending} /></div>
          </fieldset>
        </div>

        <div className="grid gap-4 border-t border-line pt-4 lg:grid-cols-2">
          <fieldset><legend className="flex items-center gap-2 text-[0.68rem] font-extrabold text-ink"><Bell className="size-3.5 text-accent" aria-hidden="true" />Notificaciones</legend><div className="mt-2 grid gap-2 sm:grid-cols-2"><PreferenceSwitch label="Resultados pendientes" checked={preferences.notifications.results_pending} onChange={(value) => updateNotification("results_pending", value)} disabled={pending} /><PreferenceSwitch label="Nuevos mensajes" checked={preferences.notifications.new_messages} onChange={(value) => updateNotification("new_messages", value)} disabled={pending} /><PreferenceSwitch label="Recordatorios de seguimiento" checked={preferences.notifications.follow_up_reminders} onChange={(value) => updateNotification("follow_up_reminders", value)} disabled={pending} /><PreferenceSwitch label="Alertas epidemiológicas" checked={preferences.notifications.epidemiology_alerts} onChange={(value) => updateNotification("epidemiology_alerts", value)} disabled={pending} /><PreferenceSwitch label="Teleconsultas próximas" checked={preferences.notifications.upcoming_teleconsultations} onChange={(value) => updateNotification("upcoming_teleconsultations", value)} disabled={pending} /></div></fieldset>
          <fieldset><legend className="flex items-center gap-2 text-[0.68rem] font-extrabold text-ink"><Clock3 className="size-3.5 text-accent" aria-hidden="true" />Preferencias clínicas</legend><div className="mt-2 grid gap-2"><PreferenceSwitch label="Mostrar antecedentes relevantes" checked={preferences.clinical.show_relevant_history} onChange={(value) => updateClinical("show_relevant_history", value)} disabled={pending} /><PreferenceSwitch label="Mostrar epidemiología" checked={preferences.clinical.show_epidemiology} onChange={(value) => updateClinical("show_epidemiology", value)} disabled={pending} /></div></fieldset>
        </div>

        {error ? <p className="text-xs font-bold text-danger" role="alert" aria-live="polite">{error}</p> : null}
        {success ? <p className="flex items-center gap-2 text-xs font-extrabold text-success" role="status" aria-live="polite"><CheckCircle2 className="size-4" aria-hidden="true" />{success}</p> : null}
        <div className="flex justify-end border-t border-line pt-3"><button className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-accent px-4 text-[0.65rem] font-extrabold text-white hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus disabled:opacity-60" type="submit" disabled={pending}>{pending ? <Spinner className="size-3.5" /> : <Save className="size-3.5" aria-hidden="true" />}Guardar preferencias</button></div>
      </form>
    </DoctorCard>
  );
}

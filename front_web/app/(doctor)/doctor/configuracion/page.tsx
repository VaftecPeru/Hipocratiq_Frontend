import {
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  FlaskConical,
  Globe,
  HeartPulse,
  Headphones,
  LockKeyhole,
  Mail,
  MessageCircle,
  PenLine,
  ShieldCheck,
  Stethoscope,
  Upload,
  UserRound,
  Users,
  Video,
} from "lucide-react";
import { DoctorCard, Toggle } from "@/features/doctors/ui/doctor-primitives";
import { DoctorProfileSettings } from "@/features/doctors/ui/doctor-profile-settings";

function SettingsRow({
  icon: Icon,
  label,
  value,
  valueTone = "default",
  action = false,
}: Readonly<{
  icon: typeof UserRound;
  label: string;
  value: string;
  valueTone?: "default" | "success";
  action?: boolean;
}>) {
  return (
    <div className="flex min-h-10 items-center gap-2 border-b border-line last:border-0">
      <Icon className="size-3.5 shrink-0 text-ink-secondary" aria-hidden="true" />
      <span className="min-w-0 flex-1 text-[0.58rem] font-extrabold text-ink-secondary">{label}</span>
      <span className={`max-w-[58%] truncate text-right text-[0.58rem] font-extrabold ${valueTone === "success" ? "text-success" : "text-ink"}`}>{value}</span>
      {action ? <ChevronRight className="size-3 shrink-0 text-ink-secondary" aria-hidden="true" /> : null}
    </div>
  );
}

function SettingsToggleRow({ icon: Icon, label, checked = true }: Readonly<{ icon: typeof Bell; label: string; checked?: boolean }>) {
  return (
    <div className="flex min-h-10 items-center gap-2 border-b border-line last:border-0">
      <Icon className="size-3.5 shrink-0 text-ink-secondary" aria-hidden="true" />
      <span className="flex-1 text-[0.58rem] font-extrabold text-ink-secondary">{label}</span>
      <Toggle label={label} checked={checked} />
    </div>
  );
}

export default function DoctorSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.65rem]">Configuración</h1><p className="mt-1 text-[0.68rem] font-bold text-ink-secondary">Preferencias personales, agenda médica y herramientas clínicas.</p></div><div className="flex gap-2"><button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 text-[0.65rem] font-extrabold hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus" type="button"><Upload className="size-3.5" aria-hidden="true" />Exportar configuración</button><button className="flex min-h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-left focus-visible:outline-3 focus-visible:outline-focus" type="button"><span className="grid size-7 place-items-center rounded-full bg-ink text-[0.55rem] font-extrabold text-white">CR</span><span><b className="block text-[0.58rem] font-extrabold">Cambiar foto</b><small className="block text-[0.5rem] font-bold text-ink-secondary">JPG, PNG, WEBP</small></span></button></div></header>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4" aria-label="Preferencias principales"><DoctorProfileSettings />

        <DoctorCard className="p-4"><div className="flex items-center gap-2 border-b border-line pb-3"><span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent"><CalendarDays className="size-4" /></span><h2 className="text-[0.82rem] font-extrabold">Disponibilidad y agenda</h2></div><div className="mt-1"><SettingsRow icon={Clock3} label="Horario actual" value="Lun-Vie 08:00 AM - 06:00 PM" /><SettingsRow icon={Stethoscope} label="Duración por consulta" value="30 min" /><SettingsToggleRow icon={Stethoscope} label="Teleconsultas habilitadas" /><SettingsToggleRow icon={Clock3} label="Bloques personales" /><SettingsToggleRow icon={CheckCircle2} label="Confirmación automática" /></div></DoctorCard>

        <DoctorCard className="p-4"><div className="flex items-center gap-2 border-b border-line pb-3"><span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent"><PenLine className="size-4" /></span><h2 className="text-[0.82rem] font-extrabold">Firma y recetas</h2></div><div className="mt-1"><SettingsRow icon={PenLine} label="Firma digital" value="Configurada  ✓" valueTone="success" /><SettingsRow icon={CalendarDays} label="Recetario electrónico" value="Activo  ✓" valueTone="success" /><SettingsRow icon={FileText} label="Plantillas clínicas" value="6" /></div><div className="mt-3 flex gap-2"><button className="inline-flex min-h-8 items-center gap-2 rounded-lg border border-accent/20 px-3 text-[0.57rem] font-extrabold text-accent focus-visible:outline-3 focus-visible:outline-focus" type="button"><PenLine className="size-3" />Gestionar firma</button><button className="inline-flex min-h-8 items-center gap-2 rounded-lg border border-accent/20 px-3 text-[0.57rem] font-extrabold text-accent focus-visible:outline-3 focus-visible:outline-focus" type="button"><FileText className="size-3" />Ver plantillas</button></div></DoctorCard>

        <DoctorCard className="p-4"><div className="flex items-center gap-2 border-b border-line pb-3"><span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent"><Bell className="size-4" /></span><h2 className="text-[0.82rem] font-extrabold">Notificaciones</h2></div><div className="mt-1"><SettingsToggleRow icon={FlaskConical} label="Resultados pendientes" /><SettingsToggleRow icon={Mail} label="Nuevos mensajes" /><SettingsToggleRow icon={CalendarDays} label="Recordatorios de seguimiento" /><SettingsToggleRow icon={Bell} label="Alertas IA Epidemiológica" /><SettingsToggleRow icon={Video} label="Teleconsultas próximas" /></div></DoctorCard></section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-[0.9fr_1fr_1.3fr]" aria-label="Seguridad e idioma"><DoctorCard className="p-4"><div className="flex items-center gap-2 border-b border-line pb-3"><span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent"><ShieldCheck className="size-4" /></span><h2 className="text-[0.82rem] font-extrabold">Seguridad y sesión</h2></div><div className="mt-1"><SettingsRow icon={ShieldCheck} label="Autenticación en dos pasos" value="Activado  ✓" valueTone="success" /><SettingsRow icon={LockKeyhole} label="Cambio de contraseña" value="" action /><SettingsRow icon={Users} label="Sesiones activas" value="2  ›" action /><SettingsRow icon={Clock3} label="Última actividad" value="Hoy 10:30 AM" /></div></DoctorCard>

        <DoctorCard className="p-4"><div className="flex items-center gap-2 border-b border-line pb-3"><span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent"><Globe className="size-4" /></span><h2 className="text-[0.82rem] font-extrabold">Idioma y formato</h2></div><div className="mt-1"><SettingsRow icon={Globe} label="Idioma" value="Español     ⌄" /><SettingsRow icon={Globe} label="País" value="México     ⌄" /><SettingsRow icon={Clock3} label="Zona horaria" value="CDMX (GMT-06:00)     ⌄" /><SettingsRow icon={CalendarDays} label="Formato de fecha" value="DD/MM/AAAA     ⌄" /></div></DoctorCard>

        <DoctorCard className="p-4"><div className="flex items-center gap-2 border-b border-line pb-3"><span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent"><HeartPulse className="size-4" /></span><h2 className="text-[0.82rem] font-extrabold">Preferencias clínicas</h2></div><div className="mt-1"><SettingsRow icon={HeartPulse} label="Especialidad por defecto" value="Cardiología     ⌄" /><SettingsRow icon={BarChart3} label="Escala de prioridad" value="Alta / Media / Baja     ⌄" /><SettingsToggleRow icon={FileText} label="Mostrar antecedentes relevantes" /><SettingsToggleRow icon={HeartPulse} label="Mostrar IA en panel" /></div></DoctorCard></section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_1fr]" aria-label="Resumen y soporte"><DoctorCard className="p-4 sm:p-5"><div className="flex items-center gap-2 border-b border-line pb-3"><span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent"><BarChart3 className="size-4" /></span><h2 className="text-[0.82rem] font-extrabold">Resumen rápido</h2></div><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"><QuickStat icon={CalendarDays} label="Consultas hoy" value="12" detail="↑ 20% vs. ayer" tone="blue" /><QuickStat icon={MessageCircle} label="Mensajes no leídos" value="3" detail="Ver mensajes" tone="violet" /><QuickStat icon={FlaskConical} label="Recetas activas" value="18" detail="Ver recetas" tone="green" /><QuickStat icon={ShieldCheck} label="Riesgo IA" value="Bajo" detail="Tendencia estable" tone="green" /></div></DoctorCard><DoctorCard className="p-4 sm:p-5"><div className="flex items-center gap-2 border-b border-line pb-3"><span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent"><Headphones className="size-4" /></span><h2 className="text-[0.82rem] font-extrabold">Soporte y ayuda</h2></div><ul className="mt-3 divide-y divide-line rounded-lg border border-line">{[{ icon: FileText, title: "Manual médico", detail: "Guías y documentación" }, { icon: Clock3, title: "Contactar soporte", detail: "Nuestro equipo está listo para ayudarte" }, { icon: CheckCircle2, title: "Estado del servicio", detail: "Operativo" }].map(({ icon: Icon, title, detail }) => <li className="flex items-center gap-2 px-3 py-2.5" key={title}><span className="grid size-6 place-items-center rounded-md bg-accent-soft text-accent"><Icon className="size-3.5" /></span><span className="flex-1"><b className="block text-[0.58rem] font-extrabold">{title}</b><small className={`block mt-0.5 text-[0.53rem] font-bold ${title === "Estado del servicio" ? "text-success" : "text-ink-secondary"}`}>{detail}</small></span>{title === "Estado del servicio" ? <CheckCircle2 className="size-3.5 text-success" /> : <ChevronRight className="size-3 text-ink-secondary" />}</li>)}</ul></DoctorCard></section>
    </div>
  );
}

function QuickStat({ icon: Icon, label, value, detail, tone }: Readonly<{ icon: typeof CalendarDays; label: string; value: string; detail: string; tone: "blue" | "green" | "violet" }>) {
  return <div className="rounded-lg border border-line p-3"><Icon className={`size-4 ${tone === "blue" ? "text-accent" : tone === "green" ? "text-success" : "text-violet"}`} /><p className="mt-2 text-[0.56rem] font-extrabold">{label}</p><strong className={`mt-1 block text-lg font-extrabold ${value === "Bajo" ? "text-success" : "text-ink"}`}>{value}</strong><p className={`mt-1 text-[0.52rem] font-bold ${tone === "green" ? "text-success" : "text-accent"}`}>{detail}</p></div>;
}

"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  Bell,
  Camera,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  ClipboardCheck,
  Clock3,
  CreditCard,
  Download,
  Eye,
  FileDown,
  FileText,
  FlaskConical,
  FolderOpen,
  HeartHandshake,
  HeartPulse,
  Info,
  MapPin,
  Mail,
  MessageCircle,
  Navigation,
  Paperclip,
  Pill,
  RefreshCw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Stethoscope,
  Syringe,
  Thermometer,
  UserRound,
  Video,
  Waves,
  LockKeyhole,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import type { AuthenticatedUser } from "@/features/auth/model/auth.types";

type PatientView = "dashboard" | "appointments" | "triage" | "results" | "history" | "prescriptions" | "epidemiology" | "membership" | "profile";
type Tone = "blue" | "green" | "violet" | "amber" | "coral" | "teal";

const toneClass: Record<Tone, string> = {
  blue: "patient-icon--blue",
  green: "patient-icon--green",
  violet: "patient-icon--violet",
  amber: "patient-icon--amber",
  coral: "patient-icon--coral",
  teal: "patient-icon--teal",
};

function IconBadge({ icon: Icon, tone = "blue" }: { icon: LucideIcon; tone?: Tone }) {
  return (
    <span className={`patient-icon ${toneClass[tone]}`}>
      <Icon className="size-[17px]" strokeWidth={1.9} aria-hidden="true" />
    </span>
  );
}

function SectionTitle({
  title,
  action,
  actionHref,
}: {
  title: string;
  action?: string;
  actionHref?: string;
}) {
  return (
    <div className="patient-section-title">
      <h2>{title}</h2>
      {action ? (
        <Link className="patient-text-link" href={actionHref ?? "#"}>
          {action} <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

function PatientAvatarSmall() {
  return (
    <span className="patient-avatar patient-avatar--small" aria-hidden="true">
      <span className="patient-avatar__hair" />
      <span className="patient-avatar__face">AM</span>
      <span className="patient-avatar__shirt" />
    </span>
  );
}

function ActionButton({
  children,
  variant = "outline",
  icon: Icon,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  variant?: "outline" | "primary" | "danger" | "ghost";
  icon?: LucideIcon;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button className={`patient-action-button patient-action-button--${variant}`} type={type} onClick={onClick}>
      {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

function HelpStrip() {
  return (
    <aside className="patient-help-strip" aria-labelledby="patient-help-title">
      <div className="patient-help-strip__copy">
        <span className="patient-help-strip__icon">
          <HeartHandshake className="size-7" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <div>
          <h2 id="patient-help-title">¿Necesitas ayuda?</h2>
          <p>Estamos aquí para ti. Comunícate con nuestro centro de atención al paciente.</p>
        </div>
      </div>
      <div className="patient-help-strip__contact">
        <button className="patient-whatsapp-button" type="button">
          <MessageCircle className="size-4" aria-hidden="true" /> Contactar WhatsApp
        </button>
        <strong>(01) 700 1234</strong>
      </div>
    </aside>
  );
}

function EpidemiologyCard({ compact = false }: { compact?: boolean }) {
  return (
    <article className={`patient-card patient-epidemiology ${compact ? "patient-epidemiology--compact" : ""}`}>
      <SectionTitle title="IA Epidemiológica" />
      <span className="patient-beta">Beta</span>
      <div className="patient-risk-callout">
        <ShieldCheck className="size-5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
        <div>
          <p>Riesgo actual: <strong>Bajo</strong></p>
          <span>Sin alertas relevantes para tu zona.</span>
        </div>
      </div>
      <div className="patient-epidemiology__recommendation">
        <p>Recomendación personalizada</p>
        <strong>{compact ? "Mantén tus vacunas al día y sigue las medidas de prevención indicadas por tu médico." : "Mantén tus vacunas al día, buena hidratación y lavado frecuente de manos."}</strong>
      </div>
      {!compact ? <span className="patient-card-meta">Última actualización: 29 May 2024, 08:00 a. m.</span> : null}
      <Link className="patient-card-footer-link" href="/patient/ia">
        Ver más información <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </article>
  );
}

const recentResults = [
  { name: "Perfil Lipídico Completo", source: "Laboratorio Central · 12 May 2024", status: "NORMAL", tone: "green" as Tone, icon: FlaskConical },
  { name: "Radiografía de Tórax (AP)", source: "Imagenología Médica · 05 May 2024", status: "LISTO", tone: "blue" as Tone, icon: Activity },
  { name: "Electrocardiograma", source: "Cardiología · 28 Abr 2024", status: "EN REVISIÓN", tone: "amber" as Tone, icon: HeartPulse },
];

function ResultsPreviewCard() {
  return (
    <article className="patient-card patient-results-preview">
      <SectionTitle title="Resultados Recientes" action="Ver todos mis estudios" actionHref="/patient/resultados" />
      <div className="patient-preview-list">
        {recentResults.map((result) => (
          <div className="patient-preview-row" key={result.name}>
            <IconBadge icon={result.icon} tone={result.tone} />
            <div className="patient-preview-row__copy">
              <strong>{result.name}</strong>
              <span>{result.source}</span>
            </div>
            <span className={`patient-status patient-status--${result.tone}`}>{result.status}</span>
            <button className="patient-small-icon-button" type="button" aria-label={`Ver ${result.name}`}>
              {result.status === "NORMAL" ? <Download className="size-3.5" aria-hidden="true" /> : result.status === "LISTO" ? <Eye className="size-3.5" aria-hidden="true" /> : <Clock3 className="size-3.5" aria-hidden="true" />}
            </button>
          </div>
        ))}
      </div>
      <Link className="patient-card-footer-link" href="/patient/resultados">
        Ver todos los resultados <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </article>
  );
}

const prescriptions = [
  { name: "Enalapril 10 mg", instruction: "1 comprimido cada 12 horas", next: "Hoy, 20:00", icon: Paperclip, tone: "blue" as Tone },
  { name: "Atorvastatina 20 mg", instruction: "1 comprimido por la noche", next: "Hoy, 22:30", icon: Pill, tone: "violet" as Tone },
  { name: "Aspirina 100 mg", instruction: "1 comprimido después del almuerzo", next: "Mañana, 13:00", icon: Activity, tone: "coral" as Tone },
];

function PrescriptionsCard() {
  return (
    <article className="patient-card patient-prescriptions">
      <SectionTitle title="Mis Recetas Activas" action="Ver todas mis recetas" actionHref="/patient/recetas" />
      <div className="patient-prescriptions__list">
        {prescriptions.map((prescription) => (
          <div className="patient-prescription-row" key={prescription.name}>
            <IconBadge icon={prescription.icon} tone={prescription.tone} />
            <div className="patient-prescription-row__copy">
              <strong>{prescription.name}</strong>
              <span>{prescription.instruction}</span>
            </div>
            <div className="patient-prescription-row__next">
              <small>PRÓXIMA DOSIS</small>
              <strong>{prescription.next}</strong>
            </div>
          </div>
        ))}
      </div>
      <button className="patient-card-footer-link patient-card-footer-link--button" type="button">
        <RefreshCw className="size-3.5" aria-hidden="true" /> Solicitar renovación de recetas
      </button>
    </article>
  );
}

function QuickAccessCard() {
  const actions = [
    { title: "Mis Citas", caption: "Ver próximas citas", icon: CalendarDays, href: "/patient/citas", tone: "blue" as Tone },
    { title: "Mis Resultados", caption: "Ver estudios", icon: FlaskConical, href: "/patient/resultados", tone: "blue" as Tone },
    { title: "Mis Recetas", caption: "Ver medicamentos", icon: Paperclip, href: "/patient/recetas", tone: "blue" as Tone },
    { title: "Mi Historial", caption: "Ver información", icon: HeartPulse, href: "/patient/historial", tone: "blue" as Tone },
  ];

  return (
    <article className="patient-card patient-quick-access">
      <SectionTitle title="Recordatorios y Accesos Rápidos" />
      <div className="patient-quick-grid">
        {actions.map((action) => (
          <Link className="patient-quick-item" href={action.href} key={action.title}>
            <IconBadge icon={action.icon} tone={action.tone} />
            <span>
              <strong>{action.title}</strong>
              <small>{action.caption}</small>
            </span>
          </Link>
        ))}
      </div>
    </article>
  );
}

function AppointmentHero() {
  return (
    <article className="patient-appointment-hero">
      <div className="patient-appointment-hero__top">
        <div className="patient-appointment-hero__eyebrow">
          <span>PRÓXIMA CITA</span>
          <CalendarDays className="size-3.5" aria-hidden="true" />
        </div>
        <div className="patient-appointment-hero__time">
          <strong>09:30</strong>
          <span>a. m.</span>
        </div>
      </div>
      <div className="patient-appointment-hero__date">Viernes, 30 de Mayo</div>
      <div className="patient-appointment-hero__location">
        <MapPin className="size-3.5" aria-hidden="true" />
        <span>Sede San Isidro</span><i /> <span>Av. Arequipa 4520, San Isidro, Lima</span>
      </div>
      <div className="patient-appointment-hero__footer">
        <PatientAvatarSmall />
        <div className="patient-appointment-hero__doctor">
          <small>Cardiología</small>
          <strong>Dr. Ricardo Gómez</strong>
          <span>CMP 123456</span>
        </div>
        <div className="patient-appointment-hero__actions">
          <ActionButton icon={RefreshCw}>Reprogramar</ActionButton>
          <ActionButton icon={CircleAlert} variant="danger">Cancelar</ActionButton>
          <ActionButton icon={Navigation}>Cómo llegar</ActionButton>
        </div>
      </div>
    </article>
  );
}

function HealthStatusCard() {
  return (
    <article className="patient-health-status">
      <div className="patient-health-status__top">
        <span className="patient-health-status__badge"><ShieldCheck className="size-4" aria-hidden="true" /> ESTADO DE SALUD</span>
        <span className="patient-health-status__stable">Estable</span>
      </div>
      <h2>Excelente progreso</h2>
      <p>Tus signos vitales y resultados se encuentran dentro de los rangos normales.</p>
      <strong>Última evaluación: 22 May 2024</strong>
    </article>
  );
}

function DashboardView() {
  return (
    <div className="patient-page patient-dashboard-page">
      <div className="patient-dashboard-grid">
        <AppointmentHero />
        <HealthStatusCard />
        <EpidemiologyCard />
        <ResultsPreviewCard />
        <PrescriptionsCard />
        <QuickAccessCard />
        <div className="patient-dashboard-help"><HelpStrip /></div>
      </div>
    </div>
  );
}

const appointments = [
  { date: "Vie, 30 May 2024", relative: "En 2 días", time: "09:30", period: "a. m.", specialty: "Cardiología", doctor: "Dr. Ricardo Gómez", license: "CMP 123456", mode: "Presencial", site: "Sede San Isidro", status: "Confirmada", tone: "green" as Tone, icon: HeartPulse },
  { date: "Mar, 03 Jun 2024", relative: "En 6 días", time: "08:00", period: "a. m.", specialty: "Laboratorio Clínico", doctor: "Lab. MEDIQ", license: "—", mode: "Presencial", site: "Sede San Isidro", status: "Pendiente", tone: "amber" as Tone, icon: FlaskConical },
  { date: "Jue, 06 Jun 2024", relative: "En 9 días", time: "10:30", period: "a. m.", specialty: "Ginecología", doctor: "Dra. Laura Pérez", license: "CMP 987654", mode: "Presencial", site: "Sede San Isidro", status: "Confirmada", tone: "green" as Tone, icon: Activity },
  { date: "Sáb, 08 Jun 2024", relative: "En 11 días", time: "04:00", period: "p. m.", specialty: "Medicina General", doctor: "Dr. José Ramírez", license: "CMP 456789", mode: "Teleconsulta", site: "Plataforma MEDIQ", status: "Reprogramada", tone: "blue" as Tone, icon: UserRound },
  { date: "Lun, 10 Jun 2024", relative: "En 13 días", time: "09:00", period: "a. m.", specialty: "Nutrición", doctor: "Lic. Andrea Silva", license: "CNP 3210", mode: "Presencial", site: "Sede San Isidro", status: "Confirmada", tone: "green" as Tone, icon: Waves },
];

function SummaryStat({ icon: Icon, tone, label, value, caption }: { icon: LucideIcon; tone: Tone; label: string; value: string; caption: string }) {
  return (
    <article className="patient-summary-stat">
      <IconBadge icon={Icon} tone={tone} />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{caption}</small>
      </div>
    </article>
  );
}

function AppointmentsTable() {
  const [tab, setTab] = useState("Próximas");
  const [status, setStatus] = useState("Todos los estados");
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <article className="patient-card patient-appointments-table">
      <div className="patient-table-toolbar">
        <div className="patient-tabs" role="tablist" aria-label="Tipos de citas">
          {["Próximas", "Historial", "Canceladas"].map((item) => (
            <button className={tab === item ? "patient-tab patient-tab--active" : "patient-tab"} key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)}>
              {item}
            </button>
          ))}
        </div>
        <div className="patient-filter-actions">
          <label className="patient-select-wrap">
            <span className="sr-only">Filtrar por estado</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option>Todos los estados</option>
              <option>Confirmada</option>
              <option>Pendiente</option>
              <option>Reprogramada</option>
            </select>
            <ChevronDown className="size-3.5" aria-hidden="true" />
          </label>
          <button className="patient-filter-button" type="button" onClick={() => setNotice("Filtro de fecha listo para configurar.")}>
            <CalendarDays className="size-3.5" aria-hidden="true" /> Filtrar por fecha
          </button>
        </div>
      </div>
      <div className="patient-table-scroll">
        <table className="patient-data-table">
          <thead>
            <tr>
              <th>Fecha</th><th>Hora</th><th>Especialidad</th><th>Médico</th><th>Modalidad / Sede</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => {
              const AppointmentIcon = appointment.icon;

              return (
                <tr key={appointment.date}>
                  <td><span className="patient-table-date"><CalendarDays className="size-3.5" aria-hidden="true" /><strong>{appointment.date}</strong><small>{appointment.relative}</small></span></td>
                  <td><strong>{appointment.time}</strong><small>{appointment.period}</small></td>
                  <td><span className="patient-table-specialty"><AppointmentIcon className="size-4" aria-hidden="true" />{appointment.specialty}</span></td>
                  <td><strong>{appointment.doctor}</strong><small className="patient-table-accent">{appointment.license}</small></td>
                  <td><span className="patient-table-location"><MapPin className="size-3.5" aria-hidden="true" /><strong>{appointment.mode}</strong><small>{appointment.site}</small></span></td>
                  <td><span className={`patient-status patient-status--${appointment.tone}`}>{appointment.status}</span></td>
                  <td><button className="patient-table-action" type="button" onClick={() => setNotice(`Acción para ${appointment.date}.`)}>{appointment.status === "Reprogramada" ? "Reprogramar" : "Ver detalle"}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="patient-table-footer">
        <span>Mostrando 5 de 5 citas</span>
        <div className="patient-pagination"><button type="button" aria-label="Página anterior"><ChevronLeft className="size-3.5" /></button><button className="patient-pagination__active" type="button">1</button><button type="button" aria-label="Página siguiente"><ChevronRight className="size-3.5" /></button></div>
      </div>
      {notice ? <button className="patient-inline-notice" type="button" onClick={() => setNotice(null)}>{notice} ×</button> : null}
    </article>
  );
}

function AppointmentHighlight() {
  return (
    <article className="patient-card patient-appointment-highlight">
      <div className="patient-side-heading"><h2>Próxima cita</h2><span>En 2 días</span></div>
      <div className="patient-blue-appointment">
        <div className="patient-blue-appointment__date"><span>Viernes</span><strong>30</strong><small>Mayo</small></div>
        <div className="patient-blue-appointment__info"><div><strong>09:30</strong> <span>a. m.</span></div><p><HeartPulse className="size-3.5" /> Cardiología</p><p><UserRound className="size-3.5" /> Dr. Ricardo Gómez</p><small>CMP 123456</small></div>
        <div className="patient-blue-appointment__location"><MapPin className="size-3.5" /><strong>Sede San Isidro</strong><span>Av. Arequipa 4520, San Isidro, Lima</span></div>
        <div className="patient-blue-appointment__actions"><ActionButton icon={Navigation}>Cómo llegar</ActionButton><ActionButton icon={CalendarDays}>Reprogramar</ActionButton></div>
      </div>
    </article>
  );
}

const calendarDays = [28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1];

function MiniCalendar() {
  return (
    <article className="patient-card patient-calendar">
      <div className="patient-side-heading"><h2>Calendario de citas</h2><div><button type="button" aria-label="Mes anterior"><ChevronLeft className="size-3.5" /></button><strong>Mayo 2024</strong><button type="button" aria-label="Mes siguiente"><ChevronRight className="size-3.5" /></button></div></div>
      <div className="patient-calendar__weekdays">{["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="patient-calendar__grid">{calendarDays.map((day, index) => <span className={`${index < 3 || index === 34 ? "patient-calendar__muted" : ""} ${[5, 7, 9].includes(index) ? "patient-calendar__event" : ""} ${index === 32 ? "patient-calendar__selected" : ""}`} key={`${day}-${index}`}>{day}</span>)}</div>
    </article>
  );
}

function ReminderStrip() {
  const reminders = [
    { title: "Documentos", text: "No olvides traer tu DNI y órdenes médicas.", icon: FileText, tone: "blue" as Tone },
    { title: "Llega 15 min antes", text: "Te ayudará a realizar tu registro sin contratiempos.", icon: Clock3, tone: "green" as Tone },
    { title: "Ayuno para laboratorio", text: "Ayuno de 8-12 horas. Solo agua.", icon: FlaskConical, tone: "violet" as Tone },
    { title: "Teleconsulta", text: "Conéctate 10 min antes. Verifica tu internet.", icon: Video, tone: "blue" as Tone },
  ];

  return (
    <article className="patient-card patient-reminders">
      <SectionTitle title="Recordatorios" />
      <div className="patient-reminders__grid">{reminders.map((reminder) => <div className="patient-reminder" key={reminder.title}><IconBadge icon={reminder.icon} tone={reminder.tone} /><span><strong>{reminder.title}</strong><small>{reminder.text}</small></span></div>)}</div>
    </article>
  );
}

function AppointmentsView() {
  return (
    <div className="patient-page patient-appointments-page">
      <div className="patient-summary-grid">
        <SummaryStat icon={CalendarDays} tone="blue" label="Próximas" value="3" caption="citas programadas" />
        <SummaryStat icon={ShieldCheck} tone="green" label="Confirmadas" value="2" caption="citas confirmadas" />
        <SummaryStat icon={Video} tone="violet" label="Teleconsultas" value="1" caption="programada" />
        <SummaryStat icon={Clock3} tone="amber" label="Pendientes" value="1" caption="por confirmar" />
      </div>
      <div className="patient-appointments-layout">
        <div className="patient-appointments-main"><AppointmentsTable /><ReminderStrip /><HelpStrip /></div>
        <aside className="patient-appointments-side"><AppointmentHighlight /><MiniCalendar /><EpidemiologyCard compact /></aside>
      </div>
    </div>
  );
}

type TriageLevel = "I" | "II" | "III" | "IV" | "V";

const triageLevels: Array<{ id: TriageLevel; title: string; description: string; tone: Tone }> = [
  { id: "I", title: "Resucitación", description: "Riesgo vital inmediato.", tone: "coral" },
  { id: "II", title: "Emergencia", description: "Riesgo alto, atención rápida.", tone: "amber" },
  { id: "III", title: "Urgencia moderada", description: "Evaluación médica prioritaria.", tone: "amber" },
  { id: "IV", title: "Menor urgencia", description: "Puede esperar sin deterioro esperado.", tone: "green" },
  { id: "V", title: "No urgente", description: "Atención programable o remota.", tone: "blue" },
];

function TriageMetric({ icon: Icon, label, value, caption, tone }: { icon: LucideIcon; label: string; value: string; caption: string; tone: Tone }) {
  return <article className="patient-triage-metric"><IconBadge icon={Icon} tone={tone} /><div><span>{label}</span><strong>{value}</strong><small>{caption}</small></div></article>;
}

function TriageView() {
  const [values, setValues] = useState({ temperature: "37.8", pressure: "120/80", oxygen: "97", heartRate: "96", weight: "68", height: "1.68", reason: "Dolor abdominal intermitente desde anoche, náuseas leves y sensación febril. Sin dificultad respiratoria." });
  const [priority, setPriority] = useState<TriageLevel>("III");
  const [formStatus, setFormStatus] = useState("En progreso");

  const selectedLevel = triageLevels.find((level) => level.id === priority) ?? triageLevels[2];

  function updateValue(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function submitTriage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormStatus("Enviado");
  }

  return (
    <div className="patient-page patient-triage-page">
      <section className="patient-triage-banner">
        <div><span className="patient-banner-kicker">NUEVO MÓDULO PACIENTE</span><h2>Formulario de Triaje</h2><p>Registra temperatura, presión arterial, saturación, frecuencia cardiaca, peso, talla, IMC, motivo de consulta y nivel de prioridad. Esta información ayuda a orientar tu atención antes de pasar con recepción o el médico.</p></div>
        <div className="patient-triage-banner__status"><span>Estado del formulario</span><strong>{formStatus}</strong><small>Última actualización: hoy 08:42 · datos guardados localmente.</small></div>
      </section>

      <div className="patient-triage-metrics">
        <TriageMetric icon={Thermometer} tone="blue" label="Temperatura" value={`${values.temperature} °C`} caption="febrícula" />
        <TriageMetric icon={HeartPulse} tone="green" label="Frecuencia" value={`${values.heartRate} bpm`} caption="ligeramente alta" />
        <TriageMetric icon={Activity} tone="violet" label="Saturación" value={`${values.oxygen}%`} caption="estable" />
        <TriageMetric icon={SlidersHorizontal} tone="amber" label="Prioridad sugerida" value="III" caption="urgencia moderada" />
      </div>

      <div className="patient-triage-layout">
        <form className="patient-card patient-triage-form" onSubmit={submitTriage}>
          <div className="patient-form-heading"><div><h2><ClipboardCheck className="size-4" aria-hidden="true" /> Datos de Triaje</h2><p>Completa o confirma los valores antes de enviar.</p></div><span className="patient-form-tag">Paciente</span></div>
          <div className="patient-form-grid">
            <label><span>Temperatura</span><div className="patient-input-suffix"><input value={values.temperature} onChange={(event) => updateValue("temperature", event.target.value)} inputMode="decimal" /><small>°C</small></div></label>
            <label><span>Presión arterial</span><input value={values.pressure} onChange={(event) => updateValue("pressure", event.target.value)} /></label>
            <label><span>Saturación de oxígeno</span><div className="patient-input-suffix"><input value={values.oxygen} onChange={(event) => updateValue("oxygen", event.target.value)} inputMode="numeric" /><small>%</small></div></label>
            <label><span>Frecuencia cardiaca</span><div className="patient-input-suffix"><input value={values.heartRate} onChange={(event) => updateValue("heartRate", event.target.value)} inputMode="numeric" /><small>bpm</small></div></label>
            <label><span>Peso</span><div className="patient-input-suffix"><input value={values.weight} onChange={(event) => updateValue("weight", event.target.value)} inputMode="decimal" /><small>kg</small></div></label>
            <label><span>Talla</span><div className="patient-input-suffix"><input value={values.height} onChange={(event) => updateValue("height", event.target.value)} inputMode="decimal" /><small>m</small></div></label>
            <label><span>IMC</span><input value="24.1 · Normal" readOnly /></label>
            <label><span>Nivel de prioridad</span><select value={priority} onChange={(event) => setPriority(event.target.value as TriageLevel)}>{triageLevels.map((level) => <option value={level.id} key={level.id}>Triage {level.id} · {level.title}</option>)}</select></label>
            <label className="patient-form-field--full"><span>Motivo de consulta</span><textarea value={values.reason} onChange={(event) => updateValue("reason", event.target.value)} rows={3} /></label>
          </div>
          <fieldset className="patient-priority-fieldset"><legend>Escala de prioridad</legend><div className="patient-priority-grid">{triageLevels.map((level) => <button className={`patient-priority-option ${priority === level.id ? "patient-priority-option--selected" : ""} patient-priority-option--${level.tone}`} type="button" key={level.id} onClick={() => setPriority(level.id)}><span><strong>Triage {level.id}</strong><i /></span><small>{level.description}</small></button>)}</div></fieldset>
          <div className="patient-form-actions"><ActionButton onClick={() => setFormStatus("Borrador guardado")}>Guardar borrador</ActionButton><ActionButton variant="primary" type="submit">Enviar Triaje</ActionButton></div>
        </form>

        <aside className="patient-triage-side">
          <article className="patient-card patient-priority-summary"><div className="patient-priority-summary__headline"><span>PRIORIDAD CALCULADA</span><h2>Triage {selectedLevel.id}</h2><p>{selectedLevel.description}</p></div><div className="patient-triage-legend">{triageLevels.map((level) => <div className={`patient-legend-item ${priority === level.id ? "patient-legend-item--selected" : ""}`} key={level.id}><b className={`patient-legend-dot patient-legend-dot--${level.tone}`}>{level.id}</b><span><strong>{level.title}</strong><small>{level.description}</small></span></div>)}</div></article>
          <article className="patient-card patient-patient-summary"><SectionTitle title="Resumen del paciente" /><dl><div><dt>Paciente</dt><dd>Ana Martínez</dd></div><div><dt>Edad</dt><dd>34 años</dd></div><div><dt>Última cita</dt><dd>12 Jun 2026</dd></div><div><dt>Alergias</dt><dd>Penicilina</dd></div><div><dt>Estado</dt><dd><span className="patient-status patient-status--green">Apto para envío</span></dd></div></dl></article>
        </aside>
      </div>
    </div>
  );
}

const resultRows = [
  { study: "Perfil Lipídico Completo", category: "Laboratorio Central", date: "12 May 2024", time: "08:30 a. m.", area: "Cardiología", site: "Lab. MEDIQ", location: "Sede San Isidro", status: "NORMAL", tone: "green" as Tone, icon: FlaskConical, action: "Ver detalle" },
  { study: "Radiografía de Tórax (AP)", category: "Imagenología Médica", date: "05 May 2024", time: "09:15 a. m.", area: "Imagenología", site: "Sede Arequipa", location: "Arequipa", status: "LISTO", tone: "blue" as Tone, icon: Activity, action: "Ver detalle" },
  { study: "Electrocardiograma", category: "Cardiología", date: "28 Abr 2024", time: "10:20 a. m.", area: "Cardiología", site: "Sede San Isidro", location: "San Isidro, Lima", status: "EN REVISIÓN", tone: "amber" as Tone, icon: HeartPulse, action: "download" },
  { study: "Hemograma Completo", category: "Laboratorio Central", date: "20 Abr 2024", time: "07:45 a. m.", area: "Medicina General", site: "Lab. MEDIQ", location: "Sede San Isidro", status: "NORMAL", tone: "green" as Tone, icon: Waves, action: "Ver detalle" },
  { study: "Ecografía Abdominal", category: "Ecografía", date: "10 Abr 2024", time: "11:00 a. m.", area: "Gastroenterología", site: "Sede San Isidro", location: "San Isidro, Lima", status: "PENDIENTE", tone: "amber" as Tone, icon: Activity, action: "download" },
];

function ResultsTable() {
  return (
    <article className="patient-card patient-results-table">
      <div className="patient-table-toolbar patient-table-toolbar--results"><SectionTitle title="Mis Resultados" /><div className="patient-filter-actions"><label className="patient-select-wrap"><span className="sr-only">Filtrar por estado</span><select defaultValue="Todos los estados"><option>Todos los estados</option><option>Normales</option><option>En revisión</option><option>Pendientes</option></select><ChevronDown className="size-3.5" aria-hidden="true" /></label><button className="patient-filter-button" type="button"><CalendarDays className="size-3.5" /> Filtrar por fecha</button></div></div>
      <div className="patient-table-scroll"><table className="patient-data-table patient-data-table--results"><thead><tr><th>Estudio</th><th>Fecha</th><th>Área / Especialidad</th><th>Sede o Laboratorio</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{resultRows.map((result) => <tr key={result.study}><td><span className="patient-result-study"><IconBadge icon={result.icon} tone={result.tone} /><span><strong>{result.study}</strong><small>{result.category}</small></span></span></td><td><strong>{result.date}</strong><small>{result.time}</small></td><td><span className="patient-table-specialty"><HeartPulse className="size-3.5" /> {result.area}</span></td><td><strong>{result.site}</strong><small>{result.location}</small></td><td><span className={`patient-status patient-status--${result.tone}`}>{result.status}</span></td><td>{result.action === "download" ? <button className="patient-small-icon-button" type="button" aria-label={`Descargar ${result.study}`}><ArrowDownToLine className="size-3.5" /></button> : <button className="patient-table-action" type="button">Ver detalle</button>}</td></tr>)}</tbody></table></div>
      <div className="patient-table-footer"><span>Mostrando 5 de 28 resultados</span><div className="patient-pagination"><button type="button" aria-label="Página anterior"><ChevronLeft className="size-3.5" /></button><button className="patient-pagination__active" type="button">1</button><button type="button">2</button><button type="button">3</button><span>…</span><button type="button">6</button><button type="button" aria-label="Página siguiente"><ChevronRight className="size-3.5" /></button></div></div>
    </article>
  );
}

function HighlightedResult() {
  return <article className="patient-card patient-highlighted-result"><SectionTitle title="Resultado destacado" /><div className="patient-highlighted-result__item"><IconBadge icon={FlaskConical} tone="violet" /><div><strong>Perfil Lipídico Completo</strong><span>12 May 2024 · Lab. MEDIQ · 08:30 a. m.</span></div><span className="patient-status patient-status--green">NORMAL</span></div><div className="patient-highlighted-result__interpretation"><strong>Interpretación</strong><p>Tus valores de colesterol total, HDL, LDL y triglicéridos se encuentran dentro de los rangos normales.</p></div><Link className="patient-card-footer-link" href="#detalle-resultado">Ver detalle completo <ArrowRight className="size-3.5" /></Link></article>;
}

function PendingResults() {
  return <article className="patient-card patient-pending-results"><SectionTitle title="Pendientes de revisión" /><div className="patient-pending-item"><IconBadge icon={Clock3} tone="amber" /><div><strong>Electrocardiograma</strong><span>28 Abr 2024 · Sede San Isidro</span></div><span className="patient-status patient-status--amber">EN REVISIÓN</span></div><Link className="patient-card-footer-link" href="#pendientes">Ver todos los pendientes <ArrowRight className="size-3.5" /></Link></article>;
}

function ResultsQuickAccess() {
  const actions = [
    { title: "Descargar todos", text: "Obtén un ZIP con todos tus resultados.", icon: FileDown, tone: "blue" as Tone },
    { title: "Resultados por fecha", text: "Consulta estudios en un rango de fechas.", icon: CalendarCheck, tone: "teal" as Tone },
    { title: "Alertas y notificaciones", text: "Activa recordatorios para nuevos resultados.", icon: Bell, tone: "violet" as Tone },
    { title: "Archivos compartidos", text: "Documentos enviados por tu médico.", icon: FolderOpen, tone: "blue" as Tone },
  ];

  return <article className="patient-card patient-results-quick"><SectionTitle title="Accesos rápidos" /><div className="patient-results-quick__grid">{actions.map((action) => <button className="patient-results-quick__item" type="button" key={action.title}><IconBadge icon={action.icon} tone={action.tone} /><span><strong>{action.title}</strong><small>{action.text}</small></span></button>)}</div></article>;
}

function ResultsView() {
  return (
    <div className="patient-page patient-results-page">
      <div className="patient-summary-grid patient-results-summary-grid">
        <SummaryStat icon={FileText} tone="blue" label="Resultados totales" value="28" caption="Estudios realizados" />
        <SummaryStat icon={CircleCheck} tone="green" label="Normales" value="16" caption="57% del total" />
        <SummaryStat icon={Clock3} tone="amber" label="En revisión" value="6" caption="21% del total" />
        <SummaryStat icon={CircleAlert} tone="violet" label="Pendientes" value="6" caption="22% del total" />
      </div>
      <div className="patient-results-layout"><div className="patient-results-main"><ResultsTable /><HelpStrip /><ResultsQuickAccess /></div><aside className="patient-results-side"><HighlightedResult /><PendingResults /><EpidemiologyCard compact /></aside></div>
    </div>
  );
}

const historyEntries = [
  { date: "Vie, 30 May 2024", time: "09:30 a. m.", title: "Consulta cardiológica", doctor: "Dr. Ricardo Gómez", specialty: "Cardiología", site: "Sede San Isidro", description: "Control rutinario, paciente refiere leve fatiga al hacer ejercicio.", kind: "Consulta", tone: "blue" as Tone, icon: Stethoscope },
  { date: "Mar, 03 Jun 2024", time: "08:00 a. m.", title: "Control prenatal", doctor: "Dra. Laura Pérez", specialty: "Ginecología", site: "Sede San Isidro", description: "Control prenatal, embarazo 24 semanas. Evolución favorable.", kind: "Consulta", tone: "coral" as Tone, icon: Activity },
  { date: "Jue, 06 Jun 2024", time: "10:30 a. m.", title: "Teleconsulta de seguimiento", doctor: "Dr. José Ramírez", specialty: "Medicina General", site: "Plataforma MEDIQ", description: "Seguimiento por resultados de laboratorio. Sin síntomas actuales.", kind: "Teleconsulta", tone: "violet" as Tone, icon: Video },
  { date: "Sáb, 08 Jun 2024", time: "02:45 p. m.", title: "Resultado de laboratorio revisado", doctor: "Lab. MEDIQ", specialty: "Análisis Clínico", site: "Lab. MEDIQ", description: "Exámenes de rutina. Hemograma y perfil bioquímico dentro de rangos.", kind: "Laboratorio", tone: "green" as Tone, icon: FlaskConical },
  { date: "Lun, 10 Jun 2024", time: "09:10 a. m.", title: "Receta emitida", doctor: "Lic. Andrea Silva", specialty: "Nutrición", site: "Sede San Isidro", description: "Plan nutricional personalizado y suplemento de hierro.", kind: "Receta", tone: "amber" as Tone, icon: FileText },
];

function HistoryTimeline() {
  const [tab, setTab] = useState("Todo");

  return (
    <article className="patient-card patient-history-card">
      <div className="patient-history-toolbar">
        <div className="patient-tabs" role="tablist" aria-label="Categorías del historial">
          {["Todo", "Consultas", "Diagnósticos", "Procedimientos", "Documentos"].map((item) => (
            <button className={tab === item ? "patient-tab patient-tab--active" : "patient-tab"} key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)}>
              {item}
            </button>
          ))}
        </div>
        <button className="patient-filter-button" type="button"><CalendarDays className="size-3.5" aria-hidden="true" /> Filtrar por fecha <ChevronDown className="size-3.5" aria-hidden="true" /></button>
      </div>
      <div className="patient-history-list">
        {historyEntries.map((entry) => {
          const EntryIcon = entry.icon;

          return (
            <div className="patient-history-row" key={entry.title}>
              <div className="patient-history-row__date"><strong>{entry.date}</strong><small>{entry.time}</small></div>
              <span className={`patient-history-marker patient-history-marker--${entry.tone}`}><EntryIcon className="size-4" aria-hidden="true" /></span>
              <div className="patient-history-row__content"><strong>{entry.title}</strong><div><span>{entry.doctor}</span><i /> <span>{entry.specialty}</span><i /> <span>{entry.site}</span></div><p>{entry.description}</p></div>
              <span className={`patient-status patient-status--${entry.tone}`}>{entry.kind}</span>
              <button className="patient-table-action" type="button">Ver detalle</button>
            </div>
          );
        })}
      </div>
      <button className="patient-history-load" type="button">Cargar más historial <ChevronDown className="size-3.5" aria-hidden="true" /></button>
    </article>
  );
}

function HealthSummaryCard() {
  const items = [
    { label: "Tipo de sangre", value: "O+", icon: Activity, tone: "coral" as Tone },
    { label: "Alergias", value: "Ninguna conocida", icon: Info, tone: "blue" as Tone },
    { label: "Enfermedades crónicas", value: "Ninguna", icon: HeartPulse, tone: "blue" as Tone },
    { label: "Médico principal", value: "Dr. Ricardo Gómez", extra: "Cardiología", icon: UserRound, tone: "blue" as Tone },
    { label: "Última visita", value: "30 May 2024", extra: "Consulta cardiológica", icon: CalendarDays, tone: "blue" as Tone },
  ];

  return (
    <article className="patient-card patient-health-summary">
      <SectionTitle title="Resumen de salud" />
      <div className="patient-health-summary__list">{items.map((item) => <div className="patient-health-summary__item" key={item.label}><IconBadge icon={item.icon} tone={item.tone} /><span><strong>{item.label}</strong>{item.extra ? <small>{item.extra}</small> : null}</span><b>{item.value}</b></div>)}</div>
    </article>
  );
}

function NextControlCard() {
  return (
    <article className="patient-card patient-next-control">
      <div className="patient-side-heading"><h2>Próximo control</h2><span>En 12 días</span></div>
      <div className="patient-next-control__body"><IconBadge icon={CalendarDays} tone="blue" /><div><strong>Mié, 12 Jun 2024 · 10:00 a. m.</strong><b>Control prenatal</b><small>Dra. Laura Pérez · Ginecología<br />Sede San Isidro</small></div></div>
      <Link className="patient-table-action" href="/patient/citas">Ver en Mis Citas</Link>
    </article>
  );
}

function HistoryView() {
  return (
    <div className="patient-page patient-history-page">
      <div className="patient-summary-grid">
        <SummaryStat icon={Stethoscope} tone="blue" label="Consultas registradas" value="18" caption="Últimos 12 meses" />
        <SummaryStat icon={ShieldCheck} tone="green" label="Diagnósticos activos" value="2" caption="En seguimiento" />
        <SummaryStat icon={UserRound} tone="violet" label="Especialidades atendidas" value="5" caption="En total" />
        <SummaryStat icon={FolderOpen} tone="amber" label="Documentos clínicos" value="12" caption="Disponibles" />
      </div>
      <div className="patient-history-layout">
        <div className="patient-history-main"><HistoryTimeline /><HelpStrip /></div>
        <aside className="patient-history-side"><HealthSummaryCard /><EpidemiologyCard compact /><NextControlCard /></aside>
      </div>
    </div>
  );
}

const prescriptionRows = [
  { name: "Enalapril 10 mg", quantity: "30 comprimidos", doctor: "Dr. Ricardo Gómez", license: "CMP 123456", specialty: "Cardiología", date: "22 May 2024", dose: "1 comprimido cada 12 horas", next: "Hoy, 20:00", status: "Activa", tone: "green" as Tone, icon: Paperclip },
  { name: "Atorvastatina 20 mg", quantity: "30 comprimidos", doctor: "Dr. Ricardo Gómez", license: "CMP 123456", specialty: "Cardiología", date: "20 May 2024", dose: "1 comprimido por la noche", next: "Hoy, 22:30", status: "Activa", tone: "green" as Tone, icon: Pill },
  { name: "Aspirina 100 mg", quantity: "30 comprimidos", doctor: "Dra. Laura Pérez", license: "CMP 987654", specialty: "Ginecología", date: "18 May 2024", dose: "1 comprimido después del almuerzo", next: "Mañana, 13:00", status: "Por renovar", tone: "amber" as Tone, icon: Activity },
  { name: "Omeprazol 20 mg", quantity: "14 cápsulas", doctor: "Dr. José Ramírez", license: "CMP 456789", specialty: "Gastroenterología", date: "15 May 2024", dose: "1 cápsula antes del desayuno", next: "Mañana, 08:00", status: "Activa", tone: "green" as Tone, icon: RefreshCw },
  { name: "Salbutamol 100 mcg", quantity: "Inhalador 200 dosis", doctor: "Dra. María Torres", license: "CMP 741258", specialty: "Neumología", date: "10 May 2024", dose: "2 inhalaciones cada 8 horas según necesidad", next: "Según necesidad", status: "Completada", tone: "blue" as Tone, icon: Waves },
];

function PrescriptionsTable() {
  return (
    <article className="patient-card patient-prescriptions-table">
      <div className="patient-table-toolbar patient-table-toolbar--results"><SectionTitle title="Mis Recetas" /><div className="patient-filter-actions"><label className="patient-select-wrap"><span className="sr-only">Filtrar recetas</span><select defaultValue="Todas las recetas"><option>Todas las recetas</option><option>Activas</option><option>Por renovar</option><option>Completadas</option></select><ChevronDown className="size-3.5" aria-hidden="true" /></label><button className="patient-filter-button" type="button"><CalendarDays className="size-3.5" aria-hidden="true" /> Filtrar por fecha</button></div></div>
      <div className="patient-table-scroll"><table className="patient-data-table patient-data-table--prescriptions"><thead><tr><th>Medicamento</th><th>Médico</th><th>Especialidad</th><th>Fecha de emisión</th><th>Dosis / Instrucciones</th><th>Próxima dosis / Duración</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{prescriptionRows.map((prescription) => <tr key={prescription.name}><td><span className="patient-result-study"><IconBadge icon={prescription.icon} tone={prescription.tone} /><span><strong>{prescription.name}</strong><small>{prescription.quantity}</small></span></span></td><td><strong>{prescription.doctor}</strong><small className="patient-table-accent">{prescription.license}</small></td><td><span className="patient-table-specialty"><HeartPulse className="size-3.5" /> {prescription.specialty}</span></td><td><strong>{prescription.date}</strong></td><td><strong>{prescription.dose}</strong></td><td><strong>{prescription.next}</strong></td><td><span className={`patient-status patient-status--${prescription.tone}`}>{prescription.status}</span></td><td><div className="patient-prescription-actions"><button className="patient-table-action" type="button">Ver detalle</button>{prescription.status === "Por renovar" ? <button className="patient-table-action" type="button">Solicitar renovación</button> : <button className="patient-small-icon-button" type="button" aria-label={`Descargar ${prescription.name}`}><Download className="size-3.5" /></button>}</div></td></tr>)}</tbody></table></div>
      <div className="patient-table-footer"><span>Mostrando 5 de 5 recetas</span><div className="patient-pagination"><button type="button" aria-label="Página anterior">‹</button><button className="patient-pagination__active" type="button">1</button><button type="button" aria-label="Página siguiente">›</button></div></div>
    </article>
  );
}

function FeaturedPrescription() {
  return <article className="patient-card patient-featured-prescription"><SectionTitle title="Receta destacada" /><div className="patient-featured-prescription__body"><IconBadge icon={Paperclip} tone="blue" /><div><strong>Enalapril 10 mg</strong><span>Dr. Ricardo Gómez · Cardiología</span><small>Emitida: 22 May 2024</small></div><span className="patient-status patient-status--green">Activa</span></div><div className="patient-featured-prescription__indication"><strong>Indicación</strong><p>Control de la presión arterial.</p></div><Link className="patient-card-footer-link" href="#receta">Ver receta completa <ArrowRight className="size-3.5" /></Link></article>;
}

function MedicationReminders() {
  const reminders = [
    { time: "08:00 a. m.", medicine: "Omeprazol 20 mg", icon: Clock3, tone: "blue" as Tone },
    { time: "01:00 p. m.", medicine: "Aspirina 100 mg", icon: Clock3, tone: "coral" as Tone },
    { time: "08:00 p. m.", medicine: "Enalapril 10 mg", icon: Paperclip, tone: "blue" as Tone },
  ];

  return <article className="patient-card patient-medication-reminders"><div className="patient-side-heading"><h2>Recordatorios de medicación</h2><Link className="patient-text-link" href="#horarios">Configurar horarios</Link></div><div className="patient-medication-reminders__list">{reminders.map((reminder) => <div className="patient-medication-reminder" key={reminder.time}><IconBadge icon={reminder.icon} tone={reminder.tone} /><span><strong>{reminder.time}</strong><small>{reminder.medicine}</small></span><span className="patient-status patient-status--green">Activo</span></div>)}</div><Link className="patient-card-footer-link" href="#recordatorios">Ver todos los recordatorios <ArrowRight className="size-3.5" /></Link></article>;
}

function PrescriptionsQuickAccess() {
  const actions = [
    { title: "Descargar todas", text: "Obtén un PDF con todas tus recetas.", icon: FileDown, tone: "blue" as Tone },
    { title: "Renovar recetas", text: "Solicita la renovación de tus medicamentos.", icon: RefreshCw, tone: "green" as Tone },
    { title: "Alertas y notificaciones", text: "Activa recordatorios para no olvidar tus dosis.", icon: Bell, tone: "violet" as Tone },
    { title: "Historial de recetas", text: "Revisa tus recetas anteriores.", icon: Clock3, tone: "blue" as Tone },
  ];

  return <article className="patient-card patient-results-quick"><SectionTitle title="Accesos rápidos" /><div className="patient-results-quick__grid">{actions.map((action) => <button className="patient-results-quick__item" type="button" key={action.title}><IconBadge icon={action.icon} tone={action.tone} /><span><strong>{action.title}</strong><small>{action.text}</small></span></button>)}</div></article>;
}

function PrescriptionsView() {
  return (
    <div className="patient-page patient-prescriptions-page">
      <div className="patient-summary-grid">
        <SummaryStat icon={FileText} tone="blue" label="Recetas activas" value="4" caption="100% del total" />
        <SummaryStat icon={Clock3} tone="amber" label="Por renovar" value="2" caption="50% del total" />
        <SummaryStat icon={CircleCheck} tone="green" label="Completadas" value="12" caption="80% del total" />
        <SummaryStat icon={FlaskConical} tone="violet" label="Pendientes" value="1" caption="Para validar" />
      </div>
      <div className="patient-prescriptions-layout"><div className="patient-prescriptions-main"><PrescriptionsTable /><PrescriptionsQuickAccess /><HelpStrip /></div><aside className="patient-prescriptions-side"><FeaturedPrescription /><MedicationReminders /><EpidemiologyCard compact /></aside></div>
    </div>
  );
}

function EpidemiologyStatusPanel() {
  return (
    <article className="patient-card patient-epi-status-card">
      <div className="patient-epi-status-card__header"><h2>Estado epidemiológico personal y de tu zona</h2><span>Última actualización: Hoy, 08:30 a. m. <RefreshCw className="size-3.5" aria-hidden="true" /></span></div>
      <div className="patient-epi-status-card__split"><div className="patient-epi-status-card__copy"><div className="patient-epi-risk-title"><ShieldCheck className="size-8" strokeWidth={1.8} /><div><strong>Riesgo bajo</strong><b>Lima / San Isidro</b></div></div><p>Las condiciones epidemiológicas actuales muestran un riesgo bajo de enfermedades transmisibles en tu zona.</p><div className="patient-epi-info"><Info className="size-4" /><span>La IA analiza datos oficiales, tendencias regionales y tu perfil para ofrecerte recomendaciones personalizadas.</span></div></div><div className="patient-epi-map" role="img" aria-label="Mapa simplificado de la zona de San Isidro"><span className="patient-map-line patient-map-line--one" /><span className="patient-map-line patient-map-line--two" /><span className="patient-map-line patient-map-line--three" /><span className="patient-map-block patient-map-block--one" /><span className="patient-map-block patient-map-block--two" /><span className="patient-map-block patient-map-block--three" /><span className="patient-map-label">San Isidro, Lima</span><span className="patient-map-marker"><ShieldCheck className="size-8" /></span></div></div>
      <Link className="patient-card-footer-link" href="#zona">Ver detalle de tu zona <ArrowRight className="size-3.5" /></Link>
    </article>
  );
}

function EpidemiologyRecommendations() {
  const recommendations = [
    { title: "Hidratación", text: "Bebe suficiente agua durante el día.", icon: Waves, tone: "blue" as Tone },
    { title: "Lavado de manos", text: "Lávalas con frecuencia por al menos 20 seg.", icon: ShieldCheck, tone: "green" as Tone },
    { title: "Controles al día", text: "Mantén tus controles médicos al día.", icon: Stethoscope, tone: "violet" as Tone },
    { title: "Vacunación", text: "Revisa tus vacunas pendientes.", icon: Syringe, tone: "amber" as Tone },
  ];

  return <article className="patient-card patient-epi-recommendations"><SectionTitle title="Recomendaciones personalizadas" /><div className="patient-epi-recommendations__grid">{recommendations.map((recommendation) => <div className="patient-epi-recommendation" key={recommendation.title}><IconBadge icon={recommendation.icon} tone={recommendation.tone} /><strong>{recommendation.title}</strong><small>{recommendation.text}</small></div>)}</div><Link className="patient-card-footer-link" href="#recomendaciones">Ver todas las recomendaciones <ArrowRight className="size-3.5" /></Link></article>;
}

function MonitoredAlerts() {
  const alerts = [
    { title: "Infecciones respiratorias (IRAs)", text: "Aumento leve de casos", status: "Leve", tone: "amber" as Tone, icon: Activity },
    { title: "Dengue", text: "Sin incremento significativo", status: "Bajo", tone: "green" as Tone, icon: AlertTriangle },
    { title: "Enfermedades gastrointestinales", text: "Situación estable", status: "Bajo", tone: "green" as Tone, icon: Activity },
  ];

  return <article className="patient-card patient-monitored-alerts"><SectionTitle title="Alertas o brotes monitoreados" /><div className="patient-monitored-alerts__list">{alerts.map((alert) => <div className="patient-monitored-alert" key={alert.title}><IconBadge icon={alert.icon} tone={alert.tone === "amber" ? "blue" : "green"} /><span><strong>{alert.title}</strong><small>{alert.text}</small></span><span className={`patient-status patient-status--${alert.tone}`}>{alert.status}</span></div>)}</div><Link className="patient-card-footer-link" href="#reportes">Ver todos los reportes <ArrowRight className="size-3.5" /></Link></article>;
}

function RiskProfileCard() {
  return <article className="patient-card patient-risk-profile"><div className="patient-side-heading"><h2>Tu perfil de riesgo</h2><span>Bajo</span></div><p>De acuerdo con tu información y hábitos actuales, tu riesgo personal es bajo.</p><dl><div><dt><UserRound className="size-3.5" /> Edad</dt><dd>32 años</dd></div><div><dt><ShieldCheck className="size-3.5" /> Condiciones crónicas</dt><dd>Ninguna reportada</dd></div><div><dt><Syringe className="size-3.5" /> Vacunación</dt><dd>Al día (4/5)</dd></div><div><dt><UserRound className="size-3.5" /> Hábitos y estilo de vida</dt><dd className="patient-text-green">Saludable</dd></div></dl><Link className="patient-card-footer-link" href="#perfil">Ver más detalles <ArrowRight className="size-3.5" /></Link></article>;
}

function ConsideredFactorsCard() {
  const factors = ["Datos oficiales (MINSA, CDC, DGE)", "Tendencias locales y regionales", "Estación y clima actual", "Tu historial clínico y vacunas", "Hábitos y estilo de vida"];
  return <article className="patient-card patient-considered-factors"><SectionTitle title="Factores considerados" /><ul>{factors.map((factor) => <li key={factor}><CircleCheck className="size-3.5" aria-hidden="true" />{factor}</li>)}</ul><Link className="patient-card-footer-link" href="#calculo">¿Cómo calculamos tu riesgo? <ArrowRight className="size-3.5" /></Link></article>;
}

function PreventionContactCard() {
  return <article className="patient-card patient-prevention-contact"><SectionTitle title="Contacto de prevención" /><div><IconBadge icon={MessageCircle} tone="blue" /><span><strong>¿Tienes dudas o necesitas orientación?</strong><small>Nuestro equipo de prevención está para ayudarte.</small></span></div><strong className="patient-prevention-phone">⌕ &nbsp; (01) 700 1234</strong><button className="patient-whatsapp-button" type="button"><MessageCircle className="size-4" /> Contactar por WhatsApp</button></article>;
}

function EpidemiologyView() {
  return (
    <div className="patient-page patient-epidemiology-page">
      <div className="patient-summary-grid patient-epi-summary-grid">
        <SummaryStat icon={ShieldCheck} tone="green" label="Riesgo actual" value="Bajo" caption="En tu zona y para ti" />
        <SummaryStat icon={AlertTriangle} tone="amber" label="Alertas en tu zona" value="1" caption="Leves" />
        <SummaryStat icon={Syringe} tone="blue" label="Vacunas al día" value="4 / 5" caption="Revisa tus pendientes" />
        <SummaryStat icon={Activity} tone="violet" label="Seguimiento preventivo" value="Al día" caption="Último check: 12 May 2024" />
      </div>
      <div className="patient-epidemiology-layout"><div className="patient-epidemiology-main"><EpidemiologyStatusPanel /><div className="patient-epi-bottom-grid"><EpidemiologyRecommendations /><MonitoredAlerts /></div><HelpStrip /></div><aside className="patient-epidemiology-side"><RiskProfileCard /><ConsideredFactorsCard /><PreventionContactCard /></aside></div>
    </div>
  );
}

function MembershipHero() {
  return (
    <article className="patient-membership-hero">
      <div className="patient-membership-hero__copy"><span className="patient-membership-kicker"><ShieldCheck className="size-3.5" /> Membresía activa</span><h2>MEDIQ Plan Pro</h2><p>Accede a citas prioritarias, descuentos en estudios, recordatorios preventivos e IA Epidemiológica personalizada para tu cuidado continuo.</p><div className="patient-membership-hero__actions"><ActionButton variant="primary" icon={RefreshCw}>Gestionar plan</ActionButton><ActionButton icon={Download}>Descargar comprobante</ActionButton></div></div>
      <div className="patient-membership-hero__details"><div><span>Titular</span><strong>Ana Martínez</strong></div><div><span>Cobertura</span><strong>3 miembros</strong></div><div><span>Beneficios usados</span><strong className="patient-text-green">8 este mes</strong></div><div><span>Próximo cargo</span><strong>S/ 89.00</strong></div></div>
    </article>
  );
}

function MembershipBenefits() {
  const benefits = [
    { title: "Citas prioritarias", text: "Reservas preferentes en especialidades seleccionadas.", icon: CalendarDays, tone: "blue" as Tone },
    { title: "Teleorientación", text: "Atención remota para dudas preventivas y seguimiento.", icon: Video, tone: "green" as Tone },
    { title: "Laboratorio con descuento", text: "Hasta 25% en análisis clínicos y estudios frecuentes.", icon: FlaskConical, tone: "violet" as Tone },
    { title: "Resultados digitales", text: "Historial y documentos disponibles desde tu panel.", icon: FileText, tone: "amber" as Tone },
    { title: "IA Epidemiológica", text: "Alertas por zona y recomendaciones preventivas.", icon: Activity, tone: "teal" as Tone },
    { title: "Soporte WhatsApp", text: "Centro de atención para consultas de membresía.", icon: MessageCircle, tone: "coral" as Tone },
  ];

  return <article className="patient-card patient-membership-benefits"><SectionTitle title="Beneficios incluidos" action="Ver condiciones" actionHref="#condiciones" /><div className="patient-membership-benefits__grid">{benefits.map((benefit) => <div className="patient-membership-benefit" key={benefit.title}><IconBadge icon={benefit.icon} tone={benefit.tone} /><span><strong>{benefit.title}</strong><small>{benefit.text}</small></span></div>)}</div></article>;
}

function MonthlyUsage() {
  const usage = [
    { label: "Citas prioritarias", detail: "3 de 5 disponibles", value: "60%", tone: "blue" },
    { label: "Descuentos en estudios", detail: "S/ 126 ahorrados", value: "75%", tone: "green" },
    { label: "Teleorientaciones", detail: "1 de 2 utilizadas", value: "50%", tone: "amber" },
    { label: "Alertas preventivas", detail: "4 recomendaciones vistas", value: "90%", tone: "green" },
  ];

  return <article className="patient-card patient-monthly-usage"><div className="patient-side-heading"><h2>Uso del mes</h2><span>Junio</span></div><div className="patient-usage-list">{usage.map((item) => <div className="patient-usage-row" key={item.label}><div><strong>{item.label}</strong><small>{item.detail}</small></div><span><i className={`patient-usage-bar patient-usage-bar--${item.tone}`} style={{ width: item.value }} /></span></div>)}</div></article>;
}

function MembershipBilling() {
  return <article className="patient-card patient-membership-billing"><SectionTitle title="Pagos y facturación" action="Ver todo" actionHref="#pagos" /><div className="patient-billing-list"><div className="patient-billing-row"><IconBadge icon={CircleCheck} tone="green" /><span><strong>15 May 2024</strong><small>Membresía MEDIQ Plus</small></span><b>S/ 89.00 <em className="patient-status patient-status--green">Pagado</em></b></div><div className="patient-billing-row"><IconBadge icon={CreditCard} tone="blue" /><span><strong>15 Jun 2024</strong><small>Próxima renovación automática</small></span><b>S/ 89.00 <em className="patient-status patient-status--amber">Programado</em></b></div><div className="patient-billing-row"><IconBadge icon={Download} tone="violet" /><span><strong>Comprobantes</strong><small>Descarga tus recibos mensuales</small></span><button className="patient-table-action" type="button">Descargar</button></div></div></article>;
}

function MembershipPlanSummary() {
  return <article className="patient-card patient-membership-plan-summary"><div className="patient-side-heading"><h2>Resumen del plan</h2><span>Activa</span></div><strong className="patient-membership-price">S/ 89<small>/mes</small></strong><p>Tu membresía se renovará automáticamente. Puedes cambiar el método de pago o cancelar la renovación desde configuración.</p><dl><div><dt><CreditCard className="size-3.5" /> Método de pago</dt><dd>Visa 2841</dd></div><div><dt><CalendarDays className="size-3.5" /> Próxima renovación</dt><dd>15 Jun</dd></div><div><dt><ShieldCheck className="size-3.5" /> Cobertura activa</dt><dd>3 personas</dd></div></dl></article>;
}

function CoveredMembers() {
  const members = [
    { initials: "AM", name: "Ana Martínez", role: "Titular", tone: "coral" as Tone, status: "Activa" },
    { initials: "LM", name: "Luis Martínez", role: "Familiar", tone: "teal" as Tone, status: "Activa" },
    { initials: "CM", name: "Camila Martínez", role: "Familiar", tone: "blue" as Tone, status: "Pendiente" },
  ];

  return <article className="patient-card patient-covered-members"><div className="patient-side-heading"><h2>Miembros cubiertos</h2><Link className="patient-text-link" href="#agregar">Agregar</Link></div><div className="patient-covered-list">{members.map((member) => <div className="patient-covered-member" key={member.name}><span className={`patient-member-avatar patient-member-avatar--${member.tone}`}>{member.initials}</span><span><strong>{member.name}</strong><small>{member.role}</small></span><b className={`patient-status patient-status--${member.status === "Pendiente" ? "blue" : "green"}`}>{member.status}</b></div>)}</div></article>;
}

function MembershipRecommendation() {
  return <article className="patient-card patient-membership-recommendation"><h2><ShieldCheck className="size-4" /> Recomendación MEDIQ</h2><strong>Mantén tu plan familiar</strong><p>Por tu frecuencia de citas y resultados, el plan Plus Familiar mantiene mejor ahorro que pagar servicios individuales.</p><button className="patient-table-action" type="button"><Activity className="size-3.5" /> Ver comparación</button></article>;
}

function MembershipSupport() {
  return <article className="patient-card patient-membership-support"><SectionTitle title="Soporte de membresía" /><p>Resuelve dudas sobre pagos, beneficios o cobertura con nuestro equipo de atención.</p><button className="patient-whatsapp-button" type="button"><MessageCircle className="size-4" /> Contactar por WhatsApp</button></article>;
}

function MembershipView() {
  return (
    <div className="patient-page patient-membership-page">
      <div className="patient-summary-grid patient-membership-summary-grid"><SummaryStat icon={CreditCard} tone="blue" label="Plan actual" value="Plus" caption="MEDIQ Familiar" /><SummaryStat icon={CircleCheck} tone="green" label="Estado" value="Activa" caption="Sin pagos pendientes" /><SummaryStat icon={CalendarDays} tone="amber" label="Renovación" value="15 Jun" caption="S/ 89.00 mensual" /><SummaryStat icon={Activity} tone="violet" label="Ahorro acumulado" value="S/ 486" caption="Este año" /></div>
      <div className="patient-membership-layout"><div className="patient-membership-main"><MembershipHero /><MembershipBenefits /><div className="patient-membership-bottom-grid"><MonthlyUsage /><MembershipBilling /></div><HelpStrip /></div><aside className="patient-membership-side"><MembershipPlanSummary /><CoveredMembers /><MembershipRecommendation /><MembershipSupport /></aside></div>
    </div>
  );
}

type ProfileValues = {
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  birthCountry: string;
  bloodType: string;
  documentType: string;
  documentNumber: string;
  fileNumber: string;
  insurer: string;
  policy: string;
  plan: string;
  countryCode: string;
  mobile: string;
  landline: string;
  email: string;
  address: string;
  country: string;
  region: string;
  city: string;
  postalCode: string;
};

function ProfileField({ label, value, onChange, type = "text", options }: { label: string; value: string; onChange: (value: string) => void; type?: string; options?: string[] }) {
  return <label className="patient-profile-field"><span>{label}</span>{options ? <select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select> : <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />}</label>;
}

function ProfileAvatarCard() {
  return <div className="patient-profile-avatar-column"><span className="patient-profile-avatar"><span className="patient-avatar__hair" /><span className="patient-avatar__face">AM</span><span className="patient-avatar__shirt" /></span><button className="patient-table-action" type="button"><Camera className="size-3.5" /> Cambiar foto</button><small>Formatos permitidos: JPG, PNG y WEBP</small></div>;
}

function ProfilePersonalCard({ values, update }: { values: ProfileValues; update: (field: keyof ProfileValues, value: string) => void }) {
  return <article className="patient-card patient-profile-personal"><div className="patient-profile-card-heading"><h2>Información del paciente</h2><button className="patient-form-tag" type="button"><Camera className="size-3.5" /> Editar foto</button></div><div className="patient-profile-personal__body"><ProfileAvatarCard /><div className="patient-profile-form-grid"><ProfileField label="Nombres" value={values.firstName} onChange={(value) => update("firstName", value)} /><ProfileField label="Apellidos" value={values.lastName} onChange={(value) => update("lastName", value)} /><ProfileField label="Género" value={values.gender} options={["Femenino", "Masculino", "Prefiero no decirlo"]} onChange={(value) => update("gender", value)} /><ProfileField label="Fecha de nacimiento" type="date" value={values.birthDate} onChange={(value) => update("birthDate", value)} /><ProfileField label="País de nacimiento" value={values.birthCountry} options={["Perú", "Colombia", "México"]} onChange={(value) => update("birthCountry", value)} /><ProfileField label="Grupo sanguíneo" value={values.bloodType} options={["O+", "O-", "A+", "A-", "B+", "AB+"]} onChange={(value) => update("bloodType", value)} /><ProfileField label="Tipo de documento" value={values.documentType} options={["DNI", "Pasaporte", "Carné de extranjería"]} onChange={(value) => update("documentType", value)} /><ProfileField label="Número de documento" value={values.documentNumber} onChange={(value) => update("documentNumber", value)} /><ProfileField label="N° de expediente" value={values.fileNumber} onChange={(value) => update("fileNumber", value)} /><ProfileField label="Empresa / Seguro" value={values.insurer} options={["Rimac Seguros", "Pacífico", "Mapfre"]} onChange={(value) => update("insurer", value)} /><ProfileField label="Póliza / Afiliado N°" value={values.policy} onChange={(value) => update("policy", value)} /><ProfileField label="Plan" value={values.plan} options={["EPS Rimac", "Plan Familiar", "Particular"]} onChange={(value) => update("plan", value)} /></div></div></article>;
}

function ProfileContactCard({ values, update }: { values: ProfileValues; update: (field: keyof ProfileValues, value: string) => void }) {
  return <article className="patient-card patient-profile-contact"><div className="patient-profile-card-heading"><h2>Información de contacto</h2></div><div className="patient-profile-contact-grid"><ProfileField label="Código de país" value={values.countryCode} options={["🇵🇪  +51", "🇨🇴  +57", "🇲🇽  +52"]} onChange={(value) => update("countryCode", value)} /><ProfileField label="Celular" value={values.mobile} onChange={(value) => update("mobile", value)} /><ProfileField label="Teléfono fijo (opcional)" value={values.landline} onChange={(value) => update("landline", value)} /><ProfileField label="Correo electrónico" value={values.email} type="email" onChange={(value) => update("email", value)} /><ProfileField label="Dirección" value={values.address} onChange={(value) => update("address", value)} /><ProfileField label="País" value={values.country} options={["Perú", "Colombia", "México"]} onChange={(value) => update("country", value)} /><ProfileField label="Estado / Provincia" value={values.region} options={["Lima", "Arequipa", "Cusco"]} onChange={(value) => update("region", value)} /><ProfileField label="Ciudad / Localidad" value={values.city} options={["San Isidro", "Miraflores", "Surco"]} onChange={(value) => update("city", value)} /><ProfileField label="Código postal" value={values.postalCode} onChange={(value) => update("postalCode", value)} /></div></article>;
}

function EmergencyContactCard() {
  return <article className="patient-card patient-emergency-contact"><div className="patient-profile-card-heading"><h2>Contacto de emergencia</h2></div><div className="patient-emergency-grid"><ProfileField label="Nombre completo" value="Carlos Martínez" onChange={() => undefined} /><ProfileField label="Parentesco" value="Esposo" options={["Esposo", "Madre", "Padre", "Hermano"]} onChange={() => undefined} /><ProfileField label="Teléfono" value="+51 912 345 678" onChange={() => undefined} /></div><p><Info className="size-3.5" /> Se utilizará en caso de emergencias o para coordinar tu atención.</p></article>;
}

function ProfileSecurityCard({ onSave }: { onSave: () => void }) {
  const [notifications, setNotifications] = useState(true);
  const [emailReminders, setEmailReminders] = useState(true);

  return <article className="patient-card patient-security-card"><div className="patient-profile-card-heading"><h2>Preferencias y seguridad</h2></div><div className="patient-security-list"><div><Bell className="size-3.5" /><span><strong>Recibir notificaciones</strong><small>Recordatorios de citas, resultados y novedades.</small></span><button className={`patient-toggle ${notifications ? "patient-toggle--on" : ""}`} type="button" aria-pressed={notifications} onClick={() => setNotifications((current) => !current)}><i /></button></div><div><Mail className="size-3.5" /><span><strong>Recordatorios por correo</strong><small>Recibe recordatorios y confirmaciones por email.</small></span><button className={`patient-toggle ${emailReminders ? "patient-toggle--on" : ""}`} type="button" aria-pressed={emailReminders} onClick={() => setEmailReminders((current) => !current)}><i /></button></div><div><GlobeIcon /><span><strong>Idioma</strong></span><select defaultValue="Español"><option>Español</option><option>English</option></select></div><div><LockKeyhole className="size-3.5" /><span><strong>Cambiar contraseña</strong></span><button className="patient-table-action" type="button">Cambiar</button></div></div><div className="patient-profile-actions"><button className="patient-action-button" type="button">Cancelar</button><ActionButton variant="primary" icon={Save} onClick={onSave}>Guardar cambios</ActionButton></div></article>;
}

function GlobeIcon() {
  return <span className="patient-globe-icon" aria-hidden="true">◎</span>;
}

function ProfileSummaryCard() {
  const items = [
    { label: "Nombre completo", value: "Ana Martínez García", icon: UserRound },
    { label: "Fecha de nacimiento", value: "15/08/1987 (36 años)", icon: CalendarDays },
    { label: "Documento", value: "DNI 44021456", icon: FileText },
    { label: "Grupo sanguíneo", value: "O+", icon: Activity },
    { label: "N° de expediente", value: "EXP-2024-44021", icon: ClipboardCheck },
  ];

  return <article className="patient-card patient-profile-summary"><SectionTitle title="Resumen personal" /><div>{items.map((item) => <div key={item.label}><item.icon className="size-3.5" /><span>{item.label}</span><strong>{item.value}</strong></div>)}</div><Link className="patient-card-footer-link" href="#informacion-medica">Ver información médica <ArrowRight className="size-3.5" /></Link></article>;
}

function InsuranceCard() {
  return <article className="patient-card patient-insurance-card"><div className="patient-side-heading"><h2>Cobertura y seguro</h2><span>ACTIVO</span></div><div className="patient-insurance-body"><strong>RIMAC</strong><span><b>Rimac Seguros</b><small>Plan: EPS Rimac<br />Póliza / Afiliado: 1234567890</small></span></div><Link className="patient-card-footer-link" href="#cobertura">Ver detalles de cobertura <ArrowRight className="size-3.5" /></Link></article>;
}

function ProfileView() {
  const [values, setValues] = useState<ProfileValues>({ firstName: "Ana", lastName: "Martínez García", gender: "Femenino", birthDate: "1987-08-15", birthCountry: "Perú", bloodType: "O+", documentType: "DNI", documentNumber: "44021456", fileNumber: "EXP-2024-44021", insurer: "Rimac Seguros", policy: "1234567890", plan: "EPS Rimac", countryCode: "🇵🇪  +51", mobile: "987 654 321", landline: "01 234 5678", email: "ana.martinez@gmail.com", address: "Av. Arequipa 4520, Dpto 402, San Isidro", country: "Perú", region: "Lima", city: "San Isidro", postalCode: "15036" });
  const [saved, setSaved] = useState(false);

  function update(field: keyof ProfileValues, value: string) {
    setSaved(false);
    setValues((current) => ({ ...current, [field]: value }));
  }

  return <div className="patient-page patient-profile-page"><form onSubmit={(event) => { event.preventDefault(); setSaved(true); }}><div className="patient-profile-layout"><div className="patient-profile-main"><ProfilePersonalCard values={values} update={update} /><ProfileContactCard values={values} update={update} /><div className="patient-profile-bottom-grid"><EmergencyContactCard /><ProfileSecurityCard onSave={() => setSaved(true)} /></div></div><aside className="patient-profile-side"><ProfileSummaryCard /><InsuranceCard /><EpidemiologyCard compact /><div className="patient-profile-help"><HelpStrip /></div></aside></div>{saved ? <button className="patient-profile-saved" type="button" onClick={() => setSaved(false)}>Cambios guardados correctamente ×</button> : null}</form></div>;
}

export function PatientPortalView({ user, view }: { user: AuthenticatedUser; view: PatientView }) {
  void user;

  switch (view) {
    case "appointments":
      return <AppointmentsView />;
    case "triage":
      return <TriageView />;
    case "results":
      return <ResultsView />;
    case "history":
      return <HistoryView />;
    case "prescriptions":
      return <PrescriptionsView />;
    case "epidemiology":
      return <EpidemiologyView />;
    case "membership":
      return <MembershipView />;
    case "profile":
      return <ProfileView />;
    case "dashboard":
    default:
      return <DashboardView />;
  }
}

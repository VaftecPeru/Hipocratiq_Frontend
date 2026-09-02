import { CalendarDays, FilePenLine, Headphones, LockKeyhole, ShieldCheck, Stethoscope } from "lucide-react";
import Link from "next/link";
import { DoctorProfileSettings } from "@/features/doctors/ui/doctor-profile-settings";
import { DoctorPreferencesSettings } from "@/features/doctors/ui/doctor-preferences-settings";
import { DoctorCard, StatusBadge } from "@/features/doctors/ui/doctor-primitives";

function InfoCard({
  icon: Icon,
  title,
  children,
}: Readonly<{ icon: typeof ShieldCheck; title: string; children: React.ReactNode }>) {
  return (
    <DoctorCard className="p-4">
      <div className="flex items-center gap-2 border-b border-line pb-3">
        <span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent"><Icon className="size-4" aria-hidden="true" /></span>
        <h2 className="text-[0.82rem] font-extrabold">{title}</h2>
      </div>
      <div className="mt-3 text-[0.62rem] font-bold leading-5 text-ink-secondary">{children}</div>
    </DoctorCard>
  );
}

export default function DoctorSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      <header className="mb-5">
        <h1 className="text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.65rem]">Configuración</h1>
        <p className="mt-1 text-[0.68rem] font-bold text-ink-secondary">Administra tu perfil profesional, agenda y preferencias clínicas.</p>
      </header>

      <section className="grid items-start gap-4 lg:grid-cols-2 xl:grid-cols-4" aria-label="Configuración médica">
        <DoctorProfileSettings />
        <DoctorPreferencesSettings />
      </section>

      <section className="mt-4 grid items-start gap-4 lg:grid-cols-3" aria-label="Información de seguridad y soporte">
        <InfoCard icon={FilePenLine} title="Firma clínica">
          <div className="flex items-center justify-between gap-3"><span>Las consultas se firman en el servidor con tu identidad autenticada.</span><StatusBadge tone="green">Protegida</StatusBadge></div>
          <Link className="mt-3 inline-flex text-[0.62rem] font-extrabold text-accent hover:text-accent-hover focus-visible:outline-3 focus-visible:outline-focus" href="/doctor/consultas">Revisar consultas →</Link>
        </InfoCard>
        <InfoCard icon={ShieldCheck} title="Acceso y sesión">
          <p>Tu información clínica se filtra por tu práctica activa. Los médicos de clínica solo consultan pacientes y citas de su clínica.</p>
          <div className="mt-3 flex items-center gap-2 text-success"><LockKeyhole className="size-3.5" aria-hidden="true" />Sesión protegida por autenticación.</div>
        </InfoCard>
        <InfoCard icon={Headphones} title="Ayuda operativa">
          <p>Consulta tu agenda para verificar bloques disponibles o revisa consultas para completar historias clínicas.</p>
          <div className="mt-3 flex flex-wrap gap-2"><Link className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-2 text-[0.6rem] font-extrabold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus" href="/doctor/agenda"><CalendarDays className="size-3.5" aria-hidden="true" />Abrir agenda</Link><Link className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-2 text-[0.6rem] font-extrabold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus" href="/doctor/pacientes"><Stethoscope className="size-3.5" aria-hidden="true" />Pacientes</Link></div>
        </InfoCard>
      </section>
    </div>
  );
}

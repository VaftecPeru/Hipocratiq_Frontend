import type { FormEvent } from "react";
import { Building2, CreditCard, LockKeyhole, Stethoscope, UserRound } from "lucide-react";
import type { DoctorRegistrationDraft, RegistrationClinic, RegistrationSpecialty } from "@/features/auth/api/doctor-registration";
import { COUNTRY_OPTIONS } from "@/features/auth/lib/phone-number";
import type { CountryCode } from "@/features/auth/model/auth.types";
import { CountrySelect } from "@/features/auth/ui/country-select";
import {
  FormGroup,
  GlobalError,
  InlineError,
  RegistrationField,
  RegistrationHeader,
  RegistrationSelect,
  registrationButtonClasses,
  type RegistrationFieldErrors,
  type RegistrationFieldName,
} from "@/features/auth/ui/clinic-registration-ui";
import { Spinner } from "@/shared/ui/spinner";

type Props = {
  draft: DoctorRegistrationDraft;
  clinics: RegistrationClinic[];
  specialties: RegistrationSpecialty[];
  catalogStatus: "loading" | "available" | "unavailable";
  errors: RegistrationFieldErrors;
  pending: boolean;
  globalError: string | null;
  onChange: (draft: DoctorRegistrationDraft) => void;
  onClearError: (field: RegistrationFieldName) => void;
  onBack: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function DoctorRegistrationForm({ draft, clinics, specialties, catalogStatus, errors, pending, globalError, onChange, onClearError, onBack, onSubmit }: Props) {
  const country = draft.country_code as CountryCode;
  const countryOption = COUNTRY_OPTIONS[country];
  const update = <Key extends keyof DoctorRegistrationDraft>(key: Key, value: DoctorRegistrationDraft[Key]) => {
    onChange({ ...draft, [key]: value });
    onClearError(key);
  };
  const selectedSpecialty = specialties.find((specialty) => specialty.id === draft.specialty_id);

  return (
    <div className="w-full max-w-152 py-2">
      <RegistrationHeader step="clinic" onBack={onBack} steps={[
        { key: "clinic", label: "Datos", icon: Stethoscope },
        ...(draft.practice_type === "independent" ? [{ key: "plan" as const, label: "Plan", icon: CreditCard }] : []),
        { key: "otp", label: "Verificar", icon: LockKeyhole },
      ]} />
      <h1 className="text-balance text-[clamp(1.5rem,3.5vw,2rem)] leading-tight font-extrabold tracking-[-0.04em]">Crea tu cuenta profesional</h1>
      <p className="mt-2.5 max-w-lg text-sm leading-5 text-muted">Elige si trabajas con una clínica que cubre tu acceso o si ejercerás con un plan independiente.</p>

      <form className="mt-7 grid gap-6" onSubmit={onSubmit} aria-busy={pending} noValidate>
        <FormGroup label="Modalidad profesional">
          <div className="grid gap-3.5 sm:grid-cols-2">
            {(["clinic", "independent"] as const).map((type) => {
              const selected = draft.practice_type === type;
              const Icon = type === "clinic" ? Building2 : UserRound;
              return <button key={type} className={`flex min-h-17 items-center gap-3.5 rounded-xl border px-5 text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus ${selected ? "border-accent bg-accent-soft/40" : "border-line"}`} type="button" aria-pressed={selected} onClick={() => update("practice_type", type)}><Icon className="size-5 shrink-0 text-accent" aria-hidden="true" /><span><strong className="block text-xs">{type === "clinic" ? "Trabajo en una clínica" : "Soy independiente"}</strong><small className="mt-1 block text-2xs text-muted">{type === "clinic" ? "La clínica cubre tu plan." : "Elegirás un plan al continuar."}</small></span></button>;
            })}
          </div>
        </FormGroup>

        {draft.practice_type === "clinic" ? (
          <RegistrationSelect
            label="Clínica"
            name="clinic_id"
            value={draft.clinic_id ?? ""}
            error={errors.clinic_id}
            placeholder="Selecciona una clínica"
            disabled={clinics.length === 0}
            disabledHint="No hay clínicas con un plan activo disponibles."
            onChange={(value) => update("clinic_id", value ? Number(value) : null)}
            options={clinics.map((clinic) => ({ value: String(clinic.id), label: clinic.name, detail: clinic.address }))}
          />
        ) : null}

        <FormGroup label="Datos profesionales">
          <div className="grid gap-5 sm:grid-cols-2">
            <RegistrationField label="Nombre completo" name="doctor_name" value={draft.doctor_name} error={errors.doctor_name} placeholder="Dra. Elena Ruiz" onChange={(value) => update("doctor_name", value)} autoComplete="name" />
            <RegistrationField label="Correo profesional" name="doctor_email" value={draft.doctor_email} error={errors.doctor_email} placeholder="medico@correo.com" onChange={(value) => update("doctor_email", value)} type="email" inputMode="email" autoComplete="email" />
            <RegistrationField label={country === "MX" ? "Cédula profesional" : "Licencia / colegiatura"} name="medical_license" value={draft.medical_license} error={errors.medical_license} placeholder="Ej. CMP-123456" onChange={(value) => update("medical_license", value)} autoComplete="off" maxLength={80} />
            {catalogStatus === "unavailable" ? <RegistrationField label="Especialidad" name="specialty" value={draft.specialty} error={errors.specialty} hint="El catálogo no está disponible. Verificaremos tu especialidad antes de activarla." placeholder="Ej. Cardiología" onChange={(value) => update("specialty", value)} maxLength={120} /> : <><RegistrationSelect label="Especialidad" name="specialty_id" value={draft.specialty_id ?? ""} error={errors.specialty_id} placeholder={catalogStatus === "loading" ? "Cargando especialidades…" : "Selecciona una especialidad"} disabled={catalogStatus === "loading"} onChange={(value) => { onChange({ ...draft, specialty_id: value ? Number(value) : null, subspecialty_id: null, specialty: "" }); onClearError("specialty_id"); onClearError("subspecialty_id"); }} options={specialties.map((specialty) => ({ value: String(specialty.id), label: specialty.name }))} /><RegistrationSelect label="Subespecialidad (opcional)" name="subspecialty_id" value={draft.subspecialty_id ?? ""} error={errors.subspecialty_id} placeholder={selectedSpecialty ? "Selecciona una subespecialidad" : "Primero selecciona una especialidad"} disabled={!selectedSpecialty} onChange={(value) => update("subspecialty_id", value ? Number(value) : null)} options={(selectedSpecialty?.subspecialties ?? []).map((subspecialty) => ({ value: String(subspecialty.id), label: subspecialty.name }))} /></>}
            <div className="grid gap-2"><label className="text-2xs font-bold text-ink" htmlFor="doctor_country_code">País / Región</label><CountrySelect id="doctor_country_code" name="country_code" mode="country" value={country} onChange={(value) => { onChange({ ...draft, country_code: value, doctor_phone_number: "" }); onClearError("doctor_phone_number"); }} /></div>
            <RegistrationField label={countryOption.accessPhoneLabel} name="doctor_phone_number" value={draft.doctor_phone_number} error={errors.doctor_phone_number} hint="El código OTP de registro se enviará al correo profesional." placeholder={countryOption.placeholder} onChange={(value) => update("doctor_phone_number", value.replace(/\D/g, "").slice(0, countryOption.nationalLength))} type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={countryOption.nationalLength} />
          </div>
        </FormGroup>

        <FormGroup label="Seguridad"><div className="grid gap-5"><RegistrationField label="Contraseña" name="password" value={draft.password} error={errors.password} hint="10+ caracteres, mayúsculas, minúsculas y números." placeholder="Crea una contraseña" onChange={(value) => update("password", value)} type="password" autoComplete="new-password" maxLength={72} /><RegistrationField label="Confirmar contraseña" name="password_confirmation" value={draft.password_confirmation} error={errors.password_confirmation} placeholder="Repite tu contraseña" onChange={(value) => update("password_confirmation", value)} type="password" autoComplete="new-password" maxLength={72} /></div></FormGroup>

        <div><label className="flex items-start gap-2.5 text-xs leading-5"><input className="mt-0.5 size-4 shrink-0 accent-accent" type="checkbox" checked={draft.terms_accepted} onChange={(event) => update("terms_accepted", event.target.checked)} aria-invalid={errors.terms_accepted ? true : undefined} aria-describedby={errors.terms_accepted ? "doctor-terms-error" : undefined} required /><span className="text-muted">Confirmo que los datos profesionales son correctos y acepto los Términos de Servicio.</span></label><InlineError id="doctor-terms-error" message={errors.terms_accepted} /></div>
        <GlobalError message={globalError} />
        <button className={`${registrationButtonClasses} w-full`} type="submit" disabled={pending || (draft.practice_type === "clinic" && clinics.length === 0)}>{pending ? <><Spinner />Guardando datos</> : draft.practice_type === "clinic" ? "Continuar a verificación" : "Continuar a planes"}</button>
      </form>
    </div>
  );
}

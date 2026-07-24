import type { FormEvent } from "react";
import { LockKeyhole, UserRound } from "lucide-react";
import type { PatientRegistrationClinic, PatientRegistrationDraft } from "@/features/auth/api/patient-registration";
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
  draft: PatientRegistrationDraft;
  clinics: PatientRegistrationClinic[];
  errors: RegistrationFieldErrors;
  pending: boolean;
  globalError: string | null;
  onChange: (draft: PatientRegistrationDraft) => void;
  onClearError: (field: RegistrationFieldName) => void;
  onBack: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function PatientRegistrationForm({ draft, clinics, errors, pending, globalError, onChange, onClearError, onBack, onSubmit }: Props) {
  const country = draft.country_code as CountryCode;
  const countryOption = COUNTRY_OPTIONS[country];
  const update = <Key extends keyof PatientRegistrationDraft>(key: Key, value: PatientRegistrationDraft[Key]) => {
    onChange({ ...draft, [key]: value });
    onClearError(key);
  };

  return (
    <div className="w-full max-w-152 py-2">
      <RegistrationHeader step="clinic" onBack={onBack} steps={[
        { key: "clinic", label: "Datos", icon: UserRound },
        { key: "otp", label: "Verificar", icon: LockKeyhole },
      ]} />
      <h1 className="text-balance text-[clamp(1.5rem,3.5vw,2rem)] leading-tight font-extrabold tracking-[-0.04em]">Crea tu cuenta de paciente</h1>
      <p className="mt-2.5 max-w-lg text-sm leading-5 text-muted">Selecciona la clínica donde deseas atenderte. El plan se configurará después desde tu cuenta.</p>

      <form className="mt-7 grid gap-6" onSubmit={onSubmit} aria-busy={pending} noValidate>
        <RegistrationSelect
          label="Clínica"
          name="clinic_id"
          value={draft.clinic_id ?? ""}
          error={errors.clinic_id}
          placeholder="Selecciona una clínica"
          disabled={clinics.length === 0}
          disabledHint="No hay clínicas activas disponibles en este momento."
          onChange={(value) => update("clinic_id", value ? Number(value) : null)}
          options={clinics.map((clinic) => ({ value: String(clinic.id), label: clinic.name, detail: clinic.address }))}
        />

        <FormGroup label="Datos personales">
          <div className="grid gap-5 sm:grid-cols-2">
            <RegistrationField label="Nombre completo" name="name" value={draft.name} error={errors.name} placeholder="Ana Martínez" onChange={(value) => update("name", value)} autoComplete="name" />
            <RegistrationField label="Correo (opcional)" name="email" value={draft.email} error={errors.email} placeholder="ana@correo.com" onChange={(value) => update("email", value)} type="email" inputMode="email" autoComplete="email" />
            <div className="grid gap-2"><label className="text-2xs font-bold text-ink" htmlFor="patient_country_code">País / Región</label><CountrySelect id="patient_country_code" name="country_code" mode="country" value={country} onChange={(value) => { onChange({ ...draft, country_code: value, phone_number: "" }); onClearError("phone_number"); }} /></div>
            <RegistrationField label={countryOption.accessPhoneLabel} name="phone_number" value={draft.phone_number} error={errors.phone_number} hint="Aquí recibirás el código OTP por SMS." placeholder={countryOption.placeholder} onChange={(value) => update("phone_number", value.replace(/\D/g, "").slice(0, countryOption.nationalLength))} type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={countryOption.nationalLength} />
          </div>
        </FormGroup>

        <FormGroup label="Seguridad (opcional)">
          <div className="grid gap-5">
            <RegistrationField label="Contraseña" name="password" value={draft.password} error={errors.password} hint="Puedes ingresar con OTP; agrega una contraseña si también deseas usarla." placeholder="10+ caracteres" onChange={(value) => update("password", value)} type="password" autoComplete="new-password" maxLength={72} />
            {draft.password ? <RegistrationField label="Confirmar contraseña" name="password_confirmation" value={draft.password_confirmation} error={errors.password_confirmation} placeholder="Repite tu contraseña" onChange={(value) => update("password_confirmation", value)} type="password" autoComplete="new-password" maxLength={72} /> : null}
          </div>
        </FormGroup>

        <div><label className="flex items-start gap-2.5 text-xs leading-5"><input className="mt-0.5 size-4 shrink-0 accent-accent" type="checkbox" checked={draft.terms_accepted} onChange={(event) => update("terms_accepted", event.target.checked)} aria-invalid={errors.terms_accepted ? true : undefined} aria-describedby={errors.terms_accepted ? "patient-terms-error" : undefined} required /><span className="text-muted">Acepto los Términos de Servicio y el tratamiento de mis datos para gestionar mi atención.</span></label><InlineError id="patient-terms-error" message={errors.terms_accepted} /></div>
        <GlobalError message={globalError} />
        <button className={`${registrationButtonClasses} w-full`} type="submit" disabled={pending || clinics.length === 0}>{pending ? <><Spinner />Enviando código</> : "Verificar mi teléfono"}</button>
      </form>
    </div>
  );
}

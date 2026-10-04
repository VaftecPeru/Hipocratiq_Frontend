import type { FormEvent } from "react";
import type { ClinicRegistrationDraft } from "@/features/auth/api/clinic-registration";
import { COUNTRY_OPTIONS } from "@/features/auth/lib/phone-number";
import type { CountryCode } from "@/features/auth/model/auth.types";
import { CountrySelect } from "@/features/auth/ui/country-select";
import { Spinner } from "@/shared/ui/spinner";
import {
  FormGroup,
  GlobalError,
  InlineError,
  RegistrationField,
  RegistrationHeader,
  registrationButtonClasses,
  type RegistrationFieldErrors,
  type RegistrationFieldName,
} from "@/features/auth/ui/clinic-registration-ui";

type ClinicRegistrationFormProps = {
  draft: ClinicRegistrationDraft;
  setDraft: (draft: ClinicRegistrationDraft) => void;
  errors: RegistrationFieldErrors;
  pending: boolean;
  globalError: string | null;
  onClearError: (field: RegistrationFieldName) => void;
  onBack: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ClinicRegistrationForm({ draft, setDraft, errors, pending, globalError, onClearError, onBack, onSubmit }: ClinicRegistrationFormProps) {
  const country = draft.country_code as CountryCode;
  const countryOption = COUNTRY_OPTIONS[country];
  const update = (key: RegistrationFieldName, value: string | boolean) => setDraft({ ...draft, [key]: value });
  const updateText = (key: RegistrationFieldName, value: string) => {
    update(key, value);
    onClearError(key);
  };
  const updatePhone = (key: "contact_phone" | "admin_phone_number", value: string) => {
    updateText(key, value.replace(/\D/g, "").slice(0, countryOption.nationalLength));
  };
  const updateTaxId = (value: string) => {
    const normalized = value.toUpperCase().replace(/\s+/g, "");
    updateText("tax_id", country === "MX" ? normalized.slice(0, 13) : normalized.slice(0, 80));
  };
  const updateCountry = (value: CountryCode) => {
    setDraft({ ...draft, country_code: value, contact_phone: "", admin_phone_number: "" });
    onClearError("contact_phone");
    onClearError("admin_phone_number");
  };

  return (
    <div className="w-full max-w-152 py-2">
      <RegistrationHeader step="clinic" onBack={onBack} />
      <h1 className="text-balance text-[clamp(1.5rem,3.5vw,2rem)] leading-tight font-extrabold tracking-[-0.04em]">Registra tu centro médico</h1>
      <p className="mt-2.5 max-w-124 text-sm leading-5 text-muted">Únete a Hipocratiq y digitaliza la operación de tu clínica o centro hospitalario.</p>

      <form className="mt-7 grid gap-6" onSubmit={onSubmit} aria-busy={pending} noValidate>
        <FormGroup label="Datos de la institución">
          <div className="grid gap-5 sm:grid-cols-2">
            <RegistrationField label="Nombre de la clínica" name="clinic_name" value={draft.clinic_name} error={errors.clinic_name} placeholder="Ej. Clínica Santa Elena" onChange={(value) => updateText("clinic_name", value)} autoComplete="organization" />
            <RegistrationField label={countryOption.taxIdLabel} name="tax_id" value={draft.tax_id} error={errors.tax_id} placeholder={countryOption.taxIdPlaceholder} onChange={updateTaxId} autoComplete="off" maxLength={country === "MX" ? 13 : 80} />
            <div className="grid gap-2">
              <label className="text-2xs font-bold text-ink" htmlFor="country_code">País / Región</label>
              <CountrySelect id="country_code" name="country_code" mode="country" value={country} onChange={updateCountry} />
            </div>
            <RegistrationField label={countryOption.contactPhoneLabel} name="contact_phone" value={draft.contact_phone} error={errors.contact_phone} placeholder={countryOption.placeholder} onChange={(value) => updatePhone("contact_phone", value)} type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={countryOption.nationalLength} />
            <RegistrationField className="sm:col-span-2" label={countryOption.addressLabel} name="address" value={draft.address} error={errors.address} placeholder={countryOption.addressPlaceholder} onChange={(value) => updateText("address", value)} autoComplete="street-address" />
          </div>
        </FormGroup>

        <div className="h-px bg-line" aria-hidden="true" />

        <FormGroup label="Cuenta administradora">
          <div className="grid gap-5 sm:grid-cols-2">
            <RegistrationField label="Nombre del administrador" name="admin_name" value={draft.admin_name} error={errors.admin_name} placeholder="Responsable legal" onChange={(value) => updateText("admin_name", value)} autoComplete="name" />
            <RegistrationField label="Correo institucional" name="admin_email" value={draft.admin_email} error={errors.admin_email} placeholder="admin@clinica.com" onChange={(value) => updateText("admin_email", value)} type="email" inputMode="email" autoComplete="email" />
            <RegistrationField label={countryOption.accessPhoneLabel} name="admin_phone_number" value={draft.admin_phone_number} error={errors.admin_phone_number} hint="El código OTP de registro se enviará al correo institucional del administrador." placeholder={countryOption.placeholder} onChange={(value) => updatePhone("admin_phone_number", value)} type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={countryOption.nationalLength} />
          </div>
        </FormGroup>

        <div className="h-px bg-line" aria-hidden="true" />

        <FormGroup label="Seguridad de la cuenta">
          <div className="grid gap-5">
            <RegistrationField label="Contraseña" name="password" value={draft.password} error={errors.password} hint="10+ caracteres, mayúsculas, minúsculas y números." placeholder="Crea una contraseña" onChange={(value) => updateText("password", value)} type="password" autoComplete="new-password" maxLength={72} />
            <RegistrationField label="Confirmar contraseña" name="password_confirmation" value={draft.password_confirmation} error={errors.password_confirmation} placeholder="Repite tu contraseña" onChange={(value) => updateText("password_confirmation", value)} type="password" autoComplete="new-password" maxLength={72} />
          </div>
        </FormGroup>

        <div>
          <label className="flex items-start gap-2.5 text-xs leading-5">
            <input className="mt-0.5 size-4 shrink-0 accent-accent" type="checkbox" checked={draft.terms_accepted} onChange={(event) => { update("terms_accepted", event.target.checked); onClearError("terms_accepted"); }} aria-invalid={errors.terms_accepted ? true : undefined} aria-describedby={errors.terms_accepted ? "terms_accepted-error" : undefined} required />
            <span className="text-muted">Represento legalmente a la institución y acepto los <a className="font-bold text-accent hover:underline" href="#terms">Términos de Servicio</a> de Hipocratiq.</span>
          </label>
          <InlineError id="terms_accepted-error" message={errors.terms_accepted} />
        </div>

        <GlobalError message={globalError} />
        <button className={`${registrationButtonClasses} w-full`} type="submit" disabled={pending}>
          {pending ? <><Spinner />Guardando datos</> : "Registrar clínica ahora"}
        </button>
      </form>
    </div>
  );
}

"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Stethoscope } from "lucide-react";
import { getDoctorRegistrationSpecialties, type RegistrationSpecialty } from "@/features/auth/api/doctor-registration";
import {
  createClinicDoctor,
  type CreateClinicDoctorPayload,
} from "@/features/clinics/api/browser-clinic-dashboard";
import type { ClinicTeamMember } from "@/features/clinics/model/clinic-admin.types";
import { ApiError } from "@/shared/api/http-client";
import { type CountryCode } from "@/shared/ui/country-flag";
import { Modal } from "@/shared/ui/modal";
import {
  ModalField,
  ModalGrid,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalSelect,
} from "@/shared/ui/modal-parts";

type DoctorField =
  | "name"
  | "email"
  | "phone_number"
  | "country_code"
  | "medical_license"
  | "specialty_id"
  | "subspecialty_id";

type FieldErrors = Partial<Record<DoctorField, string>>;

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function readFieldErrors(error: ApiError): FieldErrors {
  const fieldErrors: FieldErrors = {};

  for (const [field, messages] of Object.entries(error.errors ?? {})) {
    if (messages[0]) fieldErrors[field as DoctorField] = messages[0];
  }

  return fieldErrors;
}

export function CreateClinicDoctorModal({
  clinicCountryCode,
  isOpen,
  onClose,
  onCreated,
}: {
  clinicCountryCode: CountryCode;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (member: ClinicTeamMember) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState<CountryCode>(clinicCountryCode);
  const [medicalLicense, setMedicalLicense] = useState("");
  const [specialtyId, setSpecialtyId] = useState("");
  const [subspecialtyId, setSubspecialtyId] = useState("");
  const [specialties, setSpecialties] = useState<RegistrationSpecialty[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [catalogRequestKey, setCatalogRequestKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!isOpen || catalogLoaded) return;

    const controller = new AbortController();

    getDoctorRegistrationSpecialties(controller.signal)
      .then((response) => {
        if (!Array.isArray(response.data)) {
          throw new Error("El catálogo de especialidades está incompleto.");
        }
        setSpecialties(response.data);
        setCatalogLoaded(true);
      })
      .catch((requestError: unknown) => {
        if (isAbortError(requestError)) return;
        setCatalogError(requestError instanceof Error ? requestError.message : "No pudimos cargar las especialidades.");
      });

    return () => controller.abort();
  }, [catalogLoaded, catalogRequestKey, isOpen]);

  const selectedSpecialty = useMemo(
    () => specialties.find((specialty) => String(specialty.id) === specialtyId),
    [specialties, specialtyId],
  );
  const subspecialtyOptions = selectedSpecialty?.subspecialties.map((subspecialty) => ({
    value: String(subspecialty.id),
    label: subspecialty.name,
  })) ?? [];
  const isCatalogLoading = isOpen && !catalogLoaded && !catalogError;

  function clearFieldError(field: DoctorField): void {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function resetForm(): void {
    setName("");
    setEmail("");
    setPhoneNumber("");
    setCountryCode(clinicCountryCode);
    setMedicalLicense("");
    setSpecialtyId("");
    setSubspecialtyId("");
    setError(null);
    setFieldErrors({});
  }

  function handleClose(): void {
    if (isLoading) return;
    resetForm();
    onClose();
  }

  async function handleCreate(): Promise<void> {
    if (isLoading) return;

    const localErrors: FieldErrors = {};
    if (!name.trim()) localErrors.name = "Escribe el nombre completo.";
    if (!phoneNumber.trim()) localErrors.phone_number = "Escribe un teléfono.";
    if (!medicalLicense.trim()) localErrors.medical_license = "Escribe la cédula profesional.";
    if (!specialtyId) localErrors.specialty_id = "Selecciona la especialidad principal.";

    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setError("Revisa los campos obligatorios.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateClinicDoctorPayload = {
      name: name.trim(),
      email: email.trim() || null,
      phoneNumber: phoneNumber.trim(),
      countryCode,
      medicalLicense: medicalLicense.trim(),
      specialtyId: Number(specialtyId),
      subspecialtyId: subspecialtyId ? Number(subspecialtyId) : null,
    };

    try {
      const member = await createClinicDoctor(payload);
      onCreated(member);
      resetForm();
      onClose();
    } catch (requestError: unknown) {
      if (requestError instanceof ApiError) {
        setFieldErrors(readFieldErrors(requestError));
        setError(requestError.message);
      } else {
        setError(requestError instanceof Error ? requestError.message : "No pudimos crear el médico.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void handleCreate();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title="Agregar médico"
      description="Registra un médico con la especialidad del catálogo clínico"
      footer={
        <>
          <ModalSecondaryButton disabled={isLoading} onClick={handleClose}>Cancelar</ModalSecondaryButton>
          <ModalPrimaryButton
            disabled={!name.trim() || !phoneNumber.trim() || !medicalLicense.trim() || !specialtyId || isLoading || isCatalogLoading}
            form="create-clinic-doctor-form"
            type="submit"
          >
            <Stethoscope className="size-3.5" aria-hidden="true" />
            {isLoading ? "Creando..." : "Agregar médico"}
          </ModalPrimaryButton>
        </>
      }
    >
      <form className="space-y-4" id="create-clinic-doctor-form" onSubmit={handleSubmit}>
        <ModalGrid cols={2}>
          <ModalField
            id="doctor-name"
            label="Nombre completo"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              clearFieldError("name");
            }}
            error={fieldErrors.name}
            required
          />
          <ModalField
            id="doctor-email"
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearFieldError("email");
            }}
            error={fieldErrors.email}
          />
        </ModalGrid>
        <ModalGrid cols={2}>
          <ModalSelect
            id="doctor-country"
            label="País del teléfono"
            options={[
              { value: "MX", label: "México" },
              { value: "PE", label: "Perú" },
              { value: "US", label: "Estados Unidos" },
            ]}
            value={countryCode}
            onChange={(value) => {
              setCountryCode(value as CountryCode);
              clearFieldError("country_code");
            }}
            error={fieldErrors.country_code}
            required
          />
          <ModalField
            id="doctor-phone"
            label="Teléfono"
            value={phoneNumber}
            onChange={(event) => {
              setPhoneNumber(event.target.value);
              clearFieldError("phone_number");
            }}
            error={fieldErrors.phone_number}
            required
          />
        </ModalGrid>
        <ModalField
          id="doctor-license"
          label="Cédula profesional"
          value={medicalLicense}
          onChange={(event) => {
            setMedicalLicense(event.target.value);
            clearFieldError("medical_license");
          }}
          error={fieldErrors.medical_license}
          required
        />
        <ModalGrid cols={2}>
          <ModalSelect
            id="doctor-specialty"
            label="Especialidad principal"
            options={specialties.map((specialty) => ({ value: String(specialty.id), label: specialty.name }))}
            value={specialtyId}
            onChange={(value) => {
              setSpecialtyId(value);
              setSubspecialtyId("");
              clearFieldError("specialty_id");
              clearFieldError("subspecialty_id");
            }}
            placeholder={isCatalogLoading ? "Cargando especialidades..." : "Seleccionar especialidad"}
            error={fieldErrors.specialty_id}
            disabled={isCatalogLoading || specialties.length === 0}
            required
          />
          <ModalSelect
            id="doctor-subspecialty"
            label="Subespecialidad"
            options={subspecialtyOptions}
            value={subspecialtyId}
            onChange={(value) => {
              setSubspecialtyId(value);
              clearFieldError("subspecialty_id");
            }}
            placeholder={selectedSpecialty ? "Opcional" : "Selecciona primero una especialidad"}
            error={fieldErrors.subspecialty_id}
            disabled={!selectedSpecialty || subspecialtyOptions.length === 0}
          />
        </ModalGrid>
        {catalogError ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-danger/25 bg-danger-soft p-3 text-2xs text-danger" role="alert">
            <span>{catalogError}</span>
            <button className="shrink-0 font-bold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-focus" type="button" onClick={() => { setCatalogError(null); setCatalogRequestKey((current) => current + 1); }}>
              Reintentar
            </button>
          </div>
        ) : null}
        <div className="flex gap-2 rounded-lg border border-accent/20 bg-accent-soft p-3 text-2xs leading-5 text-accent">
          <Stethoscope className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>La cuenta quedará activa para esta clínica. El médico podrá establecer su contraseña desde “Recuperar contraseña”.</p>
        </div>
        {error ? <p className="rounded-lg border border-danger/25 bg-danger-soft p-3 text-xs font-semibold text-danger" role="alert" aria-live="polite">{error}</p> : null}
      </form>
    </Modal>
  );
}

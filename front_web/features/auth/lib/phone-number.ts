import type { CountryCode } from "@/features/auth/model/auth.types";

export const PRIMARY_COUNTRY_CODE: CountryCode = "MX";

export const COUNTRY_OPTIONS: Record<CountryCode, {
  dialCode: string;
  name: string;
  nationalLength: number;
  placeholder: string;
  taxIdLabel: string;
  taxIdPlaceholder: string;
  contactPhoneLabel: string;
  accessPhoneLabel: string;
  addressLabel: string;
  addressPlaceholder: string;
}> = {
  PE: {
    dialCode: "51",
    name: "Perú",
    nationalLength: 9,
    placeholder: "912 345 678",
    taxIdLabel: "RUC",
    taxIdPlaceholder: "Ej. 20123456789",
    contactPhoneLabel: "Celular de contacto",
    accessPhoneLabel: "Celular para acceso y OTP",
    addressLabel: "Dirección completa",
    addressPlaceholder: "Avenida, número, distrito y provincia",
  },
  MX: {
    dialCode: "52",
    name: "México",
    nationalLength: 10,
    placeholder: "55 3456 7890",
    taxIdLabel: "RFC",
    taxIdPlaceholder: "Ej. ABC010203AB9",
    contactPhoneLabel: "Teléfono de contacto",
    accessPhoneLabel: "Celular para acceso y OTP",
    addressLabel: "Dirección completa",
    addressPlaceholder: "Calle, número, colonia y código postal",
  },
  US: {
    dialCode: "1",
    name: "Estados Unidos",
    nationalLength: 10,
    placeholder: "202 555 1234",
    taxIdLabel: "EIN",
    taxIdPlaceholder: "Ej. 12-3456789",
    contactPhoneLabel: "Número de contacto",
    accessPhoneLabel: "Móvil para acceso y OTP",
    addressLabel: "Dirección postal",
    addressPlaceholder: "Calle, ciudad, estado y código ZIP",
  },
};

export function toE164PhoneNumber(value: string, country: CountryCode): string {
  const digits = value.replace(/\D/g, "");
  const option = COUNTRY_OPTIONS[country];

  if (value.trim().startsWith("+")) {
    if (digits.length < 8 || digits.length > 15) {
      throw new Error("Ingresa un número internacional válido.");
    }

    return `+${digits}`;
  }

  if (
    digits.startsWith(option.dialCode) &&
    digits.length === option.dialCode.length + option.nationalLength
  ) {
    return `+${digits}`;
  }

  if (digits.length !== option.nationalLength) {
    throw new Error(`El número de ${option.name} debe tener ${option.nationalLength} dígitos.`);
  }

  return `+${option.dialCode}${digits}`;
}

export function maskPhoneNumber(phoneNumber: string): string {
  const visibleDigits = phoneNumber.slice(-3);

  return `${phoneNumber.slice(0, 3)} ••• ••• ${visibleDigits}`;
}

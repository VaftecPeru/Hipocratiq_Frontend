import type { CountryCode } from "@/features/auth/model/auth.types";

export const COUNTRY_OPTIONS: Record<CountryCode, {
  dialCode: string;
  name: string;
  nationalLength: number;
  placeholder: string;
}> = {
  PE: { dialCode: "51", name: "Perú", nationalLength: 9, placeholder: "912345678" },
  MX: { dialCode: "52", name: "México", nationalLength: 10, placeholder: "5534567890" },
  US: { dialCode: "1", name: "Estados Unidos", nationalLength: 10, placeholder: "2025551234" },
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
    throw new Error(`El número de ${country} debe tener ${option.nationalLength} dígitos.`);
  }

  return `+${option.dialCode}${digits}`;
}

export function maskPhoneNumber(phoneNumber: string): string {
  const visibleDigits = phoneNumber.slice(-3);

  return `${phoneNumber.slice(0, 3)} ••• ••• ${visibleDigits}`;
}

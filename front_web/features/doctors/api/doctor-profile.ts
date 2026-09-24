import { ApiError, getFromApi, patchToApi } from "@/shared/api/http-client";

export type DoctorProfile = {
  id: number;
  name: string;
  email: string | null;
  phoneNumber: string;
  countryCode: "MX" | "PE" | "US";
  medicalLicense: string;
  medicalLicenseCountryCode: string | null;
  medicalLicenseIssuer: string | null;
  medicalLicenseVerificationStatus: "unverified" | "verified" | "rejected";
  medicalLicenseVerifiedAt: string | null;
  specialtyLicense: string | null;
  specialtyLicenseVerificationStatus: "not_applicable" | "unverified" | "verified" | "rejected";
  specialtyLicenseVerifiedAt: string | null;
  specialty: string;
  specialtyId: number | null;
  subspecialtyId: number | null;
  practiceType: "clinic" | "independent";
  clinic: { id: number; name: string } | null;
};

type ApiDoctorProfile = {
  id: number;
  name: string;
  email: string | null;
  phone_number: string;
  country_code: DoctorProfile["countryCode"];
  medical_license: string;
  medical_license_country_code: string | null;
  medical_license_issuer: string | null;
  medical_license_verification_status: DoctorProfile["medicalLicenseVerificationStatus"];
  medical_license_verified_at: string | null;
  specialty_license: string | null;
  specialty_license_verification_status: DoctorProfile["specialtyLicenseVerificationStatus"];
  specialty_license_verified_at: string | null;
  specialty: string;
  specialty_id: number | null;
  subspecialty_id: number | null;
  practice_type: DoctorProfile["practiceType"];
  clinic: DoctorProfile["clinic"];
};

function mapProfile(profile: ApiDoctorProfile): DoctorProfile {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phoneNumber: profile.phone_number,
    countryCode: profile.country_code,
    medicalLicense: profile.medical_license,
    medicalLicenseCountryCode: profile.medical_license_country_code,
    medicalLicenseIssuer: profile.medical_license_issuer,
    medicalLicenseVerificationStatus: profile.medical_license_verification_status,
    medicalLicenseVerifiedAt: profile.medical_license_verified_at,
    specialtyLicense: profile.specialty_license,
    specialtyLicenseVerificationStatus: profile.specialty_license_verification_status,
    specialtyLicenseVerifiedAt: profile.specialty_license_verified_at,
    specialty: profile.specialty,
    specialtyId: profile.specialty_id,
    subspecialtyId: profile.subspecialty_id,
    practiceType: profile.practice_type,
    clinic: profile.clinic,
  };
}

export function getDoctorProfile(signal?: AbortSignal): Promise<DoctorProfile> {
  return getFromApi<{ data: ApiDoctorProfile }>("/api/v1/auth/doctor/profile", { signal }).then((response) => {
    if (!response.data) throw new ApiError("El servidor devolvió un perfil médico incompleto.", 502);
    return mapProfile(response.data);
  });
}

export type UpdateDoctorProfilePayload = Partial<Pick<DoctorProfile, "name" | "email" | "phoneNumber" | "countryCode" | "medicalLicense" | "specialtyLicense" | "specialtyId" | "subspecialtyId">>;

export function updateDoctorProfile(payload: UpdateDoctorProfilePayload): Promise<DoctorProfile> {
  return patchToApi<{ data: ApiDoctorProfile }>("/api/v1/auth/doctor/profile", {
    name: payload.name,
    email: payload.email,
    phone_number: payload.phoneNumber,
    country_code: payload.countryCode,
    medical_license: payload.medicalLicense,
    specialty_license: payload.specialtyLicense,
    specialty_id: payload.specialtyId,
    subspecialty_id: payload.subspecialtyId,
  }).then((response) => {
    if (!response.data) throw new ApiError("El servidor no devolvió el perfil médico actualizado.", 502);
    return mapProfile(response.data);
  });
}

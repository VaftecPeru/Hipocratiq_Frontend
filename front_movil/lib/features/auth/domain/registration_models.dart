import 'auth_models.dart';

enum RegistrationKind { doctor, clinic }

class DoctorRegistrationDraft {
  const DoctorRegistrationDraft({
    required this.name,
    required this.email,
    required this.country,
    required this.phoneNumber,
    required this.medicalLicense,
    required this.specialty,
    required this.practiceType,
    required this.clinicId,
    required this.password,
    required this.passwordConfirmation,
    required this.termsAccepted,
  });

  final String name;
  final String email;
  final CountryCode country;
  final String phoneNumber;
  final String medicalLicense;
  final String specialty;
  final String practiceType;
  final int? clinicId;
  final String password;
  final String passwordConfirmation;
  final bool termsAccepted;

  Map<String, dynamic> toPayload({
    required String deviceName,
    required String deviceId,
  }) {
    return <String, dynamic>{
      'client_type': 'mobile',
      'doctor_name': name.trim(),
      'doctor_email': email.trim().toLowerCase(),
      'country_code': country.code,
      'doctor_phone_number': phoneNumber.replaceAll(RegExp(r'\D'), ''),
      'medical_license': medicalLicense.trim().toUpperCase(),
      'specialty': specialty.trim(),
      'practice_type': practiceType,
      'clinic_id': clinicId,
      'password': password,
      'password_confirmation': passwordConfirmation,
      'terms_accepted': termsAccepted,
      'device_name': deviceName,
      'device_id': deviceId,
    };
  }
}

class ClinicRegistrationDraft {
  const ClinicRegistrationDraft({
    required this.clinicName,
    required this.taxId,
    required this.country,
    required this.contactPhone,
    required this.address,
    required this.adminName,
    required this.adminEmail,
    required this.adminPhone,
    required this.password,
    required this.passwordConfirmation,
    required this.termsAccepted,
  });

  final String clinicName;
  final String taxId;
  final CountryCode country;
  final String contactPhone;
  final String address;
  final String adminName;
  final String adminEmail;
  final String adminPhone;
  final String password;
  final String passwordConfirmation;
  final bool termsAccepted;

  Map<String, dynamic> toPayload({
    required String deviceName,
    required String deviceId,
  }) {
    return <String, dynamic>{
      'client_type': 'mobile',
      'clinic_name': clinicName.trim(),
      'tax_id': taxId.trim().toUpperCase(),
      'country_code': country.code,
      'contact_phone': contactPhone.replaceAll(RegExp(r'\D'), ''),
      'address': address.trim(),
      'admin_name': adminName.trim(),
      'admin_email': adminEmail.trim().toLowerCase(),
      'admin_phone_number': adminPhone.replaceAll(RegExp(r'\D'), ''),
      'password': password,
      'password_confirmation': passwordConfirmation,
      'terms_accepted': termsAccepted,
      'device_name': deviceName,
      'device_id': deviceId,
    };
  }
}

class PlanOption {
  const PlanOption({
    required this.key,
    required this.name,
    required this.monthlyPriceCents,
    required this.annualPriceCents,
    required this.currency,
  });

  final String key;
  final String name;
  final int monthlyPriceCents;
  final int annualPriceCents;
  final String currency;

  factory PlanOption.fromJson(Map<String, dynamic> json) {
    return PlanOption(
      key: _requiredString(json, 'key'),
      name: _requiredString(json, 'name'),
      monthlyPriceCents: _requiredInt(json, 'monthly_price_cents'),
      annualPriceCents: _requiredInt(json, 'annual_price_cents'),
      currency: _requiredString(json, 'currency'),
    );
  }
}

class RegistrationDraftSession {
  const RegistrationDraftSession({
    required this.nextStep,
    this.draftToken,
    this.challenge,
  });

  final String nextStep;
  final String? draftToken;
  final OtpChallenge? challenge;

  factory RegistrationDraftSession.fromJson(Map<String, dynamic> json) {
    final challengeId = _nullableString(json['challenge_id']);
    final challenge = challengeId == null ? null : OtpChallenge.fromJson(json);
    return RegistrationDraftSession(
      nextStep: _nullableString(json['next_step']) ?? 'select_plan',
      draftToken: _nullableString(json['draft_token']),
      challenge: challenge,
    );
  }
}

class ReceptionistInvitation {
  const ReceptionistInvitation({required this.token, required this.expiresAt});

  final String token;
  final DateTime? expiresAt;

  factory ReceptionistInvitation.fromJson(Map<String, dynamic> json) {
    return ReceptionistInvitation(
      token: _requiredString(json, 'invitation_token'),
      expiresAt: _nullableDateTime(json['expires_at']),
    );
  }
}

String _requiredString(Map<String, dynamic> source, String key) {
  final value = _nullableString(source[key]);
  if (value == null) {
    throw FormatException('Missing string: $key');
  }
  return value;
}

String? _nullableString(Object? value) {
  return value is String && value.trim().isNotEmpty ? value.trim() : null;
}

int _requiredInt(Map<String, dynamic> source, String key) {
  final value = source[key];
  if (value is int) {
    return value;
  }
  if (value is num) {
    return value.toInt();
  }
  if (value is String) {
    final parsed = int.tryParse(value);
    if (parsed != null) {
      return parsed;
    }
  }
  throw FormatException('Missing integer: $key');
}

DateTime? _nullableDateTime(Object? value) {
  return value is String ? DateTime.tryParse(value) : null;
}

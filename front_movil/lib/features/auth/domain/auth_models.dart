enum CountryCode {
  pe(
    code: 'PE',
    dialCode: '51',
    label: 'Perú',
    nationalLength: 9,
    placeholder: '912 345 678',
  ),
  mx(
    code: 'MX',
    dialCode: '52',
    label: 'México',
    nationalLength: 10,
    placeholder: '55 3456 7890',
  ),
  us(
    code: 'US',
    dialCode: '1',
    label: 'Estados Unidos',
    nationalLength: 10,
    placeholder: '202 555 1234',
  );

  const CountryCode({
    required this.code,
    required this.dialCode,
    required this.label,
    required this.nationalLength,
    required this.placeholder,
  });

  final String code;
  final String dialCode;
  final String label;
  final int nationalLength;
  final String placeholder;

  static CountryCode fromCode(String value) {
    return values.firstWhere(
      (country) => country.code == value.toUpperCase(),
      orElse: () => CountryCode.pe,
    );
  }
}

enum AuthRole {
  healthcare(
    label: 'Profesional de salud',
    description: 'Acceso clínico para médicos',
    requestedRole: 'doctor',
    actorContext: 'staff',
    iconName: 'medical_services',
  ),
  receptionist(
    label: 'Recepción',
    description: 'Agenda y atención de clínica',
    requestedRole: 'receptionist',
    actorContext: 'staff',
    iconName: 'calendar_month',
  ),
  patient(
    label: 'Paciente',
    description: 'Tu atención y tus resultados',
    requestedRole: 'patient',
    actorContext: 'patient',
    iconName: 'person',
  ),
  administrator(
    label: 'Administrador',
    description: 'Gestión de clínica',
    requestedRole: 'clinic_admin',
    actorContext: 'staff',
    iconName: 'business',
  );

  const AuthRole({
    required this.label,
    required this.description,
    required this.requestedRole,
    required this.actorContext,
    required this.iconName,
  });

  final String label;
  final String description;
  final String requestedRole;
  final String actorContext;
  final String iconName;

  bool get requiresPassword => actorContext == 'staff';
}

enum AuthIdentifierType { phone, email }

enum OtpPurpose { login, registration }

class OtpChallenge {
  const OtpChallenge({
    required this.challengeId,
    required this.expiresIn,
    required this.resendAfter,
    this.resendsRemaining,
  });

  final String challengeId;
  final Duration expiresIn;
  final Duration resendAfter;
  final int? resendsRemaining;

  factory OtpChallenge.fromJson(Map<String, dynamic> json) {
    return OtpChallenge(
      challengeId: _requiredString(json, 'challenge_id'),
      expiresIn: Duration(seconds: _requiredInt(json, 'expires_in')),
      resendAfter: Duration(seconds: _requiredInt(json, 'resend_after')),
      resendsRemaining: _nullableInt(json['resends_remaining']),
    );
  }
}

class ClinicOption {
  const ClinicOption({
    required this.id,
    required this.name,
    required this.countryCode,
    required this.address,
  });

  final int id;
  final String name;
  final String countryCode;
  final String address;

  factory ClinicOption.fromJson(Map<String, dynamic> json) {
    return ClinicOption(
      id: _requiredInt(json, 'id'),
      name: _requiredString(json, 'name'),
      countryCode: _nullableString(json['country_code']) ?? '',
      address: _nullableString(json['address']) ?? 'Dirección no disponible',
    );
  }
}

class RegistrationDraft {
  const RegistrationDraft({
    required this.name,
    required this.email,
    required this.country,
    required this.phoneNumber,
    required this.clinicId,
    required this.termsAccepted,
  });

  final String name;
  final String email;
  final CountryCode country;
  final String phoneNumber;
  final int? clinicId;
  final bool termsAccepted;

  Map<String, dynamic> toPayload({
    required String deviceName,
    required String deviceId,
  }) {
    return <String, dynamic>{
      'purpose': 'registration',
      'client_type': 'mobile',
      'actor_context': 'patient',
      'requested_role': 'patient',
      'name': name.trim(),
      if (email.trim().isNotEmpty) 'email': email.trim().toLowerCase(),
      'country_code': country.code,
      'phone_number': phoneNumber.replaceAll(RegExp(r'\D'), ''),
      'clinic_id': clinicId,
      'terms_accepted': termsAccepted,
      'device_name': deviceName,
      'device_id': deviceId,
    };
  }
}

class ClinicSummary {
  const ClinicSummary({
    required this.id,
    required this.name,
    this.status,
    this.plan,
  });

  final int id;
  final String name;
  final String? status;
  final String? plan;

  factory ClinicSummary.fromJson(Map<String, dynamic> json) {
    return ClinicSummary(
      id: _requiredInt(json, 'id'),
      name: _requiredString(json, 'name'),
      status: _nullableString(json['status']),
      plan: _nullableString(json['plan']),
    );
  }
}

class PatientSummary {
  const PatientSummary({this.clinic, this.plan});

  final ClinicSummary? clinic;
  final String? plan;

  factory PatientSummary.fromJson(Map<String, dynamic> json) {
    return PatientSummary(
      clinic: _nullableMap(json['clinic']) == null
          ? null
          : ClinicSummary.fromJson(_nullableMap(json['clinic'])!),
      plan: _nullableString(json['plan']),
    );
  }
}

class DoctorSummary {
  const DoctorSummary({
    required this.medicalLicense,
    required this.specialty,
    required this.practiceType,
    required this.clinic,
    required this.plan,
  });

  final String medicalLicense;
  final String specialty;
  final String practiceType;
  final ClinicSummary? clinic;
  final String? plan;

  factory DoctorSummary.fromJson(Map<String, dynamic> json) {
    final clinic = _nullableMap(json['clinic']);
    return DoctorSummary(
      medicalLicense: _nullableString(json['medical_license']) ?? '',
      specialty: _nullableString(json['specialty']) ?? '',
      practiceType: _nullableString(json['practice_type']) ?? '',
      clinic: clinic == null ? null : ClinicSummary.fromJson(clinic),
      plan: _nullableString(json['plan']),
    );
  }
}

class AuthenticatedUser {
  const AuthenticatedUser({
    required this.id,
    required this.name,
    required this.email,
    required this.phoneNumber,
    required this.countryCode,
    required this.status,
    required this.onboardingStatus,
    required this.roles,
    required this.isGlobal,
    required this.patient,
    required this.clinic,
    required this.doctor,
  });

  final int id;
  final String name;
  final String? email;
  final String phoneNumber;
  final String countryCode;
  final String? status;
  final String? onboardingStatus;
  final List<String> roles;
  final bool isGlobal;
  final PatientSummary? patient;
  final ClinicSummary? clinic;
  final DoctorSummary? doctor;

  factory AuthenticatedUser.fromJson(Map<String, dynamic> json) {
    final patient = _nullableMap(json['patient']);
    final clinic = _nullableMap(json['clinic']);
    final doctor = _nullableMap(json['doctor']);
    return AuthenticatedUser(
      id: _requiredInt(json, 'id'),
      name: _requiredString(json, 'name'),
      email: _nullableString(json['email']),
      phoneNumber: _nullableString(json['phone_number']) ?? '',
      countryCode: _nullableString(json['country_code']) ?? '',
      status: _nullableString(json['status']),
      onboardingStatus: _nullableString(json['onboarding_status']),
      roles: _stringList(json['roles']),
      isGlobal: json['is_global'] == true,
      patient: patient == null ? null : PatientSummary.fromJson(patient),
      clinic: clinic == null ? null : ClinicSummary.fromJson(clinic),
      doctor: doctor == null ? null : DoctorSummary.fromJson(doctor),
    );
  }
}

class AuthenticatedSession {
  const AuthenticatedSession({
    required this.user,
    required this.clientType,
    required this.actorContext,
  });

  final AuthenticatedUser user;
  final String clientType;
  final String actorContext;

  factory AuthenticatedSession.fromJson(Map<String, dynamic> json) {
    final user = _requiredMap(json, 'user');
    return AuthenticatedSession(
      user: AuthenticatedUser.fromJson(user),
      clientType: _nullableString(json['client_type']) ?? 'mobile',
      actorContext: _requiredString(json, 'actor_context'),
    );
  }
}

class MobileAuthSession {
  const MobileAuthSession({
    required this.accessToken,
    required this.tokenType,
    required this.user,
    required this.actorContext,
    this.expiresAt,
    this.nextStep,
  });

  final String accessToken;
  final String tokenType;
  final AuthenticatedUser user;
  final String actorContext;
  final DateTime? expiresAt;
  final String? nextStep;

  factory MobileAuthSession.fromJson(Map<String, dynamic> json) {
    return MobileAuthSession(
      accessToken: _requiredString(json, 'access_token'),
      tokenType: _nullableString(json['token_type']) ?? 'Bearer',
      user: AuthenticatedUser.fromJson(_requiredMap(json, 'user')),
      actorContext: _requiredString(json, 'actor_context'),
      expiresAt: _nullableDateTime(json['expires_at']),
      nextStep: _nullableString(json['next_step']),
    );
  }

  AuthenticatedSession asAuthenticatedSession() {
    return AuthenticatedSession(
      user: user,
      clientType: 'mobile',
      actorContext: actorContext,
    );
  }
}

Map<String, dynamic> _requiredMap(Map<String, dynamic> source, String key) {
  final value = _nullableMap(source[key]);
  if (value == null) {
    throw FormatException('Missing object: $key');
  }
  return value;
}

Map<String, dynamic>? _nullableMap(Object? value) {
  if (value is! Map) {
    return null;
  }
  return value.map((key, item) => MapEntry(key.toString(), item));
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
  final value = _nullableInt(source[key]);
  if (value == null) {
    throw FormatException('Missing integer: $key');
  }
  return value;
}

int? _nullableInt(Object? value) {
  if (value is int) {
    return value;
  }
  if (value is num) {
    return value.toInt();
  }
  if (value is String) {
    return int.tryParse(value);
  }
  return null;
}

DateTime? _nullableDateTime(Object? value) {
  final text = _nullableString(value);
  return text == null ? null : DateTime.tryParse(text);
}

List<String> _stringList(Object? value) {
  if (value is! List) {
    return const <String>[];
  }
  return value.whereType<String>().toList(growable: false);
}

class MobilePatientProfile {
  const MobilePatientProfile({
    required this.id,
    required this.patientCode,
    required this.name,
    required this.email,
    required this.phoneNumber,
    required this.countryCode,
    required this.address,
    required this.emergencyContact,
    required this.insurance,
  });

  final int id;
  final String patientCode;
  final String name;
  final String? email;
  final String phoneNumber;
  final String countryCode;
  final String? address;
  final String? emergencyContact;
  final String? insurance;

  factory MobilePatientProfile.fromJson(Map<String, dynamic> json) {
    return MobilePatientProfile(
      id: _asInt(json['id']),
      patientCode: _asString(json['patient_code']) ?? '',
      name: _asString(json['name']) ?? '',
      email: _asString(json['email']),
      phoneNumber: _asString(json['phone_number']) ?? '',
      countryCode: _asString(json['country_code']) ?? 'MX',
      address: _asString(json['address']),
      emergencyContact: _asString(json['emergency_contact']),
      insurance: _asString(json['insurance']),
    );
  }
}

String? _asString(Object? value) =>
    value is String && value.trim().isNotEmpty ? value.trim() : null;

int _asInt(Object? value) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  return int.tryParse(value?.toString() ?? '') ?? 0;
}

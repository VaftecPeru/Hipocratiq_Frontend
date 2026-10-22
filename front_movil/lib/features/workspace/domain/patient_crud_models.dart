/// Lectura del contrato PatientProfileResource del monolito Laravel.
/// No persiste información clínica fuera de los servicios ya configurados.
class MobilePatientProfile {
  const MobilePatientProfile({
    required this.id,
    required this.patientCode,
    required this.name,
    required this.phoneNumber,
    required this.countryCode,
    this.email,
    this.address,
    this.emergencyContact,
    this.insurance,
    this.whatsappConsent = false,
    this.documentType,
    this.documentNumber,
    this.dateOfBirth,
    this.sex,
  });

  final int id;
  final String patientCode;
  final String name;
  final String phoneNumber;
  final String countryCode;
  final String? email;
  final String? address;
  final String? emergencyContact;
  final String? insurance;
  final bool whatsappConsent;
  final String? documentType;
  final String? documentNumber;
  final String? dateOfBirth;
  final String? sex;

  factory MobilePatientProfile.fromJson(Map<String, dynamic> json) {
    final id = json['id'];
    final name = json['name'];
    if (id is! int || id < 1 || name is! String || name.trim().isEmpty) {
      throw const FormatException('Perfil de paciente inválido.');
    }

    return MobilePatientProfile(
      id: id,
      patientCode: _text(json['patient_code']) ?? '',
      name: name.trim(),
      phoneNumber: _text(json['phone_number']) ?? '',
      countryCode: _text(json['country_code']) ?? 'MX',
      email: _text(json['email']),
      address: _text(json['address']),
      emergencyContact: _text(json['emergency_contact']),
      insurance: _text(json['insurance']),
      whatsappConsent: json['whatsapp_consent'] == true,
      documentType: _text(json['document_type']),
      documentNumber: _text(json['document_number']),
      dateOfBirth: _text(json['date_of_birth']),
      sex: _text(json['sex']),
    );
  }
}

String? _text(Object? value) {
  if (value is! String || value.trim().isEmpty) return null;
  return value.trim();
}

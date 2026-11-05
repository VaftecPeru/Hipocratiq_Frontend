// Mantiene los nombres públicos del constructor para la integración móvil.
// ignore_for_file: prefer_initializing_formals

import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/storage/secure_store.dart';
import '../domain/patient_crud_models.dart';

/// Un solo repositorio/contrato Laravel para Android y iOS.
class PatientCrudRepository {
  PatientCrudRepository({
    required ApiClient apiClient,
    required SecureStore secureStore,
  }) : _apiClient = apiClient,
       _secureStore = secureStore;

  final ApiClient _apiClient;
  final SecureStore _secureStore;

  static const _prefix = '/api/v1/auth/patient';

  static const _profileFields = <String>{
    'name',
    'email',
    'phone_number',
    'country_code',
    'document_type',
    'document_number',
    'date_of_birth',
    'sex',
    'address',
    'emergency_contact',
    'insurance',
    'whatsapp_consent',
  };

  Future<MobilePatientProfile> fetchProfile() async {
    final payload = await _apiClient.getJson(
      '$_prefix/profile',
      accessToken: await _accessToken(),
    );
    return MobilePatientProfile.fromJson(_object(payload['data']));
  }

  Future<MobilePatientProfile> updateProfile(
    Map<String, dynamic> changes,
  ) async {
    if (changes.isEmpty ||
        changes.keys.any((key) => !_profileFields.contains(key))) {
      throw ArgumentError.value(
        changes.keys.toList(),
        'changes',
        'Solo pueden editarse campos permitidos del perfil.',
      );
    }

    final payload = await _apiClient.patchJson(
      '$_prefix/profile',
      body: changes,
      accessToken: await _accessToken(),
    );
    return MobilePatientProfile.fromJson(_object(payload['data']));
  }

  Future<List<Map<String, dynamic>>> fetchAppointments() =>
      _fetchList('appointments');

  Future<List<Map<String, dynamic>>> fetchHistory() => _fetchList('history');

  Future<List<Map<String, dynamic>>> fetchPrescriptions() =>
      _fetchList('prescriptions');

  Future<List<Map<String, dynamic>>> fetchResults() => _fetchList('results');

  Future<Map<String, dynamic>?> fetchTriage() => _fetchNullableObject('triage');

  Future<Map<String, dynamic>> saveTriage(Map<String, dynamic> form) async {
    final payload = await _apiClient.postJson(
      '$_prefix/triage',
      body: form,
      accessToken: await _accessToken(),
    );
    return _object(payload['data']);
  }

  Future<Map<String, dynamic>> fetchIntakeDraft() async {
    final payload = await _apiClient.getJson(
      '$_prefix/intake-draft',
      accessToken: await _accessToken(),
    );
    return _object(payload['data']);
  }

  Future<Map<String, dynamic>> saveIntakeDraft(
    Map<String, dynamic> draft,
  ) async {
    final payload = await _apiClient.patchJson(
      '$_prefix/intake-draft',
      body: draft,
      accessToken: await _accessToken(),
    );
    return _object(payload['data']);
  }

  Future<List<Map<String, dynamic>>> _fetchList(String resource) async {
    final payload = await _apiClient.getJson(
      '$_prefix/$resource',
      accessToken: await _accessToken(),
    );
    final data = payload['data'];
    if (data is! List) {
      throw const FormatException('Lista de paciente no válida.');
    }
    return List<Map<String, dynamic>>.unmodifiable(data.map(_object));
  }

  Future<Map<String, dynamic>?> _fetchNullableObject(String resource) async {
    final payload = await _apiClient.getJson(
      '$_prefix/$resource',
      accessToken: await _accessToken(),
    );
    if (payload['data'] == null) return null;
    return _object(payload['data']);
  }

  Future<String> _accessToken() async {
    final token = await _secureStore.readAccessToken();
    if (token == null || token.trim().isEmpty) {
      throw const ApiException(
        message: 'Tu sesión móvil expiró. Vuelve a iniciar sesión.',
        statusCode: 401,
      );
    }
    return token;
  }

  static Map<String, dynamic> _object(Object? value) {
    if (value is! Map) {
      throw const FormatException('Respuesta clínica no válida.');
    }
    return value.map((key, value) => MapEntry(key.toString(), value));
  }
}

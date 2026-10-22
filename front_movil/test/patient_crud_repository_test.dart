import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import 'package:front_movil/core/network/api_client.dart';
import 'package:front_movil/core/network/api_exception.dart';
import 'package:front_movil/core/storage/secure_store.dart';
import 'package:front_movil/features/workspace/data/patient_crud_repository.dart';
import 'package:front_movil/features/workspace/domain/patient_crud_models.dart';

class _TokenStore extends SecureStore {
  _TokenStore(this.accessToken);

  final String? accessToken;

  @override
  Future<String?> readAccessToken() async => accessToken;
}

void main() {
  group('Flutter patient profile contract Android/iOS', () {
    final profileJson = <String, dynamic>{
      'id': 37,
      'patient_code': 'PAC-000037',
      'name': 'Paciente UAT',
      'phone_number': '+525512345678',
      'country_code': 'MX',
      'email': null,
      'address': 'Dirección de pruebas',
      'emergency_contact': null,
      'insurance': null,
      'whatsapp_consent': false,
    };

    test('rejects malformed identity instead of silently assigning id 0', () {
      expect(
        () => MobilePatientProfile.fromJson(<String, dynamic>{
          'id': null,
          'name': 'Paciente UAT',
        }),
        throwsFormatException,
      );
    });

    test('reads patient profile only with Sanctum Bearer token', () async {
      final client = MockClient((request) async {
        expect(request.method, 'GET');
        expect(
          request.url.toString(),
          'https://api.example.test/api/v1/auth/patient/profile',
        );
        expect(request.headers['authorization'], 'Bearer uat-token');
        return http.Response(jsonEncode(<String, dynamic>{
          'data': profileJson,
        }), 200);
      });
      final api = ApiClient(
        baseUri: Uri.parse('https://api.example.test'),
        client: client,
      );
      addTearDown(api.close);
      final repository = PatientCrudRepository(
        apiClient: api,
        secureStore: _TokenStore('uat-token'),
      );

      final profile = await repository.fetchProfile();
      expect(profile.id, 37);
      expect(profile.countryCode, 'MX');
      expect(profile.whatsappConsent, false);
    });

    test('submits PATCH with only editable profile fields', () async {
      final client = MockClient((request) async {
        expect(request.method, 'PATCH');
        expect(request.headers['authorization'], 'Bearer uat-token');
        expect(
          jsonDecode(request.body),
          <String, dynamic>{'name': 'Paciente Actualizado'},
        );
        return http.Response(
          jsonEncode(<String, dynamic>{
            'data': {...profileJson, 'name': 'Paciente Actualizado'},
          }),
          200,
        );
      });
      final api = ApiClient(
        baseUri: Uri.parse('https://api.example.test'),
        client: client,
      );
      addTearDown(api.close);
      final repository = PatientCrudRepository(
        apiClient: api,
        secureStore: _TokenStore('uat-token'),
      );

      final updated = await repository.updateProfile(
        <String, dynamic>{'name': 'Paciente Actualizado'},
      );
      expect(updated.name, 'Paciente Actualizado');
    });

    test('rejects unauthorized profile fields without hitting network', () async {
      final api = ApiClient(
        baseUri: Uri.parse('https://api.example.test'),
        client: MockClient((request) async => throw StateError('Network not allowed')),
      );
      addTearDown(api.close);
      final repository = PatientCrudRepository(
        apiClient: api,
        secureStore: _TokenStore('uat-token'),
      );
      expect(
        () => repository.updateProfile(<String, dynamic>{'clinic_id': 7}),
        throwsArgumentError,
      );
    });

    test('fails closed without a stored access token', () async {
      final api = ApiClient(
        baseUri: Uri.parse('https://api.example.test'),
        client: MockClient((request) async => throw StateError('Network not allowed')),
      );
      addTearDown(api.close);
      final repository = PatientCrudRepository(
        apiClient: api,
        secureStore: _TokenStore(null),
      );
      expect(
        () => repository.fetchProfile(),
        throwsA(isA<ApiException>().having(
          (exception) => exception.statusCode,
          'status',
          401,
        )),
      );
    });

    test('parses collections and rejects non-list clinical responses', () async {
      final client = MockClient((request) async {
        if (request.url.path.endsWith('/appointments')) {
          return http.Response(jsonEncode(<String, dynamic>{
            'data': <Map<String, dynamic>>[
              <String, dynamic>{'id': 1, 'status': 'confirmed'},
            ],
          }), 200);
        }
        return http.Response(jsonEncode(<String, dynamic>{
          'data': <String, dynamic>{'id': 5},
        }), 200);
      });
      final api = ApiClient(
        baseUri: Uri.parse('https://api.example.test'),
        client: client,
      );
      addTearDown(api.close);
      final repository = PatientCrudRepository(
        apiClient: api,
        secureStore: _TokenStore('uat-token'),
      );
      final appointments = await repository.fetchAppointments();
      expect(appointments.single['status'], 'confirmed');
      expect(() => repository.fetchHistory(), throwsFormatException);
    });
  });
}

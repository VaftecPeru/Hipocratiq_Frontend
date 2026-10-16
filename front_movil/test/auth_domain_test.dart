import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import 'package:front_movil/core/config/app_config.dart';
import 'package:front_movil/core/network/api_client.dart';
import 'package:front_movil/core/network/api_exception.dart';
import 'package:front_movil/features/auth/domain/auth_models.dart';
import 'package:front_movil/features/auth/domain/phone_number.dart';
import 'package:front_movil/features/auth/domain/registration_models.dart';

void main() {
  group('AppConfig', () {
    test(
      'allows explicitly configured HTTP localhost outside release builds',
      () {
        const config = AppConfig(
          backendUrl: 'http://localhost:8000/',
          supportPortalUrl: 'https://support.example.test/login#support',
          isReleaseBuild: false,
        );

        expect(config.backendUri, Uri.parse('http://localhost:8000/'));
        expect(
          config.secureSupportPortalUri,
          Uri.parse('https://support.example.test/login'),
        );
      },
    );

    test('rejects HTTP backend URLs in release builds', () {
      const config = AppConfig(
        backendUrl: 'http://api.example.test',
        supportPortalUrl: '',
        isReleaseBuild: true,
      );

      expect(config.backendUri, isNull);
    });

    test('accepts HTTPS backend URLs in release builds', () {
      const config = AppConfig(
        backendUrl: 'https://api.example.test',
        supportPortalUrl: '',
        isReleaseBuild: true,
      );

      expect(config.backendUri, Uri.parse('https://api.example.test'));
    });

    test('rejects unsafe or malformed support portal URLs', () {
      const httpConfig = AppConfig(
        backendUrl: '',
        supportPortalUrl: 'http://support.example.test',
      );
      const malformedConfig = AppConfig(
        backendUrl: '',
        supportPortalUrl: 'not-a-url',
      );

      expect(httpConfig.secureSupportPortalUri, isNull);
      expect(malformedConfig.secureSupportPortalUri, isNull);
    });
  });

  group('primary market', () {
    test('defaults authentication to Mexico without dropping secondary countries', () {
      expect(primaryCountry, CountryCode.mx);
      expect(CountryCode.fromCode('unknown'), CountryCode.mx);
      expect(toE164PhoneNumber('55 3456 7890', CountryCode.mx), '+525534567890');
      expect(toE164PhoneNumber('912 345 678', CountryCode.pe), '+51912345678');
    });
  });

  group('phone numbers', () {
    test('normalizes a Peruvian national number to E.164', () {
      expect(toE164PhoneNumber('912 345 678', CountryCode.pe), '+51912345678');
    });

    test('rejects a national number with the wrong length', () {
      expect(
        () => toE164PhoneNumber('912 345', CountryCode.pe),
        throwsA(isA<FormatException>()),
      );
    });
  });

  group('registration contracts', () {
    test('normalizes a doctor draft for the mobile API', () {
      const draft = DoctorRegistrationDraft(
        name: ' Dra. Ana Torres ',
        email: ' ANA@EXAMPLE.COM ',
        country: CountryCode.pe,
        phoneNumber: '912 345 678',
        medicalLicense: ' cmp-123 ',
        specialty: ' Cardiología ',
        practiceType: 'independent',
        clinicId: null,
        password: 'SecurePass123',
        passwordConfirmation: 'SecurePass123',
        termsAccepted: true,
      );

      expect(
        draft.toPayload(deviceName: 'Pixel 10', deviceId: 'device-1234567890'),
        <String, dynamic>{
          'client_type': 'mobile',
          'doctor_name': 'Dra. Ana Torres',
          'doctor_email': 'ana@example.com',
          'country_code': 'PE',
          'doctor_phone_number': '912345678',
          'medical_license': 'CMP-123',
          'specialty': 'Cardiología',
          'practice_type': 'independent',
          'clinic_id': null,
          'password': 'SecurePass123',
          'password_confirmation': 'SecurePass123',
          'terms_accepted': true,
          'device_name': 'Pixel 10',
          'device_id': 'device-1234567890',
        },
      );
    });

    test('parses a draft challenge and invitation response', () {
      final flow = RegistrationDraftSession.fromJson(<String, dynamic>{
        'draft_token': 'a' * 64,
        'next_step': 'verify_otp',
        'challenge_id': 'challenge-123',
        'expires_in': 300,
        'resend_after': 60,
        'resends_remaining': 4,
      });
      final invitation = ReceptionistInvitation.fromJson(<String, dynamic>{
        'invitation_token': 'b' * 64,
        'expires_at': '2026-09-02T20:00:00Z',
      });

      expect(flow.draftToken, 'a' * 64);
      expect(flow.nextStep, 'verify_otp');
      expect(flow.challenge?.challengeId, 'challenge-123');
      expect(flow.challenge?.expiresIn, const Duration(minutes: 5));
      expect(flow.challenge?.resendsRemaining, 4);
      expect(invitation.token, 'b' * 64);
      expect(invitation.expiresAt, isNotNull);
    });
  });

  group('ApiClient', () {
    test('posts JSON to the configured API path', () async {
      final client = MockClient((request) async {
        expect(request.method, 'POST');
        expect(
          request.url,
          Uri.parse('https://api.example.test/api/v1/auth/otp/request'),
        );
        expect(request.headers['accept'], 'application/json');
        expect(request.headers['content-type'], 'application/json');
        expect(jsonDecode(request.body), <String, dynamic>{'purpose': 'login'});

        return http.Response(
          jsonEncode(<String, dynamic>{
            'success': true,
            'data': <String, dynamic>{'challenge_id': 'challenge-id'},
          }),
          202,
        );
      });
      final apiClient = ApiClient(
        baseUri: Uri.parse('https://api.example.test'),
        client: client,
      );
      addTearDown(apiClient.close);

      final response = await apiClient.postJson(
        '/api/v1/auth/otp/request',
        body: <String, dynamic>{'purpose': 'login'},
      );

      expect(response['success'], isTrue);
    });

    test(
      'maps API validation errors without exposing framework text',
      () async {
        final client = MockClient((request) async {
          return http.Response(
            jsonEncode(<String, dynamic>{
              'message': 'The given data was invalid.',
              'errors': <String, dynamic>{
                'identifier': <String>['El identificador no es válido.'],
              },
            }),
            422,
          );
        });
        final apiClient = ApiClient(
          baseUri: Uri.parse('https://api.example.test'),
          client: client,
        );
        addTearDown(apiClient.close);

        expect(
          () => apiClient.postJson('/api/v1/auth/otp/request'),
          throwsA(
            isA<ApiException>()
                .having((error) => error.statusCode, 'status code', 422)
                .having(
                  (error) => error.fieldErrors['identifier']?.first,
                  'identifier error',
                  'El identificador no es válido.',
                ),
          ),
        );
      },
    );
  });
}

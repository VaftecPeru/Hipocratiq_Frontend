import 'package:flutter_test/flutter_test.dart';
import 'package:front_movil/features/workspace/domain/mobile_workspace.dart';

void main() {
  test('patient consent maps API payload and active state', () {
    final consent = MobilePatientConsent.fromJson(<String, dynamic>{
      'id': 42,
      'scope': 'ai_clinical_assistance',
      'policy_version': '2026-09',
      'status': 'granted',
      'source': 'digital',
      'effective_from': '2026-09-27T10:00:00Z',
      'effective_until': null,
      'revoked_at': null,
    });

    expect(consent.id, 42);
    expect(
      consent.scope,
      MobilePatientConsentScope.aiClinicalAssistance,
    );
    expect(consent.policyVersion, '2026-09');
    expect(consent.isGranted, isTrue);
  });

  test('revoked consent is not treated as active', () {
    final consent = MobilePatientConsent.fromJson(<String, dynamic>{
      'id': 43,
      'scope': 'telemedicine',
      'policy_version': '2026-09',
      'status': 'revoked',
      'source': 'digital',
      'effective_from': '2026-09-27T10:00:00Z',
      'effective_until': null,
      'revoked_at': '2026-09-27T11:00:00Z',
    });

    expect(consent.scope, MobilePatientConsentScope.telemedicine);
    expect(consent.isGranted, isFalse);
    expect(consent.revokedAt, isNotNull);
  });
}

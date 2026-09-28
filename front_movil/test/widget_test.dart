import 'package:flutter_test/flutter_test.dart';

import 'package:front_movil/app.dart';
import 'package:front_movil/core/config/app_config.dart';
import 'package:front_movil/features/auth/data/auth_repository.dart';
import 'package:front_movil/features/auth/domain/auth_models.dart';
import 'package:front_movil/features/auth/domain/registration_models.dart';
import 'package:front_movil/features/workspace/domain/mobile_workspace.dart';
import 'package:front_movil/features/auth/presentation/auth_controller.dart';

void main() {
  testWidgets('shows the mobile authentication entry point', (tester) async {
    final gateway = _FakeAuthGateway();
    final controller = AuthController(gateway);

    await tester.pumpWidget(
      HipocratiqApp(
        config: const AppConfig(backendUrl: '', supportPortalUrl: ''),
        authGateway: gateway,
        authController: controller,
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Bienvenido a HipocratiQ'), findsOneWidget);
    expect(find.text('Profesional de salud'), findsOneWidget);
    expect(find.text('Recepción'), findsOneWidget);
    expect(find.text('Paciente'), findsOneWidget);
    expect(find.text('Administrador'), findsOneWidget);
    expect(find.text('Crear cuenta de paciente'), findsOneWidget);
    expect(find.text('Soporte web'), findsOneWidget);
  });
}

class _FakeAuthGateway implements AuthGateway {
  @override
  Future<ReceptionistInvitation> createReceptionistInvitation({
    required String name,
    required String email,
    required CountryCode country,
    required String phoneNumber,
  }) {
    throw UnimplementedError();
  }

  @override
  Future<void> clearLocalSession() async {}

  @override
  Future<List<ClinicOption>> fetchDoctorClinics() async {
    return const <ClinicOption>[];
  }

  @override
  Future<List<PlanOption>> fetchRegistrationPlans() async {
    return const <PlanOption>[];
  }

  @override
  Future<List<ClinicOption>> fetchPatientClinics() async {
    return const <ClinicOption>[];
  }

  @override
  Future<void> logout({required bool allDevices}) async {}

  @override
  Future<List<MobilePatientConsent>> fetchPatientConsents() async => throw UnimplementedError();

  @override
  Future<MobilePatientConsent> grantPatientConsent(
    MobilePatientConsentScope scope, {
    String policyVersion = '2026-09',
  }) async => throw UnimplementedError();

  @override
  Future<MobilePatientConsent> revokePatientConsent(int consentId) async => throw UnimplementedError();

  @override
  Future<OtpChallenge> requestLogin({
    required AuthRole role,
    required String identifier,
    String? password,
  }) {
    throw UnimplementedError();
  }

  @override
  Future<OtpChallenge> requestPatientRegistration(RegistrationDraft draft) {
    throw UnimplementedError();
  }

  @override
  Future<OtpChallenge> requestPasswordReset(String identifier) {
    throw UnimplementedError();
  }

  @override
  Future<RegistrationDraftSession> requestClinicRegistration(
    ClinicRegistrationDraft draft,
  ) {
    throw UnimplementedError();
  }

  @override
  Future<RegistrationDraftSession> requestDoctorRegistration(
    DoctorRegistrationDraft draft,
  ) {
    throw UnimplementedError();
  }

  @override
  Future<OtpChallenge> requestReceptionistActivation(String invitationToken) {
    throw UnimplementedError();
  }

  @override
  Future<OtpChallenge> resendOtp(String challengeId) {
    throw UnimplementedError();
  }

  @override
  Future<OtpChallenge> resendClinicRegistration({required String draftToken}) {
    throw UnimplementedError();
  }

  @override
  Future<OtpChallenge> resendDoctorRegistration({required String draftToken}) {
    throw UnimplementedError();
  }

  @override
  Future<RegistrationDraftSession> selectClinicPlan({
    required String draftToken,
    required String plan,
    required String billingCycle,
  }) {
    throw UnimplementedError();
  }

  @override
  Future<RegistrationDraftSession> selectDoctorPlan({
    required String draftToken,
    required String plan,
    required String billingCycle,
  }) {
    throw UnimplementedError();
  }

  @override
  Future<AuthenticatedSession?> restoreSession() async {
    return null;
  }

  @override
  Future<void> resetPasswordWithOtp({
    required String challengeId,
    required String code,
    required String password,
    required String passwordConfirmation,
  }) {
    throw UnimplementedError();
  }

  @override
  Future<MobileAuthSession> verifyAuthenticationOtp({
    required OtpPurpose purpose,
    required String challengeId,
    required String code,
  }) {
    throw UnimplementedError();
  }

  @override
  Future<MobileAuthSession> verifyClinicRegistration({
    required String draftToken,
    required String challengeId,
    required String code,
  }) {
    throw UnimplementedError();
  }

  @override
  Future<MobileAuthSession> verifyDoctorRegistration({
    required String draftToken,
    required String challengeId,
    required String code,
  }) {
    throw UnimplementedError();
  }

  @override
  Future<MobileAuthSession> verifyReceptionistActivation({
    required String invitationToken,
    required String challengeId,
    required String code,
    required String password,
    required String passwordConfirmation,
  }) {
    throw UnimplementedError();
  }
}

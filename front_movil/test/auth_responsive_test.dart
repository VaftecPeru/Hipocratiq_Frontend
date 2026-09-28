import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:front_movil/core/theme/app_theme.dart';
import 'package:front_movil/core/widgets/loading_button.dart';
import 'package:front_movil/features/auth/data/auth_repository.dart';
import 'package:front_movil/features/auth/domain/auth_models.dart';
import 'package:front_movil/features/auth/domain/registration_models.dart';
import 'package:front_movil/features/workspace/domain/mobile_workspace.dart';
import 'package:front_movil/features/auth/presentation/auth_controller.dart';
import 'package:front_movil/features/auth/presentation/professional_registration_page.dart';
import 'package:front_movil/features/auth/presentation/password_recovery_views.dart';
import 'package:front_movil/features/auth/presentation/role_selection_page.dart';
import 'package:front_movil/features/auth/presentation/widgets/auth_fields.dart';
import 'package:front_movil/features/auth/presentation/widgets/otp_countdown.dart';
import 'package:front_movil/features/auth/presentation/widgets/terms_consent_field.dart';

void main() {
  testWidgets('auth entry adapts across phone, tablet, landscape and scale', (
    tester,
  ) async {
    final cases = <({Size size, double scale})>[
      (size: const Size(320, 720), scale: 1),
      (size: const Size(360, 720), scale: 1.3),
      (size: const Size(411, 820), scale: 2),
      (size: const Size(600, 480), scale: 1.3),
      (size: const Size(768, 480), scale: 2),
    ];

    for (final testCase in cases) {
      await _pumpAt(
        tester,
        size: testCase.size,
        textScale: testCase.scale,
        child: RoleSelectionPage(
          onRoleSelected: (_) {},
          onRegisterPatient: () {},
          onRegisterDoctor: () {},
          onRegisterClinic: () {},
          onActivateReceptionist: () {},
          onRecoverPassword: () {},
          onOpenSupport: () {},
        ),
      );

      expect(
        tester.takeException(),
        isNull,
        reason:
            'Unexpected layout exception at ${testCase.size}, scale ${testCase.scale}',
      );
      for (final role in AuthRole.values) {
        expect(find.text(role.label), findsOneWidget);
      }
    }
  });

  testWidgets('role cards preserve adaptive selection and touch targets', (
    tester,
  ) async {
    AuthRole? selectedRole;
    await _pumpAt(
      tester,
      size: const Size(320, 720),
      child: RoleSelectionPage(
        onRoleSelected: (role) => selectedRole = role,
        onRegisterPatient: () {},
        onRegisterDoctor: () {},
        onRegisterClinic: () {},
        onActivateReceptionist: () {},
        onRecoverPassword: () {},
        onOpenSupport: () {},
      ),
    );

    expect(find.text('Profesional de salud'), findsOneWidget);
    await tester.tap(find.text('Profesional de salud'));
    expect(selectedRole, AuthRole.healthcare);

    for (final button in tester.widgetList<OutlinedButton>(
      find.byType(OutlinedButton),
    )) {
      expect(
        tester.getSize(find.byWidget(button)).width,
        greaterThanOrEqualTo(44),
      );
      expect(
        tester.getSize(find.byWidget(button)).height,
        greaterThanOrEqualTo(44),
      );
    }
  });

  testWidgets('choice groups stack when the content is too narrow', (
    tester,
  ) async {
    await _pumpAt(
      tester,
      size: const Size(320, 640),
      child: const IdentifierMethodToggle(
        value: AuthIdentifierType.phone,
        onChanged: _noopIdentifier,
      ),
    );
    expect(find.byType(SegmentedButton<AuthIdentifierType>), findsNothing);

    await _pumpAt(
      tester,
      size: const Size(411, 640),
      child: const IdentifierMethodToggle(
        value: AuthIdentifierType.phone,
        onChanged: _noopIdentifier,
      ),
    );
    expect(find.byType(SegmentedButton<AuthIdentifierType>), findsOneWidget);
  });

  testWidgets('OTP cells stay readable and touchable at 320dp', (tester) async {
    await _pumpAt(
      tester,
      size: const Size(320, 640),
      child: const SizedBox(
        width: 288,
        child: OtpCodeInput(value: '', onChanged: _noopString),
      ),
    );

    final fields = find.byType(TextField);
    expect(fields, findsNWidgets(6));
    for (final field in fields.evaluate()) {
      final size = tester.getSize(find.byWidget(field.widget));
      expect(size.width, greaterThanOrEqualTo(44));
      expect(size.height, greaterThanOrEqualTo(44));
    }
  });

  testWidgets(
    'recovery password rules update without replacing the whole step',
    (tester) async {
      final passwordController = TextEditingController();
      final confirmationController = TextEditingController();
      addTearDown(passwordController.dispose);
      addTearDown(confirmationController.dispose);

      await _pumpAt(
        tester,
        size: const Size(360, 800),
        child: SingleChildScrollView(
          child: RecoveryNewPasswordStep(
            passwordController: passwordController,
            confirmationController: confirmationController,
            isPasswordVisible: true,
            isConfirmationVisible: true,
            onPasswordVisibilityChanged: _noopVoid,
            onConfirmationVisibilityChanged: _noopVoid,
            onPasswordChanged: _noopString,
            onConfirmationChanged: _noopString,
            onResetPassword: _noopVoid,
            isSubmitting: false,
          ),
        ),
      );

      expect(find.byIcon(Icons.check_circle), findsNothing);
      await tester.enterText(find.byType(TextFormField).first, 'ValidPass123');
      await tester.pump();
      expect(find.byIcon(Icons.check_circle), findsNWidgets(3));
    },
  );

  testWidgets(
    'doctor clinics are fetched only after clinic practice is selected',
    (tester) async {
      final gateway = _AuthTestGateway();
      await _pumpAt(
        tester,
        size: const Size(411, 900),
        child: ProfessionalRegistrationPage(
          kind: RegistrationKind.doctor,
          authGateway: gateway,
          authController: AuthController(gateway),
        ),
      );
      await tester.pump();
      expect(gateway.doctorClinicFetches, 0);

      await tester.tap(find.text('Clínica'));
      await tester.pump();
      await tester.pump();
      expect(gateway.doctorClinicFetches, 1);

      await tester.tap(find.text('Independiente'));
      await tester.pump();
      await tester.tap(find.text('Clínica'));
      await tester.pump();
      expect(gateway.doctorClinicFetches, 1);
    },
  );

  testWidgets('terms and loading semantics are exposed', (tester) async {
    await _pumpAt(
      tester,
      size: const Size(360, 640),
      child: SingleChildScrollView(
        child: Column(
          children: [
            const TermsConsentField(
              value: false,
              label: 'Acepto los términos de servicio.',
              errorText: 'Debes aceptar los términos para continuar.',
              onChanged: _noopBool,
            ),
            PrimaryButton(
              label: 'Enviar código',
              onPressed: _noopVoid,
              isLoading: true,
            ),
          ],
        ),
      ),
    );

    expect(
      find.bySemanticsLabel(
        'Acepto los términos de servicio.. Error: Debes aceptar los términos para continuar.',
      ),
      findsOneWidget,
    );
    expect(find.bySemanticsLabel('Procesando Enviar código'), findsOneWidget);
  });

  testWidgets('OTP countdown stops notifying after both counters expire', (
    tester,
  ) async {
    final controller = OtpCountdownController(
      const OtpChallenge(
        challengeId: 'challenge',
        expiresIn: Duration(seconds: 1),
        resendAfter: Duration(seconds: 1),
      ),
    );
    addTearDown(controller.dispose);
    var notifications = 0;
    controller.addListener(() => notifications++);
    controller.start();

    await tester.pump(const Duration(seconds: 1));
    expect(controller.value.isComplete, isTrue);
    final notificationsAtExpiry = notifications;
    await tester.pump(const Duration(seconds: 3));
    expect(notifications, notificationsAtExpiry);
  });
}

Future<void> _pumpAt(
  WidgetTester tester, {
  required Size size,
  required Widget child,
  double textScale = 1,
}) async {
  await tester.binding.setSurfaceSize(size);
  await tester.pumpWidget(
    MediaQuery(
      data: MediaQueryData(
        size: size,
        textScaler: TextScaler.linear(textScale),
      ),
      child: MaterialApp(
        theme: buildAppTheme(),
        home: Scaffold(body: child),
      ),
    ),
  );
  await tester.pump();
}

void _noopVoid() {}
void _noopString(String value) {}
void _noopBool(bool value) {}
void _noopIdentifier(AuthIdentifierType value) {}

class _AuthTestGateway implements AuthGateway {
  int doctorClinicFetches = 0;

  @override
  Future<List<ClinicOption>> fetchDoctorClinics() async {
    doctorClinicFetches++;
    return const <ClinicOption>[
      ClinicOption(
        id: 1,
        name: 'Clínica Central',
        countryCode: 'PE',
        address: 'Av. Central 123',
      ),
    ];
  }

  @override
  Future<AuthenticatedSession?> restoreSession() async => null;

  @override
  Future<void> clearLocalSession() async {}

  @override
  Future<void> logout({required bool allDevices}) async {}


  @override
  Future<List<MobilePatientConsent>> fetchPatientConsents() => _unsupported();

  @override
  Future<MobilePatientConsent> grantPatientConsent(
    MobilePatientConsentScope scope, {
    String policyVersion = '2026-09',
  }) => _unsupported();

  @override
  Future<MobilePatientConsent> revokePatientConsent(int consentId) =>
      _unsupported();

  @override
  Future<List<ClinicOption>> fetchPatientClinics() => _unsupported();

  @override
  Future<List<PlanOption>> fetchRegistrationPlans() => _unsupported();

  @override
  Future<OtpChallenge> requestLogin({
    required AuthRole role,
    required String identifier,
    String? password,
  }) => _unsupported();

  @override
  Future<OtpChallenge> requestPatientRegistration(RegistrationDraft draft) =>
      _unsupported();

  @override
  Future<OtpChallenge> requestPasswordReset(String identifier) =>
      _unsupported();

  @override
  Future<RegistrationDraftSession> requestDoctorRegistration(
    DoctorRegistrationDraft draft,
  ) => _unsupported();

  @override
  Future<RegistrationDraftSession> selectDoctorPlan({
    required String draftToken,
    required String plan,
    required String billingCycle,
  }) => _unsupported();

  @override
  Future<MobileAuthSession> verifyDoctorRegistration({
    required String draftToken,
    required String challengeId,
    required String code,
  }) => _unsupported();

  @override
  Future<OtpChallenge> resendDoctorRegistration({required String draftToken}) =>
      _unsupported();

  @override
  Future<RegistrationDraftSession> requestClinicRegistration(
    ClinicRegistrationDraft draft,
  ) => _unsupported();

  @override
  Future<RegistrationDraftSession> selectClinicPlan({
    required String draftToken,
    required String plan,
    required String billingCycle,
  }) => _unsupported();

  @override
  Future<MobileAuthSession> verifyClinicRegistration({
    required String draftToken,
    required String challengeId,
    required String code,
  }) => _unsupported();

  @override
  Future<OtpChallenge> resendClinicRegistration({required String draftToken}) =>
      _unsupported();

  @override
  Future<ReceptionistInvitation> createReceptionistInvitation({
    required String name,
    required String email,
    required CountryCode country,
    required String phoneNumber,
  }) => _unsupported();

  @override
  Future<OtpChallenge> requestReceptionistActivation(String invitationToken) =>
      _unsupported();

  @override
  Future<MobileAuthSession> verifyReceptionistActivation({
    required String invitationToken,
    required String challengeId,
    required String code,
    required String password,
    required String passwordConfirmation,
  }) => _unsupported();

  @override
  Future<OtpChallenge> resendOtp(String challengeId) => _unsupported();

  @override
  Future<MobileAuthSession> verifyAuthenticationOtp({
    required OtpPurpose purpose,
    required String challengeId,
    required String code,
  }) => _unsupported();

  @override
  Future<void> resetPasswordWithOtp({
    required String challengeId,
    required String code,
    required String password,
    required String passwordConfirmation,
  }) => _unsupported();
}

Future<T> _unsupported<T>() => Future<T>.error(UnimplementedError());

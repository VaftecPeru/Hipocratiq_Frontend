import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:front_movil/core/theme/app_theme.dart';
import 'package:front_movil/features/auth/data/auth_repository.dart';
import 'package:front_movil/features/auth/domain/auth_models.dart';
import 'package:front_movil/features/auth/domain/registration_models.dart';
import 'package:front_movil/features/auth/presentation/auth_controller.dart';
import 'package:front_movil/features/auth/presentation/login_page.dart';
import 'package:front_movil/features/auth/presentation/otp_page.dart';
import 'package:front_movil/features/auth/presentation/patient_registration_page.dart';
import 'package:front_movil/features/auth/presentation/widgets/otp_countdown.dart';
import 'package:front_movil/features/auth/presentation/widgets/terms_consent_field.dart';
import 'package:front_movil/features/workspace/domain/mobile_workspace.dart';

void main() {
  testWidgets(
    'patient clinics fetch only after opening and then stays cached',
    (tester) async {
      final gateway = _CorrectiveAuthGateway();
      final authController = AuthController(gateway);
      addTearDown(authController.dispose);

      await _pumpAt(
        tester,
        size: const Size(411, 900),
        child: PatientRegistrationPage(
          authGateway: gateway,
          authController: authController,
        ),
      );
      expect(gateway.patientClinicFetches, 0);
      expect(find.text('Selecciona una clínica'), findsOneWidget);

      await tester.tap(find.text('Selecciona una clínica'));
      await tester.pumpAndSettle();
      expect(gateway.patientClinicFetches, 1);
      expect(find.byType(DropdownButtonFormField<int>), findsOneWidget);

      await tester.tap(find.byType(DropdownButtonFormField<int>));
      await tester.pump();
      expect(gateway.patientClinicFetches, 1);
      expect(find.text('Clínica Central'), findsOneWidget);
    },
  );

  testWidgets('patient clinic loading errors expose a retry action', (
    tester,
  ) async {
    final gateway = _CorrectiveAuthGateway()..failPatientClinicOnce = true;
    final authController = AuthController(gateway);
    addTearDown(authController.dispose);

    await _pumpAt(
      tester,
      size: const Size(360, 800),
      child: PatientRegistrationPage(
        authGateway: gateway,
        authController: authController,
      ),
    );
    await tester.tap(find.text('Selecciona una clínica'));
    await tester.pumpAndSettle();

    expect(
      find.text('No pudimos cargar las clínicas disponibles.'),
      findsOneWidget,
    );
    expect(find.text('Reintentar'), findsOneWidget);
    expect(
      find.bySemanticsLabel(
        'Error: No pudimos cargar las clínicas disponibles.',
      ),
      findsOneWidget,
    );

    await tester.tap(find.text('Reintentar'));
    await tester.pumpAndSettle();
    expect(gateway.patientClinicFetches, 2);
    expect(find.byType(DropdownButtonFormField<int>), findsOneWidget);
  });

  testWidgets('terms errors are visible and linked to the consent semantics', (
    tester,
  ) async {
    const error = 'Debes aceptar los términos para continuar.';
    const label = 'Acepto los términos de servicio.';
    await _pumpAt(
      tester,
      size: const Size(360, 640),
      child: const TermsConsentField(
        value: false,
        label: label,
        errorText: error,
        onChanged: _noopBool,
      ),
    );

    expect(find.text(error), findsOneWidget);
    expect(find.bySemanticsLabel('$label. Error: $error'), findsOneWidget);
    expect(find.byType(CheckboxListTile), findsOneWidget);
  });

  testWidgets('OTP expiry stops the timer before resend cooldown ends', (
    tester,
  ) async {
    final controller = OtpCountdownController(
      const OtpChallenge(
        challengeId: 'challenge',
        expiresIn: Duration(seconds: 1),
        resendAfter: Duration(seconds: 5),
      ),
    );
    addTearDown(controller.dispose);
    var notifications = 0;
    controller.addListener(() => notifications++);
    controller.start();

    expect(controller.isRunning, isTrue);
    await tester.pump(const Duration(seconds: 1));
    expect(controller.isExpired, isTrue);
    expect(controller.value.isComplete, isTrue);
    expect(controller.resendAfter, 5);
    expect(controller.isRunning, isFalse);
    final notificationsAtExpiry = notifications;

    await tester.pumpWidget(
      MaterialApp(
        theme: buildAppTheme(),
        home: Scaffold(
          body: Column(
            children: [
              OtpCountdownHeader(
                title: 'Código de seguridad',
                controller: controller,
              ),
              OtpResendActions(
                controller: controller,
                isSubmitting: false,
                onResend: _noopVoid,
              ),
            ],
          ),
        ),
      ),
    );
    expect(find.text('Expirado'), findsOneWidget);
    expect(
      find.text('El código expiró. Solicita un código nuevo.'),
      findsOneWidget,
    );
    expect(find.text('Solicitar nuevo código'), findsOneWidget);
    expect(find.text('Podrás reenviar el código en 0:05.'), findsNothing);

    await tester.pump(const Duration(seconds: 5));
    expect(notifications, notificationsAtExpiry);
  });

  testWidgets('OTP completion and route disposal leave no active timer', (
    tester,
  ) async {
    final controller = OtpCountdownController(
      const OtpChallenge(
        challengeId: 'challenge',
        expiresIn: Duration(seconds: 10),
        resendAfter: Duration.zero,
      ),
    );
    var notifications = 0;
    controller.addListener(() => notifications++);

    await tester.pumpWidget(
      MaterialApp(home: _CountdownRoute(controller: controller)),
    );
    expect(controller.isRunning, isTrue);
    await tester.tap(find.text('Complete challenge'));
    await tester.pump();
    expect(controller.isRunning, isFalse);
    final notificationsAfterCompletion = notifications;

    await tester.pump(const Duration(seconds: 3));
    expect(notifications, notificationsAfterCompletion);
    controller.reset(
      const OtpChallenge(
        challengeId: 'challenge-2',
        expiresIn: Duration(seconds: 10),
        resendAfter: Duration.zero,
      ),
    );
    expect(controller.isRunning, isTrue);
    final notificationsBeforeDisposal = notifications;
    await tester.pumpWidget(const SizedBox());
    await tester.pump(const Duration(seconds: 3));
    expect(controller.isRunning, isFalse);
    expect(notifications, notificationsBeforeDisposal);
  });

  testWidgets(
    'login and OTP headers remain usable at narrow width and high scale',
    (tester) async {
      final gateway = _CorrectiveAuthGateway();
      final authController = AuthController(gateway);
      addTearDown(authController.dispose);

      await _pumpAt(
        tester,
        size: const Size(320, 720),
        textScale: 2,
        child: LoginPage(
          role: AuthRole.patient,
          authGateway: gateway,
          authController: authController,
        ),
      );
      expect(find.text('Ingresar como paciente'), findsOneWidget);
      expect(tester.takeException(), isNull);

      await _pumpAt(
        tester,
        size: const Size(320, 720),
        textScale: 2,
        child: OtpPage(
          authGateway: gateway,
          challenge: const OtpChallenge(
            challengeId: 'challenge',
            expiresIn: Duration(seconds: 30),
            resendAfter: Duration(seconds: 5),
          ),
          destination: '+51 999 999 999',
          purpose: OtpPurpose.login,
        ),
      );
      expect(find.text('Verifica tu identidad'), findsOneWidget);
      expect(find.text('Código de seguridad'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );

  test('auth boundaries meet the WCAG non-text contrast threshold', () {
    expect(
      _contrastRatio(AppColors.line, AppColors.surface),
      greaterThanOrEqualTo(3),
    );
    expect(
      _contrastRatio(AppColors.line, AppColors.input),
      greaterThanOrEqualTo(3),
    );
    expect(
      _contrastRatio(AppColors.lineStrong, AppColors.surface),
      greaterThanOrEqualTo(3),
    );
    expect(
      _contrastRatio(AppColors.warning, AppColors.warningSoft),
      greaterThanOrEqualTo(3),
    );
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

double _contrastRatio(Color first, Color second) {
  final firstLuminance = first.computeLuminance();
  final secondLuminance = second.computeLuminance();
  final lighter = firstLuminance > secondLuminance
      ? firstLuminance
      : secondLuminance;
  final darker = firstLuminance > secondLuminance
      ? secondLuminance
      : firstLuminance;
  return (lighter + 0.05) / (darker + 0.05);
}

void _noopBool(bool value) {}
void _noopVoid() {}

class _CountdownRoute extends StatefulWidget {
  const _CountdownRoute({required this.controller});

  final OtpCountdownController controller;

  @override
  State<_CountdownRoute> createState() => _CountdownRouteState();
}

class _CountdownRouteState extends State<_CountdownRoute> {
  @override
  void initState() {
    super.initState();
    widget.controller.start();
  }

  @override
  void dispose() {
    widget.controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: TextButton(
          onPressed: widget.controller.stop,
          child: const Text('Complete challenge'),
        ),
      ),
    );
  }
}

class _CorrectiveAuthGateway implements AuthGateway {
  int patientClinicFetches = 0;
  bool failPatientClinicOnce = false;

  @override
  Future<List<ClinicOption>> fetchPatientClinics() async {
    patientClinicFetches++;
    if (failPatientClinicOnce) {
      failPatientClinicOnce = false;
      throw StateError('clinic catalog unavailable');
    }
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
  Future<MobilePatientConsentSettings> fetchPatientConsents() => _unsupported();

  @override
  Future<MobilePatientConsent> grantPatientConsent(
    MobilePatientConsentScope scope, {
    String policyVersion = '2026-09',
  }) => _unsupported();

  @override
  Future<MobilePatientConsent> revokePatientConsent(int consentId) =>
      _unsupported();

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
  Future<List<PlanOption>> fetchRegistrationPlans() => _unsupported();

  @override
  Future<List<ClinicOption>> fetchDoctorClinics() => _unsupported();

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

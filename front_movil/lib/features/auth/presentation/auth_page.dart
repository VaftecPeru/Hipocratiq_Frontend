import 'package:flutter/material.dart';

import '../../../core/config/app_config.dart';
import '../data/auth_repository.dart';
import 'auth_controller.dart';
import 'login_page.dart';
import 'password_recovery_page.dart';
import 'patient_registration_page.dart';
import 'professional_registration_page.dart';
import 'receptionist_activation_page.dart';
import 'role_selection_page.dart';
import 'support_page.dart';
import '../domain/auth_models.dart';
import '../domain/registration_models.dart';

class AuthPage extends StatelessWidget {
  const AuthPage({
    required this.config,
    required this.authGateway,
    required this.authController,
    super.key,
  });

  final AppConfig config;
  final AuthGateway authGateway;
  final AuthController authController;

  @override
  Widget build(BuildContext context) {
    return RoleSelectionPage(
      onRoleSelected: (role) {
        if (config.authBypass) {
          authController.authenticate(_qaBypassSession(role));
          return;
        }

        pushAuthRoute(
          context,
          LoginPage(
            role: role,
            authGateway: authGateway,
            authController: authController,
          ),
        );
      },
      onRegisterPatient: () {
        pushAuthRoute(
          context,
          PatientRegistrationPage(
            authGateway: authGateway,
            authController: authController,
          ),
        );
      },
      onRegisterDoctor: () {
        pushAuthRoute(
          context,
          ProfessionalRegistrationPage(
            kind: RegistrationKind.doctor,
            authGateway: authGateway,
            authController: authController,
          ),
        );
      },
      onRegisterClinic: () {
        pushAuthRoute(
          context,
          ProfessionalRegistrationPage(
            kind: RegistrationKind.clinic,
            authGateway: authGateway,
            authController: authController,
          ),
        );
      },
      onActivateReceptionist: () {
        Navigator.of(context)
            .push<MobileAuthSession>(
              MaterialPageRoute<MobileAuthSession>(
                builder: (context) =>
                    ReceptionistActivationPage(authGateway: authGateway),
              ),
            )
            .then((session) {
              if (session != null) {
                return authController.authenticate(session);
              }
              return null;
            });
      },
      onRecoverPassword: () {
        pushAuthRoute(context, PasswordRecoveryPage(authGateway: authGateway));
      },
      onOpenSupport: () {
        pushAuthRoute(
          context,
          SupportPage(portalUri: config.secureSupportPortalUri),
        );
      },
    );
  }
}

void pushAuthRoute(BuildContext context, Widget page) {
  final reduceMotion = MediaQuery.maybeOf(context)?.disableAnimations ?? false;
  final duration = reduceMotion
      ? Duration.zero
      : const Duration(milliseconds: 220);

  Navigator.of(context).push(
    PageRouteBuilder<void>(
      pageBuilder: (context, animation, secondaryAnimation) => page,
      transitionDuration: duration,
      reverseTransitionDuration: duration,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        if (reduceMotion) {
          return child;
        }
        return FadeTransition(opacity: animation, child: child);
      },
    ),
  );
}

MobileAuthSession _qaBypassSession(AuthRole role) {
  final actorContext = switch (role) {
    AuthRole.healthcare => 'doctor',
    AuthRole.receptionist => 'receptionist',
    AuthRole.patient => 'patient',
    AuthRole.administrator => 'clinic_admin',
  };

  final roles = <String>[role.requestedRole];

  return MobileAuthSession(
    accessToken: 'qa-bypass-no-token',
    tokenType: 'QA',
    actorContext: actorContext,
    user: AuthenticatedUser(
      id: -1,
      name: 'Usuario QA',
      email: 'qa@hipocratiq.test',
      phoneNumber: '',
      countryCode: 'MX',
      status: 'qa',
      onboardingStatus: 'complete',
      roles: roles,
      isGlobal: false,
      patient: actorContext == 'patient' ? const PatientSummary() : null,
      clinic: actorContext == 'clinic_admin' || actorContext == 'receptionist'
          ? const ClinicSummary(
              id: -1,
              name: 'HIPOCRATIQ QA Clinic',
              status: 'qa',
              plan: 'QA',
            )
          : null,
      doctor: actorContext == 'doctor'
          ? const DoctorSummary(
              medicalLicense: 'QA-0001',
              specialty: 'Medicina general',
              practiceType: 'qa',
              clinic: null,
              plan: 'QA',
            )
          : null,
    ),
  );
}

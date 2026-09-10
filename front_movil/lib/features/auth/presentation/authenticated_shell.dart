import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/auth_scaffold.dart';
import '../../../core/widgets/loading_button.dart';
import '../data/auth_repository.dart';
import '../domain/auth_models.dart';
import 'auth_controller.dart';
import 'receptionist_invitation_page.dart';

class AuthenticatedShell extends StatelessWidget {
  const AuthenticatedShell({
    required this.session,
    required this.authGateway,
    required this.authController,
    super.key,
  });

  final AuthenticatedSession session;
  final AuthGateway authGateway;
  final AuthController authController;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: authController,
      builder: (context, child) {
        return AuthScaffold(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const _AuthenticatedMark(),
              const SizedBox(height: 24),
              Text(
                'Sesión segura activa',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: AppColors.ink,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.7,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                _description,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: AppColors.muted,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 24),
              _SessionCard(session: session),
              const SizedBox(height: 24),
              if (session.actorContext == 'clinic_admin') ...[
                SecondaryButton(
                  label: 'Invitar a recepción',
                  icon: Icons.person_add_alt_1_rounded,
                  onPressed: () => _openInvitationPage(context),
                ),
                const SizedBox(height: 10),
              ],
              PrimaryButton(
                label: 'Cerrar sesión en este dispositivo',
                icon: Icons.logout_rounded,
                onPressed: authController.isLoggingOut
                    ? null
                    : () => _logout(context, allDevices: false),
                isLoading: authController.isLoggingOut,
              ),
              const SizedBox(height: 10),
              SecondaryButton(
                label: 'Cerrar sesión en todos los dispositivos',
                icon: Icons.devices_outlined,
                onPressed: authController.isLoggingOut
                    ? null
                    : () => _logout(context, allDevices: true),
              ),
            ],
          ),
        );
      },
    );
  }

  String get _description {
    return switch (session.actorContext) {
      'patient' =>
        'Tu identidad fue validada. Pronto podrás consultar aquí la información de tu atención.',
      'doctor' =>
        'Tu identidad fue validada. El espacio profesional se abrirá con los permisos de tu práctica.',
      'clinic_admin' =>
        'Tu identidad fue validada. Desde aquí puedes gestionar invitaciones para el equipo de recepción.',
      'receptionist' =>
        'Tu identidad fue validada. Tu acceso de recepción está protegido por este dispositivo.',
      _ => 'Tu identidad fue validada y tu sesión móvil está activa.',
    };
  }

  Future<void> _openInvitationPage(BuildContext context) async {
    await Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (context) =>
            ReceptionistInvitationPage(authGateway: authGateway),
      ),
    );
  }

  Future<void> _logout(BuildContext context, {required bool allDevices}) async {
    if (allDevices) {
      final confirmed = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Cerrar todas las sesiones'),
          content: const Text(
            'Se cerrarán las sesiones móviles y web activas de tu cuenta.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Cancelar'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Cerrar todas'),
            ),
          ],
        ),
      );
      if (confirmed != true) {
        return;
      }
    }

    await authController.logout(allDevices: allDevices);
  }
}

class _SessionCard extends StatelessWidget {
  const _SessionCard({required this.session});

  final AuthenticatedSession session;

  @override
  Widget build(BuildContext context) {
    final user = session.user;
    final contact = user.email ?? user.phoneNumber;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.line),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0D10234C),
            blurRadius: 24,
            offset: Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            user.name,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: AppColors.ink,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            contact.isEmpty ? 'Contacto no disponible' : contact,
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: AppColors.muted),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _SessionTag(
                icon: Icons.badge_outlined,
                label: actorContextLabel(session.actorContext),
              ),
              const _SessionTag(
                icon: Icons.phone_android_outlined,
                label: 'Móvil',
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SessionTag extends StatelessWidget {
  const _SessionTag({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.accentSoft,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: AppColors.accent),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              color: AppColors.accent,
              fontSize: 12,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

class _AuthenticatedMark extends StatelessWidget {
  const _AuthenticatedMark();

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Sesión protegida',
      image: true,
      child: Center(
        child: Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            color: AppColors.accent,
            borderRadius: BorderRadius.circular(22),
            boxShadow: const [
              BoxShadow(
                color: Color(0x220862DD),
                blurRadius: 18,
                offset: Offset(0, 8),
              ),
            ],
          ),
          child: const Icon(
            Icons.verified_user_outlined,
            color: Colors.white,
            size: 34,
          ),
        ),
      ),
    );
  }
}

String actorContextLabel(String actorContext) {
  return switch (actorContext) {
    'patient' => 'Paciente',
    'doctor' => 'Profesional de salud',
    'receptionist' => 'Recepción',
    'clinic_admin' => 'Administrador',
    _ => 'Cuenta autenticada',
  };
}

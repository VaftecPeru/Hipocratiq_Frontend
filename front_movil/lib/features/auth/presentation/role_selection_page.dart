import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/auth_scaffold.dart';
import '../domain/auth_models.dart';

class RoleSelectionPage extends StatelessWidget {
  const RoleSelectionPage({
    required this.onRoleSelected,
    required this.onRegisterPatient,
    required this.onRegisterDoctor,
    required this.onRegisterClinic,
    required this.onActivateReceptionist,
    required this.onRecoverPassword,
    required this.onOpenSupport,
    super.key,
  });

  final ValueChanged<AuthRole> onRoleSelected;
  final VoidCallback onRegisterPatient;
  final VoidCallback onRegisterDoctor;
  final VoidCallback onRegisterClinic;
  final VoidCallback onActivateReceptionist;
  final VoidCallback onRecoverPassword;
  final VoidCallback onOpenSupport;

  @override
  Widget build(BuildContext context) {
    return AuthScaffold(
      footer: _FooterActions(
        onRecoverPassword: onRecoverPassword,
        onOpenSupport: onOpenSupport,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Bienvenido a HipocratiQ',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.w800,
              letterSpacing: -1.0,
              color: AppColors.ink,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Accede de forma segura a tu cuenta y continúa con tu atención.',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: AppColors.muted,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 22),
          const _SecurityNote(),
          const SizedBox(height: 28),
          Text(
            'Selecciona cómo ingresar',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w800,
              color: AppColors.ink,
            ),
          ),
          const SizedBox(height: 14),
          LayoutBuilder(
            builder: (context, constraints) {
              final textScale = MediaQuery.textScalerOf(context).scale(1);
              final columns = textScale >= 1.8
                  ? 1
                  : constraints.maxWidth >= 540
                  ? 4
                  : constraints.maxWidth >= 340
                  ? 2
                  : 1;
              final cardWidth =
                  (constraints.maxWidth - (columns - 1) * 10) / columns;
              return Wrap(
                spacing: 10,
                runSpacing: 10,
                children: AuthRole.values
                    .map(
                      (role) => SizedBox(
                        width: cardWidth,
                        child: _RoleCard(
                          role: role,
                          onPressed: () => onRoleSelected(role),
                        ),
                      ),
                    )
                    .toList(growable: false),
              );
            },
          ),
          const SizedBox(height: 22),
          OutlinedButton.icon(
            onPressed: onRegisterPatient,
            icon: const Icon(Icons.person_add_alt_1_rounded, size: 19),
            label: const Text('Crear cuenta de paciente'),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: onRegisterDoctor,
            icon: const Icon(Icons.medical_services_outlined, size: 19),
            label: const Text('Registrarme como profesional'),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: onRegisterClinic,
            icon: const Icon(Icons.business_outlined, size: 19),
            label: const Text('Registrar una clínica'),
          ),
          const SizedBox(height: 12),
          TextButton.icon(
            onPressed: onActivateReceptionist,
            icon: const Icon(Icons.mark_email_read_outlined, size: 19),
            label: const Text('Activar invitación de recepción'),
          ),
          const SizedBox(height: 12),
          Text(
            'Las cuentas de recepción solo se activan con una invitación emitida por una clínica.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: AppColors.muted,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}

class _SecurityNote extends StatelessWidget {
  const _SecurityNote();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.navyPanel,
        borderRadius: BorderRadius.circular(18),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final textScale = MediaQuery.textScalerOf(context).scale(1);
          final useStackedLayout =
              constraints.maxWidth < 360 || textScale >= 1.8;
          final icon = Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(11),
            ),
            child: const ExcludeSemantics(
              child: Icon(
                Icons.verified_user_outlined,
                color: Colors.white,
                size: 20,
              ),
            ),
          );
          final copy = Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Seguridad de grado médico',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                'Verificamos tu identidad con un código de un solo uso enviado a tu teléfono.',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.white.withValues(alpha: 0.78),
                  height: 1.45,
                ),
              ),
            ],
          );

          if (useStackedLayout) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [icon, const SizedBox(height: 12), copy],
            );
          }

          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              icon,
              const SizedBox(width: 12),
              Expanded(child: copy),
            ],
          );
        },
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  const _RoleCard({required this.role, required this.onPressed});

  final AuthRole role;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: '${role.label}. ${role.description}',
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          alignment: Alignment.topCenter,
          padding: const EdgeInsets.all(12),
          backgroundColor: AppColors.surface,
          side: const BorderSide(color: AppColors.line),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.accentSoft,
                borderRadius: BorderRadius.circular(14),
              ),
              child: ExcludeSemantics(
                child: Icon(_roleIcon(role), color: AppColors.accent, size: 22),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              role.label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppColors.ink,
                fontSize: 13,
                fontWeight: FontWeight.w800,
                height: 1.2,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              role.description,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppColors.muted,
                fontSize: 11,
                height: 1.3,
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _roleIcon(AuthRole role) {
    return switch (role) {
      AuthRole.healthcare => Icons.medical_services_outlined,
      AuthRole.receptionist => Icons.calendar_month_outlined,
      AuthRole.patient => Icons.person_outline_rounded,
      AuthRole.administrator => Icons.business_outlined,
    };
  }
}

class _FooterActions extends StatelessWidget {
  const _FooterActions({
    required this.onRecoverPassword,
    required this.onOpenSupport,
  });

  final VoidCallback onRecoverPassword;
  final VoidCallback onOpenSupport;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextButton(
          onPressed: onRecoverPassword,
          child: const Text('Recuperar contraseña'),
        ),
        const Divider(height: 1),
        const SizedBox(height: 10),
        TextButton.icon(
          onPressed: onOpenSupport,
          icon: const Icon(Icons.support_agent_outlined, size: 19),
          label: const Text('Soporte web'),
        ),
        const SizedBox(height: 4),
        Text(
          '© ${DateTime.now().year} HipocratiQ',
          textAlign: TextAlign.center,
          style: Theme.of(
            context,
          ).textTheme.bodySmall?.copyWith(color: AppColors.placeholder),
        ),
      ],
    );
  }
}

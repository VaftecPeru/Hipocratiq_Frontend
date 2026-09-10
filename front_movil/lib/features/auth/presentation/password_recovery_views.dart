import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/error_banner.dart';
import '../../../core/widgets/loading_button.dart';
import '../domain/auth_models.dart';
import 'widgets/auth_fields.dart';
import 'widgets/otp_countdown.dart';

class RecoveryIdentifierStep extends StatelessWidget {
  const RecoveryIdentifierStep({
    required this.identifierType,
    required this.country,
    required this.controller,
    required this.onIdentifierTypeChanged,
    required this.onCountryChanged,
    required this.onChanged,
    required this.onRequestCode,
    required this.isSubmitting,
    this.identifierError,
    this.globalError,
    super.key,
  });

  final AuthIdentifierType identifierType;
  final CountryCode country;
  final TextEditingController controller;
  final ValueChanged<AuthIdentifierType> onIdentifierTypeChanged;
  final ValueChanged<CountryCode> onCountryChanged;
  final ValueChanged<String> onChanged;
  final VoidCallback onRequestCode;
  final bool isSubmitting;
  final String? identifierError;
  final String? globalError;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Recupera tu contraseña',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: AppColors.ink,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.7,
          ),
        ),
        const SizedBox(height: 10),
        Text(
          'Te enviaremos un código al teléfono asociado a tu cuenta para que puedas crear una nueva contraseña.',
          style: Theme.of(
            context,
          ).textTheme.bodyLarge?.copyWith(color: AppColors.muted, height: 1.5),
        ),
        const SizedBox(height: 26),
        IdentifierMethodToggle(
          value: identifierType,
          onChanged: onIdentifierTypeChanged,
        ),
        const SizedBox(height: 20),
        if (identifierType == AuthIdentifierType.phone)
          CountryPhoneField(
            country: country,
            controller: controller,
            errorText: identifierError,
            onCountryChanged: onCountryChanged,
            onChanged: onChanged,
            onSubmitted: (_) => onRequestCode(),
          )
        else
          TextFormField(
            controller: controller,
            decoration: InputDecoration(
              labelText: 'Correo electrónico',
              hintText: 'nombre@correo.com',
              errorText: identifierError,
              prefixIcon: const Icon(Icons.mail_outline_rounded),
            ),
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.done,
            autofillHints: const <String>[AutofillHints.email],
            autocorrect: false,
            onChanged: onChanged,
            onFieldSubmitted: (_) => onRequestCode(),
            validator: (_) => null,
          ),
        if (globalError != null) ...[
          const SizedBox(height: 18),
          ErrorBanner(message: globalError!),
        ],
        const SizedBox(height: 24),
        PrimaryButton(
          label: 'Enviar código de recuperación',
          onPressed: onRequestCode,
          isLoading: isSubmitting,
        ),
      ],
    );
  }
}

class RecoveryOtpStep extends StatelessWidget {
  const RecoveryOtpStep({
    required this.destination,
    required this.code,
    required this.countdown,
    required this.onCodeChanged,
    required this.onContinue,
    required this.onResend,
    required this.isSubmitting,
    this.codeError,
    this.globalError,
    this.resendsRemaining,
    super.key,
  });

  final String destination;
  final String code;
  final OtpCountdownController countdown;
  final ValueChanged<String> onCodeChanged;
  final VoidCallback onContinue;
  final VoidCallback onResend;
  final bool isSubmitting;
  final String? codeError;
  final String? globalError;
  final int? resendsRemaining;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Código de recuperación',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: AppColors.ink,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.7,
          ),
        ),
        const SizedBox(height: 10),
        Text(
          'Enviamos un código de 6 dígitos a $destination.',
          style: Theme.of(
            context,
          ).textTheme.bodyLarge?.copyWith(color: AppColors.muted, height: 1.5),
        ),
        const SizedBox(height: 26),
        OtpCountdownHeader(title: 'Código de seguridad', controller: countdown),
        const SizedBox(height: 12),
        ValueListenableBuilder<OtpCountdownState>(
          valueListenable: countdown,
          builder: (context, state, child) => OtpCodeInput(
            value: code,
            enabled: !isSubmitting && !state.isExpired,
            hasError: codeError != null,
            errorText: codeError,
            onChanged: onCodeChanged,
          ),
        ),
        if (codeError != null) ...[
          const SizedBox(height: 8),
          ExcludeSemantics(
            child: Text(
              codeError!,
              style: const TextStyle(
                color: AppColors.danger,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
        if (globalError != null) ...[
          const SizedBox(height: 18),
          ErrorBanner(message: globalError!),
        ],
        const SizedBox(height: 24),
        ValueListenableBuilder<OtpCountdownState>(
          valueListenable: countdown,
          builder: (context, state, child) => PrimaryButton(
            label: 'Continuar',
            onPressed: state.isExpired ? null : onContinue,
            isLoading: isSubmitting,
          ),
        ),
        const SizedBox(height: 18),
        OtpResendActions(
          controller: countdown,
          isSubmitting: isSubmitting,
          onResend: onResend,
          resendsRemaining: resendsRemaining,
        ),
      ],
    );
  }
}

class RecoveryNewPasswordStep extends StatelessWidget {
  const RecoveryNewPasswordStep({
    required this.passwordController,
    required this.confirmationController,
    required this.isPasswordVisible,
    required this.isConfirmationVisible,
    required this.onPasswordVisibilityChanged,
    required this.onConfirmationVisibilityChanged,
    required this.onPasswordChanged,
    required this.onConfirmationChanged,
    required this.onResetPassword,
    required this.isSubmitting,
    this.passwordError,
    this.confirmationError,
    this.globalError,
    super.key,
  });

  final TextEditingController passwordController;
  final TextEditingController confirmationController;
  final bool isPasswordVisible;
  final bool isConfirmationVisible;
  final VoidCallback onPasswordVisibilityChanged;
  final VoidCallback onConfirmationVisibilityChanged;
  final ValueChanged<String> onPasswordChanged;
  final ValueChanged<String> onConfirmationChanged;
  final VoidCallback onResetPassword;
  final bool isSubmitting;
  final String? passwordError;
  final String? confirmationError;
  final String? globalError;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Crea una nueva contraseña',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: AppColors.ink,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.7,
          ),
        ),
        const SizedBox(height: 10),
        Text(
          'Usa una contraseña que puedas recordar y que mantenga tu cuenta protegida.',
          style: Theme.of(
            context,
          ).textTheme.bodyLarge?.copyWith(color: AppColors.muted, height: 1.5),
        ),
        const SizedBox(height: 24),
        PasswordField(
          controller: passwordController,
          label: 'Nueva contraseña',
          obscureText: !isPasswordVisible,
          errorText: passwordError,
          onChanged: onPasswordChanged,
          onVisibilityChanged: onPasswordVisibilityChanged,
          onSubmitted: (_) => onResetPassword(),
        ),
        const SizedBox(height: 16),
        PasswordField(
          controller: confirmationController,
          label: 'Confirmar contraseña',
          obscureText: !isConfirmationVisible,
          errorText: confirmationError,
          onChanged: onConfirmationChanged,
          onVisibilityChanged: onConfirmationVisibilityChanged,
          onSubmitted: (_) => onResetPassword(),
        ),
        const SizedBox(height: 18),
        ValueListenableBuilder<TextEditingValue>(
          valueListenable: passwordController,
          builder: (context, value, child) =>
              RecoveryPasswordRules(password: value.text),
        ),
        if (globalError != null) ...[
          const SizedBox(height: 18),
          ErrorBanner(message: globalError!),
        ],
        const SizedBox(height: 24),
        PrimaryButton(
          label: 'Restablecer contraseña',
          onPressed: onResetPassword,
          isLoading: isSubmitting,
        ),
      ],
    );
  }
}

class RecoverySuccessStep extends StatelessWidget {
  const RecoverySuccessStep({required this.onContinue, super.key});

  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const _RecoverySuccessMark(),
        const SizedBox(height: 24),
        Text(
          'Contraseña actualizada',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: AppColors.ink,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.7,
          ),
        ),
        const SizedBox(height: 10),
        Text(
          'Tu contraseña fue restablecida. Ya puedes volver a iniciar sesión desde la app.',
          textAlign: TextAlign.center,
          style: Theme.of(
            context,
          ).textTheme.bodyLarge?.copyWith(color: AppColors.muted, height: 1.5),
        ),
        const SizedBox(height: 28),
        PrimaryButton(label: 'Volver a iniciar sesión', onPressed: onContinue),
      ],
    );
  }
}

class RecoveryPasswordRule {
  const RecoveryPasswordRule(this.label, this.test);

  final String label;
  final bool Function(String value) test;
}

const recoveryPasswordRules = <RecoveryPasswordRule>[
  RecoveryPasswordRule('Mínimo 10 caracteres', _hasMinimumLength),
  RecoveryPasswordRule('Una mayúscula y una minúscula', _hasMixedCase),
  RecoveryPasswordRule('Un número', _hasNumber),
];

class RecoveryPasswordRules extends StatelessWidget {
  const RecoveryPasswordRules({required this.password, super.key});

  final String password;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surfaceSubtle,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Requisitos de seguridad',
            style: TextStyle(color: AppColors.ink, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 8),
          ...recoveryPasswordRules.map((rule) {
            final passes = password.isNotEmpty && rule.test(password);
            return Padding(
              padding: const EdgeInsets.only(bottom: 5),
              child: Semantics(
                label: '${rule.label}: ${passes ? 'Cumplido' : 'Pendiente'}',
                child: Row(
                  children: [
                    ExcludeSemantics(
                      child: Icon(
                        passes
                            ? Icons.check_circle
                            : Icons.radio_button_unchecked,
                        size: 17,
                        color: passes ? AppColors.success : AppColors.muted,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        rule.label,
                        style: TextStyle(
                          color: passes ? AppColors.success : AppColors.muted,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}

class _RecoverySuccessMark extends StatelessWidget {
  const _RecoverySuccessMark();

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Operación completada',
      image: true,
      child: Center(
        child: Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            color: AppColors.success,
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.successSoft, width: 8),
          ),
          child: const Icon(Icons.check_rounded, color: Colors.white, size: 32),
        ),
      ),
    );
  }
}

bool _hasMinimumLength(String value) => value.length >= 10;
bool _hasMixedCase(String value) =>
    RegExp(r'[A-Z]').hasMatch(value) && RegExp(r'[a-z]').hasMatch(value);
bool _hasNumber(String value) => RegExp(r'\d').hasMatch(value);

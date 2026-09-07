import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/auth_scaffold.dart';
import '../../../core/widgets/error_banner.dart';
import '../../../core/widgets/loading_button.dart';
import '../data/auth_repository.dart';
import '../domain/auth_models.dart';
import 'widgets/auth_fields.dart';
import 'widgets/otp_countdown.dart';

class ReceptionistActivationPage extends StatefulWidget {
  const ReceptionistActivationPage({required this.authGateway, super.key});

  final AuthGateway authGateway;

  @override
  State<ReceptionistActivationPage> createState() =>
      _ReceptionistActivationPageState();
}

class _ReceptionistActivationPageState
    extends State<ReceptionistActivationPage> {
  final _invitationController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmationController = TextEditingController();

  ActivationStep _step = ActivationStep.invitation;
  String _code = '';
  String _challengeId = '';
  int? _resendsRemaining;
  bool _isSubmitting = false;
  bool _isPasswordVisible = false;
  bool _isConfirmationVisible = false;
  String? _error;
  String? _codeError;
  final Map<String, String> _fieldErrors = <String, String>{};
  MobileAuthSession? _session;
  late final OtpCountdownController _countdown;

  @override
  void initState() {
    super.initState();
    _countdown = OtpCountdownController(
      const OtpChallenge(
        challengeId: '',
        expiresIn: Duration.zero,
        resendAfter: Duration.zero,
      ),
    );
  }

  @override
  void dispose() {
    _countdown.dispose();
    _invitationController.dispose();
    _passwordController.dispose();
    _confirmationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_session != null) {
      return _success(context);
    }

    return AuthScaffold(
      topAction: IconButton(
        onPressed: _handleBack,
        tooltip: _step == ActivationStep.invitation
            ? 'Volver'
            : 'Volver al paso anterior',
        icon: const Icon(Icons.arrow_back_rounded),
      ),
      child: switch (_step) {
        ActivationStep.invitation => _invitationStep(context),
        ActivationStep.verify => _verifyStep(context),
      },
    );
  }

  Widget _invitationStep(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Activa tu acceso de recepción',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: AppColors.ink,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.7,
          ),
        ),
        const SizedBox(height: 10),
        Text(
          'Usa el código de invitación enviado por la clínica. Solo las invitaciones vigentes pueden crear una cuenta.',
          style: Theme.of(
            context,
          ).textTheme.bodyLarge?.copyWith(color: AppColors.muted, height: 1.5),
        ),
        const SizedBox(height: 26),
        TextField(
          controller: _invitationController,
          decoration: InputDecoration(
            labelText: 'Código de invitación',
            hintText: 'Pega aquí el código de 64 caracteres',
            errorText: _fieldErrors['invitation_token'],
            prefixIcon: const Icon(Icons.key_outlined),
          ),
          maxLength: 64,
          keyboardType: TextInputType.visiblePassword,
          textInputAction: TextInputAction.done,
          autocorrect: false,
          enableSuggestions: false,
          inputFormatters: <TextInputFormatter>[
            FilteringTextInputFormatter.allow(RegExp('[A-Za-z0-9]')),
          ],
          onChanged: (_) => _clearFieldError('invitation_token'),
          onSubmitted: (_) => _requestCode(),
        ),
        if (_error != null) ...[
          const SizedBox(height: 18),
          ErrorBanner(message: _error!),
        ],
        const SizedBox(height: 12),
        PrimaryButton(
          label: 'Enviar código de activación',
          onPressed: _requestCode,
          isLoading: _isSubmitting,
        ),
      ],
    );
  }

  Widget _verifyStep(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Confirma tu invitación',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: AppColors.ink,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.7,
          ),
        ),
        const SizedBox(height: 10),
        Text(
          'Verifica el código enviado al teléfono indicado por tu clínica y define tu contraseña.',
          style: Theme.of(
            context,
          ).textTheme.bodyLarge?.copyWith(color: AppColors.muted, height: 1.5),
        ),
        const SizedBox(height: 26),
        OtpCountdownHeader(
          title: 'Código de seguridad',
          controller: _countdown,
        ),
        const SizedBox(height: 12),
        ValueListenableBuilder<OtpCountdownState>(
          valueListenable: _countdown,
          builder: (context, state, child) => OtpCodeInput(
            value: _code,
            enabled: !_isSubmitting && !state.isExpired,
            hasError: _codeError != null,
            errorText: _codeError,
            onChanged: (value) {
              final digits = value.replaceAll(RegExp(r'\D'), '');
              setState(() {
                _code = digits.length > 6 ? digits.substring(0, 6) : digits;
                _codeError = null;
                _error = null;
              });
            },
          ),
        ),
        if (_codeError != null) ...[
          const SizedBox(height: 8),
          ExcludeSemantics(
            child: Text(
              _codeError!,
              style: const TextStyle(
                color: AppColors.danger,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
        const SizedBox(height: 20),
        PasswordField(
          controller: _passwordController,
          label: 'Nueva contraseña',
          obscureText: !_isPasswordVisible,
          errorText: _fieldErrors['password'],
          onVisibilityChanged: () => setState(() {
            _isPasswordVisible = !_isPasswordVisible;
          }),
          onChanged: (_) => _clearFieldError('password'),
        ),
        const SizedBox(height: 16),
        PasswordField(
          controller: _confirmationController,
          label: 'Confirmar contraseña',
          obscureText: !_isConfirmationVisible,
          errorText: _fieldErrors['password_confirmation'],
          onVisibilityChanged: () => setState(() {
            _isConfirmationVisible = !_isConfirmationVisible;
          }),
          onChanged: (_) => _clearFieldError('password_confirmation'),
        ),
        const SizedBox(height: 8),
        Text(
          'Mínimo 10 caracteres, con mayúsculas, minúsculas y números.',
          style: Theme.of(
            context,
          ).textTheme.bodySmall?.copyWith(color: AppColors.muted),
        ),
        if (_error != null) ...[
          const SizedBox(height: 18),
          ErrorBanner(message: _error!),
        ],
        const SizedBox(height: 24),
        ValueListenableBuilder<OtpCountdownState>(
          valueListenable: _countdown,
          builder: (context, state, child) => PrimaryButton(
            label: 'Activar cuenta',
            onPressed: state.isExpired ? null : _verify,
            isLoading: _isSubmitting,
          ),
        ),
        const SizedBox(height: 12),
        OtpResendActions(
          controller: _countdown,
          isSubmitting: _isSubmitting,
          onResend: _resend,
          resendsRemaining: _resendsRemaining,
        ),
      ],
    );
  }

  Widget _success(BuildContext context) {
    return AuthScaffold(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Icon(
            Icons.verified_user_rounded,
            color: AppColors.success,
            size: 72,
            semanticLabel: 'Cuenta activada',
          ),
          const SizedBox(height: 24),
          Text(
            'Cuenta activada',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: AppColors.ink,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.7,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Tu acceso de recepción está listo. Puedes entrar desde este dispositivo.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: AppColors.muted,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 28),
          PrimaryButton(
            label: 'Entrar a mi cuenta',
            onPressed: () => Navigator.of(context).pop(_session),
          ),
        ],
      ),
    );
  }

  Future<void> _requestCode() async {
    if (_isSubmitting) {
      return;
    }
    final invitationToken = _invitationController.text.trim();
    if (!RegExp(r'^[A-Za-z0-9]{64}$').hasMatch(invitationToken)) {
      setState(() {
        _fieldErrors['invitation_token'] =
            'Ingresa el código completo de 64 caracteres.';
        _error = null;
      });
      return;
    }
    setState(() {
      _isSubmitting = true;
      _error = null;
      _fieldErrors.clear();
    });
    try {
      final challenge = await widget.authGateway.requestReceptionistActivation(
        invitationToken,
      );
      if (mounted) {
        setState(() {
          _challengeId = challenge.challengeId;
          _resendsRemaining = challenge.resendsRemaining;
          _step = ActivationStep.verify;
        });
        _countdown.reset(challenge);
      }
    } on Object catch (error) {
      if (mounted) {
        _applyError(error);
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  Future<void> _verify() async {
    final errors = <String, String>{};
    if (_code.length != 6) {
      errors['code'] = 'Completa los seis dígitos del código.';
    }
    final password = _passwordController.text;
    if (password.length < 10 ||
        !RegExp(r'[A-Z]').hasMatch(password) ||
        !RegExp(r'[a-z]').hasMatch(password) ||
        !RegExp(r'\d').hasMatch(password)) {
      errors['password'] =
          'Usa al menos 10 caracteres, con mayúsculas, minúsculas y números.';
    }
    if (_confirmationController.text != password) {
      errors['password_confirmation'] = 'Las contraseñas no coinciden.';
    }
    if (_countdown.expiresIn == 0) {
      errors['code'] = 'El código expiró. Solicita uno nuevo.';
    }
    if (errors.isNotEmpty) {
      setState(() {
        _fieldErrors
          ..clear()
          ..addAll(errors);
        _codeError = errors['code'];
        _error = null;
      });
      return;
    }

    setState(() {
      _isSubmitting = true;
      _error = null;
      _fieldErrors.clear();
      _codeError = null;
    });
    try {
      final session = await widget.authGateway.verifyReceptionistActivation(
        invitationToken: _invitationController.text.trim(),
        challengeId: _challengeId,
        code: _code,
        password: password,
        passwordConfirmation: _confirmationController.text,
      );
      if (mounted) {
        _countdown.stop();
        setState(() => _session = session);
      }
    } on Object catch (error) {
      if (mounted) {
        _applyError(error);
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  Future<void> _resend() async {
    if (_isSubmitting ||
        (!_countdown.isExpired && _countdown.resendAfter > 0)) {
      return;
    }
    setState(() {
      _isSubmitting = true;
      _error = null;
      _codeError = null;
    });
    try {
      final challenge = await widget.authGateway.resendOtp(_challengeId);
      if (mounted) {
        setState(() {
          _challengeId = challenge.challengeId;
          _resendsRemaining = challenge.resendsRemaining;
          _code = '';
        });
        _countdown.reset(challenge);
      }
    } on Object catch (error) {
      if (mounted) {
        _applyError(error);
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  void _handleBack() {
    if (_step == ActivationStep.invitation) {
      _countdown.stop();
      Navigator.of(context).maybePop();
      return;
    }
    setState(() {
      _step = ActivationStep.invitation;
      _countdown.stop();
      _error = null;
      _fieldErrors.clear();
    });
  }

  void _applyError(Object error) {
    if (error is ApiException && error.fieldErrors.isNotEmpty) {
      final nextErrors = <String, String>{};
      for (final field in <String>[
        'invitation_token',
        'code',
        'password',
        'password_confirmation',
      ]) {
        final message = error.fieldErrors[field]?.first;
        if (message != null) {
          nextErrors[field] = message;
        }
      }
      if (nextErrors.isNotEmpty) {
        setState(() {
          _fieldErrors
            ..clear()
            ..addAll(nextErrors);
          _codeError = nextErrors['code'];
          _error = null;
        });
        return;
      }
    }
    setState(() {
      _error = error is ApiException
          ? error.message
          : 'No pudimos activar la cuenta. Inténtalo nuevamente.';
    });
  }

  void _clearFieldError(String field) {
    if (_fieldErrors.containsKey(field) || _error != null) {
      setState(() {
        _fieldErrors.remove(field);
        _error = null;
      });
    }
  }
}

enum ActivationStep { invitation, verify }

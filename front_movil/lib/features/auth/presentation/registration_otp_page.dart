import 'package:flutter/material.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/auth_scaffold.dart';
import '../../../core/widgets/error_banner.dart';
import '../../../core/widgets/loading_button.dart';
import '../data/auth_repository.dart';
import '../domain/auth_models.dart';
import '../domain/registration_models.dart';
import 'widgets/otp_countdown.dart';
import 'widgets/auth_fields.dart';

class RegistrationOtpPage extends StatefulWidget {
  const RegistrationOtpPage({
    required this.kind,
    required this.authGateway,
    required this.draftToken,
    required this.challenge,
    required this.destination,
    super.key,
  });

  final RegistrationKind kind;
  final AuthGateway authGateway;
  final String draftToken;
  final OtpChallenge challenge;
  final String destination;

  @override
  State<RegistrationOtpPage> createState() => _RegistrationOtpPageState();
}

class _RegistrationOtpPageState extends State<RegistrationOtpPage> {
  late String _challengeId;
  int? _resendsRemaining;
  String _code = '';
  String? _error;
  String? _codeError;
  MobileAuthSession? _session;
  bool _isSubmitting = false;
  late final OtpCountdownController _countdown;

  @override
  void initState() {
    super.initState();
    _challengeId = widget.challenge.challengeId;
    _resendsRemaining = widget.challenge.resendsRemaining;
    _countdown = OtpCountdownController(widget.challenge)..start();
  }

  @override
  void dispose() {
    _countdown.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_session != null) {
      return _success(context);
    }

    return AuthScaffold(
      topAction: IconButton(
        onPressed: () => Navigator.of(context).maybePop(),
        tooltip: 'Volver',
        icon: const Icon(Icons.arrow_back_rounded),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Verifica tu teléfono',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: AppColors.ink,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.7,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Enviamos un código de 6 dígitos a ${widget.destination}.',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: AppColors.muted,
              height: 1.5,
            ),
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
          if (_error != null) ...[
            const SizedBox(height: 18),
            ErrorBanner(message: _error!),
          ],
          const SizedBox(height: 24),
          ValueListenableBuilder<OtpCountdownState>(
            valueListenable: _countdown,
            builder: (context, state, child) => PrimaryButton(
              label: 'Verificar código',
              onPressed: state.isExpired ? null : _verify,
              isLoading: _isSubmitting,
            ),
          ),
          const SizedBox(height: 18),
          OtpResendActions(
            controller: _countdown,
            isSubmitting: _isSubmitting,
            onResend: _resend,
            resendsRemaining: _resendsRemaining,
          ),
        ],
      ),
    );
  }

  Widget _success(BuildContext context) {
    return AuthScaffold(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Icon(
            Icons.check_circle_rounded,
            color: AppColors.success,
            size: 72,
            semanticLabel: 'Registro verificado',
          ),
          const SizedBox(height: 24),
          Text(
            'Registro verificado',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: AppColors.ink,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.7,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Tu cuenta está activa y protegida. Ya puedes entrar a tu espacio móvil.',
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

  Future<void> _verify() async {
    if (_code.length != 6) {
      setState(() => _codeError = 'Completa los seis dígitos del código.');
      return;
    }
    if (_countdown.expiresIn == 0) {
      setState(() => _error = 'El código expiró. Solicita uno nuevo.');
      return;
    }
    setState(() {
      _isSubmitting = true;
      _error = null;
      _codeError = null;
    });
    try {
      final session = widget.kind == RegistrationKind.doctor
          ? await widget.authGateway.verifyDoctorRegistration(
              draftToken: widget.draftToken,
              challengeId: _challengeId,
              code: _code,
            )
          : await widget.authGateway.verifyClinicRegistration(
              draftToken: widget.draftToken,
              challengeId: _challengeId,
              code: _code,
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
      final challenge = widget.kind == RegistrationKind.doctor
          ? await widget.authGateway.resendDoctorRegistration(
              draftToken: widget.draftToken,
            )
          : await widget.authGateway.resendClinicRegistration(
              draftToken: widget.draftToken,
            );
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

  void _applyError(Object error) {
    if (error is ApiException) {
      final codeError = error.fieldErrors['code']?.first;
      setState(() {
        _codeError = codeError;
        _error = codeError == null ? error.message : null;
      });
      return;
    }
    setState(
      () => _error = 'No pudimos verificar el código. Inténtalo nuevamente.',
    );
  }
}

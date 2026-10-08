import 'package:flutter/material.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/auth_scaffold.dart';
import '../../../core/widgets/error_banner.dart';
import '../../../core/widgets/loading_button.dart';
import '../data/auth_repository.dart';
import '../domain/auth_models.dart';
import '../uat_demo.dart';
import 'widgets/otp_countdown.dart';
import 'widgets/auth_fields.dart';

class OtpPage extends StatefulWidget {
  const OtpPage({
    required this.authGateway,
    required this.challenge,
    required this.destination,
    required this.purpose,
    this.uatRole,
    super.key,
  });

  final AuthGateway authGateway;
  final OtpChallenge challenge;
  final String destination;
  final OtpPurpose purpose;
  final AuthRole? uatRole;

  @override
  State<OtpPage> createState() => _OtpPageState();
}

class _OtpPageState extends State<OtpPage> {
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
      return _buildSuccess(context);
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
            widget.purpose == OtpPurpose.registration
                ? 'Verifica tu teléfono'
                : 'Verifica tu identidad',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: AppColors.ink,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.7,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            uatDemoEnabled
                ? 'Ingresa el código de prueba de ${uatDemoCode.length} dígitos para $destinationDescription.'
                : 'Enviamos un código de 6 dígitos a $destinationDescription.',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: AppColors.muted,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 28),
          OtpCountdownHeader(
            title: 'Código de seguridad',
            controller: _countdown,
          ),
          const SizedBox(height: 12),
          ValueListenableBuilder<OtpCountdownState>(
            valueListenable: _countdown,
            builder: (context, state, child) => OtpCodeInput(
              value: _code,
              codeLength: uatDemoEnabled ? uatDemoCode.length : 6,
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
          if (!uatDemoEnabled) ...[
            const SizedBox(height: 18),
            OtpResendActions(
              controller: _countdown,
              isSubmitting: _isSubmitting,
              onResend: _resend,
              resendsRemaining: _resendsRemaining,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSuccess(BuildContext context) {
    final isRegistration = widget.purpose == OtpPurpose.registration;
    return AuthScaffold(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _SuccessMark(),
          const SizedBox(height: 24),
          Text(
            isRegistration ? 'Cuenta activada' : 'Verificación exitosa',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: AppColors.ink,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.7,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            isRegistration
                ? 'Tu teléfono fue verificado. Tu plan podrá configurarse después desde una experiencia compatible.'
                : 'Tu identidad fue validada y tu sesión móvil está lista.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: AppColors.muted,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 28),
          PrimaryButton(
            label: 'Continuar',
            onPressed: () => Navigator.of(context).pop(_session),
          ),
        ],
      ),
    );
  }

  String get destinationDescription => widget.destination;

  Future<void> _verify() async {
    final expectedLength = uatDemoEnabled ? uatDemoCode.length : 6;
    if (_code.length != expectedLength) {
      setState(
        () => _codeError = 'Completa los $expectedLength dígitos del código.',
      );
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
      if (uatDemoEnabled) {
        if (_code != uatDemoCode || widget.uatRole == null) {
          setState(() => _codeError = 'Código de prueba incorrecto. Usa 1234.');
          return;
        }
        final session = createUatDemoSession(widget.uatRole!);
        if (mounted) {
          _countdown.stop();
          setState(() => _session = session);
        }
        return;
      }

      final session = await widget.authGateway.verifyAuthenticationOtp(
        purpose: widget.purpose,
        challengeId: _challengeId,
        code: _code,
      );
      if (mounted) {
        _countdown.stop();
        setState(() => _session = session);
      }
    } on Object catch (error) {
      if (!mounted) {
        return;
      }
      _applyError(error);
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
      if (!mounted) {
        return;
      }
      setState(() {
        _challengeId = challenge.challengeId;
        _resendsRemaining = challenge.resendsRemaining;
        _code = '';
      });
      _countdown.reset(challenge);
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
      if (codeError != null) {
        setState(() => _codeError = codeError);
        return;
      }
      setState(() => _error = error.message);
      return;
    }
    setState(
      () => _error = 'No pudimos verificar el código. Inténtalo nuevamente.',
    );
  }
}

class _SuccessMark extends StatelessWidget {
  const _SuccessMark();

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Verificación completada',
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
          child: const Icon(
            Icons.check_rounded,
            color: Colors.white,
            size: 32,
            semanticLabel: 'Correcto',
          ),
        ),
      ),
    );
  }
}

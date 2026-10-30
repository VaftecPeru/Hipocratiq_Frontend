import 'package:flutter/material.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/widgets/auth_scaffold.dart';
import '../data/auth_repository.dart';
import '../domain/auth_models.dart';
import '../domain/phone_number.dart';
import 'password_recovery_views.dart';
import 'widgets/otp_countdown.dart';

class PasswordRecoveryPage extends StatefulWidget {
  const PasswordRecoveryPage({required this.authGateway, super.key});

  final AuthGateway authGateway;

  @override
  State<PasswordRecoveryPage> createState() => _PasswordRecoveryPageState();
}

class _PasswordRecoveryPageState extends State<PasswordRecoveryPage> {
  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmationController = TextEditingController();
  AuthIdentifierType _identifierType = AuthIdentifierType.phone;
  CountryCode _country = primaryCountry;
  RecoveryStep _step = RecoveryStep.identifier;
  String _challengeId = '';
  String _code = '';
  String _destination = '';
  int? _resendsRemaining;
  bool _isSubmitting = false;
  bool _isPasswordVisible = false;
  bool _isConfirmationVisible = false;
  String? _globalError;
  String? _codeError;
  final Map<String, String> _fieldErrors = <String, String>{};
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
    _identifierController.dispose();
    _passwordController.dispose();
    _confirmationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AuthScaffold(
      topAction: IconButton(
        onPressed: _handleBack,
        tooltip: _step == RecoveryStep.identifier
            ? 'Volver'
            : 'Volver al paso anterior',
        icon: const Icon(Icons.arrow_back_rounded),
      ),
      child: AnimatedSwitcher(
        duration: MediaQuery.of(context).disableAnimations
            ? Duration.zero
            : const Duration(milliseconds: 180),
        child: switch (_step) {
          RecoveryStep.identifier => RecoveryIdentifierStep(
            key: const ValueKey('recovery-identifier'),
            identifierType: _identifierType,
            country: _country,
            controller: _identifierController,
            identifierError: _fieldErrors['identifier'],
            globalError: _globalError,
            isSubmitting: _isSubmitting,
            onIdentifierTypeChanged: _switchIdentifierType,
            onCountryChanged: _switchCountry,
            onChanged: (_) => _clearFieldError('identifier'),
            onRequestCode: _requestCode,
          ),
          RecoveryStep.otp => RecoveryOtpStep(
            key: const ValueKey('recovery-otp'),
            destination: _destination,
            code: _code,
            countdown: _countdown,
            codeError: _codeError,
            globalError: _globalError,
            resendsRemaining: _resendsRemaining,
            isSubmitting: _isSubmitting,
            onCodeChanged: _handleCodeChanged,
            onContinue: _continueWithCode,
            onResend: _resendCode,
          ),
          RecoveryStep.newPassword => RecoveryNewPasswordStep(
            key: const ValueKey('recovery-new-password'),
            passwordController: _passwordController,
            confirmationController: _confirmationController,
            isPasswordVisible: _isPasswordVisible,
            isConfirmationVisible: _isConfirmationVisible,
            passwordError: _fieldErrors['password'],
            confirmationError: _fieldErrors['password_confirmation'],
            globalError: _globalError,
            isSubmitting: _isSubmitting,
            onPasswordVisibilityChanged: () {
              setState(() => _isPasswordVisible = !_isPasswordVisible);
            },
            onConfirmationVisibilityChanged: () {
              setState(() => _isConfirmationVisible = !_isConfirmationVisible);
            },
            onPasswordChanged: (_) => _clearFieldError('password'),
            onConfirmationChanged: (_) =>
                _clearFieldError('password_confirmation'),
            onResetPassword: _resetPassword,
          ),
          RecoveryStep.success => RecoverySuccessStep(
            key: const ValueKey('recovery-success'),
            onContinue: () =>
                Navigator.of(context).popUntil((route) => route.isFirst),
          ),
        },
      ),
    );
  }

  Future<void> _requestCode() async {
    if (_isSubmitting) {
      return;
    }
    final identifier = _readIdentifier();
    if (identifier == null) {
      return;
    }

    setState(() {
      _isSubmitting = true;
      _globalError = null;
      _codeError = null;
      _fieldErrors.clear();
    });
    try {
      final challenge = await widget.authGateway.requestPasswordReset(
        identifier,
      );
      if (!mounted) {
        return;
      }
      setState(() {
        _challengeId = challenge.challengeId;
        _resendsRemaining = challenge.resendsRemaining;
        _destination = _identifierType == AuthIdentifierType.phone
            ? maskPhoneNumber(identifier)
            : 'tu teléfono registrado';
        _code = '';
        _step = RecoveryStep.otp;
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

  Future<void> _resendCode() async {
    if (_isSubmitting ||
        (!_countdown.isExpired && _countdown.resendAfter > 0)) {
      return;
    }
    setState(() {
      _isSubmitting = true;
      _globalError = null;
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

  void _handleCodeChanged(String value) {
    final digits = value.replaceAll(RegExp(r'\D'), '');
    setState(() {
      _code = digits.length > 6 ? digits.substring(0, 6) : digits;
      _codeError = null;
      _globalError = null;
    });
  }

  void _continueWithCode() {
    if (_code.length != 6) {
      setState(() => _codeError = 'Completa los seis dígitos del código.');
      return;
    }
    if (_countdown.expiresIn == 0) {
      setState(() => _globalError = 'El código expiró. Solicita uno nuevo.');
      return;
    }
    setState(() {
      _countdown.stop();
      _step = RecoveryStep.newPassword;
      _globalError = null;
      _fieldErrors.clear();
    });
  }

  Future<void> _resetPassword() async {
    final password = _passwordController.text;
    final confirmation = _confirmationController.text;
    final errors = <String, String>{};
    if (!recoveryPasswordRules.every((rule) => rule.test(password))) {
      errors['password'] =
          'La contraseña no cumple los requisitos de seguridad.';
    }
    if (confirmation.isEmpty) {
      errors['password_confirmation'] = 'Confirma tu nueva contraseña.';
    } else if (password != confirmation) {
      errors['password_confirmation'] = 'Las contraseñas no coinciden.';
    }
    if (errors.isNotEmpty) {
      setState(() {
        _fieldErrors
          ..clear()
          ..addAll(errors);
        _globalError = null;
      });
      return;
    }

    setState(() {
      _isSubmitting = true;
      _globalError = null;
      _fieldErrors.clear();
    });
    try {
      await widget.authGateway.resetPasswordWithOtp(
        challengeId: _challengeId,
        code: _code,
        password: password,
        passwordConfirmation: confirmation,
      );
      if (mounted) {
        setState(() {
          _passwordController.clear();
          _confirmationController.clear();
          _countdown.stop();
          _step = RecoveryStep.success;
        });
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

  String? _readIdentifier() {
    try {
      if (_identifierType == AuthIdentifierType.phone) {
        return toE164PhoneNumber(_identifierController.text, _country);
      }
      final email = _identifierController.text.trim().toLowerCase();
      if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email)) {
        throw const FormatException(
          'Usa un correo válido, por ejemplo nombre@correo.com.',
        );
      }
      return email;
    } on FormatException catch (error) {
      setState(() => _fieldErrors['identifier'] = error.message);
      return null;
    }
  }

  void _switchIdentifierType(AuthIdentifierType value) {
    setState(() {
      _identifierType = value;
      _identifierController.clear();
      _fieldErrors.remove('identifier');
      _globalError = null;
    });
  }

  void _switchCountry(CountryCode value) {
    setState(() {
      _country = value;
      _identifierController.clear();
      _fieldErrors.remove('identifier');
    });
  }

  void _handleBack() {
    if (_step == RecoveryStep.identifier || _step == RecoveryStep.success) {
      _countdown.stop();
      Navigator.of(context).maybePop();
      return;
    }
    setState(() {
      if (_step == RecoveryStep.newPassword) {
        _step = RecoveryStep.otp;
        _countdown.start();
      } else {
        _step = RecoveryStep.identifier;
        _countdown.stop();
      }
      _globalError = null;
      _fieldErrors.clear();
    });
  }

  void _applyError(Object error) {
    if (error is ApiException && error.fieldErrors.isNotEmpty) {
      final nextErrors = <String, String>{};
      for (final field in <String>[
        'identifier',
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
          if (nextErrors.containsKey('code')) {
            _step = RecoveryStep.otp;
            _codeError = nextErrors['code'];
            _countdown.start();
          }
          _globalError = null;
        });
        return;
      }
    }
    setState(() {
      _globalError = error is ApiException
          ? error.message
          : 'No pudimos completar la recuperación. Inténtalo nuevamente.';
    });
  }

  void _clearFieldError(String field) {
    if (_fieldErrors.containsKey(field) || _globalError != null) {
      setState(() {
        _fieldErrors.remove(field);
        _globalError = null;
      });
    }
  }
}

enum RecoveryStep { identifier, otp, newPassword, success }

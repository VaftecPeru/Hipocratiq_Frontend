import 'package:flutter/material.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/auth_scaffold.dart';
import '../../../core/widgets/error_banner.dart';
import '../../../core/widgets/loading_button.dart';
import '../data/auth_repository.dart';
import '../domain/auth_models.dart';
import '../domain/phone_number.dart';
import '../uat_demo.dart';
import 'auth_controller.dart';
import 'auth_page.dart';
import 'otp_page.dart';
import 'patient_registration_page.dart';
import 'password_recovery_page.dart';
import 'widgets/auth_fields.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({
    required this.role,
    required this.authGateway,
    required this.authController,
    super.key,
  });

  final AuthRole role;
  final AuthGateway authGateway;
  final AuthController authController;

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  CountryCode _country = CountryCode.pe;
  AuthIdentifierType _identifierType = AuthIdentifierType.phone;
  bool _isPasswordVisible = false;
  bool _isSubmitting = false;
  String? _globalError;
  final Map<String, String> _fieldErrors = <String, String>{};

  @override
  void dispose() {
    _phoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isPatient = widget.role == AuthRole.patient;
    return AuthScaffold(
      topAction: IconButton(
        onPressed: () => Navigator.of(context).maybePop(),
        tooltip: 'Volver a seleccionar tipo de cuenta',
        icon: const Icon(Icons.arrow_back_rounded),
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Ingresar como ${widget.role.label.toLowerCase()}',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: AppColors.ink,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.7,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              uatDemoEnabled
                  ? 'Modo UAT habilitado. Selecciona el rol y usa el código 1234 para ingresar a una sesión de prueba local.'
                  : (isPatient
                      ? 'Usaremos tu celular para verificar tu identidad y abrir tu espacio de paciente.'
                      : 'Ingresa tus credenciales. Después recibirás un código en el teléfono asociado a tu cuenta.'),
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: AppColors.muted,
                height: 1.5,
              ),
            ),
            if (uatDemoEnabled) ...[
              const SizedBox(height: 18),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.accentSoft,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.accent.withValues(alpha: 0.25)),
                ),
                child: const Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.science_outlined, color: AppColors.accent),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Acceso de prueba UAT · Código 1234 · No utiliza datos productivos.',
                        style: TextStyle(
                          color: AppColors.ink,
                          fontWeight: FontWeight.w800,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 26),
            if (!uatDemoEnabled) IdentifierMethodToggle(
              value: _identifierType,
              onChanged: (value) {
                setState(() {
                  _identifierType = value;
                  _fieldErrors.remove('identifier');
                  _globalError = null;
                });
              },
            ),
            if (!uatDemoEnabled) const SizedBox(height: 20),
            if (!uatDemoEnabled && _identifierType == AuthIdentifierType.phone)
              CountryPhoneField(
                country: _country,
                controller: _phoneController,
                errorText: _fieldErrors['identifier'],
                onCountryChanged: (country) {
                  setState(() {
                    _country = country;
                    _phoneController.clear();
                    _fieldErrors.remove('identifier');
                  });
                },
                onChanged: (_) {
                  _clearFieldError('identifier');
                },
                onSubmitted: (_) => _submit(),
              )
            else if (!uatDemoEnabled)
              TextFormField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: 'Correo electrónico',
                  hintText: 'nombre@correo.com',
                  errorText: _fieldErrors['identifier'],
                  prefixIcon: const Icon(Icons.mail_outline_rounded),
                ),
                keyboardType: TextInputType.emailAddress,
                textInputAction: widget.role.requiresPassword
                    ? TextInputAction.next
                    : TextInputAction.done,
                autofillHints: const <String>[
                  AutofillHints.username,
                  AutofillHints.email,
                ],
                autocorrect: false,
                onChanged: (_) => _clearFieldError('identifier'),
                onFieldSubmitted: (_) {
                  if (widget.role.requiresPassword) {
                    FocusScope.of(context).nextFocus();
                  } else {
                    _submit();
                  }
                },
                validator: (_) => null,
              ),
            if (!uatDemoEnabled && widget.role.requiresPassword) ...[
              const SizedBox(height: 20),
              LayoutBuilder(
                builder: (context, constraints) {
                  final textScale = MediaQuery.textScalerOf(context).scale(1);
                  final useStackedLayout =
                      constraints.maxWidth < 360 || textScale >= 1.8;
                  final forgotPassword = TextButton(
                    onPressed: () {
                      pushAuthRoute(
                        context,
                        PasswordRecoveryPage(authGateway: widget.authGateway),
                      );
                    },
                    child: const Text('¿Olvidaste tu contraseña?'),
                  );
                  final title = Text(
                    'Credencial de acceso',
                    style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      color: AppColors.ink,
                      fontWeight: FontWeight.w800,
                    ),
                  );

                  if (useStackedLayout) {
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        title,
                        Align(
                          alignment: Alignment.centerRight,
                          child: forgotPassword,
                        ),
                      ],
                    );
                  }

                  return Wrap(
                    alignment: WrapAlignment.spaceBetween,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    runSpacing: 4,
                    children: [title, forgotPassword],
                  );
                },
              ),
              PasswordField(
                controller: _passwordController,
                label: 'Contraseña',
                obscureText: !_isPasswordVisible,
                errorText: _fieldErrors['password'],
                onVisibilityChanged: () {
                  setState(() => _isPasswordVisible = !_isPasswordVisible);
                },
                onSubmitted: (_) => _submit(),
              ),
            ],
            if (_globalError != null) ...[
              const SizedBox(height: 20),
              ErrorBanner(message: _globalError!),
            ],
            const SizedBox(height: 24),
            PrimaryButton(
              label: uatDemoEnabled ? 'Continuar a código de prueba' : 'Enviar código de acceso',
              onPressed: _submit,
              isLoading: _isSubmitting,
            ),
            if (isPatient) ...[
              const SizedBox(height: 20),
              Text(
                '¿Aún no tienes cuenta?',
                textAlign: TextAlign.center,
                style: Theme.of(
                  context,
                ).textTheme.bodyMedium?.copyWith(color: AppColors.muted),
              ),
              TextButton(
                onPressed: () {
                  Navigator.of(context).pushReplacement(
                    PageRouteBuilder<void>(
                      pageBuilder: (context, animation, secondaryAnimation) =>
                          PatientRegistrationPage(
                            authGateway: widget.authGateway,
                            authController: widget.authController,
                          ),
                    ),
                  );
                },
                child: const Text('Crear cuenta de paciente'),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (_isSubmitting) {
      return;
    }

    if (uatDemoEnabled) {
      setState(() {
        _isSubmitting = true;
        _globalError = null;
        _fieldErrors.clear();
      });
      try {
        final session = await Navigator.of(context).push<MobileAuthSession>(
          _otpRoute(
            challenge: createUatDemoChallenge(),
            destination: 'sesión UAT · ${widget.role.label}',
            purpose: OtpPurpose.login,
            uatRole: widget.role,
          ),
        );
        if (session != null) {
          await widget.authController.authenticate(session);
        }
      } finally {
        if (mounted) {
          setState(() => _isSubmitting = false);
        }
      }
      return;
    }

    final identifier = _readIdentifier();
    if (identifier == null) {
      return;
    }
    if (widget.role.requiresPassword &&
        _passwordController.text.trim().isEmpty) {
      setState(() {
        _fieldErrors['password'] = 'Ingresa tu contraseña.';
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
      final challenge = await widget.authGateway.requestLogin(
        role: widget.role,
        identifier: identifier,
        password: widget.role.requiresPassword
            ? _passwordController.text
            : null,
      );
      if (!mounted) {
        return;
      }
      final destination = _identifierType == AuthIdentifierType.phone
          ? maskPhoneNumber(identifier)
          : 'tu teléfono registrado';
      final session = await Navigator.of(context).push<MobileAuthSession>(
        _otpRoute(
          challenge: challenge,
          destination: destination,
          purpose: OtpPurpose.login,
        ),
      );
      if (session != null) {
        await widget.authController.authenticate(session);
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

  String? _readIdentifier() {
    try {
      if (_identifierType == AuthIdentifierType.phone) {
        return toE164PhoneNumber(_phoneController.text, _country);
      }

      final email = _emailController.text.trim().toLowerCase();
      if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email)) {
        throw const FormatException(
          'Usa un correo válido, por ejemplo nombre@correo.com.',
        );
      }
      return email;
    } on FormatException catch (error) {
      setState(() {
        _fieldErrors['identifier'] = error.message;
        _globalError = null;
      });
      return null;
    }
  }

  void _applyError(Object error) {
    if (error is ApiException && error.fieldErrors.isNotEmpty) {
      final identifierError = error.fieldErrors['identifier']?.first;
      final passwordError = error.fieldErrors['password']?.first;
      if (identifierError != null || passwordError != null) {
        setState(() {
          if (identifierError != null) {
            _fieldErrors['identifier'] = identifierError;
          }
          if (passwordError != null) {
            _fieldErrors['password'] = passwordError;
          }
          _globalError = null;
        });
        return;
      }
    }

    setState(() {
      _globalError = error is ApiException
          ? error.message
          : 'No pudimos iniciar sesión. Inténtalo nuevamente.';
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

  Route<MobileAuthSession> _otpRoute({
    required OtpChallenge challenge,
    required String destination,
    required OtpPurpose purpose,
    AuthRole? uatRole,
  }) {
    final reduceMotion =
        MediaQuery.maybeOf(context)?.disableAnimations ?? false;
    final duration = reduceMotion
        ? Duration.zero
        : const Duration(milliseconds: 220);
    return PageRouteBuilder<MobileAuthSession>(
      pageBuilder: (context, animation, secondaryAnimation) => OtpPage(
        authGateway: widget.authGateway,
        challenge: challenge,
        destination: destination,
        purpose: purpose,
        uatRole: uatRole,
      ),
      transitionDuration: duration,
      reverseTransitionDuration: duration,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        if (reduceMotion) {
          return child;
        }
        return FadeTransition(opacity: animation, child: child);
      },
    );
  }
}

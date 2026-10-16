import 'package:flutter/material.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/auth_scaffold.dart';
import '../../../core/widgets/error_banner.dart';
import '../../../core/widgets/loading_button.dart';
import '../data/auth_repository.dart';
import '../domain/auth_models.dart';
import '../domain/phone_number.dart';
import 'auth_controller.dart';
import 'otp_page.dart';
import 'widgets/auth_fields.dart';
import 'widgets/terms_consent_field.dart';

part 'patient_clinic_widgets.dart';

class PatientRegistrationPage extends StatefulWidget {
  const PatientRegistrationPage({
    required this.authGateway,
    required this.authController,
    super.key,
  });

  final AuthGateway authGateway;
  final AuthController authController;

  @override
  State<PatientRegistrationPage> createState() =>
      _PatientRegistrationPageState();
}

class _PatientRegistrationPageState extends State<PatientRegistrationPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  CountryCode _country = primaryCountry;
  int? _clinicId;
  bool _termsAccepted = false;
  bool _isLoadingClinics = false;
  bool _clinicsLoaded = false;
  String? _clinicError;
  bool _isSubmitting = false;
  String? _globalError;
  final Map<String, String> _fieldErrors = <String, String>{};
  List<ClinicOption> _clinics = const <ClinicOption>[];

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AuthScaffold(
      topAction: IconButton(
        onPressed: () => Navigator.of(context).maybePop(),
        tooltip: 'Volver a iniciar sesión',
        icon: const Icon(Icons.arrow_back_rounded),
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Crea tu cuenta de paciente',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: AppColors.ink,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.7,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'Registra tus datos y verifica tu teléfono. El plan se configurará después desde una experiencia compatible.',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: AppColors.muted,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 26),
            if (_isLoadingClinics)
              const _ClinicLoading()
            else if (_clinicError != null)
              _ClinicsUnavailable(
                message: _clinicError!,
                isError: true,
                onRetry: () => _loadClinics(),
              )
            else if (!_clinicsLoaded)
              _ClinicFieldTrigger(
                errorText: _fieldErrors['clinic_id'],
                onOpen: () => _loadClinics(),
              )
            else if (_clinics.isEmpty)
              _ClinicsUnavailable(
                message: 'No hay clínicas activas disponibles.',
                onRetry: () => _loadClinics(force: true),
              )
            else
              DropdownButtonFormField<int>(
                initialValue: _clinicId,
                isExpanded: true,
                decoration: InputDecoration(
                  labelText: 'Clínica',
                  hintText: 'Selecciona una clínica',
                  errorText: _fieldErrors['clinic_id'],
                  prefixIcon: const Icon(Icons.business_outlined),
                ),
                items: _clinics
                    .map(
                      (clinic) => DropdownMenuItem<int>(
                        value: clinic.id,
                        child: Text(
                          clinic.name,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    )
                    .toList(growable: false),
                onChanged: (value) {
                  setState(() {
                    _clinicId = value;
                    _fieldErrors.remove('clinic_id');
                    _globalError = null;
                  });
                },
                validator: (_) => null,
              ),
            const SizedBox(height: 20),
            Text(
              'Datos personales',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: AppColors.ink,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: 'Nombre completo',
                hintText: 'Ana Martínez',
                errorText: _fieldErrors['name'],
                prefixIcon: const Icon(Icons.person_outline_rounded),
              ),
              textCapitalization: TextCapitalization.words,
              textInputAction: TextInputAction.next,
              autofillHints: const <String>[AutofillHints.name],
              onChanged: (_) => _clearFieldError('name'),
              validator: (_) => null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _emailController,
              decoration: InputDecoration(
                labelText: 'Correo electrónico (opcional)',
                hintText: 'ana@correo.com',
                errorText: _fieldErrors['email'],
                prefixIcon: const Icon(Icons.mail_outline_rounded),
              ),
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              autofillHints: const <String>[AutofillHints.email],
              autocorrect: false,
              onChanged: (_) => _clearFieldError('email'),
              validator: (_) => null,
            ),
            const SizedBox(height: 16),
            CountryPhoneField(
              country: _country,
              controller: _phoneController,
              errorText: _fieldErrors['phone_number'],
              onCountryChanged: (country) {
                setState(() {
                  _country = country;
                  _phoneController.clear();
                  _fieldErrors.remove('phone_number');
                });
              },
              onChanged: (_) => _clearFieldError('phone_number'),
              onSubmitted: (_) => _submit(),
            ),
            const SizedBox(height: 18),
            TermsConsentField(
              label:
                  'Acepto los términos de servicio y el tratamiento de mis datos para gestionar mi atención.',
              value: _termsAccepted,
              errorText: _fieldErrors['terms_accepted'],
              onChanged: (value) {
                setState(() {
                  _termsAccepted = value;
                  _fieldErrors.remove('terms_accepted');
                });
              },
            ),
            if (_globalError != null) ...[
              const SizedBox(height: 18),
              ErrorBanner(message: _globalError!),
            ],
            const SizedBox(height: 24),
            PrimaryButton(
              label: 'Enviar código de verificación',
              onPressed: _submit,
              isLoading: _isSubmitting,
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => Navigator.of(context).maybePop(),
              child: const Text('Ya tengo una cuenta'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _loadClinics({bool force = false}) async {
    if ((!force && _clinicsLoaded) || _isLoadingClinics) {
      return;
    }
    setState(() {
      _isLoadingClinics = true;
      _clinicError = null;
      _globalError = null;
    });
    try {
      final clinics = await widget.authGateway.fetchPatientClinics();
      if (!mounted) {
        return;
      }
      setState(() {
        _clinics = clinics;
        _isLoadingClinics = false;
        _clinicsLoaded = true;
      });
    } on Object catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _isLoadingClinics = false;
        _clinicError = error is ApiException
            ? error.message
            : 'No pudimos cargar las clínicas disponibles.';
      });
    }
  }

  Future<void> _submit() async {
    if (_isSubmitting) {
      return;
    }

    final errors = _validate();
    setState(() {
      _fieldErrors
        ..clear()
        ..addAll(errors);
      _globalError = null;
    });
    if (errors.isNotEmpty) {
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final draft = RegistrationDraft(
        name: _nameController.text,
        email: _emailController.text,
        country: _country,
        phoneNumber: _phoneController.text,
        clinicId: _clinicId,
        termsAccepted: _termsAccepted,
      );
      final challenge = await widget.authGateway.requestPatientRegistration(
        draft,
      );
      if (!mounted) {
        return;
      }
      final session = await Navigator.of(context).push<MobileAuthSession>(
        _otpRoute(
          challenge: challenge,
          destination: maskPhoneNumber(
            toE164PhoneNumber(_phoneController.text, _country),
          ),
          purpose: OtpPurpose.registration,
        ),
      );
      if (session != null) {
        await widget.authController.authenticate(session);
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

  Map<String, String> _validate() {
    final errors = <String, String>{};
    if (_nameController.text.trim().length < 2) {
      errors['name'] = 'Ingresa tu nombre completo.';
    }
    final email = _emailController.text.trim();
    if (email.isNotEmpty &&
        !RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email)) {
      errors['email'] = 'Usa un correo válido.';
    }
    if (_clinicId == null) {
      errors['clinic_id'] = 'Selecciona una clínica.';
    }
    try {
      toE164PhoneNumber(_phoneController.text, _country);
    } on FormatException catch (error) {
      errors['phone_number'] = error.message;
    }
    if (!_termsAccepted) {
      errors['terms_accepted'] = 'Debes aceptar los términos para continuar.';
    }
    return errors;
  }

  void _applyError(Object error) {
    if (error is ApiException && error.fieldErrors.isNotEmpty) {
      final nextErrors = <String, String>{};
      for (final field in <String>[
        'name',
        'email',
        'clinic_id',
        'phone_number',
        'terms_accepted',
      ]) {
        final message = error.fieldErrors[field]?.first;
        if (message != null) {
          nextErrors[field] = message;
        }
      }
      if (nextErrors.isNotEmpty) {
        setState(
          () => _fieldErrors
            ..clear()
            ..addAll(nextErrors),
        );
        return;
      }
    }
    setState(() {
      _globalError = error is ApiException
          ? error.message
          : 'No pudimos iniciar el registro. Inténtalo nuevamente.';
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

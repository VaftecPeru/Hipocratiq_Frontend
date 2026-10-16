import 'package:flutter/material.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/auth_scaffold.dart';
import '../../../core/widgets/error_banner.dart';
import '../../../core/widgets/loading_button.dart';
import '../data/auth_repository.dart';
import '../domain/auth_models.dart';
import '../domain/phone_number.dart';
import '../domain/registration_models.dart';
import 'auth_controller.dart';
import 'registration_flow_pages.dart';
import 'widgets/adaptive_choice_group.dart';
import 'widgets/auth_fields.dart';
import 'widgets/terms_consent_field.dart';

part 'professional_registration_fields.dart';

class ProfessionalRegistrationPage extends StatefulWidget {
  const ProfessionalRegistrationPage({
    required this.kind,
    required this.authGateway,
    required this.authController,
    super.key,
  });

  final RegistrationKind kind;
  final AuthGateway authGateway;
  final AuthController authController;

  @override
  State<ProfessionalRegistrationPage> createState() =>
      _ProfessionalRegistrationPageState();
}

class _ProfessionalRegistrationPageState
    extends State<ProfessionalRegistrationPage> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _licenseController = TextEditingController();
  final _specialtyController = TextEditingController();
  final _clinicNameController = TextEditingController();
  final _taxIdController = TextEditingController();
  final _contactPhoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _adminNameController = TextEditingController();
  final _adminEmailController = TextEditingController();
  final _adminPhoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmationController = TextEditingController();

  CountryCode _country = CountryCode.mx;
  String _practiceType = 'independent';
  int? _clinicId;
  List<ClinicOption> _clinics = const <ClinicOption>[];
  bool _isLoadingClinics = false;
  bool _clinicsLoaded = false;
  bool _termsAccepted = false;
  bool _isSubmitting = false;
  bool _isPasswordVisible = false;
  bool _isConfirmationVisible = false;
  String? _globalError;
  final Map<String, String> _fieldErrors = <String, String>{};

  bool get isDoctor => widget.kind == RegistrationKind.doctor;

  void _updateState(VoidCallback callback) {
    setState(callback);
  }

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    for (final controller in <TextEditingController>[
      _nameController,
      _emailController,
      _phoneController,
      _licenseController,
      _specialtyController,
      _clinicNameController,
      _taxIdController,
      _contactPhoneController,
      _addressController,
      _adminNameController,
      _adminEmailController,
      _adminPhoneController,
      _passwordController,
      _confirmationController,
    ]) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
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
            isDoctor ? 'Crea tu cuenta profesional' : 'Registra tu clínica',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: AppColors.ink,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.7,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            isDoctor
                ? 'Completa tus datos profesionales. Verificaremos tu teléfono antes de activar el acceso.'
                : 'Registra la institución y su cuenta administradora. El plan se selecciona después de validar los datos.',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: AppColors.muted,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 26),
          if (isDoctor) _buildDoctorFields(context) else _buildClinicFields(),
          if (_globalError != null) ...[
            const SizedBox(height: 18),
            ErrorBanner(message: _globalError!),
          ],
          const SizedBox(height: 24),
          PrimaryButton(
            label: 'Continuar con el registro',
            onPressed: _submit,
            isLoading: _isSubmitting,
          ),
        ],
      ),
    );
  }

  Future<void> _loadClinics() async {
    if (!isDoctor || _clinicsLoaded || _isLoadingClinics) {
      return;
    }
    setState(() {
      _isLoadingClinics = true;
      _globalError = null;
    });
    try {
      final clinics = await widget.authGateway.fetchDoctorClinics();
      if (mounted) {
        setState(() {
          _clinics = clinics;
          _isLoadingClinics = false;
          _clinicsLoaded = true;
        });
      }
    } on Object catch (error) {
      if (mounted) {
        setState(() {
          _isLoadingClinics = false;
          _globalError = error is ApiException
              ? error.message
              : 'No pudimos cargar las clínicas activas.';
        });
      }
    }
  }

  Future<void> _submit() async {
    if (_isSubmitting) {
      return;
    }
    final errors = isDoctor ? _validateDoctor() : _validateClinic();
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
      final flow = isDoctor
          ? await widget.authGateway.requestDoctorRegistration(
              DoctorRegistrationDraft(
                name: _nameController.text,
                email: _emailController.text,
                country: _country,
                phoneNumber: _phoneController.text,
                medicalLicense: _licenseController.text,
                specialty: _specialtyController.text,
                practiceType: _practiceType,
                clinicId: _clinicId,
                password: _passwordController.text,
                passwordConfirmation: _confirmationController.text,
                termsAccepted: _termsAccepted,
              ),
            )
          : await widget.authGateway.requestClinicRegistration(
              ClinicRegistrationDraft(
                clinicName: _clinicNameController.text,
                taxId: _taxIdController.text,
                country: _country,
                contactPhone: _contactPhoneController.text,
                address: _addressController.text,
                adminName: _adminNameController.text,
                adminEmail: _adminEmailController.text,
                adminPhone: _adminPhoneController.text,
                password: _passwordController.text,
                passwordConfirmation: _confirmationController.text,
                termsAccepted: _termsAccepted,
              ),
            );
      if (mounted) {
        await _continueFlow(flow);
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

  Future<void> _continueFlow(RegistrationDraftSession flow) async {
    final draftToken = flow.draftToken;
    if (draftToken == null) {
      setState(
        () => _globalError = 'El registro no devolvió una credencial temporal.',
      );
      return;
    }
    final destination = maskPhoneNumber(
      toE164PhoneNumber(
        isDoctor ? _phoneController.text : _adminPhoneController.text,
        _country,
      ),
    );
    final session = flow.challenge == null
        ? await Navigator.of(context).push<MobileAuthSession>(
            MaterialPageRoute<MobileAuthSession>(
              builder: (context) => RegistrationPlanPage(
                kind: widget.kind,
                authGateway: widget.authGateway,
                draftToken: draftToken,
                destination: destination,
              ),
            ),
          )
        : await Navigator.of(context).push<MobileAuthSession>(
            MaterialPageRoute<MobileAuthSession>(
              builder: (context) => RegistrationOtpPage(
                kind: widget.kind,
                authGateway: widget.authGateway,
                draftToken: draftToken,
                challenge: flow.challenge!,
                destination: destination,
              ),
            ),
          );
    if (session != null && mounted) {
      await widget.authController.authenticate(session);
    }
  }

  Map<String, String> _validateDoctor() {
    final errors = <String, String>{};
    _required(
      errors,
      'doctor_name',
      _nameController.text,
      'Ingresa tu nombre completo.',
    );
    _email(errors, 'doctor_email', _emailController.text);
    _phone(errors, 'doctor_phone_number', _phoneController.text);
    _required(
      errors,
      'medical_license',
      _licenseController.text,
      'Ingresa tu matrícula profesional.',
    );
    _required(
      errors,
      'specialty',
      _specialtyController.text,
      'Ingresa tu especialidad.',
    );
    if (_practiceType == 'clinic' && _clinicId == null) {
      errors['clinic_id'] = 'Selecciona una clínica.';
    }
    _password(errors);
    return errors;
  }

  Map<String, String> _validateClinic() {
    final errors = <String, String>{};
    _required(
      errors,
      'clinic_name',
      _clinicNameController.text,
      'Ingresa el nombre de la clínica.',
    );
    _required(
      errors,
      'tax_id',
      _taxIdController.text,
      'Ingresa la identificación fiscal.',
    );
    _phone(errors, 'contact_phone', _contactPhoneController.text);
    _required(
      errors,
      'address',
      _addressController.text,
      'Ingresa la dirección de la clínica.',
    );
    _required(
      errors,
      'admin_name',
      _adminNameController.text,
      'Ingresa el nombre del administrador.',
    );
    _email(errors, 'admin_email', _adminEmailController.text);
    _phone(errors, 'admin_phone_number', _adminPhoneController.text);
    _password(errors);
    return errors;
  }

  void _required(
    Map<String, String> errors,
    String field,
    String value,
    String message,
  ) {
    if (value.trim().isEmpty) {
      errors[field] = message;
    }
  }

  void _email(Map<String, String> errors, String field, String value) {
    final email = value.trim();
    if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email)) {
      errors[field] = 'Usa un correo válido.';
    }
  }

  void _phone(Map<String, String> errors, String field, String value) {
    try {
      toE164PhoneNumber(value, _country);
    } on FormatException catch (error) {
      errors[field] = error.message;
    }
  }

  void _password(Map<String, String> errors) {
    final password = _passwordController.text;
    final valid =
        password.length >= 10 &&
        RegExp(r'[A-Z]').hasMatch(password) &&
        RegExp(r'[a-z]').hasMatch(password) &&
        RegExp(r'\d').hasMatch(password);
    if (!valid) {
      errors['password'] =
          'Usa al menos 10 caracteres, con mayúsculas, minúsculas y números.';
    }
    if (_confirmationController.text != password) {
      errors['password_confirmation'] = 'Las contraseñas no coinciden.';
    }
    if (!_termsAccepted) {
      errors['terms_accepted'] = 'Debes aceptar los términos para continuar.';
    }
  }

  void _applyError(Object error) {
    if (error is ApiException && error.fieldErrors.isNotEmpty) {
      final knownFields = isDoctor
          ? <String>[
              'doctor_name',
              'doctor_email',
              'doctor_phone_number',
              'medical_license',
              'specialty',
              'clinic_id',
              'password',
              'terms_accepted',
            ]
          : <String>[
              'clinic_name',
              'tax_id',
              'contact_phone',
              'address',
              'admin_name',
              'admin_email',
              'admin_phone_number',
              'password',
              'terms_accepted',
            ];
      final fieldErrors = <String, String>{};
      for (final field in knownFields) {
        final message = error.fieldErrors[field]?.first;
        if (message != null) {
          fieldErrors[field] = message;
        }
      }
      if (fieldErrors.isNotEmpty) {
        setState(() {
          _fieldErrors
            ..clear()
            ..addAll(fieldErrors);
        });
        return;
      }
    }
    setState(() {
      _globalError = error is ApiException
          ? error.message
          : 'No pudimos iniciar el registro. Inténtalo nuevamente.';
    });
  }

  void _changeCountry(CountryCode country) {
    setState(() {
      _country = country;
      _phoneController.clear();
      _contactPhoneController.clear();
      _adminPhoneController.clear();
      _fieldErrors.removeWhere(
        (key, value) => key.contains('phone_number') || key.contains('phone'),
      );
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

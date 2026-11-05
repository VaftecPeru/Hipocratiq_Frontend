import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/auth_scaffold.dart';
import '../../../core/widgets/error_banner.dart';
import '../../../core/widgets/loading_button.dart';
import '../data/auth_repository.dart';
import '../domain/auth_models.dart';
import '../domain/phone_number.dart';
import '../domain/registration_models.dart';
import 'widgets/auth_fields.dart';

class ReceptionistInvitationPage extends StatefulWidget {
  const ReceptionistInvitationPage({required this.authGateway, super.key});

  final AuthGateway authGateway;

  @override
  State<ReceptionistInvitationPage> createState() =>
      _ReceptionistInvitationPageState();
}

class _ReceptionistInvitationPageState
    extends State<ReceptionistInvitationPage> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  CountryCode _country = CountryCode.mx;
  bool _isSubmitting = false;
  String? _error;
  ReceptionistInvitation? _invitation;
  final Map<String, String> _fieldErrors = <String, String>{};

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
        tooltip: 'Volver',
        icon: const Icon(Icons.arrow_back_rounded),
      ),
      child: _invitation == null ? _form(context) : _success(context),
    );
  }

  Widget _form(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Invitar a recepción',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: AppColors.ink,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.7,
          ),
        ),
        const SizedBox(height: 10),
        Text(
          'Genera un código para compartirlo con la persona que activará su cuenta desde la app móvil.',
          style: Theme.of(
            context,
          ).textTheme.bodyLarge?.copyWith(color: AppColors.muted, height: 1.5),
        ),
        const SizedBox(height: 26),
        _input(
          controller: _nameController,
          label: 'Nombre completo',
          hint: 'María López',
          field: 'name',
          icon: Icons.person_outline_rounded,
        ),
        const SizedBox(height: 16),
        _input(
          controller: _emailController,
          label: 'Correo electrónico (opcional)',
          hint: 'maria@correo.com',
          field: 'email',
          icon: Icons.mail_outline_rounded,
          keyboardType: TextInputType.emailAddress,
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
            });
          },
          onChanged: (_) => _clearError('phone_number'),
        ),
        if (_error != null) ...[
          const SizedBox(height: 18),
          ErrorBanner(message: _error!),
        ],
        const SizedBox(height: 24),
        PrimaryButton(
          label: 'Crear invitación',
          onPressed: _submit,
          isLoading: _isSubmitting,
        ),
      ],
    );
  }

  Widget _success(BuildContext context) {
    final invitation = _invitation!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Icon(
          Icons.mark_email_read_rounded,
          color: AppColors.success,
          size: 72,
          semanticLabel: 'Invitación creada',
        ),
        const SizedBox(height: 24),
        Text(
          'Invitación lista',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: AppColors.ink,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.7,
          ),
        ),
        const SizedBox(height: 10),
        Text(
          'Comparte este código con la persona invitada. Solo podrá usarse una vez antes de su vencimiento.',
          textAlign: TextAlign.center,
          style: Theme.of(
            context,
          ).textTheme.bodyLarge?.copyWith(color: AppColors.muted, height: 1.5),
        ),
        const SizedBox(height: 24),
        SelectableText(
          invitation.token,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: AppColors.ink,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: () async {
            await Clipboard.setData(ClipboardData(text: invitation.token));
            if (context.mounted) {
              ScaffoldMessenger.of(
                context,
              ).showSnackBar(const SnackBar(content: Text('Código copiado.')));
            }
          },
          icon: const Icon(Icons.copy_outlined),
          label: const Text('Copiar código'),
        ),
        const SizedBox(height: 24),
        PrimaryButton(
          label: 'Volver al resumen',
          onPressed: () => Navigator.of(context).pop(),
        ),
      ],
    );
  }

  Widget _input({
    required TextEditingController controller,
    required String label,
    required String hint,
    required String field,
    required IconData icon,
    TextInputType? keyboardType,
  }) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        errorText: _fieldErrors[field],
        prefixIcon: Icon(icon),
      ),
      keyboardType: keyboardType,
      autocorrect: false,
      onChanged: (_) => _clearError(field),
      validator: (_) => null,
    );
  }

  Future<void> _submit() async {
    final errors = <String, String>{};
    if (_nameController.text.trim().length < 2) {
      errors['name'] = 'Ingresa el nombre completo.';
    }
    final email = _emailController.text.trim();
    if (email.isNotEmpty &&
        !RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email)) {
      errors['email'] = 'Usa un correo válido.';
    }
    try {
      toE164PhoneNumber(_phoneController.text, _country);
    } on FormatException catch (error) {
      errors['phone_number'] = error.message;
    }
    if (errors.isNotEmpty) {
      setState(() {
        _fieldErrors
          ..clear()
          ..addAll(errors);
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
      final invitation = await widget.authGateway.createReceptionistInvitation(
        name: _nameController.text,
        email: _emailController.text,
        country: _country,
        phoneNumber: _phoneController.text,
      );
      if (mounted) {
        setState(() => _invitation = invitation);
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
    if (error is ApiException && error.fieldErrors.isNotEmpty) {
      final fields = <String, String>{};
      for (final field in <String>['name', 'email', 'phone_number']) {
        final message = error.fieldErrors[field]?.first;
        if (message != null) {
          fields[field] = message;
        }
      }
      if (fields.isNotEmpty) {
        setState(
          () => _fieldErrors
            ..clear()
            ..addAll(fields),
        );
        return;
      }
    }
    setState(() {
      _error = error is ApiException
          ? error.message
          : 'No pudimos crear la invitación. Inténtalo nuevamente.';
    });
  }

  void _clearError(String field) {
    if (_fieldErrors.containsKey(field) || _error != null) {
      setState(() {
        _fieldErrors.remove(field);
        _error = null;
      });
    }
  }
}

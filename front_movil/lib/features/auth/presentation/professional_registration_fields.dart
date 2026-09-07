part of 'professional_registration_page.dart';

extension on _ProfessionalRegistrationPageState {
  Widget _buildDoctorFields(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _sectionTitle(context, 'Datos profesionales'),
        const SizedBox(height: 12),
        _input(
          controller: _nameController,
          label: 'Nombre completo',
          hint: 'Dra. Ana Martínez',
          field: 'doctor_name',
          icon: Icons.person_outline_rounded,
          capitalization: TextCapitalization.words,
        ),
        const SizedBox(height: 16),
        _input(
          controller: _emailController,
          label: 'Correo profesional',
          hint: 'ana@correo.com',
          field: 'doctor_email',
          icon: Icons.mail_outline_rounded,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 16),
        CountryPhoneField(
          country: _country,
          controller: _phoneController,
          errorText: _fieldErrors['doctor_phone_number'],
          onCountryChanged: _changeCountry,
          onChanged: (_) => _clearFieldError('doctor_phone_number'),
        ),
        const SizedBox(height: 16),
        _input(
          controller: _licenseController,
          label: 'Matrícula profesional',
          hint: 'CMP 123456',
          field: 'medical_license',
          icon: Icons.badge_outlined,
          capitalization: TextCapitalization.characters,
        ),
        const SizedBox(height: 16),
        _input(
          controller: _specialtyController,
          label: 'Especialidad',
          hint: 'Medicina interna',
          field: 'specialty',
          icon: Icons.local_hospital_outlined,
        ),
        const SizedBox(height: 20),
        Text(
          'Tipo de práctica',
          style: Theme.of(context).textTheme.labelLarge?.copyWith(
            color: AppColors.ink,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 8),
        AdaptiveChoiceGroup<String>(
          choices: const <AdaptiveChoice<String>>[
            AdaptiveChoice<String>(
              value: 'independent',
              label: 'Independiente',
              icon: Icons.person_pin_outlined,
            ),
            AdaptiveChoice<String>(
              value: 'clinic',
              label: 'Clínica',
              icon: Icons.business_outlined,
            ),
          ],
          value: _practiceType,
          onChanged: (value) {
            _updateState(() {
              _practiceType = value;
              _clinicId = null;
              _fieldErrors.remove('clinic_id');
              _globalError = null;
            });
            if (value == 'clinic') {
              _loadClinics();
            }
          },
        ),
        if (_practiceType == 'clinic') ...[
          const SizedBox(height: 16),
          if (_isLoadingClinics)
            const _InlineLoading(label: 'Cargando clínicas activas…')
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
                      child: Text(clinic.name, overflow: TextOverflow.ellipsis),
                    ),
                  )
                  .toList(growable: false),
              onChanged: (value) {
                _updateState(() {
                  _clinicId = value;
                  _fieldErrors.remove('clinic_id');
                });
              },
            ),
        ],
        const SizedBox(height: 24),
        _buildPasswordFields(context),
        const SizedBox(height: 16),
        TermsConsentField(
          label:
              'Acepto los términos de servicio y el tratamiento de mis datos.',
          value: _termsAccepted,
          errorText: _fieldErrors['terms_accepted'],
          onChanged: (value) => _updateState(() {
            _termsAccepted = value;
            _fieldErrors.remove('terms_accepted');
          }),
        ),
      ],
    );
  }

  Widget _buildClinicFields() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _sectionTitle(context, 'Datos de la clínica'),
        const SizedBox(height: 12),
        _input(
          controller: _clinicNameController,
          label: 'Nombre de la clínica',
          hint: 'Clínica Santa María',
          field: 'clinic_name',
          icon: Icons.business_outlined,
        ),
        const SizedBox(height: 16),
        _input(
          controller: _taxIdController,
          label: 'Identificación fiscal',
          hint: 'RUC o identificación institucional',
          field: 'tax_id',
          icon: Icons.receipt_long_outlined,
        ),
        const SizedBox(height: 16),
        CountryPhoneField(
          country: _country,
          controller: _contactPhoneController,
          errorText: _fieldErrors['contact_phone'],
          onCountryChanged: _changeCountry,
          onChanged: (_) => _clearFieldError('contact_phone'),
        ),
        const SizedBox(height: 16),
        _input(
          controller: _addressController,
          label: 'Dirección',
          hint: 'Av. Principal 123',
          field: 'address',
          icon: Icons.location_on_outlined,
          capitalization: TextCapitalization.sentences,
        ),
        const SizedBox(height: 24),
        _sectionTitle(context, 'Cuenta administradora'),
        const SizedBox(height: 12),
        _input(
          controller: _adminNameController,
          label: 'Nombre del administrador',
          hint: 'Carlos Pérez',
          field: 'admin_name',
          icon: Icons.person_outline_rounded,
          capitalization: TextCapitalization.words,
        ),
        const SizedBox(height: 16),
        _input(
          controller: _adminEmailController,
          label: 'Correo del administrador',
          hint: 'admin@clinica.com',
          field: 'admin_email',
          icon: Icons.mail_outline_rounded,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 16),
        CountryPhoneField(
          country: _country,
          controller: _adminPhoneController,
          errorText: _fieldErrors['admin_phone_number'],
          onCountryChanged: _changeCountry,
          onChanged: (_) => _clearFieldError('admin_phone_number'),
        ),
        const SizedBox(height: 24),
        _buildPasswordFields(context),
        const SizedBox(height: 16),
        TermsConsentField(
          label:
              'Acepto los términos de servicio y el tratamiento de mis datos.',
          value: _termsAccepted,
          errorText: _fieldErrors['terms_accepted'],
          onChanged: (value) => _updateState(() {
            _termsAccepted = value;
            _fieldErrors.remove('terms_accepted');
          }),
        ),
      ],
    );
  }

  Widget _buildPasswordFields(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Contraseña de acceso',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            color: AppColors.ink,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 12),
        PasswordField(
          controller: _passwordController,
          label: 'Contraseña',
          obscureText: !_isPasswordVisible,
          errorText: _fieldErrors['password'],
          onVisibilityChanged: () => _updateState(() {
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
          onVisibilityChanged: () => _updateState(() {
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
      ],
    );
  }

  Widget _sectionTitle(BuildContext context, String title) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
        color: AppColors.ink,
        fontWeight: FontWeight.w800,
      ),
    );
  }

  Widget _input({
    required TextEditingController controller,
    required String label,
    required String hint,
    required String field,
    required IconData icon,
    TextInputType? keyboardType,
    TextCapitalization capitalization = TextCapitalization.none,
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
      textCapitalization: capitalization,
      autocorrect: false,
      onChanged: (_) => _clearFieldError(field),
      validator: (_) => null,
    );
  }
}

class _InlineLoading extends StatelessWidget {
  const _InlineLoading({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      liveRegion: true,
      label: label,
      child: const Padding(
        padding: EdgeInsets.symmetric(vertical: 14),
        child: Center(child: CircularProgressIndicator()),
      ),
    );
  }
}

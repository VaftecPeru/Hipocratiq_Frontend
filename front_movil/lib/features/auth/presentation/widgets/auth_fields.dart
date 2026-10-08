import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../../core/theme/app_theme.dart';
import '../../domain/auth_models.dart';
import 'adaptive_choice_group.dart';

class IdentifierMethodToggle extends StatelessWidget {
  const IdentifierMethodToggle({
    required this.value,
    required this.onChanged,
    super.key,
  });

  final AuthIdentifierType value;
  final ValueChanged<AuthIdentifierType> onChanged;

  @override
  Widget build(BuildContext context) {
    return AdaptiveChoiceGroup<AuthIdentifierType>(
      choices: const [
        AdaptiveChoice<AuthIdentifierType>(
          value: AuthIdentifierType.phone,
          label: 'Celular',
          icon: Icons.smartphone_outlined,
        ),
        AdaptiveChoice<AuthIdentifierType>(
          value: AuthIdentifierType.email,
          label: 'Correo',
          icon: Icons.mail_outline_rounded,
        ),
      ],
      value: value,
      onChanged: onChanged,
    );
  }
}

class CountryPhoneField extends StatelessWidget {
  const CountryPhoneField({
    required this.country,
    required this.controller,
    required this.onCountryChanged,
    required this.onChanged,
    this.errorText,
    this.onSubmitted,
    super.key,
  });

  final CountryCode country;
  final TextEditingController controller;
  final ValueChanged<CountryCode> onCountryChanged;
  final ValueChanged<String> onChanged;
  final String? errorText;
  final ValueChanged<String>? onSubmitted;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Número de celular',
          style: Theme.of(context).textTheme.labelLarge?.copyWith(
            color: AppColors.ink,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 8),
        LayoutBuilder(
          builder: (context, constraints) {
            final textScale = MediaQuery.textScalerOf(context).scale(1);
            final useStackedLayout =
                constraints.maxWidth < 360 || textScale >= 1.8;
            final countryField = DropdownButtonFormField<CountryCode>(
              initialValue: country,
              isExpanded: true,
              decoration: const InputDecoration(
                labelText: 'País',
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 16,
                ),
              ),
              items: CountryCode.values
                  .map(
                    (item) => DropdownMenuItem<CountryCode>(
                      value: item,
                      child: Text('${item.code} +${item.dialCode}'),
                    ),
                  )
                  .toList(growable: false),
              onChanged: (value) {
                if (value != null) {
                  onCountryChanged(value);
                }
              },
            );
            final phoneField = TextFormField(
              controller: controller,
              decoration: InputDecoration(
                labelText: 'Celular',
                hintText: country.placeholder,
                errorText: errorText,
              ),
              keyboardType: TextInputType.phone,
              textInputAction: TextInputAction.done,
              autofillHints: const <String>[AutofillHints.telephoneNumber],
              inputFormatters: <TextInputFormatter>[
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(country.nationalLength),
              ],
              onChanged: onChanged,
              onFieldSubmitted: onSubmitted,
              validator: (_) => null,
            );

            if (useStackedLayout) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  countryField,
                  const SizedBox(height: 12),
                  phoneField,
                ],
              );
            }

            final countryWidth = constraints.maxWidth * 0.38;
            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: countryWidth.clamp(120.0, 136.0).toDouble(),
                  child: countryField,
                ),
                const SizedBox(width: 8),
                Expanded(child: phoneField),
              ],
            );
          },
        ),
        const SizedBox(height: 4),
        Text(
          'Recibirás el código de verificación por SMS.',
          style: Theme.of(
            context,
          ).textTheme.bodySmall?.copyWith(color: AppColors.muted),
        ),
      ],
    );
  }
}

class PasswordField extends StatelessWidget {
  const PasswordField({
    required this.controller,
    required this.label,
    required this.obscureText,
    required this.onVisibilityChanged,
    this.errorText,
    this.onChanged,
    this.onSubmitted,
    super.key,
  });

  final TextEditingController controller;
  final String label;
  final bool obscureText;
  final VoidCallback onVisibilityChanged;
  final String? errorText;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;

  @override
  Widget build(BuildContext context) {
    final visibilityLabel = obscureText
        ? 'Mostrar contraseña'
        : 'Ocultar contraseña';
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        errorText: errorText,
        prefixIcon: const Icon(Icons.lock_outline_rounded),
        suffixIcon: IconButton(
          onPressed: onVisibilityChanged,
          tooltip: visibilityLabel,
          icon: Icon(
            obscureText
                ? Icons.visibility_outlined
                : Icons.visibility_off_outlined,
          ),
        ),
      ),
      obscureText: obscureText,
      keyboardType: TextInputType.visiblePassword,
      textInputAction: TextInputAction.done,
      autofillHints: const <String>[AutofillHints.password],
      maxLength: 72,
      onChanged: onChanged,
      onFieldSubmitted: onSubmitted,
      validator: (_) => null,
    );
  }
}

class OtpCodeInput extends StatefulWidget {
  const OtpCodeInput({
    required this.value,
    required this.onChanged,
    this.codeLength = 6,
    this.enabled = true,
    this.hasError = false,
    this.errorText,
    super.key,
  }) : assert(codeLength >= 4 && codeLength <= 8);

  final String value;
  final ValueChanged<String> onChanged;
  final int codeLength;
  final bool enabled;
  final bool hasError;
  final String? errorText;

  @override
  State<OtpCodeInput> createState() => _OtpCodeInputState();
}

class _OtpCodeInputState extends State<OtpCodeInput> {
  late final List<TextEditingController> _controllers;
  late final List<FocusNode> _focusNodes;
  bool _isUpdatingControllers = false;

  @override
  void initState() {
    super.initState();
    _controllers = List<TextEditingController>.generate(
      widget.codeLength,
      (index) => TextEditingController(text: _digitAt(index, widget.value)),
    );
    _focusNodes = List<FocusNode>.generate(widget.codeLength, (_) => FocusNode());
  }

  @override
  void didUpdateWidget(covariant OtpCodeInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != oldWidget.value) {
      _isUpdatingControllers = true;
      try {
        for (var index = 0; index < widget.codeLength; index++) {
          final digit = _digitAt(index, widget.value);
          if (_controllers[index].text != digit) {
            _controllers[index].value = TextEditingValue(
              text: digit,
              selection: TextSelection.collapsed(offset: digit.length),
            );
          }
        }
      } finally {
        _isUpdatingControllers = false;
      }
    }
  }

  @override
  void dispose() {
    for (final controller in _controllers) {
      controller.dispose();
    }
    for (final focusNode in _focusNodes) {
      focusNode.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      container: true,
      liveRegion: widget.errorText != null,
      label: widget.errorText == null
          ? 'Código de seguridad de ${widget.codeLength} dígitos'
          : 'Código de seguridad de ${widget.codeLength} dígitos. Error: ${widget.errorText}',
      child: AutofillGroup(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final availableWidth = constraints.maxWidth.isFinite
                ? constraints.maxWidth
                : 288.0;
            final minimumCellWidth = 44.0;
            final gap =
                ((availableWidth - widget.codeLength * minimumCellWidth) /
                        (widget.codeLength - 1))
                    .clamp(1.0, 7.0)
                    .toDouble();
            final cellWidth =
                (availableWidth - gap * (widget.codeLength - 1)) / widget.codeLength;
            return Row(
              children: List<Widget>.generate(widget.codeLength, (index) {
                return Padding(
                  padding: EdgeInsets.only(
                    right: index == widget.codeLength - 1 ? 0 : gap,
                  ),
                  child: SizedBox(
                    width: cellWidth,
                    child: Semantics(
                      label: 'Dígito ${index + 1} de ${widget.codeLength}',
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(minHeight: 44),
                        child: TextField(
                          controller: _controllers[index],
                          focusNode: _focusNodes[index],
                          enabled: widget.enabled,
                          textAlign: TextAlign.center,
                          keyboardType: TextInputType.number,
                          textInputAction: index == widget.codeLength - 1
                              ? TextInputAction.done
                              : TextInputAction.next,
                          autofillHints: index == 0
                              ? const <String>[AutofillHints.oneTimeCode]
                              : null,
                          inputFormatters: <TextInputFormatter>[
                            FilteringTextInputFormatter.digitsOnly,
                          ],
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1,
                          ),
                          decoration: InputDecoration(
                            counterText: '',
                            contentPadding: const EdgeInsets.symmetric(
                              vertical: 12,
                            ),
                            errorText: widget.hasError ? ' ' : null,
                            errorStyle: const TextStyle(height: 0),
                          ),
                          onChanged: (rawValue) =>
                              _handleChanged(index, rawValue),
                          onSubmitted: (_) {
                            if (index < widget.codeLength - 1) {
                              _focusNodes[index + 1].requestFocus();
                            }
                          },
                        ),
                      ),
                    ),
                  ),
                );
              }),
            );
          },
        ),
      ),
    );
  }

  void _handleChanged(int index, String rawValue) {
    if (_isUpdatingControllers) {
      return;
    }

    final digits = rawValue.replaceAll(RegExp(r'\D'), '');
    if (digits.length > 1) {
      final next = widget.value.padRight(widget.codeLength).split('');
      _isUpdatingControllers = true;
      try {
        for (
          var offset = 0;
          offset < digits.length && index + offset < widget.codeLength;
          offset++
        ) {
          next[index + offset] = digits[offset];
          _controllers[index + offset].text = digits[offset];
        }
      } finally {
        _isUpdatingControllers = false;
      }
      widget.onChanged(next.join().replaceAll(' ', ''));
      final focusIndex = (index + digits.length)
          .clamp(0, widget.codeLength - 1)
          .toInt();
      _focusNodes[focusIndex].requestFocus();
      return;
    }

    final next = widget.value.padRight(widget.codeLength).split('');
    next[index] = digits;
    widget.onChanged(next.join().replaceAll(' ', ''));
    if (digits.isNotEmpty && index < widget.codeLength - 1) {
      _focusNodes[index + 1].requestFocus();
    } else if (digits.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
    }
  }

  String _digitAt(int index, String value) {
    final digits = value.replaceAll(RegExp(r'\D'), '');
    return index < digits.length ? digits[index] : '';
  }
}

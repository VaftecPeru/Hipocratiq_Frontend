import 'package:flutter/material.dart';

class TermsConsentField extends StatelessWidget {
  const TermsConsentField({
    required this.value,
    required this.label,
    required this.onChanged,
    this.errorText,
    super.key,
  });

  final bool value;
  final String label;
  final ValueChanged<bool> onChanged;
  final String? errorText;

  @override
  Widget build(BuildContext context) {
    final semanticLabel = errorText == null
        ? label
        : '$label. Error: $errorText';
    void toggle() => onChanged(!value);

    return Semantics(
      container: true,
      checked: value,
      label: semanticLabel,
      liveRegion: errorText != null,
      onTap: toggle,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ExcludeSemantics(
            child: CheckboxListTile(
              value: value,
              onChanged: (_) => toggle(),
              contentPadding: EdgeInsets.zero,
              controlAffinity: ListTileControlAffinity.leading,
              title: Text(label),
            ),
          ),
          if (errorText != null)
            Padding(
              padding: const EdgeInsets.only(left: 16, right: 16, top: 2),
              child: ExcludeSemantics(
                child: Text(
                  errorText!,
                  style: Theme.of(context).inputDecorationTheme.errorStyle,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

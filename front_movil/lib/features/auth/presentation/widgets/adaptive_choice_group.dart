import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';

class AdaptiveChoice<T> {
  const AdaptiveChoice({
    required this.value,
    required this.label,
    required this.icon,
  });

  final T value;
  final String label;
  final IconData icon;
}

class AdaptiveChoiceGroup<T> extends StatelessWidget {
  const AdaptiveChoiceGroup({
    required this.choices,
    required this.value,
    required this.onChanged,
    super.key,
  });

  final List<AdaptiveChoice<T>> choices;
  final T value;
  final ValueChanged<T> onChanged;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final textScale = MediaQuery.textScalerOf(context).scale(1);
        final useStackedLayout = constraints.maxWidth < 360 || textScale >= 1.8;

        if (!useStackedLayout) {
          return SegmentedButton<T>(
            segments: choices
                .map(
                  (choice) => ButtonSegment<T>(
                    value: choice.value,
                    label: Text(choice.label),
                    icon: Icon(choice.icon),
                  ),
                )
                .toList(growable: false),
            selected: <T>{value},
            onSelectionChanged: (selection) => onChanged(selection.first),
            showSelectedIcon: false,
          );
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: choices
              .map(
                (choice) => Padding(
                  padding: EdgeInsets.only(
                    bottom: choice == choices.last ? 0 : 8,
                  ),
                  child: _StackedChoice<T>(
                    choice: choice,
                    selected: choice.value == value,
                    onPressed: () => onChanged(choice.value),
                  ),
                ),
              )
              .toList(growable: false),
        );
      },
    );
  }
}

class _StackedChoice<T> extends StatelessWidget {
  const _StackedChoice({
    required this.choice,
    required this.selected,
    required this.onPressed,
  });

  final AdaptiveChoice<T> choice;
  final bool selected;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      selected: selected,
      label: choice.label,
      child: OutlinedButton.icon(
        onPressed: onPressed,
        icon: Icon(choice.icon),
        label: Text(choice.label, textAlign: TextAlign.center),
        style: OutlinedButton.styleFrom(
          backgroundColor: selected ? AppColors.accentSoft : AppColors.surface,
          foregroundColor: AppColors.ink,
          side: BorderSide(
            color: selected ? AppColors.accent : AppColors.line,
            width: selected ? 2 : 1,
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';

import 'brand_lockup.dart';

class AuthScaffold extends StatelessWidget {
  const AuthScaffold({
    required this.child,
    this.topAction,
    this.footer,
    this.showBrand = true,
    super.key,
  });

  final Widget child;
  final Widget? topAction;
  final Widget? footer;
  final bool showBrand;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final horizontalPadding = switch (constraints.maxWidth) {
              < 360 => 16.0,
              < 600 => 24.0,
              _ => 32.0,
            };
            final keyboardInset = MediaQuery.viewInsetsOf(context).bottom;
            return SingleChildScrollView(
              keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
              padding: EdgeInsets.fromLTRB(
                horizontalPadding,
                24,
                horizontalPadding,
                keyboardInset > 0 ? keyboardInset + 24 : 32,
              ),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 560),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      if (showBrand || topAction != null)
                        _AuthHeader(showBrand: showBrand, topAction: topAction),
                      if (showBrand || topAction != null)
                        const SizedBox(height: 30),
                      child,
                      if (footer != null) ...[
                        const SizedBox(height: 28),
                        footer!,
                      ],
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _AuthHeader extends StatelessWidget {
  const _AuthHeader({required this.showBrand, required this.topAction});

  final bool showBrand;
  final Widget? topAction;

  @override
  Widget build(BuildContext context) {
    if (!showBrand) {
      return Align(alignment: Alignment.centerRight, child: topAction);
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final textScale = MediaQuery.textScalerOf(context).scale(1);
        final useStackedLayout =
            topAction != null &&
            (constraints.maxWidth < 340 || textScale >= 1.8);

        if (useStackedLayout) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const BrandLockup(),
              if (topAction != null)
                Align(alignment: Alignment.centerRight, child: topAction),
            ],
          );
        }

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Expanded(child: BrandLockup()),
            ?topAction,
          ],
        );
      },
    );
  }
}

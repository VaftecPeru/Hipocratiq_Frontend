import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class BrandLockup extends StatelessWidget {
  const BrandLockup({this.compact = false, super.key});

  final bool compact;

  @override
  Widget build(BuildContext context) {
    final markSize = compact ? 40.0 : 48.0;
    final wordmarkWidth = compact ? 132.0 : 166.0;
    final devicePixelRatio = MediaQuery.devicePixelRatioOf(context);

    return Semantics(
      container: true,
      label: 'HipocratiQ',
      image: true,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: markSize,
            height: markSize,
            padding: EdgeInsets.all(compact ? 8 : 9),
            decoration: BoxDecoration(
              color: AppColors.accent,
              borderRadius: BorderRadius.circular(compact ? 12 : 14),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x220862DD),
                  blurRadius: 16,
                  offset: Offset(0, 7),
                ),
              ],
            ),
            child: Image.asset(
              'assets/branding/hipocratiq-mark.webp',
              fit: BoxFit.contain,
              cacheWidth: _cacheWidth(markSize, devicePixelRatio),
              color: Colors.white,
              colorBlendMode: BlendMode.srcIn,
              excludeFromSemantics: true,
            ),
          ),
          const SizedBox(width: 12),
          Image.asset(
            'assets/branding/hipocratiq-wordmark.webp',
            width: wordmarkWidth,
            height: compact ? 24 : 29,
            fit: BoxFit.contain,
            alignment: Alignment.centerLeft,
            cacheWidth: _cacheWidth(wordmarkWidth, devicePixelRatio),
            excludeFromSemantics: true,
          ),
        ],
      ),
    );
  }

  int _cacheWidth(double logicalWidth, double devicePixelRatio) {
    return (logicalWidth * devicePixelRatio).ceil();
  }
}

import 'package:flutter/material.dart';

class BrandLockup extends StatelessWidget {
  const BrandLockup({this.compact = false, super.key});

  final bool compact;

  @override
  Widget build(BuildContext context) {
    final width = compact ? 184.0 : 224.0;
    final devicePixelRatio = MediaQuery.devicePixelRatioOf(context);

    return Semantics(
      container: true,
      label: 'HIPOCRATIQ',
      image: true,
      child: Image.asset(
        'assets/branding/logo-login-web.png',
        width: width,
        fit: BoxFit.contain,
        alignment: Alignment.centerLeft,
        cacheWidth: (width * devicePixelRatio).ceil(),
        excludeFromSemantics: true,
      ),
    );
  }
}

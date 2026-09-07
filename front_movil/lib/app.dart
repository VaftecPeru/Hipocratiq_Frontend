import 'package:flutter/material.dart';

import 'core/config/app_config.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/data/auth_repository.dart';
import 'features/auth/presentation/auth_controller.dart';
import 'features/auth/presentation/auth_gate.dart';

class HipocratiqApp extends StatelessWidget {
  const HipocratiqApp({
    required this.config,
    required this.authGateway,
    required this.authController,
    super.key,
  });

  final AppConfig config;
  final AuthGateway authGateway;
  final AuthController authController;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'HipocratiQ',
      theme: buildAppTheme(),
      home: AuthGate(
        config: config,
        authGateway: authGateway,
        authController: authController,
      ),
    );
  }
}

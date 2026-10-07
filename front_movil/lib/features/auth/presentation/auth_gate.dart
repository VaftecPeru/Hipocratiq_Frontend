import 'package:flutter/material.dart';

import '../../../core/config/app_config.dart';
import '../../../core/widgets/brand_lockup.dart';
import '../../../core/widgets/error_banner.dart';
import '../../../core/widgets/loading_button.dart';
import '../data/auth_repository.dart';
import 'authenticated_shell.dart';
import 'auth_controller.dart';
import 'auth_page.dart';

class AuthGate extends StatefulWidget {
  const AuthGate({
    required this.config,
    required this.authGateway,
    required this.authController,
    super.key,
  });

  final AppConfig config;
  final AuthGateway authGateway;
  final AuthController authController;

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  @override
  void initState() {
    super.initState();
    widget.authController.initialize();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: widget.authController,
      builder: (context, child) {
        final state = widget.authController.state;
        final disableAnimations = MediaQuery.of(context).disableAnimations;
        final duration = disableAnimations
            ? Duration.zero
            : const Duration(milliseconds: 220);

        return AnimatedSwitcher(
          duration: duration,
          switchInCurve: Curves.easeOutCubic,
          switchOutCurve: Curves.easeInCubic,
          child: _pageForState(state),
        );
      },
    );
  }

  Widget _pageForState(AuthState state) {
    return switch (state) {
      AuthLoading() => const _StartupLoading(key: ValueKey('loading')),
      AuthSignedOut() => AuthPage(
        key: const ValueKey('signed-out'),
        config: widget.config,
        authGateway: widget.authGateway,
        authController: widget.authController,
      ),
      AuthSignedIn(:final session) => AuthenticatedShell(
        key: const ValueKey('signed-in'),
        session: session,
        authGateway: widget.authGateway,
        authController: widget.authController,
        authBypass: widget.config.authBypass,
      ),
      AuthStartupFailure(:final message) => _StartupFailure(
        key: const ValueKey('startup-failure'),
        message: message,
        onRetry: widget.authController.initialize,
        onContinue: widget.authController.continueWithoutSession,
      ),
    };
  }
}

class _StartupLoading extends StatelessWidget {
  const _StartupLoading({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FC),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const BrandLockup(compact: true),
            const SizedBox(height: 28),
            Semantics(
              liveRegion: true,
              label: 'Comprobando sesión',
              child: const SizedBox.square(
                dimension: 24,
                child: CircularProgressIndicator(strokeWidth: 2.5),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StartupFailure extends StatelessWidget {
  const _StartupFailure({
    required this.message,
    required this.onRetry,
    required this.onContinue,
    super.key,
  });

  final String message;
  final VoidCallback onRetry;
  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const BrandLockup(),
                  const SizedBox(height: 32),
                  Text(
                    'No pudimos abrir tu sesión',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 14),
                  ErrorBanner(message: message),
                  const SizedBox(height: 20),
                  PrimaryButton(label: 'Reintentar', onPressed: onRetry),
                  const SizedBox(height: 10),
                  SecondaryButton(
                    label: 'Continuar sin sesión',
                    onPressed: onContinue,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

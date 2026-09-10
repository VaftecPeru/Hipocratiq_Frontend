import 'dart:async';

import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';
import '../../domain/auth_models.dart';

class OtpCountdownState {
  const OtpCountdownState({required this.expiresIn, required this.resendAfter});

  final int expiresIn;
  final int resendAfter;

  bool get isExpired => expiresIn == 0;
  bool get isComplete => isExpired;
}

class OtpCountdownController extends ValueNotifier<OtpCountdownState> {
  OtpCountdownController(OtpChallenge challenge)
    : super(
        OtpCountdownState(
          expiresIn: challenge.expiresIn.inSeconds.clamp(0, 3600),
          resendAfter: challenge.resendAfter.inSeconds.clamp(0, 3600),
        ),
      );

  Timer? _timer;

  int get expiresIn => value.expiresIn;
  int get resendAfter => value.resendAfter;
  bool get isExpired => value.isExpired;
  bool get isRunning => _timer?.isActive ?? false;

  void start() {
    if (_timer != null || value.isExpired) {
      return;
    }
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _tick());
  }

  void reset(OtpChallenge challenge) {
    stop();
    value = OtpCountdownState(
      expiresIn: challenge.expiresIn.inSeconds.clamp(0, 3600),
      resendAfter: challenge.resendAfter.inSeconds.clamp(0, 3600),
    );
    start();
  }

  void stop() {
    _timer?.cancel();
    _timer = null;
  }

  void _tick() {
    final nextExpiresIn = _decrement(value.expiresIn);
    final nextValue = OtpCountdownState(
      expiresIn: nextExpiresIn,
      resendAfter: nextExpiresIn > 0
          ? _decrement(value.resendAfter)
          : value.resendAfter,
    );
    value = nextValue;
    if (nextValue.isExpired) {
      stop();
    }
  }

  int _decrement(int seconds) => seconds > 0 ? seconds - 1 : 0;

  @override
  void dispose() {
    stop();
    super.dispose();
  }
}

class OtpCountdownHeader extends StatelessWidget {
  const OtpCountdownHeader({
    required this.title,
    required this.controller,
    super.key,
  });

  final String title;
  final OtpCountdownController controller;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<OtpCountdownState>(
      valueListenable: controller,
      builder: (context, state, child) {
        final countdownLabel = state.expiresIn > 0
            ? 'El código vence en ${formatOtpDuration(state.expiresIn)}'
            : 'El código está expirado';
        final countdown = Semantics(
          liveRegion: true,
          label: countdownLabel,
          child: Text(
            state.expiresIn > 0
                ? formatOtpDuration(state.expiresIn)
                : 'Expirado',
            style: const TextStyle(
              color: AppColors.muted,
              fontWeight: FontWeight.w700,
              fontFeatures: <FontFeature>[FontFeature.tabularFigures()],
            ),
          ),
        );

        return LayoutBuilder(
          builder: (context, constraints) {
            final textScale = MediaQuery.textScalerOf(context).scale(1);
            final useStackedLayout =
                constraints.maxWidth < 360 || textScale >= 1.8;
            if (useStackedLayout) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      color: AppColors.ink,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Align(alignment: Alignment.centerRight, child: countdown),
                ],
              );
            }

            return Wrap(
              alignment: WrapAlignment.spaceBetween,
              crossAxisAlignment: WrapCrossAlignment.center,
              runSpacing: 4,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: AppColors.ink,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                countdown,
              ],
            );
          },
        );
      },
    );
  }
}

class OtpResendActions extends StatelessWidget {
  const OtpResendActions({
    required this.controller,
    required this.isSubmitting,
    required this.onResend,
    this.resendsRemaining,
    super.key,
  });

  final OtpCountdownController controller;
  final bool isSubmitting;
  final VoidCallback onResend;
  final int? resendsRemaining;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<OtpCountdownState>(
      valueListenable: controller,
      builder: (context, state, child) {
        final canResend =
            !isSubmitting && (state.isExpired || state.resendAfter == 0);
        final resendMessage = state.isExpired
            ? 'El código expiró. Solicita un código nuevo.'
            : state.resendAfter > 0
            ? 'Podrás reenviar el código en ${formatOtpDuration(state.resendAfter)}.'
            : '¿No recibiste el código?';
        return Column(
          children: [
            Text(
              resendMessage,
              textAlign: TextAlign.center,
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: AppColors.muted),
            ),
            TextButton(
              onPressed: canResend ? onResend : null,
              child: Text(
                state.isExpired
                    ? 'Solicitar nuevo código'
                    : state.resendAfter > 0
                    ? 'Reenviar código más tarde'
                    : 'Reenviar código',
              ),
            ),
            if (resendsRemaining != null)
              Text(
                'Reenvíos disponibles: $resendsRemaining',
                textAlign: TextAlign.center,
                style: Theme.of(
                  context,
                ).textTheme.bodySmall?.copyWith(color: AppColors.placeholder),
              ),
          ],
        );
      },
    );
  }
}

String formatOtpDuration(int seconds) {
  final minutes = seconds ~/ 60;
  final remainingSeconds = seconds % 60;
  return '$minutes:${remainingSeconds.toString().padLeft(2, '0')}';
}

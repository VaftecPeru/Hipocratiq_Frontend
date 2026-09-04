import 'package:flutter/material.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/auth_scaffold.dart';
import '../../../core/widgets/error_banner.dart';
import '../../../core/widgets/loading_button.dart';
import '../data/auth_repository.dart';
import '../domain/auth_models.dart';
import '../domain/registration_models.dart';
import 'registration_otp_page.dart';

class RegistrationPlanPage extends StatefulWidget {
  const RegistrationPlanPage({
    required this.kind,
    required this.authGateway,
    required this.draftToken,
    required this.destination,
    super.key,
  });

  final RegistrationKind kind;
  final AuthGateway authGateway;
  final String draftToken;
  final String destination;

  @override
  State<RegistrationPlanPage> createState() => _RegistrationPlanPageState();
}

class _RegistrationPlanPageState extends State<RegistrationPlanPage> {
  List<PlanOption> _plans = const <PlanOption>[];
  String? _selectedPlan;
  String _billingCycle = 'monthly';
  bool _isLoading = true;
  bool _isSubmitting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadPlans();
  }

  @override
  Widget build(BuildContext context) {
    return AuthScaffold(
      topAction: IconButton(
        onPressed: () => Navigator.of(context).maybePop(),
        tooltip: 'Volver',
        icon: const Icon(Icons.arrow_back_rounded),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Elige tu plan',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: AppColors.ink,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.7,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            widget.kind == RegistrationKind.doctor
                ? 'Selecciona el plan que usarás para tu práctica independiente.'
                : 'Selecciona el plan inicial de tu clínica. Podrás continuar con la verificación por SMS.',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: AppColors.muted,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 24),
          if (_isLoading)
            const _PlanLoading()
          else if (_plans.isEmpty)
            _PlanUnavailable(onRetry: _loadPlans)
          else ...[
            ..._plans.map(
              (plan) => _PlanCard(
                plan: plan,
                selected: _selectedPlan == plan.key,
                billingCycle: _billingCycle,
                onPressed: () => setState(() => _selectedPlan = plan.key),
              ),
            ),
            const SizedBox(height: 18),
            DropdownButtonFormField<String>(
              initialValue: _billingCycle,
              isExpanded: true,
              decoration: const InputDecoration(
                labelText: 'Frecuencia de pago',
                prefixIcon: Icon(Icons.event_repeat_outlined),
              ),
              items: const <DropdownMenuItem<String>>[
                DropdownMenuItem<String>(
                  value: 'monthly',
                  child: Text('Mensual'),
                ),
                DropdownMenuItem<String>(value: 'annual', child: Text('Anual')),
              ],
              onChanged: (value) {
                if (value != null) {
                  setState(() => _billingCycle = value);
                }
              },
            ),
          ],
          if (_error != null) ...[
            const SizedBox(height: 18),
            ErrorBanner(message: _error!),
          ],
          const SizedBox(height: 24),
          PrimaryButton(
            label: 'Continuar a verificación',
            onPressed: !_isLoading && _plans.isNotEmpty && _selectedPlan != null
                ? _submit
                : null,
            isLoading: _isSubmitting,
          ),
        ],
      ),
    );
  }

  Future<void> _loadPlans() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final plans = await widget.authGateway.fetchRegistrationPlans();
      if (mounted) {
        setState(() {
          _plans = plans;
          _selectedPlan = plans.isEmpty ? null : plans.first.key;
          _isLoading = false;
        });
      }
    } on Object catch (error) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = error is ApiException
              ? error.message
              : 'No pudimos cargar los planes disponibles.';
        });
      }
    }
  }

  Future<void> _submit() async {
    final plan = _selectedPlan;
    if (_isSubmitting || plan == null) {
      return;
    }
    setState(() {
      _isSubmitting = true;
      _error = null;
    });
    try {
      final flow = widget.kind == RegistrationKind.doctor
          ? await widget.authGateway.selectDoctorPlan(
              draftToken: widget.draftToken,
              plan: plan,
              billingCycle: _billingCycle,
            )
          : await widget.authGateway.selectClinicPlan(
              draftToken: widget.draftToken,
              plan: plan,
              billingCycle: _billingCycle,
            );
      final challenge = flow.challenge;
      if (challenge == null) {
        throw const FormatException('El registro no devolvió un desafío OTP.');
      }
      if (!mounted) {
        return;
      }
      final session = await Navigator.of(context).push<MobileAuthSession>(
        MaterialPageRoute<MobileAuthSession>(
          builder: (context) => RegistrationOtpPage(
            kind: widget.kind,
            authGateway: widget.authGateway,
            draftToken: widget.draftToken,
            challenge: challenge,
            destination: widget.destination,
          ),
        ),
      );
      if (session != null && mounted) {
        Navigator.of(context).pop(session);
      }
    } on Object catch (error) {
      if (mounted) {
        setState(() {
          _error = error is ApiException
              ? error.message
              : 'No pudimos continuar con el registro.';
        });
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }
}

class _PlanCard extends StatelessWidget {
  const _PlanCard({
    required this.plan,
    required this.selected,
    required this.billingCycle,
    required this.onPressed,
  });

  final PlanOption plan;
  final bool selected;
  final String billingCycle;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final price = billingCycle == 'annual'
        ? plan.annualPriceCents
        : plan.monthlyPriceCents;
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Semantics(
        selected: selected,
        button: true,
        label: '${plan.name}, ${_formatPrice(price, plan.currency)}',
        child: OutlinedButton(
          onPressed: onPressed,
          style: OutlinedButton.styleFrom(
            alignment: Alignment.centerLeft,
            padding: const EdgeInsets.all(16),
            backgroundColor: selected
                ? AppColors.accentSoft
                : AppColors.surface,
            side: BorderSide(
              color: selected ? AppColors.accent : AppColors.line,
              width: selected ? 2 : 1,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          child: Row(
            children: [
              Icon(
                selected
                    ? Icons.radio_button_checked
                    : Icons.radio_button_unchecked,
                color: selected ? AppColors.accent : AppColors.muted,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      plan.name,
                      style: const TextStyle(
                        color: AppColors.ink,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      _formatPrice(price, plan.currency),
                      style: const TextStyle(color: AppColors.muted),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PlanLoading extends StatelessWidget {
  const _PlanLoading();

  @override
  Widget build(BuildContext context) {
    return Semantics(
      liveRegion: true,
      label: 'Cargando planes disponibles',
      child: const Padding(
        padding: EdgeInsets.symmetric(vertical: 28),
        child: Center(child: CircularProgressIndicator()),
      ),
    );
  }
}

class _PlanUnavailable extends StatelessWidget {
  const _PlanUnavailable({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.warningSoft,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.warning),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'No hay planes disponibles.',
            style: TextStyle(color: AppColors.ink, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 4),
          const Text(
            'Intenta nuevamente más tarde para continuar con el registro.',
            style: TextStyle(color: AppColors.inkSecondary, height: 1.4),
          ),
          const SizedBox(height: 8),
          TextButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh_rounded),
            label: const Text('Reintentar'),
          ),
        ],
      ),
    );
  }
}

String _formatPrice(int cents, String currency) {
  return '$currency ${(cents / 100).toStringAsFixed(2)}';
}

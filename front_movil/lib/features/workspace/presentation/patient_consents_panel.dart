import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../auth/data/auth_repository.dart';
import '../domain/mobile_workspace.dart';

class PatientConsentsPanel extends StatefulWidget {
  const PatientConsentsPanel({required this.authGateway, super.key});

  final AuthGateway authGateway;

  @override
  State<PatientConsentsPanel> createState() => _PatientConsentsPanelState();
}

class _PatientConsentsPanelState extends State<PatientConsentsPanel> {
  static const String _policyVersion = '2026-09';

  List<MobilePatientConsent> _consents = const <MobilePatientConsent>[];
  MobilePatientConsentScope? _changing;
  String? _error;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final consents = await widget.authGateway.fetchPatientConsents();
      if (!mounted) return;
      setState(() {
        _consents = consents;
        _loading = false;
      });
    } on Object catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  MobilePatientConsent? _activeFor(MobilePatientConsentScope scope) {
    for (final consent in _consents) {
      if (consent.scope == scope &&
          consent.policyVersion == _policyVersion &&
          consent.isGranted) {
        return consent;
      }
    }
    return null;
  }

  Future<void> _toggle(MobilePatientConsentScope scope) async {
    if (_changing != null) return;

    setState(() {
      _changing = scope;
      _error = null;
    });

    try {
      final active = _activeFor(scope);
      final updated = active == null
          ? await widget.authGateway.grantPatientConsent(
              scope,
              policyVersion: _policyVersion,
            )
          : await widget.authGateway.revokePatientConsent(active.id);

      if (!mounted) return;
      setState(() {
        _consents = <MobilePatientConsent>[
          updated,
          ..._consents.where((item) => item.id != updated.id),
        ];
        _changing = null;
      });
    } on Object catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.toString();
        _changing = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: AppColors.line),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                Icons.verified_user_outlined,
                color: AppColors.accent,
                size: 21,
              ),
              SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Consentimientos clínicos',
                      style: TextStyle(
                        color: AppColors.ink,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    SizedBox(height: 3),
                    Text(
                      'Cada autorización es independiente, versionada y revocable.',
                      style: TextStyle(
                        color: AppColors.muted,
                        fontSize: 12,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (_loading)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          else
            ...MobilePatientConsentScope.values
                .where(
                  (scope) =>
                      scope != MobilePatientConsentScope.whatsappNotifications,
                )
                .map(_consentRow),
          if (_error != null) ...[
            const SizedBox(height: 10),
            Text(
              _error!,
              style: const TextStyle(
                color: AppColors.danger,
                fontSize: 11,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _consentRow(MobilePatientConsentScope scope) {
    final active = _activeFor(scope) != null;
    final changing = _changing == scope;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFD),
          border: Border.all(color: AppColors.line),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    scope.label,
                    style: const TextStyle(
                      color: AppColors.ink,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    _helper(scope),
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 10.5,
                      height: 1.35,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            Switch.adaptive(
              value: active,
              onChanged: changing ? null : (_) => _toggle(scope),
            ),
          ],
        ),
      ),
    );
  }

  String _helper(MobilePatientConsentScope scope) {
    return switch (scope) {
      MobilePatientConsentScope.clinicalCare =>
        'Registro y uso de información durante tu atención.',
      MobilePatientConsentScope.dataProcessing =>
        'Tratamiento de datos personales dentro de HIPOCRATIQ.',
      MobilePatientConsentScope.telemedicine =>
        'Uso de información durante atenciones remotas.',
      MobilePatientConsentScope.aiClinicalAssistance =>
        'Funciones de apoyo con IA bajo responsabilidad profesional.',
      MobilePatientConsentScope.epidemiologyAnonymized =>
        'Uso de información anonimizada o agregada para analítica.',
      MobilePatientConsentScope.whatsappNotifications =>
        'Notificaciones operativas por WhatsApp.',
    };
  }
}

class MobileWorkspaceMetric {
  const MobileWorkspaceMetric({
    required this.label,
    required this.value,
    required this.icon,
  });

  final String label;
  final String value;
  final String icon;
}

class MobileWorkspaceItem {
  const MobileWorkspaceItem({
    required this.title,
    required this.subtitle,
    required this.status,
  });

  final String title;
  final String subtitle;
  final String status;
}

class MobileWorkspaceModule {
  const MobileWorkspaceModule({
    required this.label,
    required this.helper,
    required this.icon,
  });

  final String label;
  final String helper;
  final String icon;
}

class MobileWorkspaceSnapshot {
  const MobileWorkspaceSnapshot({
    required this.roleTitle,
    required this.headline,
    required this.helper,
    required this.metrics,
    required this.items,
    required this.modules,
    required this.generatedAt,
  });

  final String roleTitle;
  final String headline;
  final String helper;
  final List<MobileWorkspaceMetric> metrics;
  final List<MobileWorkspaceItem> items;
  final List<MobileWorkspaceModule> modules;
  final DateTime generatedAt;
}

enum MobilePatientConsentScope {
  clinicalCare('clinical_care', 'Atención clínica'),
  dataProcessing('data_processing', 'Tratamiento de datos'),
  whatsappNotifications('whatsapp_notifications', 'Notificaciones WhatsApp'),
  telemedicine('telemedicine', 'Telemedicina'),
  aiClinicalAssistance('ai_clinical_assistance', 'Asistencia clínica con IA'),
  epidemiologyAnonymized(
    'epidemiology_anonymized',
    'Analítica epidemiológica anonimizada',
  );

  const MobilePatientConsentScope(this.value, this.label);

  final String value;
  final String label;

  static MobilePatientConsentScope fromValue(String value) {
    return values.firstWhere(
      (scope) => scope.value == value,
      orElse: () => MobilePatientConsentScope.dataProcessing,
    );
  }
}

class MobilePatientConsentSettings {
  const MobilePatientConsentSettings({
    required this.consents,
    required this.policyVersion,
  });

  final List<MobilePatientConsent> consents;
  final String policyVersion;
}

class MobilePatientConsent {
  const MobilePatientConsent({
    required this.id,
    required this.scope,
    required this.policyVersion,
    required this.status,
    required this.source,
    required this.effectiveFrom,
    required this.effectiveUntil,
    required this.revokedAt,
  });

  final int id;
  final MobilePatientConsentScope scope;
  final String policyVersion;
  final String status;
  final String source;
  final DateTime? effectiveFrom;
  final DateTime? effectiveUntil;
  final DateTime? revokedAt;

  bool get isGranted => status == 'granted' && revokedAt == null;

  factory MobilePatientConsent.fromJson(Map<String, dynamic> json) {
    return MobilePatientConsent(
      id: _requiredWorkspaceInt(json, 'id'),
      scope: MobilePatientConsentScope.fromValue(
        _requiredWorkspaceString(json, 'scope'),
      ),
      policyVersion: _requiredWorkspaceString(json, 'policy_version'),
      status: _requiredWorkspaceString(json, 'status'),
      source: _workspaceString(json['source']) ?? 'digital',
      effectiveFrom: _workspaceDateTime(json['effective_from']),
      effectiveUntil: _workspaceDateTime(json['effective_until']),
      revokedAt: _workspaceDateTime(json['revoked_at']),
    );
  }
}

String _requiredWorkspaceString(Map<String, dynamic> source, String key) {
  final value = _workspaceString(source[key]);
  if (value == null) {
    throw FormatException('Missing string: $key');
  }
  return value;
}

String? _workspaceString(Object? value) {
  return value is String && value.trim().isNotEmpty ? value.trim() : null;
}

int _requiredWorkspaceInt(Map<String, dynamic> source, String key) {
  final value = source[key];
  if (value is int) return value;
  if (value is num) return value.toInt();
  if (value is String) {
    final parsed = int.tryParse(value);
    if (parsed != null) return parsed;
  }
  throw FormatException('Missing integer: $key');
}

DateTime? _workspaceDateTime(Object? value) {
  final text = _workspaceString(value);
  return text == null ? null : DateTime.tryParse(text);
}

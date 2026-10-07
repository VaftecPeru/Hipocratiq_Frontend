import 'package:flutter/material.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/data/auth_repository.dart';

enum PatientPortalSection {
  appointments,
  triage,
  results,
  history,
  prescriptions,
  epidemiology,
  membership,
  profile,
}

extension PatientPortalSectionUi on PatientPortalSection {
  String get title => switch (this) {
        PatientPortalSection.appointments => 'Mis citas',
        PatientPortalSection.triage => 'Preconsulta',
        PatientPortalSection.results => 'Resultados',
        PatientPortalSection.history => 'Historial clínico',
        PatientPortalSection.prescriptions => 'Recetas',
        PatientPortalSection.epidemiology => 'IA epidemiológica',
        PatientPortalSection.membership => 'Membresía',
        PatientPortalSection.profile => 'Mi perfil',
      };

  String get resource => switch (this) {
        PatientPortalSection.appointments => 'appointments',
        PatientPortalSection.triage => 'triage',
        PatientPortalSection.results => 'results',
        PatientPortalSection.history => 'history',
        PatientPortalSection.prescriptions => 'prescriptions',
        PatientPortalSection.epidemiology => 'epidemiology',
        PatientPortalSection.membership => 'membership',
        PatientPortalSection.profile => 'profile',
      };

  IconData get icon => switch (this) {
        PatientPortalSection.appointments => Icons.calendar_month_rounded,
        PatientPortalSection.triage => Icons.assignment_outlined,
        PatientPortalSection.results => Icons.science_outlined,
        PatientPortalSection.history => Icons.history_rounded,
        PatientPortalSection.prescriptions => Icons.medication_outlined,
        PatientPortalSection.epidemiology => Icons.auto_graph_rounded,
        PatientPortalSection.membership => Icons.health_and_safety_outlined,
        PatientPortalSection.profile => Icons.person_outline_rounded,
      };
}

PatientPortalSection? patientSectionFromModule(String label) => switch (label) {
      'Citas' => PatientPortalSection.appointments,
      'Historia' => PatientPortalSection.history,
      'Recetas' => PatientPortalSection.prescriptions,
      'Resultados' => PatientPortalSection.results,
      'Preconsulta' => PatientPortalSection.triage,
      'IA epidemiológica' => PatientPortalSection.epidemiology,
      'Membresía' => PatientPortalSection.membership,
      'Mi perfil' => PatientPortalSection.profile,
      _ => null,
    };

class PatientPortalPage extends StatefulWidget {
  const PatientPortalPage({
    required this.repository,
    required this.initialSection,
    super.key,
  });

  final AthRepository repository;
  final PatientPortalSection initialSection;

  @override
  State<PatientPortalPage> createState() => _PatientPortalPageState();
}

class _PatientPortalPageState extends State<PatientPortalPage> {
  late PatientPortalSection _section;
  Map<String, dynamic>? _response;
  String? _error;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _section = widget.initialSection;
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final response =
          await widget.repository.fetchPatientPortalResource(_section.resource);
      if (!mounted) return;
      setState(() {
        _response = response;
        _loading = false;
      });
    } on Object catch (error) {
      if (!mounted) return;
      setState(() {
        _error = _friendlyError(error);
        _loading = false;
      });
    }
  }

  Future<void> _change(PatientPortalSection section) async {
    if (_section == section) return;
    setState(() {
      _section = section;
      _response = null;
      _loading = true;
    });
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    final data = _response?['data'];
    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB),
      appBar : AppBar(title: Text(_section.title)),
      body: SafeArea(top: false, child: ListView(padding: const EdgeInsets.all(16), children: [
        _Hero(section: _section),
        const SizedBox(height: 14),
        if (_error != null) _Banner(icon: Icons.error_outline_rounded, title: 'No se pudo cargar', helper: _error!, danger: true)
        else if (_loading) const SizedBox(height: 220, child: Center(child: CircularProgressIndicator()))
        else ...[_buildSection(data)],
      ])));
  }

  Widget _buildSection(Object? data) => switch (_section) {
    PatientPortalSection.appointments => _ListSection(items: _list(data), kind: _ListKind.appointment),
    PatientPortalSection.results => _ListSection(items: _list(data), kind: _ListKind.result),
    PatientPortalSection.history => _ListSection(items: _list(data), kind: _ListKind.history),
    PatientPortalSection.prescriptions => _ListSection(items: _list(data), kind: _ListKind.prescription),
    PatientPortalSection.triage => _TriageForm(repository: widget.repository, initial: _map(data)),
    PatientPortalSection.epidemiology => _Epidemiology(data: _map(data) ?? const {}),
    PatientPortalSection.membership => _Membership(data: _map(data) ?? const {}),
    PatientPortalSection.profile => _ProfileForm(repository: widget.repository, data: _map(data) ?? const {}),
  };
}
ircularProgressIndicator(strokeWidth: 2.5),
                  ),
                )
              else
                switch (_section) {
                  PatientPortalSection.appointments => _ListSection(
                      items: _list(data),
                      kind: _ListKind.appointment,
                    ),
                  PatientPortalSection.results => _ListSection(
                      items: _list(data),
                      kind: _ListKind.result,
                    ),
                  PatientPortalSection.history => _ListSection(
                      items: _list(data),
                      kind: _ListKind.history,
                    ),
                  PatientPortalSection.prescriptions => _ListSection(
                      items: _list(data),
                      kind: _ListKind.prescription,
                    ),
                  PatientPortalSection.triage => _TriageForm(
                      repository: widget.repository,
                      initial: _map(data),
                    ),
                  PatientPortalSection.epidemiology =>
                    _Epidemiology(data: _map(data) ?? const {}),
                  PatientPortalSection.membership =>
                    _Membership(data: _map(data) ?? const {}),
                  PatientPortalSection.profile => _ProfileForm(
                      repository: widget.repository,
                      data: _map(data) ?? const {},
                    ),
                },
            ],
          ),
        ),
      ),
    );
  }
}

class _Hero extends StatelessWidget {
  const _Hero({required this.section});
  final PatientPortalSection section;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0862DD), Color(0xFF064BB6)],
        ),
        borderRadius: BorderRadius.circular(22),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: const Color(0x22FFFFFF),
            child: Icon(section.icon, color: Colors.white),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              section.title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

enum _ListKind { appointment, result, history, prescription }

class _ListSection extends StatelessWidget {
  const _ListSection({required this.items, required this.kind});
  final List<Map<String, dynamic>> items;
  final _ListKind kind;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const _Empty(
        title: 'Sin información por ahora',
        helper: 'Los registros publicados por tu equipo clínico aparecerán aquí.',
      );
    }
    return Column(
      children: items.map((item) {
        final doctor = _map(item['doctor']);
        final clinic = _map(item['clinic']);
        final title = switch (kind) {
          _ListKind.appointment => _date(item['scheduled_at']),
          _ListKind.result => _text(item['study_name']) ?? 'Estudio',
          _ListKind.history =>
            _text(item['chief_complaint']) ?? 'Consulta clínica',
          _ListKind.prescription =>
            _text(item['medication']) ?? 'Medicamento',
        };
        final icon = switch (kind) {
          _ListKind.appointment => Icons.calendar_month_rounded,
          _ListKind.result => Icons.science_outlined,
          _ListKind.history => Icons.history_rounded,
          _ListKind.prescription => Icons.medication_outlined,
        };
        final lines = switch (kind) {
          _ListKind.appointment => <String>[
              _text(doctor?['name']) ?? 'Profesional por asignar',
              _text(doctor?['specialty']) ?? 'Especialidad no registrada',
              _text(clinic?['name']) ?? 'Clínica no registrada',
              _text(item['appointment_type']) ?? 'Consulta',
            ],
          _ListKind.result => <String>[
              item['result_available'] == true
                  ? 'Resultado disponible'
                  : 'Resultado en proceso',
              'Prioridad: ${_text(item['priority']) ?? 'Normal'}',
              _text(doctor?['name']) ?? 'Profesional no registrado',
              _date(item['result_at'] ?? item['ordered_at']),
              if (_text(item['result_summary']) case final summary?) summary,
            ],
          _ListKind.history => <String>[
              _date(item['completed_at'] ?? item['created_at']),
              _text(doctor?['name']) ?? 'Profesional no registrado',
              _text(clinic?['name']) ?? 'Clínica no registrada',
              if (_text(item['objective']) case final objective?) objective,
            ],
          _ListKind.prescription => <String>[
              'Dosis: ${_text(item['dosage']) ?? 'No registrada'}',
              'Frecuencia: ${_text(item['frequency']) ?? 'No registrada'}',
              _text(doctor?['name']) ?? 'Profesional no registrado',
              if (_text(item['notes']) case final notes?) notes,
            ],
        };
        return _Card(
          icon: icon,
          title: title,
          badge: _text(item['status_label']) ?? _text(item['status']),
          lines: lines,
        );
      }).toList(growable: false),
    );
  }
}

class _Epidemiology extends StatelessWidget {
  const _Epidemiology({required this.data});
  final Map<String, dynamic> data;

  @override
  Widget build(BuildContext context) {
    final metrics = _map(data['metrics']) ?? const <String, dynamic>{};
    final participation = _map(data['participation']) ?? const {};
    return Colum((children: [
        _Banner(icon: Icons.verified_user_outlined, title: 'Participación clínica', helper: _text(data['message']) ?? 'La analítica respeta tu consentimiento clínico.'),
        const SizedBox(height: 12),
        GridView.count(crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), childAspectRatio: 1.55, crossAxisSpacing: 10, mainAxisSpacing: 10, children: [
          _Metric('Citas', _int(metrics['appointments'])),
          _Metric('Consultas', _int(metrics['consultations')),
          _Metric('Laboratorios', _int(metrics['laboratory_orders'])),
          _Metric('Recetas activas', _int(metrics['active_prescriptions'])),
        ]),
      ]));
  }
}
on['consent_active'] == true
              ? 'Participación autorizada'
              : 'Participación no autorizada',
          helper:
              _text(data['message']) ??
              'La analítica respeta tu consentimiento clínico.',
        ),
        const SizedBox(height: 12),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          childAspectRatio: 1.55,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          children: [
            _Metric('Citas', _int(metrics['appointments'])),
            _Metric('Consultas', _int(metrics['consultations'])),
            _Metric('Laboratorios', _int(metrics['laboratory_orders'])),
            _Metric('Recetas activas', _int(metrics['active_prescriptions'])),
          ],
        ),
      ],
    );
  }
}

class _Membership extends StatelessWidget {
  const _Membership({required this.data});
  final Map<String, dynamic> data;

  @override
  Widget build(BuildContext context) {
    if (data['available'] != true) {
      return _Empty(
        title: 'Cobertura no disponible',
        helper:
            _text(data['message']) ??
            'Tu clínica administra la cobertura asociada a tu perfil.',
      );
    }
    final plan = _map(data['plan']) ?? const {};
    final coverage = _map(data['coverage']) ?? const {};
    final clinic = _map(data['clinic']);
    final features = (plan['features'] is List)
        ? (plan['features'] as List).map((e) => e.toString()).toList()
        : <String>[];
    return Column(
      children: [
        _Card(
          icon: Icons.health_and_safety_outlined,
          title: _text(plan['name']) ?? 'Cobertura institucional',
          badge: _text(coverage['status']),
          lines: [
            _text(clinic?['name']) ?? 'Clínica no registrada',
            _text(plan['description']) ?? 'Plan administrado por tu clínica.',
            'Inicio: ${_date(coverage['starts_at'])}',
            'Vigencia: ${_date(coverage['ends_at'])}',
          ],
        ),
        if (features.isNotEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: _panel(),
            child: Column(
              children: features
                  .map(
                    (feature) => ListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(
                        Icons.check_circle_rounded,
                        color: AppColors.success,
                      ),
                      title: Text(feature),
                    ),
                  )
                  .toList(growable: false),
            ),
          ),
      ],
    );
  }
}

class _TriageForm extends StatefulWidget {
  const _TriageForm({required this.repository, required this.initial});
  final AuthRepository repository;
  final Map<String, dynamic>? initial;

  @override
  State<_TriageForm> createState() => _TriageFormState();
}

class _TriageFormState extends State<_TriageForm> {
  late final TextEditingController reason;
  late final TextEditingController temperature;
  late final TextEditingController systolic;
  late final TextEditingController diastolic;
  late final TextEditingController heartRate;
  late final TextEditingController respiratoryRate;
  late final TextEditingController oxygen;
  late final TextEditingController notes;
  String level = 'IV';
  bool saving = false;
  String? message;

  @override
  void initState() {
    super.initState();
    final data = widget.initial ?? const <String, dynamic>{};
    reason = TextEditingController(text: _text(data['reason']) ?? '');
    temperature = _numController(data['temperature_c']);
    systolic = _numController(data['systolic_bp']);
    diastolic = _numController(data['diastolic_bp']);
    heartRate = _numController(data['heart_rate']);
    respiratoryRate = _numController(data['respiratory_rate']);
    oxygen = _numController(data['oxygen_saturation']);
    notes = TextEditingController(text: _text(data['triage_notes']) ?? '');
    level = _text(data['triage_level']) ?? 'IV';
  }

  Map<String, String> get errors {
    final out = <String, String>{};
    void range(
      String key,
      TextEditingController controller,
      num min,
      num max,
    ) {
      final raw = controller.text.trim();
      if (raw.isEmpty) return;
      final value = num.tryParse(raw);
      if (value == null || value < min || value > max) {
        out[key] = '$key: $min–$max';
      }
    }

    range('Temperatura', temperature, 30, 45);
    range('Sistólica', systolic, 60, 250);
    range('Diastólica', diastolic, 30, 160);
    range('Frecuencia cardiaca', heartRate, 30, 220);
    range('Frecuencia respiratoria', respiratoryRate, 5, 60);
    range('SpO₂', oxygen, 70, 100);
    final sys = num.tryParse(systolic.text);
    final dia = num.tryParse(diastolic.text);
    if (sys != null && dia != null && dia >= sys) {
      out['Presión'] = 'La diastólica debe ser menor que la sistólica.';
    }
    return out;
  }

  Future<void> save(String status) async {
    final currentErrors = errors;
    if (reason.text.trim().isEmpty || currentErrors.isNotEmpty) {
      setState(() {
        message = reason.text.trim().isEmpty
            ? 'Describe el motivo de consulta.'
            : currentErrors.values.join(' · ');
      });
      return;
    }
    setState(() {
      saving = true;
      message = null;
    });
    try {
      await widget.repository.savePatientTriage({
        'reason': reason.text.trim(),
        'temperature_c': _num(temperature.text),
        'systolic_bp': _integerOrNull(systolic.text),
        'diastolic_bp': _integerOrNull(diastolic.text),
        'heart_rate': _integerOrNull(heartRate.text),
        'respiratory_rate': _integerOrNull(respiratoryRate.text),
        'oxygen_saturation': _integerOrNull(oxygen.text),
        'triage_level': level,
        '
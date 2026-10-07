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

  final AuthRepository repository;
  final PatientPortalSection initialSection;

  @override
  State<PatientPortalPage> createState() => _PatientPortalPageState();
}

class _PatientPortalPageState extends State<PatientPortalPage> {
  late PatientPortalSection _section;
  Map<String, dynamic>? _payload;
  bool _loading = true;
  String? _error;

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
      final value = await widget.repository.fetchPatientPortalResource(
        _section.resource,
      );
      if (!mounted) return;
      setState(() {
        _payload = value;
        _loading = false;
      });
    } on Object catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error is ApiException ? error.message : error.toString();
        _loading = false;
      });
    }
  }

  Future<void> _select(PatientPortalSection value) async {
    if (_section == value) return;
    setState(() => _section = value);
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    final data = _payload?['data'];
    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        title: Text(
          _section.title,
          style: const TextStyle(
            color: AppColors.ink,
            fontWeight: FontWeight.w900,
          ),
        ),
        actions: [
          PopupMenuButton<PatientPortalSection>(
            tooltip: 'Cambiar módulo',
            onSelected: _select,
            icon: const Icon(Icons.grid_view_rounded),
            itemBuilder: (_) => PatientPortalSection.values
                .map(
                  (section) => PopupMenuItem(
                    value: section,
                    child: Row(
                      children: [
                        Icon(section.icon, color: AppColors.accent, size: 19),
                        const SizedBox(width: 10),
                        Text(section.title),
                      ],
                    ),
                  ),
                )
                .toList(growable: false),
          ),
          IconButton(
            tooltip: 'Actualizar',
            onPressed: _loading ? null : _load,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          children: [
            _Header(section: _section),
            const SizedBox(height: 14),
            if (_loading)
              const SizedBox(
                height: 220,
                child: Center(child: CircularProgressIndicator()),
              )
            else if (_error != null)
              _Message(
                title: 'No se pudo cargar',
                text: _error!,
                danger: true,
              )
            else
              _SectionContent(section: _section, data: data),
          ],
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.section});
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

class _SectionContent extends StatelessWidget {
  const _SectionContent({required this.section, required this.data});
  final PatientPortalSection section;
  final Object? data;

  @override
  Widget build(BuildContext context) {
    if (data is List) {
      final items = (data as List)
          .whereType<Map>()
          .map((e) => e.map((k, v) => MapEntry(k.toString(), v)))
          .toList(growable: false);
      if (items.isEmpty) {
        return const _Message(
          title: 'Sin información por ahora',
          text: 'Los registros de tu equipo clínico aparecerán aquí.',
        );
      }
      return Column(
        children: items
            .map((item) => _RecordCard(section: section, item: item))
            .toList(growable: false),
      );
    }

    if (data is Map) {
      final map = (data as Map).map(
        (key, value) => MapEntry(key.toString(), value),
      );
      return _MapSummary(section: section, data: map);
    }

    return const _Message(
      title: 'Sin información por ahora',
      text: 'Este módulo todavía no tiene registros para mostrar.',
    );
  }
}

class _RecordCard extends StatelessWidget {
  const _RecordCard({required this.section, required this.item});
  final PatientPortalSection section;
  final Map<String, dynamic> item;

  @override
  Widget build(BuildContext context) {
    final doctor = _map(item['doctor']);
    final clinic = _map(item['clinic']);
    final title = switch (section) {
      PatientPortalSection.appointments => _date(item['scheduled_at']),
      PatientPortalSection.results =>
        _string(item['study_name']) ?? 'Estudio',
      PatientPortalSection.history =>
        _string(item['chief_complaint']) ?? 'Consulta clínica',
      PatientPortalSection.prescriptions =>
        _string(item['medication']) ?? 'Medicamento',
      _ => section.title,
    };

    final lines = <String>[
      if (_string(doctor?['name']) case final value?) value,
      if (_string(doctor?['specialty']) case final value?) value,
      if (_string(clinic?['name']) case final value?) value,
      if (_string(item['dosage']) case final value?) 'Dosis: ' + value,
      if (_string(item['frequency']) case final value?) 'Frecuencia: ' + value,
      if (_string(item['result_summary']) case final value?) value,
      if (_string(item['notes']) case final value?) value,
    ];

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(15),
      decoration: _panel(),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            backgroundColor: AppColors.accentSoft,
            child: Icon(section.icon, color: AppColors.accent),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: AppColors.ink,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                if (_string(item['status_label'] ?? item['status'])
                    case final status?) ...[
                  const SizedBox(height: 3),
                  Text(
                    status,
                    style: const TextStyle(
                      color: AppColors.accent,
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
                const SizedBox(height: 7),
                ...lines.map(
                  (line) => Padding(
                    padding: const EdgeInsets.only(bottom: 3),
                    child: Text(
                      line,
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MapSummary extends StatelessWidget {
  const _MapSummary({required this.section, required this.data});
  final PatientPortalSection section;
  final Map<String, dynamic> data;

  @override
  Widget build(BuildContext context) {
    final rows = <MapEntry<String, String>>[];
    void add(String label, Object? value) {
      final text = _display(value);
      if (text != null) rows.add(MapEntry(label, text));
    }

    if (section == PatientPortalSection.profile) {
      add('Nombre', data['name']);
      add('Código', data['patient_code']);
      add('Correo', data['email']);
      add('Teléfono', data['phone_number']);
      add('Estado', data['status']);
      final clinic = _map(data['clinic']);
      add('Clínica', clinic?['name']);
    } else if (section == PatientPortalSection.triage) {
      add('Motivo', data['reason']);
      add('Nivel orientativo', data['triage_level']);
      add('Estado', data['triage_status']);
      add('Temperatura', data['temperature_c']);
      add('Presión sistólica', data['systolic_bp']);
      add('Presión diastólica', data['diastolic_bp']);
      add('Frecuencia cardiaca', data['heart_rate']);
      add('Frecuencia respiratoria', data['respiratory_rate']);
      add('Saturación de oxígeno', data['oxygen_saturation']);
    } else if (section == PatientPortalSection.membership) {
      add('Disponible', data['available']);
      add('Mensaje', data['message']);
      final plan = _map(data['plan']);
      final coverage = _map(data['coverage']);
      final clinic = _map(data['clinic']);
      add('Plan', plan?['name']);
      add('Estado', coverage?['status']);
      add('Clínica', clinic?['name']);
    } else {
      add('Mensaje', data['message']);
      final metrics = _map(data['metrics']);
      add('Citas', metrics?['appointments']);
      add('Consultas', metrics?['consultations']);
      add('Laboratorios', metrics?['laboratory_orders']);
      add('Recetas activas', metrics?['active_prescriptions']);
    }

    if (rows.isEmpty) {
      return const _Message(
        title: 'Información protegida',
        text: 'No hay datos adicionales disponibles en este momento.',
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: _panel(),
      child: Column(
        children: rows
            .map(
              (row) => ListTile(
                dense: true,
                contentPadding: EdgeInsets.zero,
                title: Text(row.key),
                subtitle: Text(row.value),
              ),
            )
            .toList(growable: false),
      ),
    );
  }
}

class _Message extends StatelessWidget {
  const _Message({
    required this.title,
    required this.text,
    this.danger = false,
  });

  final String title;
  final String text;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    final color = danger ? AppColors.danger : AppColors.accent;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: _panel(),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            danger ? Icons.error_outline_rounded : Icons.info_outline_rounded,
            color: color,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: color,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  text,
                  style: const TextStyle(
                    color: AppColors.muted,
                    fontSize: 12,
                    height: 1.45,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

BoxDecoration _panel() => BoxDecoration(
  color: Colors.white,
  border: Border.all(color: AppColors.line),
  borderRadius: BorderRadius.circular(18),
);

Map<String, dynamic>? _map(Object? value) {
  if (value is! Map) return null;
  return value.map((key, item) => MapEntry(key.toString(), item));
}

String? _string(Object? value) {
  if (value is String && value.trim().isNotEmpty) return value.trim();
  return null;
}

String? _display(Object? value) {
  if (value == null) return null;
  if (value is String && value.trim().isEmpty) return null;
  if (value is bool) return value ? 'Sí' : 'No';
  if (value is num) return value.toString();
  return value is String ? value.trim() : null;
}

String _date(Object? value) {
  final text = _string(value);
  if (text == null) return 'Fecha no registrada';
  final parsed = DateTime.tryParse(text)?.toLocal();
  if (parsed == null) return text;
  final day = parsed.day.toString().padLeft(2, '0');
  final month = parsed.month.toString().padLeft(2, '0');
  final hour = parsed.hour.toString().padLeft(2, '0');
  final minute = parsed.minute.toString().padLeft(2, '0');
  return day +
      '/' +
      month +
      '/' +
      parsed.year.toString() +
      ' · ' +
      hour +
      ':' +
      minute;
}

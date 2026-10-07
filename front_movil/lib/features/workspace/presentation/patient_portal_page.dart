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

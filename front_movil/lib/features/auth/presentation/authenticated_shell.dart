import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../data/auth_repository.dart';
import '../domain/auth_models.dart';
import '../../workspace/domain/mobile_workspace.dart';
import '../../workspace/presentation/patient_consents_panel.dart';
import 'auth_controller.dart';
import 'receptionist_invitation_page.dart';

class AuthenticatedShell extends StatefulWidget {
  const AuthenticatedShell({
    required this.session,
    required this.authGateway,
    required this.authController,
    this.authBypass = false,
    super.key,
  });

  final AuthenticatedSession session;
  final AuthGateway authGateway;
  final AuthController authController;
  final bool authBypass;

  @override
  State<AuthenticatedShell> createState() => _AuthenticatedShellState();
}

class _AuthenticatedShellState extends State<AuthenticatedShell> {
  MobileWorkspaceSnapshot? _snapshot;
  String? _error;
  bool _loading = true;
  int _destination = 0;

  @override
  void initState() {
    super.initState();
    _loadWorkspace();
  }

  Future<void> _loadWorkspace() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      if (widget.authBypass) {
        if (!mounted) return;
        setState(() {
          _snapshot = _qaSnapshot();
          _loading = false;
        });
        return;
      }

      final gateway = widget.authGateway;
      if (gateway is! AuthRepository) {
        if (!mounted) return;
        setState(() {
          _snapshot = _fallbackSnapshot();
          _loading = false;
        });
        return;
      }

      final snapshot = await gateway.loadMobileWorkspace(widget.session);
      if (!mounted) return;
      setState(() {
        _snapshot = snapshot;
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

  MobileWorkspaceSnapshot _qaSnapshot() {
    final role = actorContextLabel(widget.session.actorContext);

    return MobileWorkspaceSnapshot(
      roleTitle: '$role · Modo QA',
      headline: 'Acceso directo habilitado',
      helper:
          'Build de pruebas sin OTP. La autenticación real permanece activa en producción.',
      metrics: const <MobileWorkspaceMetric>[
        MobileWorkspaceMetric(
          label: 'Modo',
          value: 'QA',
          icon: 'pending',
        ),
        MobileWorkspaceMetric(
          label: 'OTP',
          value: 'OFF',
          icon: 'messages',
        ),
      ],
      items: <MobileWorkspaceItem>[
        MobileWorkspaceItem(
          title: 'Sesión de demostración',
          subtitle: 'Rol: $role',
          status: 'Sin credenciales reales',
        ),
      ],
      modules: _qaModules(widget.session.actorContext),
      generatedAt: DateTime.now(),
    );
  }

  List<MobileWorkspaceModule> _qaModules(String actorContext) {
    return switch (actorContext) {
      'patient' => const <MobileWorkspaceModule>[
          MobileWorkspaceModule(
            label: 'Citas',
            helper: 'Prueba de navegación del paciente',
            icon: 'calendar',
          ),
          MobileWorkspaceModule(
            label: 'Historia',
            helper: 'Vista demostrativa',
            icon: 'history',
          ),
          MobileWorkspaceModule(
            label: 'Recetas',
            helper: 'Vista demostrativa',
            icon: 'prescription',
          ),
          MobileWorkspaceModule(
            label: 'Resultados',
            helper: 'Vista demostrativa',
            icon: 'laboratory',
          ),
        ],
      'doctor' => const <MobileWorkspaceModule>[
          MobileWorkspaceModule(
            label: 'Agenda',
            helper: 'Prueba del flujo médico',
            icon: 'calendar',
          ),
          MobileWorkspaceModule(
            label: 'Pacientes',
            helper: 'Vista demostrativa',
            icon: 'patients',
          ),
          MobileWorkspaceModule(
            label: 'Recetas',
            helper: 'Vista demostrativa',
            icon: 'prescription',
          ),
          MobileWorkspaceModule(
            label: 'Laboratorio',
            helper: 'Vista demostrativa',
            icon: 'laboratory',
          ),
        ],
      'receptionist' => const <MobileWorkspaceModule>[
          MobileWorkspaceModule(
            label: 'Agenda',
            helper: 'Prueba del flujo de recepción',
            icon: 'calendar',
          ),
          MobileWorkspaceModule(
            label: 'Pacientes',
            helper: 'Vista demostrativa',
            icon: 'patients',
          ),
          MobileWorkspaceModule(
            label: 'Caja',
            helper: 'Vista demostrativa',
            icon: 'billing',
          ),
        ],
      'clinic_admin' => const <MobileWorkspaceModule>[
          MobileWorkspaceModule(
            label: 'Operación',
            helper: 'Prueba de administración de clínica',
            icon: 'patients',
          ),
          MobileWorkspaceModule(
            label: 'Agenda',
            helper: 'Vista demostrativa',
            icon: 'calendar',
          ),
          MobileWorkspaceModule(
            label: 'Caja',
            helper: 'Vista demostrativa',
            icon: 'billing',
          ),
        ],
      _ => const <MobileWorkspaceModule>[],
    };
  }

  MobileWorkspaceSnapshot _fallbackSnapshot() {
    return MobileWorkspaceSnapshot(
      roleTitle: actorContextLabel(widget.session.actorContext),
      headline: 'Sesión móvil activa',
      helper: 'Tu identidad fue validada en este dispositivo.',
      metrics: const <MobileWorkspaceMetric>[],
      items: const <MobileWorkspaceItem>[],
      modules: const <MobileWorkspaceModule>[],
      generatedAt: DateTime.now(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final snapshot = _snapshot ?? _fallbackSnapshot();

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        titleSpacing: 16,
        title: const _MobileBrand(),
        actions: [
          IconButton(
            tooltip: 'Actualizar',
            onPressed: _loading ? null : _loadWorkspace,
            icon: _loading
                ? const SizedBox.square(
                    dimension: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.refresh_rounded),
          ),
          const SizedBox(width: 6),
        ],
      ),
      body: SafeArea(
        top: false,
        child: IndexedStack(
          index: _destination,
          children: [
            _HomeTab(
              session: widget.session,
              snapshot: snapshot,
              loading: _loading,
              error: _error,
              onRetry: _loadWorkspace,
            ),
            _ActivityTab(snapshot: snapshot, loading: _loading),
            _AccountTab(
              session: widget.session,
              authGateway: widget.authGateway,
              authController: widget.authController,
              authBypass: widget.authBypass,
            ),
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _destination,
        onDestinationSelected: (index) => setState(() => _destination = index),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'Inicio',
          ),
          NavigationDestination(
            icon: Icon(Icons.view_list_outlined),
            selectedIcon: Icon(Icons.view_list_rounded),
            label: 'Actividad',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline_rounded),
            selectedIcon: Icon(Icons.person_rounded),
            label: 'Cuenta',
          ),
        ],
      ),
    );
  }
}

class _MobileBrand extends StatelessWidget {
  const _MobileBrand();

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Image.asset(
          'assets/branding/hipocratiq-mark.webp',
          width: 30,
          height: 30,
          filterQuality: FilterQuality.high,
          semanticLabel: 'HIPOCRATIQ',
        ),
        const SizedBox(width: 9),
        const Text(
          'HIPOCRATIQ',
          style: TextStyle(
            color: AppColors.ink,
            fontSize: 16,
            fontWeight: FontWeight.w900,
            letterSpacing: 1,
          ),
        ),
      ],
    );
  }
}

class _HomeTab extends StatelessWidget {
  const _HomeTab({
    required this.session,
    required this.snapshot,
    required this.loading,
    required this.error,
    required this.onRetry,
  });

  final AuthenticatedSession session;
  final MobileWorkspaceSnapshot snapshot;
  final bool loading;
  final String? error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async => onRetry(),
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 18, 16, 28),
        children: [
          Text(
            'Hola, ${session.user.name.split(' ').first}',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: AppColors.ink,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.7,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            snapshot.roleTitle,
            style: const TextStyle(
              color: AppColors.accent,
              fontSize: 12,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 18),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.accent,
              borderRadius: BorderRadius.circular(22),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x250862DD),
                  blurRadius: 22,
                  offset: Offset(0, 12),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  snapshot.headline,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 7),
                Text(
                  snapshot.helper,
                  style: const TextStyle(
                    color: Color(0xE6FFFFFF),
                    height: 1.45,
                  ),
                ),
              ],
            ),
          ),
          if (error != null) ...[
            const SizedBox(height: 14),
            _ErrorCard(message: error!, onRetry: onRetry),
          ],
          const SizedBox(height: 18),
          _SectionTitle(
            title: 'Resumen',
            helper: loading
                ? 'Actualizando datos clínicos…'
                : 'Datos sincronizados con HIPOCRATIQ',
          ),
          const SizedBox(height: 10),
          if (loading && snapshot.metrics.isEmpty)
            const _LoadingPanel()
          else
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: snapshot.metrics.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisExtent: 116,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
              ),
              itemBuilder: (context, index) =>
                  _MetricCard(metric: snapshot.metrics[index]),
            ),
          const SizedBox(height: 20),
          const _SectionTitle(
            title: 'Accesos rápidos',
            helper: 'Información prioritaria para uso móvil',
          ),
          const SizedBox(height: 10),
          ...snapshot.modules.map(
            (module) => Padding(
              padding: const EdgeInsets.only(bottom: 9),
              child: _ModuleCard(module: module),
            ),
          ),
        ],
      ),
    );
  }
}

class _ActivityTab extends StatelessWidget {
  const _ActivityTab({required this.snapshot, required this.loading});

  final MobileWorkspaceSnapshot snapshot;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 28),
      children: [
        Text(
          'Actividad reciente',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w900,
            color: AppColors.ink,
          ),
        ),
        const SizedBox(height: 5),
        const Text(
          'Prioridades del día sincronizadas con la plataforma.',
          style: TextStyle(color: AppColors.muted),
        ),
        const SizedBox(height: 18),
        if (loading && snapshot.items.isEmpty)
          const _LoadingPanel()
        else if (snapshot.items.isEmpty)
          const _EmptyCard(
            icon: Icons.check_circle_outline_rounded,
            title: 'Sin actividad pendiente',
            helper: 'No hay registros recientes para mostrar en este momento.',
          )
        else
          ...snapshot.items.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: _ActivityCard(item: item),
            ),
          ),
      ],
    );
  }
}

class _AccountTab extends StatelessWidget {
  const _AccountTab({
    required this.session,
    required this.authGateway,
    required this.authController,
    required this.authBypass,
  });

  final AuthenticatedSession session;
  final AuthGateway authGateway;
  final AuthController authController;
  final bool authBypass;

  @override
  Widget build(BuildContext context) {
    final contact = session.user.email ?? session.user.phoneNumber;

    return AnimatedBuilder(
      animation: authController,
      builder: (context, child) {
        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 18, 16, 28),
          children: [
            Text(
              'Cuenta y seguridad',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w900,
                color: AppColors.ink,
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: AppColors.line),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    session.user.name,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: AppColors.ink,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    contact.isEmpty ? 'Contacto no disponible' : contact,
                    style: const TextStyle(color: AppColors.muted),
                  ),
                  const SizedBox(height: 14),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _Tag(label: actorContextLabel(session.actorContext)),
                      _Tag(
                        label: authBypass
                            ? 'Modo QA · OTP omitido'
                            : 'Sesión móvil segura',
                      ),
                    ],
                  ),
                ],
              ),
            ),
            if (session.actorContext == 'patient') ...[
              const SizedBox(height: 14),
              PatientConsentsPanel(authGateway: authGateway),
            ],
            if (session.actorContext == 'clinic_admin') ...[
              const SizedBox(height: 14),
              OutlinedButton.icon(
                onPressed: () async {
                  await Navigator.of(context).push<void>(
                    MaterialPageRoute<void>(
                      builder: (context) =>
                          ReceptionistInvitationPage(authGateway: authGateway),
                    ),
                  );
                },
                icon: const Icon(Icons.person_add_alt_1_rounded),
                label: const Text('Invitar a recepción'),
              ),
            ],
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: authController.isLoggingOut
                  ? null
                  : () => authController.logout(allDevices: false),
              icon: authController.isLoggingOut
                  ? const SizedBox.square(
                      dimension: 17,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.logout_rounded),
              label: const Text('Cerrar sesión en este dispositivo'),
            ),
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: authController.isLoggingOut
                  ? null
                  : () => _confirmLogoutAll(context),
              icon: const Icon(Icons.devices_outlined),
              label: const Text('Cerrar todas las sesiones'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _confirmLogoutAll(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Cerrar todas las sesiones'),
        content: const Text(
          'Se cerrarán las sesiones móviles y web activas de tu cuenta.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Cerrar todas'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await authController.logout(allDevices: true);
    }
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.metric});

  final MobileWorkspaceMetric metric;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(17),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(_iconFor(metric.icon), size: 21, color: AppColors.accent),
          const Spacer(),
          Text(
            metric.value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: AppColors.ink,
              fontSize: 20,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            metric.label,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 11,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _ModuleCard extends StatelessWidget {
  const _ModuleCard({required this.module});

  final MobileWorkspaceModule module;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.line),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: AppColors.accentSoft,
              borderRadius: BorderRadius.circular(13),
            ),
            child: Icon(
              _iconFor(module.icon),
              color: AppColors.accent,
              size: 21,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  module.label,
                  style: const TextStyle(fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 2),
                Text(
                  module.helper,
                  style: const TextStyle(color: AppColors.muted, fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ActivityCard extends StatelessWidget {
  const _ActivityCard({required this.item});

  final MobileWorkspaceItem item;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.line),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.event_note_rounded,
            color: AppColors.accent,
            size: 22,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.title,
                  style: const TextStyle(fontWeight: FontWeight.w900),
                ),
                if (item.subtitle.isNotEmpty) ...[
                  const SizedBox(height: 3),
                  Text(
                    item.subtitle,
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 12,
                    ),
                  ),
                ],
                const SizedBox(height: 7),
                Text(
                  item.status,
                  style: const TextStyle(
                    color: AppColors.accent,
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
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

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title, required this.helper});

  final String title;
  final String helper;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Expanded(
          child: Text(
            title,
            style: const TextStyle(
              color: AppColors.ink,
              fontSize: 16,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        Flexible(
          child: Text(
            helper,
            textAlign: TextAlign.end,
            style: const TextStyle(color: AppColors.muted, fontSize: 10),
          ),
        ),
      ],
    );
  }
}

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.dangerSoft,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline_rounded, color: AppColors.danger),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(
                color: AppColors.danger,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          TextButton(onPressed: onRetry, child: const Text('Reintentar')),
        ],
      ),
    );
  }
}

class _LoadingPanel extends StatelessWidget {
  const _LoadingPanel();

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      height: 120,
      child: Center(child: CircularProgressIndicator(strokeWidth: 2.5)),
    );
  }
}

class _EmptyCard extends StatelessWidget {
  const _EmptyCard({
    required this.icon,
    required this.title,
    required this.helper,
  });

  final IconData icon;
  final String title;
  final String helper;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(17),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        children: [
          Icon(icon, color: AppColors.accent, size: 30),
          const SizedBox(height: 10),
          Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
          const SizedBox(height: 4),
          Text(
            helper,
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppColors.muted, fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  const _Tag({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: AppColors.accentSoft,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: AppColors.accent,
          fontSize: 11,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

IconData _iconFor(String value) {
  return switch (value) {
    'calendar' => Icons.calendar_month_rounded,
    'history' => Icons.history_rounded,
    'prescription' => Icons.medication_outlined,
    'laboratory' => Icons.science_outlined,
    'patients' => Icons.groups_2_outlined,
    'billing' => Icons.payments_outlined,
    'messages' => Icons.chat_bubble_outline_rounded,
    'pending' => Icons.schedule_rounded,
    _ => Icons.health_and_safety_outlined,
  };
}

String actorContextLabel(String actorContext) {
  return switch (actorContext) {
    'patient' => 'Paciente',
    'doctor' => 'Médico',
    'receptionist' => 'Recepción',
    'clinic_admin' => 'Administrador de clínica',
    _ => 'Cuenta autenticada',
  };
}

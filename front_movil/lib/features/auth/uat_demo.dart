import 'domain/auth_models.dart';
import '../workspace/domain/mobile_workspace.dart';

const bool uatDemoEnabled = bool.fromEnvironment(
  'UAT_DEMO_MODE',
  defaultValue: false,
);

const String uatDemoCode = String.fromEnvironment(
  'UAT_OTP_CODE',
  defaultValue: '1234',
);

const String _uatDomain = 'uat.hipocratiq.test';

OtpChallenge createUatDemoChallenge() {
  return const OtpChallenge(
    challengeId: '00000000-0000-4000-8000-000000001234',
    expiresIn: Duration(minutes: 30),
    resendAfter: Duration.zero,
  );
}

MobileAuthSession createUatDemoSession(AuthRole role) {
  final actorContext = switch (role) {
    AuthRole.patient => 'patient',
    AuthRole.healthcare => 'doctor',
    AuthRole.receptionist => 'receptionist',
    AuthRole.administrator => 'clinic_admin',
  };

  final roleKey = role.requestedRole;
  final clinic = const ClinicSummary(
    id: 9001,
    name: 'HIPOCRATIQ Clínica UAT',
    status: 'active',
    plan: 'Professional',
  );

  final user = AuthenticatedUser(
    id: switch (role) {
      AuthRole.patient => 9101,
      AuthRole.healthcare => 9102,
      AuthRole.receptionist => 9103,
      AuthRole.administrator => 9104,
    },
    name: switch (role) {
      AuthRole.patient => 'Paciente UAT',
      AuthRole.healthcare => 'Dr. Médico UAT',
      AuthRole.receptionist => 'Recepción UAT',
      AuthRole.administrator => 'Administrador UAT',
    },
    email: '${roleKey}@$_uatDomain',
    phoneNumber: '+525500001234',
    countryCode: 'MX',
    status: 'active',
    onboardingStatus: 'completed',
    roles: <String>[roleKey],
    isGlobal: false,
    patient: role == AuthRole.patient
        ? const PatientSummary(clinic: clinic, plan: 'Professional')
        : null,
    clinic: role == AuthRole.patient ? null : clinic,
    doctor: role == AuthRole.healthcare
        ? const DoctorSummary(
            medicalLicense: 'UAT-MX-1234',
            specialty: 'Medicina General',
            practiceType: 'clinic',
            clinic: clinic,
            plan: 'Professional',
          )
        : null,
  );

  return MobileAuthSession(
    accessToken: 'uat-demo-local-token-$role.requestedRole',
    tokenType: 'UAT',
    user: user,
    actorContext: actorContext,
    nextStep: 'dashboard',
  );
}

bool isUatDemoSession(AuthenticatedSession session) {
  return session.user.email?.endsWith('@$_uatDomain') == true;
}

MobileWorkspaceSnapshot uatDemoWorkspace(AuthenticatedSession session) {
  return switch (session.actorContext) {
    'patient' => MobileWorkspaceSnapshot(
      roleTitle: 'Paciente · UAT',
      headline: 'Tu atención de prueba',
      helper:
          'Explora citas, historia, recetas y resultados con datos sintéticos.',
      metrics: const <MobileWorkspaceMetric>[
        MobileWorkspaceMetric(
          label: 'Próximas citas',
          value: '2',
          icon: 'calendar',
        ),
        MobileWorkspaceMetric(label: 'Consultas', value: '5', icon: 'history'),
        MobileWorkspaceMetric(
          label: 'Recetas activas',
          value: '1',
          icon: 'prescription',
        ),
        MobileWorkspaceMetric(
          label: 'Resultados',
          value: '3',
          icon: 'laboratory',
        ),
      ],
      items: const <MobileWorkspaceItem>[
        MobileWorkspaceItem(
          title: 'Consulta de seguimiento',
          subtitle: 'Dr. Médico UAT · 10 oct. 2026 · 09:30',
          status: 'Confirmada',
        ),
        MobileWorkspaceItem(
          title: 'Laboratorio general',
          subtitle: 'HIPOCRATIQ Clínica UAT · 12 oct. 2026',
          status: 'Programado',
        ),
      ],
      modules: const <MobileWorkspaceModule>[
        MobileWorkspaceModule(
          label: 'Citas',
          helper: 'Agenda y próximas atenciones',
          icon: 'calendar',
        ),
        MobileWorkspaceModule(
          label: 'Historia',
          helper: 'Consultas verificadas',
          icon: 'history',
        ),
        MobileWorkspaceModule(
          label: 'Recetas',
          helper: 'Indicaciones vigentes',
          icon: 'prescription',
        ),
        MobileWorkspaceModule(
          label: 'Resultados',
          helper: 'Laboratorio disponible',
          icon: 'laboratory',
        ),
      ],
      generatedAt: DateTime(2026, 10, 7),
    ),
    'doctor' => MobileWorkspaceSnapshot(
      roleTitle: 'Médico · UAT',
      headline: 'Jornada clínica de prueba',
      helper:
          'Revisa agenda, pacientes, recetas y laboratorio con datos sintéticos.',
      metrics: const <MobileWorkspaceMetric>[
        MobileWorkspaceMetric(label: 'Citas hoy', value: '8', icon: 'calendar'),
        MobileWorkspaceMetric(label: 'Pendientes', value: '3', icon: 'pending'),
        MobileWorkspaceMetric(
          label: 'Pacientes',
          value: '42',
          icon: 'patients',
        ),
        MobileWorkspaceMetric(
          label: 'Consultas mes',
          value: '31',
          icon: 'history',
        ),
      ],
      items: const <MobileWorkspaceItem>[
        MobileWorkspaceItem(
          title: 'Paciente UAT 01',
          subtitle: '09:30 · Consulta',
          status: 'En espera',
        ),
        MobileWorkspaceItem(
          title: 'Paciente UAT 02',
          subtitle: '10:15 · Seguimiento',
          status: 'Confirmada',
        ),
      ],
      modules: const <MobileWorkspaceModule>[
        MobileWorkspaceModule(
          label: 'Agenda',
          helper: 'Citas y estados del día',
          icon: 'calendar',
        ),
        MobileWorkspaceModule(
          label: 'Pacientes',
          helper: 'Expedientes vinculados',
          icon: 'patients',
        ),
        MobileWorkspaceModule(
          label: 'Recetas',
          helper: 'Prescripciones del día',
          icon: 'prescription',
        ),
        MobileWorkspaceModule(
          label: 'Laboratorio',
          helper: 'Órdenes y resultados',
          icon: 'laboratory',
        ),
      ],
      generatedAt: DateTime(2026, 10, 7),
    ),
    'receptionist' => MobileWorkspaceSnapshot(
      roleTitle: 'Recepción · UAT',
      headline: 'Recepción de prueba',
      helper:
          'Simula agenda, llegadas, pacientes y caja sin afectar producción.',
      metrics: const <MobileWorkspaceMetric>[
        MobileWorkspaceMetric(
          label: 'Citas hoy',
          value: '14',
          icon: 'calendar',
        ),
        MobileWorkspaceMetric(label: 'Pendientes', value: '6', icon: 'pending'),
        MobileWorkspaceMetric(
          label: 'Pacientes',
          value: '128',
          icon: 'patients',
        ),
        MobileWorkspaceMetric(
          label: 'Por cobrar',
          value: '2,450.00',
          icon: 'billing',
        ),
      ],
      items: const <MobileWorkspaceItem>[
        MobileWorkspaceItem(
          title: 'Paciente UAT 03',
          subtitle: '11:00 · Dr. Médico UAT',
          status: 'Llegó',
        ),
        MobileWorkspaceItem(
          title: 'Paciente UAT 04',
          subtitle: '11:30 · Dr. Médico UAT',
          status: 'Pendiente',
        ),
      ],
      modules: const <MobileWorkspaceModule>[
        MobileWorkspaceModule(
          label: 'Agenda',
          helper: 'Citas y llegadas del día',
          icon: 'calendar',
        ),
        MobileWorkspaceModule(
          label: 'Pacientes',
          helper: 'Registro y búsqueda rápida',
          icon: 'patients',
        ),
        MobileWorkspaceModule(
          label: 'Caja',
          helper: 'Cobros y saldos pendientes',
          icon: 'billing',
        ),
        MobileWorkspaceModule(
          label: 'Mensajes',
          helper: 'Comunicación operativa',
          icon: 'messages',
        ),
      ],
      generatedAt: DateTime(2026, 10, 7),
    ),
    _ => MobileWorkspaceSnapshot(
      roleTitle: 'Administrador de clínica · UAT',
      headline: 'Operación de clínica de prueba',
      helper:
          'Explora indicadores y módulos administrativos sin tocar datos reales.',
      metrics: const <MobileWorkspaceMetric>[
        MobileWorkspaceMetric(
          label: 'Citas hoy',
          value: '18',
          icon: 'calendar',
        ),
        MobileWorkspaceMetric(label: 'Pendientes', value: '7', icon: 'pending'),
        MobileWorkspaceMetric(
          label: 'Pacientes',
          value: '235',
          icon: 'patients',
        ),
        MobileWorkspaceMetric(
          label: 'Por cobrar',
          value: '4,980.00',
          icon: 'billing',
        ),
      ],
      items: const <MobileWorkspaceItem>[
        MobileWorkspaceItem(
          title: 'Operación UAT',
          subtitle: 'Clínica demo · corte 12:00',
          status: 'Activa',
        ),
        MobileWorkspaceItem(
          title: 'Caja UAT',
          subtitle: 'Resumen de prueba',
          status: 'Revisar',
        ),
      ],
      modules: const <MobileWorkspaceModule>[
        MobileWorkspaceModule(
          label: 'Agenda',
          helper: 'Operación del día',
          icon: 'calendar',
        ),
        MobileWorkspaceModule(
          label: 'Pacientes',
          helper: 'Padrón y expedientes',
          icon: 'patients',
        ),
        MobileWorkspaceModule(
          label: 'Caja',
          helper: 'Facturación y cobranza',
          icon: 'billing',
        ),
        MobileWorkspaceModule(
          label: 'Equipo',
          helper: 'Roles y accesos',
          icon: 'patients',
        ),
      ],
      generatedAt: DateTime(2026, 10, 7),
    ),
  };
}

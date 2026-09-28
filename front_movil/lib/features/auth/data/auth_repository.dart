// The public constructor keeps descriptive named parameters for call-site clarity.
// ignore_for_file: prefer_initializing_formals

import '../../../core/device/device_identity.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/storage/secure_store.dart';
import '../domain/auth_models.dart';
import '../domain/registration_models.dart';
import '../../workspace/domain/mobile_workspace.dart';
import 'registration_repository.dart';

abstract interface class AuthGateway {
  Future<OtpChallenge> requestLogin({
    required AuthRole role,
    required String identifier,
    String? password,
  });

  Future<OtpChallenge> requestPatientRegistration(RegistrationDraft draft);

  Future<List<ClinicOption>> fetchPatientClinics();

  Future<OtpChallenge> requestPasswordReset(String identifier);

  Future<List<PlanOption>> fetchRegistrationPlans();

  Future<List<ClinicOption>> fetchDoctorClinics();

  Future<RegistrationDraftSession> requestDoctorRegistration(
    DoctorRegistrationDraft draft,
  );

  Future<RegistrationDraftSession> selectDoctorPlan({
    required String draftToken,
    required String plan,
    required String billingCycle,
  });

  Future<MobileAuthSession> verifyDoctorRegistration({
    required String draftToken,
    required String challengeId,
    required String code,
  });

  Future<OtpChallenge> resendDoctorRegistration({required String draftToken});

  Future<RegistrationDraftSession> requestClinicRegistration(
    ClinicRegistrationDraft draft,
  );

  Future<RegistrationDraftSession> selectClinicPlan({
    required String draftToken,
    required String plan,
    required String billingCycle,
  });

  Future<MobileAuthSession> verifyClinicRegistration({
    required String draftToken,
    required String challengeId,
    required String code,
  });

  Future<OtpChallenge> resendClinicRegistration({required String draftToken});

  Future<ReceptionistInvitation> createReceptionistInvitation({
    required String name,
    required String email,
    required CountryCode country,
    required String phoneNumber,
  });

  Future<OtpChallenge> requestReceptionistActivation(String invitationToken);

  Future<MobileAuthSession> verifyReceptionistActivation({
    required String invitationToken,
    required String challengeId,
    required String code,
    required String password,
    required String passwordConfirmation,
  });

  Future<OtpChallenge> resendOtp(String challengeId);

  Future<MobileAuthSession> verifyAuthenticationOtp({
    required OtpPurpose purpose,
    required String challengeId,
    required String code,
  });

  Future<void> resetPasswordWithOtp({
    required String challengeId,
    required String code,
    required String password,
    required String passwordConfirmation,
  });

  Future<AuthenticatedSession?> restoreSession();

  Future<void> clearLocalSession();

  Future<void> logout({required bool allDevices});

  Future<List<MobilePatientConsent>> fetchPatientConsents();

  Future<MobilePatientConsent> grantPatientConsent(
    MobilePatientConsentScope scope, {
    String policyVersion = '2026-09',
  });

  Future<MobilePatientConsent> revokePatientConsent(int consentId);
}

class AuthRepository implements AuthGateway {
  AuthRepository({
    required ApiClient apiClient,
    required SecureStore secureStore,
    required DeviceIdentity deviceIdentity,
  }) : _apiClient = apiClient,
       _secureStore = secureStore,
       _deviceIdentity = deviceIdentity,
       _registrationRepository = RegistrationRepository(
         apiClient: apiClient,
         secureStore: secureStore,
         deviceIdentity: deviceIdentity,
       );

  final ApiClient _apiClient;
  final SecureStore _secureStore;
  final DeviceIdentity _deviceIdentity;
  final RegistrationRepository _registrationRepository;

  @override
  Future<OtpChallenge> requestLogin({
    required AuthRole role,
    required String identifier,
    String? password,
  }) async {
    final device = await _devicePayload();
    final payload = <String, dynamic>{
      'purpose': 'login',
      'client_type': 'mobile',
      'actor_context': role.actorContext,
      'requested_role': role.requestedRole,
      'identifier': identifier,
      ...device,
    };
    if (role.requiresPassword) {
      payload['password'] = password ?? '';
    }

    return _requestChallenge(payload);
  }

  @override
  Future<OtpChallenge> requestPatientRegistration(
    RegistrationDraft draft,
  ) async {
    final device = await _devicePayload();
    return _requestChallenge({
      ...draft.toPayload(
        deviceName: device['device_name'] as String,
        deviceId: device['device_id'] as String,
      ),
      ...device,
    });
  }

  @override
  Future<List<ClinicOption>> fetchPatientClinics() async {
    final response = await _apiClient.getJson(
      '/api/v1/auth/register/patient/clinics',
    );
    final data = response['data'];
    if (data is! List) {
      throw const FormatException('Missing clinic list.');
    }

    return data
        .map((item) {
          if (item is! Map) {
            throw const FormatException('Invalid clinic item.');
          }
          final json = item.map(
            (key, value) => MapEntry(key.toString(), value),
          );
          return ClinicOption.fromJson(json);
        })
        .toList(growable: false);
  }

  @override
  Future<OtpChallenge> requestPasswordReset(String identifier) async {
    final device = await _devicePayload();
    return _requestChallenge({
      'purpose': 'password_reset',
      'client_type': 'mobile',
      'actor_context': 'staff',
      'identifier': identifier,
      ...device,
    });
  }

  @override
  Future<OtpChallenge> resendOtp(String challengeId) async {
    final device = await _devicePayload();
    final response = await _apiClient.postJson(
      '/api/v1/auth/otp/resend',
      body: <String, dynamic>{
        'challenge_id': challengeId,
        'client_type': 'mobile',
        ...device,
      },
    );
    return OtpChallenge.fromJson(_data(response));
  }

  @override
  Future<MobileAuthSession> verifyAuthenticationOtp({
    required OtpPurpose purpose,
    required String challengeId,
    required String code,
  }) async {
    final response = await _apiClient.postJson(
      '/api/v1/auth/otp/verify',
      body: <String, dynamic>{
        'purpose': purpose.name == 'login' ? 'login' : 'registration',
        'client_type': 'mobile',
        'challenge_id': challengeId,
        'code': code,
        ...await _devicePayload(),
      },
    );
    final session = MobileAuthSession.fromJson(_data(response));
    await _secureStore.writeAccessToken(session.accessToken);
    return session;
  }

  @override
  Future<void> resetPasswordWithOtp({
    required String challengeId,
    required String code,
    required String password,
    required String passwordConfirmation,
  }) async {
    await _apiClient.postJson(
      '/api/v1/auth/otp/verify',
      body: <String, dynamic>{
        'purpose': 'password_reset',
        'client_type': 'mobile',
        'challenge_id': challengeId,
        'code': code,
        'password': password,
        'password_confirmation': passwordConfirmation,
        ...await _devicePayload(),
      },
    );
  }

  @override
  Future<AuthenticatedSession?> restoreSession() async {
    final token = await _secureStore.readAccessToken();
    if (token == null || token.trim().isEmpty) {
      return null;
    }

    try {
      final response = await _apiClient.getJson(
        '/api/v1/auth/me',
        accessToken: token,
      );
      return AuthenticatedSession.fromJson(_data(response));
    } on Object catch (error) {
      if (error is ApiException && error.isUnauthorized) {
        await _secureStore.deleteAccessToken();
        return null;
      }
      rethrow;
    }
  }

  @override
  Future<void> clearLocalSession() {
    return _secureStore.deleteAccessToken();
  }

  @override
  Future<void> logout({required bool allDevices}) async {
    final token = await _secureStore.readAccessToken();
    if (token == null || token.trim().isEmpty) {
      await _secureStore.deleteAccessToken();
      return;
    }

    final endpoint = allDevices
        ? '/api/v1/auth/logout-all'
        : '/api/v1/auth/logout';
    try {
      await _apiClient.postJson(endpoint, accessToken: token);
    } on Object catch (error) {
      if (error is! ApiException || !error.isUnauthorized) {
        rethrow;
      }
    } finally {
      await _secureStore.deleteAccessToken();
    }
  }

  @override
  Future<List<PlanOption>> fetchRegistrationPlans() {
    return _registrationRepository.fetchRegistrationPlans();
  }

  @override
  Future<List<ClinicOption>> fetchDoctorClinics() {
    return _registrationRepository.fetchDoctorClinics();
  }

  @override
  Future<RegistrationDraftSession> requestDoctorRegistration(
    DoctorRegistrationDraft draft,
  ) {
    return _registrationRepository.requestDoctorRegistration(draft);
  }

  @override
  Future<RegistrationDraftSession> selectDoctorPlan({
    required String draftToken,
    required String plan,
    required String billingCycle,
  }) {
    return _registrationRepository.selectDoctorPlan(
      draftToken: draftToken,
      plan: plan,
      billingCycle: billingCycle,
    );
  }

  @override
  Future<MobileAuthSession> verifyDoctorRegistration({
    required String draftToken,
    required String challengeId,
    required String code,
  }) {
    return _registrationRepository.verifyDoctorRegistration(
      draftToken: draftToken,
      challengeId: challengeId,
      code: code,
    );
  }

  @override
  Future<OtpChallenge> resendDoctorRegistration({required String draftToken}) {
    return _registrationRepository.resendDoctorRegistration(
      draftToken: draftToken,
    );
  }

  @override
  Future<RegistrationDraftSession> requestClinicRegistration(
    ClinicRegistrationDraft draft,
  ) {
    return _registrationRepository.requestClinicRegistration(draft);
  }

  @override
  Future<RegistrationDraftSession> selectClinicPlan({
    required String draftToken,
    required String plan,
    required String billingCycle,
  }) {
    return _registrationRepository.selectClinicPlan(
      draftToken: draftToken,
      plan: plan,
      billingCycle: billingCycle,
    );
  }

  @override
  Future<MobileAuthSession> verifyClinicRegistration({
    required String draftToken,
    required String challengeId,
    required String code,
  }) {
    return _registrationRepository.verifyClinicRegistration(
      draftToken: draftToken,
      challengeId: challengeId,
      code: code,
    );
  }

  @override
  Future<OtpChallenge> resendClinicRegistration({required String draftToken}) {
    return _registrationRepository.resendClinicRegistration(
      draftToken: draftToken,
    );
  }

  @override
  Future<ReceptionistInvitation> createReceptionistInvitation({
    required String name,
    required String email,
    required CountryCode country,
    required String phoneNumber,
  }) {
    return _registrationRepository.createReceptionistInvitation(
      name: name,
      email: email,
      country: country,
      phoneNumber: phoneNumber,
    );
  }

  @override
  Future<OtpChallenge> requestReceptionistActivation(String invitationToken) {
    return _registrationRepository.requestReceptionistActivation(
      invitationToken,
    );
  }

  @override
  Future<MobileAuthSession> verifyReceptionistActivation({
    required String invitationToken,
    required String challengeId,
    required String code,
    required String password,
    required String passwordConfirmation,
  }) {
    return _registrationRepository.verifyReceptionistActivation(
      invitationToken: invitationToken,
      challengeId: challengeId,
      code: code,
      password: password,
      passwordConfirmation: passwordConfirmation,
    );
  }

  @override
  Future<List<MobilePatientConsent>> fetchPatientConsents() async {
    final token = await _secureStore.readAccessToken();
    if (token == null || token.trim().isEmpty) {
      throw const ApiException(
        message: 'Tu sesión móvil expiró. Vuelve a iniciar sesión.',
        statusCode: 401,
      );
    }

    final response = await _apiClient.getJson(
      '/api/v1/auth/patient/consents',
      accessToken: token,
    );

    return _list(response['data'])
        .map(MobilePatientConsent.fromJson)
        .toList(growable: false);
  }

  @override
  Future<MobilePatientConsent> grantPatientConsent(
    MobilePatientConsentScope scope, {
    String policyVersion = '2026-09',
  }) async {
    final token = await _secureStore.readAccessToken();
    if (token == null || token.trim().isEmpty) {
      throw const ApiException(
        message: 'Tu sesión móvil expiró. Vuelve a iniciar sesión.',
        statusCode: 401,
      );
    }

    final response = await _apiClient.postJson(
      '/api/v1/auth/patient/consents',
      accessToken: token,
      body: <String, dynamic>{
        'scope': scope.value,
        'policy_version': policyVersion,
      },
    );

    return MobilePatientConsent.fromJson(_data(response));
  }

  @override
  Future<MobilePatientConsent> revokePatientConsent(int consentId) async {
    final token = await _secureStore.readAccessToken();
    if (token == null || token.trim().isEmpty) {
      throw const ApiException(
        message: 'Tu sesión móvil expiró. Vuelve a iniciar sesión.',
        statusCode: 401,
      );
    }

    final response = await _apiClient.postJson(
      '/api/v1/auth/patient/consents/$consentId/revoke',
      accessToken: token,
    );

    return MobilePatientConsent.fromJson(_data(response));
  }

  Future<MobileWorkspaceSnapshot> loadMobileWorkspace(
    AuthenticatedSession session,
  ) async {
    final token = await _secureStore.readAccessToken();
    if (token == null || token.trim().isEmpty) {
      throw const ApiException(
        message: 'Tu sesión móvil expiró. Vuelve a iniciar sesión.',
        statusCode: 401,
      );
    }

    return switch (session.actorContext) {
      'patient' => _loadPatientWorkspace(token),
      'doctor' => _loadDoctorWorkspace(token),
      'receptionist' => _loadClinicWorkspace(token, receptionist: true),
      'clinic_admin' => _loadClinicWorkspace(token, receptionist: false),
      _ => MobileWorkspaceSnapshot(
        roleTitle: actorContextLabelFallback(session.actorContext),
        headline: 'Sesión móvil activa',
        helper: 'Este rol se administra principalmente desde la versión web.',
        metrics: const <MobileWorkspaceMetric>[],
        items: const <MobileWorkspaceItem>[],
        modules: const <MobileWorkspaceModule>[],
        generatedAt: DateTime.now(),
      ),
    };
  }

  Future<MobileWorkspaceSnapshot> _loadPatientWorkspace(String token) async {
    final responses = await Future.wait<Map<String, dynamic>>([
      _apiClient.getJson(
        '/api/v1/auth/patient/appointments',
        accessToken: token,
      ),
      _apiClient.getJson('/api/v1/auth/patient/history', accessToken: token),
      _apiClient.getJson(
        '/api/v1/auth/patient/prescriptions',
        accessToken: token,
      ),
      _apiClient.getJson('/api/v1/auth/patient/results', accessToken: token),
    ]);

    final appointments = _items(responses[0]);
    final appointmentMeta = _meta(responses[0]);
    final historyMeta = _meta(responses[1]);
    final prescriptionMeta = _meta(responses[2]);
    final resultMeta = _meta(responses[3]);

    return MobileWorkspaceSnapshot(
      roleTitle: 'Paciente',
      headline: 'Tu atención de hoy',
      helper:
          'Consulta citas, historia, recetas y resultados desde tu sesión segura.',
      metrics: <MobileWorkspaceMetric>[
        MobileWorkspaceMetric(
          label: 'Próximas citas',
          value: _integer(appointmentMeta['upcoming']).toString(),
          icon: 'calendar',
        ),
        MobileWorkspaceMetric(
          label: 'Consultas',
          value: _integer(historyMeta['total']).toString(),
          icon: 'history',
        ),
        MobileWorkspaceMetric(
          label: 'Recetas activas',
          value: _integer(prescriptionMeta['active']).toString(),
          icon: 'prescription',
        ),
        MobileWorkspaceMetric(
          label: 'Resultados',
          value: _integer(resultMeta['available']).toString(),
          icon: 'laboratory',
        ),
      ],
      items: appointments
          .take(5)
          .map((item) {
            final doctor = _map(item['doctor']);
            final scheduledAt =
                _text(item['scheduled_at']) ??
                _text(item['scheduled_date']) ??
                'Fecha pendiente';
            return MobileWorkspaceItem(
              title: _text(item['appointment_type']) ?? 'Cita médica',
              subtitle: [
                _text(doctor?['name']),
                scheduledAt,
              ].whereType<String>().join(' · '),
              status:
                  _text(item['status_label']) ??
                  _text(item['status']) ??
                  'Programada',
            );
          })
          .toList(growable: false),
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
      generatedAt: DateTime.now(),
    );
  }

  Future<MobileWorkspaceSnapshot> _loadDoctorWorkspace(String token) async {
    final responses = await Future.wait<Map<String, dynamic>>([
      _apiClient.getJson('/api/v1/auth/doctor/dashboard', accessToken: token),
      _apiClient.getJson(
        '/api/v1/auth/doctor/prescriptions',
        accessToken: token,
      ),
      _apiClient.getJson('/api/v1/auth/doctor/laboratory', accessToken: token),
    ]);
    final dashboard = _dataMap(responses[0]);
    final metrics = _map(dashboard['metrics']) ?? const <String, dynamic>{};
    final appointments = _list(dashboard['today_appointments']);

    return MobileWorkspaceSnapshot(
      roleTitle: 'Médico',
      headline: 'Jornada clínica',
      helper: 'Prioriza agenda, pacientes y pendientes desde el móvil.',
      metrics: <MobileWorkspaceMetric>[
        MobileWorkspaceMetric(
          label: 'Citas hoy',
          value: _integer(metrics['today_appointments']).toString(),
          icon: 'calendar',
        ),
        MobileWorkspaceMetric(
          label: 'Pendientes',
          value: _integer(metrics['today_pending']).toString(),
          icon: 'pending',
        ),
        MobileWorkspaceMetric(
          label: 'Pacientes',
          value: _integer(metrics['patients_total']).toString(),
          icon: 'patients',
        ),
        MobileWorkspaceMetric(
          label: 'Consultas mes',
          value: _integer(metrics['month_consultations']).toString(),
          icon: 'history',
        ),
      ],
      items: appointments
          .take(5)
          .map((item) {
            final patient = _map(item['patient']);
            return MobileWorkspaceItem(
              title:
                  _text(patient?['name']) ??
                  _text(item['patient_name']) ??
                  'Paciente',
              subtitle: [
                _text(item['time']),
                _text(item['appointment_type']),
              ].whereType<String>().join(' · '),
              status:
                  _text(item['status_label']) ??
                  _text(item['status']) ??
                  'Programada',
            );
          })
          .toList(growable: false),
      modules: <MobileWorkspaceModule>[
        const MobileWorkspaceModule(
          label: 'Agenda',
          helper: 'Citas y estados del día',
          icon: 'calendar',
        ),
        const MobileWorkspaceModule(
          label: 'Pacientes',
          helper: 'Expedientes vinculados',
          icon: 'patients',
        ),
        MobileWorkspaceModule(
          label: 'Recetas',
          helper: '${_items(responses[1]).length} registros cargados',
          icon: 'prescription',
        ),
        MobileWorkspaceModule(
          label: 'Laboratorio',
          helper: '${_items(responses[2]).length} órdenes cargadas',
          icon: 'laboratory',
        ),
      ],
      generatedAt: DateTime.now(),
    );
  }

  Future<MobileWorkspaceSnapshot> _loadClinicWorkspace(
    String token, {
    required bool receptionist,
  }) async {
    final now = DateTime.now();
    final from =
        '${now.year.toString().padLeft(4, '0')}-${now.month.toString().padLeft(2, '0')}-01';
    final lastDay = DateTime(now.year, now.month + 1, 0).day;
    final to =
        '${now.year.toString().padLeft(4, '0')}-${now.month.toString().padLeft(2, '0')}-${lastDay.toString().padLeft(2, '0')}';
    final responses = await Future.wait<Map<String, dynamic>>([
      _apiClient.getJson('/api/v1/auth/clinic/dashboard', accessToken: token),
      _apiClient.getJson(
        '/api/v1/auth/clinic/billing/report?from=$from&to=$to',
        accessToken: token,
      ),
    ]);
    final dashboard = _dataMap(responses[0]);
    final metrics = _map(dashboard['metrics']) ?? const <String, dynamic>{};
    final summary =
        _map(dashboard['appointment_summary']) ?? const <String, dynamic>{};
    final appointments = _list(dashboard['today_appointments']);
    final billing = _dataMap(responses[1]);
    final currencies =
        _map(billing['by_currency']) ?? const <String, dynamic>{};
    var pendingMinor = 0;
    for (final value in currencies.values) {
      pendingMinor += _integer(_map(value)?['outstanding_minor']);
    }

    return MobileWorkspaceSnapshot(
      roleTitle: receptionist ? 'Recepción' : 'Administrador de clínica',
      headline: receptionist ? 'Recepción de hoy' : 'Operación de clínica',
      helper: receptionist
          ? 'Agenda, pacientes y caja priorizados para atención rápida.'
          : 'Resumen móvil de la operación; la administración avanzada permanece en web.',
      metrics: <MobileWorkspaceMetric>[
        MobileWorkspaceMetric(
          label: 'Citas hoy',
          value: _integer(summary['today_total']).toString(),
          icon: 'calendar',
        ),
        MobileWorkspaceMetric(
          label: 'Pendientes',
          value: _integer(summary['pending']).toString(),
          icon: 'pending',
        ),
        MobileWorkspaceMetric(
          label: 'Pacientes',
          value: _integer(metrics['patients_total']).toString(),
          icon: 'patients',
        ),
        MobileWorkspaceMetric(
          label: 'Por cobrar',
          value: _moneyMinor(pendingMinor),
          icon: 'billing',
        ),
      ],
      items: appointments
          .take(5)
          .map((item) {
            final patient = _map(item['patient']);
            final doctor = _map(item['doctor']);
            return MobileWorkspaceItem(
              title: _text(patient?['name']) ?? 'Paciente',
              subtitle: [
                _text(item['time']),
                _text(doctor?['name']),
              ].whereType<String>().join(' · '),
              status:
                  _text(item['status_label']) ??
                  _text(item['status']) ??
                  'Programada',
            );
          })
          .toList(growable: false),
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
      generatedAt: DateTime.now(),
    );
  }

  Map<String, dynamic> _dataMap(Map<String, dynamic> response) {
    return _map(response['data']) ?? const <String, dynamic>{};
  }

  Map<String, dynamic> _meta(Map<String, dynamic> response) {
    return _map(response['meta']) ?? const <String, dynamic>{};
  }

  List<Map<String, dynamic>> _items(Map<String, dynamic> response) {
    return _list(response['data']);
  }

  List<Map<String, dynamic>> _list(Object? value) {
    if (value is! List) return const <Map<String, dynamic>>[];
    return value
        .whereType<Map>()
        .map(
          (item) => item.map((key, value) => MapEntry(key.toString(), value)),
        )
        .toList(growable: false);
  }

  Map<String, dynamic>? _map(Object? value) {
    if (value is! Map) return null;
    return value.map((key, item) => MapEntry(key.toString(), item));
  }

  String? _text(Object? value) {
    return value is String && value.trim().isNotEmpty ? value.trim() : null;
  }

  int _integer(Object? value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    if (value is String) return int.tryParse(value) ?? 0;
    return 0;
  }

  String _moneyMinor(int value) {
    return (value / 100).toStringAsFixed(2);
  }

  String actorContextLabelFallback(String actorContext) {
    return switch (actorContext) {
      'clinic_admin' => 'Administrador de clínica',
      'receptionist' => 'Recepción',
      'doctor' => 'Médico',
      'patient' => 'Paciente',
      _ => 'Cuenta autenticada',
    };
  }

  Future<OtpChallenge> _requestChallenge(Map<String, dynamic> payload) async {
    final response = await _apiClient.postJson(
      '/api/v1/auth/otp/request',
      body: payload,
    );
    return OtpChallenge.fromJson(_data(response));
  }

  Future<Map<String, dynamic>> _devicePayload() async {
    return <String, dynamic>{
      'device_name': _deviceIdentity.deviceName,
      'device_id': await _deviceIdentity.id,
    };
  }

  Map<String, dynamic> _data(Map<String, dynamic> response) {
    final data = response['data'];
    if (data is! Map) {
      throw const FormatException('Missing response data.');
    }
    return data.map((key, value) => MapEntry(key.toString(), value));
  }
}

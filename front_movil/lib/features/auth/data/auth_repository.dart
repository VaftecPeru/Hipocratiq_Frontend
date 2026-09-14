// The public constructor keeps descriptive named parameters for call-site clarity.
// ignore_for_file: prefer_initializing_formals

import '../../../core/device/device_identity.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/storage/secure_store.dart';
import '../domain/auth_models.dart';
import '../domain/registration_models.dart';
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

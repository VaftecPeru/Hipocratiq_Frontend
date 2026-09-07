// The public constructor keeps descriptive named parameters for call-site clarity.
// ignore_for_file: prefer_initializing_formals

import '../../../core/device/device_identity.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/secure_store.dart';
import '../domain/auth_models.dart';
import '../domain/registration_models.dart';

class RegistrationRepository {
  RegistrationRepository({
    required ApiClient apiClient,
    required SecureStore secureStore,
    required DeviceIdentity deviceIdentity,
  }) : _apiClient = apiClient,
       _secureStore = secureStore,
       _deviceIdentity = deviceIdentity;

  final ApiClient _apiClient;
  final SecureStore _secureStore;
  final DeviceIdentity _deviceIdentity;

  Future<List<PlanOption>> fetchRegistrationPlans() async {
    final response = await _apiClient.getJson(
      '/api/v1/auth/register/clinic/plans',
    );
    final data = response['data'];
    if (data is! List) {
      throw const FormatException('Missing registration plans.');
    }

    return data
        .map((item) => PlanOption.fromJson(_map(item, 'plan')))
        .toList(growable: false);
  }

  Future<List<ClinicOption>> fetchDoctorClinics() async {
    final response = await _apiClient.getJson(
      '/api/v1/auth/register/doctor/clinics',
    );
    final data = response['data'];
    if (data is! List) {
      throw const FormatException('Missing doctor clinics.');
    }

    return data
        .map((item) => ClinicOption.fromJson(_map(item, 'clinic')))
        .toList(growable: false);
  }

  Future<RegistrationDraftSession> requestDoctorRegistration(
    DoctorRegistrationDraft draft,
  ) async {
    final device = await _devicePayload();
    final response = await _apiClient.postJson(
      '/api/v1/auth/register/doctor/draft',
      body: draft.toPayload(
        deviceName: device['device_name'] as String,
        deviceId: device['device_id'] as String,
      ),
    );
    return RegistrationDraftSession.fromJson(_data(response));
  }

  Future<RegistrationDraftSession> selectDoctorPlan({
    required String draftToken,
    required String plan,
    required String billingCycle,
  }) {
    return _selectDraftPlan(
      '/api/v1/auth/register/doctor/plan',
      draftToken: draftToken,
      plan: plan,
      billingCycle: billingCycle,
    );
  }

  Future<MobileAuthSession> verifyDoctorRegistration({
    required String draftToken,
    required String challengeId,
    required String code,
  }) {
    return _verifyDraft(
      '/api/v1/auth/register/doctor/verify-otp',
      draftToken: draftToken,
      challengeId: challengeId,
      code: code,
    );
  }

  Future<OtpChallenge> resendDoctorRegistration({required String draftToken}) {
    return _resendDraft('/api/v1/auth/register/doctor/resend-otp', draftToken);
  }

  Future<RegistrationDraftSession> requestClinicRegistration(
    ClinicRegistrationDraft draft,
  ) async {
    final device = await _devicePayload();
    final response = await _apiClient.postJson(
      '/api/v1/auth/register/clinic/draft',
      body: draft.toPayload(
        deviceName: device['device_name'] as String,
        deviceId: device['device_id'] as String,
      ),
    );
    return RegistrationDraftSession.fromJson(_data(response));
  }

  Future<RegistrationDraftSession> selectClinicPlan({
    required String draftToken,
    required String plan,
    required String billingCycle,
  }) {
    return _selectDraftPlan(
      '/api/v1/auth/register/clinic/plan',
      draftToken: draftToken,
      plan: plan,
      billingCycle: billingCycle,
    );
  }

  Future<MobileAuthSession> verifyClinicRegistration({
    required String draftToken,
    required String challengeId,
    required String code,
  }) {
    return _verifyDraft(
      '/api/v1/auth/register/clinic/verify-otp',
      draftToken: draftToken,
      challengeId: challengeId,
      code: code,
    );
  }

  Future<OtpChallenge> resendClinicRegistration({required String draftToken}) {
    return _resendDraft('/api/v1/auth/register/clinic/resend-otp', draftToken);
  }

  Future<ReceptionistInvitation> createReceptionistInvitation({
    required String name,
    required String email,
    required CountryCode country,
    required String phoneNumber,
  }) async {
    final accessToken = await _secureStore.readAccessToken();
    if (accessToken == null || accessToken.trim().isEmpty) {
      throw const FormatException('Missing authenticated session.');
    }

    final response = await _apiClient.postJson(
      '/api/v1/auth/clinic/receptionist-invitations',
      accessToken: accessToken,
      body: <String, dynamic>{
        'name': name.trim(),
        if (email.trim().isNotEmpty) 'email': email.trim().toLowerCase(),
        'phone_number': phoneNumber.replaceAll(RegExp(r'\D'), ''),
        'country_code': country.code,
      },
    );
    return ReceptionistInvitation.fromJson(_data(response));
  }

  Future<OtpChallenge> requestReceptionistActivation(
    String invitationToken,
  ) async {
    final response = await _apiClient.postJson(
      '/api/v1/auth/receptionist/activation/request',
      body: <String, dynamic>{
        'invitation_token': invitationToken,
        'client_type': 'mobile',
        ...await _devicePayload(),
      },
    );
    return OtpChallenge.fromJson(_data(response));
  }

  Future<MobileAuthSession> verifyReceptionistActivation({
    required String invitationToken,
    required String challengeId,
    required String code,
    required String password,
    required String passwordConfirmation,
  }) async {
    final response = await _apiClient.postJson(
      '/api/v1/auth/receptionist/activation/verify',
      body: <String, dynamic>{
        'invitation_token': invitationToken,
        'client_type': 'mobile',
        'challenge_id': challengeId,
        'code': code,
        'password': password,
        'password_confirmation': passwordConfirmation,
        ...await _devicePayload(),
      },
    );
    final session = MobileAuthSession.fromJson(_data(response));
    await _secureStore.writeAccessToken(session.accessToken);
    return session;
  }

  Future<RegistrationDraftSession> _selectDraftPlan(
    String path, {
    required String draftToken,
    required String plan,
    required String billingCycle,
  }) async {
    final response = await _apiClient.postJson(
      path,
      headers: <String, String>{'X-Registration-Token': draftToken},
      body: <String, dynamic>{'plan': plan, 'billing_cycle': billingCycle},
    );
    return RegistrationDraftSession.fromJson(_data(response));
  }

  Future<MobileAuthSession> _verifyDraft(
    String path, {
    required String draftToken,
    required String challengeId,
    required String code,
  }) async {
    final response = await _apiClient.postJson(
      path,
      headers: <String, String>{'X-Registration-Token': draftToken},
      body: <String, dynamic>{'challenge_id': challengeId, 'code': code},
    );
    final session = MobileAuthSession.fromJson(_data(response));
    await _secureStore.writeAccessToken(session.accessToken);
    return session;
  }

  Future<OtpChallenge> _resendDraft(String path, String draftToken) async {
    final response = await _apiClient.postJson(
      path,
      headers: <String, String>{'X-Registration-Token': draftToken},
    );
    return OtpChallenge.fromJson(_data(response));
  }

  Future<Map<String, dynamic>> _devicePayload() async {
    return <String, dynamic>{
      'device_name': _deviceIdentity.deviceName,
      'device_id': await _deviceIdentity.id,
    };
  }

  Map<String, dynamic> _map(Object? value, String label) {
    if (value is! Map) {
      throw FormatException('Invalid $label.');
    }
    return value.map((key, item) => MapEntry(key.toString(), item));
  }

  Map<String, dynamic> _data(Map<String, dynamic> response) {
    final data = response['data'];
    if (data is! Map) {
      throw const FormatException('Missing response data.');
    }
    return data.map((key, value) => MapEntry(key.toString(), value));
  }
}

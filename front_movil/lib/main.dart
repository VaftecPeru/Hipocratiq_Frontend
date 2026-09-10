import 'package:flutter/widgets.dart';

import 'app.dart';
import 'core/config/app_config.dart';
import 'core/device/device_identity.dart';
import 'core/network/api_client.dart';
import 'core/storage/secure_store.dart';
import 'features/auth/data/auth_repository.dart';
import 'features/auth/presentation/auth_controller.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final config = AppConfig.fromEnvironment();
  final secureStore = SecureStore();
  final deviceIdentity = DeviceIdentity(
    secureStore: secureStore,
    configuredDeviceName: config.deviceName,
  );
  final apiClient = ApiClient(
    baseUri: config.backendUri,
    deviceIdentity: deviceIdentity,
  );
  final authGateway = AuthRepository(
    apiClient: apiClient,
    secureStore: secureStore,
    deviceIdentity: deviceIdentity,
  );
  final authController = AuthController(authGateway);

  runApp(
    HipocratiqApp(
      config: config,
      authGateway: authGateway,
      authController: authController,
    ),
  );
}

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStore {
  SecureStore({FlutterSecureStorage? storage})
    : _storage = storage ?? FlutterSecureStorage();

  static const accessTokenKey = 'auth.access_token';
  static const deviceIdKey = 'device.identity';

  final FlutterSecureStorage _storage;

  Future<String?> readAccessToken() {
    return _storage.read(key: accessTokenKey);
  }

  Future<void> writeAccessToken(String token) {
    return _storage.write(key: accessTokenKey, value: token);
  }

  Future<void> deleteAccessToken() {
    return _storage.delete(key: accessTokenKey);
  }

  Future<String?> readDeviceId() {
    return _storage.read(key: deviceIdKey);
  }

  Future<void> writeDeviceId(String deviceId) {
    return _storage.write(key: deviceIdKey, value: deviceId);
  }
}

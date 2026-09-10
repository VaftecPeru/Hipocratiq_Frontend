// The public constructor keeps descriptive named parameters for call-site clarity.
// ignore_for_file: prefer_initializing_formals

import 'dart:convert';
import 'dart:math';

import '../storage/secure_store.dart';

class DeviceIdentity {
  DeviceIdentity({
    required SecureStore secureStore,
    required String configuredDeviceName,
  }) : _secureStore = secureStore,
       _configuredDeviceName = configuredDeviceName;

  final SecureStore _secureStore;
  final String _configuredDeviceName;
  Future<String>? _idFuture;

  String get deviceName {
    final value = _configuredDeviceName.trim();
    if (value.isEmpty) {
      return 'HipocratiQ Mobile';
    }

    return value.length > 100 ? value.substring(0, 100) : value;
  }

  Future<String> get id => _idFuture ??= _loadOrCreateId();

  Future<String> _loadOrCreateId() async {
    final existingId = await _secureStore.readDeviceId();
    if (existingId != null && existingId.trim().length >= 16) {
      return existingId.trim();
    }

    final random = Random.secure();
    final bytes = List<int>.generate(24, (_) => random.nextInt(256));
    final generatedId = base64UrlEncode(bytes).replaceAll('=', '');
    await _secureStore.writeDeviceId(generatedId);
    return generatedId;
  }
}

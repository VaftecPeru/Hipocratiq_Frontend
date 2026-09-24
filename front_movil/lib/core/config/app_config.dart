class AppConfig {
  const AppConfig({
    required this.backendUrl,
    required this.supportPortalUrl,
    this.deviceName = 'HIPOCRATIQ Mobile',
    this.isReleaseBuild = const bool.fromEnvironment('dart.vm.product'),
  });

  factory AppConfig.fromEnvironment() {
    return const AppConfig(
      backendUrl: String.fromEnvironment('BACKEND_URL'),
      supportPortalUrl: String.fromEnvironment('SUPPORT_PORTAL_URL'),
      deviceName: String.fromEnvironment(
        'DEVICE_NAME',
        defaultValue: 'HIPOCRATIQ Mobile',
      ),
    );
  }

  final String backendUrl;
  final String supportPortalUrl;
  final String deviceName;
  final bool isReleaseBuild;

  Uri? get backendUri {
    final uri = _parseHttpUri(backendUrl);
    if (uri == null || (isReleaseBuild && uri.scheme == 'http')) {
      return null;
    }

    return uri;
  }

  Uri? get secureSupportPortalUri {
    final uri = _parseHttpUri(supportPortalUrl);
    if (uri?.scheme != 'https') {
      return null;
    }

    return uri;
  }

  Uri? _parseHttpUri(String rawValue) {
    final value = rawValue.trim();
    if (value.isEmpty) {
      return null;
    }

    try {
      final uri = Uri.parse(value);
      if (!uri.hasAuthority || uri.host.isEmpty || uri.userInfo.isNotEmpty) {
        return null;
      }
      if (uri.scheme != 'http' && uri.scheme != 'https') {
        return null;
      }

      return Uri(
        scheme: uri.scheme,
        userInfo: uri.userInfo,
        host: uri.host,
        port: uri.port,
        path: uri.path,
        query: uri.query.isEmpty ? null : uri.query,
      );
    } on FormatException {
      return null;
    }
  }
}

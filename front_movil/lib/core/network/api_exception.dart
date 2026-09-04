class ApiException implements Exception {
  const ApiException({
    required this.message,
    this.statusCode,
    this.fieldErrors = const <String, List<String>>{},
    this.code,
    this.retryAfterSeconds,
  });

  final String message;
  final int? statusCode;
  final Map<String, List<String>> fieldErrors;
  final String? code;
  final int? retryAfterSeconds;

  bool get isUnauthorized => statusCode == 401;

  factory ApiException.fromResponse({
    required int statusCode,
    required Map<String, dynamic> payload,
    String? retryAfter,
  }) {
    final fieldErrors = _readFieldErrors(payload['errors']);
    final serverMessage =
        _firstError(fieldErrors) ?? _readString(payload['message']);
    final retryAfterSeconds = int.tryParse(retryAfter ?? '');

    return ApiException(
      message: _messageForStatus(statusCode, serverMessage, retryAfterSeconds),
      statusCode: statusCode,
      fieldErrors: fieldErrors,
      code: _readString(payload['code']),
      retryAfterSeconds: retryAfterSeconds,
    );
  }

  factory ApiException.network() {
    return const ApiException(
      message:
          'No pudimos conectar con el servicio. Revisa tu conexión e inténtalo nuevamente.',
    );
  }

  factory ApiException.configuration() {
    return const ApiException(
      message: 'Esta versión no tiene configurado el servicio de HipocratiQ.',
    );
  }

  factory ApiException.invalidResponse() {
    return const ApiException(
      message:
          'El servicio devolvió una respuesta no válida. Inténtalo nuevamente.',
    );
  }

  @override
  String toString() => message;
}

Map<String, List<String>> _readFieldErrors(Object? rawErrors) {
  if (rawErrors is! Map) {
    return const <String, List<String>>{};
  }

  final result = <String, List<String>>{};
  for (final entry in rawErrors.entries) {
    final key = entry.key.toString();
    final value = entry.value;
    if (value is List) {
      final messages = value.whereType<String>().toList(growable: false);
      if (messages.isNotEmpty) {
        result[key] = messages;
      }
    } else if (value is String && value.isNotEmpty) {
      result[key] = <String>[value];
    }
  }

  return result;
}

String? _firstError(Map<String, List<String>> fieldErrors) {
  for (final messages in fieldErrors.values) {
    if (messages.isNotEmpty) {
      return messages.first;
    }
  }

  return null;
}

String? _readString(Object? value) {
  return value is String && value.trim().isNotEmpty ? value.trim() : null;
}

String _messageForStatus(
  int statusCode,
  String? serverMessage,
  int? retryAfterSeconds,
) {
  if (statusCode == 429) {
    if (retryAfterSeconds != null && retryAfterSeconds > 0) {
      return 'Demasiados intentos. Inténtalo nuevamente en $retryAfterSeconds segundos.';
    }
    return 'Demasiados intentos. Espera un momento y vuelve a intentarlo.';
  }

  final isFrameworkMessage =
      serverMessage != null &&
      RegExp(
        r'^(The |Too Many|Unauthenticated|Forbidden|Not Found|Method Not Allowed|Server Error|This action)',
        caseSensitive: false,
      ).hasMatch(serverMessage);
  if (serverMessage != null && !isFrameworkMessage) {
    return serverMessage;
  }

  return switch (statusCode) {
    400 => 'La solicitud no es válida.',
    401 => 'Tus credenciales ya no son válidas. Vuelve a intentarlo.',
    403 => 'No tienes permisos para realizar esta acción.',
    404 => 'No encontramos el recurso solicitado.',
    422 => 'Revisa los datos ingresados e inténtalo nuevamente.',
    500 || 502 || 503 => 'El servicio no está disponible en este momento.',
    _ => 'No pudimos completar la solicitud. Inténtalo nuevamente.',
  };
}

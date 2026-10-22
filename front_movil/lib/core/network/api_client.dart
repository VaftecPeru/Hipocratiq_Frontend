// The public constructor keeps descriptive named parameters for call-site clarity.
// ignore_for_file: prefer_initializing_formals

import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../device/device_identity.dart';
import 'api_exception.dart';

class ApiClient {
  ApiClient({
    required Uri? baseUri,
    http.Client? client,
    DeviceIdentity? deviceIdentity,
    this.timeout = const Duration(seconds: 20),
  }) : _baseUri = baseUri,
       _deviceIdentity = deviceIdentity,
       _client = client ?? http.Client();

  final Uri? _baseUri;
  final http.Client _client;
  final DeviceIdentity? _deviceIdentity;
  final Duration timeout;

  Future<Map<String, dynamic>> getJson(
    String path, {
    String? accessToken,
    Map<String, String>? headers,
  }) {
    return _request(
      'GET',
      path,
      accessToken: accessToken,
      extraHeaders: headers,
    );
  }

  Future<Map<String, dynamic>> postJson(
    String path, {
    Map<String, dynamic>? body,
    String? accessToken,
    Map<String, String>? headers,
  }) {
    return _request(
      'POST',
      path,
      body: body,
      accessToken: accessToken,
      extraHeaders: headers,
    );
  }

  Future<Map<String, dynamic>> patchJson(
    String path, {
    Map<String, dynamic>? body,
    String? accessToken,
    Map<String, String>? headers,
  }) {
    return _request(
      'PATCH',
      path,
      body: body,
      accessToken: accessToken,
      extraHeaders: headers,
    );
  }

  Future<Map<String, dynamic>> _request(
    String method,
    String path, {
    Map<String, dynamic>? body,
    String? accessToken,
    Map<String, String>? extraHeaders,
  }) async {
    final baseUri = _baseUri;
    if (baseUri == null) {
      throw ApiException.configuration();
    }

    final headers = <String, String>{
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    final deviceIdentity = _deviceIdentity;
    if (deviceIdentity != null) {
      headers['X-Client-Type'] = 'mobile';
      headers['X-Device-Name'] = deviceIdentity.deviceName;
      headers['X-Device-ID'] = await deviceIdentity.id;
    }
    if (extraHeaders != null) {
      headers.addAll(extraHeaders);
    }
    if (accessToken != null && accessToken.isNotEmpty) {
      headers['Authorization'] = 'Bearer $accessToken';
    }

    final uri = _resolve(baseUri, path);
    late http.Response response;
    try {
      final encodedBody = body == null ? null : jsonEncode(body);
      response = switch (method) {
        'GET' => await _client.get(uri, headers: headers).timeout(timeout),
        'PATCH' => await _client
            .patch(uri, headers: headers, body: encodedBody)
            .timeout(timeout),
        'POST' => await _client
            .post(uri, headers: headers, body: encodedBody)
            .timeout(timeout),
        _ => throw UnsupportedError('Unsupported API method'),
      };
    } on TimeoutException {
      throw ApiException.network();
    } on http.ClientException {
      throw ApiException.network();
    }

    late final String bodyText;
    try {
      bodyText = response.body;
    } on FormatException {
      throw ApiException.invalidResponse();
    }
    final payload = _decodePayload(bodyText);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException.fromResponse(
        statusCode: response.statusCode,
        payload: payload,
        retryAfter: response.headers['retry-after'],
      );
    }

    if (bodyText.isEmpty) {
      return <String, dynamic>{};
    }
    if (payload.isEmpty && bodyText.isNotEmpty) {
      throw ApiException.invalidResponse();
    }

    return payload;
  }

  Uri _resolve(Uri baseUri, String path) {
    final basePath = baseUri.path.endsWith('/')
        ? baseUri.path.substring(0, baseUri.path.length - 1)
        : baseUri.path;
    final cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return baseUri.replace(
      path: '$basePath/$cleanPath',
      query: null,
      fragment: null,
    );
  }

  Map<String, dynamic> _decodePayload(String body) {
    if (body.isEmpty) {
      return <String, dynamic>{};
    }

    try {
      final decoded = jsonDecode(body);
      if (decoded is Map) {
        return decoded.map((key, value) => MapEntry(key.toString(), value));
      }
    } on FormatException {
      return <String, dynamic>{};
    }

    return <String, dynamic>{};
  }

  void close() => _client.close();
}

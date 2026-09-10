import 'package:flutter/foundation.dart';

import '../../../core/network/api_exception.dart';
import '../data/auth_repository.dart';
import '../domain/auth_models.dart';

sealed class AuthState {
  const AuthState();
}

final class AuthLoading extends AuthState {
  const AuthLoading();
}

final class AuthSignedOut extends AuthState {
  const AuthSignedOut();
}

final class AuthSignedIn extends AuthState {
  const AuthSignedIn(this.session);

  final AuthenticatedSession session;
}

final class AuthStartupFailure extends AuthState {
  const AuthStartupFailure(this.message);

  final String message;
}

class AuthController extends ChangeNotifier {
  AuthController(this._gateway);

  final AuthGateway _gateway;
  AuthState _state = const AuthLoading();
  bool _isLoggingOut = false;

  AuthState get state => _state;
  bool get isLoggingOut => _isLoggingOut;

  Future<void> initialize() async {
    _setState(const AuthLoading());
    try {
      final session = await _gateway.restoreSession();
      _setState(
        session == null ? const AuthSignedOut() : AuthSignedIn(session),
      );
    } on Object catch (error) {
      final message = error is ApiException
          ? error.message
          : 'No pudimos comprobar tu sesión. Inténtalo nuevamente.';
      _setState(AuthStartupFailure(message));
    }
  }

  Future<void> authenticate(MobileAuthSession session) async {
    _setState(AuthSignedIn(session.asAuthenticatedSession()));
  }

  Future<void> continueWithoutSession() async {
    await _gateway.clearLocalSession();
    _setState(const AuthSignedOut());
  }

  Future<void> logout({required bool allDevices}) async {
    if (_isLoggingOut) {
      return;
    }

    _isLoggingOut = true;
    notifyListeners();
    try {
      await _gateway.logout(allDevices: allDevices);
    } finally {
      _isLoggingOut = false;
      _setState(const AuthSignedOut());
    }
  }

  void _setState(AuthState nextState) {
    _state = nextState;
    notifyListeners();
  }
}

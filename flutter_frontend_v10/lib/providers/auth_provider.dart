import 'package:flutter/material.dart';
import '../core/models/user.dart';
import '../core/services/auth_service.dart';
import '../core/services/storage_service.dart';
import '../core/services/api_service.dart';
import 'package:go_router/go_router.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  String? _token;
  bool _isLoading = false;
  String? _error;

  User? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _token != null && _user != null;

  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();

    try {
      _token = await StorageService.getToken();
      _user = await StorageService.getUser();

      if (_token != null && _user != null) {
        // Verify token is still valid
        try {
          final currentUser = await AuthService.getCurrentUser();
          _user = currentUser;
          await StorageService.saveUser(currentUser);
        } catch (e) {
          // Token is invalid, clear stored data
          await logout();
        }
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? phoneNumber,
    int? graduationYear,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await AuthService.register(
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        graduationYear: graduationYear,
      );

      _token = response.token;
      _user = response.user;

      await StorageService.saveToken(_token!);
      await StorageService.saveUser(_user!);
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> login({
    required String email,
    required String password,
    BuildContext? context,
  }) async {
    _isLoading = true;
    _error = null;
    print('[AuthProvider] Starting login');
    notifyListeners();

    try {
      final response = await AuthService.login(
        email: email,
        password: password,
      );

      _token = response.token;
      _user = response.user;

      await StorageService.saveToken(_token!);
      await StorageService.saveUser(_user!);

      print(
          '[AuthProvider] Login success, token and user saved. Notifying listeners for navigation.');
      // Reset logout flag to allow future logout calls
      ApiService.resetLogoutFlag();
      // Immediately notify listeners so GoRouter can navigate to /home
      notifyListeners();

      // In the background, fetch latest user info from /api/auth/me
      Future(() async {
        print('[AuthProvider] Background: fetching /api/auth/me');
        try {
          final currentUser = await AuthService.getCurrentUser();
          _user = currentUser;
          await StorageService.saveUser(_user!);
          print(
              '[AuthProvider] Background: /api/auth/me success, user updated.');
          notifyListeners();
        } catch (e) {
          print('[AuthProvider] Background: /api/auth/me failed: $e');
          // Only log out if it's a 401 AND we still have a token (to prevent infinite loops)
          if (e.toString().contains('401') && _token != null) {
            print('[AuthProvider] Background: /api/auth/me 401, logging out.');
            await logout();
          }
        }
      });
    } catch (e) {
      _error = e.toString();
      print('[AuthProvider] Login error: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> verifyEmail({
    required String email,
    required String code,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await AuthService.verifyEmail(email: email, code: code);

      // Update user's email verification status
      if (_user != null) {
        _user = _user!.copyWith(isEmailVerified: true);
        await StorageService.saveUser(_user!);
      }
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> forgotPassword({
    required String email,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await AuthService.forgotPassword(email: email);
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    print('[AuthProvider] Logout called');
    _user = null;
    _token = null;
    _error = null;

    await StorageService.clearToken();
    await StorageService.clearUser();

    print('[AuthProvider] Logout completed, notifying listeners');
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void updateUser(User user) {
    _user = user;
    StorageService.saveUser(user);
    notifyListeners();
  }
}

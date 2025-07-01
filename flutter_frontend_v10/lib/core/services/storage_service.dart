import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../constants/app_constants.dart';
import '../models/user.dart';

class StorageService {
  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  static Future<void> saveToken(String token) async {
    await init();
    print('[StorageService] Saving token: $token');
    await _prefs!.setString(AppConstants.tokenKey, token);
  }

  static Future<String?> getToken() async {
    await init();
    final token = _prefs!.getString(AppConstants.tokenKey);
    print('[StorageService] Loaded token: $token');
    return token;
  }

  static Future<void> clearToken() async {
    await init();
    print('[StorageService] Clearing token');
    await _prefs!.remove(AppConstants.tokenKey);
  }

  static Future<void> saveUser(User user) async {
    await init();
    await _prefs!.setString(AppConstants.userKey, jsonEncode(user.toJson()));
  }

  static Future<User?> getUser() async {
    await init();
    final userJson = _prefs!.getString(AppConstants.userKey);
    if (userJson != null) {
      return User.fromJson(jsonDecode(userJson));
    }
    return null;
  }

  static Future<void> clearUser() async {
    await init();
    await _prefs!.remove(AppConstants.userKey);
  }

  static Future<void> setBiometricEnabled(bool enabled) async {
    await init();
    await _prefs!.setBool(AppConstants.biometricKey, enabled);
  }

  static Future<bool> isBiometricEnabled() async {
    await init();
    return _prefs!.getBool(AppConstants.biometricKey) ?? false;
  }

  static Future<void> clearAll() async {
    await init();
    await _prefs!.clear();
  }
}

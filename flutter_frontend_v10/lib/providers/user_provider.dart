import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../core/models/user.dart';
import '../core/services/api_service.dart';
import '../core/constants/api_constants.dart';

class UserProvider with ChangeNotifier {
  User? _user;
  bool _isLoading = false;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> updateProfile({
    required String firstName,
    required String lastName,
    String? bio,
    String? location,
    String? profession,
    String? company,
    int? graduationYear,
    String? phoneNumber,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.put(
        ApiConstants.userProfile,
        data: {
          'firstName': firstName,
          'lastName': lastName,
          'bio': bio,
          'location': location,
          'profession': profession,
          'company': company,
          'graduationYear': graduationYear,
          'phoneNumber': phoneNumber,
        },
      );

      _user = User.fromJson(response.data['data']);
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> uploadProfilePhoto(String imagePath) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final formData = FormData.fromMap({
        'photo': await MultipartFile.fromFile(imagePath),
      });

      final response = await ApiService.post(
        ApiConstants.userPhoto,
        data: formData,
      );

      _user = _user?.copyWith(
        profilePhoto: response.data['data']['profilePhoto'],
      );
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updatePrivacySettings({
    required bool showEmail,
    required bool showPhone,
    required bool showLocation,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await ApiService.put(
        ApiConstants.userPrivacy,
        data: {
          'showEmail': showEmail,
          'showPhone': showPhone,
          'showLocation': showLocation,
        },
      );
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await ApiService.put(
        ApiConstants.userPassword,
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void setUser(User user) {
    _user = user;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}

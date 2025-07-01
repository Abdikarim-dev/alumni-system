import 'package:dio/dio.dart';
import '../constants/api_constants.dart';
import '../models/user.dart';
import 'api_service.dart';

class AuthService {
  static Future<AuthResponse> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? phoneNumber,
    int? graduationYear,
  }) async {
    try {
      final response = await ApiService.post(
        ApiConstants.register,
        data: {
          'email': email,
          'password': password,
          'firstName': firstName,
          'lastName': lastName,
          'phoneNumber': phoneNumber,
          'graduationYear': graduationYear,
        },
      );

      return AuthResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  static Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await ApiService.post(
        ApiConstants.login,
        data: {
          'identifier': email,
          'password': password,
        },
      );

      return AuthResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  static Future<void> verifyEmail({
    required String email,
    required String code,
  }) async {
    try {
      await ApiService.post(
        ApiConstants.verifyEmail,
        data: {
          'email': email,
          'code': code,
        },
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  static Future<void> forgotPassword({
    required String email,
  }) async {
    try {
      await ApiService.post(
        ApiConstants.forgotPassword,
        data: {
          'email': email,
        },
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  static Future<User> getCurrentUser() async {
    try {
      final response = await ApiService.get(ApiConstants.me);
      return User.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  static String _handleError(DioException e) {
    if (e.response != null) {
      final data = e.response!.data;
      if (data is Map<String, dynamic> && data.containsKey('message')) {
        return data['message'];
      }
    }
    return 'Network error occurred';
  }
}

class AuthResponse {
  final String token;
  final User user;

  AuthResponse({
    required this.token,
    required this.user,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token'],
      user: User.fromJson(json['user']),
    );
  }
}

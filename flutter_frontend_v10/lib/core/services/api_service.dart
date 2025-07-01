import 'package:dio/dio.dart';
import '../constants/api_constants.dart';
import 'storage_service.dart';
import '../../providers/auth_provider.dart';
import 'package:flutter/widgets.dart';

class ApiService {
  static final Dio _dio = Dio(BaseOptions(
    baseUrl: ApiConstants.baseUrl,
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
    headers: {
      'Content-Type': 'application/json',
    },
  ));

  static Dio get dio => _dio;

  static VoidCallback? onLogout;
  static bool _isLoggingOut = false;

  static void setupInterceptors() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await StorageService.getToken();
        print('[Dio Interceptor] Using token: $token');
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        print('[Dio Interceptor] Error detected!');
        print('[Dio Interceptor] Status code: ${error.response?.statusCode}');
        print('[Dio Interceptor] Error type: ${error.type}');
        print('[Dio Interceptor] Error message: ${error.message}');
        print('[Dio Interceptor] Response data: ${error.response?.data}');

        if (error.response?.statusCode == 401 && !_isLoggingOut) {
          print(
              '[Dio Interceptor] 401 detected, clearing token and logging out.');
          _isLoggingOut = true;
          await StorageService.clearToken();
          if (onLogout != null) {
            print('[Dio Interceptor] Calling onLogout callback');
            onLogout!();
          }
        } else if (error.response?.statusCode == 401) {
          print(
              '[Dio Interceptor] 401 detected but already logging out, skipping');
        } else {
          print('[Dio Interceptor] Non-401 error, not clearing tokens');
        }
        handler.next(error);
      },
    ));

    // Add logging interceptor in debug mode
    _dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
      logPrint: (obj) => print(obj),
    ));
  }

  static Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.get(path, queryParameters: queryParameters, options: options);
  }

  static Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.post(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  static Future<Response> put(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.put(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  static Future<Response> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.patch(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  static Future<Response> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.delete(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  static void resetLogoutFlag() {
    _isLoggingOut = false;
  }
}

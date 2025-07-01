import 'package:flutter/material.dart';
import '../core/models/user.dart';
import '../core/services/api_service.dart';
import '../core/constants/api_constants.dart';

class AlumniProvider with ChangeNotifier {
  List<User> _alumni = [];
  bool _isLoading = false;
  String? _error;
  int _currentPage = 1;
  bool _hasMore = true;

  List<User> get alumni => _alumni;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasMore => _hasMore;

  Future<void> loadAlumni({
    bool refresh = false,
    String? search,
    String? location,
    int? graduationYear,
    String? profession,
  }) async {
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      _alumni.clear();
    }

    if (_isLoading || !_hasMore) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final queryParams = <String, dynamic>{
        'page': _currentPage,
        'limit': 20,
      };

      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }
      if (location != null && location.isNotEmpty) {
        queryParams['location'] = location;
      }
      if (graduationYear != null) {
        queryParams['graduationYear'] = graduationYear;
      }
      if (profession != null && profession.isNotEmpty) {
        queryParams['profession'] = profession;
      }

      final response = await ApiService.get(
        ApiConstants.alumni,
        queryParameters: queryParams,
      );

      final List<dynamic> data = response.data['data'];
      final List<User> newAlumni = data.map((json) => User.fromJson(json)).toList();

      if (refresh) {
        _alumni = newAlumni;
      } else {
        _alumni.addAll(newAlumni);
      }

      _hasMore = newAlumni.length == 20;
      _currentPage++;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<User?> getAlumniById(String id) async {
    try {
      final response = await ApiService.get('${ApiConstants.alumni}/$id');
      return User.fromJson(response.data['data']);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}

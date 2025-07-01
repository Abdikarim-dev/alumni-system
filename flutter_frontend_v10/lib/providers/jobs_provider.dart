import 'package:flutter/material.dart';
import '../core/models/job.dart';
import '../core/services/api_service.dart';
import '../core/constants/api_constants.dart';

class JobsProvider with ChangeNotifier {
  List<Job> _jobs = [];
  List<JobApplication> _myApplications = [];
  bool _isLoading = false;
  String? _error;
  int _currentPage = 1;
  bool _hasMore = true;

  List<Job> get jobs => _jobs;
  List<JobApplication> get myApplications => _myApplications;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasMore => _hasMore;

  Future<void> loadJobs({
    bool refresh = false,
    String? search,
    String? location,
    String? type,
    String? category,
  }) async {
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      _jobs.clear();
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
      if (type != null && type.isNotEmpty) {
        queryParams['type'] = type;
      }
      if (category != null && category.isNotEmpty) {
        queryParams['category'] = category;
      }

      final response = await ApiService.get(
        ApiConstants.jobs,
        queryParameters: queryParams,
      );

      final List<dynamic> data = response.data['data'];
      final List<Job> newJobs = data.map((json) => Job.fromJson(json)).toList();

      if (refresh) {
        _jobs = newJobs;
      } else {
        _jobs.addAll(newJobs);
      }

      _hasMore = newJobs.length == 20;
      _currentPage++;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Job?> getJobById(String id) async {
    try {
      final response = await ApiService.get('${ApiConstants.jobs}/$id');
      return Job.fromJson(response.data['data']);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  Future<void> applyToJob({
    required String jobId,
    String? message,
    String? resumeUrl,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await ApiService.post(
        '${ApiConstants.jobs}/$jobId/apply',
        data: {
          'message': message,
          'resumeUrl': resumeUrl,
        },
      );

      await loadMyApplications();
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadMyApplications() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get('${ApiConstants.jobs}/my-applications');
      final List<dynamic> data = response.data['data'];
      _myApplications = data.map((json) => JobApplication.fromJson(json)).toList();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}

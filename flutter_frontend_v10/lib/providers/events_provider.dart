import 'package:flutter/material.dart';
import '../core/models/event.dart';
import '../core/services/api_service.dart';
import '../core/constants/api_constants.dart';

class EventsProvider with ChangeNotifier {
  List<Event> _events = [];
  List<EventRsvp> _myRsvps = [];
  bool _isLoading = false;
  String? _error;
  int _currentPage = 1;
  bool _hasMore = true;

  List<Event> get events => _events;
  List<EventRsvp> get myRsvps => _myRsvps;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasMore => _hasMore;

  Future<void> loadEvents({
    bool refresh = false,
    String? category,
    String? status,
  }) async {
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      _events.clear();
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

      if (category != null && category.isNotEmpty) {
        queryParams['category'] = category;
      }
      if (status != null && status.isNotEmpty) {
        queryParams['status'] = status;
      }

      final response = await ApiService.get(
        ApiConstants.events,
        queryParameters: queryParams,
      );

      final List<dynamic> data = response.data['data'];
      final List<Event> newEvents = data.map((json) => Event.fromJson(json)).toList();

      if (refresh) {
        _events = newEvents;
      } else {
        _events.addAll(newEvents);
      }

      _hasMore = newEvents.length == 20;
      _currentPage++;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Event?> getEventById(String id) async {
    try {
      final response = await ApiService.get('${ApiConstants.events}/$id');
      return Event.fromJson(response.data['data']);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  Future<void> rsvpToEvent(String eventId, String status, {String? message}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await ApiService.post(
        '${ApiConstants.events}/$eventId/rsvp',
        data: {
          'status': status,
          'message': message,
        },
      );

      // Reload events to update attendance count
      await loadEvents(refresh: true);
      await loadMyRsvps();
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadMyRsvps() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get(ApiConstants.myRsvps);
      final List<dynamic> data = response.data['data'];
      _myRsvps = data.map((json) => EventRsvp.fromJson(json)).toList();
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

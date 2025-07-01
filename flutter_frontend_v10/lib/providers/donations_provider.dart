import 'package:flutter/material.dart';
import '../core/models/donation.dart';
import '../core/services/api_service.dart';
import '../core/constants/api_constants.dart';

class DonationsProvider with ChangeNotifier {
  List<DonationCampaign> _campaigns = [];
  List<Donation> _myDonations = [];
  bool _isLoading = false;
  String? _error;
  int _currentPage = 1;
  bool _hasMore = true;

  List<DonationCampaign> get campaigns => _campaigns;
  List<Donation> get myDonations => _myDonations;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasMore => _hasMore;

  Future<void> loadCampaigns({
    bool refresh = false,
    String? category,
    bool? isActive,
  }) async {
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      _campaigns.clear();
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
      if (isActive != null) {
        queryParams['isActive'] = isActive;
      }

      final response = await ApiService.get(
        ApiConstants.donations,
        queryParameters: queryParams,
      );

      final List<dynamic> data = response.data['data'];
      final List<DonationCampaign> newCampaigns = 
          data.map((json) => DonationCampaign.fromJson(json)).toList();

      if (refresh) {
        _campaigns = newCampaigns;
      } else {
        _campaigns.addAll(newCampaigns);
      }

      _hasMore = newCampaigns.length == 20;
      _currentPage++;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<DonationCampaign?> getCampaignById(String id) async {
    try {
      final response = await ApiService.get('${ApiConstants.donations}/$id');
      return DonationCampaign.fromJson(response.data['data']);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  Future<void> makeDonation({
    required String campaignId,
    required double amount,
    required String paymentMethod,
    String? message,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await ApiService.post(
        '${ApiConstants.donations}/$campaignId/donate',
        data: {
          'amount': amount,
          'paymentMethod': paymentMethod,
          'message': message,
        },
      );

      // Reload campaigns to update amounts
      await loadCampaigns(refresh: true);
      await loadMyDonations();
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadMyDonations() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get(ApiConstants.myDonations);
      final List<dynamic> data = response.data['data'];
      _myDonations = data.map((json) => Donation.fromJson(json)).toList();
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

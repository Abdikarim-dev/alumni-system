import 'package:flutter/material.dart';
import '../core/models/transaction.dart';
import '../core/services/api_service.dart';
import '../core/constants/api_constants.dart';

class TransactionsProvider with ChangeNotifier {
  List<Transaction> _transactions = [];
  bool _isLoading = false;
  String? _error;
  int _currentPage = 1;
  bool _hasMore = true;

  List<Transaction> get transactions => _transactions;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasMore => _hasMore;

  Future<void> loadTransactions({
    bool refresh = false,
    String? type,
    String? status,
  }) async {
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      _transactions.clear();
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

      if (type != null && type.isNotEmpty) {
        queryParams['type'] = type;
      }
      if (status != null && status.isNotEmpty) {
        queryParams['status'] = status;
      }

      final response = await ApiService.get(
        ApiConstants.myTransactions,
        queryParameters: queryParams,
      );

      final List<dynamic> data = response.data['data'];
      final List<Transaction> newTransactions = 
          data.map((json) => Transaction.fromJson(json)).toList();

      if (refresh) {
        _transactions = newTransactions;
      } else {
        _transactions.addAll(newTransactions);
      }

      _hasMore = newTransactions.length == 20;
      _currentPage++;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Transaction?> getTransactionById(String id) async {
    try {
      final response = await ApiService.get('${ApiConstants.myTransactions}/$id');
      return Transaction.fromJson(response.data['data']);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  double getTotalAmount({String? type, String? status}) {
    return _transactions
        .where((t) => 
            (type == null || t.type == type) &&
            (status == null || t.status == status))
        .fold(0.0, (sum, t) => sum + t.amount);
  }

  List<Transaction> getTransactionsByType(String type) {
    return _transactions.where((t) => t.type == type).toList();
  }

  List<Transaction> getTransactionsByStatus(String status) {
    return _transactions.where((t) => t.status == status).toList();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}

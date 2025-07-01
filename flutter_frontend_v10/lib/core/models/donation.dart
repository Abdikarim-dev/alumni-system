class DonationCampaign {
  final String id;
  final String title;
  final String description;
  final String? imageUrl;
  final double targetAmount;
  final double currentAmount;
  final String category;
  final DateTime startDate;
  final DateTime endDate;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  DonationCampaign({
    required this.id,
    required this.title,
    required this.description,
    this.imageUrl,
    required this.targetAmount,
    required this.currentAmount,
    required this.category,
    required this.startDate,
    required this.endDate,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory DonationCampaign.fromJson(Map<String, dynamic> json) {
    return DonationCampaign(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      imageUrl: json['imageUrl'],
      targetAmount: json['targetAmount'].toDouble(),
      currentAmount: json['currentAmount'].toDouble(),
      category: json['category'],
      startDate: DateTime.parse(json['startDate']),
      endDate: DateTime.parse(json['endDate']),
      isActive: json['isActive'] ?? true,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  double get progressPercentage => (currentAmount / targetAmount * 100).clamp(0, 100);
  double get remainingAmount => (targetAmount - currentAmount).clamp(0, targetAmount);
  bool get isCompleted => currentAmount >= targetAmount;
  bool get isExpired => endDate.isBefore(DateTime.now());
}

class Donation {
  final String id;
  final String campaignId;
  final String userId;
  final double amount;
  final String paymentMethod;
  final String status;
  final String? message;
  final String? transactionId;
  final DateTime createdAt;
  final DonationCampaign? campaign;

  Donation({
    required this.id,
    required this.campaignId,
    required this.userId,
    required this.amount,
    required this.paymentMethod,
    required this.status,
    this.message,
    this.transactionId,
    required this.createdAt,
    this.campaign,
  });

  factory Donation.fromJson(Map<String, dynamic> json) {
    return Donation(
      id: json['id'],
      campaignId: json['campaignId'],
      userId: json['userId'],
      amount: json['amount'].toDouble(),
      paymentMethod: json['paymentMethod'],
      status: json['status'],
      message: json['message'],
      transactionId: json['transactionId'],
      createdAt: DateTime.parse(json['createdAt']),
      campaign: json['campaign'] != null ? DonationCampaign.fromJson(json['campaign']) : null,
    );
  }
}

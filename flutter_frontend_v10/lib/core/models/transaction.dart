class Transaction {
  final String id;
  final String userId;
  final String type; // donation, event_ticket, membership, merchandise
  final double amount;
  final String status; // pending, completed, failed, cancelled
  final String? description;
  final String? referenceId;
  final String? paymentMethod;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  final DateTime updatedAt;

  Transaction({
    required this.id,
    required this.userId,
    required this.type,
    required this.amount,
    required this.status,
    this.description,
    this.referenceId,
    this.paymentMethod,
    this.metadata,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'],
      userId: json['userId'],
      type: json['type'],
      amount: json['amount'].toDouble(),
      status: json['status'],
      description: json['description'],
      referenceId: json['referenceId'],
      paymentMethod: json['paymentMethod'],
      metadata: json['metadata'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'type': type,
      'amount': amount,
      'status': status,
      'description': description,
      'referenceId': referenceId,
      'paymentMethod': paymentMethod,
      'metadata': metadata,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  bool get isCompleted => status == 'completed';
  bool get isPending => status == 'pending';
  bool get isFailed => status == 'failed';
  bool get isCancelled => status == 'cancelled';
}

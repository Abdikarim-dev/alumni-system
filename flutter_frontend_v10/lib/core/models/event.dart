class Event {
  final String id;
  final String title;
  final String description;
  final String? imageUrl;
  final DateTime startDate;
  final DateTime endDate;
  final String location;
  final String category;
  final String status;
  final int maxAttendees;
  final int currentAttendees;
  final bool requiresRsvp;
  final DateTime createdAt;
  final DateTime updatedAt;

  Event({
    required this.id,
    required this.title,
    required this.description,
    this.imageUrl,
    required this.startDate,
    required this.endDate,
    required this.location,
    required this.category,
    required this.status,
    required this.maxAttendees,
    required this.currentAttendees,
    required this.requiresRsvp,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      imageUrl: json['imageUrl'],
      startDate: DateTime.parse(json['startDate']),
      endDate: DateTime.parse(json['endDate']),
      location: json['location'],
      category: json['category'],
      status: json['status'],
      maxAttendees: json['maxAttendees'],
      currentAttendees: json['currentAttendees'],
      requiresRsvp: json['requiresRsvp'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'imageUrl': imageUrl,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'location': location,
      'category': category,
      'status': status,
      'maxAttendees': maxAttendees,
      'currentAttendees': currentAttendees,
      'requiresRsvp': requiresRsvp,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  bool get isUpcoming => startDate.isAfter(DateTime.now());
  bool get isOngoing => DateTime.now().isAfter(startDate) && DateTime.now().isBefore(endDate);
  bool get isPast => endDate.isBefore(DateTime.now());
  bool get isFull => currentAttendees >= maxAttendees;
}

class EventRsvp {
  final String id;
  final String eventId;
  final String userId;
  final String status; // yes, no, maybe
  final String? message;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Event? event;

  EventRsvp({
    required this.id,
    required this.eventId,
    required this.userId,
    required this.status,
    this.message,
    required this.createdAt,
    required this.updatedAt,
    this.event,
  });

  factory EventRsvp.fromJson(Map<String, dynamic> json) {
    return EventRsvp(
      id: json['id'],
      eventId: json['eventId'],
      userId: json['userId'],
      status: json['status'],
      message: json['message'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      event: json['event'] != null ? Event.fromJson(json['event']) : null,
    );
  }
}

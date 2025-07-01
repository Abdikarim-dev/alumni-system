class Announcement {
  final String id;
  final String title;
  final String content;
  final String category; // news, announcement, update
  final String? imageUrl;
  final String authorId;
  final String? authorName;
  final bool isPinned;
  final DateTime publishedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  Announcement({
    required this.id,
    required this.title,
    required this.content,
    required this.category,
    this.imageUrl,
    required this.authorId,
    this.authorName,
    required this.isPinned,
    required this.publishedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Announcement.fromJson(Map<String, dynamic> json) {
    return Announcement(
      id: json['id'],
      title: json['title'],
      content: json['content'],
      category: json['category'],
      imageUrl: json['imageUrl'],
      authorId: json['authorId'],
      authorName: json['authorName'],
      isPinned: json['isPinned'] ?? false,
      publishedAt: DateTime.parse(json['publishedAt']),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(publishedAt);
    
    if (difference.inDays > 0) {
      return '${difference.inDays} days ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hours ago';
    } else {
      return '${difference.inMinutes} minutes ago';
    }
  }
}

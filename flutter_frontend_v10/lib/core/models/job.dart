class Job {
  final String id;
  final String title;
  final String description;
  final String company;
  final String location;
  final String type; // full-time, part-time, contract, internship
  final String category;
  final String? salary;
  final List<String> requirements;
  final String? applicationUrl;
  final String? contactEmail;
  final DateTime postedDate;
  final DateTime? deadline;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  Job({
    required this.id,
    required this.title,
    required this.description,
    required this.company,
    required this.location,
    required this.type,
    required this.category,
    this.salary,
    required this.requirements,
    this.applicationUrl,
    this.contactEmail,
    required this.postedDate,
    this.deadline,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Job.fromJson(Map<String, dynamic> json) {
    return Job(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      company: json['company'],
      location: json['location'],
      type: json['type'],
      category: json['category'],
      salary: json['salary'],
      requirements: List<String>.from(json['requirements'] ?? []),
      applicationUrl: json['applicationUrl'],
      contactEmail: json['contactEmail'],
      postedDate: DateTime.parse(json['postedDate']),
      deadline: json['deadline'] != null ? DateTime.parse(json['deadline']) : null,
      isActive: json['isActive'] ?? true,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  bool get isExpired => deadline != null && deadline!.isBefore(DateTime.now());
  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(postedDate);
    
    if (difference.inDays > 0) {
      return '${difference.inDays} days ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hours ago';
    } else {
      return '${difference.inMinutes} minutes ago';
    }
  }
}

class JobApplication {
  final String id;
  final String jobId;
  final String userId;
  final String? message;
  final String? resumeUrl;
  final String status;
  final DateTime createdAt;
  final Job? job;

  JobApplication({
    required this.id,
    required this.jobId,
    required this.userId,
    this.message,
    this.resumeUrl,
    required this.status,
    required this.createdAt,
    this.job,
  });

  factory JobApplication.fromJson(Map<String, dynamic> json) {
    return JobApplication(
      id: json['id'],
      jobId: json['jobId'],
      userId: json['userId'],
      message: json['message'],
      resumeUrl: json['resumeUrl'],
      status: json['status'],
      createdAt: DateTime.parse(json['createdAt']),
      job: json['job'] != null ? Job.fromJson(json['job']) : null,
    );
  }
}

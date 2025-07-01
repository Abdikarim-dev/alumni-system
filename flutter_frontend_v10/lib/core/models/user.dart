class User {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String? profilePhoto;
  final String? bio;
  final String? location;
  final String? profession;
  final String? company;
  final int? graduationYear;
  final String? phoneNumber;
  final bool isEmailVerified;
  final bool isPhoneVerified;
  final String? role;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  User({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    this.profilePhoto,
    this.bio,
    this.location,
    this.profession,
    this.company,
    this.graduationYear,
    this.phoneNumber,
    required this.isEmailVerified,
    required this.isPhoneVerified,
    this.role,
    this.createdAt,
    this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      profilePhoto: json['profilePhoto'],
      bio: json['bio'],
      location: json['location'],
      profession: json['profession'],
      company: json['company'],
      graduationYear: json['graduationYear'],
      phoneNumber: json['phoneNumber'],
      isEmailVerified: json['isEmailVerified'] ?? false,
      isPhoneVerified: json['isPhoneVerified'] ?? false,
      role: json['role'],
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'])
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'profilePhoto': profilePhoto,
      'bio': bio,
      'location': location,
      'profession': profession,
      'company': company,
      'graduationYear': graduationYear,
      'phoneNumber': phoneNumber,
      'isEmailVerified': isEmailVerified,
      'isPhoneVerified': isPhoneVerified,
      'role': role,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  String get fullName => '$firstName $lastName';

  User copyWith({
    String? id,
    String? email,
    String? firstName,
    String? lastName,
    String? profilePhoto,
    String? bio,
    String? location,
    String? profession,
    String? company,
    int? graduationYear,
    String? phoneNumber,
    bool? isEmailVerified,
    bool? isPhoneVerified,
    String? role,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      profilePhoto: profilePhoto ?? this.profilePhoto,
      bio: bio ?? this.bio,
      location: location ?? this.location,
      profession: profession ?? this.profession,
      company: company ?? this.company,
      graduationYear: graduationYear ?? this.graduationYear,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      isEmailVerified: isEmailVerified ?? this.isEmailVerified,
      isPhoneVerified: isPhoneVerified ?? this.isPhoneVerified,
      role: role ?? this.role,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

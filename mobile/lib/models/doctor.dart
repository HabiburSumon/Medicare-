class Doctor {
  final String id;
  final String name;
  final String email;
  final String? avatar;
  final String specialization;
  final int experience;
  final String qualification;
  final String? bio;
  final double consultationFee;
  final double rating;
  final int totalReviews;
  final bool isAvailable;
  final List<String> availableDays;

  Doctor({
    required this.id,
    required this.name,
    this.email = '',
    this.avatar,
    required this.specialization,
    required this.experience,
    this.qualification = '',
    this.bio,
    required this.consultationFee,
    required this.rating,
    required this.totalReviews,
    this.isAvailable = true,
    this.availableDays = const [],
  });

  factory Doctor.fromJson(Map<String, dynamic> json) {
    String name = '';
    String email = '';
    String? avatar;
    if (json['user'] is Map) {
      name = json['user']['name'] ?? '';
      email = json['user']['email'] ?? '';
      avatar = json['user']['avatar'];
    }
    return Doctor(
      id: json['_id'] ?? '',
      name: name,
      email: email,
      avatar: avatar,
      specialization: json['specialization'] ?? '',
      experience: json['experience'] ?? 0,
      qualification: json['qualification'] ?? '',
      bio: json['bio'],
      consultationFee: (json['consultationFee'] ?? 0).toDouble(),
      rating: (json['rating'] ?? 0).toDouble(),
      totalReviews: json['totalReviews'] ?? 0,
      isAvailable: json['isAvailable'] ?? true,
      availableDays: List<String>.from(json['availableDays'] ?? []),
    );
  }
}
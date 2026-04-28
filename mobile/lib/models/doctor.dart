class Doctor {
  final String id;
  final String name;
  final String specialization;
  final double rating;
  final int reviews;
  final int experience;
  final double fee;
  final String? image;
  final String? bio;
  final bool available;
  Doctor({required this.id, required this.name, required this.specialization, this.rating = 0, this.reviews = 0, this.experience = 0, this.fee = 0, this.image, this.bio, this.available = true});
  factory Doctor.fromJson(Map<String, dynamic> json) => Doctor(
    id: json['user']?['_id'] ?? json['_id'] ?? '',
    name: json['user']?['name'] ?? json['name'] ?? 'Doctor',
    specialization: json['specialization'] ?? 'General',
    rating: (json['averageRating'] ?? json['rating'] ?? 0).toDouble(),
    reviews: json['totalReviews'] ?? json['reviews'] ?? 0,
    experience: json['experience'] ?? 0,
    fee: (json['consultationFee'] ?? json['fee'] ?? 0).toDouble(),
    image: json['user']?['avatar'] ?? json['image'],
    bio: json['bio'] ?? '',
    available: json['isAvailable'] ?? json['available'] ?? true,
  );
}
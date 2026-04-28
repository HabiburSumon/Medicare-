class Medicine {
  final String id;
  final String name;
  final String genericName;
  final double price;
  final double? oldPrice;
  final String category;
  final double rating;
  final bool inStock;
  final String? image;
  Medicine({required this.id, required this.name, required this.genericName, required this.price, this.oldPrice, required this.category, this.rating = 0, this.inStock = true, this.image});
  factory Medicine.fromJson(Map<String, dynamic> json) => Medicine(
    id: json['_id'] ?? '', name: json['name'] ?? '', genericName: json['genericName'] ?? '',
    price: (json['price'] ?? 0).toDouble(), oldPrice: json['oldPrice']?.toDouble(),
    category: json['category'] ?? 'General', rating: (json['rating'] ?? 0).toDouble(),
    inStock: json['inStock'] ?? true, image: json['image'],
  );
}

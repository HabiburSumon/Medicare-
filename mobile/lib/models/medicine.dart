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

  static const List<String> _assetImages = [
    'assets/medicines/medicine_tablets.jpg',
    'assets/medicines/medicine_pills.jpg',
    'assets/medicines/medicine_capsules.jpg',
    'assets/medicines/medicine_syrup.jpg',
    'assets/medicines/medicine_injection.jpg',
    'assets/medicines/medicine_vitamins.jpg',
  ];

  Medicine({required this.id, required this.name, required this.genericName, required this.price, this.oldPrice, required this.category, this.rating = 0, this.inStock = true, this.image});

  /// Returns a local asset image path, cycling through available images by ID hash.
  String get assetImage => _assetImages[id.hashCode.abs() % _assetImages.length];

  factory Medicine.fromJson(Map<String, dynamic> json) => Medicine(
    id: json['_id'] ?? '', name: json['name'] ?? '', genericName: json['genericName'] ?? '',
    price: (json['price'] ?? 0).toDouble(), oldPrice: json['oldPrice']?.toDouble(),
    category: json['category'] ?? 'General', rating: (json['rating'] ?? 0).toDouble(),
    inStock: json['inStock'] ?? true, image: json['image'],
  );
}

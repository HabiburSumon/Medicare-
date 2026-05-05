import 'package:flutter/material.dart';
import '../models/medicine.dart';

class CartProvider extends ChangeNotifier {
  final List<Map<String, dynamic>> _items = [];

  List<Map<String, dynamic>> get items => List.unmodifiable(_items);

  int get itemCount =>
      _items.fold(0, (sum, item) => sum + (item['qty'] as int));

  double get subtotal =>
      _items.fold(0.0, (sum, item) => sum + (item['price'] as double) * (item['qty'] as int));

  double get deliveryFee => subtotal > 500 ? 0 : 50;

  double get total => subtotal + deliveryFee;

  void addItem(Medicine medicine) {
    final idx = _items.indexWhere((item) => item['id'] == medicine.id);
    if (idx >= 0) {
      _items[idx]['qty'] = (_items[idx]['qty'] as int) + 1;
    } else {
      _items.add({
        'id': medicine.id,
        'name': medicine.name,
        'price': medicine.price,
        'qty': 1,
      });
    }
    notifyListeners();
  }

  void updateQty(int index, int newQty) {
    if (newQty <= 0) {
      _items.removeAt(index);
    } else {
      _items[index]['qty'] = newQty;
    }
    notifyListeners();
  }

  void clear() {
    _items.clear();
    notifyListeners();
  }
}
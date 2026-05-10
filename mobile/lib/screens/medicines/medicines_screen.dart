import '../../widgets/app_loading.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/medicine.dart';
import '../../providers/cart_provider.dart';
import '../../services/api_service.dart';

class MedicinesScreen extends StatefulWidget {
  const MedicinesScreen({super.key});

  @override
  State<MedicinesScreen> createState() => _MedicinesScreenState();
}

class _MedicinesScreenState extends State<MedicinesScreen> {
  List<Medicine> _medicines = [];
  bool _loading = true;
  String _search = '';
  String _selectedCategory = 'All';
  final Set<String> _favorites = {};

  final List<Map<String, dynamic>> _categories = [
    {'label': 'All', 'icon': Icons.apps_rounded, 'gradient': [const Color(0xFF2563EB), const Color(0xFF3B82F6)]},
    {'label': 'Tablets', 'icon': Icons.medication_rounded, 'gradient': [const Color(0xFF7C3AED), const Color(0xFF8B5CF6)]},
    {'label': 'Capsules', 'icon': Icons.healing_rounded, 'gradient': [const Color(0xFF059669), const Color(0xFF10B981)]},
    {'label': 'Syrup', 'icon': Icons.water_drop_rounded, 'gradient': [const Color(0xFFD97706), const Color(0xFFF59E0B)]},
    {'label': 'Injection', 'icon': Icons.vaccines_rounded, 'gradient': [const Color(0xFFDC2626), const Color(0xFFEF4444)]},
    {'label': 'Supplements', 'icon': Icons.fitness_center_rounded, 'gradient': [const Color(0xFF0891B2), const Color(0xFF06B6D4)]},
    {'label': 'Devices', 'icon': Icons.monitor_heart_rounded, 'gradient': [const Color(0xFFDB2777), const Color(0xFFEC4899)]},
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final r = await ApiService.get('/medicines');
      setState(() {
        _medicines = (r['data'] as List).map((e) => Medicine.fromJson(e)).toList();
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  List<Medicine> get _filtered {
    return _medicines.where((m) {
      final matchesSearch = m.name.toLowerCase().contains(_search.toLowerCase()) ||
          m.genericName.toLowerCase().contains(_search.toLowerCase());
      final matchesCategory = _selectedCategory == 'All' || m.category == _selectedCategory;
      return matchesSearch && matchesCategory;
    }).toList();
  }

  void _showProductDetail(Medicine medicine) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _ProductDetailSheet(
        medicine: medicine,
        isFavorite: _favorites.contains(medicine.id),
        onFavoriteToggle: () {
          setState(() {
            if (_favorites.contains(medicine.id)) {
              _favorites.remove(medicine.id);
            } else {
              _favorites.add(medicine.id);
            }
          });
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _filtered;
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            floating: true, pinned: true, elevation: 0,
            backgroundColor: const Color(0xFF2563EB),
            expandedHeight: 60, toolbarHeight: 60, centerTitle: true,
            title: const Text('Medicines & Health',
                style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
            actions: [
              IconButton(icon: const Icon(Icons.filter_list_outlined, color: Colors.white), onPressed: () {}),
            ],
          ),

          // Search Bar
          SliverToBoxAdapter(
            child: Container(
              color: const Color(0xFF2563EB),
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white, borderRadius: BorderRadius.circular(12),
                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 8, offset: const Offset(0, 2))],
                ),
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Search medicines, vitamins...',
                    hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 14),
                    prefixIcon: Icon(Icons.search_outlined, color: Colors.grey.shade400, size: 22),
                    suffixIcon: Container(
                      margin: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: const Color(0xFF2563EB), borderRadius: BorderRadius.circular(8)),
                      child: const Icon(Icons.tune, color: Colors.white, size: 20),
                    ),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  ),
                  onChanged: (v) => setState(() => _search = v),
                ),
              ),
            ),
          ),

          // Modern Category Chips
          SliverToBoxAdapter(
            child: Container(
              color: const Color(0xFFF8FAFC),
              padding: const EdgeInsets.fromLTRB(0, 16, 0, 8),
              child: SizedBox(
                height: 48,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _categories.length,
                  itemBuilder: (_, i) {
                    final cat = _categories[i];
                    final isSelected = _selectedCategory == cat['label'];
                    return Padding(
                      padding: const EdgeInsets.only(right: 10),
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedCategory = cat['label'] as String),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          curve: Curves.easeInOut,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            gradient: isSelected ? LinearGradient(colors: cat['gradient'] as List<Color>) : null,
                            color: isSelected ? null : Colors.white,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: isSelected ? Colors.transparent : const Color(0xFFE5E7EB)),
                            boxShadow: isSelected
                                ? [BoxShadow(color: (cat['gradient'] as List<Color>).first.withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 3))]
                                : [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 4, offset: const Offset(0, 1))],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(cat['icon'] as IconData, size: 18, color: isSelected ? Colors.white : Colors.grey.shade600),
                              const SizedBox(width: 6),
                              Text(cat['label'] as String,
                                  style: TextStyle(color: isSelected ? Colors.white : Colors.grey.shade700, fontWeight: FontWeight.w600, fontSize: 13)),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          ),

          // Results count
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('${filtered.length} products found', style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                  Row(children: [
                    _gridToggleBtn(Icons.grid_view_outlined, true),
                    const SizedBox(width: 4),
                    _gridToggleBtn(Icons.view_list_outlined, false),
                  ]),
                ],
              ),
            ),
          ),

          if (_loading)
            const SliverFillRemaining(child: AppLoading())
          else if (filtered.isEmpty)
            SliverFillRemaining(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.search_off_outlined, size: 64, color: Colors.grey.shade300),
                    const SizedBox(height: 16),
                    Text('No medicines found', style: TextStyle(fontSize: 16, color: Colors.grey.shade500)),
                    const SizedBox(height: 4),
                    Text('Try a different search or category', style: TextStyle(fontSize: 13, color: Colors.grey.shade400)),
                  ],
                ),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2, childAspectRatio: 0.62, crossAxisSpacing: 12, mainAxisSpacing: 12,
                ),
                delegate: SliverChildBuilderDelegate(
                  (_, i) => _MedicineCard(
                    medicine: filtered[i],
                    isFavorite: _favorites.contains(filtered[i].id),
                    onFavoriteToggle: () {
                      setState(() {
                        if (_favorites.contains(filtered[i].id)) {
                          _favorites.remove(filtered[i].id);
                        } else {
                          _favorites.add(filtered[i].id);
                        }
                      });
                    },
                    onTap: () => _showProductDetail(filtered[i]),
                  ),
                  childCount: filtered.length,
                ),
              ),
            ),
          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ],
      ),
    );
  }

  Widget _gridToggleBtn(IconData icon, bool isActive) {
    return Container(
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: isActive ? const Color(0xFF2563EB) : Colors.white,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: isActive ? const Color(0xFF2563EB) : const Color(0xFFE5E7EB)),
      ),
      child: Icon(icon, size: 18, color: isActive ? Colors.white : Colors.grey.shade500),
    );
  }
}

// ==================== MEDICINE CARD ====================

class _MedicineCard extends StatelessWidget {
  final Medicine medicine;
  final bool isFavorite;
  final VoidCallback onFavoriteToggle;
  final VoidCallback onTap;

  const _MedicineCard({required this.medicine, required this.isFavorite, required this.onFavoriteToggle, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, 2))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 5,
              child: Stack(
                children: [
                  Container(
                    width: double.infinity,
                    decoration: const BoxDecoration(
                      color: Color(0xFFF0F7FF),
                      borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                    ),
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                      child: Image.asset(
                        medicine.assetImage, fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Center(
                          child: Icon(Icons.medication_outlined, size: 48, color: const Color(0xFF2563EB).withValues(alpha: 0.3)),
                        ),
                      ),
                    ),
                  ),
                  if (medicine.oldPrice != null && medicine.oldPrice! > medicine.price)
                    Positioned(
                      top: 8, left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: const Color(0xFFEF4444), borderRadius: BorderRadius.circular(6)),
                        child: Text('${((1 - medicine.price / medicine.oldPrice!) * 100).round()}% OFF',
                            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  // Working favorite toggle
                  Positioned(
                    top: 8, right: 8,
                    child: GestureDetector(
                      onTap: onFavoriteToggle,
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.white, shape: BoxShape.circle,
                          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 4)],
                        ),
                        child: Icon(
                          isFavorite ? Icons.favorite : Icons.favorite_outline,
                          size: 16,
                          color: isFavorite ? const Color(0xFFEF4444) : Colors.grey.shade600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              flex: 4,
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(medicine.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                        maxLines: 1, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 2),
                    Text(medicine.genericName, style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                        maxLines: 1, overflow: TextOverflow.ellipsis),
                    const Spacer(),
                    if (medicine.rating > 0)
                      Row(children: [
                        const Icon(Icons.star, size: 14, color: Color(0xFFF59E0B)),
                        const SizedBox(width: 2),
                        Text(medicine.rating.toStringAsFixed(1), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                      ]),
                    const Spacer(),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text('৳${medicine.price.toStringAsFixed(0)}',
                                style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF2563EB), fontSize: 16)),
                            if (medicine.oldPrice != null && medicine.oldPrice! > medicine.price)
                              Text('৳${medicine.oldPrice!.toStringAsFixed(0)}',
                                  style: TextStyle(decoration: TextDecoration.lineThrough, color: Colors.grey.shade400, fontSize: 11)),
                          ],
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.all(7),
                          decoration: BoxDecoration(color: const Color(0xFF2563EB), borderRadius: BorderRadius.circular(10)),
                          child: const Icon(Icons.add, color: Colors.white, size: 18),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ==================== PRODUCT DETAIL SHEET (StatefulWidget) ====================

class _ProductDetailSheet extends StatefulWidget {
  final Medicine medicine;
  final bool isFavorite;
  final VoidCallback onFavoriteToggle;

  const _ProductDetailSheet({required this.medicine, required this.isFavorite, required this.onFavoriteToggle});

  @override
  State<_ProductDetailSheet> createState() => _ProductDetailSheetState();
}

class _ProductDetailSheetState extends State<_ProductDetailSheet> {
  int _qty = 1;
  late bool _isFavorite;

  @override
  void initState() {
    super.initState();
    _isFavorite = widget.isFavorite;
  }

  void _toggleFavorite() {
    setState(() => _isFavorite = !_isFavorite);
    widget.onFavoriteToggle();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          Center(
            child: Container(
              margin: const EdgeInsets.symmetric(vertical: 12),
              width: 40, height: 4,
              decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    height: 260, width: double.infinity, color: const Color(0xFFF0F7FF),
                    child: Stack(
                      children: [
                        Center(
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.asset(
                              widget.medicine.assetImage, height: 220, fit: BoxFit.contain,
                              errorBuilder: (_, __, ___) => Icon(Icons.medication_outlined, size: 80,
                                  color: const Color(0xFF2563EB).withValues(alpha: 0.3)),
                            ),
                          ),
                        ),
                        Positioned(
                          top: 12, left: 12,
                          child: GestureDetector(
                            onTap: () => Navigator.pop(context),
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle,
                                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 4)]),
                              child: const Icon(Icons.close, size: 20),
                            ),
                          ),
                        ),
                        Positioned(
                          top: 12, right: 12,
                          child: GestureDetector(
                            onTap: _toggleFavorite,
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle,
                                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 4)]),
                              child: Icon(
                                _isFavorite ? Icons.favorite : Icons.favorite_outline,
                                size: 20,
                                color: _isFavorite ? const Color(0xFFEF4444) : Colors.grey.shade600,
                              ),
                            ),
                          ),
                        ),
                        if (widget.medicine.oldPrice != null && widget.medicine.oldPrice! > widget.medicine.price)
                          Positioned(
                            bottom: 12, left: 16,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(color: const Color(0xFFEF4444), borderRadius: BorderRadius.circular(8)),
                              child: Text('${((1 - widget.medicine.price / widget.medicine.oldPrice!) * 100).round()}% OFF',
                                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                          ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF2563EB).withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(widget.medicine.category,
                              style: const TextStyle(color: Color(0xFF2563EB), fontSize: 11, fontWeight: FontWeight.w600)),
                        ),
                        const SizedBox(height: 12),
                        Text(widget.medicine.name,
                            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                        const SizedBox(height: 4),
                        Text(widget.medicine.genericName, style: TextStyle(fontSize: 14, color: Colors.grey.shade500)),
                        const SizedBox(height: 16),
                        Row(children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF59E0B).withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(children: [
                              const Icon(Icons.star, size: 16, color: Color(0xFFF59E0B)),
                              const SizedBox(width: 4),
                              Text(widget.medicine.rating.toStringAsFixed(1),
                                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                            ]),
                          ),
                          const SizedBox(width: 12),
                          Text(widget.medicine.inStock ? '✓ In Stock' : '✗ Out of Stock',
                              style: TextStyle(
                                color: widget.medicine.inStock ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                fontWeight: FontWeight.w600, fontSize: 13)),
                        ]),
                        const SizedBox(height: 20),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFE5E7EB)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Price', style: TextStyle(fontSize: 12, color: Color(0xFF6B7280))),
                                  const SizedBox(height: 4),
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.baseline, textBaseline: TextBaseline.alphabetic,
                                    children: [
                                      Text('৳${widget.medicine.price.toStringAsFixed(0)}',
                                          style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                                      if (widget.medicine.oldPrice != null && widget.medicine.oldPrice! > widget.medicine.price) ...[
                                        const SizedBox(width: 8),
                                        Text('৳${widget.medicine.oldPrice!.toStringAsFixed(0)}',
                                            style: TextStyle(decoration: TextDecoration.lineThrough, color: Colors.grey.shade400, fontSize: 16)),
                                      ],
                                    ],
                                  ),
                                ],
                              ),
                              if (widget.medicine.oldPrice != null && widget.medicine.oldPrice! > widget.medicine.price)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFEF4444).withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text('Save ৳${(widget.medicine.oldPrice! - widget.medicine.price).toStringAsFixed(0)}',
                                      style: const TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.bold, fontSize: 13)),
                                ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                        const Text('Description', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text(
                          '${widget.medicine.name} contains ${widget.medicine.genericName}. It is used as per doctor\'s prescription. Always follow the recommended dosage and consult your healthcare provider.',
                          style: TextStyle(fontSize: 14, color: Colors.grey.shade600, height: 1.6),
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Bottom: Working Quantity + Add to Cart
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 10, offset: const Offset(0, -2))],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: const Color(0xFFE5E7EB)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        _qtyBtn(Icons.remove, _qty > 1 ? () => setState(() => _qty--) : null),
                        Container(
                          width: 40, alignment: Alignment.center,
                          child: Text('$_qty', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        ),
                        _qtyBtn(Icons.add, () => setState(() => _qty++)),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        final cart = Provider.of<CartProvider>(context, listen: false);
                        for (int i = 0; i < _qty; i++) {
                          cart.addItem(widget.medicine);
                        }
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('${_qty}x ${widget.medicine.name} added to cart!'),
                            behavior: SnackBarBehavior.floating,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        );
                        Navigator.pop(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: Text('Add to Cart  ৳${(widget.medicine.price * _qty).toStringAsFixed(0)}',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _qtyBtn(IconData icon, VoidCallback? onTap) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Icon(icon, size: 18, color: onTap != null ? const Color(0xFF2563EB) : Colors.grey.shade300),
        ),
      ),
    );
  }
}
import 'package:flutter/material.dart';
import '../../models/medicine.dart';
import '../../services/api_service.dart';

class MedicinesScreen extends StatefulWidget {
  const MedicinesScreen({super.key});
  @override State<MedicinesScreen> createState() => _MedicinesScreenState();
}

class _MedicinesScreenState extends State<MedicinesScreen> {
  List<Medicine> _medicines = [];
  bool _loading = true;
  String _search = '';
  @override void initState() { super.initState(); _load(); }
  Future<void> _load() async {
    try { final r = await ApiService.get('/medicines'); setState(() { _medicines = (r['data'] as List).map((e) => Medicine.fromJson(e)).toList(); _loading = false; }); }
    catch (_) { setState(() => _loading = false); }
  }
  @override
  Widget build(BuildContext context) {
    final filtered = _medicines.where((m) => m.name.toLowerCase().contains(_search.toLowerCase())).toList();
    return Scaffold(appBar: AppBar(title: const Text('Medicines')), body: Column(children: [
      Padding(padding: const EdgeInsets.all(16), child: TextField(decoration: const InputDecoration(labelText: 'Search medicines...', prefixIcon: Icon(Icons.search)), onChanged: (v) => setState(() => _search = v))),
      Expanded(child: _loading ? const Center(child: CircularProgressIndicator()) : filtered.isEmpty ? const Center(child: Text('No medicines found')) : GridView.builder(padding: const EdgeInsets.all(16), gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: 0.7, crossAxisSpacing: 12, mainAxisSpacing: 12), itemCount: filtered.length,
        itemBuilder: (_, i) { final m = filtered[i]; return Card(child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Expanded(child: Center(child: Icon(Icons.medication, size: 48, color: Colors.grey.shade400))),
          Text(m.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14), maxLines: 2, overflow: TextOverflow.ellipsis),
          Text(m.genericName, style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280)), maxLines: 1, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 8), Text('\$${m.price}', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF2563EB), fontSize: 16)),
          const Spacer(), SizedBox(width: double.infinity, child: ElevatedButton(onPressed: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Added to cart!'))), child: const Text('Add to Cart'))),
        ]))); },)),
    ]));
  }
}

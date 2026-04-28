import 'package:flutter/material.dart';
import '../../models/doctor.dart';
import '../../services/api_service.dart';
import 'doctor_detail_screen.dart';

class DoctorsScreen extends StatefulWidget {
  const DoctorsScreen({super.key});
  @override State<DoctorsScreen> createState() => _DoctorsScreenState();
}

class _DoctorsScreenState extends State<DoctorsScreen> {
  List<Doctor> _doctors = [];
  bool _loading = true;
  String _search = '';
  @override void initState() { super.initState(); _loadDoctors(); }
  Future<void> _loadDoctors() async {
    try {
      final response = await ApiService.get('/doctors');
      final list = response['data'] as List;
      setState(() { _doctors = list.map((e) => Doctor.fromJson(e)).toList(); _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }
  @override
  Widget build(BuildContext context) {
    final filtered = _doctors.where((d) => d.name.toLowerCase().contains(_search.toLowerCase()) || d.specialization.toLowerCase().contains(_search.toLowerCase())).toList();
    return Scaffold(
      appBar: AppBar(title: const Text('Find Doctors')),
      body: Column(children: [
        Padding(padding: const EdgeInsets.all(16), child: TextField(decoration: const InputDecoration(labelText: 'Search doctors...', prefixIcon: Icon(Icons.search)), onChanged: (v) => setState(() => _search = v))),
        Expanded(child: _loading ? const Center(child: CircularProgressIndicator()) : filtered.isEmpty ? const Center(child: Text('No doctors found')) : ListView.builder(
          padding: const EdgeInsets.all(16), itemCount: filtered.length,
          itemBuilder: (_, i) => Card(margin: const EdgeInsets.only(bottom: 12), child: ListTile(
            contentPadding: const EdgeInsets.all(12),
            leading: CircleAvatar(radius: 30, backgroundColor: const Color(0xFF2563EB).withOpacity(0.1), child: Text(filtered[i].name[0], style: const TextStyle(color: Color(0xFF2563EB), fontSize: 20, fontWeight: FontWeight.bold))),
            title: Text(filtered[i].name, style: const TextStyle(fontWeight: FontWeight.w600)),
            subtitle: Text(filtered[i].specialization),
            trailing: Column(mainAxisAlignment: MainAxisAlignment.center, children: [Text('৳${filtered[i].consultationFee.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF2563EB))), Text('${filtered[i].experience} yrs exp', style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280)))]),
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => DoctorDetailScreen(doctor: filtered[i]))),
          )),
        )),
      ]),
    );
  }
}
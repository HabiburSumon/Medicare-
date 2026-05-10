import '../../widgets/app_loading.dart';
import 'package:flutter/material.dart';
import '../../models/prescription.dart';
import '../../services/api_service.dart';

class PrescriptionsScreen extends StatefulWidget {
  const PrescriptionsScreen({super.key});
  @override State<PrescriptionsScreen> createState() => _PrescriptionsScreenState();
}

class _PrescriptionsScreenState extends State<PrescriptionsScreen> {
  List<Prescription> _prescriptions = [];
  bool _loading = true;
  @override void initState() { super.initState(); _load(); }
  Future<void> _load() async {
    try { final r = await ApiService.get('/prescriptions/my-prescriptions'); setState(() { _prescriptions = (r['data']['prescriptions'] as List? ?? r['data'] as List? ?? []).map((e) => Prescription.fromJson(e)).toList(); _loading = false; }); }
    catch (_) { setState(() => _loading = false); }
  }
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Prescriptions')), body: _loading ? const AppLoading() : _prescriptions.isEmpty ? const Center(child: Text('No prescriptions yet')) : ListView.builder(padding: const EdgeInsets.all(16), itemCount: _prescriptions.length,
    itemBuilder: (_, i) { final p = _prescriptions[i]; return Card(margin: const EdgeInsets.only(bottom: 12), child: ExpansionTile(title: Text('Prescription #\${i+1}', style: const TextStyle(fontWeight: FontWeight.w600)), subtitle: Text('Dr. \${p.doctorName}'), children: [Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      if (p.diagnosis != null) ...[const Text('Diagnosis:', style: TextStyle(fontWeight: FontWeight.w600)), Text(p.diagnosis!), const SizedBox(height: 12)],
      const Text('Medicines:', style: TextStyle(fontWeight: FontWeight.w600)),
      ...p.medicines.map((m) => Padding(padding: const EdgeInsets.only(top: 8), child: Row(children: [const Icon(Icons.medication, size: 16, color: Color(0xFF2563EB)), const SizedBox(width: 8), Expanded(child: Text('\${m.name} - \${m.dosage} - \${m.frequency} - \${m.duration}'))]))),
    ]))])); },));
}

import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class SymptomCheckerScreen extends StatefulWidget {
  const SymptomCheckerScreen({super.key});
  @override State<SymptomCheckerScreen> createState() => _SymptomCheckerScreenState();
}

class _SymptomCheckerScreenState extends State<SymptomCheckerScreen> {
  final _symptoms = TextEditingController();
  bool _loading = false;
  List<Map<String, dynamic>> _results = [];
  Future<void> _check() async {
    if (_symptoms.text.trim().isEmpty) return;
    setState(() { _loading = true; _results = []; });
    try {
      final r = await ApiService.post('/symptoms/check', {'symptoms': _symptoms.text.trim()});
      setState(() { _results = (r['data']['possibleConditions'] as List? ?? r['data']['conditions'] as List? ?? []).cast<Map<String, dynamic>>(); _loading = false; });
    } catch (_) { setState(() { _results = [{'condition': 'Unable to analyze', 'suggestion': 'Please consult a doctor'}]; _loading = false; }); }
  }
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Symptom Checker')), body: SingleChildScrollView(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.orange.shade50, borderRadius: BorderRadius.circular(12)), child: const Row(children: [Icon(Icons.info, color: Colors.orange), SizedBox(width: 12), Expanded(child: Text('For informational purposes only. Always consult a doctor.', style: TextStyle(fontSize: 13, color: Colors.orange)))])),
    const SizedBox(height: 24), TextField(controller: _symptoms, maxLines: 4, decoration: const InputDecoration(labelText: 'Describe your symptoms', hintText: 'e.g., headache, fever, cough...')),
    const SizedBox(height: 16), SizedBox(width: double.infinity, height: 50, child: ElevatedButton(onPressed: _loading ? null : _check, child: _loading ? const CircularProgressIndicator(color: Colors.white) : const Text('Check Symptoms'))),
    const SizedBox(height: 24),
    if (_results.isNotEmpty) ...[const Text('Possible Conditions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)), const SizedBox(height: 12), ..._results.map((r) => Card(margin: const EdgeInsets.only(bottom: 12), child: ListTile(title: Text(r['condition'] ?? r['name'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.w600)), subtitle: Text(r['suggestion'] ?? r['description'] ?? ''))))],
  ])));
}

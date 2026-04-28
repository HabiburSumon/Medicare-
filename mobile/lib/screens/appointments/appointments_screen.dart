import 'package:flutter/material.dart';
import '../../models/appointment.dart';
import '../../services/api_service.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});
  @override State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> {
  List<Appointment> _appointments = [];
  bool _loading = true;
  @override void initState() { super.initState(); _load(); }
  Future<void> _load() async {
    try {
      final r = await ApiService.get('/appointments/my-appointments');
      final list = r['data']['appointments'] as List? ?? r['data'] as List? ?? [];
      setState(() { _appointments = list.map((e) => Appointment.fromJson(e)).toList(); _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }
  Color _sc(String s) => s == 'confirmed' ? Colors.green : s == 'cancelled' ? Colors.red : Colors.orange;
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Appointments')), body: _loading ? const Center(child: CircularProgressIndicator()) : _appointments.isEmpty ? const Center(child: Text('No appointments yet')) : RefreshIndicator(onRefresh: _load,
    child: ListView.builder(padding: const EdgeInsets.all(16), itemCount: _appointments.length, itemBuilder: (_, i) { final a = _appointments[i]; return Card(margin: const EdgeInsets.only(bottom: 12), child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [Expanded(child: Text(a.doctorName, style: const TextStyle(fontWeight: FontWeight.w600))), Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: _sc(a.status).withOpacity(0.1), borderRadius: BorderRadius.circular(8)), child: Text(a.status.toUpperCase(), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: _sc(a.status))))]),
      const SizedBox(height: 8), Row(children: [const Icon(Icons.calendar_today, size: 16, color: Color(0xFF6B7280)), const SizedBox(width: 6), Text(a.date, style: const TextStyle(color: Color(0xFF6B7280))), const SizedBox(width: 16), const Icon(Icons.access_time, size: 16, color: Color(0xFF6B7280)), const SizedBox(width: 6), Text(a.time, style: const TextStyle(color: Color(0xFF6B7280)))]),
      if (a.serialNumber != null) ...[const SizedBox(height: 8), Text('Serial: #\${a.serialNumber}', style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF2563EB)))],
    ]))); },)));
}

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../../config/api_config.dart';
import '../../models/doctor.dart';
import '../../services/api_service.dart';

class DoctorDetailScreen extends StatefulWidget {
  final Doctor doctor;
  const DoctorDetailScreen({super.key, required this.doctor});
  @override State<DoctorDetailScreen> createState() => _DoctorDetailScreenState();
}

class _DoctorDetailScreenState extends State<DoctorDetailScreen> {
  bool _loading = false;
  String _selectedTime = '';
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  final _timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

  Future<void> _book() async {
    if (_selectedTime.isEmpty) { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Select a time slot'))); return; }
    setState(() => _loading = true);
    try {
      await ApiService.post('/appointments', {'doctor': widget.doctor.id, 'date': _selectedDate.toIso8601String().split('T')[0], 'timeSlot': _selectedTime});
      if (mounted) { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Booked!'))); Navigator.pop(context); }
    } catch (e) { ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')))); }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final d = widget.doctor;
    return Scaffold(appBar: AppBar(title: const Text('Doctor Profile')), body: SingleChildScrollView(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Center(child: Column(children: [CircleAvatar(radius: 45, backgroundColor: const Color(0xFF2563EB).withValues(alpha: 0.1), backgroundImage: ApiConfig.buildImageUrl(d.avatar) != null ? CachedNetworkImageProvider(ApiConfig.buildImageUrl(d.avatar!)!, headers: ApiConfig.imageHeaders) : null, child: ApiConfig.buildImageUrl(d.avatar) == null ? Text(d.name.isNotEmpty ? d.name[0] : 'D', style: const TextStyle(color: Color(0xFF2563EB), fontSize: 32, fontWeight: FontWeight.bold)) : null), const SizedBox(height: 12), Text(d.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)), Text(d.specialization, style: const TextStyle(color: Color(0xFF6B7280)))])),
      const SizedBox(height: 24), Row(children: [Expanded(child: _i('${d.experience}', 'Yrs Exp')), Expanded(child: _i('${d.totalReviews}', 'Reviews')), Expanded(child: _i('\u09F3${d.consultationFee.toStringAsFixed(0)}', 'Fee'))]),
      const SizedBox(height: 24), const Text('Select Date', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)), const SizedBox(height: 8),
      OutlinedButton(onPressed: () async { final dt = await showDatePicker(context: context, initialDate: _selectedDate, firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 30))); if (dt != null) setState(() => _selectedDate = dt); }, child: Text(_selectedDate.toIso8601String().split('T')[0])),
      const SizedBox(height: 24), const Text('Select Time', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)), const SizedBox(height: 8),
      Wrap(spacing: 8, runSpacing: 8, children: _timeSlots.map((t) => ChoiceChip(label: Text(t), selected: _selectedTime == t, onSelected: (_) => setState(() => _selectedTime = t))).toList()),
      const SizedBox(height: 32), SizedBox(width: double.infinity, height: 50, child: ElevatedButton(onPressed: _loading ? null : _book, child: _loading ? const CircularProgressIndicator(color: Colors.white) : const Text('Book Appointment'))),
    ])));
  }
  Widget _i(String v, String l) => Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(children: [Text(v, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))), Text(l, style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280)))])));
}

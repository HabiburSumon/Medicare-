import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});
  @override State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<Map<String, dynamic>> _notifications = [];
  bool _loading = true;
  @override void initState() { super.initState(); _load(); }
  Future<void> _load() async {
    try { final r = await ApiService.get('/notifications'); setState(() { _notifications = (r['data']['notifications'] as List? ?? r['data'] as List? ?? []).cast<Map<String, dynamic>>(); _loading = false; }); }
    catch (_) { setState(() => _loading = false); }
  }
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Notifications')), body: _loading ? const Center(child: CircularProgressIndicator()) : _notifications.isEmpty ? const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.notifications_off, size: 64, color: Color(0xFF9CA3AF)), SizedBox(height: 16), Text('No notifications')])) : ListView.builder(padding: const EdgeInsets.all(16), itemCount: _notifications.length,
    itemBuilder: (_, i) { final n = _notifications[i]; return Card(margin: const EdgeInsets.only(bottom: 12), child: ListTile(leading: CircleAvatar(backgroundColor: (n['read'] == true ? Colors.grey : const Color(0xFF2563EB)).withOpacity(0.1), child: Icon(Icons.notifications, color: n['read'] == true ? Colors.grey : const Color(0xFF2563EB))), title: Text(n['title'] ?? 'Notification', style: const TextStyle(fontWeight: FontWeight.w600)), subtitle: Text(n['message'] ?? n['body'] ?? '', maxLines: 2, overflow: TextOverflow.ellipsis))); },));
}

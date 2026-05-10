import '../../widgets/app_loading.dart';
import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import 'chat_screen.dart';

class ChatListScreen extends StatefulWidget {
  const ChatListScreen({super.key});
  @override State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  List<Map<String, dynamic>> _convos = [];
  bool _loading = true;
  @override void initState() { super.initState(); _load(); }
  Future<void> _load() async {
    try { final r = await ApiService.get('/messages/conversations'); setState(() { _convos = (r['data'] as List? ?? []).cast<Map<String, dynamic>>(); _loading = false; }); }
    catch (_) { setState(() => _loading = false); }
  }
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Messages')), body: _loading ? const AppLoading() : _convos.isEmpty ? const Center(child: Text('No conversations')) : ListView.builder(padding: const EdgeInsets.all(16), itemCount: _convos.length,
    itemBuilder: (_, i) { final c = _convos[i]; return Card(margin: const EdgeInsets.only(bottom: 12), child: ListTile(leading: const CircleAvatar(backgroundColor: Color(0xFF2563EB), child: Icon(Icons.person, color: Colors.white)), title: Text(c['name'] ?? 'User', style: const TextStyle(fontWeight: FontWeight.w600)), subtitle: Text(c['lastMessage'] ?? '', maxLines: 1, overflow: TextOverflow.ellipsis), onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => ChatScreen(receiverId: c['id'] ?? '', receiverName: c['name'] ?? 'User'))))); },));
}

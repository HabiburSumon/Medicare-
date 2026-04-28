import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class ChatScreen extends StatefulWidget {
  final String receiverId;
  final String receiverName;
  const ChatScreen({super.key, required this.receiverId, required this.receiverName});
  @override State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _ctrl = TextEditingController();
  final _scroll = ScrollController();
  List<Map<String, dynamic>> _messages = [];
  bool _loading = true;
  @override void initState() { super.initState(); _load(); }
  Future<void> _load() async {
    try { final r = await ApiService.get('/messages/\${widget.receiverId}'); setState(() { _messages = (r['data'] as List? ?? []).cast<Map<String, dynamic>>(); _loading = false; }); _scrollDown(); }
    catch (_) { setState(() => _loading = false); }
  }
  Future<void> _send() async {
    if (_ctrl.text.trim().isEmpty) return;
    final text = _ctrl.text.trim(); _ctrl.clear();
    setState(() => _messages.add({'content': text, 'senderId': 'me', 'createdAt': DateTime.now().toIso8601String()}));
    _scrollDown();
    try { await ApiService.post('/messages', {'receiver': widget.receiverId, 'content': text}); } catch (_) {}
  }
  void _scrollDown() => Future.delayed(const Duration(milliseconds: 100), () { if (_scroll.hasClients) _scroll.animateTo(_scroll.position.maxScrollExtent, duration: const Duration(milliseconds: 300), curve: Curves.easeOut); });
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: Text(widget.receiverName)), body: Column(children: [
    Expanded(child: _loading ? const Center(child: CircularProgressIndicator()) : ListView.builder(controller: _scroll, padding: const EdgeInsets.all(16), itemCount: _messages.length,
      itemBuilder: (_, i) { final m = _messages[i]; final isMe = m['senderId'] == 'me'; return Align(alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
        child: Container(margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(12), constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.7),
          decoration: BoxDecoration(color: isMe ? const Color(0xFF2563EB) : Colors.white, borderRadius: BorderRadius.circular(16), border: isMe ? null : Border.all(color: const Color(0xFFE5E7EB))),
          child: Text(m['content'] ?? '', style: TextStyle(color: isMe ? Colors.white : const Color(0xFF111827))))); })),
    Container(padding: const EdgeInsets.all(12), decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: Color(0xFFE5E7EB)))), child: Row(children: [Expanded(child: TextField(controller: _ctrl, decoration: const InputDecoration(hintText: 'Type a message...', isDense: true))), IconButton(onPressed: _send, icon: const Icon(Icons.send, color: Color(0xFF2563EB)))])),
  ]));
}

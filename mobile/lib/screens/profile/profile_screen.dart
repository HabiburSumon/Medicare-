import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../auth/login_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;
    return Scaffold(appBar: AppBar(title: const Text('Profile')), body: SingleChildScrollView(padding: const EdgeInsets.all(20), child: Column(children: [
      Center(child: Column(children: [CircleAvatar(radius: 50, backgroundColor: const Color(0xFF2563EB).withOpacity(0.1), child: Text(user?.name?[0] ?? '?', style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)))), const SizedBox(height: 12), Text(user?.name ?? 'User', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)), Text(user?.email ?? '', style: const TextStyle(color: Color(0xFF6B7280)))])),
      const SizedBox(height: 32),
      ListTile(leading: const Icon(Icons.person, color: Color(0xFF2563EB)), title: const Text('Edit Profile'), trailing: const Icon(Icons.chevron_right), onTap: () {}),
      ListTile(leading: const Icon(Icons.calendar_today, color: Color(0xFF2563EB)), title: const Text('My Appointments'), trailing: const Icon(Icons.chevron_right), onTap: () {}),
      ListTile(leading: const Icon(Icons.favorite, color: Color(0xFF2563EB)), title: const Text('Favorite Doctors'), trailing: const Icon(Icons.chevron_right), onTap: () {}),
      ListTile(leading: const Icon(Icons.settings, color: Color(0xFF2563EB)), title: const Text('Settings'), trailing: const Icon(Icons.chevron_right), onTap: () {}),
      const SizedBox(height: 16),
      SizedBox(width: double.infinity, child: OutlinedButton(onPressed: () async { await auth.logout(); if (context.mounted) Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen())); }, style: OutlinedButton.styleFrom(foregroundColor: Colors.red, side: const BorderSide(color: Colors.red)), child: const Text('Sign Out'))),
    ])));
  }
}

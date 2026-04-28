import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'doctors/doctors_screen.dart';
import 'appointments/appointments_screen.dart';
import 'medicines/medicines_screen.dart';
import 'chat/chat_list_screen.dart';
import 'profile/profile_screen.dart';
import 'notifications/notifications_screen.dart';
import 'symptom_checker/symptom_checker_screen.dart';
import 'prescriptions/prescriptions_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final isDoctor = auth.user?.role == 'doctor';
    final screens = isDoctor
      ? [const _DoctorHomeTab(), const AppointmentsScreen(), const ChatListScreen(), const ProfileScreen()]
      : [const _HomeTab(), const DoctorsScreen(), const AppointmentsScreen(), const ChatListScreen(), const ProfileScreen()];
    final navItems = isDoctor
      ? const [BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'), BottomNavigationBarItem(icon: Icon(Icons.calendar_today), label: 'Appointments'), BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'Messages'), BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile')]
      : const [BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'), BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Doctors'), BottomNavigationBarItem(icon: Icon(Icons.calendar_today), label: 'Appointments'), BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'Messages'), BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile')];

    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: screens),
      bottomNavigationBar: BottomNavigationBar(currentIndex: _currentIndex, onTap: (i) => setState(() => _currentIndex = i), items: navItems),
    );
  }
}

class _HomeTab extends StatelessWidget {
  const _HomeTab();
  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    return Scaffold(
      appBar: AppBar(title: Text('Hello, ${auth.user?.name?.split(' ').first ?? 'User'}'), actions: [IconButton(icon: const Icon(Icons.notifications_outlined), onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen())))]),
      body: SingleChildScrollView(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(padding: const EdgeInsets.all(20), decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF2563EB), Color(0xFF7C3AED)]), borderRadius: BorderRadius.circular(20)),
          child: Row(children: [Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('Need a Doctor?', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)), const SizedBox(height: 8), const Text('Book appointments with top doctors', style: TextStyle(color: Colors.white70, fontSize: 14)), const SizedBox(height: 16), ElevatedButton(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const DoctorsScreen())), style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: const Color(0xFF2563EB)), child: const Text('Find Doctor'))])), const SizedBox(width: 16), const Icon(Icons.medical_services, color: Colors.white, size: 60)])),
        const SizedBox(height: 24), const Text('Quick Actions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)), const SizedBox(height: 16),
        Row(children: [_quickAction(Icons.search, 'Find\nDoctor', const Color(0xFF2563EB), () => Navigator.push(context, MaterialPageRoute(builder: (_) => const DoctorsScreen()))), const SizedBox(width: 12), _quickAction(Icons.medication, 'Order\nMedicine', const Color(0xFF10B981), () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MedicinesScreen()))), const SizedBox(width: 12), _quickAction(Icons.psychology, 'Symptom\nCheck', const Color(0xFFF59E0B), () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SymptomCheckerScreen()))), const SizedBox(width: 12), _quickAction(Icons.receipt_long, 'Prescriptions', const Color(0xFF8B5CF6), () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PrescriptionsScreen())))]),
        const SizedBox(height: 24), const Text('Health Tips', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)), const SizedBox(height: 12),
        _healthTip('Stay Hydrated', 'Drink at least 8 glasses of water daily', Icons.water_drop, const Color(0xFF3B82F6)),
        const SizedBox(height: 8), _healthTip('Regular Exercise', '30 minutes of activity keeps you fit', Icons.fitness_center, const Color(0xFF10B981)),
      ])),
    );
  }
  Widget _quickAction(IconData icon, String label, Color color, VoidCallback onTap) => Expanded(child: GestureDetector(onTap: onTap, child: Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(16)), child: Column(children: [Icon(icon, color: color, size: 28), const SizedBox(height: 8), Text(label, textAlign: TextAlign.center, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color))]))));
  Widget _healthTip(String title, String subtitle, IconData icon, Color color) => Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE5E7EB))), child: Row(children: [Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)), child: Icon(icon, color: color, size: 24)), const SizedBox(width: 16), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontWeight: FontWeight.w600)), Text(subtitle, style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280)))]))]));
}

class _DoctorHomeTab extends StatelessWidget {
  const _DoctorHomeTab();
  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    return Scaffold(appBar: AppBar(title: Text('Dr. ${auth.user?.name?.split(' ').first ?? 'Doctor'}')), body: SingleChildScrollView(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Container(padding: const EdgeInsets.all(20), decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF2563EB), Color(0xFF7C3AED)]), borderRadius: BorderRadius.circular(20)), child: const Row(children: [Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Doctor Dashboard', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)), SizedBox(height: 8), Text('Manage your appointments and patients', style: TextStyle(color: Colors.white70))]))])),
      const SizedBox(height: 24), const Text("Today's Schedule", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)), const SizedBox(height: 12),
      Container(padding: const EdgeInsets.all(20), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Color(0xFFE5E7EB))), child: const Center(child: Column(children: [Icon(Icons.calendar_today, size: 48, color: Color(0xFF9CA3AF)), SizedBox(height: 12), Text('No appointments for today', style: TextStyle(color: Color(0xFF6B7280)))]))),
    ])));
  }
}

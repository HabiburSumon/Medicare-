import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../models/doctor.dart';
import '../models/medicine.dart';
import '../services/api_service.dart';
import 'doctors/doctors_screen.dart';
import 'doctors/doctor_detail_screen.dart';
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
        : [const _ECommerceHomeTab(), const DoctorsScreen(), const AppointmentsScreen(), const ChatListScreen(), const ProfileScreen()];
    final navItems = isDoctor
        ? const [BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'), BottomNavigationBarItem(icon: Icon(Icons.calendar_today), label: 'Appointments'), BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'Messages'), BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile')]
        : const [BottomNavigationBarItem(icon: Icon(Icons.storefront), label: 'Shop'), BottomNavigationBarItem(icon: Icon(Icons.local_hospital), label: 'Doctors'), BottomNavigationBarItem(icon: Icon(Icons.calendar_today), label: 'Appointments'), BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'Messages'), BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile')];

    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: screens),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10)]),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (i) => setState(() => _currentIndex = i),
          items: navItems,
          selectedItemColor: const Color(0xFF2563EB),
          unselectedItemColor: Colors.grey,
          type: BottomNavigationBarType.fixed,
        ),
      ),
    );
  }
}

class _ECommerceHomeTab extends StatefulWidget {
  const _ECommerceHomeTab();
  @override State<_ECommerceHomeTab> createState() => _ECommerceHomeTabState();
}

class _ECommerceHomeTabState extends State<_ECommerceHomeTab> {
  List<Medicine> _medicines = [];
  List<Doctor> _doctors = [];
  bool _loading = true;
  int _currentBanner = 0;
  final PageController _bannerController = PageController();
  final List<String> _categories = ['All', 'Medicines', 'Devices', 'Personal Care', 'Baby Care', 'Fitness', 'Supplements'];
  int _selectedCategory = 0;
  final List<Map<String, dynamic>> _cart = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final responses = await Future.wait([
        ApiService.get('/medicines'),
        ApiService.get('/doctors'),
      ]);
      setState(() {
        _medicines = (responses[0]['data'] as List).map((e) => Medicine.fromJson(e)).toList();
        _doctors = (responses[1]['data'] as List).map((e) => Doctor.fromJson(e)).toList();
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  void _addToCart(Medicine medicine) {
    setState(() {
      final idx = _cart.indexWhere((item) => item['id'] == medicine.id);
      if (idx >= 0) {
        _cart[idx]['qty'] = (_cart[idx]['qty'] as int) + 1;
      } else {
        _cart.add({'id': medicine.id, 'name': medicine.name, 'price': medicine.price, 'qty': 1});
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text('${medicine.name} added to cart'),
      duration: const Duration(seconds: 1),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF2563EB)))
          : CustomScrollView(
              slivers: [
                // APP BAR WITH SEARCH
                SliverAppBar(
                  floating: true,
                  pinned: true,
                  backgroundColor: const Color(0xFF2563EB),
                  expandedHeight: 120,
                  toolbarHeight: 70,
                  title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Hello, ${auth.user?.name?.split(' ').first ?? 'User'} \u{1F44B}', style: const TextStyle(fontSize: 14, color: Colors.white70)),
                    const Text('MediCare+', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
                  ]),
                  actions: [
                    Stack(children: [
                      IconButton(icon: const Icon(Icons.shopping_cart, color: Colors.white), onPressed: _showCart),
                      if (_cart.isNotEmpty)
                        Positioned(right: 4, top: 4, child: CircleAvatar(radius: 10, backgroundColor: Colors.red, child: Text('${_cart.fold(0, (sum, item) => sum + (item['qty'] as int))}', style: const TextStyle(color: Colors.white, fontSize: 10)))),
                    ]),
                    IconButton(icon: const Icon(Icons.notifications_outlined, color: Colors.white), onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen()))),
                  ],
                  bottom: PreferredSize(
                    preferredSize: const Size.fromHeight(50),
                    child: Container(height: 50, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      child: TextField(
                        decoration: InputDecoration(hintText: 'Search medicines, doctors...', hintStyle: const TextStyle(color: Colors.white60), prefixIcon: const Icon(Icons.search, color: Colors.white60), filled: true, fillColor: Colors.white.withOpacity(0.15), border: OutlineInputBorder(borderRadius: BorderRadius.circular(30), borderSide: BorderSide.none), contentPadding: const EdgeInsets.symmetric(vertical: 0)),
                        style: const TextStyle(color: Colors.white),
                        onSubmitted: (val) {
                          if (val.toLowerCase().contains('doc')) {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => const DoctorsScreen()));
                          } else {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => const MedicinesScreen()));
                          }
                        },
                      ),
                    ),
                  ),
                ),

                // PROMOTIONAL BANNERS
                SliverToBoxAdapter(child: Column(children: [
                  SizedBox(height: 200, child: PageView(controller: _bannerController, onPageChanged: (i) => setState(() => _currentBanner = i), children: [
                    _promoBanner('\u{1F48A} 20% OFF on First Order', 'Use code: WELCOME20', const Color(0xFF2563EB), const Color(0xFF7C3AED)),
                    _promoBanner('\u{1FA7A} Free Doctor Consultation', 'Book now and get free first visit', const Color(0xFF10B981), const Color(0xFF059669)),
                    _promoBanner('\u{1F3E5} Health Checkup Packages', 'Starting from \u09F3999 only', const Color(0xFFF59E0B), const Color(0xFFEF4444)),
                  ])),
                  const SizedBox(height: 8),
                  Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(3, (i) => Container(margin: const EdgeInsets.symmetric(horizontal: 4), width: _currentBanner == i ? 24 : 8, height: 8, decoration: BoxDecoration(color: _currentBanner == i ? const Color(0xFF2563EB) : Colors.grey.shade300, borderRadius: BorderRadius.circular(4))))),
                  const SizedBox(height: 16),
                ])),

                // QUICK ACTIONS
                SliverToBoxAdapter(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
                  _quickActionBtn(Icons.local_hospital, 'Consult\nDoctor', const Color(0xFF2563EB), () => Navigator.push(context, MaterialPageRoute(builder: (_) => const DoctorsScreen()))),
                  _quickActionBtn(Icons.medication, 'Order\nMedicine', const Color(0xFF10B981), () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MedicinesScreen()))),
                  _quickActionBtn(Icons.psychology, 'Symptom\nCheck', const Color(0xFFF59E0B), () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SymptomCheckerScreen()))),
                  _quickActionBtn(Icons.receipt_long, 'My\nPrescriptions', const Color(0xFF8B5CF6), () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PrescriptionsScreen()))),
                ]))),
                const SliverToBoxAdapter(child: SizedBox(height: 24)),

                // CATEGORIES
                SliverToBoxAdapter(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    const Text('Categories', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    TextButton(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MedicinesScreen())), child: const Text('See All')),
                  ])),
                  const SizedBox(height: 8),
                  SizedBox(height: 44, child: ListView.builder(scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: 16), itemCount: _categories.length, itemBuilder: (_, i) => Padding(padding: const EdgeInsets.only(right: 8), child: ChoiceChip(label: Text(_categories[i]), selected: _selectedCategory == i, selectedColor: const Color(0xFF2563EB).withOpacity(0.1), onSelected: (_) => setState(() => _selectedCategory = i))))),
                  const SizedBox(height: 16),
                ])),

                // FEATURED PRODUCTS (Medicines Grid)
                SliverToBoxAdapter(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  const Text('Popular Medicines & Products', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  TextButton(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MedicinesScreen())), child: const Text('View All')),
                ]))),
                SliverPadding(padding: const EdgeInsets.symmetric(horizontal: 16), sliver: SliverGrid(gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: 0.65, crossAxisSpacing: 12, mainAxisSpacing: 12), delegate: SliverChildBuilderDelegate((_, i) {
                  if (i >= _medicines.length) return null;
                  final m = _medicines[i];
                  return _productCard(m);
                }, childCount: _medicines.length > 6 ? 6 : _medicines.length))),

                const SliverToBoxAdapter(child: SizedBox(height: 24)),

                // TOP DOCTORS
                SliverToBoxAdapter(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  const Text('Top Doctors', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  TextButton(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const DoctorsScreen())), child: const Text('See All')),
                ]))),
                SliverToBoxAdapter(child: SizedBox(height: 160, child: ListView.builder(scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: 16), itemCount: _doctors.length > 8 ? 8 : _doctors.length, itemBuilder: (_, i) => _doctorCard(_doctors[i])))),
                const SliverToBoxAdapter(child: SizedBox(height: 24)),

                // HEALTH PRODUCTS BANNER
                SliverToBoxAdapter(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Health & Wellness', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Row(children: [
                    Expanded(child: _healthProductCard('Medical Devices', 'Thermometers, BP monitors & more', Icons.devices, const Color(0xFF2563EB))),
                    const SizedBox(width: 12),
                    Expanded(child: _healthProductCard('Personal Care', 'Hygiene & skincare products', Icons.health_and_safety, const Color(0xFF10B981))),
                  ]),
                  const SizedBox(height: 12),
                  Row(children: [
                    Expanded(child: _healthProductCard('Baby Care', 'Baby health essentials', Icons.baby_changing_station, const Color(0xFFF59E0B))),
                    const SizedBox(width: 12),
                    Expanded(child: _healthProductCard('Fitness & Nutrition', 'Vitamins & supplements', Icons.fitness_center, const Color(0xFF8B5CF6))),
                  ]),
                  const SizedBox(height: 24),
                ])),

                // OFFERS SECTION
                SliverToBoxAdapter(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Special Offers', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFFEF4444), Color(0xFFF59E0B)]), borderRadius: BorderRadius.circular(16)),
                    child: const Row(children: [
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text('Flash Sale!', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                        SizedBox(height: 4),
                        Text('Up to 50% off on health products', style: TextStyle(color: Colors.white70, fontSize: 14)),
                        SizedBox(height: 12),
                        Text('SHOP NOW', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                      ])),
                      Icon(Icons.local_fire_department, color: Colors.white, size: 60),
                    ]),
                  ),
                  const SizedBox(height: 24),
                ])),

                // HEALTH TIPS
                SliverToBoxAdapter(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Health Tips', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  _tipCard('Stay Hydrated', 'Drink at least 8 glasses of water daily', const Color(0xFF3B82F6)),
                  const SizedBox(height: 8),
                  _tipCard('Regular Exercise', '30 minutes of daily activity keeps you fit', const Color(0xFF10B981)),
                  const SizedBox(height: 8),
                  _tipCard('Balanced Diet', 'Include fruits and vegetables in every meal', const Color(0xFFF59E0B)),
                  const SizedBox(height: 24),
                ]))),

                const SliverToBoxAdapter(child: SizedBox(height: 80)),
              ],
            ),
    );
  }

  Widget _promoBanner(String title, String subtitle, Color c1, Color c2) {
    return Container(margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8), padding: const EdgeInsets.all(20), decoration: BoxDecoration(gradient: LinearGradient(colors: [c1, c2]), borderRadius: BorderRadius.circular(16)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [Text(title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)), const SizedBox(height: 8), Text(subtitle, style: const TextStyle(color: Colors.white70, fontSize: 14))]));
  }

  Widget _quickActionBtn(IconData icon, String label, Color color, VoidCallback onTap) {
    return GestureDetector(onTap: onTap, child: Column(children: [Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(16)), child: Icon(icon, color: color, size: 24)), const SizedBox(height: 6), Text(label, textAlign: TextAlign.center, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.grey.shade700))]));
  }

  Widget _productCard(Medicine m) {
    return Container(decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 2))]), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Expanded(flex: 3, child: Container(decoration: BoxDecoration(color: const Color(0xFFF0F7FF), borderRadius: const BorderRadius.vertical(top: Radius.circular(16))), child: Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.medication, size: 40, color: const Color(0xFF2563EB).withOpacity(0.5)), const SizedBox(height: 4), Text(m.category, style: TextStyle(fontSize: 10, color: Colors.grey.shade500))])))),
      Expanded(flex: 2, child: Padding(padding: const EdgeInsets.all(10), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(m.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis), Text(m.genericName, style: TextStyle(fontSize: 10, color: Colors.grey.shade500), maxLines: 1, overflow: TextOverflow.ellipsis), const Spacer(), Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, crossAxisAlignment: CrossAxisAlignment.center, children: [Text('\u09F3${m.price.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF2563EB), fontSize: 15)), GestureDetector(onTap: () => _addToCart(m), child: Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: const Color(0xFF2563EB), borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.add, color: Colors.white, size: 16)))]))])),
      ),
    ]));
  }

  Widget _doctorCard(Doctor d) {
    return GestureDetector(onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => DoctorDetailScreen(doctor: d))), child: Container(width: 150, margin: const EdgeInsets.only(right: 12), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 2))]), child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Row(children: [CircleAvatar(radius: 20, backgroundColor: const Color(0xFF2563EB).withOpacity(0.1), child: Text(d.name.isNotEmpty ? d.name[0] : 'D', style: const TextStyle(color: Color(0xFF2563EB), fontWeight: FontWeight.bold))), const SizedBox(width: 8), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(d.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis), Text(d.specialization, style: TextStyle(fontSize: 10, color: Colors.grey.shade500), maxLines: 1, overflow: TextOverflow.ellipsis)])]), const Spacer(), Row(children: [const Icon(Icons.star, color: Colors.amber, size: 14), Text(' ${d.rating.toStringAsFixed(1)}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500))]), const SizedBox(height: 4), Row(children: [Text('\u09F3${d.consultationFee.toStringAsFixed(0)}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))), const Spacer(), Text('${d.experience}yr', style: TextStyle(fontSize: 10, color: Colors.grey.shade500))]), const SizedBox(height: 8), SizedBox(width: double.infinity, child: ElevatedButton(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => DoctorDetailScreen(doctor: d))), style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 6), textStyle: const TextStyle(fontSize: 11), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))), child: const Text('Book Now')))]))));
  }

  Widget _healthProductCard(String title, String subtitle, IconData icon, Color color) {
    return Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 2))]), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Icon(icon, color: color, size: 28), const SizedBox(height: 8), Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)), Text(subtitle, style: TextStyle(fontSize: 10, color: Colors.grey.shade500), maxLines: 2, overflow: TextOverflow.ellipsis)]));
  }

  Widget _tipCard(String title, String subtitle, Color color) {
    return Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE5E7EB))), child: Row(children: [Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)), child: Icon(Icons.lightbulb, color: color, size: 20)), const SizedBox(width: 16), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)), Text(subtitle, style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280)))]))]));
  }

  void _showCart() {
    showModalBottomSheet(context: context, isScrollControlled: true, backgroundColor: Colors.transparent, builder: (context) => Container(height: MediaQuery.of(context).size.height * 0.7, decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(20))), child: Column(children: [
      Container(margin: const EdgeInsets.symmetric(vertical: 12), width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2))),
      Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const Text('My Cart', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)), Text('${_cart.fold(0, (sum, item) => sum + (item['qty'] as int))} items', style: TextStyle(color: Colors.grey.shade600))])),
      const Divider(),
      Expanded(child: _cart.isEmpty ? const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.shopping_cart_outlined, size: 64, color: Colors.grey), SizedBox(height: 16), Text('Your cart is empty', style: TextStyle(fontSize: 16, color: Colors.grey))])) : ListView.builder(padding: const EdgeInsets.all(16), itemCount: _cart.length, itemBuilder: (_, i) => Card(margin: const EdgeInsets.only(bottom: 8), child: ListTile(leading: const Icon(Icons.medication, color: Color(0xFF2563EB)), title: Text(_cart[i]['name'], style: const TextStyle(fontWeight: FontWeight.w600)), subtitle: Text('\u09F3${(_cart[i]['price'] as double).toStringAsFixed(0)} x ${_cart[i]['qty']}'), trailing: Text('\u09F3${((_cart[i]['price'] as double) * (_cart[i]['qty'] as int)).toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF2563EB))))))),
      if (_cart.isNotEmpty) Container(padding: const EdgeInsets.all(16), decoration: const BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -2))]), child: Column(children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const Text('Total', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)), Text('\u09F3${_cart.fold<double>(0, (sum, item) => sum + (item['price'] as double) * (item['qty'] as int)).toStringAsFixed(0)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)))]),
        const SizedBox(height: 12),
        SizedBox(width: double.infinity, child: ElevatedButton(onPressed: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Order placed successfully!'))), style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2563EB), padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))), child: const Text('Place Order', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)))),
      ])),
    ])));
  }
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
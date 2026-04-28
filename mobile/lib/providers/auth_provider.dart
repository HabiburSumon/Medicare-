import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class User {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? phone;
  final String? avatar;
  User({required this.id, required this.name, required this.email, required this.role, this.phone, this.avatar});
  factory User.fromJson(Map<String, dynamic> json) => User(
    id: json['_id'] ?? '', name: json['name'] ?? '', email: json['email'] ?? '',
    role: json['role'] ?? 'patient', phone: json['phone'], avatar: json['avatar'],
  );
}

class AuthProvider with ChangeNotifier {
  User? _user;
  bool _isLoading = true;
  String? _token;
  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null && _token != null;

  AuthProvider() { _checkAuth(); }

  Future<void> _checkAuth() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString('token');
      if (_token != null) {
        final response = await ApiService.get('/auth/me');
        _user = User.fromJson(response['data']);
      }
    } catch (_) { _user = null; _token = null; }
    _isLoading = false;
    notifyListeners();
  }

  Future<String?> login(String email, String password) async {
    try {
      final response = await ApiService.post('/auth/login', {'email': email, 'password': password});
      _token = response['data']['token'];
      _user = User.fromJson(response['data']['user']);
      await ApiService.saveToken(_token!);
      notifyListeners();
      return null;
    } catch (e) { return e.toString().replaceAll('Exception: ', ''); }
  }

  Future<String?> register(String name, String email, String password, String role) async {
    try {
      final response = await ApiService.post('/auth/register', {'name': name, 'email': email, 'password': password, 'role': role});
      _token = response['data']['token'];
      _user = User.fromJson(response['data']['user']);
      await ApiService.saveToken(_token!);
      notifyListeners();
      return null;
    } catch (e) { return e.toString().replaceAll('Exception: ', ''); }
  }

  Future<void> logout() async {
    _user = null; _token = null;
    await ApiService.clearToken();
    notifyListeners();
  }
}
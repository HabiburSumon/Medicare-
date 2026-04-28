import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

class ApiService {
  static String get baseUrl => ApiConfig.baseUrl;

  static Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  static Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  static Map<String, String> _headers([String? token]) => {
    'Content-Type': 'application/json',
    if (token != null) 'Authorization': 'Bearer $token',
  };

  static Future<Map<String, dynamic>> get(String path, {Map<String, dynamic>? queryParameters}) async {
    final token = await _getToken();
    Uri url = Uri.parse('$baseUrl$path');
    if (queryParameters != null) {
      url = url.replace(queryParameters: queryParameters.map((k, v) => MapEntry(k, v.toString())));
    }
    final response = await http.get(url, headers: _headers(token));
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> post(String path, Map<String, dynamic> data) async {
    final token = await _getToken();
    final response = await http.post(Uri.parse('$baseUrl$path'), headers: _headers(token), body: jsonEncode(data));
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> put(String path, Map<String, dynamic> data) async {
    final token = await _getToken();
    final response = await http.put(Uri.parse('$baseUrl$path'), headers: _headers(token), body: jsonEncode(data));
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> delete(String path) async {
    final token = await _getToken();
    final response = await http.delete(Uri.parse('$baseUrl$path'), headers: _headers(token));
    return _handleResponse(response);
  }

  static Map<String, dynamic> _handleResponse(http.Response response) {
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    }
    throw Exception(data['message'] ?? 'Something went wrong');
  }
}
class ApiConfig {
  static const String baseUrl = 'http://10.0.2.2:5000/api/v1';
  static const String serverUrl = 'http://10.0.2.2:5000';
  // For physical device use: http://192.168.x.x:5000/api/v1

  /// HTTP headers to include with image requests to avoid 403 errors
  /// from external hosts that block hotlinking.
  static const Map<String, String> imageHeaders = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
  };

  /// Builds a full URL from a relative path returned by the API.
  /// Handles already-absolute URLs, null values, and relative paths.
  static String? buildImageUrl(String? path) {
    if (path == null || path.isEmpty) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return '$serverUrl$path';
  }
}

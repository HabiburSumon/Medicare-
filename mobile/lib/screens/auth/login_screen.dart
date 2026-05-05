import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import 'register_screen.dart';
import '../home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with TickerProviderStateMixin {
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _emailFocus = FocusNode();
  final _passwordFocus = FocusNode();
  bool _loading = false;
  String? _error;
  bool _obscurePassword = true;
  bool _rememberMe = false;
  bool _emailHasFocus = false;
  bool _passwordHasFocus = false;

  late AnimationController _animController;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _fadeAnim = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeInOut),
    );
    _slideAnim = Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero)
        .animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
    );

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);
    _pulseAnim =
        Tween<double>(begin: 1.0, end: 1.08).animate(_pulseController);

    _emailFocus.addListener(() {
      setState(() => _emailHasFocus = _emailFocus.hasFocus);
    });
    _passwordFocus.addListener(() {
      setState(() => _passwordHasFocus = _passwordFocus.hasFocus);
    });

    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    _pulseController.dispose();
    _emailFocus.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final error = await auth.login(_email.text.trim(), _password.text);
    if (!mounted) return;
    if (error != null) {
      setState(() {
        _error = error;
        _loading = false;
      });
      _shakeError();
    } else {
      Navigator.pushReplacement(
          context, MaterialPageRoute(builder: (_) => const HomeScreen()));
    }
  }

  void _shakeError() {
    // Simple visual feedback for error
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isDesktop = width > 1024;
    final isTablet = width >= 600 && width <= 1024;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              const Color(0xFFEFF6FF),
              const Color(0xFFF0FDF4),
              const Color(0xFFFFFBEB),
              const Color(0xFFFDF2F8),
            ],
          ),
        ),
        child: SafeArea(
          child: isDesktop || isTablet
              ? _buildTabletDesktopLayout(isDesktop)
              : _buildMobileLayout(),
        ),
      ),
    );
  }

  // ==================== MOBILE LAYOUT ====================

  Widget _buildMobileLayout() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: FadeTransition(
            opacity: _fadeAnim,
            child: SlideTransition(
              position: _slideAnim,
              child: Column(
                children: [
                  // Decorative top circles
                  _buildDecorativeHeader(),
                  const SizedBox(height: 24),
                  _buildLogoSection(),
                  const SizedBox(height: 32),
                  _buildFormCard(),
                  const SizedBox(height: 20),
                  _buildSocialLogin(),
                  const SizedBox(height: 20),
                  _buildSignUpLink(),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  // ==================== TABLET / DESKTOP LAYOUT ====================

  Widget _buildTabletDesktopLayout(bool isDesktop) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 1200),
        child: FadeTransition(
          opacity: _fadeAnim,
          child: Row(
            children: [
              Expanded(
                flex: isDesktop ? 6 : 5,
                child: _buildSidebar(isDesktop),
              ),
              const SizedBox(width: 24),
              Expanded(
                flex: isDesktop ? 6 : 7,
                child: SlideTransition(
                  position: _slideAnim,
                  child: _buildFormContent(isDesktop),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ==================== DECORATIVE HEADER (Mobile) ====================

  Widget _buildDecorativeHeader() {
    return SizedBox(
      height: 80,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Floating decorative circles
          Positioned(
            left: 20,
            top: 10,
            child: _floatingCircle(
                28, AppTheme.primary.withValues(alpha: 0.1), Icons.favorite, AppTheme.primary.withValues(alpha: 0.3)),
          ),
          Positioned(
            right: 30,
            top: 5,
            child: _floatingCircle(
                22, AppTheme.secondary.withValues(alpha: 0.1), Icons.eco, AppTheme.secondary.withValues(alpha: 0.3)),
          ),
          Positioned(
            left: 80,
            top: 45,
            child: _floatingCircle(
                16, AppTheme.accent.withValues(alpha: 0.1), Icons.star, AppTheme.accent.withValues(alpha: 0.3)),
          ),
          Positioned(
            right: 80,
            bottom: 5,
            child: _floatingCircle(
                20, const Color(0xFF8B5CF6).withValues(alpha: 0.1), Icons.health_and_safety, const Color(0xFF8B5CF6).withValues(alpha: 0.3)),
          ),
          // Center logo
          ScaleTransition(
            scale: _pulseAnim,
            child: _buildMainLogo(),
          ),
        ],
      ),
    );
  }

  Widget _floatingCircle(
      double size, Color bgColor, IconData icon, Color iconColor) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: bgColor,
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: iconColor, size: size * 0.5),
    );
  }

  Widget _buildMainLogo() {
    return Container(
      width: 72,
      height: 72,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppTheme.primary, Color(0xFF7C3AED)],
        ),
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: const Icon(Icons.local_hospital, color: Colors.white, size: 36),
    );
  }

  // ==================== LOGO SECTION ====================

  Widget _buildLogoSection() {
    return Column(
      children: [
        ShaderMask(
          shaderCallback: (bounds) => const LinearGradient(
            colors: [AppTheme.primary, Color(0xFF7C3AED)],
          ).createShader(bounds),
          child: const Text(
            'MediCare+',
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                AppTheme.secondary.withValues(alpha: 0.1),
                AppTheme.accent.withValues(alpha: 0.1),
              ],
            ),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.favorite, color: Colors.pink.shade400, size: 14),
              const SizedBox(width: 6),
              Text(
                'Your Health, Our Priority',
                style: TextStyle(
                  color: Colors.purple.shade600,
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ==================== FORM CARD ====================

  Widget _buildFormCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withValues(alpha: 0.08),
            blurRadius: 40,
            offset: const Offset(0, 10),
          ),
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Greeting
            Row(
              children: [
                const Text('👋 ', style: TextStyle(fontSize: 24)),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Welcome Back!',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textDark,
                        ),
                      ),
                      Text(
                        'Sign in to your account',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey.shade500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Error banner
            _buildErrorBanner(),
            // Email field
            _buildAnimatedEmailField(),
            const SizedBox(height: 16),
            // Password field
            _buildAnimatedPasswordField(),
            const SizedBox(height: 12),
            // Remember me & Forgot password
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildRememberMe(),
                _buildForgotPassword(),
              ],
            ),
            const SizedBox(height: 24),
            // Sign in button
            _buildGradientSignInButton(),
          ],
        ),
      ),
    );
  }

  // ==================== ANIMATED INPUT FIELDS ====================

  Widget _buildAnimatedEmailField() {
    final isActive = _emailHasFocus || _email.text.isNotEmpty;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: isActive
            ? LinearGradient(
                colors: [
                  AppTheme.primary.withValues(alpha: 0.05),
                  const Color(0xFF7C3AED).withValues(alpha: 0.03),
                ],
              )
            : null,
      ),
      child: TextField(
        controller: _email,
        focusNode: _emailFocus,
        keyboardType: TextInputType.emailAddress,
        decoration: InputDecoration(
          labelText: 'Email Address',
          labelStyle: TextStyle(
            color: _emailHasFocus ? AppTheme.primary : AppTheme.textGray,
          ),
          prefixIcon: AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            child: Icon(
              Icons.email_outlined,
              color: _emailHasFocus ? AppTheme.primary : AppTheme.textLight,
            ),
          ),
          suffixIcon: _email.text.isNotEmpty
              ? const Icon(Icons.check_circle, color: AppTheme.secondary)
              : null,
          filled: true,
          fillColor: isActive
              ? AppTheme.primary.withValues(alpha: 0.04)
              : Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(
                color: _emailHasFocus
                    ? AppTheme.primary
                    : AppTheme.border,
                width: _emailHasFocus ? 2 : 1),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(
                color: _emailHasFocus
                    ? AppTheme.primary.withValues(alpha: 0.5)
                    : AppTheme.border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide:
                const BorderSide(color: AppTheme.primary, width: 2),
          ),
        ),
        onChanged: (_) => setState(() {}),
      ),
    );
  }

  Widget _buildAnimatedPasswordField() {
    final isActive = _passwordHasFocus || _password.text.isNotEmpty;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: isActive
            ? LinearGradient(
                colors: [
                  AppTheme.primary.withValues(alpha: 0.05),
                  const Color(0xFF7C3AED).withValues(alpha: 0.03),
                ],
              )
            : null,
      ),
      child: TextField(
        controller: _password,
        focusNode: _passwordFocus,
        obscureText: _obscurePassword,
        decoration: InputDecoration(
          labelText: 'Password',
          labelStyle: TextStyle(
            color: _passwordHasFocus ? AppTheme.primary : AppTheme.textGray,
          ),
          prefixIcon: Icon(
            Icons.lock_outline,
            color: _passwordHasFocus ? AppTheme.primary : AppTheme.textLight,
          ),
          suffixIcon: GestureDetector(
            onTap: () =>
                setState(() => _obscurePassword = !_obscurePassword),
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: Icon(
                _obscurePassword
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
                key: ValueKey(_obscurePassword),
                color: _passwordHasFocus ? AppTheme.primary : AppTheme.textLight,
              ),
            ),
          ),
          filled: true,
          fillColor: isActive
              ? AppTheme.primary.withValues(alpha: 0.04)
              : Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(
                color: _passwordHasFocus
                    ? AppTheme.primary
                    : AppTheme.border,
                width: _passwordHasFocus ? 2 : 1),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(
                color: _passwordHasFocus
                    ? AppTheme.primary.withValues(alpha: 0.5)
                    : AppTheme.border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide:
                const BorderSide(color: AppTheme.primary, width: 2),
          ),
        ),
        onChanged: (_) => setState(() {}),
      ),
    );
  }

  // ==================== REMEMBER ME ====================

  Widget _buildRememberMe() {
    return GestureDetector(
      onTap: () => setState(() => _rememberMe = !_rememberMe),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              color: _rememberMe ? AppTheme.primary : Colors.transparent,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(
                color: _rememberMe ? AppTheme.primary : AppTheme.border,
                width: 2,
              ),
            ),
            child: _rememberMe
                ? const Icon(Icons.check, color: Colors.white, size: 14)
                : null,
          ),
          const SizedBox(width: 8),
          Text(
            'Remember me',
            style: TextStyle(
              color: Colors.grey.shade600,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }

  // ==================== GRADIENT SIGN IN BUTTON ====================

  Widget _buildGradientSignInButton() {
    return Container(
      width: double.infinity,
      height: 54,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppTheme.primary, Color(0xFF7C3AED)],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: _loading ? null : _login,
          borderRadius: BorderRadius.circular(16),
          splashColor: Colors.white.withValues(alpha: 0.2),
          highlightColor: Colors.white.withValues(alpha: 0.1),
          child: Center(
            child: _loading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                        strokeWidth: 2.5, color: Colors.white),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'Sign In',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.arrow_forward,
                          color: Colors.white,
                          size: 18,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }

  // ==================== SOCIAL LOGIN ====================

  Widget _buildSocialLogin() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(child: Divider(color: Colors.grey.shade300)),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                'Or continue with',
                style: TextStyle(
                  color: Colors.grey.shade500,
                  fontSize: 13,
                ),
              ),
            ),
            Expanded(child: Divider(color: Colors.grey.shade300)),
          ],
        ),
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _socialButton(
              Colors.white,
              'G',
              Colors.red,
              'Google',
              () {},
            ),
            const SizedBox(width: 16),
            _socialButton(
              Colors.white,
              '',
              Colors.black,
              'Apple',
              () {},
              icon: Icons.apple,
            ),
            const SizedBox(width: 16),
            _socialButton(
              const Color(0xFF1877F2),
              'f',
              Colors.white,
              'Facebook',
              () {},
            ),
          ],
        ),
      ],
    );
  }

  Widget _socialButton(
    Color bgColor,
    String letter,
    Color textColor,
    String label,
    VoidCallback onTap, {
    IconData? icon,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
                color: Colors.grey.shade200,
                width: bgColor == Colors.white ? 1 : 0),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null)
                Icon(icon, color: textColor, size: 22)
              else
                Text(
                  letter,
                  style: TextStyle(
                    color: textColor,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              const SizedBox(width: 8),
              Text(
                label,
                style: TextStyle(
                  color: textColor,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ==================== SIDEBAR (Tablet/Desktop) ====================

  Widget _buildSidebar(bool isDesktop) {
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppTheme.primary,
            Color(0xFF4F46E5),
            Color(0xFF7C3AED),
            Color(0xFFEC4899),
          ],
          stops: [0.0, 0.3, 0.7, 1.0],
        ),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withValues(alpha: 0.3),
            blurRadius: 30,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Decorative floating shapes
          Positioned(
            top: 30,
            right: 30,
            child: _animatedBubble(60, Colors.white.withValues(alpha: 0.08)),
          ),
          Positioned(
            bottom: 80,
            right: 50,
            child: _animatedBubble(40, Colors.white.withValues(alpha: 0.06)),
          ),
          Positioned(
            top: 120,
            left: -20,
            child: _animatedBubble(80, Colors.white.withValues(alpha: 0.05)),
          ),
          Positioned(
            bottom: 30,
            left: 30,
            child: _animatedBubble(30, Colors.white.withValues(alpha: 0.1)),
          ),

          // Content
          Padding(
            padding: EdgeInsets.all(isDesktop ? 48 : 32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Logo
                Container(
                  width: isDesktop ? 72 : 56,
                  height: isDesktop ? 72 : 56,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                        color: Colors.white.withValues(alpha: 0.3)),
                  ),
                  child: const Icon(Icons.local_hospital,
                      color: Colors.white, size: 32),
                ),
                const SizedBox(height: 36),

                // App Name
                Text(
                  'MediCare+',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: isDesktop ? 42 : 30,
                    fontWeight: FontWeight.bold,
                    height: 1.1,
                  ),
                ),
                const SizedBox(height: 16),

                // Tagline
                Text(
                  'Your Health, Our Priority',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.85),
                    fontSize: isDesktop ? 18 : 15,
                  ),
                ),
                const SizedBox(height: 48),

                // Feature pills
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    _sidebarPill(Icons.favorite, 'Trusted by 10K+'),
                    _sidebarPill(Icons.star, '4.9 Rating'),
                    _sidebarPill(Icons.security, 'HIPAA Secure'),
                    _sidebarPill(Icons.access_time, '24/7 Support'),
                  ],
                ),
                const SizedBox(height: 32),

                // Testimonial card
                if (isDesktop) _buildTestimonialCard(),

                // Bottom feature tiles
                if (isDesktop) ...[
                  const SizedBox(height: 32),
                  Row(
                    children: [
                      _sidebarFeatureTile(
                          Icons.local_hospital, '500+', 'Doctors'),
                      const SizedBox(width: 12),
                      _sidebarFeatureTile(
                          Icons.psychology, 'AI', 'Symptom Check'),
                      const SizedBox(width: 12),
                      _sidebarFeatureTile(
                          Icons.medication, '1000+', 'Medicines'),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _animatedBubble(double size, Color color) {
    return ScaleTransition(
      scale: _pulseAnim,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
        ),
      ),
    );
  }

  Widget _sidebarPill(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(25),
        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.white, size: 16),
          const SizedBox(width: 8),
          Text(
            text,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.95),
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _sidebarFeatureTile(IconData icon, String value, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 18),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
        ),
        child: Column(
          children: [
            Icon(icon, color: Colors.white, size: 26),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              label,
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.8),
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTestimonialCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: List.generate(
              5,
              (_) => const Icon(Icons.star,
                  color: Color(0xFFF59E0B), size: 16),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '"Best telemedicine app I\'ve ever used. Quick appointments and great doctors!"',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.9),
              fontSize: 13,
              fontStyle: FontStyle.italic,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: Colors.white.withValues(alpha: 0.2),
                child: const Text('S', style: TextStyle(color: Colors.white)),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Sarah Johnson',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    'Patient since 2024',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.6),
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ==================== FORM CONTENT (Tablet/Desktop) ====================

  Widget _buildFormContent(bool isDesktop) {
    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(
        horizontal: isDesktop ? 64 : 48,
        vertical: 48,
      ),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Logo section
            Row(
              children: [
                _buildMainLogo(),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ShaderMask(
                      shaderCallback: (bounds) => const LinearGradient(
                        colors: [AppTheme.primary, Color(0xFF7C3AED)],
                      ).createShader(bounds),
                      child: const Text(
                        'MediCare+',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    Text(
                      'Telemedicine Platform',
                      style: TextStyle(
                        color: Colors.grey.shade500,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 40),
            const Text(
              'Welcome Back! 👋',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: AppTheme.textDark,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Sign in to access your health dashboard',
              style: TextStyle(
                fontSize: 15,
                color: Colors.grey.shade500,
              ),
            ),
            const SizedBox(height: 32),
            _buildErrorBanner(),
            _buildAnimatedEmailField(),
            const SizedBox(height: 16),
            _buildAnimatedPasswordField(),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildRememberMe(),
                _buildForgotPassword(),
              ],
            ),
            const SizedBox(height: 28),
            _buildGradientSignInButton(),
            const SizedBox(height: 28),
            _buildSocialLogin(),
            const SizedBox(height: 24),
            _buildSignUpLink(),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  // ==================== SHARED COMPONENTS ====================

  Widget _buildErrorBanner() {
    if (_error == null) return const SizedBox.shrink();
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Colors.red.shade50,
                Colors.orange.shade50,
              ],
            ),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
                color: Colors.red.shade200.withValues(alpha: 0.5)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.red.shade100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(Icons.error_outline,
                    color: Colors.red.shade600, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(_error!,
                    style: TextStyle(
                        color: Colors.red.shade700,
                        fontWeight: FontWeight.w500)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _buildForgotPassword() {
    return GestureDetector(
      onTap: () {
        // TODO: Navigate to forgot password
      },
      child: Text(
        'Forgot Password?',
        style: TextStyle(
          color: AppTheme.primary,
          fontSize: 13,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildSignUpLink() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text("Don't have an account? ",
            style: TextStyle(color: Colors.grey.shade500)),
        GestureDetector(
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const RegisterScreen()),
          ),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: AppTheme.primary.withValues(alpha: 0.3),
                  width: 2,
                ),
              ),
            ),
            child: const Text(
              'Sign Up',
              style: TextStyle(
                color: AppTheme.primary,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
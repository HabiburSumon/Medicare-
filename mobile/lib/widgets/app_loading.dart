import 'package:flutter/material.dart';
import 'package:loading_animation_widget/loading_animation_widget.dart';

/// Shared Flickr-style loading indicator used across the app.
class AppLoading extends StatelessWidget {
  final double size;

  const AppLoading({super.key, this.size = 40});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: LoadingAnimationWidget.flickr(
        leftDotColor: const Color(0xFF2563EB),
        rightDotColor: const Color(0xFF7C3AED),
        size: size,
      ),
    );
  }
}

/// Inline small loading for buttons (no Center wrapper).
class AppLoadingInline extends StatelessWidget {
  final double size;
  final Color? color;

  const AppLoadingInline({super.key, this.size = 20, this.color});

  @override
  Widget build(BuildContext context) {
    return LoadingAnimationWidget.flickr(
      leftDotColor: color ?? Colors.white,
      rightDotColor: (color ?? Colors.white).withValues(alpha: 0.6),
      size: size,
    );
  }
}
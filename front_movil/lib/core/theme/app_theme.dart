import 'package:flutter/material.dart';

class AppColors {
  static const paper = Color(0xFFF7F9FC);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceSubtle = Color(0xFFF1F5FA);
  static const input = Color(0xFFF8FAFC);
  static const ink = Color(0xFF101B33);
  static const inkSecondary = Color(0xFF496584);
  static const muted = Color(0xFF5A6F8C);
  static const placeholder = Color(0xFF5D718E);
  static const line = Color(0xFF7A8EA8);
  static const lineStrong = Color(0xFF607896);
  static const accent = Color(0xFF0862DD);
  static const accentHover = Color(0xFF064FB8);
  static const accentSoft = Color(0xFFE9F2FF);
  static const focus = Color(0xFF79AEF4);
  static const success = Color(0xFF087965);
  static const successSoft = Color(0xFFDFF7EF);
  static const danger = Color(0xFFBA3B46);
  static const dangerSoft = Color(0xFFFFEDEF);
  static const warning = Color(0xFFA84313);
  static const warningSoft = Color(0xFFFFF1E7);
  static const navyPanel = Color(0xFF12234C);
}

ThemeData buildAppTheme() {
  final colorScheme =
      ColorScheme.fromSeed(
        seedColor: AppColors.accent,
        brightness: Brightness.light,
      ).copyWith(
        primary: AppColors.accent,
        onPrimary: Colors.white,
        secondary: AppColors.inkSecondary,
        onSecondary: Colors.white,
        surface: AppColors.surface,
        onSurface: AppColors.ink,
        error: AppColors.danger,
        onError: Colors.white,
      );

  final roundedShape = RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(14),
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: colorScheme,
    scaffoldBackgroundColor: AppColors.paper,
    visualDensity: VisualDensity.standard,
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.input,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      labelStyle: const TextStyle(
        color: AppColors.inkSecondary,
        fontWeight: FontWeight.w700,
      ),
      hintStyle: const TextStyle(color: AppColors.placeholder),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.line),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.line),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.accent, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.danger, width: 1.5),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.danger, width: 2),
      ),
      errorStyle: const TextStyle(
        color: AppColors.danger,
        fontWeight: FontWeight.w600,
        height: 1.35,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        minimumSize: const Size.fromHeight(54),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        backgroundColor: AppColors.accent,
        foregroundColor: Colors.white,
        disabledBackgroundColor: AppColors.accent.withValues(alpha: 0.45),
        disabledForegroundColor: Colors.white,
        elevation: 0,
        shape: roundedShape,
        textStyle: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.1,
        ),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        minimumSize: const Size.fromHeight(52),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        foregroundColor: AppColors.ink,
        side: const BorderSide(color: AppColors.line),
        shape: roundedShape,
        textStyle: const TextStyle(fontWeight: FontWeight.w700),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        minimumSize: const Size(48, 48),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        foregroundColor: AppColors.accent,
        textStyle: const TextStyle(fontWeight: FontWeight.w800),
      ),
    ),
    checkboxTheme: CheckboxThemeData(
      fillColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return AppColors.accent;
        }
        return AppColors.surface;
      }),
      checkColor: const WidgetStatePropertyAll(Colors.white),
      side: const BorderSide(color: AppColors.lineStrong, width: 1.5),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
    ),
    dividerTheme: const DividerThemeData(
      color: AppColors.line,
      thickness: 1,
      space: 1,
    ),
  );
}

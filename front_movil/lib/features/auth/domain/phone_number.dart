import 'auth_models.dart';

String toE164PhoneNumber(String rawValue, CountryCode country) {
  final digits = rawValue.replaceAll(RegExp(r'\D'), '');
  if (rawValue.trim().startsWith('+')) {
    if (digits.length < 8 || digits.length > 15) {
      throw const FormatException('Ingresa un número internacional válido.');
    }
    return '+$digits';
  }

  if (digits.startsWith(country.dialCode) &&
      digits.length == country.dialCode.length + country.nationalLength) {
    return '+$digits';
  }

  if (digits.length != country.nationalLength) {
    throw FormatException(
      'El número de ${country.label} debe tener ${country.nationalLength} dígitos.',
    );
  }

  return '+${country.dialCode}$digits';
}

String normalizeNationalPhoneInput(String rawValue, CountryCode country) {
  final digits = rawValue.replaceAll(RegExp(r'\D'), '');
  final fullLength = country.dialCode.length + country.nationalLength;
  if (digits.startsWith(country.dialCode) && digits.length == fullLength) {
    return digits.substring(country.dialCode.length);
  }

  return digits.length > country.nationalLength
      ? digits.substring(0, country.nationalLength)
      : digits;
}

String maskPhoneNumber(String phoneNumber) {
  final digits = phoneNumber.replaceAll(RegExp(r'\D'), '');
  if (digits.length < 5) {
    return 'tu teléfono registrado';
  }

  final visibleDigits = digits.substring(digits.length - 3);
  final prefixLength = digits.length > 10 ? 3 : 2;
  final prefix = digits.substring(0, prefixLength);
  return '+$prefix ••• ••• $visibleDigits';
}

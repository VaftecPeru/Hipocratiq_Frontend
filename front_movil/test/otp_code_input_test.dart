import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:front_movil/features/auth/presentation/widgets/auth_fields.dart';

void main() {
  testWidgets('accepts a six-digit autofill value', (tester) async {
    var value = '';
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: OtpCodeInput(
            value: value,
            onChanged: (nextValue) => value = nextValue,
          ),
        ),
      ),
    );

    await tester.enterText(find.byType(TextField).first, '123456');
    await tester.pump();

    expect(value, '123456');
  });
}

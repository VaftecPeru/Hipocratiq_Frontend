# HIPOCRATIQ Mobile

Aplicación Flutter de HIPOCRATIQ para Android e iOS. La versión móvil prioriza tareas rápidas y portables mientras la administración pesada permanece en la versión web.

## Alcance actual

- Autenticación OTP, recuperación de contraseña y sesiones seguras ligadas al dispositivo.
- Registro de paciente, médico, clínica y activación de recepción.
- Dashboard móvil conectado al mismo backend Laravel según rol:
  - Paciente: próximas citas, consultas, recetas activas y resultados.
  - Médico: agenda del día, pendientes, pacientes y consultas del mes.
  - Recepción: citas, pacientes, caja/saldos y actividad operativa.
  - Administrador de clínica: resumen móvil; configuración avanzada continúa en web.
- Navegación móvil Inicio / Actividad / Cuenta.
- Cierre de sesión por dispositivo o global.
- Launcher icon Android/iOS generado desde `assets/branding/hipocratiq-mark.webp`.
- Identificadores:
  - Android: `com.vaftec.hipocratiq`
  - iOS: `com.vaftec.hipocratiq`

## Ejecutar localmente

```bash
flutter pub get
dart run flutter_launcher_icons
flutter run \
  --dart-define=BACKEND_URL=https://hipocratiq.com/backend \
  --dart-define=SUPPORT_PORTAL_URL=https://hipocratiq.com
```

`BACKEND_URL` es obligatorio para consumir la API. En compilaciones release se rechazan endpoints HTTP sin TLS.

## Validación

```bash
dart format --output=none --set-exit-if-changed lib test
flutter analyze
flutter test
dart run flutter_launcher_icons
flutter build apk --debug --dart-define=BACKEND_URL=https://hipocratiq.com/backend
flutter build appbundle --debug --dart-define=BACKEND_URL=https://hipocratiq.com/backend
```

Para iOS:

```bash
flutter build ios --release --no-codesign \
  --dart-define=BACKEND_URL=https://hipocratiq.com/backend
```

El workflow `.github/workflows/mobile-ci.yml` ejecuta estas validaciones y publica artefactos temporales de CI para Android e iOS. La firma de producción y publicación en Google Play/App Store requieren las credenciales de las cuentas de tienda y se gestionan en la fase de release.

# HipocratiQ Mobile

Flutter mobile authentication for HipocratiQ. The current slice supports patient, doctor, clinic administrator, and receptionist access with OTP verification, secure device-bound tokens, registration drafts, password recovery, and a separate HTTPS support-portal handoff.

## Current flows

- Patient login and registration with deferred plan selection.
- Doctor registration for independent practice or an active clinic.
- Clinic registration with plan selection and OTP verification.
- Receptionist activation through a single-use clinic invitation.
- Password recovery through the registered phone; superadmin and support access remain web-only.

## Run locally

```bash
flutter pub get
flutter run --dart-define=BACKEND_URL=https://api.example.test --dart-define=SUPPORT_PORTAL_URL=https://support.example.test
```

`BACKEND_URL` is required for API calls. `SUPPORT_PORTAL_URL` must use HTTPS; when it is absent, the mobile app keeps the support action disabled instead of collecting support credentials.

## Validate

```bash
dart format lib test
flutter analyze
flutter test
flutter build apk --debug
```

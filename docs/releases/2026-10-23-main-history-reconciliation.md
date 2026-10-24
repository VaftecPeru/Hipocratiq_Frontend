# HIPOCRATIQ Frontend — Conciliación del historial y gates Web/Móvil

Fecha de corte: 2026-10-23. Documento de preparación; **NO autoriza publicación**.

## Historial verificado

- `develop` antes de este PR: `30002252a43e88eccc02d1ad61630db52851f149`.
- `main` sin cambios: `235bb34225e51f8e93b8aa134192d7e8971e1194`.
- El árbol `main` coincide con el ancestro común `ab17761eccb7d8c63c43479aa588bf3023f4073c` (árbol `461f98b2fc965d91c363321c64ceee66f1c1b7b6`).
- Hay 4 commits de release/merge exclusivos en `main`; **ninguno aporta diferencias de archivos respecto al ancestro común**.
- Esta rama conserva íntegro el árbol de `develop` más este documento y reconoce el historial de `main` mediante un merge con segundo padre.

## Gates del release Web

- [x] CI Web `develop` posterior al PR #75: run `#40041676938` SUCCESS.
- [x] Regresiones Node de autenticación, contexto de rol y flujo clínico añadidas al CI Web, 33 pruebas en PR #75.
- [ ] E2E con Next.js y API Laravel **reales**, PostgreSQL, Redis y HTTPS en entorno UAT aislado; sin datos médicos reales.
- [ ] Flujos por rol, expiración/revocación OTP, CSRF/CORS/Sanctum y aislamiento clínica A/B validados.
- [ ] Smoke Web en navegadores desktop/móvil, accesibilidad UX y aprobación del cliente.
- [ ] Protección `main` (revisión + checks obligatorios); GitHub indicó `protected=false`.
- [ ] Congelar SHAs de Backend/Frontend y validar despliegue/rollback sin cambio de base de datos inesperado.
- [ ] Autorización explícita para fusionar a `main` y despliegue AWS; este PR no realiza estas acciones.

## Gates del aplicativo Flutter

- [x] Mobile CI Android del PR #74: `#40038100731` SUCCESS; artifact de APK/AAB **debug no-UAT** con hash SHA-256.
- [ ] PR #74 permanece abierto, **sin autorización de merge**; no fusionar por este trabajo.
- [ ] Ejecutar QA de la app contra Backend HTTPS UAT real, OTP real en México y pruebas en dispositivos.
- [ ] Validar paquete firmado release (Android), política de distribución, iOS CI/UAT y aceptación antes de tiendas.

## Salvaguardas

Este documento y conciliación no cambian componentes React/Flutter, variables de producción, contenedores o datos clínicos. Los builds debug del PR #74 apuntan a un backend CI `.invalid`; no son aplicaciones aptas para UAT clínica ni publicación.

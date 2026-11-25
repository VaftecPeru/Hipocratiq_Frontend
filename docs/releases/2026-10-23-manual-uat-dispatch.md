# HIPOCRATIQ — UAT HTTPS manual con allowlist de GitHub

**Estado inicial: INACTIVO.** Este workflow no despliega infraestructura, no envía SMS y no modifica datos. Se activa únicamente por `workflow_dispatch` desde `develop`.

## 1. Antes de habilitar

El responsable de DevOps debe certificar por separado:

- Hostnames UAT/QA/staging y certificados TLS funcionales, no reutilizados de producción
- Infraestructura y volúmenes de PostgreSQL/Redis separados de los productivos, sin datos clínicos reales
- Backend Laravel y Frontend Next.js desplegados en UAT con SHAs registrados y API real conectada
- Grupo de seguridad, secretos, IAM/Instance Profile y dominios aislados de producción
- CORS con credenciales restringido al origen Frontend UAT exacto
- Backup previo y procedimiento de rollback documentados, sin tocar datos productivos

**No habilitar la prueba si alguna URL resuelve a infraestructura de producción**, aunque contenga la palabra `uat`.

## 2. Variables de GitHub

En el repositorio **Hipocratiq_Frontend**, configurar las variables (no secretos) dentro de Settings → Secrets and variables → Actions → Variables:

| Variable | Valor esperado |
|---|---|
| `HIPOCRATIQ_UAT_WEB_URL` | URL HTTPS exacta de Web UAT autorizada |
| `HIPOCRATIQ_UAT_API_URL` | URL HTTPS exacta del Backend UAT autorizado (opcional prefijo `/backend`) |
| `HIPOCRATIQ_UAT_READONLY_ENABLED` | `true` solo después de inspeccionar el entorno |

Los siguientes ejemplos ilustran formato **y no implican que los hosts existan**: `https://uat.hipocratiq.com/` y `https://api-uat.hipocratiq.com/backend`.

No colocar contraseñas, tokens, cookies, credenciales AWS ni datos de pacientes en variables o inputs.

## 3. Ejecución

Tras fusionar **mediante autorización independiente** el PR que incluye el workflow, y después de preparar el entorno UAT:

1. Ir a Actions → **UAT HTTPS approved endpoints (manual, read-only)**.
2. Elegir rama `develop`.
3. Introducir las URL aprobadas, exactamente iguales a las variables de GitHub.
4. Introducir `READ_ONLY_UAT_NO_PRODUCTION` en `acknowledgement`.
5. Ejecutar. El workflow primero valida URLs, rama y consentimiento; ante cualquier diferencia falla **antes de realizar solicitudes HTTP**.
6. Registrar el run ID, fecha, resultado y los SHAs del entorno UAT en la bitácora.

No se programan reintentos contra infraestructura externa ni se ejecutan pruebas autenticadas.

## 4. Cobertura

- HTTPS con certificado validado
- Portada Web Next.js (200 o redirección al mismo origen)
- Laravel `/api/health/live` y `/api/health/ready`, PostgreSQL/Redis/storage
- `401 UNAUTHENTICATED` para endpoints clínicos sin sesión
- CORS con credenciales: permite Web UAT, no refleja dominios externos ni `*`

El workflow **no hace POST**, no ejecuta OTP, no lee expedientes y no interviene AWS.

## 5. Gates pendientes antes de autorizar producción

- UAT E2E **autenticada** con Laravel + Next.js + PostgreSQL + Redis reales
- OTP SMS mexicano real +52 con proveedor e identidad autorizados, sin revelar OTP
- Multi-tenant clínica A/B, consentimientos, firma inmutable, auditoría y revocación
- Restauración de **copia de backup** en entorno aislado con evidencia verificada
- Protección de `main`, checks obligatorios y aprobación del cliente
- Revisión del runbook de rollback y autorización explícita de merge a `main` y deploy AWS

**Conclusión: este workflow representa solo un gate de disponibilidad HTTPS, no un GO de producción.**

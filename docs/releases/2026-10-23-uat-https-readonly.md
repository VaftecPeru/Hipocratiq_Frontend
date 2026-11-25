# HIPOCRATIQ — Gate HTTPS UAT de solo lectura

Fecha de corte: 2026-10-23. **NO autoriza despliegue ni uso de datos reales.**

## Precondiciones obligatorias

1. Backend Laravel desplegado en un hostname **UAT/QA/staging** con TLS válido, PostgreSQL 17 y Redis configurados. No usar la base de datos ni las credenciales de producción.
2. Frontend Next.js en otro hostname UAT/QA/staging con TLS válido y backend conectado a la instancia UAT.
3. El gateway o proxy debe enrutar /api/... al Laravel UAT, ya sea en el origen de API o mediante un prefijo opcional /backend.
4. Los hosts introducidos no deben ser dominios productivos (hipocratiq.com, www.hipocratiq.com, api.hipocratiq.com).
5. No reutilizar pacientes, OTP, SMS ni secretos de producción. Este gate no autentica usuarios.
6. Ejecutar desde un checkout QA aislado, no desde /srv/hipocratiq/frontend de producción.

## Ejecución de solo lectura

En un checkout QA Frontend, con Node.js 22 o posterior:

~~~bash
cd front_web
node --test tests/uat-https-guard.test.mjs

UAT_WEB_URL=https://uat.hipocratiq.com \
UAT_API_URL=https://api-uat.hipocratiq.com/backend \
node scripts/uat-https-readonly.mjs
~~~

Los dos hosts de ejemplo **no están confirmados ni provisionados**; reemplazar solo con hostnames UAT reales autorizados. El script no realiza solicitudes si la validación inicial de las URL falla.

### Cobertura

- TLS certificado validado por Node.js durante HTTPS, sin deshabilitar comprobaciones.
- Portada Web accesible mediante 200 o redirección al mismo origen.
- Endpoints Laravel /api/health/live y /api/health/ready; base de datos, Redis y almacenamiento ok.
- 401 UNAUTHENTICATED para /api/v1/auth/me y un recurso FHIR sin sesión.
- CORS con credenciales habilitado para el origen Web UAT y rechazado para origen desconocido.

### Restricciones de seguridad

- Sin POST de usuarios, sin OTP real, sin conexión a AWS SDK, sin migraciones, sin cambios de BD.
- Sin enviar contraseñas ni tokens; no incluir credenciales en las URL.
- Los logs solo deben registrar códigos HTTP y estados de paso/error, nunca cuerpos clínicos, cookies o datos de pacientes.
- Este gate **no sustituye** pruebas E2E autenticadas, tenants A/B, SMS México, restauración de respaldo de producción en copia aislada ni aceptación UAT del cliente.

## Evidencias exigidas para gate integral

1. SHA Backend/Frontend exactos desplegados en UAT y artefactos compilados.
2. Script HTTPS de solo lectura aprobado.
3. Escenarios OTP mexicano +52 autorizado y registro de errores de proveedor (sin guardar el código OTP).
4. Matriz clínica por rol y tenants A/B, consultas firmadas inmutables, consentimiento y privacidad.
5. Backup **de entorno UAT** restaurado y verificado en una segunda instancia.
6. Acta UAT cliente y aprobación de seguridad sin P0/P1.
7. Protección y checks obligatorios en main; autorización explícita separada para merge a main y despliegue AWS.

Mientras cualquiera de los puntos anteriores esté abierto, el estado de producción es **NO-GO**.

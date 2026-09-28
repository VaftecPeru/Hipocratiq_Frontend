# HIPOCRATIQ — Auditoría UX/UI contra Figma

**Fecha:** 2026-09-28  
**Rama:** `develop`  
**Figma:** `pdYmoMU4k0MnNz9MDYYTuV`  
**Página:** `0:1 Version web`

## Frames usados como referencia directa

### Autenticación
- Login / OTP: `466:35010`
- OTP: `466:35550`
- Confirmación: `466:35613`

### Médico
- Inicio: `466:23187`
- Agenda: `466:23864`
- Pacientes: `466:24445`
- Consultas: `466:25060`
- Recetas: `466:25701`
- Laboratorio: `466:26367`
- Imagenología: `466:27072`
- Telemedicina: `466:27698`
- Mensajes: `466:28355`
- Reportes: `466:28845`
- IA epidemiológica: `466:29554`
- Configuración: `466:30199`

### Paciente
- Mi panel: `466:30801`
- Mis citas: `466:31192`
- Resultados: `466:31882`
- Historial clínico: `466:32422`
- Recetas: `466:32876`
- IA epidemiológica: `466:33448`
- Membresía: `466:33914`
- Mi perfil: `466:34411`

### Recepción / Triaje
- Agenda recepción: `466:18287`
- Pacientes recepción: `466:18993`
- Citas: `466:19774`
- Registro pacientes: `466:20449`
- Caja/pagos: `466:21532`
- Emergencias médico: `466:37049`
- Emergencias recepción: `466:37304`
- Triaje paciente: `466:37600` y estados posteriores.

## Principios de implementación

1. Figma define jerarquía, composición, densidad, espaciado y lenguaje visual.
2. La implementación real conserva los flujos y restricciones del dominio.
3. No se reemplazan datos reales por contenido estático para replicar una maqueta.
4. No se muestran funciones clínicas no respaldadas por API.
5. No se presentan inferencias médicas automáticas donde el Backend solo almacena datos.
6. La accesibilidad y responsive prevalecen sobre una réplica rígida de píxeles.

## Mantenimiento aplicado

### Login
- distribución desktop ajustada a 40/60;
- panel clínico visual full-bleed;
- overlay de contraste;
- tarjeta de seguridad superpuesta;
- selección por rol, email/teléfono, OTP y accesibilidad conservados;
- se eliminó lenguaje que pudiera implicar una certificación no demostrada.

### Consultas médico
- título/subtítulo alineados con Figma;
- acciones `Nueva Consulta` y `Ver historial`;
- métricas: consultas hoy, en curso, finalizadas y pendientes;
- proporción de columnas cercana al diseño;
- bloque `Paciente actual`;
- edad, sexo, código de paciente y clínica;
- última evolución disponible;
- historial navegable;
- formulario clínico existente preservado;
- terminología clínica estructurada integrada.

### Paciente
- marca MEDIQ sustituida por HIPOCRATIQ;
- dashboard con próxima cita hero;
- estado clínico presentado sin inferir normalidad/enfermedad;
- resultados recientes;
- recetas activas;
- módulo IA/privacidad;
- accesos rápidos;
- historial convertido a línea de tiempo;
- filtros por tipo y año;
- métricas de consultas, diagnósticos y especialidades;
- Documentos se mantiene vacío hasta existir almacenamiento real.

## Coherencia Web / Mobile

Los clientes no duplican reglas clínicas. Backend sigue siendo fuente de verdad.

Web y Flutter consumen:

- identidad;
- contexto de actor;
- citas;
- historia;
- recetas;
- laboratorio;
- consentimientos.

Los consentimientos del paciente se exponen también en Mobile con el mismo contrato del Backend.

## Estado de validación

El candidato solo se considera UX-ready cuando:

- TypeScript pasa;
- regresiones clínicas pasan;
- ESLint pasa;
- Next build pasa;
- Docker build pasa;
- E2E por rol pasa;
- Flutter format/analyze/test pasa;
- Android APK/AAB compilan;
- iOS release sin firma compila.

El reporte final debe registrar los run IDs verdes antes de solicitar merge a `main`.

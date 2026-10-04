# Auditoría UX/UI HIPOCRATIQ — 28/09/2026

## Objetivo

Revisar coherencia visual, accesibilidad y continuidad de experiencia en Web y Mobile, tomando como referencia la línea visual ya derivada del prototipo de Figma y consolidada en el repositorio.

> Nota de verificación: en el contexto técnico actual no existe un `fileKey + node-id` de Figma disponible para una comparación píxel-a-píxel. No se inventan medidas. Se mantienen como fuente de verdad los tokens, componentes y ajustes previamente alineados al prototipo que ya existen en `develop`.

## 1. Sistema visual existente

La plataforma dispone de tokens consistentes para:
- superficies;
- canvas;
- texto principal/secundario;
- bordes;
- accent;
- focus;
- success;
- warning;
- danger;
- violet;
- dark mode.

Web y Flutter comparten el mismo lenguaje cromático principal:
- navy/ink;
- azul HIPOCRATIQ;
- fondos clínicos claros;
- estados semánticos;
- componentes redondeados;
- densidad compacta orientada a operación clínica.

## 2. Experiencia por rol

### Superadministrador
Objetivo: alta densidad operativa y gestión SaaS.

Estado:
- sidebar compacto;
- búsqueda global;
- notificaciones;
- preferencias;
- gestión de clínicas, usuarios, permisos, membresías, auditoría, monitoreo y soporte.

Criterio UX:
mantener mayor densidad que los roles clínicos porque el trabajo es administrativo y de supervisión.

### Administrador / Recepción de clínica
Objetivo: operación diaria.

Estado:
- agenda;
- pacientes;
- médicos/equipo;
- caja/facturación;
- reportes;
- configuración;
- navegación móvil accesible con focus trap.

Criterio UX:
acciones frecuentes deben conservar touch targets amplios y contexto visible de clínica.

### Médico
Objetivo: atención clínica con mínima fricción.

Estado:
- dashboard;
- agenda;
- pacientes;
- consulta;
- receta;
- laboratorio;
- telemedicina;
- mensajería;
- epidemiología;
- configuración.

Mejoras incorporadas:
- shell alineado a geometría del prototipo;
- navegación móvil accesible;
- consulta clínica estructurada;
- editor de terminología;
- estados firmados/cancelados de solo lectura.

### Paciente
Objetivo: comprensión y confianza.

Estado:
- dashboard;
- citas;
- triaje;
- resultados;
- historia;
- recetas;
- perfil;
- consentimiento.

Mejoras incorporadas:
- dashboard alineado al prototipo;
- historial convertido en línea de tiempo;
- branding unificado;
- conceptos clínicos codificados visibles;
- consentimiento versionado;
- feedback de éxito/error;
- botones con estado semántico y accesible.

### Mobile
Objetivo: tareas rápidas y portabilidad.

Estado:
- autenticación;
- OTP;
- registro;
- recuperación;
- workspace por rol;
- actividad;
- cuenta y seguridad;
- consentimientos para paciente.

Criterio UX:
la administración pesada continúa en Web; Mobile prioriza lectura, confirmación, acciones rápidas y notificaciones.

## 3. Accesibilidad

Implementado:
- focus visible;
- skip link Web;
- navegación por teclado;
- focus trap en drawers;
- Escape para cierre;
- `prefers-reduced-motion`;
- contraste verificado en pruebas Flutter;
- touch targets de autenticación;
- feedback con `aria-live` / live regions;
- estados busy/pressed en controles de consentimiento.

Pendiente:
- auditoría WCAG completa con herramienta automática y revisión manual;
- validar zoom 200–400% en pantallas operativas complejas;
- validar VoiceOver/TalkBack en release candidate.

## 4. Consistencia

No se recomienda forzar una única geometría para todos los roles.

La consistencia debe estar en:
- tokens;
- jerarquía tipográfica;
- patrones de foco;
- botones;
- inputs;
- estados;
- feedback;
- iconografía;
- accesibilidad;
- nomenclatura.

La densidad puede variar:
- Superadmin: compacta.
- Clínica: operativa.
- Médico: clínica.
- Paciente: comprensible.
- Mobile: táctil y resumida.

## 5. Hallazgos

### P0
- CI de GitHub Actions actualmente no inicia pasos en los jobs recientes. Debe resolverse antes de certificar la implementación.

### P1
- falta verificación píxel-a-píxel contra un node concreto de Figma;
- falta prueba E2E específica del flujo de consentimiento;
- falta auditoría automática de accesibilidad en CI.

### P2
- consolidar documentación del design system;
- formalizar tokens de spacing/radius/geometry además de color;
- incorporar captura visual regression cuando exista un baseline oficial de Figma.

## 6. Criterios UX para release

Antes de merge a `main`:
- ningún flujo crítico termina en una ruta muerta;
- estados loading/empty/error/success disponibles;
- acciones destructivas diferenciadas;
- formulario clínico firmado queda read-only;
- navegación móvil usable con teclado;
- touch targets Mobile >= 44dp cuando aplique;
- errores no dependen solo del color;
- consentimiento muestra política vigente;
- Web y Mobile reflejan el mismo estado de consentimiento;
- responsive validado en móvil/tablet/escritorio;
- E2E de roles verde.

## 7. Prototipo Figma

Las mejoras existentes de login, dashboard paciente, historia clínica y shell médico se conservan.

Cuando exista un enlace Figma con `node-id` concreto, el procedimiento de cierre visual será:
1. obtener design context y screenshot;
2. comparar pantalla implementada;
3. corregir únicamente diferencias in-scope;
4. verificar assets;
5. ejecutar build/E2E;
6. registrar evidencia visual.

Hasta entonces no se introducirán medidas visuales inventadas.

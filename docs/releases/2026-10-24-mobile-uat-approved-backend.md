# HIPOCRATIQ — Gate Mobile UAT sin confundir entornos

**Estado de este cambio: PR hacia develop, sin release ni despliegue.**

## Problema corregido
El workflow Mobile CI anterior aceptaba cualquier URL HTTPS con la palabra uat/qa/staging en su hostname para una compilación manual. Eso no verificaba autorización ni identidad del entorno, y permitía apuntar una app de pruebas a un servidor no aprobado.

## Nueva política (Android e iOS)
1. En PR/push se compilan únicamente builds QA con URL ficticia `https://hipocratiq-ci.invalid/backend`, sin acceso clínico.
2. Para `workflow_dispatch`, ejecutar exclusivamente desde `develop`.
3. El administrador habilita GitHub Actions Variables:
   - `HIPOCRATIQ_UAT_API_URL`: URL HTTPS **exacta** del Backend UAT verificado, opcionalmente con `/backend`.
   - `HIPOCRATIQ_UAT_MOBILE_BUILD_ENABLED=true`: habilitar solo cuando la infraestructura UAT separada está comprobada.
4. En el disparo manual introducir `uat_backend_url` con el mismo destino autorizado y la confirmación literal `APPROVED_MOBILE_UAT_NO_PRODUCTION`.
5. `front_movil/tool/resolve_backend.py` verifica sin conectar a la red que la URL es HTTPS, no contiene credenciales, tokens o rutas extrañas, lleva etiqueta UAT/QA/staging y **coincide con la lista autorizada**.
6. Ejecuta tests de seguridad antes de resolver el destino. La regla se aplica por igual a Android y iOS.
7. Sólo después de verificar el backend UAT **real**, grabar SHA de la app y ejecutar UAT sobre dispositivo(s); las builds actuales son debug/no-UAT.

## Prohibiciones
- No usar dominios o instancias de producción, cuentas o bases clínicas productivas ni números OTP reales sin consentimiento.
- No insertar contraseñas, tokens o secretos en URL ni en GitHub Actions.
- No firmar ni publicar Android/iOS por el solo hecho de pasar el CI.
- No declarar UAT aprobada hasta que Laravel+Next.js+PostgreSQL+Redis+OTP México hayan sido probados con datos sintéticos.

## Pruebas estáticas
```bash
python3 -m unittest discover -s front_movil/tool -p 'test_resolve_backend.py' -v
```

**Para llegar a main:** exigir 0 P0/P1 pendientes en matriz de 36 escenarios clínicos, inventario AWS UAT realmente ejecutado, protección main, backup/rollback ensayado, aceptación del cliente y GO por separado.

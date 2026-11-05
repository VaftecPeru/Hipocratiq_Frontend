# HIPOCRATIQ Frontend — controles automatizados P0 #102

Este PR agrega a Frontend comprobaciones para detectar credenciales versionadas, Gitleaks en los commits introducidos por cada pull request y npm audit del lock de producción. Los comandos no imprimen candidatos sensibles ni publican reportes del escáner.

La imagen Gitleaks de código abierto está fijada por digest SHA-256 para evitar versiones cambiantes. El análisis Git usa el ancestro común con la rama base; un error o un hallazgo impide aprobar el job sin publicar valores ni rutas. El análisis histórico del Frontend y los metadatos de GitHub Actions se siguen gestionando en sus flujos existentes. Este PR no lee contenido de artifacts ni usa tokens con permisos adicionales.

No implica ausencia de fugas históricas, rotación de secretos, aceptación de Seguridad o validación clínica. P0 Backend #102 y #92 siguen abiertos; no se modifica `main`, infraestructura ni reglas de publicación. La incorporación del job como check obligatorio exige validación del CI y configuración administrativa en GitHub.

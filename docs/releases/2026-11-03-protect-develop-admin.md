# HIPOCRATIQ Frontend — Protección administrativa de develop

Estado verificado: GitHub API informa protected=false para Frontend develop (03/11/2026). El Ruleset actual de main (ID 25993903) está activo y dirigido solamente a refs/heads/main. **Este PR NO aplica la política a GitHub**; prepara un contrato reproducible para que lo configure el administrador.

## Configuración exacta del administrador GitHub

1. Entrar a VaftecPeru/Hipocratiq_Frontend → Settings → Rules → Rulesets → New ruleset → New branch ruleset.
2. Nombre **HIPOCRATIQ-Frontend-Protect-Develop**. Enforcement **Active**. Rama objetivo exclusiva: **develop**. No modificar el Ruleset de main.
3. Prohibir eliminación y force-push. Requerir pull request, 1 aprobación independiente, descartar revisiones obsoletas después de nuevos commits y resolver conversaciones.
4. Requerir status checks actualizados con develop: **Frontend CI** y **Frontend E2E role routing**, del GitHub Actions App (integration ID 15368). Ambos finalizaron SUCCESS en Frontend SHA 85dfb5ea2b164fe18aa7620d939cd1242460e159. No exigir como check de develop la prueba Frontend release NO-GO evidence: está diseñada para fallar hasta cerrar los P0.
5. Sin actores con bypass. No permitir forzar commits para integrar PRs. Confirmar la regla activa y guardar.

Archivo para revisión administrativa: infra/github/frontend-develop-ruleset.json. Es una propuesta de API, no una ejecución. **No introducir PAT de administración en secretos de una rama desprotegida** ni disparar workflows de PR con privilegios administrativos.

## Validación posterior a la aplicación

- GET https://api.github.com/repos/VaftecPeru/Hipocratiq_Frontend/branches/develop devuelve protected=true.
- GET https://api.github.com/repos/VaftecPeru/Hipocratiq_Frontend/rulesets muestra nuevo ruleset ACTIVE con refs/heads/develop, sin bypass y ambos checks.
- Revisar el siguiente PR contra develop para comprobar required checks y revisión independiente. No intentar force-push como prueba.
- Adjuntar enlace y evidencia saneada en issue #94: https://github.com/VaftecPeru/Hipocratiq_Frontend/issues/94. Cerrar solo después de comprobar protección efectiva.

## Intervención administrativa AWS

Backend PR #155 ya integrado incluyó infra/aws/prod-readonly-oidc-role.json y docs/releases/2026-11-03-github-aws-oidc-admin-approval.md.

Administrador AWS debe aprobar y crear el rol HIPOCRATIQ-PROD-ReadOnly con OIDC temporal; administrador GitHub debe configurar hipocratiq-prod-readonly con revisores y restricción a develop protegido antes de habilitar flags de inventario. Validar cuenta, región, EC2 y VPC con evidencia real. Solo Describe EC2/EBS/snapshots/SSM; sin despliegues, SSH, backups/restores ni datos clínicos. No confundir plantilla de Git con rol realmente creado.

**NO-GO de main:** seguridad histórica #102 exige revisión privada y rotación pertinente; clínica #92 requiere aceptación real de 36 casos; recuperación #113 requiere ensayo aislado real, diferido; entorno UAT independiente #111 requiere decisión cliente. No modificar main o producción.

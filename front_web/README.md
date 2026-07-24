# Hipocratiq Web

Frontend Next.js para el registro y autenticación de clínicas, médicos y pacientes, conectado al backend Laravel de [back_api](../back_api/README.md).

## Requisitos

- Node.js LTS y npm.
- Backend Laravel disponible en `http://127.0.0.1:8000`.
- PostgreSQL y Redis levantados por el backend.

## Inicio local

Desde `front_web`:

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

La aplicación queda en `http://localhost:3000`.

En otra terminal, inicia el backend desde `back_api`:

```powershell
docker compose up -d
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

## Variables de entorno

`.env.example` contiene los valores locales. Las variables principales son:

| Variable | Uso |
| --- | --- |
| `BACKEND_URL` | URL interna del backend para llamadas server-side |
| `APP_URL` | URL pública local de Next.js |
| `NEXT_PUBLIC_API_URL` | URL pública usada por despliegues que no pasan por el proxy local |
| `NEXT_PUBLIC_APP_URL` | URL pública del frontend |

El cliente del navegador usa el proxy `/backend`, definido en el flujo de Next.js, para mantener cookies y CSRF en el mismo origen. No pongas credenciales Twilio, Redis ni `APP_KEY` en variables `NEXT_PUBLIC_*`.

## Autenticación y CSRF

Las peticiones web se realizan con `credentials: include`:

1. Se solicita `/backend/sanctum/csrf-cookie`.
2. Se conserva la cookie `XSRF-TOKEN` y la cookie de sesión.
3. Cada `POST` envía `X-XSRF-TOKEN`.

Una respuesta `419` indica que el token CSRF expiró; el cliente debe solicitarlo de nuevo. Una respuesta `429` incluye `Retry-After` y se muestra como espera al usuario.

## Flujos de registro

- Clínica administradora: datos de clínica y administrador → plan → OTP.
- Médico de clínica: datos profesionales → clínica activa con cobertura → OTP.
- Médico independiente: datos profesionales → plan obligatorio → OTP.
- Paciente: clínica activa obligatoria → OTP → selección de plan diferida a otro apartado.

Los OTP expiran en 5 minutos, permiten 5 reenvíos y requieren 60 segundos entre reenvíos. El backend es la fuente de verdad para esos valores.

La referencia de payloads, respuestas y límites está en [back_api/docs/API.md](../back_api/docs/API.md), y el contrato formal en [documentacion/openapi.yaml](../documentacion/openapi.yaml).

## Comandos

```powershell
npm run dev
npm run lint
npm run build
npm run start
```

Ejecuta `npm run build` antes de desplegar para detectar errores de TypeScript, rutas estáticas y variables de entorno ausentes.

## Producción

- Configura `BACKEND_URL` con la URL privada o interna del backend.
- Configura `APP_URL`, `NEXT_PUBLIC_APP_URL` y los dominios stateful/CORS equivalentes en el backend.
- Sirve frontend y backend bajo HTTPS para que las cookies seguras funcionen.
- Nunca expongas secretos mediante `NEXT_PUBLIC_*`.

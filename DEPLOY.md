# VetFlow — Despliegue

## Variables de entorno del backend

Nuevas variables introducidas por la capa de autenticación. Configurarlas en Easypanel
antes de desplegar.

| Variable | Obligatoria | Valor | Para qué sirve |
|---|---|---|---|
| `JWT_SECRET_KEY` | **Sí** | cadena aleatoria larga | Firma los tokens de acceso. Si no se define, la API arranca igual pero genera una clave efímera y **todas las sesiones se cierran en cada reinicio**. |
| `JWT_EXPIRE_MINUTES` | No | `480` (por defecto) | Duración de la sesión en minutos. |
| `JWT_ALGORITHM` | No | `HS256` (por defecto) | Algoritmo de firma. |
| `CORS_ORIGINS` | Recomendada | `https://<dominio-del-frontend>` | Orígenes permitidos, separados por coma. Por defecto `*`. |
| `N8N_WEBHOOK_TOKEN` | Recomendada | cadena aleatoria larga | Secreto compartido con n8n para que el webhook rechace llamadas directas. Si queda vacío, el backend no envía la cabecera y n8n sigue funcionando como antes. |

Las que ya existían (`DATABASE_URL`, `N8N_WEBHOOK_URL`) no cambian.

### Generar las claves

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Ejecutarlo dos veces: una para `JWT_SECRET_KEY` y otra para `N8N_WEBHOOK_TOKEN`.
No reutilizar la misma cadena para ambas.

## Proteger el webhook de n8n

El backend envía el secreto en la cabecera `X-VetFlow-Token` de cada llamada al webhook.
Para que n8n rechace las llamadas que no vengan del backend, agregar un nodo **IF**
inmediatamente después del nodo `Webhook`, antes del `If` que detecta `"salir"`:

- **Condición:** `{{ $json.headers['x-vetflow-token'] }}` **igual a** el valor de `N8N_WEBHOOK_TOKEN`
- **Rama verdadera:** continúa al flujo actual (`If` de `"salir"`)
- **Rama falsa:** un nodo `Respond to Webhook` con `{ "respuesta": "No autorizado" }`

n8n normaliza los nombres de cabecera a minúsculas, por eso la expresión usa
`x-vetflow-token` y no `X-VetFlow-Token`.

Mientras `N8N_WEBHOOK_TOKEN` esté vacío en el backend, no agregar el nodo: la cabecera
no viaja y el IF rechazaría todo.

## Orden de despliegue

El backend y el frontend cambiaron a la vez y **no son compatibles con la versión
anterior del otro**. Hay que desplegar los dos juntos:

1. Configurar las variables de entorno.
2. Desplegar backend y frontend.
3. Agregar el nodo IF en n8n (si se configuró `N8N_WEBHOOK_TOKEN`).

## Después de desplegar

Todas las sesiones abiertas quedan invalidadas: el `sessionStorage` anterior no tiene
token. Cada usuario debe iniciar sesión una vez más. No hay cambios en la base de datos
y no hace falta ninguna migración.

## Esquema de la base de datos

El backend crea las tablas al iniciar (`Base.metadata.create_all`), salvo `citas`, que se
crea con SQL explícito en `main.py`. Sobre una base de datos nueva conviene revisar que
`citas` incluya las columnas que usa el workflow de n8n: `servicio`, `notas` y
`calendar_event_id`, además de `veterinario_id`.

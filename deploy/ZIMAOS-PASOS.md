# Qué hacer en el ZimaBlade (paso a paso)

El código ya está en GitHub. Falta: **imagen Docker publicada** → **correrla en el NAS**.

---

## Paso 0 — En la Mac (yo / vos): arreglar publish si falló

Si el workflow “Publish Docker image” falló, mergeá el fix del Dockerfile y esperá el check verde:

- GitHub → repo → pestaña **Actions** → workflow **Publish Docker image** → ✅ verde

Imagen esperada:

```text
ghcr.io/leandmartine/conoceme-aun-mas:latest
```

---

## Paso 1 — Hacer el package público (1 vez)

1. Abrí: https://github.com/leandmartine?tab=packages  
2. Click en **conoceme-aun-mas**  
3. **Package settings** (derecha)  
4. **Change visibility** → **Public** → confirmá  

(Si no aparece el package, el publish todavía no terminó OK.)

---

## Paso 2 — En el ZimaOS

### A) Si tenés SSH al NAS

```bash
# carpeta de la app (ajustá la ruta si ZimaOS usa otra)
mkdir -p /DATA/AppData/conoceme-aun-mas
cd /DATA/AppData/conoceme-aun-mas
```

Creá el archivo `docker-compose.yml`:

```yaml
services:
  web:
    image: ghcr.io/leandmartine/conoceme-aun-mas:latest
    container_name: conoceme-aun-mas
    restart: unless-stopped
    ports:
      - "8787:8787"
    environment:
      NODE_ENV: production
      HOST: 0.0.0.0
      PORT: 8787
      CONTENT_ROOT: /app/content
      STATIC_ROOT: /app/apps/frontend/dist
      CORS_ORIGIN: "*"
      PUBLIC_COMPANION_KEY: "cambia-esto-por-un-random"
```

Arrancá:

```bash
docker compose pull
docker compose up -d
docker ps | grep conoceme
curl -s http://127.0.0.1:8787/api/v1/health
```

### B) Si preferís la UI de ZimaOS (sin SSH)

1. Apps / Docker → **Install custom app** (o “Custom install”)  
2. **Image**: `ghcr.io/leandmartine/conoceme-aun-mas:latest`  
3. **Port**: host `8787` → container `8787`  
4. **Environment**:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `PORT` | `8787` |
| `CONTENT_ROOT` | `/app/content` |
| `STATIC_ROOT` | `/app/apps/frontend/dist` |
| `CORS_ORIGIN` | `*` |
| `PUBLIC_COMPANION_KEY` | un texto largo random |

5. Restart policy: **unless-stopped**  
6. Install / Start  

---

## Paso 3 — Abrir el sitio

En la Mac/celular (misma WiFi):

```text
http://IP_DEL_NAS:8787
```

La IP del NAS la ves en ZimaOS (Settings / Network), ej. `http://192.168.1.50:8787`.

Probar:

1. Carga la landing  
2. **Entrar al mundo**  
3. Botón **💬** companion  

---

## Paso 4 — Actualizar cuando cambies el código

Después de cada merge a `main` (Actions verde):

```bash
cd /DATA/AppData/conoceme-aun-mas
docker compose pull
docker compose up -d
```

En la UI: **Pull** imagen + **Restart** container.

---

## Si algo falla

| Síntoma | Qué mirar |
|---------|-----------|
| `pull access denied` | Package no es Public, o typo en el nombre de imagen |
| Puerto ocupado | Cambiá host port a `8788:8787` |
| Health no responde | `docker logs conoceme-aun-mas` |
| Companion no habla | Revisá `PUBLIC_COMPANION_KEY` en env del container |

```bash
docker logs --tail 80 conoceme-aun-mas
```

# Deploy — conoceme-aun-mas

## Recomendado ahora: NAS ZimaBlade + ZimaOS (Docker)

Sí, **podés hostearlo ahí**. El stack es **un solo container** (SPA + API + content). Encaja perfecto con ZimaOS.

| | |
|--|--|
| **Barato** | Sin free trial de la nube |
| **Se mantiene** | GitHub Actions construye la imagen → el NAS solo hace `pull` + restart |
| **Por qué no build en el NAS** | Compilar Node + Phaser en el ZimaBlade es lento y come RAM; mejor build en GitHub |

```text
Mac/PR → merge main → GHCR image :latest
                ↓
         ZimaOS: docker compose pull && up -d
                ↓
         http://IP_NAS:8787  (LAN)
         o Cloudflare Tunnel → HTTPS público
```

### 1. Una vez en GitHub (después de mergear esta config)

1. Merge a `main` → workflow **Publish Docker image** publica  
   `ghcr.io/leandmartine/conoceme-aun-mas:latest`
2. En GitHub → **Packages** → el package `conoceme-aun-mas` → **Package settings** →  
   **Change visibility** → **Public**  
   (así el NAS puede `pull` sin login; si preferís privado, usá un PAT en el NAS)

### 2. En el ZimaBlade (ZimaOS)

#### Opción A — Docker Compose en el NAS (recomendada)

1. Creá una carpeta, ej. `/DATA/AppData/conoceme-aun-mas/` (o donde ZimaOS guarde apps).
2. Copiá solo estos archivos del repo (o cloná el repo y usá la raíz):
   - `docker-compose.yml`
   - `.env` (desde `deploy/nas.env.example`)

```bash
# en el NAS (SSH o terminal de ZimaOS)
cd /ruta/conoceme-aun-mas
cp deploy/nas.env.example .env
# editá .env: PUBLIC_COMPANION_KEY y IMAGE
nano .env

docker compose pull
docker compose up -d

curl -s http://127.0.0.1:8787/api/v1/health
```

`.env` mínimo:

```env
IMAGE=ghcr.io/leandmartine/conoceme-aun-mas:latest
HOST_PORT=8787
PUBLIC_COMPANION_KEY=poné-un-random-largo
CORS_ORIGIN=*
```

#### Opción B — UI de ZimaOS / Docker

1. **App / Custom install** → image: `ghcr.io/leandmartine/conoceme-aun-mas:latest`
2. Port: `8787:8787`
3. Env:
   - `NODE_ENV=production`
   - `HOST=0.0.0.0`
   - `PORT=8787`
   - `CONTENT_ROOT=/app/content`
   - `STATIC_ROOT=/app/apps/frontend/dist`
   - `PUBLIC_COMPANION_KEY=…`
   - `CORS_ORIGIN=*`
4. Restart policy: **unless-stopped**

### 3. Acceso

| Dónde | URL |
|-------|-----|
| En tu casa (LAN) | `http://IP_DEL_ZIMABLADE:8787` |
| Fuera de casa | Ver §4 (túnel o puerto) |

### 4. Internet + HTTPS (elegí uno)

**A. Cloudflare Tunnel (recomendado en casa)**  
No abrís puertos del router. Instalás `cloudflared` en el NAS (app o container), apuntás al `http://web:8787` o `http://127.0.0.1:8787`, dominio gratis `*.trycloudflare.com` o tu dominio en Cloudflare.

**B. Port forward**  
Router → `8787` al NAS. Solo HTTP a menos que pongas Caddy/Nginx con Let’s Encrypt delante.

**C. Solo LAN / Tailscale**  
Ideal si el portfolio es para entrevistas desde tu red o VPN: `http://100.x.x.x:8787`.

### 5. Actualizar después de un merge

```bash
cd /ruta/conoceme-aun-mas
docker compose pull
docker compose up -d
```

O un cron semanal / botón en ZimaOS si preferís.

---

## Local (Mac) smoke

```bash
cp deploy/nas.env.example .env
# IMAGE vacío o conoceme-aun-mas:local + build
docker compose up -d --build
open http://localhost:8787
```

---

## Railway / nube (opcional)

Sigue en el historial del repo (`railway.toml`) si más adelante volvés a un PaaS de pago. Mismo Dockerfile.

---

## CI

| Workflow | Qué hace |
|----------|----------|
| `ci.yml` | typecheck + tests + build |
| `publish-image.yml` | push imagen a GHCR en cada push a `main` |

---

## Checklist go-live NAS

- [ ] Imagen en GHCR (`:latest`)  
- [ ] Package **public** (o login en el NAS)  
- [ ] Container `restart: unless-stopped`  
- [ ] `curl http://IP:8787/api/v1/health` → 200  
- [ ] Landing + mapa + 💬 companion  
- [ ] (Opcional) Cloudflare Tunnel / dominio  

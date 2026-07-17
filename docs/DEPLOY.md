# Deploy — conoceme-aun-mas

## Recomendado: Railway (fácil + se mantiene)

Un solo servicio con el **Dockerfile** del monorepo: SPA + API + `content/` same-origin.

| Por qué | |
|---------|--|
| Fácil | Conectar GitHub, setear 2–3 variables, Deploy |
| Se mantiene | Cada **merge a `main`** redeploy automático |
| Encaja | Ya tenés container production-ready |

### 1. Cuenta y proyecto

1. Entrá a [railway.app](https://railway.app) (login con GitHub).  
2. **New Project** → **Deploy from GitHub repo** → `leandmartine/conoceme-aun-mas`.  
3. Railway detecta `railway.toml` + `Dockerfile`.

### 2. Variables (Settings → Variables)

| Variable | Valor |
|----------|--------|
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `CONTENT_ROOT` | `/app/content` |
| `STATIC_ROOT` | `/app/apps/frontend/dist` |
| `CORS_ORIGIN` | `*` (same-origin SPA+API; o tu dominio HTTPS) |
| `PUBLIC_COMPANION_KEY` | string random (ej. `openssl rand -hex 16`) — el chat 💬 del juego la pide a `/ai/status` |
| `PORTFOLIO_API_KEYS` | opcional: keys extra privadas, comma-separated |
| `AI_RATE_LIMIT_MAX` | `30` (opcional) |

**No hace falta** `VITE_PORTFOLIO_API_KEY` en prod: el frontend toma `publicClientKey` del status en runtime.

`PORT` lo inyecta Railway solo — no lo fijes a menos que sepas por qué.

### 3. Dominio

1. **Settings → Networking → Generate Domain** → algo como `conoceme-aun-mas-production.up.railway.app`.  
2. (Opcional) Custom domain + DNS CNAME.  
3. Si usás dominio propio, podés poner `CORS_ORIGIN=https://tu-dominio.com`.

### 4. Verificar

```bash
curl -s https://TU-DOMINIO.up.railway.app/api/v1/health
curl -s https://TU-DOMINIO.up.railway.app/api/v1/ai/status
# Abrir el sitio → Entrar al mundo → 💬 companion
```

### 5. Flujo de mantenimiento

```text
branch → PR → merge a main → Railway rebuild + deploy
```

Cambios de content, arte o API se publican solos al mergear.

---

## Local Docker (smoke)

```bash
export PUBLIC_COMPANION_KEY=dev-local-key
export PORTFOLIO_API_KEYS=dev-local-key
docker compose up --build
# http://localhost:8787
```

## CI

GitHub Actions: typecheck + tests + build (no deploy). Deploy = Railway.

## Checklist go-live

- [ ] Health 200  
- [ ] Landing + mapa cargan  
- [ ] Companion 💬 responde (PUBLIC_COMPANION_KEY)  
- [ ] Media `/media/leandro.jpg` y favicon  
- [ ] Rate limit no se abusa en 1 minuto  
- [ ] (Opcional) dominio custom + HTTPS  

## Otras plataformas

Mismo Dockerfile sirve en **Render** o **Fly.io**. Railway es el camino de menor fricción para este repo.

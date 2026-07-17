# Deploy — conoceme-aun-mas

Scaffold de producción. **El deploy real lo dispara Leandro** cuando quiera (dominio, secrets, plataforma).

## Qué se empaqueta

Un solo proceso Node:

| Pieza | Path |
|-------|------|
| API REST | `/api/v1/*` |
| SPA (Vite build) | `/` vía `STATIC_ROOT` |
| Content editorial | `/content` |

En desarrollo se sigue usando Vite (`5173`) + API (`8787`) con proxy.

## Variables

Ver `.env.example`.

| Variable | Prod |
|----------|------|
| `NODE_ENV` | `production` |
| `PORT` | `8787` (o el de la plataforma) |
| `CONTENT_ROOT` | path al `content/` |
| `STATIC_ROOT` | path al `apps/frontend/dist` |
| `CORS_ORIGIN` | origen público del sitio (o `*` si same-origin SPA+API) |
| `PORTFOLIO_API_KEYS` | keys reales del companion (comma-separated) |
| `XAI_API_KEY` | opcional, futuro LLM |

Nunca commitear keys reales.

## Docker local (smoke)

```bash
export PORTFOLIO_API_KEYS=dev-local-key
docker compose up --build
# http://localhost:8787
curl -s http://localhost:8787/api/v1/health
```

## CI

GitHub Actions (`.github/workflows/ci.yml`):

1. Docs + content guard  
2. `npm ci` · typecheck · test · build  

## Plataformas (cuando se decida)

Opciones simples con **un container**:

1. **Railway / Render / Fly.io** — conectar repo, Dockerfile, set env, dominio.  
2. **VPS** — `docker compose` + reverse proxy (Caddy/Nginx) + TLS.  
3. **Split** (opcional después) — FE en CDN estático, BE en Node; entonces `CORS_ORIGIN` = dominio FE y API separada.

Checklist pre-go-live:

- [ ] Dominio + HTTPS  
- [ ] `PORTFOLIO_API_KEYS` fuertes (no `dev-local-key`)  
- [ ] `CORS_ORIGIN` acotado  
- [ ] Health check `/api/v1/health` verde  
- [ ] Probar companion 💬 con key de prod  
- [ ] Favicon + `/media/leandro.jpg` sirven  
- [ ] No logs de mensajes/PII de más  

## Build sin Docker

```bash
npm ci
npm run build
NODE_ENV=production \
  CONTENT_ROOT=./content \
  STATIC_ROOT=./apps/frontend/dist \
  CORS_ORIGIN=https://tu-dominio \
  PORTFOLIO_API_KEYS=... \
  npm start
```

# conoceme-aun-mas

Un portafolio que se **juega**. Un Uruguay estilizado que se **explora**.  
No es una web más: es una experiencia cinematográfica + mundo top-down.

**Leandro Emanuel Martinez** — Aspiring Software Developer · student · Montevideo, Uruguay

| | |
|---|---|
| **Stack** | Frontend (Vite · Phaser 3 · GSAP · Lenis) · Backend REST (Node · TypeScript) |
| **Vista** | Top-down · arte híbrido moderno |
| **Repo** | Público, solo para quien quiera chusmear el código |

---

## Qué es

1. **Shell cinematográfica** — intro con scroll (GSAP + Lenis)  
2. **Mundo jugable** — personaje top-down, zonas de Uruguay, **minimapa tipo brújula**  
3. **API REST** — perfil, lugares, y (más adelante) consultas con API key sobre quién soy / estado del jugador  
4. **Compañero IA** (stub grounded) — responde sobre mí y el mapa; requiere API key; LLM opcional después  

Todo el contenido del mapa está **disponible desde el inicio**: el visitante elige a dónde ir.

---

## Documentación

| Doc | Para qué |
|-----|----------|
| [`docs/DESIGN.md`](./docs/DESIGN.md) | Visión de producto y decisiones |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Frontend / backend, SOLID, REST, API key |
| [`docs/WORLD_MAP.md`](./docs/WORLD_MAP.md) | Zonas Uruguay → capítulos del portfolio |
| [`docs/AI_GUIDE.md`](./docs/AI_GUIDE.md) | Rol de la IA (límites, anti-bypass, tono) |
| [`PROYECTO.md`](./PROYECTO.md) | Estado del proyecto |
| [`AGENTS.md`](./AGENTS.md) | Reglas para agentes de código en este repo |

---

## Estructura

```text
apps/
  frontend/     # shell + juego (cliente) — Vite
  backend/      # API REST — Hono + SOLID
packages/
  shared/       # tipos y contratos compartidos
content/        # datos de portfolio (fuente de verdad editorial)
docs/
```

## Desarrollo local

```bash
npm install

# terminal 1
npm run dev:backend    # http://localhost:8787

# terminal 2
npm run dev:frontend   # http://localhost:5173  (proxy /api → backend)
```

Copiá `.env.example` → `.env` y, para el companion del juego, `apps/frontend/.env` con `VITE_PORTFOLIO_API_KEY`.

API útil:

- `GET /api/v1/health`
- `GET /api/v1/profile`
- `GET /api/v1/places`
- `GET /api/v1/places/:id`
- `GET|PUT /api/v1/player/state`
- `GET /api/v1/ai/status`
- `POST /api/v1/ai/chat` (API key)

```bash
npm run typecheck
npm test
npm run build
```

## Deploy

**Recomendado: [Railway](https://railway.app)** — un servicio, Dockerfile, auto-deploy al mergear `main`.  
Guía paso a paso: [`docs/DEPLOY.md`](./docs/DEPLOY.md).

```bash
# smoke local estilo prod
export PUBLIC_COMPANION_KEY=dev-local-key
docker compose up --build
# http://localhost:8787
```

---

## Contacto

- GitHub: [leandmartine](https://github.com/leandmartine)  
- LinkedIn: [leandmartine](https://www.linkedin.com/in/leandmartine/)  
- Email: leandromartinez38@gmail.com  

# Architecture — conoceme-aun-mas

> Separación frontend / backend, REST, SOLID y extensión futura (API key + IA).  
> Last updated: 2026-07-17

---

## 1. Principios

| Principio | Cómo se aplica |
|-----------|----------------|
| **Separación de concerns** | Cliente (render, input, animación) ≠ servidor (datos, reglas, IA) |
| **SOLID** | Servicios con una responsabilidad; dependencias por abstracción; abierto a extensión |
| **API-first** | El frontend consume REST; no lee “archivos mágicos” del server en runtime de prod |
| **Contratos compartidos** | Tipos DTOs en `packages/shared` usados por FE y BE |
| **Secretos solo en backend** | API keys, prompts de sistema y rate limits **nunca** en el bundle del cliente |
| **Contenido versionado** | Bio y lugares viven en `/content` y el backend los expone (o se build-time embed en dev) |

---

## 2. Monorepo layout

```text
conoceme-aun-mas/
├── apps/
│   ├── frontend/                 # Vite + TS + Phaser + GSAP + Lenis
│   │   ├── src/
│   │   │   ├── shell/            # intro DOM, scroll, CTA
│   │   │   ├── game/             # Phaser: player, world, minimap/compass
│   │   │   ├── ui/               # paneles de lugares, HUD
│   │   │   ├── api/              # HTTP client tipado hacia el backend
│   │   │   └── styles/
│   │   └── index.html
│   └── backend/                  # Node + TypeScript + HTTP framework
│       ├── src/
│       │   ├── main.ts           # bootstrap
│       │   ├── app.ts            # composition root (DI)
│       │   ├── config/           # env, constants
│       │   ├── http/             # routes, middleware, controllers
│       │   ├── modules/          # por dominio (profile, places, player, ai)
│       │   │   ├── profile/
│       │   │   │   ├── profile.controller.ts
│       │   │   │   ├── profile.service.ts
│       │   │   │   ├── profile.repository.ts
│       │   │   │   └── profile.dto.ts
│       │   │   ├── places/
│       │   │   ├── player/
│       │   │   └── ai/           # futuro chat
│       │   └── shared/           # errors, result types, logger
│       └── content -> ../../content  # o copia/lectura de /content
├── packages/
│   └── shared/                   # tipos REST, PlaceId, Profile, etc.
├── content/                      # markdown/json editorial
└── docs/
```

**Workspaces:** **npm workspaces** (root `package.json`).  
**HTTP framework:** **Hono** + `@hono/node-server`.  
**Deploy (target):** frontend estático (Vercel/CDN) + backend como serverless functions o servicio Node.

---

## 3. Capas y SOLID (backend)

```text
HTTP (Controller)
    → Application Service  (casos de uso)
        → Domain / DTO mapping
            → Repository (lectura content / DB futura)
```

| Letra | Significado en este proyecto |
|-------|------------------------------|
| **S** | Un service por dominio (`ProfileService`, `PlacesService`, `PlayerService`, `AiService`) |
| **O** | Nuevos endpoints/módulos sin reescribir el core; content-driven places |
| **L** | Interfaces de repositorio intercambiables (file → DB) sin tocar controllers |
| **I** | Interfaces chicas (`IProfileReader`, `IChatCompleter`) en vez de un “God service” |
| **D** | Controllers dependen de abstracciones; el composition root (`app.ts`) inyecta implementaciones |

### Reglas de código

- Controllers: parse request, call service, map HTTP status. **Sin lógica de negocio.**  
- Services: orquestación y reglas. **Sin conocer Express/Fastify types de bajo nivel si se puede.**  
- Repositories: I/O (leer JSON/MD, más adelante DB).  
- Errores de dominio → mapper HTTP (`404`, `400`, `401`, `429`, `500`).  
- Validación de input en el borde HTTP (schema: Zod o similar).

---

## 4. API REST (contrato v1)

Base: `/api/v1`  
Content-Type: `application/json`  
Errores:

```json
{
  "error": {
    "code": "PLACE_NOT_FOUND",
    "message": "Human readable message"
  }
}
```

### Público (sin API key)

| Method | Path | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/health` | Liveness |
| `GET` | `/api/v1/profile` | Quién es Leandro (bio, links, headline) |
| `GET` | `/api/v1/places` | Lista de lugares del mapa (id, título, coords UI, chapter) |
| `GET` | `/api/v1/places/:id` | Detalle de un lugar + body + links |

### Jugador / sesión (público liviano o cookie; endurecer después)

| Method | Path | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/player/state` | Estado del visitante actual (posición lógica, lugares visitados) |
| `PUT` | `/api/v1/player/state` | Persistir progreso (local-first en v1; server opcional) |

> v1 puede ser **client-authoritative** (localStorage) con endpoints listos; el backend ya define el shape.

### Protegido con API key (futuro cercano)

Header: `Authorization: Bearer <API_KEY>` o `X-Api-Key: <API_KEY>`

| Method | Path | Descripción |
|--------|------|-------------|
| `POST` | `/api/v1/ai/chat` | Preguntas sobre Leandro / mundo / jugador (ver `AI_GUIDE.md`) |
| `GET` | `/api/v1/ai/about` | Resumen machine-readable acotado al contexto permitido |

Middleware:

1. Validar API key  
2. Rate limit por key / IP  
3. Sanitize input  
4. Inyectar system prompt + **solo** knowledge base del portfolio  
5. Filtro de salida (rechazar si el modelo se va de tema)

---

## 5. Frontend: consumo y capas

```text
UI / Phaser scenes
    → application hooks / game systems
        → api client (fetch tipado)
            → REST backend
```

- **No** poner secretos ni el system prompt de la IA en el frontend.  
- El juego pide `places` + `profile` al boot (o hydrate desde build si offline-first).  
- Paneles de contenido renderizan DTOs; no hardcodean biografía larga.

### Módulos frontend relevantes

| Módulo | Responsabilidad |
|--------|-----------------|
| `shell/` | Intro, scroll, handoff al canvas |
| `game/world` | Mapa, colisiones, triggers de zona |
| `game/player` | Movimiento, animaciones, sprite |
| `game/minimap` | **Brújula / minimapa** (ver §6) |
| `ui/place-panel` | Overlay de contenido de lugar |
| `api/` | Cliente REST + tipos de `shared` |

---

## 6. Minimapa tipo brújula

No es un GPS cartográfico: es una **brújula de intención**.

### UX

- Esquina (configurable: bottom-right desktop / safe-area mobile).  
- Disco circular con:
  - **Norte del mundo** (decorativo + orientación).  
  - **Punto del jugador** en el centro (o mapa reducido con player fixed-center).  
  - **Markers de lugares** en dirección relativa (bearing) y distancia aproximada.  
  - Highlight del destino “enfocado” si el user eligió uno en un menú de lugares.  
- Al pulsar un marker: opcionalmente marca rumbo (flecha) sin teletransportar (el camino se camina).  
- Todos los lugares **visibles desde el inicio** (sin fog-of-war de contenido).

### Implementación (Phaser)

- `MinimapSystem` / `CompassHud` como sistema, no mezclado con física del player.  
- Input: posición del player + lista de POIs (`x,y` world).  
- Output: capa UI (DOM o Phaser camera UI) actualizada en `update` throttled (ej. 10–15 Hz).  
- Mobile: tamaño táctil, no tape el joystick.

---

## 7. API key — diseño para el futuro

Variables de entorno (solo backend):

```bash
PORTFOLIO_API_KEYS=key1,key2     # o store hasheado
AI_PROVIDER_KEY=...              # OpenAI/xAI/etc — nunca al cliente
AI_RATE_LIMIT_RPM=30
```

Flujo:

```text
Client (con API key del dueño/integración)
  → POST /api/v1/ai/chat
  → ApiKeyMiddleware
  → AiService (arma mensajes con AI_GUIDE + content KB)
  → Provider adapter (IChatCompleter)
  → respuesta filtrada
```

Casos de uso de la key:

1. Widget externo / demos que consultan “quién es Leandro”.  
2. El propio juego (si se quiere offload del prompt al server).  
3. Integraciones personales.

**No** es un API abierta anónima sin límite.

---

## 8. Content pipeline

```text
/content (git)
    → backend repository lee y cachea
    → GET /api/v1/*
    → frontend UI
```

Estructura editorial:

```text
content/
  profile.json
  places/
    rambla.md
    ciudad-vieja.md
    ...
  places.index.json
  knowledge/          # hechos cortos para la IA (más adelante)
```

---

## 9. Seguridad y buenas prácticas

- CORS restrictivo en prod (dominio del portfolio).  
- Helmet / security headers en backend.  
- Validación Zod (o equivalente) en todos los body/query.  
- No loguear API keys ni PII innecesaria.  
- Rate limiting en rutas AI y, si hace falta, en público.  
- Dependencias mínimas por app; no meter Phaser en el backend ni Express en el frontend.  
- Tests: unit en services; contract tests en rutas críticas; e2e smoke del shell después.

---

## 10. Scaffold PR order (código)

1. Monorepo workspaces + `packages/shared` tipos  
2. `apps/backend` health + profile + places (file repo)  
3. `apps/frontend` shell + game stub consumiendo API  
4. Minimap/compass system  
5. AI module stub + middleware API key (sin provider real si hace falta)  

Detalle de producto en `DESIGN.md`. Contrato de IA en `AI_GUIDE.md`.

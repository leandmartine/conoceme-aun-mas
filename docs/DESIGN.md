# Design Document — conoceme-aun-mas

> Living design base. Si cambia la dirección del producto, se actualiza **en la misma PR**.  
> Last updated: 2026-07-17

---

## 1. Vision

**conoceme-aun-mas** no es un portfolio con un jueguito pegado.  
Es una **experiencia cinematográfica jugable** que revela quién es **Leandro Emanuel Martinez**.

### One-liner

> Un mundo top-down de Uruguay, shell tipo Apple, brújula para orientarte, y una API lista para contar quién soy.

### Emotional pillars

| Pillar | Feeling | Delivery |
|--------|---------|----------|
| **Cinematic** | Awe al entrar | GSAP + Lenis, timing premium |
| **Playable** | Agencia | Phaser 3 top-down real |
| **Uruguay** | Orgullo de lugar | Atmósfera, no stickers turísticos |
| **Craft** | “Este tipo se preocupa” | Detalle, perf, motion |
| **Human** | Cercano | Copy real, IA con límites humanos |

---

## 2. Product layers

```
┌──────────────────────────────────────────────────────────┐
│  SHELL — DOM + GSAP + Lenis                              │
│  Título · scroll · CTA “Entrar al mundo” · overlays      │
├──────────────────────────────────────────────────────────┤
│  GAME — Phaser 3 top-down                                │
│  Player · world · POIs · minimapa/brújula · input        │
├──────────────────────────────────────────────────────────┤
│  API — Backend REST (Node + TS)                          │
│  profile · places · player state · AI+API key (futuro)   │
├──────────────────────────────────────────────────────────┤
│  CONTENT — /content (git)                                │
│  Bio, lugares MD/JSON — fuente editorial                 │
└──────────────────────────────────────────────────────────┘
```

Detalle de monorepo, SOLID y endpoints: **`docs/ARCHITECTURE.md`**.  
Rol de la IA futura: **`docs/AI_GUIDE.md`**.  
Mapa: **`docs/WORLD_MAP.md`**.

---

## 3. Stack (locked)

### Frontend (`apps/frontend`)

| Área | Tech |
|------|------|
| Bundler | Vite + TypeScript |
| Game | Phaser 3 |
| Motion shell | GSAP 3 + ScrollTrigger |
| Scroll | Lenis (solo shell) |
| Styles | CSS variables / modules — look propio |
| API client | fetch tipado contra `/api/v1` |

### Backend (`apps/backend`)

| Área | Tech |
|------|------|
| Runtime | Node.js + TypeScript |
| HTTP | Fastify o Hono (elegir en scaffold; preferir liviano y tipado) |
| Validación | Zod |
| Arquitectura | Controllers → Services → Repositories (SOLID) |
| Content | Lectura de `/content` (+ cache) |
| Secrets | Env only (`PORTFOLIO_API_KEYS`, provider keys) |

### Shared (`packages/shared`)

Tipos DTO y `PlaceId` compartidos FE/BE.

### Deploy (target)

- Frontend estático  
- Backend serverless o Node service  
- Repo **público** (vitrine de código; no es proyecto de comunidad)

### Explicit non-goals (v1)

- No multiplayer  
- No CMS admin  
- No Three.js world  
- No system prompt de IA en el cliente  

---

## 4. Visual — híbrido moderno

### Shell

Full-viewport, tipografía grande, scroll-driven chapters, grain/light sutil, siluetas uruguayas (nunca clipart).

### Game

Suelo estilizado, landmarks legibles, luz costera cálida, cámara con follow suave.

### Minimapa / brújula

- HUD siempre visible en juego  
- Disco brújula + bearings a todos los POIs  
- Destino opcional con flecha de rumbo  
- **Sin fog:** todo el contenido accesible desde el minuto uno  

### Color (working)

```
--uy-sky:    #7EB6D9
--uy-water:  #1B4F72
--uy-sand:   #E8D5B5
--uy-grass:  #4A7C59
--uy-sun:    #F4C430
--uy-night:  #0B1220
--uy-cream:  #F7F2E9
--uy-coral:  #E07A5F
```

### Personaje

Inspirado en Leandro, no idéntico:

- Alto / complexión grande  
- Tez café con leche  
- Ojos oscuros, cabello negro  
- Animaciones idle + walk (4 u 8 dir) con oficio  

---

## 5. Perfil (canon)

| | |
|---|---|
| Nombre | Leandro Emanuel Martinez |
| Headline | Aspiring Software Developer, student |
| Ciudad | Montevideo, Uruguay |
| Skills foco | C#, ASP.NET MVC, SQL, Data Analysis, web |
| LinkedIn | https://www.linkedin.com/in/leandmartine/ |
| GitHub | https://github.com/leandmartine |
| Email | leandromartinez38@gmail.com |

Fuente de datos de runtime: `content/profile.json` + places (expuestos por API).

---

## 6. World & progression

- Spawn: **Rambla** post-intro.  
- Zonas: rambla, ciudad-vieja, skyline, universidad, puerto, campo, faro.  
- **No hay unlocks.** El usuario elige el orden.  
- Navegación asistida por **minimapa brújula**.  

---

## 7. Motion language

- Easings custom; majors 0.6–1.2s; UI feedback 120–200ms.  
- Reduced motion respetado.  
- Handoff shell → game con continuidad de color.

---

## 8. Workflow del repo (solo Leandro)

- Repo público para quien quiera **chusmear**, no para contribuidores.  
- Cambios por **PR**; **Leandro mergea siempre**.  
- El agent **avisa cuando una PR está lista** y **no agrega commits a una PR ya abierta/lista** (puede estar mergeada): si hace falta algo más, **PR nueva**.  
- Ver `AGENTS.md`.

---

## 9. Key decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Split FE/BE | Monorepo `apps/*` | SOLID, API key y AI solo server-side |
| Game engine | Phaser 3 | Juego real mobile+desktop |
| API | REST `/api/v1` | Simple, cacheable, estándar |
| Content | `/content` + API | Editable sin redeploy de lógica |
| Progression | All open | Libertad del visitante |
| Nav aid | Compass minimap | Orientación sin matar exploración |
| IA | Backend + AI_GUIDE | Humana, grounded, anti-jailbreak |
| Collab externa | No | Un solo dueño; público = showcase |

---

## 10. Open / progressive content

Completar con más detalle de LinkedIn cuando se quiera:

- [ ] Fechas y bullets finos de cada rol  
- [ ] Carrera exacta en ORT  
- [ ] Lista de proyectos reales en skyline  
- [x] Knowledge base corta en `content/knowledge/` para la IA  

---

## 11. PR Plan

| # | Título | Scope |
|---|--------|--------|
| ✅ | Foundation docs | DESIGN inicial, reglas |
| ✅ | Architecture + profile + AI guide + compass + README limpio | Docs + content |
| ✅ | `chore: monorepo scaffold FE/BE + shared` | workspaces, tsconfig, health |
| ✅ | `feat(api): profile + places REST` | modules SOLID |
| ✅ | `feat(shell): cinematic intro` | GSAP + Lenis |
| ✅ | `feat(game): player + world + compass minimap` | Phaser |
| ✅ | `feat(ui): place panels from API` | |
| ✅ | `feat(art): character + Rambla pass` | |
| ✅ | `feat(ai): chat stub + API key middleware` | AI_GUIDE |
| 🔵 | `chore: deploy + CI` | Docker + Actions + docs/DEPLOY |
| ⬜ | Deploy live | solo con OK de Leandro |

---

## 12. Definition of done (v1 experiencia)

- [x] Intro premium mobile + desktop  
- [x] Movimiento top-down fluido  
- [x] Minimapa brújula usable  
- [x] ≥ lugares con content real vía API  
- [x] Backend health + profile + places  
- [x] Prep visible para API key + AI (aunque el provider llegue después)  
- [ ] No se vea “template IA genérico”  
